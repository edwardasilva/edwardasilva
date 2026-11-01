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
 * @brief Compiles TeX files to PDF using pdflatex
 * @details Runs pdflatex twice for proper cross-references, then cleans auxiliary files.
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

    console.log(`Resume Directory: ${OUTPUT_DIR}`);
    console.log(`Output Directory: ${OUTPUT_DIR}`);

    const ALLOWED_TEX_FILES = new Set(['Edward_Silva_Resume.tex']);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    try {
        const files = fs
            .readdirSync(OUTPUT_DIR)
            .filter((f) => f.endsWith('.tex') && ALLOWED_TEX_FILES.has(f));

        console.log(`Found ${files.length} resume files to compile.`);

        // SOURCE_DATE_EPOCH pins pdflatex's embedded timestamps so the PDF is
        // byte-identical across rebuilds when the resume content is unchanged.
        const compileEnv = {
            ...process.env,
            SOURCE_DATE_EPOCH: '0',
            FORCE_SOURCE_DATE: '1',
        };

        for (const file of files) {
            for (const pass of [1, 2]) {
                console.log(`Step ${pass}: Compiling ${file}...`);
                try {
                    const cmd = `pdflatex -interaction=nonstopmode "${file}"`;
                    execSync(cmd, {
                        stdio: 'inherit',
                        cwd: OUTPUT_DIR,
                        env: compileEnv,
                    });
                    console.log(`Compiled ${file} successfully.`);
                } catch {
                    console.error(
                        `Failed to compile ${file}. It might have errors or missing dependencies.`
                    );
                }
            }
        }

        const C_CLEANUP_EXTENSIONS = ['.aux', '.log', '.out', '.toc'];
        if (fs.existsSync(OUTPUT_DIR)) {
            const generatedFiles = fs.readdirSync(OUTPUT_DIR);
            for (const file of generatedFiles) {
                if (C_CLEANUP_EXTENSIONS.some((ext) => file.endsWith(ext))) {
                    fs.unlinkSync(path.join(OUTPUT_DIR, file));
                }
            }
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.warn('Resume output directory not found. Skipping resume build.');
        } else {
            console.error('Error during resume build:', err);
            process.exit(1);
        }
    }
}

// Main execution
syncAssets();
regenerateTexFiles();
compileResumeToPdf();
console.log('Resume compilation complete.');
