/**
 * src/lib/estimation.ts
 * Damper State Estimation
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Runs the damper simulation and both filters from the EENG 519 project in the browser. This is a port
 * of Main.m: the same parameters, terrain model, noise levels, EKF, and UKF. The plant uses a 1 ms
 * forward Euler step where the project used Simulink, and noise comes from a seeded generator so a
 * run can be repeated.
 *
 * File Structure:
 * - Constants from Main.m
 * - Random numbers: seeded uniform and Gaussian
 * - runPlant: terrain force, current, true states, noisy measurements
 * - runEkf and runUkf: one filter each
 * - summarize: error and bound width for the force estimate
 *
 * Where this file is used within the repository:
 * - src/components/EstimationFigure.astro
 *
 * Usage:
 * $ `npm run dev` : Runs in the browser, and at build time for the checks
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

const C_TS = 0.01;
const C_T_END = 3;
const C_M = 100;
const C_ALPHA = 100;
const C_K = 10000;
const C_KV = 1000;
const C_TAU = 0.05;
const C_VAR_PROCESS = 1;
const C_VAR_Z = 5e-6;
const C_VAR_A = 0.1;
const C_VAR_ZDOT = 0.005;
const C_PLANT_SUBSTEPS = 10;
const C_L = 4;
const C_THREE_SIGMA = 3;

export const C_REPORT_KM = 0.005;
export const C_DEFAULT_QS = 5000000;
export const C_DEFAULT_ALPHA_UKF = 1e-3;

export interface Plant {
    time: number[];
    force: number[];
    current: number[];
    measured: [number, number][];
}

export interface FilterRun {
    force: number[];
    sigma: number[];
}

export interface Summary {
    rmse: number;
    bound: number;
    inside: number;
}

/**
 * @brief Builds a seeded normal random number generator
 * @param seed Integer seed
 * @return Function returning a standard normal sample
 * @details Mulberry32 for uniform samples, Box-Muller for the normal.
 */
function makeRandom(seed: number): () => number {
    let state = seed >>> 0;

    /**
     * @brief Draws one uniform sample
     * @return Value in (0, 1)
     */
    const uniform = () => {
        state = (state + 0x6d2b79f5) >>> 0;

        let mixed = state;

        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

        return (((mixed ^ (mixed >>> 14)) >>> 0) + 0.5) / 4294967296;
    };

    return () => Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());
}

/**
 * @brief Evaluates the damper's acceleration
 * @param z Displacement
 * @param zDot Velocity
 * @param h Field intensity
 * @param force Input force
 * @param km Magnetic yield constant
 * @return Acceleration
 */
function acceleration(z: number, zDot: number, h: number, force: number, km: number): number {
    return (
        -(C_K / C_M) * z -
        (C_KV / C_M) * zDot -
        (km / C_M) * h * Math.tanh(C_ALPHA * zDot) +
        force / C_M
    );
}

/**
 * @brief Simulates the terrain, the damper, and its two noisy sensors
 * @param seed Integer seed for the noise
 * @param km Magnetic yield constant
 * @return Time, true force, coil current, and measurements at each sample
 */
export function runPlant(seed: number, km = C_REPORT_KM): Plant {
    const randn = makeRandom(seed);
    const count = Math.round(C_T_END / C_TS) + 1;
    const plant: Plant = { time: [], force: [], current: [], measured: [] };
    let z = 0.1 * randn();
    let zDot = 0.1 * randn();
    let h = 1;

    for (let index = 0; index < count; index += 1) {
        const t = index * C_TS;
        const force =
            100 * Math.sin(2 * Math.PI * 1.5 * t) +
            75 * Math.sin(2 * Math.PI * 8 * t) +
            50 * randn() +
            1500 * Math.exp(-((t - 1) ** 2) / (2 * 0.05 ** 2)) +
            1000 * Math.exp(-((t - 2) ** 2) / (2 * 0.08 ** 2));
        const current = force > 750 ? 2 : 1;

        plant.time.push(t);
        plant.force.push(force);
        plant.current.push(current);
        plant.measured.push([
            z + Math.sqrt(C_VAR_Z) * randn(),
            acceleration(z, zDot, h, force, km) + Math.sqrt(C_VAR_A) * randn(),
        ]);

        const step = C_TS / C_PLANT_SUBSTEPS;
        const push = Math.sqrt(C_VAR_PROCESS) * randn();

        for (let sub = 0; sub < C_PLANT_SUBSTEPS; sub += 1) {
            const a = acceleration(z, zDot, h, force + push, km);

            z += step * zDot;
            zDot += step * a;
            h += step * ((current - h) / C_TAU);
        }
    }

    return plant;
}

/**
 * @brief Multiplies two matrices
 * @param left Left matrix
 * @param right Right matrix
 * @return Product
 */
