/**
 * src/data/resume.ts
 * Resume Data Module
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 10 November, 2026
 *
 * Reads information/resume-data.json once, cleans it for the site, and exports what the pages render.
 * That file is the only source of the site's data, including the site-only fields and the site
 * block. Anything hidden, unfilled, or pointing at a missing file is dropped here, so pages and
 * components can use the exports without checking them again.
 *
 * File Structure:
 * - Constants: display values and patterns
 * - Normalizers: placeholder, visibility, and proof filtering
 * - Exports: resume, the visible lists, slugs, links, and the skills index
 * - Organizations: memberships listed on the experience page
 *
 * Used in: All components, pages, and routes that need resume data
 *
 * Usage:
 * $ `import { resume } from './data/resume'` : Imported by pages and components
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import rawResumeData from '../../information/resume-data.json';
import type {
    About,
    AboutChapter,
    AboutRole,
    Certification,
    Course,
    Education,
    Experience,
    Organization,
    Project,
    ProjectLink,
    Proof,
    ResumeData,
    Site,
    SkillEntry,
    SkillReference,
    VisibilityScope,
    WorkEntry,
} from './types';

const C_SITE_COURSE_PREFIXES = new Set(['CSCI', 'EENG']);
const C_PLACEHOLDER_PATTERN = /\[INSERT[^\]]*\]/i;
const C_DATE_WORD =
    '(?:\\d{4}|Present|January|February|March|April|May|June|July|August|September|October|November|December|Spring|Summer|Fall|Winter)';
const C_RANGE_HYPHEN_PATTERN = new RegExp(`(${C_DATE_WORD}) - (?=${C_DATE_WORD}\\b)`, 'g');

// Every file under src/assets, keyed by the /assets/ URL it is served from. Lazy glob, so
// nothing is bundled. It only answers whether a referenced file is in the repo.
const C_AVAILABLE_ASSETS = new Set(
    Object.keys(import.meta.glob('../assets/**/*')).map((assetPath) =>
        assetPath.replace(/^\.\.\/assets\//, '/assets/')
    )
);

/**
 * @brief Returns text only when it holds real content
 * @param value Text to evaluate
 * @return Trimmed text, or undefined when empty or still an [INSERT ...] placeholder
 */
function filledText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed && !C_PLACEHOLDER_PATTERN.test(trimmed) ? trimmed : undefined;
}

/**
 * @brief Joins a date range with an unspaced en dash
 * @param value Text such as July 2026 - Present, or an honor that starts with 2023 - 2024
 * @return The text with each spaced hyphen between two dates replaced by an en dash
 * @details The data file spells ranges with a spaced hyphen, and the site style is an unspaced
 * en dash. Only a hyphen between two dates, months, semesters, or Present is changed, so a
 * title such as Project Report - Part 1 is left alone.
 */
function dashRange(value: string): string {
    return value.replace(C_RANGE_HYPHEN_PATTERN, '$1–');
}

/**
 * @brief Returns a date range as filled text, joined with an en dash
 * @param value Unknown duration from content
 * @return Range with an en dash, or undefined when empty or a placeholder
 */
function filledRange(value: unknown): string | undefined {
    const text = filledText(value);
    return text === undefined ? undefined : dashRange(text);
}

/**
 * @brief Cleans an unknown value into a list of filled strings
 * @param value Unknown value from content
 * @return Non-empty strings with placeholders removed
 */
function filledList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map(filledText).filter((entry): entry is string => entry !== undefined);
}

/**
 * @brief Cleans the skill labels declared on an entry
 * @param value Unknown value from content
 * @return Deduplicated list of filled skill labels
 */
function skillList(value: unknown): string[] {
    return [...new Set(filledList(value))];
}

/**
 * @brief Reads a visibility scope, hiding anything unrecognized
 * @param value Raw visibility value from content
 * @return One of All, Site, or Hide
 */
function visibilityScope(value: unknown): VisibilityScope {
    return value === 'All' || value === 'Site' ? value : 'Hide';
}

/**
 * @brief Checks whether a scope should appear on the website
 * @param scope Visibility scope to evaluate
 * @return True when scope is All or Site
 */
function isVisibleOnSite(scope: VisibilityScope): boolean {
    return scope === 'All' || scope === 'Site';
}

/**
 * @brief Checks whether a referenced file can be linked
 * @param url URL to check
 * @return True for external links, or when the file exists under src/assets
 */
