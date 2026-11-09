/**
 * scripts/sync-vale-style.js
 * Vale Style Sync
 *
 * Author: Edward Silva
 * Creation Date: 09 November, 2026
 * Last Update: 09 November, 2026
 *
 * Copies eeprep's Vale style, .github/vale/styles/Eeprep in the eeprep repo, into
 * .lint/vale/styles/Eeprep here, so the project pages are checked against the same plain-English
 * rules as eeprep.com. The eeprep repo is private, so CI cannot fetch the rules at run time and
 * the copy is committed instead. The rules are config files, which eeprep's MIT license covers.
 * Run this after a rule changes in eeprep, from a machine that has both repos checked out side by
 * side, or point EEPREP_DIR at the eeprep checkout.
 *
 * File Structure:
 * - C_SOURCE, C_TARGET: the eeprep style folder and the copy here
 * - listRules: the .yml files in one folder, sorted
 * - main: copies the rules, or compares them with --check
 *
 * Where this file is used within the repository:
 * - npm run prose:sync copies the rules and npm run prose:sync -- --check reports drift
 * - .lint/vale/.vale.ini reads the copy through StylesPath
 *
 * Usage:
 * $ `npm run prose:sync` : Replaces .lint/vale/styles/Eeprep with eeprep's rules
 * $ `npm run prose:sync -- --check` : Exits 1 if the copy differs from eeprep's rules
 * $ `EEPREP_DIR=/path/to/eeprep npm run prose:sync` : Reads eeprep from another folder
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_EEPREP_DIR = path.resolve(ROOT_DIR, process.env.EEPREP_DIR ?? '../eeprep');
const C_SOURCE = path.join(C_EEPREP_DIR, '.github', 'vale', 'styles', 'Eeprep');
const C_TARGET = path.join(ROOT_DIR, '.lint', 'vale', 'styles', 'Eeprep');
const C_CHECK = process.argv.includes('--check');

/**
 * Lists the rule files in one style folder.
 * @param {string} dir Folder to read.
 * @returns {string[]} Sorted .yml file names, or an empty list when the folder is missing.
 */
function listRules(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('.yml'))
        .sort();
}

if (!fs.existsSync(C_SOURCE)) {
    console.error(`[ERROR] eeprep's Vale style was not found at ${C_SOURCE}.`);
    console.error('[ERROR] Check out edwardasilva/eeprep next to this repo, or set EEPREP_DIR.');
    process.exit(1);
}

const sourceRules = listRules(C_SOURCE);
const targetRules = listRules(C_TARGET);

if (sourceRules.length === 0) {
    console.error(`[ERROR] No .yml rules in ${C_SOURCE}.`);
    process.exit(1);
}

if (C_CHECK) {
    const drift = [];
    for (const name of new Set([...sourceRules, ...targetRules])) {
        const sourceFile = path.join(C_SOURCE, name);
        const targetFile = path.join(C_TARGET, name);
        if (!fs.existsSync(sourceFile)) {
            drift.push(`${name} is not in eeprep any more`);
        } else if (!fs.existsSync(targetFile)) {
            drift.push(`${name} is missing here`);
        } else if (!fs.readFileSync(sourceFile).equals(fs.readFileSync(targetFile))) {
            drift.push(`${name} differs`);
        }
    }
    if (drift.length > 0) {
        for (const line of drift) console.error(`[ERROR] ${line}`);
        console.error('[ERROR] Run npm run prose:sync to update the copy.');
        process.exit(1);
    }
    console.log(`[SUCCESS] ${sourceRules.length} Vale rules match eeprep.`);
    process.exit(0);
}

console.log(`[RUN] Copying ${sourceRules.length} Vale rules from ${C_SOURCE}`);
fs.rmSync(C_TARGET, { recursive: true, force: true });
fs.mkdirSync(C_TARGET, { recursive: true });
for (const name of sourceRules) {
    fs.copyFileSync(path.join(C_SOURCE, name), path.join(C_TARGET, name));
}
console.log(`[SUCCESS] Wrote ${C_TARGET}`);
