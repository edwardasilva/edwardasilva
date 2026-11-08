/**
 * src/data/resume.ts
 * Resume Data Module
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 08 November, 2026
 *
 * Reads information/resume-data.json once, cleans it for the site, and exports what the pages render.
 * Anything hidden, unfilled, or pointing at a missing file is dropped here, so pages and
 * components can use the exports without checking them again.
 *
 * File Structure:
 * - Constants: display values and patterns
 * - Normalizers: placeholder, visibility, and proof filtering
 * - Exports: resume, the visible lists, slugs, links, and the skills index
 *
 * Used in: All components, pages, and routes that need resume data
 *
 * Usage:
 * $ `import { resume } from './data/resume'` : Imported by pages and components
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 * NOTICE: This file contains personal biographical data.
 * It is strictly excluded from the repository's MIT License and
 * may not be reproduced, distributed, or modified without permission.
 */

import rawResumeData from '../../information/resume-data.json';
import type {
    About,
    AboutRole,
    Certification,
    Course,
    Education,
    Experience,
    Project,
    Proof,
    ResumeData,
    SkillEntry,
    SkillReference,
    VisibilityScope,
    WorkEntry,
} from './types';

const C_SITE_COURSE_PREFIXES = new Set(['CSCI', 'EENG']);
const C_PLACEHOLDER_PATTERN = /\[INSERT[^\]]*\]/i;

// The about page is held back until its narrative is written. Turning this on restores the
// route and its header link.
const C_ABOUT_PAGE_PUBLISHED = false;

// Every file under src/assets, keyed by the /assets/ URL it is served from. Lazy glob, so
// nothing is bundled. It only answers whether a referenced file is in the repo.
const C_AVAILABLE_ASSETS = new Set(
    Object.keys(import.meta.glob('../assets/**/*')).map((assetPath) =>
        assetPath.replace(/^\.\.\/assets\//, '/assets/')
    )
);

export const C_INSTITUTION_URL = 'https://www.mines.edu';

// Shown on the site in place of the official title kept in the resume data.
export const C_DISPLAY_ROLE = 'Embedded Software Engineer';

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

// Skills the site shows on top of resume-data.json. They stay here because the skills in that file
// print on the resume PDF. Solar tracker has no entry in that file, so it is linked directly.
const C_SITE_SKILLS: Record<string, string[]> = {
    'Kratos-swe': ['SIMD'],
    'seed-robot': ['Arduino', 'Git'],
    'dsp-final': ['Git'],
    'solar-tracker': ['Arduino', 'Python', 'Bash'],
};

/**
 * @brief Gets the skills the site adds to a page or entry
 * @param slug Slug of the page or entry
 * @return Skill labels, empty when the site adds none
 */
export function getSiteSkills(slug: string | undefined): string[] {
    return C_SITE_SKILLS[slug ?? ''] ?? [];
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
 */
function normalizeWork<T extends WorkEntry>(entry: T): T {
    return {
        ...entry,
        Summary: filledText(entry.Summary),
        skills: skillList([...filledList(entry.skills), ...getSiteSkills(entry.slug)]),
        Resume: filledList(entry.Resume),
        Highlights: filledList(entry.Highlights),
        Visibility: visibilityScope(entry.Visibility),
        proof: proofList(entry.proof),
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
        honors: filledList(education.honors),
        scholarships: filledList(education.scholarships),
        courses: Object.fromEntries(
            Object.entries(education.courses ?? {}).map(([category, courses]) => [
                category,
                (courses ?? []).map((course) => ({
                    ...course,
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
        duration: filledText(role.duration),
        Summary: filledText(role.Summary),
    };
}

/**
 * @brief Cleans the about section, which also carries the profile text
 * @param about Raw about object, including the Resume line the generator also reads
 * @return About with placeholders stripped from every block
 */
function normalizeAbout(about: Partial<About> & { Resume?: string }): About {
    const roles = about.earlyWork?.roles;

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
        path: filledList(about.path),
        future: filledList(about.future),
        Visibility: visibilityScope(about.Visibility),
    };
}

const C_RAW_RESUME = rawResumeData as unknown as ResumeData;

export const resume: ResumeData = {
    ...C_RAW_RESUME,
    about: normalizeAbout(C_RAW_RESUME.about ?? {}),
    education: (C_RAW_RESUME.education ?? []).map(normalizeEducation),
    experiences: (C_RAW_RESUME.experiences ?? []).map(normalizeWork),
    projects: (C_RAW_RESUME.projects ?? []).map(normalizeWork),
    certifications: (C_RAW_RESUME.certifications ?? []).map(normalizeCertification),
    TopSkills: filledList(C_RAW_RESUME.TopSkills),
    ResumeSkills: filledList(C_RAW_RESUME.ResumeSkills),
};

export const primaryEducation: Education | undefined = resume.education[0];
export const visibleExperiences = resume.experiences.filter((entry) =>
    isVisibleOnSite(entry.Visibility)
);
export const visibleProjects = resume.projects.filter((entry) => isVisibleOnSite(entry.Visibility));
export const visibleCertifications = resume.certifications.filter((entry) =>
    isVisibleOnSite(entry.Visibility)
);

// The about route and its header link both read this, so the link cannot outlive the page.
export const hasAboutContent =
    C_ABOUT_PAGE_PUBLISHED &&
    isVisibleOnSite(resume.about.Visibility) &&
    (resume.about.intro.length > 0 ||
        resume.about.path.length > 0 ||
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
 * @brief Gets the link to an experience on the experience page
 * @param experience Experience to link to
 * @return Route path and anchor for the experience
 */
export function getExperienceHref(experience: Experience): string {
    return `/experiences#${getExperienceSlug(experience)}`;
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

    return course && `/education/coursework#${getCourseSlug(course)}`;
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
    return `/skills#${getSkillSlug(name)}`;
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

    addReference(getSiteSkills('solar-tracker'), {
        label: 'Solar tracker',
        href: '/projects/solar-tracker',
    });

    for (const course of courseCategories.flatMap((entry) => entry.courses)) {
        addReference(course.skills, {
            label: `${course.code} ${course.alias ?? course.name}`,
            href: `/education/coursework#${getCourseSlug(course)}`,
        });
    }

    for (const certification of visibleCertifications) {
        addReference(certification.skills, {
            label: certification.name,
            href: `/education#${getCertificationSlug(certification)}`,
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
