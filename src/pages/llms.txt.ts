/**
 * src/pages/llms.txt.ts
 * LLM Site Index
 *
 * Author: Edward Silva
 * Creation Date: 08 November, 2026
 * Last Update: 08 November, 2026
 *
 * Writes /llms.txt, a Markdown index of the site in the llmstxt.org format, so language models
 * and other crawlers can find each page and what it covers. It reads the same project pages and
 * resume data as the site, so it never goes stale.
 *
 * File Structure:
 * - C_SECTION_PAGES: the data pages, in sidebar order
 * - linkLine: one Markdown list item
 * - GET: builds the file at build time
 *
 * Where this file is used within the repository:
 * - Linked from src/components/Head.astro and public/robots.txt
 *
 * Usage:
 * $ `npm run build` : Writes dist/llms.txt
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import type { APIRoute } from 'astro';
import { getProjectPages } from '../data/projects';
import { getExperienceHref, hasAboutContent, resume, visibleExperiences } from '../data/resume';

const C_SECTION_PAGES = [
    ...(hasAboutContent
        ? [['About', '/about/', 'How I got from the jobs before engineering to embedded software.']]
        : []),
    ['Experience', '/experiences/', 'Current and past engineering roles, and organizations.'],
    [
        'Education',
        '/education/',
        'Degree, honors, certifications, and which classes fed which project.',
    ],
    ['Coursework', '/education/coursework/', 'Every course, with a short description of each.'],
    ['Skills', '/skills/', 'Each skill, with the projects and courses that back it.'],
    ['Resume', resume.personal.resumePdfUrl, 'The one-page PDF resume.'],
] as const;

/**
 * @brief Formats one page as a Markdown list item
 * @param title Link text
 * @param href Path or absolute URL
 * @param site Site origin for relative paths
 * @param note Short description after the link
 * @return The list item
 */
function linkLine(title: string, href: string, site: URL, note?: string): string {
    const url = new URL(href, site).href;

    return note ? `- [${title}](${url}): ${note}` : `- [${title}](${url})`;
}

/**
 * @brief Builds the llms.txt file
 * @param context Astro endpoint context, used for the site URL
 * @return Plain-text Markdown response
 */
export const GET: APIRoute = async ({ site }) => {
    const origin = site ?? new URL(resume.personal.website);
    const projectLines = async (kind: 'project' | 'personal') =>
        (await getProjectPages(kind)).map(({ entry, href }) =>
            linkLine(entry.data.title, href, origin, entry.data.description)
        );

    const lines = [
        `# ${resume.personal.name}`,
        '',
        `> ${resume.about.Highlights}.`,
        '',
        'Write-ups of school and personal engineering projects, with the equations, the measured results, who did which part, and the reports behind them.',
        '',
        '## Personal projects',
        '',
        ...(await projectLines('personal')),
        '',
        '## Academic projects',
        '',
        ...(await projectLines('project')),
        '',
        '## Experience',
        '',
        ...visibleExperiences.map((experience) =>
            linkLine(
                `${experience.title}, ${experience.company}`,
                `${getExperienceHref(experience)}/`,
                origin,
                experience.duration
            )
        ),
        '',
        '## Pages',
        '',
        ...C_SECTION_PAGES.flatMap(([title, href, note]) =>
            href ? [linkLine(title, href, origin, note)] : []
        ),
        '',
        '## Optional',
        '',
        linkLine('LinkedIn', resume.personal.linkedin, origin),
        linkLine('GitHub', resume.personal.github, origin),
        '',
    ];

    return new Response(lines.join('\n'), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
