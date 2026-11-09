/**
 * src/lib/gantry.ts
 * Gantry Crane Simulation
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Simulates the reference-scaling controller from the second gantry crane report: LQR state
 * feedback on an observer estimate, with an optional transport delay on the measured position and
 * an optional 1 m/s saturation on the commanded velocity. Every gain and plant value is taken
 * from that report. It runs the linearized plant, while the report used a nonlinear Simulink model.
 *
 * File Structure:
 * - Constants: plant, gains, integration step, and the report's published results
 * - simulate: integrates the closed loop for a given delay
 * - measure: overshoot, settling time, and whether the response settled
 * - Chart helpers: the points a chart draws
 * - solveLqr and phaseMargin: the gain and margin for a chosen position weight
 *
 * Used in: src/components/GantryDelay.astro
 *
 * Usage:
 * $ `import { simulate, measure } from '../lib/gantry'` : Imported by the gantry figure
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

const C_GRAVITY = 9.81;
const C_CABLE_LENGTH = 3.7;
const C_PLANT_GAIN = C_GRAVITY / C_CABLE_LENGTH;
const C_K_REF = [4.4721, 2.7148, 1.431];
const C_L_REF = [24.518, 300.56, 1809.8];
const C_VELOCITY_LIMIT = 1;
const C_STEP_S = 0.001;
const C_SETTLING_BAND = 0.02;
const C_ESCAPE_M = 1e6;

const C_RUN_S = 60;
export const C_PREDICTED_LIMIT_S = 0.1878;
export const C_REPORT = {
    linear: { overshoot: 10.1723, settling: 3.6926 },
    saturated: { overshoot: 9.0237, settling: 3.9498 },
};

export interface Options {
    delay: number;
    saturate: boolean;
    gain?: number[];
}

export interface Measurement {
    overshoot: number;
    settling: number | null;
}

/**
 * @brief Integrates the closed loop for a unit step on the reference
 * @param options Delay on the measured position in seconds, whether the actuator saturates, and
 * the state feedback gain. Reference scaling equals the gain's first entry on this plant.
 * @return Load position sampled every integration step
 * @details Forward Euler at 1 ms. A growing response stops early once it leaves the plot's scale.
 */
export function simulate({ delay, saturate, gain = C_K_REF }: Options): number[] {
    const delaySteps = Math.round(delay / C_STEP_S);
    const measured = new Array<number>(delaySteps + 1).fill(0);
    const totalSteps = Math.round(C_RUN_S / C_STEP_S);
    const positions: number[] = [];
    let [z, zDot, zDdot] = [0, 0, 0];
    let [estZ, estZDot, estZDdot] = [0, 0, 0];
    let head = 0;

    for (let step = 0; step < totalSteps && Math.abs(z) < C_ESCAPE_M; step += 1) {
        positions.push(z);
        measured[head] = z;
        head = (head + 1) % measured.length;

        const error = measured[head] - estZ;
        const command = gain[0] - (gain[0] * estZ + gain[1] * estZDot + gain[2] * estZDdot);
        const input = saturate
            ? Math.max(-C_VELOCITY_LIMIT, Math.min(C_VELOCITY_LIMIT, command))
            : command;

        const nextZDdot = zDdot + C_STEP_S * C_PLANT_GAIN * (input - zDot);
        const nextEstZ = estZ + C_STEP_S * (estZDot + C_L_REF[0] * error);
        const nextEstZDot = estZDot + C_STEP_S * (estZDdot + C_L_REF[1] * error);
        const nextEstZDdot =
            estZDdot + C_STEP_S * (C_PLANT_GAIN * (input - estZDot) + C_L_REF[2] * error);

        z += C_STEP_S * zDot;
        zDot += C_STEP_S * zDdot;
        zDdot = nextZDdot;
        estZ = nextEstZ;
        estZDot = nextEstZDot;
        estZDdot = nextEstZDdot;
    }

    return positions;
}

/**
 * @brief Measures a unit step response
 * @param positions Load position from simulate
 * @return Percent overshoot, and settling time in seconds or null when it never settles
 * @details Uses the same 2 percent band the report defines. A response that is still outside the
 * band within the final second of the run counts as never settling.
 */
export function measure(positions: number[]): Measurement {
    let peak = 0;
    let lastOutside = -1;

    positions.forEach((position, index) => {
        peak = Math.max(peak, position);

        if (Math.abs(position - 1) > C_SETTLING_BAND) {
            lastOutside = index;
        }
    });

    const complete = positions.length === Math.round(C_RUN_S / C_STEP_S);
    const settled = complete && lastOutside < positions.length - 1 / C_STEP_S;

    return {
        overshoot: (peak - 1) * 100,
        settling: settled ? (lastOutside + 1) * C_STEP_S : null,
    };
}

const C_PLOT_STRIDE = 50;
const C_PATH_LIMIT = 4000;

/**
 * @brief Reduces a response to the points a chart draws
 * @param positions Load position from simulate
 * @param seconds Length of the charted window
 * @return Times and positions, with runaway values clamped so coordinates stay finite
 */
export function sampleResponse(
    positions: number[],
    seconds: number
): { times: number[]; values: number[] } {
    const last = Math.min(positions.length, Math.round(seconds / C_STEP_S) + 1);
    const times: number[] = [];
    const values: number[] = [];

    for (let index = 0; index < last; index += C_PLOT_STRIDE) {
        times.push(index * C_STEP_S);
        values.push(Math.max(-C_PATH_LIMIT, Math.min(C_PATH_LIMIT, positions[index])));
    }

    return { times, values };
}