function multiply(left: number[][], right: number[][]): number[][] {
    return left.map((row) =>
        right[0].map((_, column) =>
            row.reduce((sum, value, index) => sum + value * right[index][column], 0)
        )
    );
}

/**
 * @brief Transposes a matrix
 * @param matrix Matrix
 * @return Transpose
 */
function transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

/**
 * @brief Inverts a 2x2 matrix
 * @param matrix Matrix
 * @return Inverse
 */
function invert2(matrix: number[][]): number[][] {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;

    return [
        [d / det, -b / det],
        [-c / det, a / det],
    ];
}

/**
 * @brief Cholesky factor of a symmetric positive definite matrix
 * @param matrix Matrix
 * @return Lower-triangular factor
 */
function cholesky(matrix: number[][]): number[][] {
    const lower = matrix.map((row) => row.map(() => 0));

    matrix.forEach((row, i) => {
        for (let j = 0; j <= i; j += 1) {
            let sum = row[j];

            for (let k = 0; k < j; k += 1) {
                sum -= lower[i][k] * lower[j][k];
            }

            lower[i][j] = i === j ? Math.sqrt(Math.max(sum, 1e-12)) : sum / lower[j][j];
        }
    });

    return lower;
}

/**
 * @brief Builds the process noise matrix
 * @param qS Variance of the terrain force random walk
 * @return 4x4 diagonal matrix
 */
function processNoise(qS: number): number[][] {
    return [
        [0, 0, 0, 0],
        [0, C_VAR_ZDOT, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, qS],
    ];
}

const C_R = [
    [C_VAR_Z, 0],
    [0, C_VAR_A],
];
const C_P0 = [
    [0.01, 0, 0, 0],
    [0, 0.01, 0, 0],
    [0, 0, 0.01, 0],
    [0, 0, 0, 100],
];

/**
 * @brief Runs the extended Kalman filter
 * @param plant Output of runPlant
 * @param qS Variance of the terrain force random walk
 * @param km Magnetic yield constant
 * @return Force estimate and its standard deviation at each sample
 */
export function runEkf(plant: Plant, qS: number, km = C_REPORT_KM): FilterRun {
    const q = processNoise(qS);
    let x = [0, 0, 1, 0];
    let p = C_P0.map((row) => [...row]);
    const run: FilterRun = { force: [0], sigma: [Math.sqrt(p[3][3])] };

    for (let index = 0; index < plant.time.length - 1; index += 1) {
        const [z, zd, h, fin] = x;
        const a = acceleration(z, zd, h, fin, km);
        const pred = [
            z + C_TS * zd,
            zd + C_TS * a,
            h + C_TS * ((plant.current[index] - h) / C_TAU),
            fin,
        ];
        const sech = 1 / Math.cosh(C_ALPHA * zd);
        const f = [
            [1, C_TS, 0, 0],
            [
                C_TS * (-C_K / C_M),
                1 + C_TS * (-(C_KV / C_M) - (km / C_M) * h * C_ALPHA * sech * sech),
                C_TS * (-(km / C_M) * Math.tanh(C_ALPHA * zd)),
                C_TS / C_M,
            ],
            [0, 0, 1 - C_TS / C_TAU, 0],
            [0, 0, 0, 1],
        ];
        const pPred = multiply(multiply(f, p), transpose(f)).map((row, i) =>
            row.map((value, j) => value + q[i][j])
        );
        const sechPred = 1 / Math.cosh(C_ALPHA * pred[1]);
        const hK = [
            [1, 0, 0, 0],
            [
                -C_K / C_M,
                -(C_KV / C_M) - (km / C_M) * pred[2] * C_ALPHA * sechPred * sechPred,
                -(km / C_M) * Math.tanh(C_ALPHA * pred[1]),
                1 / C_M,
            ],
        ];
        const yPred = [pred[0], acceleration(pred[0], pred[1], pred[2], pred[3], km)];
        const pht = multiply(pPred, transpose(hK));
        const s = multiply(hK, pht).map((row, i) => row.map((value, j) => value + C_R[i][j]));
        const k = multiply(pht, invert2(s));
        const y = plant.measured[index + 1];
        const innovation = [y[0] - yPred[0], y[1] - yPred[1]];

        x = pred.map((value, i) => value + k[i][0] * innovation[0] + k[i][1] * innovation[1]);

        const kh = multiply(k, hK);
        const updated = multiply(
            kh.map((row, i) => row.map((value, j) => (i === j ? 1 : 0) - value)),
            pPred
        );

        p = updated.map((row, i) =>
            row.map((value, j) => (value + updated[j][i]) / 2 + (i === j ? 1e-8 : 0))
        );
        run.force.push(x[3]);
        run.sigma.push(Math.sqrt(Math.max(p[3][3], 0)));
    }

    return run;
}

