/**
 * src/lib/pitch.ts
 * Pitch Trackers
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Runs the two pitch detectors from the EENG 411 project on a test tone in the browser. The detectors
 * are a port of Run.m: the Hamming window, 8192-bin FFT, and parabolic peak fit, and the normalized
 * correlation with lag bounds, a 0.2 threshold, and a parabolic fit on the lag. The filter is applied
 * to the tone as the magnitude of the two Butterworth designs, and white noise is added at the level
 * Main.m uses, so the signal at 8 kHz matches the project's test input for a steady tone.
 *
 * File Structure:
 * - Constants from Run.m and Main.m
 * - filterGain: Butterworth magnitude at a frequency
 * - makeSignal: the decimated test signal
 * - detectFft and detectAcf: one detector each
 *
 * Where this file is used within the repository:
 * - src/components/PitchFigure.astro
 *
 * Usage:
 * $ `npm run dev` : Runs in the browser, and at build time for the checks
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

const C_FS_IN = 48000;
const C_FS = 8000;
const C_FRAME = Math.floor(4096 / 6);
const C_HISTORY = 2048;
const C_NFFT = 8192;
const C_MIN_F = 55;
const C_MAX_F = 2000;
const C_THRESHOLD = 0.2;
const C_NOISE_RMS = 0.25 * 0.01;
const C_TONE = 0.5;

/**
 * @brief Prewarps a frequency for the bilinear transform
 * @param frequency Frequency in hertz
 * @return Warped frequency
 */
function warp(frequency: number): number {
    return Math.tan((Math.PI * frequency) / C_FS_IN);
}

/**
 * @brief Finds the order of a Butterworth design from its spec
 * @param lowEdge Lower band edge in hertz
 * @param highEdge Upper band edge in hertz
 * @return Filter order
 * @details Uses the 1 dB pass-band ripple and 80 dB stop-band attenuation from Main.m.
 */
function butterOrder(lowEdge: number, highEdge: number): number {
    const ratio = Math.abs(Math.log10(warp(highEdge) / warp(lowEdge)));

    return Math.ceil(Math.log10((10 ** 8 - 1) / (10 ** 0.1 - 1)) / (2 * ratio));
}

const C_LP_ORDER = butterOrder(1500, 2000);
const C_HP_ORDER = butterOrder(30, 60);

/**
 * @brief Evaluates the cascaded band-pass filter
 * @param frequency Frequency in hertz
 * @return Magnitude response
 * @details The designs match the stop band exactly, as Main.m asks.
 */
export function filterGain(frequency: number): number {
    const stopRatio = 10 ** 8 - 1;
    const lpCut = warp(2000) / stopRatio ** (1 / (2 * C_LP_ORDER));
    const hpCut = warp(30) * stopRatio ** (1 / (2 * C_HP_ORDER));
    const lp = 1 / Math.sqrt(1 + (warp(frequency) / lpCut) ** (2 * C_LP_ORDER));
    const hp = 1 / Math.sqrt(1 + (hpCut / warp(frequency)) ** (2 * C_HP_ORDER));

    return lp * hp;
}

/**
 * @brief Builds the decimated test signal for a steady tone
 * @param frequency Tone frequency in hertz
 * @param seed Integer seed for the noise
 * @return Samples at 8 kHz, oldest first
 */
export function makeSignal(frequency: number, seed = 1): Float64Array {
    const signal = new Float64Array(C_HISTORY);
    const amplitude = C_TONE * filterGain(frequency);
    const noiseRms = C_NOISE_RMS * Math.sqrt(1750 / (C_FS_IN / 2));
    let state = seed >>> 0;

    /**
     * @brief Draws one uniform sample
     * @return Value in (0, 1)
     */
    const uniform = () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;

        return (state + 0.5) / 4294967296;
    };

    for (let n = 0; n < C_HISTORY; n += 1) {
        const gauss = Math.sqrt(-2 * Math.log(uniform())) * Math.cos(2 * Math.PI * uniform());

        signal[n] = amplitude * Math.sin((2 * Math.PI * frequency * n) / C_FS) + noiseRms * gauss;
    }

    return signal;
}

/**
 * @brief Computes an in-place radix-2 FFT
 * @param real Real parts
 * @param imag Imaginary parts
 * @return Nothing
 */
