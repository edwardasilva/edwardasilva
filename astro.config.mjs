/**
 * astro.config.mjs
 * Astro Configuration
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 08 November, 2026
 *
 * Defines site, base path, redirects, the Markdown pipeline, and the Starlight integration that
 * supplies search, navigation, table of contents, dark mode, and the sitemap. Copies the PDF.js
 * viewer scripts into public/vendor when the dev server or build starts.
 *
 * File Structure:
 * - Imports: Astro integrations and plugins
 * - PDF viewer asset copy: the plugin behind /resume/viewer
 * - Dev assets: serves /assets from src/assets in the dev server
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
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeExternalLinks from './src/plugins/rehype-external-links.js';

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const C_DEFAULT_SITE = 'https://edwardasilva.com';
/** @type {Record<string, string>} */
const C_ASSET_TYPES = {
    '.jpg': 'image/jpeg',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
};

const C_LIGHT_CODE_THEME = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'src/styles/ec-light.json'), 'utf8')
);
const C_DARK_CODE_THEME = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'src/styles/ec-dark.json'), 'utf8')
);

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
        /**
         * @brief Copies the viewer scripts when the build or dev server starts
         * @return {void}
         */
        buildStart() {
            copyPdfViewerAssets();
        },
    };
}

/**
 * @brief Vite plugin that serves /assets straight from src/assets in the dev server
 * @return {import('vite').Plugin} Plugin that adds the dev middleware
 * @details The build copies src/assets into public/assets by deleting and recreating it, which a
 * running dev server does not recover from, and a fresh clone has no copy at all. Production still
 * serves the copy.
 */
function devAssets() {
    const assetDir = path.join(ROOT_DIR, 'src', 'assets');

    return {
        name: 'dev-assets',
        /**
         * @brief Adds the /assets middleware to the dev server
         * @param server Vite dev server
         * @return {void}
         */
        configureServer(server) {
            server.middlewares.use('/assets', (request, response, next) => {
                const relative = decodeURIComponent((request.url ?? '').split('?')[0]);
                const file = path.join(assetDir, relative);
                const type = C_ASSET_TYPES[path.extname(file).toLowerCase()];
                const inside = file.startsWith(`${assetDir}${path.sep}`);

                if (!inside || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
                    next();
                    return;
                }

                response.setHeader('Content-Type', type ?? 'application/octet-stream');
                fs.createReadStream(file).pipe(response);
            });
        },
    };
}

export default defineConfig({
    // The site serves from the domain root. ASTRO_SITE overrides the canonical origin if needed.
    site: process.env.ASTRO_SITE || C_DEFAULT_SITE,
    output: 'static',
    // Legacy routes that used to exist as standalone pages
    redirects: {
        '/experience': '/experiences',
        '/classes': '/education/coursework',
        '/coursework': '/education/coursework',
        '/portfolio': '/projects',
        '/profile': '/',
        '/resume/viewer.html': '/resume/viewer',
    },
    vite: {
        plugins: [pdfViewerAssets(), devAssets()],
    },
    markdown: {
        processor: unified({
            gfm: true,
            smartypants: false,
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex, rehypeExternalLinks],
        }),
    },
    integrations: [
        starlight({
            title: 'Edward Silva',
            description:
                'Engineering write-ups by Edward Silva: control, state estimation, and signal processing, with the reports behind them.',
            credits: false,
            favicon: '/favicon.svg',
            customCss: [
                './src/styles/fonts.css',
                './src/styles/theme.css',
                './src/styles/site.css',
                'katex/dist/katex.min.css',
            ],
            head: [
                {
                    tag: 'meta',
                    attrs: {
                        name: 'theme-color',
                        content: '#fbfbfc',
                        media: '(prefers-color-scheme: light)',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'theme-color',
                        content: '#0d1524',
                        media: '(prefers-color-scheme: dark)',
                    },
                },
            ],
            components: {
                Head: './src/components/Head.astro',
                Header: './src/components/Header.astro',
                Footer: './src/components/Footer.astro',
                Sidebar: './src/components/Sidebar.astro',
                ThemeSelect: './src/components/ThemeSelect.astro',
                SiteTitle: './src/components/SiteTitle.astro',
                PageTitle: './src/components/PageTitle.astro',
                PageFrame: './src/components/PageFrame.astro',
            },
            expressiveCode: {
                themes: [C_DARK_CODE_THEME, C_LIGHT_CODE_THEME],
                useStarlightDarkModeSwitch: true,
                minSyntaxHighlightingColorContrast: 0,
                defaultProps: { frame: 'code' },
                styleOverrides: {
                    borderRadius: 'calc(var(--es-radius) - 1px)',
                    borderColor: 'var(--es-silver)',
                    borderWidth: '1px',
                    codeBackground: 'var(--es-sunken)',
                    codeForeground: 'var(--es-ink)',
                    codeFontFamily: 'var(--es-font-mono)',
                    codeFontSize: '0.875rem',
                    codeLineHeight: '1.75',
                    uiFontFamily: 'var(--es-font-serif)',
                    uiFontSize: '0.8125rem',
                    uiFontWeight: '400',
                },
            },
            // Every page except the home page is listed here. A group whose first link shares its
            // label opens with that page. Add /about/ when the page is published.
            sidebar: [
                {
                    label: 'Projects',
                    items: [
                        { label: 'Projects', link: '/projects/' },
                        { label: 'Gantry crane control', slug: 'projects/MCD-project' },
                        { label: 'Damper state estimation', slug: 'projects/EKF-project' },
                        { label: 'Pitch tracking', slug: 'projects/dsp-final' },
                        { label: 'EMBR damper', slug: 'projects/capstone-project' },
                        { label: 'Maze robot', slug: 'projects/seed-robot' },
                        { label: 'Ram pump', slug: 'projects/ram-pump' },
                        {
                            label: 'Personal projects',
                            items: [
                                { label: 'eeprep', slug: 'projects/eeprep' },
                                { label: 'resume-generator', slug: 'projects/resume-generator' },
                                { label: 'Solar tracker', slug: 'projects/solar-tracker' },
                            ],
                        },
                    ],
                },
                {
                    label: 'Experience',
                    items: [
                        { label: 'Experience', link: '/experiences/' },
                        { label: 'SpaceX', link: '/experiences/SpaceX-swe/' },
                        { label: 'Kratos', link: '/experiences/Kratos-swe/' },
                        { label: 'Jordan and Skala', link: '/experiences/jse-coop/' },
                        { label: 'ePower lab', link: '/experiences/ugrad-research/' },
                    ],
                },
                {
                    label: 'Education',
                    items: [
                        { label: 'Education', link: '/education/' },
                        { label: 'Coursework', link: '/education/coursework/' },
                    ],
                },
                { label: 'Skills', link: '/skills/' },
                { label: 'Resume', link: '/resume/viewer/' },
            ],
        }),
    ],
});