function assetExists(url: string): boolean {
    if (/^(?:https?:|mailto:|tel:)/i.test(url)) {
        return true;
    }

    try {
        return C_AVAILABLE_ASSETS.has(decodeURI(url));
    } catch {
        return C_AVAILABLE_ASSETS.has(url);
    }
}

/**
 * @brief Keeps the proof entries that have a title and a file behind them
 * @param value Raw proof array from content
 * @return Proof entries ready to render
 */
function proofList(value: unknown): Proof[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((entry: Partial<Proof> | null) => {
        const url = filledText(entry?.url);
        return Boolean(filledText(entry?.title) && url && assetExists(url));
    });
}

/**
 * @brief Cleans the fields experiences and projects share
 * @param entry Raw experience or project
 * @return Entry with filled text, deduplicated skills, and usable proof
 * @details The site shows skills and siteSkills together. Only skills print on the resume, so
 * siteSkills holds the tools the site credits but the PDF leaves off.
 */
function normalizeWork<T extends WorkEntry>(entry: T): T {
    return {
        ...entry,
        navLabel: filledText(entry.navLabel),
        duration: filledRange(entry.duration) ?? entry.duration,
        Summary: filledText(entry.Summary),
        skills: skillList([...filledList(entry.skills), ...filledList(entry.siteSkills)]),
        Resume: filledList(entry.Resume),
        Highlights: filledList(entry.Highlights),
        Visibility: visibilityScope(entry.Visibility),
        proof: proofList(entry.proof),
    };
}

/**
 * @brief Keeps the links that have a label and a target
 * @param value Raw links array from content
 * @return Links ready to render
 */
function linkList(value: unknown): ProjectLink[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((entry: Partial<ProjectLink> | null) => {
        const label = filledText(entry?.label);
        const href = filledText(entry?.href);

        return label && href ? [{ label, href }] : [];
    });
}

/**
 * @brief Cleans a project, including the fields its write-up page shows
 * @param project Raw project
 * @return Project with filled text and usable links
 */
function normalizeProject(project: Project): Project {
    return {
        ...normalizeWork(project),
        dek: filledText(project.dek),
        figure: filledText(project.figure),
        figureAlt: filledText(project.figureAlt),
        team: filledText(project.team),
        myPart: filledText(project.myPart),
        links: linkList(project.links),
    };
}

/**
 * @brief Cleans an education entry along with its coursework
 * @param education Raw education entry
 * @return Education entry with filled lists and normalized courses
 */
function normalizeEducation(education: Education): Education {
    return {
        ...education,
        honors: filledList(education.honors).map(dashRange),
        scholarships: filledList(education.scholarships).map(dashRange),
        courses: Object.fromEntries(
            Object.entries(education.courses ?? {}).map(([category, courses]) => [
                category,
                (courses ?? []).map((course) => ({
                    ...course,
                    Summary: filledText(course.Summary),
                    skills: skillList(course.skills),
                    Visibility: visibilityScope(course.Visibility),
                })),
            ])
        ),
        Visibility: visibilityScope(education.Visibility),
    };
}

/**
 * @brief Cleans a certification
 * @param certification Raw certification
 * @return Certification with normalized fields and any dead link dropped
 */
function normalizeCertification(certification: Certification): Certification {
    const { link } = certification;

    return {
        ...certification,
        skills: skillList(certification.skills),
        Visibility: visibilityScope(certification.Visibility),
        link: link && assetExists(link) ? link : undefined,
    };
}

/**
 * @brief Cleans an organization membership
 * @param organization Raw organization entry
 * @return Organization with empty fields dropped, or null until name, role, and dates are filled
 */
function normalizeOrganization(organization: Organization): Organization | null {
    const name = filledText(organization?.name);
    const role = filledText(organization?.role);
    const duration = filledRange(organization?.duration);

    if (!name || !role || !duration) {
        return null;
    }

    return {
        name,
        role,
        duration,
        chapter: filledText(organization.chapter),
        url: filledText(organization.url),
        Summary: filledText(organization.Summary),
        Visibility: visibilityScope(organization.Visibility),
    };
}

/**
 * @brief Cleans an earlier role listed on the about page
 * @param role Raw role entry
 * @return Role without placeholder fields, or null until title and employer are filled
 */
function normalizeAboutRole(role: AboutRole): AboutRole | null {
    const title = filledText(role?.title);
    const employer = filledText(role?.employer);

    if (!title || !employer) {
        return null;
    }

    return {
        title,
        employer,
        location: filledText(role.location),
        duration: filledRange(role.duration),
        Summary: filledText(role.Summary),
    };
}

