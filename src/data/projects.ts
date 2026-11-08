/**
 * src/data/projects.ts
 * Project Pages
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 07 November, 2026
 *
 * Reads the project pages from the docs collection, in reading order, for the index and home page,
 * and gives other pages each project's sentence-case title.
 *
 * File Structure:
 * - getProjectPages: pages grouped by kind
 * - getPageSlug: the last part of a page id
 * - getDisplayTitle: a project's page title, in sentence case, for links
 *
 * Where this file is used within the repository:
 * - src/pages/index.astro and src/pages/projects.astro
 *
 * Usage:
 * $ `npm run dev` : Runs at build time
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type ProjectPage = CollectionEntry<'docs'>;

/**
 * @brief Gets the slug a project page shares with resume-data.json
 * @param id Page id such as projects/EKF-project
 * @return Last path segment
 */
export function getPageSlug(id: string): string {
    return id.split('/').at(-1) ?? id;
}

/**
 * @brief Lists the project pages of one kind
 * @param kind Project or personal project
 * @return Pages sorted by their order field
 */
export async function getProjectPages(
    kind: NonNullable<ProjectPage['data']['kind']>
): Promise<ProjectPage[]> {
    const pages = await getCollection('docs', (entry) => entry.data.kind === kind);

    return pages.sort((left, right) => (left.data.order ?? 0) - (right.data.order ?? 0));
}

const C_PAGE_TITLES = new Map(
    (await getCollection('docs')).map((entry) => [
        `/projects/${getPageSlug(entry.id)}`,
        entry.data.title,
    ])
);

/**
 * @brief Gets the title to show when linking to a project
 * @param href Link to the project
 * @param fallback Label to use when the link is not a project page
 * @return The page title, or the fallback
 */
export function getDisplayTitle(href: string, fallback: string): string {
    return C_PAGE_TITLES.get(href) ?? fallback;
}
