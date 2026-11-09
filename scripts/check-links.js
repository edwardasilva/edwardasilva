/**
 * scripts/check-links.js
 * Built Site Link Check
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 09 November, 2026
 *
 * Reads every page in dist/ and fails when a link to this site points at a page that was not
 * built, or at a heading id that is not on that page. Links to other sites are left alone. Run
 * `npm run build` first. Adapted from eeprep's .github/scripts/check-links.mjs.
 *
 * File Structure:
 * - listHtml: every HTML file under dist/
 * - resolveLocal: turns an href into a path on this site, or null for another site
 * - fileFor: the file a path is served from
 * - Main Logic: walks every href and reports the missing ones
 *
 * Where this file is used within the repository:
 * - .github/workflows/ci.yml, after the build
 *
 * Usage:
 * $ `npm run check:links` : Checks every internal link in dist/
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_DIST = path.join(ROOT_DIR, 'dist');
const C_OWN_HOSTS = new Set(['edwardasilva.com', 'www.edwardasilva.com']);

if (!fs.existsSync(C_DIST)) {
    console.error('[ERROR] dist/ is missing. Run npm run build first.');
    process.exit(1);
}

/**
 * @brief Lists every HTML file under a directory
 * @param dir Directory to walk
 * @param out List to fill
 * @return The list of absolute paths
 */
function listHtml(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            listHtml(full, out);
        } else if (entry.name.endsWith('.html')) {
            out.push(full);
        }
    }

    return out;
}

/**
 * @brief Turns an href into a path on this site
 * @param href Link target as written
 * @param fromFile Page the link is on, relative to dist/
 * @return The path and hash, or null when the link leaves the site or needs no check
 */
function resolveLocal(href, fromFile) {
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/.test(href)) {
        return null;
    }

    let pathname = href;

    if (/^[a-z]+:/i.test(href)) {
        let url;

        try {
            url = new URL(href);
        } catch {
            return null;
        }

        if (!/^https?:$/.test(url.protocol) || !C_OWN_HOSTS.has(url.hostname)) {
            return null;
        }

        pathname = `${url.pathname}${url.hash}`;
    }

    const hashAt = pathname.indexOf('#');
    const hash = hashAt >= 0 ? pathname.slice(hashAt + 1) : '';

    pathname = (hashAt >= 0 ? pathname.slice(0, hashAt) : pathname).split('?')[0];

    if (!pathname) {
        return { pathname: `/${path.posix.dirname(fromFile)}/`, hash };
    }

    if (!pathname.startsWith('/')) {
        pathname = path.posix.normalize(
            path.posix.join('/', path.posix.dirname(fromFile), pathname)
        );
    }

    return { pathname, hash };
}

/**
 * @brief Finds the file a path is served from
 * @param pathname Path on the site
 * @return Absolute file path, which may not exist
 */
function fileFor(pathname) {
    const rel = decodeURIComponent(pathname).replace(/^\/+/, '');

    if (rel === '404' || rel === '404/' || rel === '404.html') {
        return path.join(C_DIST, '404.html');
    }

    if (rel === '' || rel.endsWith('/')) {
        return path.join(C_DIST, rel, 'index.html');
    }

    const direct = path.join(C_DIST, rel);

    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) {
        return direct;
    }

    return path.join(C_DIST, rel, 'index.html');
}

const files = listHtml(C_DIST);
let failed = false;

for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(C_DIST, file);

    for (const match of html.matchAll(/\shref="([^"]+)"/g)) {
        const href = match[1].replace(/&amp;/g, '&');
        const target = resolveLocal(href, rel);

        if (!target) {
            continue;
        }

        const dest = fileFor(target.pathname);

        if (!fs.existsSync(dest)) {
            console.error(`[ERROR] ${rel}: missing ${href}`);
            failed = true;
            continue;
        }

        if (target.hash && !fs.readFileSync(dest, 'utf8').includes(`id="${target.hash}"`)) {
            console.error(`[ERROR] ${rel}: missing #${target.hash} in ${href}`);
            failed = true;
        }
    }
}

if (failed) {
    process.exit(1);
}

console.log(`[SUCCESS] Checked the links in ${files.length} HTML files.`);