/**
 * @brief Cleans one chapter of the about page story
 * @param chapter Raw chapter entry
 * @return Chapter without placeholder paragraphs, or null until it has a title and a paragraph
 */
function normalizeAboutChapter(chapter: AboutChapter): AboutChapter | null {
    const title = filledText(chapter?.title);
    const paragraphs = filledList(chapter?.paragraphs);

    if (!title || paragraphs.length === 0) {
        return null;
    }

    return { title, paragraphs };
}

/**
 * @brief Cleans the about section, which also carries the profile text
 * @param about Raw about object, including the Resume line the generator also reads
 * @return About with placeholders stripped from every block
 */
function normalizeAbout(about: Partial<About> & { Resume?: string }): About {
    const roles = about.earlyWork?.roles;
    const chapters = about.chapters;

    return {
        Highlights: filledText(about.Highlights) ?? filledText(about.Resume) ?? '',
        Summary: filledText(about.Summary),
        intro: filledList(about.intro),
        earlyWork: {
            Summary: filledText(about.earlyWork?.Summary),
            roles: (Array.isArray(roles) ? roles : [])
                .map(normalizeAboutRole)
                .filter((role): role is AboutRole => role !== null),
        },
        chapters: (Array.isArray(chapters) ? chapters : [])
            .map(normalizeAboutChapter)
            .filter((chapter): chapter is AboutChapter => chapter !== null),
        future: filledList(about.future),
        Visibility: visibilityScope(about.Visibility),
    };
}

/**
 * @brief Checks that the site block is filled in
 * @param site Raw site block
 * @return The site block
 * @details The site copy has no fallback, so a missing field stops the build instead of
 * shipping an empty description.
 */
function requireSite(site: Site | undefined): Site {
    const pages = site?.pages;
    const person = site?.person;
    const filled =
        filledText(site?.description) &&
        typeof site?.aboutPublished === 'boolean' &&
        filledText(person?.jobTitle) &&
        filledText(person?.worksFor?.name) &&
        filledText(person?.worksFor?.url) &&
        filledText(person?.occupation) &&
        Array.isArray(person?.knowsAbout) &&
        pages &&
        (['home', 'projects', 'experiences', 'coursework', 'skills'] as const).every((page) =>
            filledText(pages[page]?.description)
        );

    if (!site || !filled) {
        throw new Error('[ERROR] resume-data.json: the site block is missing a field');
    }

    return site;
}

const C_RAW_RESUME = rawResumeData as unknown as ResumeData;

export const resume: ResumeData = {
    ...C_RAW_RESUME,
    about: normalizeAbout(C_RAW_RESUME.about ?? {}),
    education: (C_RAW_RESUME.education ?? []).map(normalizeEducation),
    experiences: (C_RAW_RESUME.experiences ?? []).map((entry) => ({
        ...normalizeWork(entry),
        employmentType: filledText(entry.employmentType),
    })),
    projects: (C_RAW_RESUME.projects ?? []).map(normalizeProject),
    certifications: (C_RAW_RESUME.certifications ?? []).map(normalizeCertification),
    organizations: (C_RAW_RESUME.organizations ?? [])
        .map(normalizeOrganization)
        .filter((entry): entry is Organization => entry !== null),
    TopSkills: filledList(C_RAW_RESUME.TopSkills),
    ResumeSkills: filledList(C_RAW_RESUME.ResumeSkills),
    site: requireSite(C_RAW_RESUME.site),
};

export const primaryEducation: Education | undefined = resume.education[0];
export const visibleExperiences = resume.experiences.filter((entry) =>
    isVisibleOnSite(entry.Visibility)
);
export const visibleProjects = resume.projects.filter((entry) => isVisibleOnSite(entry.Visibility));
export const visibleCertifications = resume.certifications.filter((entry) =>
    isVisibleOnSite(entry.Visibility)
);
export const visibleOrganizations = resume.organizations.filter((entry) =>
    isVisibleOnSite(entry.Visibility)
);

// The about route and its header link both read this, so the link cannot outlive the page.
// site.aboutPublished holds the page back until its narrative is written.
export const hasAboutContent =
    resume.site.aboutPublished &&
    isVisibleOnSite(resume.about.Visibility) &&
    (resume.about.intro.length > 0 ||
        resume.about.chapters.length > 0 ||
        resume.about.future.length > 0 ||
        resume.about.earlyWork.roles.length > 0 ||
        Boolean(resume.about.earlyWork.Summary));

