/**
 * src/data/resume.ts
 * Resume Data Module
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 18 July, 2026
 *
 * Central registry for resume data with utilities to normalize, filter, and access data.
 * Imports root-level JSON and provides typed exports with asset URL normalization.
 *
 * File Structure:
 * - Asset Normalization: Functions to rewrite asset paths to /assets/ URLs
 * - Resume Export: Processed resume data with normalized assets
 * - Utility Functions: Slug generation, filtering, lookups, and coursework ordering
 *
 * Used in: All components, pages, and API routes needing resume data
 *
 * Licence/Copyright: Licensed under MIT License
 */

import rawResumeData from '../../resume-data.json';
import type {
    Certification,
    Course,
    Education,
    Experience,
    Project,
    ProjectProof,
    Profile,
    ProfileEvidence,
    ProfilePhoto,
    ResumeData,
    Skill,
    VisibilityScope,
} from './types';

const VALID_VISIBILITY_SCOPES: ReadonlySet<VisibilityScope> = new Set(['All', 'Site', 'Hide']);
const SITE_COURSE_PREFIXES = new Set(['CSCI', 'EENG']);

/**
 * @brief Normalizes visibility scope values to supported states
 * @param value Raw visibility scope value from content
 * @return One of All, Site, or Hide
 */
function normalizeVisibilityScope(value: unknown): VisibilityScope {
    if (typeof value === 'string' && VALID_VISIBILITY_SCOPES.has(value as VisibilityScope)) {
        return value as VisibilityScope;
    }

    return 'Hide';
}

/**
 * @brief Normalizes unknown values into a clean string array
 * @param value Unknown value from content
 * @return Array of non-empty strings
 */
function normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

/**
 * @brief Normalizes technologies/tags arrays for consistent rendering
 * @param value Unknown value from content
 * @return Deduplicated list of non-empty technology labels
 */
function normalizeTechnologiesArray(value: unknown): string[] {
    return Array.from(new Set(normalizeStringArray(value).map((entry) => entry.trim()))).filter(
        (entry) => entry.length > 0
    );
}

/**
 * @brief Normalizes priority values for deterministic course ordering
 * @param value Raw priority value
 * @return Numeric priority value
 */
function normalizePriority(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed)) {
        return parsed;
    }

    return Number.MAX_SAFE_INTEGER;
}

/**
 * @brief Checks whether a visibility scope should appear on the website
 * @param scope Visibility scope to evaluate
 * @return True when scope is All or Site
 */
export function isVisibleOnSite(scope: VisibilityScope): boolean {
    return scope === 'All' || scope === 'Site';
}

/**
 * @brief Normalizes asset URLs to /assets/ format
 * @param url The URL to normalize
 * @return Normalized URL path starting with /assets/
 * @details Handles absolute URLs, mailto/tel protocols, and relative paths
 */
function normalizeAssetUrl(url: string): string {
    if (/^(?:https?:|mailto:|tel:)/i.test(url)) {
        return url;
    }

    const normalized = url.replace(/^\/?(?:src\/)?assets\/(?:proof\/)?/i, '/assets/');

    if (/^assets\//i.test(normalized)) {
        return `/${normalized}`;
    }

    return normalized;
}

/**
 * @brief Normalizes asset URLs in project proof objects
 * @param proof The proof object to normalize
 * @return Proof with normalized URLs
 */
function normalizeProjectProof(proof: ProjectProof): ProjectProof {
    return {
        ...proof,
        url: normalizeAssetUrl(proof.url),
        embedUrl: proof.embedUrl ? normalizeAssetUrl(proof.embedUrl) : proof.embedUrl,
    };
}

/**
 * @brief Normalizes a coursework entry
 * @param course The course object to normalize
 * @return Course with normalized visibility and priority
 */
function normalizeCourse(course: Course): Course {
    return {
        ...course,
        Priority: normalizePriority(course.Priority),
        Visibility: normalizeVisibilityScope(course.Visibility),
    };
}

/**
 * @brief Normalizes a project entry
 * @param project The project object to normalize
 * @return Project with normalized bullets, visibility, and proof URLs
 */