function fft(real: Float64Array, imag: Float64Array): void {
    const size = real.length;

    for (let i = 1, j = 0; i < size; i += 1) {
        let bit = size >> 1;

        for (; j & bit; bit >>= 1) {
            j ^= bit;
        }

        j ^= bit;

        if (i < j) {
            [real[i], real[j]] = [real[j], real[i]];
            [imag[i], imag[j]] = [imag[j], imag[i]];
        }
    }

    for (let length = 2; length <= size; length <<= 1) {
        const angle = (-2 * Math.PI) / length;

        for (let start = 0; start < size; start += length) {
            for (let k = 0; k < length / 2; k += 1) {
                const wr = Math.cos(angle * k);
                const wi = Math.sin(angle * k);
                const a = start + k;
                const b = a + length / 2;
                const tr = real[b] * wr - imag[b] * wi;
                const ti = real[b] * wi + imag[b] * wr;

                real[b] = real[a] - tr;
                imag[b] = imag[a] - ti;
                real[a] += tr;
                imag[a] += ti;
            }
        }
    }
}

export interface FftResult {
    frequency: number;
    spectrum: number[];
}

export interface AcfResult {
    frequency: number;
    lags: number[];
    values: number[];
}

/**
 * @brief Detects pitch from the strongest FFT bin in the current frame
 * @param signal Samples at 8 kHz
 * @return Estimated frequency and the magnitude spectrum up to 4 kHz
 */
export function detectFft(signal: Float64Array): FftResult {
    const frame = signal.subarray(signal.length - C_FRAME);
    const mean = frame.reduce((sum, value) => sum + value, 0) / C_FRAME;
    const real = new Float64Array(C_NFFT);
    const imag = new Float64Array(C_NFFT);

    frame.forEach((value, n) => {
        real[n] = (value - mean) * (0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (C_FRAME - 1)));
    });

    fft(real, imag);

    const half = C_NFFT / 2;
    const magnitude = Array.from({ length: half }, (_, k) => Math.hypot(real[k], imag[k]));
    let peak = 0;

    magnitude.forEach((value, k) => {
        peak = value > magnitude[peak] ? k : peak;
    });

    let offset = 0;

    if (peak > 0 && peak < half - 1) {
        const left = magnitude[peak - 1];
        const right = magnitude[peak + 1];

        offset = (0.5 * (left - right)) / (left - 2 * magnitude[peak] + right);
        offset = Number.isNaN(offset) || Math.abs(offset) > 1 ? 0 : offset;
    }

    return { frequency: (peak + offset) * (C_FS / C_NFFT), spectrum: magnitude };
}

/**
 * @brief Detects pitch from the first strong autocorrelation peak in the history buffer
 * @param signal Samples at 8 kHz
 * @return Estimated frequency, or 0 when no peak passes, and the correlation across the search lags
 */
export function detectAcf(signal: Float64Array): AcfResult {
    const mean = signal.reduce((sum, value) => sum + value, 0) / signal.length;
    const centered = signal.map((value) => value - mean);
    const energy = centered.reduce((sum, value) => sum + value * value, 0);
    const minLag = Math.floor(C_FS / C_MAX_F);
    const maxLag = Math.floor(C_FS / C_MIN_F);

    /**
     * @brief Evaluates the normalized correlation at one lag
     * @param lag Lag in samples
     * @return Correlation
     */
    const correlate = (lag: number): number => {
        let sum = 0;

        for (let n = 0; n + lag < centered.length; n += 1) {
            sum += centered[n] * centered[n + lag];
        }

        return sum / energy;
    };

    const lags: number[] = [];
    const values: number[] = [];

    for (let lag = minLag; lag <= maxLag; lag += 1) {
        lags.push(lag);
        values.push(correlate(lag));
    }

    for (let index = 1; index < values.length - 1; index += 1) {
        if (values[index] > values[index - 1] && values[index] > values[index + 1]) {
            if (values[index] <= C_THRESHOLD) {
                return { frequency: 0, lags, values };
            }

            const den = values[index - 1] - 2 * values[index] + values[index + 1];
            const offset =
                Math.abs(den) < 1e-6 ? 0 : (0.5 * (values[index - 1] - values[index + 1])) / den;
            const frequency = C_FS / (lags[index] + offset);

            return {
                frequency: frequency < C_MIN_F || frequency > C_MAX_F ? 0 : frequency,
                lags,
                values,
            };
        }
    }

    return { frequency: 0, lags, values };
}
