/**
 * src/pages/og/[slug].png.ts
 * Share Images
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 08 November, 2026
 *
 * Renders 1200x630 share cards for the home page and every project page.
 *
 * File Structure:
 * - Fonts: static Source Serif 4, since Satori cannot read woff2
 * - getStaticPaths: home, projects, tools
 * - node: builds one element for Satori
 * - GET: lays out the card and rasterizes it
 *
 * The card is built from plain element objects, not an HTML string, so text such as R&D is drawn
 * as written instead of as an escaped entity.
 *
 * Where this file is used within the repository:
 * - Linked from src/components/Head.astro
 *
 * Usage:
 * $ `npm run dev` : Generates share images during a local build
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';
import satori from 'satori';
import { getPageSlug, getProjectPages } from '../../data/projects';
import { asSentence, resume } from '../../data/resume';

const C_WIDTH = 1200;
const C_HEIGHT = 630;
const C_FONT_DIR = path.resolve('node_modules/@fontsource/source-serif-4/files');

const C_FONTS = Promise.all(
    ([400, 600] as const).map(async (weight) => ({
        name: 'Source Serif 4',
        data: await fs.readFile(
            path.join(C_FONT_DIR, `source-serif-4-latin-${weight}-normal.woff`)
        ),
        weight,
        style: 'normal' as const,
    }))
);

/**
 * @brief Lists the card for the home page and every project page
 * @return Route params and card contents for Astro static path generation
 */
export async function getStaticPaths() {
    const pages = [...(await getProjectPages('project')), ...(await getProjectPages('personal'))];

    return [
        {
            params: { slug: 'home' },
            props: { title: resume.personal.name, line: resume.about.Highlights },
        },
        ...pages.map(({ entry, project }) => ({
            params: { slug: getPageSlug(entry.id) },
            props: { title: entry.data.title, line: project.dek ? asSentence(project.dek) : '' },
        })),
    ];
}

/**
 * @brief Builds one element in the shape Satori reads
 * @param type Tag name
 * @param style Inline style object
 * @param children Text or child elements
 * @return The element object
 */
function node(type: string, style: Record<string, string | number>, children: unknown) {
    return { type, props: { style, children } };
}

/**
 * @brief Renders the share image for a route
 * @param props Route props holding the card title and line
 * @return PNG response
 * @details Satori lays the card out as SVG and resvg rasterizes it.
 */
export const GET: APIRoute = async ({ props }) => {
    const { title, line } = props as { title: string; line: string };

    const markup = node(
        'div',
        {
            display: 'flex',
            flexDirection: 'column',
            width: C_WIDTH,
            height: C_HEIGHT,
            backgroundColor: '#fbfbfc',
            padding: 72,
            justifyContent: 'space-between',
            fontFamily: 'Source Serif 4',
        },
        [
            node(
                'p',
                { fontSize: 30, fontWeight: 400, color: '#a3201d', margin: 0 },
                resume.personal.name
            ),
            node('div', { display: 'flex', flexDirection: 'column' }, [
                node(
                    'h1',
                    {
                        fontSize: 76,
                        fontWeight: 600,
                        color: '#16233a',
                        margin: '0 0 24px',
                        lineHeight: 1.08,
                    },
                    title
                ),
                node(
                    'p',
                    {
                        fontSize: 32,
                        fontWeight: 400,
                        color: '#424d63',
                        margin: 0,
                        lineHeight: 1.35,
                    },
                    line
                ),
            ]),
        ]
    );

    const svg = await satori(markup as Parameters<typeof satori>[0], {
        width: C_WIDTH,
        height: C_HEIGHT,
        fonts: await C_FONTS,
    });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: C_WIDTH } }).render().asPng();

    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
