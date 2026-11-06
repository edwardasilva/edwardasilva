/**
 * scripts/build-resume.js
 * Build Resume Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 21 April, 2026
 *
 * Builds the resume PDF by generating TeX files and compiling them with pdflatex.
 * Syncs assets from src/assets to public/assets and manages resume compilation.
 *
 * File Structure:
 * - Global Constants: ROOT_DIR, OUTPUT_DIR, GENERATE_SCRIPT, ASSET directories
 * - Main Logic: Asset synchronization, TeX file compilation, cleanup
 *
 * Used in: GitHub Actions workflow, local development builds
 * Invoked via: npm run build:resume or build script
 *
 * Usage:
 * $ `npm run build:resume` : Compiles TeX resume files into Edward_Silva_Resume.pdf and syncs assets
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'resume');
const GENERATE_SCRIPT = path.join(ROOT_DIR, 'scripts', 'generate-resume.js');
const ASSET_SOURCE_DIR = path.join(ROOT_DIR, 'src', 'assets');
const ASSET_OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'assets');
const TEX_FILE = 'Edward_Silva_Resume.tex';

/**
 * @brief Syncs assets from source to public directory
 * @details Creates public/assets directory and recursively copies all files from src/assets
 */
function syncAssets() {
    if (fs.existsSync(ASSET_SOURCE_DIR)) {
        console.log(`Syncing assets from ${ASSET_SOURCE_DIR} to ${ASSET_OUTPUT_DIR}...`);
        fs.rmSync(ASSET_OUTPUT_DIR, { recursive: true, force: true });
        fs.mkdirSync(path.dirname(ASSET_OUTPUT_DIR), { recursive: true });
        fs.cpSync(ASSET_SOURCE_DIR, ASSET_OUTPUT_DIR, { recursive: true, force: true });
    } else {
        console.log(`No src/assets directory found at ${ASSET_SOURCE_DIR}; skipping asset sync.`);
    }
}

/**
 * @brief Regenerates TeX files from resume data
 * @details Invokes generate-resume.js to convert JSON data to TeX format
 */
function regenerateTexFiles() {
    if (process.env.SKIP_RESUME_GENERATE !== '1') {
        console.log('\nRegenerating TeX from resume-data.json...\n');
        execSync(`node "${GENERATE_SCRIPT}"`, { stdio: 'inherit', cwd: ROOT_DIR });
    }
}

/**
 * @brief Compiles the generated TeX file to PDF using pdflatex
 * @details Runs pdflatex twice for proper cross-references, then cleans auxiliary files.
 * Exits non-zero when pdflatex fails, so a stale PDF is never committed as current.
 * Skips PDF compilation entirely when SKIP_RESUME_PDF_BUILD=1.
 */
function compileResumeToPdf() {
    if (process.env.SKIP_RESUME_PDF_BUILD === '1') {
        console.log('Skipping resume PDF compilation in this environment.');
        return;
    }

    try {
        execSync('pdflatex --version', { stdio: 'ignore' });
    } catch {
        console.error(
            'pdflatex not found on PATH. Install MiKTeX/TeX Live (or open a new terminal to pick up PATH changes), or set SKIP_RESUME_PDF_BUILD=1 to skip.'
        );
        process.exit(1);
    }

    if (!fs.existsSync(path.join(OUTPUT_DIR, TEX_FILE))) {
        console.error(`${TEX_FILE} not found in ${OUTPUT_DIR}. Run without SKIP_RESUME_GENERATE.`);
        process.exit(1);
    }

    // SOURCE_DATE_EPOCH pins pdflatex's embedded timestamps so the PDF is
    // byte-identical across rebuilds when the resume content is unchanged.
    const compileEnv = {
        ...process.env,
        SOURCE_DATE_EPOCH: '0',
        FORCE_SOURCE_DATE: '1',
    };

    for (const pass of [1, 2]) {
        console.log(`Step ${pass}: Compiling ${TEX_FILE}...`);
        try {
            execSync(`pdflatex -interaction=nonstopmode "${TEX_FILE}"`, {
                stdio: 'inherit',
                cwd: OUTPUT_DIR,
                env: compileEnv,
            });
        } catch {
            // Auxiliary files, including the .log, are left in place so the error can be read.
            console.error(
                `Failed to compile ${TEX_FILE}. See the .log next to it in ${OUTPUT_DIR}.`
            );
            process.exit(1);
        }
    }
    console.log(`Compiled ${TEX_FILE} successfully.`);

    for (const file of fs.readdirSync(OUTPUT_DIR)) {
        if (['.aux', '.log', '.out', '.toc'].some((ext) => file.endsWith(ext))) {
            fs.unlinkSync(path.join(OUTPUT_DIR, file));
        }
    }
}

// Main execution
syncAssets();
regenerateTexFiles();
compileResumeToPdf();
console.log('Resume compilation complete.');
