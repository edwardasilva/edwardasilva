/**
 * scripts/check-external-links.js
 * Outside Link Check
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 09 November, 2026
 *
 * Reads every page in dist/ and fetches each link that leaves this site, then reports the ones
 * that no longer answer. It runs on a schedule and by hand, never on a pull request, because
 * outside sites go down for reasons that have nothing to do with a change here. Hosts that
 * refuse automated clients are skipped and listed, so the report says what it did not check.
 * Run `npm run build` first. Adapted from eeprep's .github/scripts/check-external-links.mjs.
 *
 * File Structure:
 * - C_SKIP_HOSTS: sites that block scripted requests or need a login
 * - listHtml: every HTML file under dist/
 * - collectUrls: the outside links on every page
 * - fetchStatus, attempt: HEAD first, then GET for servers that refuse HEAD
 * - Main Logic: eight requests at a time, then a summary that separates dead pages from bot walls
 *
 * Where this file is used within the repository:
 * - .github/workflows/links.yml, weekly and on request
 *
 * Usage:
 * $ `npm run check:external-links` : Fetches every outside link in dist/
 * $ `npm run check:external-links -- --report` : Also writes a summary for GITHUB_STEP_SUMMARY
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_DIST = path.join(ROOT_DIR, 'dist');
const C_OWN_HOSTS = new Set(['edwardasilva.com', 'www.edwardasilva.com']);
const C_SKIP_HOSTS = new Set(['www.linkedin.com', 'linkedin.com', 'x.com', 'www.x.com']);
const C_TIMEOUT_MS = 20_000;
const C_POOL = 8;
const C_HEADERS = {
    'user-agent':
        'Mozilla/5.0 (X11; Linux x86_64) edwardasilva-link-check (+https://edwardasilva.com)',
    accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
};

if (!fs.existsSync(C_DIST)) {
    console.error('[ERROR] dist/ is missing. Run npm run build first.');
    process.exit(1);
}

/**
 * @brief Lists every HTML file under a folder
 * @param {string} dir Folder to walk
 * @return {string[]} Absolute paths
 */
function listHtml(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listHtml(full);
        return entry.name.endsWith('.html') ? [full] : [];
    });
}

/**
 * @brief Collects the links that leave this site from every built page
 * @return {string[]} Unique URLs, sorted
 */
function collectUrls() {
    const urls = new Set();
    for (const file of listHtml(C_DIST)) {
        const html = fs.readFileSync(file, 'utf8');
        for (const match of html.matchAll(/\bhref="(https?:\/\/[^"]+)"/g)) {
            const href = match[1].replace(/&amp;/g, '&');
            const host = new URL(href).hostname;
            if (!C_OWN_HOSTS.has(host)) urls.add(href);
        }
    }
    return [...urls].sort();
}

/**
 * @brief One request, with the body cancelled as soon as the status is known
 * @param {string} url Address to fetch
 * @param {'HEAD' | 'GET'} method Request method
 * @return {Promise<number>} HTTP status, or 0 for no response
 */
async function attempt(url, method) {
    try {
        const response = await fetch(url, {
            method,
            headers: C_HEADERS,
            redirect: 'follow',
            signal: AbortSignal.timeout(C_TIMEOUT_MS),
        });
        await response.body?.cancel();
        return response.status;
    } catch {
        return 0;
    }
}

/**
 * @brief HEAD first, then GET for a server that refuses HEAD
 * @param {string} url Address to check
 * @return {Promise<number>} HTTP status, or 0 for no response
 */
async function fetchStatus(url) {
    const head = await attempt(url, 'HEAD');
    return head && ![403, 404, 405].includes(head) ? head : attempt(url, 'GET');
}

const urls = collectUrls();
const skipped = urls.filter((url) => C_SKIP_HOSTS.has(new URL(url).hostname));
const queue = urls.filter((url) => !C_SKIP_HOSTS.has(new URL(url).hostname));
const checked = queue.length;
const refused = [];
const failed = [];

console.log(`[RUN] Checking ${checked} outside links from ${urls.length} found in dist/`);
await Promise.all(
    Array.from({ length: C_POOL }, async () => {
        for (let url = queue.shift(); url; url = queue.shift()) {
            const status = await fetchStatus(url);
            if (status >= 200 && status < 400) continue;
            // A 403 is a bot wall, not a dead page. Many sites answer every script that way.
            if (status === 403) {
                refused.push(url);
                continue;
            }
            failed.push({ url, status });
            console.error(`[ERROR] ${status || 'no response'} ${url}`);
        }
    })
);

const summary = [
    `Checked ${checked} of ${urls.length} outside links. ${failed.length} failed, ${refused.length} refused a script, ${skipped.length} skipped.`,
    '',
    ...(failed.length
        ? ['Failed:', ...failed.map((f) => `- ${f.status || 'no response'} ${f.url}`), '']
        : []),
    ...(refused.length
        ? [
              'Refused with 403 (a bot wall, check by hand if the page matters):',
              ...refused.map((u) => `- ${u}`),
              '',
          ]
        : []),
    ...(skipped.length
        ? ['Skipped (block automated clients, check by hand):', ...skipped.map((u) => `- ${u}`)]
        : []),
];
if (process.argv.includes('--report') && process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`);
}
if (failed.length) {
    console.error(`[ERROR] ${summary[0]}`);
    process.exit(1);
}
console.log(`[SUCCESS] ${summary[0]}`);
