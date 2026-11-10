/**
 * scripts/check-dates.js
 * Built Site Date Range Check
 *
 * Author: Edward Silva
 * Creation Date: 10 November, 2026
 * Last Update: 10 November, 2026
 *
 * Reads every page in dist/ and dist/llms.txt, and fails when a date range is joined by a spaced
 * hyphen, such as July 2026 - Present. The site style is an unspaced en dash. Run
 * `npm run build` first.
 *
 * File Structure:
 * - listFiles: every HTML file under dist/, plus llms.txt
 * - visibleText: page text without scripts, styles, and tags
 * - Main Logic: reports each spaced-hyphen range with the file it is in
 *
 * Where this file is used within the repository:
 * - package.json, as npm run check:dates
 *
 * Usage:
 * $ `npm run check:dates` : Checks every built page and llms.txt
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_DIST = path.join(ROOT_DIR, 'dist');
const C_DATE_WORD =
    '(?:\\d{4}|Present|January|February|March|April|May|June|July|August|September|October|November|December|Spring|Summer|Fall|Winter)';
const C_SPACED_RANGE = new RegExp(`${C_DATE_WORD} - ${C_DATE_WORD}\\b`, 'g');

if (!fs.existsSync(C_DIST)) {
    console.error('[ERROR] dist/ is missing. Run npm run build first.');
    process.exit(1);
}

/**
 * @brief Lists every HTML file under a directory, plus llms.txt at its top
 * @param dir Directory to walk
 * @param out List to fill
 * @return The list of absolute paths
 */
function listFiles(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            listFiles(full, out);
        } else if (entry.name.endsWith('.html') || full === path.join(C_DIST, 'llms.txt')) {
            out.push(full);
        }
    }

    return out;
}

/**
 * @brief Gets the text a reader sees on a page
 * @param file Absolute path of the file
 * @return The text, with scripts, styles, and tags removed for HTML
 */
function visibleText(file) {
    const text = fs.readFileSync(file, 'utf8');

    if (!file.endsWith('.html')) {
        return text;
    }

    return text
        .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;|&#160;/g, ' ');
}

let failed = false;

for (const file of listFiles(C_DIST)) {
    const hits = visibleText(file).match(C_SPACED_RANGE) ?? [];

    for (const hit of new Set(hits)) {
        console.error(`[ERROR] ${path.relative(C_DIST, file)}: "${hit}" needs an en dash`);
        failed = true;
    }
}

if (failed) {
    process.exit(1);
}

console.log('[SUCCESS] No date range uses a spaced hyphen.');
