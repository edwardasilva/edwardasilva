/**
 * src/data/projects.ts
 * Project Pages
 *
 * Author: Edward Silva
 * Creation Date: 07 November, 2026
 * Last Update: 08 November, 2026
 *
 * Pairs each project in resume-data.json with its write-up in the docs collection. The kind, the
 * order, and the card fields come from resume-data.json. The write-up holds the page title,
 * description, and body.
 *
 * File Structure:
 * - getPageSlug: the last part of a page id
 * - getPageProject: the resume-data.json entry behind a write-up
 * - getProjectPages: listed pages grouped by kind, in order
 * - getHomeProjectPages: the projects shown in each group on the home page
 * - getDisplayTitle: a project's page title, in sentence case, for links
 *
 * Where this file is used within the repository:
 * - src/pages/index.astro, src/pages/projects.astro, src/pages/llms.txt.ts, src/pages/og/
 * - src/components/Head.astro, PageTitle.astro, ProjectFacts.astro, and ProjectCards.astro
 *
 * Usage:
 * $ `npm run dev` : Runs at build time
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import { getProjectSlug, resume, visibleProjects } from './resume';
import type { HomeGroup, Project, ProjectKind } from './types';

export interface ProjectPage {
    entry: CollectionEntry<'docs'>;
    project: Project;
    href: string;
}

const C_DOCS = await getCollection('docs');

/**
 * @brief Gets the slug a project page shares with resume-data.json
 * @param id Page id such as projects/EKF-project
 * @return Last path segment
 */
export function getPageSlug(id: string): string {
    return id.split('/').at(-1) ?? id;
}

/**
 * @brief Finds the resume-data.json entry behind a project write-up
 * @param id Page id
 * @return The project, or undefined when the page is not a project write-up
 * @details Every write-up under projects/ needs an entry, so its facts have one source.
 */
export function getPageProject(id: string): Project | undefined {
    if (!id.startsWith('projects/')) {
        return undefined;
    }

    const slug = getPageSlug(id);
    const project = resume.projects.find((candidate) => getProjectSlug(candidate) === slug);

    if (!project) {
        throw new Error(`[ERROR] ${id} is published, but resume-data.json has no project ${slug}`);
    }

    if (project.Visibility === 'Hide') {
        throw new Error(`[ERROR] ${id} is published, but resume-data.json marks ${slug} as Hide`);
    }

    return project;
}

/**
 * @brief Lists the project pages of one kind
 * @param kind Project or personal project
 * @return Visible projects of that kind, sorted by their order field, each with its write-up
 */
export async function getProjectPages(kind: ProjectKind): Promise<ProjectPage[]> {
    return visibleProjects
        .filter((project) => project.kind === kind)
        .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
        .map(toProjectPage);
}

/**
 * @brief Pairs a project with its write-up
 * @param project Visible project
 * @return The project page, or a build error when the write-up is missing
 */
function toProjectPage(project: Project): ProjectPage {
    const slug = getProjectSlug(project);
    const entry = C_DOCS.find((candidate) => candidate.id === `projects/${slug}`);

    if (!entry) {
        throw new Error(
            `[ERROR] resume-data.json lists ${slug}, but src/content/docs/projects/${slug}.mdx does not exist`
        );
    }

    return { entry, project, href: `/projects/${slug}/` };
}

const C_HOME_FALLBACK: Record<string, HomeGroup | false> = {
    'EKF-project': 'selected',
    'dsp-final': 'selected',
    'capstone-project': 'selected',
    'MCD-project': 'more',
    'seed-robot': 'more',
    'ram-pump': 'more',
};

const C_HOME_FALLBACK_ORDER = Object.keys(C_HOME_FALLBACK);

/**
 * @brief Lists the projects for one group on the home page
 * @param group Selected work, writing and tools, or more projects
 * @return Pages in home order
 * @details Reads the home field in resume-data.json. While no project has that field, a slug
 * list stands in for it. Personal projects without the field fall under writing, and projects
 * with the field set to false stay off the home page.
 */
export function getHomeProjectPages(group: HomeGroup): ProjectPage[] {
    const hasHomeField = visibleProjects.some((project) => project.home !== undefined);

    return visibleProjects
        .filter((project) => {
            const assigned = hasHomeField ? project.home : C_HOME_FALLBACK[getProjectSlug(project)];

            if (assigned === undefined) {
                return group === 'writing' && project.kind === 'personal';
            }

            return assigned === group;
        })
        .sort((left, right) => {
            if (hasHomeField || left.kind === 'personal') {
                return (left.order ?? 0) - (right.order ?? 0);
            }

            return (
                C_HOME_FALLBACK_ORDER.indexOf(getProjectSlug(left)) -
                C_HOME_FALLBACK_ORDER.indexOf(getProjectSlug(right))
            );
        })
        .map(toProjectPage);
}

const C_PAGE_TITLES = new Map(
    C_DOCS.map((entry) => [`/projects/${getPageSlug(entry.id)}`, entry.data.title])
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
