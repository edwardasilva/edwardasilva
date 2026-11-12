/**
 * scripts/theme-figures.js
 * Dark Figure Variants
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 10 November, 2026
 *
 * Writes a dark-theme copy of every SVG plot under src/figures. The plots come from MATLAB and
 * matplotlib reports drawn for a white page, so Figure.astro used to put them on a white plate in
 * both themes. This script recolors each one for the night navy theme instead: white becomes the
 * figure surface, black and dark grey become ink, light greys become the rule colour, and every
 * other colour is lightened until it reads on navy. The light source file is never changed, so
 * the figure in light mode stays exactly as the report drew it.
 *
 * File Structure:
 * - C_DARK: the theme colours the dark copy uses
 * - C_SERIES: the four data series colours and their dark values
 * - parseColor, luminance, lighten: colour maths
 * - darkColor: maps one colour from the light file to the dark copy
 * - themeSvg: rewrites every fill, stroke, and stop-color in one file
 * - main: writes every <name>-dark.svg, or checks them with --check
 *
 * Where this file is used within the repository:
 * - npm run figures writes the dark copies, which are committed next to their sources
 * - npm run figures:check fails CI when a dark copy is missing or out of date
 * - src/components/Figure.astro and ProjectCards.astro show the dark copy in dark mode
 *
 * Usage:
 * $ `npm run figures` : Writes src/figures/**\/<name>-dark.svg for every plot
 * $ `npm run figures:check` : Exits 1 if any dark copy differs from what the script would write
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_FIGURE_DIR = path.join(ROOT_DIR, 'src', 'figures');
const C_DARK_SUFFIX = '-dark.svg';

// The dark theme in src/styles/theme.css: the figure surface, text ink, the secondary line
// colour, and the stronger rule. Keep them in step with that file.
const C_DARK = {
    surface: [0x13, 0x1c, 0x2e],
    ink: [0xec, 0xee, 0xf2],
    silver: [0x76, 0x80, 0x8f],
    rule: [0x3b, 0x43, 0x52],
};

// The four series colours in the light plots and the dark value each one takes. These bypass the
// generic lighten step. Keep them in step with the series palette in the issue that set it.
const C_SERIES = {
    '#16233a': '#eceef2',
    '#1d5f8a': '#7fb3d9',
    '#3f6b22': '#9cc77a',
    '#838c9a': '#76808f',
};

// The smallest relative luminance a coloured line or marker keeps on navy paper.
const C_MIN_LUMINANCE = 0.3;

const C_NAMED = {
    black: [0, 0, 0],
    white: [255, 255, 255],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    red: [255, 0, 0],
    blue: [0, 0, 255],
    green: [0, 128, 0],
};

/**
 * @brief Reads a CSS colour into red, green, and blue channels
 * @param value The attribute value, such as #212121, rgb(12.9%, 12.9%, 12.9%), or black
 * @return The channels from 0 to 255, or null for none, currentColor, a url, or an unknown name
 */
function parseColor(value) {
    const text = value.trim().toLowerCase();

    if (/^#[0-9a-f]{6}$/.test(text)) {
        return [1, 3, 5].map((index) => parseInt(text.slice(index, index + 2), 16));
    }

    if (/^#[0-9a-f]{3}$/.test(text)) {
        return [1, 2, 3].map((index) => parseInt(text[index] + text[index], 16));
    }

    const rgb = text.match(/^rgb\(\s*([\d.]+)(%?)\s*,\s*([\d.]+)(%?)\s*,\s*([\d.]+)(%?)\s*\)$/);

    if (rgb) {
        return [1, 3, 5].map((index) => {
            const number = Number(rgb[index]);

            return Math.round(rgb[index + 1] ? (number / 100) * 255 : number);
        });
    }

    return C_NAMED[text] ?? null;
}

/**
 * @brief Writes channels back as a hex colour
 * @param channels Red, green, and blue from 0 to 255
 * @return Lowercase hex colour such as #eceef2
 */
