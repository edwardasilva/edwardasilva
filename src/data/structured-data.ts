/**
 * src/data/structured-data.ts
 * Structured Data Builders
 *
 * Author: Edward Silva
 * Creation Date: 06 November, 2026
 * Last Update: 08 November, 2026
 *
 * Builds the schema.org objects the pages embed as JSON-LD for search results. The person's job,
 * employer, school, and topics come from resume-data.json.
 *
 * File Structure:
 * - pageSchema: the page and the person it belongs to
 * - websiteSchema: the site itself
 * - breadcrumbSchema: the path to the current page
 * - itemListSchema: directory pages
 *
 * Used in: src/components/Head.astro and the directory pages
 *
 * Usage:
 * $ `import { itemListSchema } from '../data/structured-data'` : Imported by pages
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import { asSentence, primaryEducation, resume } from './resume';

const { name, email, website, linkedin, github } = resume.personal;
const { jobTitle, worksFor, occupation, knowsAbout } = resume.site.person;
const [C_GIVEN_NAME, ...C_FAMILY_NAMES] = name.split(' ');

/**
 * @brief Builds the page and person schema shown on every page
 * @param page The page URL, title, description, and whether it is the home page
 * @param site Site origin
 * @return ProfilePage on the home page, otherwise WebPage
 */
export function pageSchema(
    page: { url: string; title: string; description: string; isHome: boolean },
    site: URL
) {
    return {
        '@context': 'https://schema.org',
        '@type': page.isHome ? 'ProfilePage' : 'WebPage',
        '@id': page.url,
        url: page.url,
        name: page.title,
        description: page.description,
        mainEntity: {
            '@type': 'Person',
            '@id': new URL('/#person', site).href,
            name,
            givenName: C_GIVEN_NAME,
            familyName: C_FAMILY_NAMES.join(' '),
            url: website,
            email: `mailto:${email}`,
            jobTitle,
            worksFor: {
                '@type': 'Organization',
                name: worksFor.name,
                sameAs: worksFor.url,
            },
            alumniOf: primaryEducation && {
                '@type': 'CollegeOrUniversity',
                name: primaryEducation.institution,
                sameAs: primaryEducation.wikipedia,
            },
            hasOccupation: {
                '@type': 'Occupation',
                name: jobTitle,
                description: asSentence(occupation),
                skills: resume.TopSkills.join(', '),
            },
            knowsAbout: [...knowsAbout, ...resume.TopSkills],
            description: resume.about.Highlights,
            sameAs: [linkedin, github, website],
        },
    };
}

/**
 * @brief Builds the schema for the site itself
 * @param site Site origin
 * @return WebSite schema
 */
export function websiteSchema(site: URL) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': new URL('/#website', site).href,
        name: `${name} Portfolio`,
        url: website,
    };
}

/**
 * @brief Builds the breadcrumb trail for a page
 * @param pathname Page path, with no trailing slash
 * @param site Site origin
 * @param title Page title, used for the last crumb
 * @return BreadcrumbList schema, or undefined on the home page
 */
export function breadcrumbSchema(pathname: string, site: URL, title: string) {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
        return undefined;
    }

    const crumbs = segments.map((segment, index) => ({
        name:
            index === segments.length - 1
                ? title
                : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        item: new URL(`/${segments.slice(0, index + 1).join('/')}`, site).href,
    }));

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [{ name: 'Home', item: new URL('/', site).href }, ...crumbs].map(
            (crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })
        ),
    };
}

/**
 * @brief Builds the schema for a directory page
 * @param listName Name of the directory
 * @param items Name and path of each listed item
 * @param site Site origin
 * @return ItemList schema
 */
export function itemListSchema(
    listName: string,
    items: { name: string; path: string }[],
    site: URL
) {
    return {
        '@type': 'ItemList',
        name: listName,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            url: new URL(item.path, site).href,
        })),
    };
}

/**
 * @brief Wraps a schema as a Starlight head tag
 * @param schema Schema object, without its context
 * @return Head tag for a page's frontmatter
 * @details The JSON sits inside a script tag, so "<" is escaped and no text can close it early.
 */
export function jsonLdHeadTag(schema: object) {
    return {
        tag: 'script' as const,
        attrs: { type: 'application/ld+json' },
        content: JSON.stringify({ '@context': 'https://schema.org', ...schema }).replace(
            /</g,
            '\\u003c'
        ),
    };
}
