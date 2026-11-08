/**
 * scripts/run-all.js
 * Run All Script
 *
 * Author: Edward Silva
 * Creation Date: 06 August, 2026
 * Last Update: 08 November, 2026
 *
 * Runs the full local pipeline in order and stops at the first failure: lint and format fixes,
 * then the production build. Can then start the dev server.
 *
 * File Structure:
 * - Global Constants: repository root, pipeline steps
 * - Functions: runStep
 * - Main Logic: pipeline, then the optional dev server
 *
 * Where this file is used within the repository:
 * - Invoked via npm run all
 *
 * Usage:
 * $ `npm run all` : Runs code clean/format, then the project build
 * $ `npm run all -- --dev` : Runs the same pipeline, then launches the local dev server
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_STEPS = ['npm run clean:code', 'npm run build'];

const C_START_DEV = process.argv.includes('--dev');

/**
 * @brief Runs a command in the repository root and exits if it fails
 * @param command Command line to run
 * @return Nothing
 */
function runStep(command) {
    console.log(`\n[RUN] ${command}`);

    const { status } = spawnSync(command, { cwd: ROOT_DIR, stdio: 'inherit', shell: true });

    if (status !== 0) {
        console.error(`\n[ERROR] Step failed: ${command} (exit code: ${status})`);
        process.exit(status || 1);
    }
}

C_STEPS.forEach(runStep);
console.log('\n[SUCCESS] All sync, lint, format, and build steps completed.');

if (C_START_DEV) {
    runStep('npm run dev');
}