/**
 * @brief Converts text to a URL-safe slug
 * @param value Text to slugify
 * @return Lowercase, hyphen-separated slug
 */
function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * @brief Gets the route slug for a project
 * @param project Project to slugify
 * @return Explicit slug, or one generated from the title
 */
export function getProjectSlug(project: Project): string {
    return project.slug?.trim() || slugify(project.title);
}

/**
 * @brief Gets the route slug for an experience
 * @param experience Experience to slugify
 * @return Explicit slug, or one generated from the title and company
 */
export function getExperienceSlug(experience: Experience): string {
    return experience.slug?.trim() || slugify(`${experience.title}-${experience.company}`);
}

/**
 * @brief Gets the link to a project's detail page
 * @param project Project to link to
 * @return Route path for the project
 */
export function getProjectHref(project: Project): string {
    return `/projects/${getProjectSlug(project)}`;
}

/**
 * @brief Gets the link to an experience's page
 * @param experience Experience to link to
 * @return Route path for the experience
 */
export function getExperienceHref(experience: Experience): string {
    return `/experiences/${getExperienceSlug(experience)}`;
}

/**
 * @brief Builds the anchor id for a course on the coursework page
 * @param course Course entry
 * @return Anchor slug such as course-eeng-383
 */
export function getCourseSlug(course: Course): string {
    return `course-${slugify(course.code)}`;
}

/**
 * @brief Builds the anchor id for a certification on the education page
 * @param certification Certification entry
 * @return Anchor slug such as certification-matlab-machine-learning-techniques
 */
export function getCertificationSlug(certification: Certification): string {
    return `certification-${slugify(certification.name)}`;
}

/**
 * @brief Decides whether the coursework page lists a course
 * @param course Course entry
 * @return True for visible, relevant courses in the site's departments
 */
function isSiteCourse(course: Course): boolean {
    return (
        isVisibleOnSite(course.Visibility) &&
        String(course.relevancy ?? '').toLowerCase() === 'yes' &&
        C_SITE_COURSE_PREFIXES.has(course.code.trim().split(' ')[0])
    );
}

/**
 * @brief Reads the course number out of a course code
 * @param code Course code such as EENG 411
 * @return Course number, or 0 when the code has none
 */
function courseNumber(code: string): number {
    return Number(code.match(/\b(\d{3,4})\b/)?.[1] ?? 0);
}

export const courseCategories = Object.entries(primaryEducation?.courses ?? {})
    .map(([category, courses]) => ({
        category,
        courses: courses
            .filter(isSiteCourse)
            .sort((left, right) => courseNumber(right.code) - courseNumber(left.code)),
    }))
    .filter((entry) => entry.courses.length > 0);

/**
 * @brief Compares two course codes, ignoring case and outer whitespace
 * @param left First course code
 * @param right Second course code
 * @return True when both name the same course
 */
function sameCourse(left: string, right: string): boolean {
    return left.trim().toLowerCase() === right.trim().toLowerCase();
}

/**
 * @brief Finds a listed course by its code
 * @param code Course code named on a project
 * @return The course, or undefined when the coursework page does not list it
 */
export function getCourseByCode(code: string): Course | undefined {
    return courseCategories
        .flatMap((entry) => entry.courses)
        .find((candidate) => sameCourse(candidate.code, code));
}

/**
 * @brief Builds the link to a course on the coursework page
 * @param code Course code named on a project
 * @return Link to the course, or undefined when the coursework page does not list it
 */
export function getCourseHref(code: string): string | undefined {
    const course = getCourseByCode(code);

    return course && `/education/coursework/#${getCourseSlug(course)}`;
}

/**
 * @brief Gets the visible projects that came out of a course
 * @param course Course to match
 * @return Projects whose course field names this course
 */
export function getProjectsForCourse(course: Course): Project[] {
    return visibleProjects.filter(
        (project) => project.course && sameCourse(project.course, course.code)
    );
}

// Curated skill order: TopSkills as written, then ResumeSkills.
const C_SKILL_RANKS = new Map(
    [...resume.TopSkills, ...resume.ResumeSkills].map((name, index) => [name.toLowerCase(), index])
);

/**
 * @brief Compares skill labels by the curated order in resume-data.json
 * @param left First skill label
 * @param right Second skill label
 * @return Sort order, with unranked labels alphabetical at the end
 */
