/**
 * src/lib/plot.ts
 * Plot Helpers
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Coordinates, SVG paths, and the crosshair for the live figures. The server renders each plot once
 * and the browser redraws it with the same functions, so both agree.
 *
 * File Structure:
 * - PlotConfig: the plot area and axis ranges
 * - xAt and yAt: data to SVG coordinates
 * - linePath and bandPath: SVG path data
 * - attachCrosshair: the hover line and readout
 *
 * Where this file is used within the repository:
 * - src/components/Plot.astro and the live figures
 *
 * Usage:
 * $ `npm run dev` : Renders in the local development server
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

export interface PlotConfig {
    width: number;
    height: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

/**
 * @brief Builds a plot configuration with the standard frame
 * @param xMin Lowest x value
 * @param xMax Highest x value
 * @param yMin Lowest y value
 * @param yMax Highest y value
 * @param height Height of the SVG in its own units
 * @return Plot configuration
 */
export function makePlot(
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    height = 320
): PlotConfig {
    return { width: 640, height, left: 56, right: 12, top: 12, bottom: 48, xMin, xMax, yMin, yMax };
}

/**
 * @brief Converts an x value to an SVG coordinate
 * @param value Data value
 * @param plot Plot configuration
 * @return SVG x coordinate
 */
export function xAt(value: number, plot: PlotConfig): number {
    const span = plot.width - plot.left - plot.right;

    return plot.left + ((value - plot.xMin) / (plot.xMax - plot.xMin)) * span;
}

/**
 * @brief Converts a y value to an SVG coordinate
 * @param value Data value
 * @param plot Plot configuration
 * @return SVG y coordinate
 */
export function yAt(value: number, plot: PlotConfig): number {
    const span = plot.height - plot.top - plot.bottom;

    return plot.top + ((plot.yMax - value) / (plot.yMax - plot.yMin)) * span;
}

/**
 * @brief Builds path data for a line
 * @param xs X values
 * @param ys Y values
 * @param plot Plot configuration
 * @return SVG path data
 */
export function linePath(xs: ArrayLike<number>, ys: ArrayLike<number>, plot: PlotConfig): string {
    const parts: string[] = [];

    for (let index = 0; index < xs.length; index += 1) {
        const x = xAt(xs[index], plot).toFixed(1);
        const y = yAt(ys[index], plot).toFixed(1);

        parts.push(`${index === 0 ? 'M' : 'L'}${x} ${y}`);
    }

    return parts.join('');
}

/**
 * @brief Builds path data for a shaded band between two lines
 * @param xs X values
 * @param lows Lower edge
 * @param highs Upper edge
 * @param plot Plot configuration
 * @return Closed SVG path data
 */
export function bandPath(
    xs: ArrayLike<number>,
    lows: ArrayLike<number>,
    highs: ArrayLike<number>,
    plot: PlotConfig
): string {
    const forward = linePath(xs, highs, plot);
    const back: string[] = [];

    for (let index = xs.length - 1; index >= 0; index -= 1) {
        back.push(`L${xAt(xs[index], plot).toFixed(1)} ${yAt(lows[index], plot).toFixed(1)}`);
    }

    return `${forward}${back.join('')}Z`;
}

/**
 * @brief Adds the hover line and readout to a plot
 * @param host Element holding the plot, with [data-cross] and [data-tip] inside
 * @param plot Plot configuration
 * @param describe Returns the readout for an x value
 * @return Nothing
 */
export function attachCrosshair(
    host: HTMLElement,
    plot: PlotConfig,
    describe: (x: number) => string
): void {
    const cross = host.querySelector<SVGLineElement>('[data-cross]');
    const tip = host.querySelector<HTMLElement>('[data-tip]');

    if (!cross || !tip) {
        return;
    }

    /**
     * @brief Hides the hover line and readout
     * @return Nothing
     */
    const hide = () => {
        tip.hidden = true;
        cross.setAttribute('hidden', '');
    };

    host.addEventListener('pointermove', (event) => {
        const bounds = host.getBoundingClientRect();
        const svgX = ((event.clientX - bounds.left) / bounds.width) * plot.width;
        const span = plot.width - plot.left - plot.right;
        const share = (svgX - plot.left) / span;

        if (share < 0 || share > 1) {
            hide();
            return;
        }

        const value = plot.xMin + share * (plot.xMax - plot.xMin);

        cross.setAttribute('x1', String(svgX));
        cross.setAttribute('x2', String(svgX));
        cross.removeAttribute('hidden');
        tip.hidden = false;
        tip.textContent = describe(value);
        tip.style.left = `${Math.max(0, Math.min(event.clientX - bounds.left + 12, bounds.width - tip.offsetWidth - 4))}px`;
    });

    host.addEventListener('pointerleave', hide);
}
