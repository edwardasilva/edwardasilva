/**
 * astro.config.mjs
 * Astro Configuration
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 10 November, 2026
 *
 * Defines site, base path, the Markdown pipeline, and the Starlight integration that
 * supplies search, navigation, table of contents, dark mode, and the sitemap. Copies the PDF.js
 * viewer scripts into public/vendor when the dev server or build starts. The site's origin, title,
 * description, and the sidebar's role and project links come from information/resume-data.json.
 *
 * File Structure:
 * - Imports: Astro integrations and plugins
 * - Resume data: the site settings and the sidebar links read from resume-data.json
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

/**
 * @typedef {{ title: string, slug?: string, navLabel?: string, Visibility?: string }} SiteEntry
 * @typedef {SiteEntry & { kind?: 'project' | 'personal', order?: number, home?: string | false }} SiteProject
 * @typedef {object} SiteData The parts of resume-data.json this file reads
 * @property {{ name: string, website: string }} personal
 * @property {{ description: string, aboutPublished?: boolean }} site
 * @property {{ intro?: string[], chapters?: object[], future?: object[], earlyWork?: { roles?: object[], Summary?: string }, Visibility?: string }} [about]
 * @property {SiteEntry[]} experiences
 * @property {SiteProject[]} projects
 */
/** @type {SiteData} */
const C_RESUME = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, 'information/resume-data.json'), 'utf8')
);
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
 * @brief Checks whether a resume-data.json entry appears on the site
 * @param {{ Visibility?: string }} entry Experience or project
 * @return {boolean} True when Visibility is All or Site
 */
function isVisibleOnSite(entry) {
    return entry.Visibility === 'All' || entry.Visibility === 'Site';
}

/**
 * @brief Gets the sidebar label of an entry the site shows
 * @param {{ title: string, slug?: string, navLabel?: string }} entry Experience or project
 * @return {string} The entry's navLabel
 */
function navLabel(entry) {
    if (!entry.slug || !entry.navLabel) {
        throw new Error(
            `[ERROR] resume-data.json: ${entry.title} is on the site, so it needs a slug and a navLabel`
        );
    }

    return entry.navLabel;
}

/**
 * @brief Lists the sidebar links to the project pages in one home page group
 * @param {'selected' | 'writing' | 'more'} group Selected work, writing and tools, or more projects
 * @return {{ label: string, slug: string }[]} Links in the order resume-data.json gives
 * @details Matches getHomeProjectPages in src/data/projects.ts. A personal project without a home
 * field falls under writing, and a home value of false keeps a project out of every group.
 */
function projectLinks(group) {
    return C_RESUME.projects
        .filter((project) => {
            if (!isVisibleOnSite(project)) {
                return false;
            }

            if (project.home === undefined) {
                return group === 'writing' && project.kind === 'personal';
            }

            return project.home === group;
        })
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
        .map((project) => ({ label: navLabel(project), slug: `projects/${project.slug}` }));
}

/**
 * The about page is held back until the switch is on and the page has content: an intro, chapters,
 * a future list, early work roles, or an early work summary. hasAboutContent in src/data/resume.ts
 * is the twin of this rule, so change both together. This copy reads the raw JSON, so it does not
 * drop placeholder text, blank strings, or roles and chapters missing a title the way the twin does.
 */
const C_HAS_ABOUT = Boolean(
    C_RESUME.site?.aboutPublished &&
    isVisibleOnSite(C_RESUME.about ?? {}) &&
    (C_RESUME.about?.intro?.length ||
        C_RESUME.about?.chapters?.length ||
        C_RESUME.about?.future?.length ||
        C_RESUME.about?.earlyWork?.roles?.length ||
        C_RESUME.about?.earlyWork?.Summary)
);

const C_ROLE_LINKS = C_RESUME.experiences.filter(isVisibleOnSite).map((experience) => ({
    label: navLabel(experience),
    link: `/experiences/${experience.slug}/`,
}));
const C_DESCRIPTION = C_RESUME.site.description;

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
    site: process.env.ASTRO_SITE || C_RESUME.personal.website,
    output: 'static',
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
            title: C_RESUME.personal.name,
            description: /[.!?]$/.test(C_DESCRIPTION) ? C_DESCRIPTION : `${C_DESCRIPTION}.`,
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
                    tag: 'link',
                    attrs: { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '32x32',
                        href: '/favicon-32.png',
                        media: '(prefers-color-scheme: light)',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '16x16',
                        href: '/favicon-16.png',
                        media: '(prefers-color-scheme: light)',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '32x32',
                        href: '/favicon-dark-32.png',
                        media: '(prefers-color-scheme: dark)',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '16x16',
                        href: '/favicon-dark-16.png',
                        media: '(prefers-color-scheme: dark)',
                    },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon-180.png' },
                },
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
                    codePaddingBlock: '1.125rem',
                    codePaddingInline: '1.375rem',
                    frames: {
                        shadowColor: 'transparent',
                        frameBoxShadowCssValue: 'none',
                        editorTabBarBackground: 'var(--es-sunken)',
                        editorActiveTabBackground: 'var(--es-sunken)',
                        editorTabBarBorderBottomColor: 'var(--es-silver)',
                        editorActiveTabForeground: 'var(--es-ink-2)',
                        editorActiveTabIndicatorTopColor: 'transparent',
                        editorActiveTabIndicatorBottomColor: 'transparent',
                        editorTabBarBorderColor: 'transparent',
                        editorActiveTabBorderColor: 'transparent',
                        terminalTitlebarBackground: 'var(--es-sunken)',
                        terminalTitlebarForeground: 'var(--es-ink-2)',
                        terminalTitlebarBorderBottomColor: 'var(--es-silver)',
                        terminalTitlebarDotsOpacity: '0',
                        inlineButtonBackground: 'transparent',
                        inlineButtonForeground: 'var(--es-ink-2)',
                        inlineButtonBorder: 'transparent',
                        tooltipSuccessBackground: 'var(--es-ink)',
                        tooltipSuccessForeground: 'var(--es-paper)',
                    },
                },
            },
            // Every page except the home page is listed here. A group whose first link shares its
            // label opens with that page. The role and project links come from resume-data.json, in
            // its order, so a Visibility change there updates them. About appears once
            // site.aboutPublished is true and the story has text.
            sidebar: [
                ...(C_HAS_ABOUT ? [{ label: 'About', link: '/about/' }] : []),
                {
                    label: 'Projects',
                    items: [
                        { label: 'Projects', link: '/projects/' },
                        { label: 'Selected work', items: projectLinks('selected') },
                        { label: 'Writing and tools', items: projectLinks('writing') },
                        { label: 'More projects', items: projectLinks('more') },
                    ],
                },
                {
                    label: 'Experience',
                    items: [{ label: 'Experience', link: '/experiences/' }, ...C_ROLE_LINKS],
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
