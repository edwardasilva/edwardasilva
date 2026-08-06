/**
 * scripts/run-all.js
 * Comprehensive Maintenance and Build Script
 *
 * Author: Edward Silva
 * Creation Date: 06 August, 2026
 * Last Update: 06 August, 2026
 *
 * File Purpose:
 * Runs complete workflow in sequential order: AI config synchronization,
 * code linting and formatting fixes, project build (thumbnails, resume, Astro),
 * and optionally starts the dev server if --dev flag is provided.
 *
 * File Structure:
 * - Global Constants: ANSI color codes, root path
 * - Utility Functions: runStep, hasDevFlag
 * - Main Execution Flow: Sequential step execution
 *
 * Used in: Local development workflow
 * Invoked via: npm run all [--dev] or node scripts/run-all.js [--dev]
 *
 * Usage:
 * $ `npm run all` : Runs AI config sync, code clean/format, and project build sequentially
 * $ `npm run all --dev` : Runs full pipeline (sync, clean, build) and launches the local dev server
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import { spawnSync, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const PURPLE = '\x1b[35m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';

/**
 * @brief Executes a shell command synchronously and exits if it fails
 * @param command Command string or executable to run
 * @param args Array of argument strings
 * @return void
 * @details Uses stdio inherit to display output directly in terminal with color tags
 */
function runStep(command, args = []) {
    console.log(
        `\n${PURPLE}${BOLD}[RUN]${RESET} ${PURPLE}Running: ${command} ${args.join(' ')}${RESET}`
    );
    const result = spawnSync(command, args, {
        cwd: root,
        stdio: 'inherit',
        shell: true,
    });

    if (result.status !== 0) {
        console.error(
            `\n${RED}${BOLD}[ERROR]${RESET} ${RED}Step failed: ${command} ${args.join(' ')} (exit code: ${result.status})${RESET}`
        );
        process.exit(result.status || 1);
    }
}

/**
 * @brief Checks if --dev flag was passed to the process
 * @return boolean True if --dev flag is present
 * @details Scans process.argv and npm_config_argv environment variables
 */
function hasDevFlag() {
    const isDevInArgv = process.argv.some(
        (arg) =>
            arg === '--dev' ||
            arg === '-dev' ||
            arg === 'dev' ||
            arg === '--include=dev' ||
            arg.includes('dev')
    );

    const isDevInNpmEnv =
        process.env.npm_config_dev === 'true' ||
        process.env.npm_config_dev === '' ||
        process.env.npm_config_include === 'dev' ||
        Object.keys(process.env).some(
            (key) =>
                key.toLowerCase().includes('config') &&
                key.toLowerCase().includes('dev') &&
                process.env[key] !== 'false'
        );

    let isDevInNpmArgv = false;
    const npmConfigArgv = process.env.npm_config_argv;
    if (npmConfigArgv) {
        try {
            const parsed = JSON.parse(npmConfigArgv);
            if (parsed.original && parsed.original.some((arg) => arg.includes('dev'))) {
                isDevInNpmArgv = true;
            }
        } catch {
            // Ignore parse errors
        }
    }

    return isDevInArgv || isDevInNpmEnv || isDevInNpmArgv;
}

/**
 * @brief Main function executing all tasks in sequence
 * @return void
 * @details Runs sync:ai-configs, clean:code, build, and conditionally dev server
 */
function main() {
    const isDev = hasDevFlag();

    console.log(
        `${PURPLE}${BOLD}[PIPELINE]${RESET} ${PURPLE}Running complete repository pipeline...${RESET}`
    );

    // 1. Sync AI Configurations
    runStep('npm', ['run', 'sync:ai-configs']);

    // 2. Lint and Format Code
    runStep('npm', ['run', 'clean:code']);

    // 3. Build Project (thumbs, resume, Astro build)
    runStep('npm', ['run', 'build']);

    console.log(
        `\n${GREEN}${BOLD}[SUCCESS]${RESET} ${GREEN}All sync, lint, format, and build steps completed successfully.${RESET}`
    );

    // 4. Optionally launch Dev Server
    if (isDev) {
        console.log(
            `\n${PURPLE}${BOLD}[DEV]${RESET} ${PURPLE}Launching dev server (--dev flag detected)...${RESET}`
        );
        const devProcess = spawn('npm', ['run', 'dev'], {
            cwd: root,
            stdio: 'inherit',
            shell: true,
        });

        devProcess.on('exit', (code) => {
            process.exit(code || 0);
        });
    }
}

main();
