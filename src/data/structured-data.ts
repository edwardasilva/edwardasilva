/**
 * src/data/structured-data.ts
 * Structured Data Builders
 *
 * Author: Edward Silva
 * Creation Date: 06 November, 2026
 * Last Update: 16 November, 2026
 *
 * Builds the schema.org objects the pages embed as JSON-LD for search results. The person's job,
 * employer, school, and topics come from resume-data.json.
 *
 * File Structure:
 * - personSchema: the person the site belongs to, shared by every page
 * - pageSchema: the page, the person, and on a project page the write-up, as one graph
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
 */

import { asSentence, primaryEducation, resume } from './resume';

const { name, email, website, linkedin, github } = resume.personal;
const { jobTitle, worksFor, occupation, knowsAbout } = resume.site.person;
const [C_GIVEN_NAME, ...C_FAMILY_NAMES] = name.split(' ');

/** Path segments that have no page of their own, so no crumb may link to them. */
const C_NO_PAGE = new Set(['resume']);

/**
 * @brief Builds the person the site belongs to
 * @param site Site origin
 * @return Person schema, with the job, school, topics, and profiles from resume-data.json
 */
function personSchema(site: URL) {
    return {
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
        description: asSentence(resume.about.Highlights),
        sameAs: [linkedin, github],
    };
}

/**
 * @brief Builds the structured data for one page
 * @param page The page URL, title, and description, whether it is the home page, and, on a project
 * page, the project's share image and skills
 * @param site Site origin
 * @return A graph of the page, the person, and on a project page the write-up as a TechArticle.
 * The home page is the person's ProfilePage. Every other page is a WebPage by the person.
 */
export function pageSchema(
    page: {
        url: string;
        title: string;
        description: string;
        isHome: boolean;
        article?: { image: string; keywords: string[] };
    },
    site: URL
) {
    const person = { '@id': new URL('/#person', site).href };
    const website = { '@id': new URL('/#website', site).href };
    const articleId = `${page.url}#article`;
    const graph: object[] = [
        {
            '@type': page.isHome ? 'ProfilePage' : 'WebPage',
            '@id': page.url,
            url: page.url,
            name: page.title,
            description: page.description,
            inLanguage: 'en',
            isPartOf: website,
            ...(page.isHome
                ? { mainEntity: person }
                : { author: person, ...(page.article && { mainEntity: { '@id': articleId } }) }),
        },
        personSchema(site),
    ];

    if (page.article) {
        graph.push({
            '@type': 'TechArticle',
            '@id': articleId,
            headline: page.title,
            description: page.description,
            url: page.url,
            image: page.article.image,
            inLanguage: 'en',
            author: person,
            isPartOf: website,
            mainEntityOfPage: { '@id': page.url },
            ...(page.article.keywords.length > 0 && { keywords: page.article.keywords.join(', ') }),
        });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
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
        description: asSentence(resume.site.description),
        inLanguage: 'en',
        publisher: { '@id': new URL('/#person', site).href },
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

    const crumbs = segments
        .map((segment, index) => ({ segment, index }))
        .filter(({ segment, index }) => index === segments.length - 1 || !C_NO_PAGE.has(segment))
        .map(({ segment, index }) => ({
            name:
                index === segments.length - 1
                    ? title
                    : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
            item: new URL(`/${segments.slice(0, index + 1).join('/')}/`, site).href,
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
