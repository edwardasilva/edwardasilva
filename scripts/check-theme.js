/**
 * scripts/check-theme.js
 * Theme Colour Drift Check
 *
 * Author: Edward Silva
 * Creation Date: 16 November, 2026
 * Last Update: 16 November, 2026
 *
 * Several files keep their own copy of theme colours because they cannot read CSS: the code-block
 * themes, the share image, the icons, the dark figure script, a TikZ figure, the favicon, and the
 * brand lockups. This check reads every 6-digit hex in src/styles/theme.css as the palette and
 * fails when one of those files holds a colour that is not in it, so a palette change cannot
 * leave an old copy behind.
 *
 * File Structure:
 * - C_PALETTE_FILE and C_COPIES: the palette and the files that copy it
 * - C_ALLOWED: colours a file may hold outside the palette, each with its reason
 * - C_FORMS: the ways a colour is written: #rrggbb, {HTML}{RRGGBB}, and [0xRR, 0xGG, 0xBB]
 * - colours: every colour in one file, as lowercase #rrggbb
 * - Main Logic: names each file and colour that is not in the palette
 *
 * Where this file is used within the repository:
 * - package.json, as npm run check:theme
 * - .github/workflows/ci.yml and scripts/run-all.js
 *
 * Usage:
 * $ `npm run check:theme` : Exits 1 if a copied colour is not in the palette
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_PALETTE_FILE = 'src/styles/theme.css';
const C_COPIES = [
    'astro.config.mjs',
    'src/styles/ec-light.json',
    'src/styles/ec-dark.json',
    'src/pages/og/[slug].png.ts',
    'scripts/render-icons.js',
    'scripts/theme-figures.js',
    'src/figures/pitch/filters.tex',
    'public/favicon.svg',
    ...fs
        .readdirSync(path.join(ROOT_DIR, '.github', 'brand'))
        .filter((name) => name.endsWith('.svg'))
        .map((name) => `.github/brand/${name}`),
];

const C_ALLOWED = {
    'scripts/theme-figures.js': {
        // The green data series in the light plots and its dark value. The plots bring their own
        // series colours, which the site theme does not use.
        '#3f6b22': 'green series, light',
        '#9cc77a': 'green series, dark',
        // The example value in parseColor's doc comment.
        '#212121': 'example in a comment',
    },
};

const C_FORMS = [
    /#([0-9a-f]{6})(?![0-9a-f])/gi,
    /\{HTML\}\{([0-9a-f]{6})\}/gi,
    /\[\s*0x([0-9a-f]{2})\s*,\s*0x([0-9a-f]{2})\s*,\s*0x([0-9a-f]{2})\s*\]/gi,
];

/**
 * @brief Lists every colour written in a file
 * @param file Path from the repository root
 * @return Lowercase #rrggbb colours, in the order they appear in each form
 */
function colours(file) {
    const text = fs.readFileSync(path.join(ROOT_DIR, file), 'utf8');

    return C_FORMS.flatMap((form) =>
        [...text.matchAll(form)].map((match) => `#${match.slice(1).join('').toLowerCase()}`)
    );
}

const palette = new Set(colours(C_PALETTE_FILE));
let failed = false;

for (const file of C_COPIES) {
    const allowed = C_ALLOWED[file] ?? {};

    for (const colour of new Set(colours(file))) {
        if (!palette.has(colour) && !(colour in allowed)) {
            console.error(`[ERROR] ${file}: ${colour} is not in ${C_PALETTE_FILE}`);
            failed = true;
        }
    }
}

if (failed) {
    process.exit(1);
}

console.log(`[SUCCESS] ${C_COPIES.length} files use only colours from ${C_PALETTE_FILE}.`);
