/**
 * scripts/render-icons.js
 * PNG Icon Renderer
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 09 November, 2026
 *
 * Renders public/favicon.svg to the PNG icons that browsers without SVG favicon support and iOS
 * "Add to Home Screen" need. resvg ignores the dark color media query, so every PNG comes out in
 * the light colors. The Apple touch icon puts the mark on an opaque #fbfbfc tile, because iOS fills
 * transparent areas with black.
 *
 * File Structure:
 * - Global Variables: paths, sizes, and the tile color
 * - renderPng: rasterizes an SVG string at a width
 * - touchIconSvg: wraps the favicon markup in the 180 px tile
 * - main: reads the favicon and writes the three PNG files
 *
 * Where this file is used within the repository:
 * - Writes public/favicon-16.png, public/favicon-32.png, and public/apple-touch-icon-180.png
 * - astro.config.mjs links the three files in the page head
 *
 * Usage:
 * $ `npm run icons` : Rewrites the three PNG files from public/favicon.svg
 *
 * Copyright (c) 2026 Edward Silva. MIT License.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const C_TILE_COLOR = '#fbfbfc';
const C_TILE_SIZE = 180;
const C_MARGIN = 30;
const C_MARK_SIZE = 32;

/**
 * @brief Rasterizes an SVG string to PNG bytes
 * @param svg The SVG markup
 * @param width Output width in pixels
 * @return {Buffer} The PNG file contents
 */
function renderPng(svg, width) {
    return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

/**
 * @brief Builds the Apple touch icon SVG from the favicon markup
 * @param svg The favicon SVG markup
 * @return {string} A 180 by 180 SVG with the mark centered on an opaque tile
 * @details The 32 unit mark scales to 120 px, which leaves a 30 px margin on every side.
 */
function touchIconSvg(svg) {
    const inner = svg.replace(/<!--[\s\S]*?-->/g, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
    const scale = (C_TILE_SIZE - 2 * C_MARGIN) / C_MARK_SIZE;

    return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${C_TILE_SIZE} ${C_TILE_SIZE}"`,
        ` width="${C_TILE_SIZE}" height="${C_TILE_SIZE}">`,
        `<rect width="${C_TILE_SIZE}" height="${C_TILE_SIZE}" fill="${C_TILE_COLOR}"/>`,
        `<g transform="translate(${C_MARGIN} ${C_MARGIN}) scale(${scale})">${inner}</g>`,
        '</svg>',
    ].join('');
}

/**
 * @brief Writes the three PNG icons
 * @return {void}
 */
function main() {
    const favicon = fs.readFileSync(path.join(C_PUBLIC_DIR, 'favicon.svg'), 'utf8');

    fs.writeFileSync(path.join(C_PUBLIC_DIR, 'favicon-32.png'), renderPng(favicon, 32));
    fs.writeFileSync(path.join(C_PUBLIC_DIR, 'favicon-16.png'), renderPng(favicon, 16));
    fs.writeFileSync(
        path.join(C_PUBLIC_DIR, 'apple-touch-icon-180.png'),
        renderPng(touchIconSvg(favicon), C_TILE_SIZE)
    );

    console.log('[SUCCESS] Wrote favicon-16.png, favicon-32.png, and apple-touch-icon-180.png');
}

main();
