/**
 * src/data/figures.ts
 * Figure Lookup
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 09 November, 2026
 *
 * Finds a figure under src/figures by name, so pages and resume-data.json can name a figure and
 * still get hashed URLs and real dimensions.
 *
 * File Structure:
 * - C_FIGURES: every figure, keyed by name
 * - getFigure: looks one up and fails the build when it is missing
 * - getDarkFigure: the dark copy of a plot, written by scripts/theme-figures.js, when there is one
 *
 * Where this file is used within the repository:
 * - src/components/Figure.astro and src/components/ProjectCards.astro
 *
 * Usage:
 * $ `npm run dev` : Runs at build time
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import type { ImageMetadata } from 'astro';

const C_FIGURES = Object.fromEntries(
    Object.entries(
        import.meta.glob<{ default: ImageMetadata }>('../figures/**/*.{png,jpg,svg}', {
            eager: true,
        })
    ).map(([file, module]) => [
        file.replace('../figures/', '').replace(/\.(png|jpg|svg)$/, ''),
        module.default,
    ])
);

/**
 * @brief Finds a figure by name
 * @param name Path under src/figures with no extension, such as gantry/augmented
 * @return Image metadata
 */
export function getFigure(name: string): ImageMetadata {
    const figure = C_FIGURES[name];

    if (!figure) {
        throw new Error(`[ERROR] No figure named ${name} under src/figures`);
    }

    return figure;
}

/**
 * @brief Finds the dark-theme copy of a plot
 * @param name Path under src/figures with no extension, such as estimation/ekf-force
 * @return Image metadata for <name>-dark.svg, or undefined for a photo or a raster plot
 * @details scripts/theme-figures.js writes the dark copies, and npm run figures:check keeps them
 * in step with their sources.
 */
export function getDarkFigure(name: string): ImageMetadata | undefined {
    return C_FIGURES[`${name}-dark`];
}