function normalizeProject(project: Project): Project {
    return {
        ...project,
        technologies: normalizeTechnologiesArray(project.technologies),
        Resume: normalizeStringArray(project.Resume),
        Highlights: normalizeStringArray(project.Highlights),
        Visibility: normalizeVisibilityScope(project.Visibility),
        proof: project.proof?.map(normalizeProjectProof),
    };
}

/**
 * @brief Normalizes an experience entry
 * @param experience The experience object to normalize
 * @return Experience with normalized bullets and visibility
 */
function normalizeExperience(experience: Experience): Experience {
    return {
        ...experience,
        technologies: normalizeTechnologiesArray(experience.technologies),
        Resume: normalizeStringArray(experience.Resume),
        Highlights: normalizeStringArray(experience.Highlights),
        Visibility: normalizeVisibilityScope(experience.Visibility),
    };
}

/**
 * @brief Normalizes asset URLs and visibility for a certification
 * @param certification The certification object to normalize
 * @return Certification with normalized fields
 */
function normalizeCertification(certification: Certification): Certification {
    return {
        ...certification,
        Visibility: normalizeVisibilityScope(certification.Visibility),
        link: certification.link ? normalizeAssetUrl(certification.link) : certification.link,
    };
}

/**
 * @brief Normalizes a profile photo object
 * @param photo The photo object to normalize
 * @return Normalized profile photo, or null when required fields are missing
 */
function normalizeProfilePhoto(photo: unknown): ProfilePhoto | null {
    if (!photo || typeof photo !== 'object') {
        return null;
    }

    const candidate = photo as Partial<ProfilePhoto>;
    if (typeof candidate.title !== 'string' || typeof candidate.url !== 'string') {
        return null;
    }

    return {
        title: candidate.title,
        url: normalizeAssetUrl(candidate.url),
        alt: typeof candidate.alt === 'string' ? candidate.alt : candidate.title,
        description: typeof candidate.description === 'string' ? candidate.description : undefined,
    };
}

/**
 * @brief Normalizes a profile evidence object
 * @param evidence The evidence object to normalize
 * @return Normalized profile evidence, or null when required fields are missing
 */
function normalizeProfileEvidence(evidence: unknown): ProfileEvidence | null {
    if (!evidence || typeof evidence !== 'object') {
        return null;
    }

    const candidate = evidence as Partial<ProfileEvidence>;
    if (
        typeof candidate.title !== 'string' ||
        typeof candidate.type !== 'string' ||
        typeof candidate.url !== 'string'
    ) {
        return null;
    }

    return {
        title: candidate.title,
        type: candidate.type,
        url: normalizeAssetUrl(candidate.url),
        description: typeof candidate.description === 'string' ? candidate.description : undefined,
        embedUrl:
            typeof candidate.embedUrl === 'string'
                ? normalizeAssetUrl(candidate.embedUrl)
                : undefined,
    };
}

/**
 * @brief Normalizes the profile section
 * @param profile The profile object to normalize
 * @return Profile with normalized visibility and string arrays
 */
function normalizeProfile(profile: Profile): Profile {
    const normalizedPhotos = Array.isArray(profile.photos)
        ? profile.photos
              .map((photo) => normalizeProfilePhoto(photo))
              .filter((photo): photo is ProfilePhoto => photo !== null)
        : [];

    const normalizedEvidence = Array.isArray(profile.evidence)
        ? profile.evidence
              .map((evidence) => normalizeProfileEvidence(evidence))
              .filter((evidence): evidence is ProfileEvidence => evidence !== null)
        : [];

    const normalizedResumeText =
        typeof profile.Resume === 'string'
            ? profile.Resume
            : typeof profile.text === 'string'
              ? profile.text
              : '';

    const normalizedHighlightsText =
        typeof profile.Highlights === 'string' ? profile.Highlights : normalizedResumeText;

    return {
        ...profile,
        Resume: normalizedResumeText,
        Highlights: normalizedHighlightsText,
        careerGoals: normalizeStringArray(profile.careerGoals),
        extracurriculars: normalizeStringArray(profile.extracurriculars),
        photos: normalizedPhotos,
        evidence: normalizedEvidence,
        Visibility: normalizeVisibilityScope(profile.Visibility),
    };
}

const typedRawData = rawResumeData as unknown as ResumeData;