/**
 * @brief Runs the unscented Kalman filter
 * @param plant Output of runPlant
 * @param qS Variance of the terrain force random walk
 * @param alphaUkf Spread of the sigma points
 * @param km Magnetic yield constant
 * @return Force estimate and its standard deviation at each sample
 */
export function runUkf(plant: Plant, qS: number, alphaUkf: number, km = C_REPORT_KM): FilterRun {
    const q = processNoise(qS);
    const lambda = alphaUkf * alphaUkf * C_L - C_L;
    const c = C_L + lambda;
    const wm = [lambda / c, ...new Array<number>(2 * C_L).fill(0.5 / c)];
    const wc = [...wm];
    const cSqrt = Math.sqrt(c);
    let x = [0, 0, 1, 0];
    let p = C_P0.map((row) => [...row]);
    const run: FilterRun = { force: [0], sigma: [Math.sqrt(p[3][3])] };

    wc[0] += 1 - alphaUkf * alphaUkf + 2;

    /**
     * @brief Spreads sigma points around a mean
     * @param mean State mean
     * @param covariance State covariance
     * @return The 2L + 1 sigma points
     */
    const spread = (mean: number[], covariance: number[][]): number[][] => {
        const symmetric = covariance.map((row, i) =>
            row.map((value, j) => (value + covariance[j][i]) / 2 + (i === j ? 1e-8 : 0))
        );
        const root = cholesky(symmetric);
        const points = [mean];

        for (let i = 0; i < C_L; i += 1) {
            points.push(mean.map((value, row) => value + cSqrt * root[row][i]));
        }

        for (let i = 0; i < C_L; i += 1) {
            points.push(mean.map((value, row) => value - cSqrt * root[row][i]));
        }

        return points;
    };

    /**
     * @brief Takes a weighted mean of sigma points
     * @param points Sigma points
     * @return Weighted mean
     */
    const weighted = (points: number[][]): number[] =>
        points[0].map((_, row) =>
            points.reduce((sum, point, index) => sum + wm[index] * point[row], 0)
        );

    for (let index = 0; index < plant.time.length - 1; index += 1) {
        const current = plant.current[index];
        const predicted = spread(x, p).map(([z, zd, h, fin]) => [
            z + C_TS * zd,
            zd + C_TS * acceleration(z, zd, h, fin, km),
            h + C_TS * ((current - h) / C_TAU),
            fin,
        ]);
        const xPred = weighted(predicted);
        const pPred = q.map((row) => [...row]);

        predicted.forEach((point, n) => {
            const diff = point.map((value, i) => value - xPred[i]);

            diff.forEach((a, i) => diff.forEach((b, j) => (pPred[i][j] += wc[n] * a * b)));
        });

        const points = spread(xPred, pPred);
        const ys = points.map(([z, zd, h, fin]) => [z, acceleration(z, zd, h, fin, km)]);
        const yPred = weighted(ys);
        const pYy = C_R.map((row) => [...row]);
        const pXy = xPred.map(() => [0, 0]);

        ys.forEach((y, n) => {
            const dy = [y[0] - yPred[0], y[1] - yPred[1]];
            const dx = points[n].map((value, i) => value - xPred[i]);

            dy.forEach((a, i) => dy.forEach((b, j) => (pYy[i][j] += wc[n] * a * b)));
            dx.forEach((a, i) => dy.forEach((b, j) => (pXy[i][j] += wc[n] * a * b)));
        });

        const k = multiply(pXy, invert2(pYy));
        const y = plant.measured[index + 1];
        const innovation = [y[0] - yPred[0], y[1] - yPred[1]];
        const kpyy = multiply(k, pYy);
        const kpk = multiply(kpyy, transpose(k));

        x = xPred.map((value, i) => value + k[i][0] * innovation[0] + k[i][1] * innovation[1]);
        p = pPred.map((row, i) => row.map((value, j) => value - kpk[i][j]));
        run.force.push(x[3]);
        run.sigma.push(Math.sqrt(Math.max(p[3][3], 0)));
    }

    return run;
}

/**
 * @brief Summarizes a filter's force estimate
 * @param plant Output of runPlant
 * @param run Output of a filter
 * @return RMS error, mean three-sigma half-width, and share of samples inside the bounds
 * @details Skips the first 0.1 s, where the filter is still converging from its initial guess.
 */
export function summarize(plant: Plant, run: FilterRun): Summary {
    const start = 10;
    const count = plant.force.length - start;
    let squared = 0;
    let width = 0;
    let inside = 0;

    for (let index = start; index < plant.force.length; index += 1) {
        const error = run.force[index] - plant.force[index];
        const bound = C_THREE_SIGMA * run.sigma[index];

        squared += error * error;
        width += bound;
        inside += Math.abs(error) <= bound ? 1 : 0;
    }

    return { rmse: Math.sqrt(squared / count), bound: width / count, inside: inside / count };
}