function compareSkills(left: string, right: string): number {
    const leftRank = C_SKILL_RANKS.get(left.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = C_SKILL_RANKS.get(right.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

    return leftRank - rightRank || left.localeCompare(right, 'en', { sensitivity: 'base' });
}

/**
 * @brief Builds the anchor id for a skill on the skills page
 * @param name Skill label
 * @return Anchor slug such as skill-c-plus-plus
 * @details Spells out + and # so that C and C++ do not share an anchor.
 */
function getSkillSlug(name: string): string {
    const spelled = name.toLowerCase().replace(/\+/g, ' plus ').replace(/#/g, ' sharp ');

    return `skill-${slugify(spelled)}`;
}

/**
 * @brief Builds the link to a skill on the skills page
 * @param name Skill label
 * @return Link to the skill's row
 */
export function getSkillHref(name: string): string {
    return `/skills/#${getSkillSlug(name)}`;
}

/**
 * @brief Builds the skills index from the work each skill was used on
 * @return Skills in curated order, each with every source that names it
 * @details Skills are declared on the work itself, so every skill has at least one source.
 */
function buildSkillIndex(): SkillEntry[] {
    const skills = new Map<string, SkillEntry>();

    /**
     * @brief Records a source under each skill it names
     * @param names Skill labels declared on the item
     * @param reference Link back to the item
     * @return Nothing
     */
    const addReference = (names: string[], reference: SkillReference): void => {
        for (const name of names) {
            const key = name.toLowerCase();
            const entry = skills.get(key) ?? { name, slug: getSkillSlug(name), references: [] };

            entry.references.push(reference);
            skills.set(key, entry);
        }
    };

    for (const experience of visibleExperiences) {
        addReference(experience.skills, {
            label: `${experience.title}, ${experience.company}`,
            href: getExperienceHref(experience),
        });
    }

    for (const project of visibleProjects) {
        addReference(project.skills, { label: project.title, href: getProjectHref(project) });
    }

    for (const course of courseCategories.flatMap((entry) => entry.courses)) {
        addReference(course.skills, {
            label: `${course.code} ${course.name}`,
            href: `/education/coursework/#${getCourseSlug(course)}`,
        });
    }

    for (const certification of visibleCertifications) {
        addReference(certification.skills, {
            label: certification.name,
            href: `/education/#${getCertificationSlug(certification)}`,
        });
    }

    return [...skills.values()].sort((left, right) => compareSkills(left.name, right.name));
}

export const skillIndex = buildSkillIndex();

/**
 * @brief Ends a line from the data as a sentence
 * @param text Line from resume-data.json, which leaves off the final period
 * @return Text ending in punctuation
 */
export function asSentence(text: string): string {
    return /[.!?]$/.test(text) ? text : `${text}.`;
}

export interface LinkedTextPart {
    text: string;
    href?: string;
}

/**
 * @brief Splits a sentence into plain text and links to visible project pages
 * @param text Sentence to scan
 * @return Parts in order, with an href on each project name that has a page
 * @details Matches a visible project's slug, navLabel, or title as a whole word, longest
 * first. The about page uses this because chapter paragraphs arrive as plain strings.
 */
export function linkProjectNames(text: string): LinkedTextPart[] {
    const terms = new Map<string, string>();

    for (const project of visibleProjects) {
        const href = `/projects/${getProjectSlug(project)}/`;

        for (const label of [project.slug, project.navLabel, project.title]) {
            const name = label?.trim();

            if (name && !terms.has(name.toLowerCase())) {
                terms.set(name.toLowerCase(), href);
            }
        }
    }

    const names = [...terms.keys()].sort((left, right) => right.length - left.length);

    if (names.length === 0 || text.length === 0) {
        return [{ text }];
    }

    const pattern = new RegExp(
        `(?<![A-Za-z0-9])(${names.map(escapeRegExp).join('|')})(?![A-Za-z0-9])`,
        'gi'
    );
    const parts: LinkedTextPart[] = [];
    let cursor = 0;

    for (const match of text.matchAll(pattern)) {
        const index = match.index ?? 0;
        const name = match[0];

        if (index > cursor) {
            parts.push({ text: text.slice(cursor, index) });
        }

        parts.push({ text: name, href: terms.get(name.toLowerCase()) });
        cursor = index + name.length;
    }

    if (cursor < text.length) {
        parts.push({ text: text.slice(cursor) });
    }

    return parts.length > 0 ? parts : [{ text }];
}

/**
 * @brief Escapes a string for use in a regular expression
 * @param value Literal text
 * @return Text with regex metacharacters escaped
 */
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