const rawProfile = typedRawData.profile ?? {
    Resume: '',
    Highlights: '',
    careerGoals: [],
    extracurriculars: [],
    photos: [],
    evidence: [],
    Visibility: 'Hide' as VisibilityScope,
};

export const resume: ResumeData = {
    ...typedRawData,
    profile: normalizeProfile(rawProfile),
    education: (typedRawData.education ?? []).map((entry) => ({
        ...entry,
        Visibility: normalizeVisibilityScope(entry.Visibility),
    })),
    educationSupplementary: {
        ...typedRawData.educationSupplementary,
        honors: normalizeStringArray(typedRawData.educationSupplementary?.honors),
        scholarships: normalizeStringArray(typedRawData.educationSupplementary?.scholarships),
        courses: Object.fromEntries(
            Object.entries(typedRawData.educationSupplementary?.courses ?? {}).map(
                ([category, courses]) => [
                    category,
                    courses.map((course) => normalizeCourse(course)),
                ]
            )
        ),
    },
    experiences: (typedRawData.experiences ?? []).map((entry) => normalizeExperience(entry)),
    projects: (typedRawData.projects ?? []).map((entry) => normalizeProject(entry)),
    skills: Object.fromEntries(
        Object.entries(typedRawData.skills ?? {}).map(([category, skillItems]) => [
            category,
            skillItems
                .map((skillItem) => ({
                    name: skillItem.name,
                    Visibility: normalizeVisibilityScope(skillItem.Visibility),
                }))
                .filter((skillItem): skillItem is Skill => typeof skillItem.name === 'string'),
        ])
    ),
    certifications: (typedRawData.certifications ?? []).map((entry) =>
        normalizeCertification(entry)
    ),
};

/**
 * @brief Gets the primary education entry
 * @param data Optional resume data; defaults to global resume
 * @return First education entry or undefined if none exist
 */
export function getPrimaryEducation(data: ResumeData = resume): Education | undefined {
    return data.education?.[0];
}

/**
 * @brief Gets profile summary text for highlight/website surfaces
 * @param profile Optional profile object; defaults to global resume profile
 * @return Profile highlights text
 */
export function getProfileHighlightText(profile: Profile = resume.profile): string {
    return profile.Highlights || profile.Resume;
}

/**
 * @brief Gets resume PDF URL
 * @param data Optional resume data; defaults to global resume
 * @return URL to resume PDF, or default path if not specified
 */
export function getResumePdfUrl(data: ResumeData = resume): string {
    return data.personal.resumePdfUrl ?? '/resume/Edward_Silva_Resume.pdf';
}

/**
 * @brief Converts text to URL-safe slug
 * @param value The text to slugify
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
 * @brief Gets slug for a project
 * @param project The project to slugify
 * @return Project's explicit slug or generated from title
 */
export function getProjectSlug(project: Pick<Project, 'title' | 'slug'>): string {
    return project.slug?.trim() || slugify(project.title);
}

/**
 * @brief Gets all portfolio projects visible on site
 * @param data Optional resume data; defaults to global resume
 * @return All projects with Visibility All or Site
 */
export function getPortfolioProjects(data: ResumeData = resume): Project[] {
    return data.projects.filter((project) => isVisibleOnSite(project.Visibility));
}

/**
 * @brief Gets highlight bullets for project detail surfaces
 * @param project The project item
 * @return Project highlight bullets, or resume bullets when highlights are empty
 */
export function getProjectHighlights(project: Pick<Project, 'Resume' | 'Highlights'>): string[] {
    return project.Highlights.length > 0 ? project.Highlights : project.Resume;
}

/**
 * @brief Looks up a project by slug
 * @param slug The project slug to find
 * @param data Optional resume data; defaults to global resume
 * @return Project with matching slug or undefined
 */
export function getProjectBySlug(slug: string, data: ResumeData = resume): Project | undefined {
    for (const project of data.projects) {
        if (getProjectSlug(project) === slug) {
            return project;
        }
    }

    return undefined;
}

/**
 * @brief Gets all public experiences visible on site
 * @param data Optional resume data; defaults to global resume
 * @return All experiences with Visibility All or Site
 */
