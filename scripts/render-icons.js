/**
 * scripts/render-icons.js
 * PNG Icon Renderer
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 10 November, 2026
 *
 * Renders public/favicon.svg to the PNG and ICO icons that browsers without SVG favicon support and
 * iOS "Add to Home Screen" need. resvg ignores the dark color media query, so the dark PNGs come
 * from a copy of the SVG where the dark rules are unwrapped and override the light ones. The Apple
 * touch icon puts the light mark on an opaque #fbfbfc tile with a 15% margin, because iOS fills
 * transparent areas with black.
 *
 * File Structure:
 * - Global Variables: paths, sizes, and the tile color
 * - renderPng: rasterizes an SVG string at a width
 * - darkSvg: unwraps the dark color rules so they apply
 * - buildIco: packs PNG buffers into one ICO file
 * - touchIconSvg: wraps the favicon markup in the 180 px tile
 * - main: reads the favicon and writes the PNG and ICO files
 *
 * Where this file is used within the repository:
 * - Writes public/favicon-16.png, public/favicon-32.png, public/favicon-dark-16.png,
 *   public/favicon-dark-32.png, public/favicon.ico, and public/apple-touch-icon-180.png
 * - astro.config.mjs links the PNG files in the page head. Browsers ask for favicon.ico on their own
 *
 * Usage:
 * $ `npm run icons` : Rewrites the PNG and ICO files from public/favicon.svg
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const C_TILE_COLOR = '#fbfbfc';
const C_TILE_SIZE = 180;
const C_MARGIN = 18;
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
 * @brief Makes a copy of the favicon SVG that uses its dark colors
 * @param svg The favicon SVG markup
 * @return {string} The SVG with the dark media block unwrapped, so its rules override the light ones
 */
function darkSvg(svg) {
    const block = /@media \(prefers-color-scheme: dark\) \{([\s\S]*?\})\s*\}/;
    const match = svg.match(block);

    if (!match) {
        throw new Error('[ERROR] favicon.svg has no dark color block');
    }

    return svg.replace(block, match[1]);
}

/**
 * @brief Packs square PNG images into one ICO file
 * @param images PNG buffers with their pixel sizes
 * @return {Buffer} The ICO file contents
 * @details Each entry stores the PNG bytes as is, which every current browser reads.
 */
function buildIco(images) {
    const header = Buffer.alloc(6);
    const entries = Buffer.alloc(16 * images.length);
    let offset = header.length + entries.length;

    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(images.length, 4);

    images.forEach(({ size, png }, index) => {
        const at = 16 * index;

        entries.writeUInt8(size, at);
        entries.writeUInt8(size, at + 1);
        entries.writeUInt16LE(1, at + 4);
        entries.writeUInt16LE(32, at + 6);
        entries.writeUInt32LE(png.length, at + 8);
        entries.writeUInt32LE(offset, at + 12);
        offset += png.length;
    });

    return Buffer.concat([header, entries, ...images.map(({ png }) => png)]);
}

/**
 * @brief Builds the Apple touch icon SVG from the favicon markup
 * @param svg The favicon SVG markup
 * @return {string} A 180 by 180 SVG with the mark centered on an opaque tile
 * @details The 32 unit mark scales to 144 px, which leaves an 18 px margin on every side. The mark's own 2 unit margin adds
 * 9 px, so the visible padding is 27 px, 15% of the tile.
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
 * @brief Writes the PNG and ICO icons
 * @return {void}
 */
function main() {
    const favicon = fs.readFileSync(path.join(C_PUBLIC_DIR, 'favicon.svg'), 'utf8');
    const dark = darkSvg(favicon);
    const light16 = renderPng(favicon, 16);
    const light32 = renderPng(favicon, 32);

    fs.writeFileSync(path.join(C_PUBLIC_DIR, 'favicon-32.png'), light32);
    fs.writeFileSync(path.join(C_PUBLIC_DIR, 'favicon-16.png'), light16);
    fs.writeFileSync(path.join(C_PUBLIC_DIR, 'favicon-dark-32.png'), renderPng(dark, 32));
    fs.writeFileSync(path.join(C_PUBLIC_DIR, 'favicon-dark-16.png'), renderPng(dark, 16));
    fs.writeFileSync(
        path.join(C_PUBLIC_DIR, 'favicon.ico'),
        buildIco([
            { size: 16, png: light16 },
            { size: 32, png: light32 },
        ])
    );
    fs.writeFileSync(
        path.join(C_PUBLIC_DIR, 'apple-touch-icon-180.png'),
        renderPng(touchIconSvg(favicon), C_TILE_SIZE)
    );

    console.log(
        '[SUCCESS] Wrote the light and dark favicon PNGs, favicon.ico, and the Apple touch icon'
    );
}

main();
