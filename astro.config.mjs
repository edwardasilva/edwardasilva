/**
 * astro.config.mjs
 * Astro Configuration
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 13 October, 2026
 *
 * Defines site, base path, output mode, redirects, and integrations for the Astro portfolio.
 * Copies the PDF.js viewer scripts into public/vendor when the dev server or build starts.
 *
 * File Structure:
 * - Imports: Astro integrations and plugins
 * - Config Export: defineConfig call with environment-aware options
 *
 * Where this file is used within the repository:
 * - Used by Astro build/dev commands (package.json scripts)
 *
 * Usage:
 * $ `npm run dev` : Runs local Astro development server
 * $ `npm run build` : Builds static site into dist/
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * @brief Copies the PDF.js browser build into public/vendor
 * @return {void}
 * @details The resume viewer loads these files directly. Vite must not rewrite
 * the worker, or the document never paints.
 */
function copyPdfViewerAssets() {
    const sourceDir = path.join(ROOT_DIR, 'node_modules', 'pdfjs-dist', 'build');
    const destDir = path.join(ROOT_DIR, 'public', 'vendor');
    const fileNames = ['pdf.min.mjs', 'pdf.worker.min.mjs'];

    fs.mkdirSync(destDir, { recursive: true });

    for (const fileName of fileNames) {
        fs.copyFileSync(path.join(sourceDir, fileName), path.join(destDir, fileName));
    }
}

/**
 * @brief Vite plugin that refreshes the PDF.js viewer assets
 * @return {import('vite').Plugin} Plugin that copies assets at build start
 */
function pdfViewerAssets() {
    return {
        name: 'pdf-viewer-assets',
        buildStart() {
            copyPdfViewerAssets();
        },
    };
}

export default defineConfig({
    // Set ASTRO_SITE and ASTRO_BASE env vars for GitHub Pages if needed
    site: process.env.ASTRO_SITE || 'https://edwardasilva.com',
    base:
        process.env.ASTRO_BASE && process.env.ASTRO_BASE !== '/'
            ? process.env.ASTRO_BASE
            : undefined,
    output: 'static',
    // Legacy routes that used to exist as standalone redirect pages
    redirects: {
        '/experience': '/experiences',
        '/classes': '/education',
        '/coursework': '/education',
        '/portfolio': '/projects',
        '/profile': '/',
        '/resume/viewer.html': '/resume/viewer',
    },
    vite: {
        plugins: [tailwindcss(), pdfViewerAssets()],
    },
    integrations: [sitemap()],
});