export function getPublicExperiences(data: ResumeData = resume): Experience[] {
    return data.experiences.filter((experience) => isVisibleOnSite(experience.Visibility));
}

/**
 * @brief Gets highlight bullets for experience detail surfaces
 * @param experience The experience item
 * @return Experience highlight bullets, or resume bullets when highlights are empty
 */
export function getExperienceHighlights(
    experience: Pick<Experience, 'Resume' | 'Highlights'>
): string[] {
    return experience.Highlights.length > 0 ? experience.Highlights : experience.Resume;
}

/**
 * @brief Gets slug for an experience
 * @param experience The experience to slugify
 * @return Experience's explicit slug or generated from title and company
 */
export function getExperienceSlug(
    experience: Pick<Experience, 'title' | 'company' | 'slug'>
): string {
    return experience.slug?.trim() || slugify(`${experience.title}-${experience.company}`);
}

/**
 * @brief Looks up an experience by slug
 * @param slug The experience slug to find
 * @param data Optional resume data; defaults to global resume
 * @return Experience with matching slug or undefined
 */
export function getExperienceBySlug(
    slug: string,
    data: ResumeData = resume
): Experience | undefined {
    for (const experience of data.experiences) {
        if (getExperienceSlug(experience) === slug) {
            return experience;
        }
    }

    return undefined;
}

/**
 * @brief Parses a numeric course level from a course code
 * @param code Course code string
 * @return Parsed level number, or undefined if not found
 */
function parseCourseNumber(code: string): number | undefined {
    const match = code.match(/\b(\d{3,4})\b/);
    if (!match) {
        return undefined;
    }

    return Number(match[1]);
}

/**
 * @brief Compares courses by course number in descending order
 * @param left Left course
 * @param right Right course
 * @return Sort order value
 */
function compareCoursesByNumber(left: Course, right: Course): number {
    const leftNumber = parseCourseNumber(left.code) ?? 0;
    const rightNumber = parseCourseNumber(right.code) ?? 0;
    return rightNumber - leftNumber;
}

/**
 * @brief Returns visible coursework grouped by category for site pages
 * @param data Optional resume data; defaults to global resume
 * @return Category and course pairs after filtering and sorting
 */
export function getVisibleCourseCategories(
    data: ResumeData = resume
): Array<{ category: string; courses: Course[] }> {
    return Object.entries(data.educationSupplementary?.courses ?? {})
        .map(([category, courses]) => ({
            category,
            courses: courses
                .filter((course) => isVisibleOnSite(course.Visibility))
                .filter((course) => String(course.relevancy ?? '').toLowerCase() === 'yes')
                .filter((course) => {
                    const code = (course.code ?? '').trim();
                    const prefix = code.split(' ')[0] ?? '';
                    const level = parseCourseNumber(code);

                    if (!SITE_COURSE_PREFIXES.has(prefix)) {
                        return false;
                    }

                    return level === undefined || level >= 300;
                })
                .sort((left, right) => compareCoursesByNumber(left, right)),
        }))
        .filter((entry) => entry.courses.length > 0);
}

/**
 * @brief Gets all visible skill names from resume skills data
 * @param data Optional resume data; defaults to global resume
 * @return Ordered, unique list of skill names visible on site
 */
export function getVisibleSkillNames(data: ResumeData = resume): string[] {
    const orderedVisibleSkills: string[] = [];

    for (const categorySkills of Object.values(data.skills ?? {})) {
        for (const skillItem of categorySkills as Skill[]) {
            if (isVisibleOnSite(skillItem.Visibility)) {
                orderedVisibleSkills.push(skillItem.name);
            }
        }
    }

    return Array.from(new Set(orderedVisibleSkills));
}

/**
 * @brief Gets explicit technologies associated with a single experience item
 * @param experience Experience item with technologies field
 * @return Ordered list of technologies for the experience
 */
export function getExperienceSkills(experience: Pick<Experience, 'technologies'>): string[] {
    return normalizeTechnologiesArray(experience.technologies);
}

/**
 * @brief Gets explicit technologies associated with a single project item
 * @param project Project item with technologies field
 * @return Ordered list of technologies associated with the project
 */
export function getProjectSkills(project: Pick<Project, 'technologies'>): string[] {
    return normalizeTechnologiesArray(project.technologies);
}