/**
 * @brief Reads the position at a time for the crosshair
 * @param positions Load position from simulate
 * @param time Time in seconds
 * @return Position in meters as display text, or "off scale" once a response has run away
 */
export function positionAt(positions: number[], time: number): string {
    const position = positions[Math.round(time / C_STEP_S)];

    return position === undefined || Math.abs(position) > 100 ? 'off scale' : position.toFixed(2);
}

/**
 * @brief Solves the LQR problem for the crane with R = 1 and Q = q C'C
 * @param q Weight on load position
 * @return State feedback gain
 * @details Integrates the Riccati differential equation to steady state. Backward time makes it
 * stable, and it needs no matrix library.
 */
export function solveLqr(q: number): number[] {
    const a = [
        [0, 1, 0],
        [0, 0, 1],
        [0, -C_PLANT_GAIN, 0],
    ];
    const size = [0, 1, 2];
    const step = 2e-4 / Math.max(1, Math.sqrt(q / 20));
    let p = size.map(() => [0, 0, 0]);

    for (let iteration = 0; iteration < 400000; iteration += 1) {
        const pb = size.map((i) => p[i][2] * C_PLANT_GAIN);
        let change = 0;
        const next = size.map((i) =>
            size.map((j) => {
                const atp = size.reduce((sum, k) => sum + a[k][i] * p[k][j], 0);
                const pa = size.reduce((sum, k) => sum + p[i][k] * a[k][j], 0);
                const rate = atp + pa - pb[i] * pb[j] + (i === 0 && j === 0 ? q : 0);

                change = Math.max(change, Math.abs(rate));

                return p[i][j] + step * rate;
            })
        );

        p = next;

        if (change < 1e-7) {
            break;
        }
    }

    return size.map((i) => p[i][2] * C_PLANT_GAIN);
}

/**
 * @brief Evaluates the loop gain of the observer-based controller
 * @param gain State feedback gain
 * @param w Frequency in radians per second
 * @return Real and imaginary parts
 * @details Report equation (12) multiplied by the plant: K (sI - A + LC + BK)^-1 L G(s).
 */
function loopGain(gain: number[], w: number): [number, number] {
    const f = [
        [-C_L_REF[0], 1, 0],
        [-C_L_REF[1], 0, 1],
        [
            -C_L_REF[2] - C_PLANT_GAIN * gain[0],
            -C_PLANT_GAIN - C_PLANT_GAIN * gain[1],
            -C_PLANT_GAIN * gain[2],
        ],
    ];
    const m = f.map((row, i) => row.map((value, j): [number, number] => [-value, i === j ? w : 0]));
    const b = C_L_REF.map((value): [number, number] => [value, 0]);
    /**
     * @brief Multiplies two complex numbers
     * @param x Real and imaginary parts
     * @param y Real and imaginary parts
     * @return Product
     */
    const mul = (x: [number, number], y: [number, number]): [number, number] => [
        x[0] * y[0] - x[1] * y[1],
        x[0] * y[1] + x[1] * y[0],
    ];
    /**
     * @brief Divides two complex numbers
     * @param x Numerator
     * @param y Denominator
     * @return Quotient
     */
    const div = (x: [number, number], y: [number, number]): [number, number] => {
        const d = y[0] * y[0] + y[1] * y[1];

        return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d];
    };

    for (let i = 0; i < 3; i += 1) {
        for (let r = i + 1; r < 3; r += 1) {
            const factor = div(m[r][i], m[i][i]);

            for (let c = i; c < 3; c += 1) {
                const t = mul(factor, m[i][c]);

                m[r][c] = [m[r][c][0] - t[0], m[r][c][1] - t[1]];
            }

            const t = mul(factor, b[i]);

            b[r] = [b[r][0] - t[0], b[r][1] - t[1]];
        }
    }

    const x: [number, number][] = [
        [0, 0],
        [0, 0],
        [0, 0],
    ];

    for (let i = 2; i >= 0; i -= 1) {
        let t = b[i];

        for (let c = i + 1; c < 3; c += 1) {
            const v = mul(m[i][c], x[c]);

            t = [t[0] - v[0], t[1] - v[1]];
        }

        x[i] = div(t, m[i][i]);
    }

    const controller = x.reduce<[number, number]>(
        (sum, value, i) => [sum[0] + gain[i] * value[0], sum[1] + gain[i] * value[1]],
        [0, 0]
    );
    const plant = div([C_PLANT_GAIN, 0], [0, w * (C_PLANT_GAIN - w * w)]);

    return mul(controller, plant);
}

/**
 * @brief Finds the phase margin at the last gain crossover
 * @param gain State feedback gain
 * @return Phase margin in degrees and the crossover in radians per second
 */
export function phaseMargin(gain: number[]): { margin: number; crossover: number } {
    let result = { margin: 0, crossover: 0 };
    let previous = 0;

    for (let exponent = 0; exponent < 2; exponent += 0.002) {
        const w = 10 ** exponent;
        const [re, im] = loopGain(gain, w);
        const magnitude = Math.hypot(re, im);

        if (previous > 1 && magnitude <= 1) {
            const phase = (Math.atan2(im, re) * 180) / Math.PI;

            result = { margin: phase < 0 ? 180 + phase : phase - 180, crossover: w };
        }

        previous = magnitude;
    }

    return result;
}
