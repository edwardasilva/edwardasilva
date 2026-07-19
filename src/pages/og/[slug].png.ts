/**
 * src/pages/og/[slug].png.ts
 * Open Graph Image Route
 *
 * Author: Edward Silva
 * Creation Date: 31 March, 2026
 * Last Update: 18 July, 2026
 *
 * Generates static Open Graph PNG images for project and experience detail pages.
 *
 * File Structure:
 * - Imports
 * - Static path generation
 * - API route image rendering
 *
 * Where this file is used within the repository:
 * - Dynamic OG image endpoint /og/[slug].png
 *
 * Licence/Copyright: Licensed under MIT License
 */

import { html } from 'satori-html';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import {
    getPortfolioProjects,
    getProjectSlug,
    getExperienceSlug,
    getPublicExperiences,
} from '../../data/resume';
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
            params: { slug: getProjectSlug(project) },
            props: {
                type: 'Project',
                title: project.title,
                tags: project.technologies.slice(0, 4),
            },
        })),
        ...experiences.map((exp) => ({
            params: { slug: getExperienceSlug(exp) },
            props: { type: 'Experience', title: exp.title, tags: [exp.company, exp.duration] },
        })),
    ];

    return paths;
}

/**
 * @brief Serves the rendered OG PNG for a route slug
 * @param props Route props containing card type, title, and tag list
 * @return PNG response with long-lived cache headers
 * @details Uses satori for SVG generation and resvg for PNG rasterization.
 */
export const GET: APIRoute = async ({ props }) => {
    const { type, title, tags } = props as { type: string; title: string; tags: string[] };

    // Carlito is metric-compatible with Calibri, matching the site's typography
    const fontPath = path.resolve(
        './node_modules/@fontsource/carlito/files/carlito-latin-400-normal.woff'
    );
    const fontData = await fs.readFile(fontPath);

    const boldFontPath = path.resolve(
        './node_modules/@fontsource/carlito/files/carlito-latin-700-normal.woff'
    );
    const boldFontData = await fs.readFile(boldFontPath);

    const markup = html`
        <div
            style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #f3f5f7; padding: 60px; justify-content: space-between; font-family: 'Carlito'; border: 30px solid #d8e0ea;"
        >
            <div style="display: flex; flex-direction: column;">
                <p style="font-size: 34px; color: #4c78a8; margin-bottom: 20px;">
                    Edward Silva - ${type}
                </p>
                <h1
                    style="font-size: 72px; font-weight: 700; color: #1f2937; margin: 0; line-height: 1.1;"
                >
                    ${title}
                </h1>
            </div>
            <p style="font-size: 30px; color: #64748b; margin: 0;">${tags.join(', ')}</p>
        </div>
    `;

    const svg = await satori(markup, {
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
