/**
 * src/pages/og/[kind]/[slug].png.ts
 * Open Graph Image Route
 *
 * Author: Edward Silva
 * Creation Date: 31 March, 2026
 * Last Update: 27 July, 2026
 *
 * Generates static Open Graph PNG images for project and experience detail pages.
 *
 * File Structure:
 * - Imports
 * - Static path generation
 * - API route image rendering
 *
 * Where this file is used within the repository:
 * - Dynamic OG image endpoint /og/projects/[slug].png and /og/experiences/[slug].png
 *
 * Usage:
 * $ `npm run build` : Built statically by Astro during build to output /og/[kind]/[slug].png preview images
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import {
    getPortfolioProjects,
    getProjectSlug,
    getExperienceSlug,
    getPublicExperiences,
} from '../../../data/resume';
import type { APIRoute } from 'astro';

/**
 * @brief Generates static parameters for all OG image variants
 * @return Array of route params and rendering props for projects and experiences
 * @details Pulls canonical slugs from shared resume data helpers used by dynamic routes.
 */
export async function getStaticPaths() {
    const projects = getPortfolioProjects();
    const experiences = getPublicExperiences();

    const paths = [
        ...projects.map((project) => ({
            params: { kind: 'projects', slug: getProjectSlug(project) },
            props: {
                type: 'Project',
                title: project.title,
                tags: (project.skills ?? []).slice(0, 4),
            },
        })),
        ...experiences.map((exp) => ({
            params: { kind: 'experiences', slug: getExperienceSlug(exp) },
            props: { type: 'Experience', title: exp.title, tags: [exp.company, exp.duration] },
        })),
    ];

    return paths;
}

// Carlito is metric-compatible with Calibri, matching the site's typography
const fontPath = path.resolve(
    './node_modules/@fontsource/carlito/files/carlito-latin-400-normal.woff'
);
const boldFontPath = path.resolve(
    './node_modules/@fontsource/carlito/files/carlito-latin-700-normal.woff'
);

let cachedFontData: Uint8Array | null = null;
let cachedBoldFontData: Uint8Array | null = null;

/**
 * @brief Retrieves cached regular Carlito font buffer
 * @return Promise resolving to font buffer Uint8Array
 * @details Reads from disk once and returns cached buffer on subsequent invocations
 */
async function getFontData(): Promise<Uint8Array> {
    if (!cachedFontData) {
        cachedFontData = await fs.readFile(fontPath);
    }
    return cachedFontData;
}

/**
 * @brief Retrieves cached bold Carlito font buffer
 * @return Promise resolving to bold font buffer Uint8Array
 * @details Reads from disk once and returns cached buffer on subsequent invocations
 */
async function getBoldFontData(): Promise<Uint8Array> {
    if (!cachedBoldFontData) {
        cachedBoldFontData = await fs.readFile(boldFontPath);
    }
    return cachedBoldFontData;
}

/**
 * @brief Serves the rendered OG PNG for a route slug
 * @param props Route props containing card type, title, and tag list
 * @return PNG response with long-lived cache headers
 * @details Uses satori for SVG generation and resvg for PNG rasterization.
 */
export const GET: APIRoute = async ({ props }) => {
    const { type, title, tags } = props as { type: string; title: string; tags: string[] };

    const [fontData, boldFontData] = await Promise.all([getFontData(), getBoldFontData()]);

    // Plain element objects rather than an HTML template: text is passed through as-is, so a title
    // such as "R&D" renders literally instead of as an escaped entity.
    const markup = {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '1200px',
                height: '630px',
                backgroundColor: '#f3f5f7',
                padding: '60px',
                justifyContent: 'space-between',
                fontFamily: 'Carlito',
                border: '30px solid #d8e0ea',
            },
            children: [
                {
                    type: 'div',
                    props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                            {
                                type: 'p',
                                props: {
                                    style: {
                                        fontSize: '34px',
                                        color: '#4c78a8',
                                        marginBottom: '20px',
                                    },
                                    children: `Edward Silva - ${type}`,
                                },
                            },
                            {
                                type: 'h1',
                                props: {
                                    style: {
                                        fontSize: '72px',
                                        fontWeight: 700,
                                        color: '#1f2937',
                                        margin: 0,
                                        lineHeight: 1.1,
                                    },
                                    children: title,
                                },
                            },
                        ],
                    },
                },
                {
                    type: 'p',
                    props: {
                        style: { fontSize: '30px', color: '#64748b', margin: 0 },
                        children: tags.join(', '),
                    },
                },
            ],
        },
    };

    const svg = await satori(markup as Parameters<typeof satori>[0], {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Carlito',
                data: fontData,
                weight: 400,
                style: 'normal',
            },
            {
                name: 'Carlito',
                data: boldFontData,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
    });
    const pngData = resvg.render().asPng();

    return new Response(pngData as unknown as BodyInit, {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
};