function toHex(channels) {
    return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * @brief Computes the WCAG relative luminance of a colour
 * @param channels Red, green, and blue from 0 to 255
 * @return Luminance from 0 (black) to 1 (white)
 */
function luminance(channels) {
    const [r, g, b] = channels.map((channel) => {
        const share = channel / 255;

        return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * @brief Mixes a colour toward white until it reads on navy
 * @param channels Red, green, and blue from 0 to 255
 * @return The lightened channels, with the hue kept
 */
function lighten(channels) {
    for (let share = 0; share <= 1; share += 0.02) {
        const mixed = channels.map((channel) => channel + share * (255 - channel));

        if (luminance(mixed) >= C_MIN_LUMINANCE) {
            return mixed;
        }
    }

    return [255, 255, 255];
}

/**
 * @brief Maps one colour from the light file to the dark copy
 * @param value The attribute value as written
 * @return The replacement value, or the original when it is not a colour
 * @details Greys map by role: the page white becomes the figure surface, dark greys become ink,
 * mid greys become the secondary line colour, and light greys become the rule colour. Anything
 * with a hue keeps it and is lightened only as far as it needs to be.
 */
function darkColor(value) {
    const channels = parseColor(value);

    if (!channels) {
        return value;
    }

    const series = C_SERIES[toHex(channels)];

    if (series) {
        return series;
    }

    const lum = luminance(channels);
    const neutral = Math.max(...channels) - Math.min(...channels) <= 16;

    if (neutral) {
        if (lum >= 0.9) {
            return toHex(C_DARK.surface);
        }

        if (lum < 0.3) {
            return toHex(C_DARK.ink);
        }

        return toHex(lum < 0.6 ? C_DARK.silver : C_DARK.rule);
    }

    return lum < C_MIN_LUMINANCE ? toHex(lighten(channels)) : toHex(channels);
}

/**
 * @brief Rewrites every colour in an SVG for the dark theme
 * @param svg The light file's text
 * @return The dark copy's text
 * @details Covers fill, stroke, and stop-color as attributes and inside style attributes. The
 * attributes may use double quotes (MATLAB, matplotlib) or single quotes (dvisvgm). The exports
 * here use attributes only, so the style branch is a safeguard.
 */
export function themeSvg(svg) {
    return svg
        .replace(/\b(fill|stroke|stop-color)=(["'])([^"']*)\2/g, (_, name, quote, value) => {
            return `${name}=${quote}${darkColor(value)}${quote}`;
        })
        .replace(/\b(fill|stroke|stop-color)\s*:\s*([^;"']+)/g, (_, name, value) => {
            return `${name}:${darkColor(value)}`;
        });
}

/**
 * @brief Lists every light SVG under src/figures
 * @param dir Directory to search
 * @return Absolute paths, sorted
 */
function listSources(dir) {
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => {
            const full = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                return listSources(full);
            }

            return entry.name.endsWith('.svg') && !entry.name.endsWith(C_DARK_SUFFIX) ? [full] : [];
        })
        .sort();
}

/**
 * @brief Writes or checks the dark copy of every plot
 * @return Nothing
 * @details With --check, nothing is written. The script lists each dark copy that is missing or
 * stale and exits 1, so CI catches a plot that changed without its dark copy.
 */
function main() {
    const check = process.argv.includes('--check');
    const stale = [];

    for (const source of listSources(C_FIGURE_DIR)) {
        const target = source.replace(/\.svg$/, C_DARK_SUFFIX);
        const expected = themeSvg(fs.readFileSync(source, 'utf8'));
        const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
        const relative = path.relative(ROOT_DIR, target);

        if (current === expected) {
            continue;
        }

        if (check) {
            stale.push(relative);
            continue;
        }

        fs.writeFileSync(target, expected, 'utf8');
        console.log(`[SUCCESS] Wrote ${relative}`);
    }

    if (stale.length > 0) {
        console.error(`[ERROR] ${stale.length} dark figure(s) are missing or out of date:`);
        stale.forEach((file) => console.error(`  ${file}`));
        console.error('Run `npm run figures` and commit the result.');
        process.exit(1);
    }

    if (check) {
        console.log('[SUCCESS] Every dark figure matches its source.');
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
