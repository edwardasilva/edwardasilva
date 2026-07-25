/**
 * src/data/resume.ts
 * Resume Data Module
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 25 July, 2026
 *
 * Central registry for resume data with utilities to normalize, filter, and access data.
 * Imports root-level JSON and provides typed exports with asset URL normalization.
 *
 * File Structure:
 * - Asset Normalization: Functions to rewrite asset paths to /assets/ URLs
 * - Placeholder Handling: Drops unfilled [INSERT ...] content before it reaches a page
 * - Resume Export: Processed resume data with normalized assets
 * - Utility Functions: Slug generation, filtering, lookups, coursework and skill indexing
 *
 * Used in: All components, pages, and API routes needing resume data
 *
 * Licence/Copyright: Licensed under MIT License
 */

import rawResumeData from '../../resume-data.json';
import type {
    About,
    AboutRole,
    Certification,
    Course,
    Education,
    Experience,
    Project,
    Proof,
    ProfileEvidence,
    ProfilePhoto,
    ResumeData,
    SkillEntry,
    SkillReference,
    VisibilityScope,
    Volunteer,
} from './types';

const VALID_VISIBILITY_SCOPES: ReadonlySet<VisibilityScope> = new Set(['All', 'Site', 'Hide']);
const SITE_COURSE_PREFIXES = new Set(['CSCI', 'EENG']);
const PLACEHOLDER_PATTERN = /\[INSERT[^\]]*\]/i;

/**
 * @brief Checks whether text is an unfilled authoring placeholder
 * @param value Text to evaluate
 * @return True when the text still contains an [INSERT ...] marker
 * @details Placeholders live in resume-data.json as authoring notes and never render on the site.
 */
export function isPlaceholderText(value: unknown): boolean {
    return typeof value === 'string' && PLACEHOLDER_PATTERN.test(value);
}

/**
 * @brief Returns text only when it holds real content
 * @param value Text to evaluate
 * @return Trimmed text, or undefined when empty or still a placeholder
 */
function filledText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0 || isPlaceholderText(trimmed)) {
        return undefined;
    }

    return trimmed;
}

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
 * @return Array of non-empty strings with placeholders removed
 */
function normalizeStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => filledText(entry))
        .filter((entry): entry is string => entry !== undefined);
}

/**
 * @brief Normalizes the skill labels declared on an entry
 * @param value Unknown value from content
 * @return Deduplicated list of non-empty skill labels
 */
function normalizeSkillArray(value: unknown): string[] {
    return Array.from(new Set(normalizeStringArray(value)));
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

// Every file under src/assets, keyed by the /assets/ URL it is served from. Lazy glob, so
// nothing is bundled; this only answers whether a referenced file is actually in the repo.
const AVAILABLE_ASSETS = new Set(
    Object.keys(import.meta.glob('../assets/**/*')).map((assetPath) =>
        assetPath.replace(/^\.\.\/assets\//, '/assets/')
    )
);

/**
 * @brief Checks whether a referenced asset is present in the repository
 * @param url Asset URL to check
 * @return True for external links, or when the file exists under src/assets
 * @details Keeps links to files that were never added from shipping as dead links.
 */
function assetExists(url: string): boolean {
    if (/^(?:https?:|mailto:|tel:)/i.test(url)) {
        return true;
    }

    try {
        return AVAILABLE_ASSETS.has(decodeURI(url));
    } catch {
        return AVAILABLE_ASSETS.has(url);
    }
}

/**
 * @brief Normalizes asset URLs in a proof object
 * @param proof The proof object to normalize
 * @return Proof with normalized URLs
 */
function normalizeProof(proof: Proof): Proof {
    return {
        ...proof,
        url: normalizeAssetUrl(proof.url),
        embedUrl: proof.embedUrl ? normalizeAssetUrl(proof.embedUrl) : proof.embedUrl,
    };
}

/**
 * @brief Normalizes a proof list, dropping entries without a usable target
 * @param value Raw proof array from content
 * @return Proof entries ready to render
 * @details Keeps proof sections invisible until they are actually filled out.
 */
function normalizeProofList(value: unknown): Proof[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((entry): entry is Proof => {
            if (!entry || typeof entry !== 'object') {
                return false;
            }

            const candidate = entry as Partial<Proof>;
            const url = filledText(candidate.url);
            return Boolean(
                filledText(candidate.title) && url && assetExists(normalizeAssetUrl(url))
            );
        })
        .map((entry) => normalizeProof(entry));
}

/**
 * @brief Normalizes a coursework entry
 * @param course The course object to normalize
 * @return Course with normalized visibility and priority
 */
function normalizeCourse(course: Course): Course {
    return {
        ...course,
        skills: normalizeSkillArray(course.skills),
        Priority: normalizePriority(course.Priority),
        Visibility: normalizeVisibilityScope(course.Visibility),
    };
}

/**
 * @brief Normalizes an education entry along with its honors, scholarships, and coursework
 * @param education The education object to normalize
 * @return Education with normalized visibility and supplementary lists
 */
function normalizeEducation(education: Education): Education {
    return {
        ...education,
        honors: normalizeStringArray(education.honors),
        scholarships: normalizeStringArray(education.scholarships),
        courses: Object.fromEntries(
            Object.entries(education.courses ?? {}).map(([category, courses]) => [
                category,
                (courses ?? []).map((course) => normalizeCourse(course)),
            ])
        ),
        Visibility: normalizeVisibilityScope(education.Visibility),
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
        Summary: filledText(project.Summary),
        skills: normalizeSkillArray(project.skills),
        Resume: normalizeStringArray(project.Resume),
        Highlights: normalizeStringArray(project.Highlights),
        Visibility: normalizeVisibilityScope(project.Visibility),
        proof: normalizeProofList(project.proof),
    };
}

/**
 * @brief Normalizes an experience entry
 * @param experience The experience object to normalize
 * @return Experience with normalized bullets, visibility, and proof URLs
 */
function normalizeExperience(experience: Experience): Experience {
    return {
        ...experience,
        Summary: filledText(experience.Summary),
        skills: normalizeSkillArray(experience.skills),
        Resume: normalizeStringArray(experience.Resume),
        Highlights: normalizeStringArray(experience.Highlights),
        Visibility: normalizeVisibilityScope(experience.Visibility),
        proof: normalizeProofList(experience.proof),
    };
}

/**
 * @brief Normalizes a volunteer entry
 * @param volunteer The volunteer object to normalize
 * @return Volunteer with normalized bullets, visibility, and proof URLs
 */
function normalizeVolunteer(volunteer: Volunteer): Volunteer {
    return {
        ...volunteer,
        Summary: filledText(volunteer.Summary),
        skills: normalizeSkillArray(volunteer.skills),
        Resume: normalizeStringArray(volunteer.Resume),
        Highlights: normalizeStringArray(volunteer.Highlights),
        Visibility: normalizeVisibilityScope(volunteer.Visibility),
        proof: normalizeProofList(volunteer.proof),
    };
}

/**
 * @brief Normalizes asset URLs, skills, and visibility for a certification
 * @param certification The certification object to normalize
 * @return Certification with normalized fields and any dead link dropped
 */
function normalizeCertification(certification: Certification): Certification {
    const link = certification.link ? normalizeAssetUrl(certification.link) : undefined;

    return {
        ...certification,
        skills: normalizeSkillArray(certification.skills),
        Visibility: normalizeVisibilityScope(certification.Visibility),
        link: link && assetExists(link) ? link : undefined,
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
 * @brief Normalizes an early-career role listed on the about page
 * @param role Raw role entry
 * @return Role with placeholder fields removed, or null when the role is unfilled
 */
function normalizeAboutRole(role: unknown): AboutRole | null {
    if (!role || typeof role !== 'object') {
        return null;
    }

    const candidate = role as Partial<AboutRole>;
    const title = filledText(candidate.title);
    const employer = filledText(candidate.employer);

    if (!title || !employer) {
        return null;
    }

    return {
        title,
        employer,
        location: filledText(candidate.location),
        duration: filledText(candidate.duration),
        Summary: filledText(candidate.Summary),
    };
}

/**
 * @brief Normalizes the about section, which also carries the profile text
 * @param about Raw about object from content
 * @return About with placeholders stripped from every narrative block
 * @details Blocks that are still placeholders drop out entirely, so the page stays clean
 *          until the underlying content is written.
 */
function normalizeAbout(about: About): About {
    const rawRoles = Array.isArray(about?.earlyWork?.roles) ? about.earlyWork.roles : [];

    const normalizedPhotos = Array.isArray(about?.photos)
        ? about.photos
              .map((photo) => normalizeProfilePhoto(photo))
              .filter((photo): photo is ProfilePhoto => photo !== null)
        : [];

    const normalizedEvidence = Array.isArray(about?.evidence)
        ? about.evidence
              .map((evidence) => normalizeProfileEvidence(evidence))
              .filter((evidence): evidence is ProfileEvidence => evidence !== null)
        : [];

    const normalizedResumeText =
        typeof about?.Resume === 'string'
            ? about.Resume
            : typeof about?.text === 'string'
              ? about.text
              : '';

    const normalizedHighlightsText =
        typeof about?.Highlights === 'string' ? about.Highlights : normalizedResumeText;

    return {
        ...about,
        Resume: normalizedResumeText,
        Highlights: normalizedHighlightsText,
        Summary: filledText(about?.Summary),
        intro: normalizeStringArray(about?.intro),
        earlyWork: {
            Summary: filledText(about?.earlyWork?.Summary),
            roles: rawRoles
                .map((role) => normalizeAboutRole(role))
                .filter((role): role is AboutRole => role !== null),
        },
        path: normalizeStringArray(about?.path),
        future: normalizeStringArray(about?.future),
        careerGoals: normalizeStringArray(about?.careerGoals),
        extracurriculars: normalizeStringArray(about?.extracurriculars),
        photos: normalizedPhotos,
        evidence: normalizedEvidence,
        Visibility: normalizeVisibilityScope(about?.Visibility),
    };
}

const typedRawData = rawResumeData as unknown as ResumeData;

const rawAbout = typedRawData.about ?? {
    Resume: '',
    Highlights: '',
    intro: [],
    earlyWork: { roles: [] },
    path: [],
    future: [],
    careerGoals: [],
    extracurriculars: [],
    photos: [],
    evidence: [],
    Visibility: 'Hide' as VisibilityScope,
};

export const resume: ResumeData = {
    ...typedRawData,
    about: normalizeAbout(rawAbout),
    education: (typedRawData.education ?? []).map((entry) => normalizeEducation(entry)),
    experiences: (typedRawData.experiences ?? []).map((entry) => normalizeExperience(entry)),
    volunteer: (typedRawData.volunteer ?? []).map((entry) => normalizeVolunteer(entry)),
    projects: (typedRawData.projects ?? []).map((entry) => normalizeProject(entry)),
    certifications: (typedRawData.certifications ?? []).map((entry) =>
        normalizeCertification(entry)
    ),
    skillPriority: normalizeStringArray(typedRawData.skillPriority),
};

// Rank lookup for the curated skill order in resume-data.json
const SKILL_RANKS = new Map(resume.skillPriority.map((name, index) => [name.toLowerCase(), index]));

/**
 * @brief Gets the primary education entry
 * @param data Optional resume data; defaults to global resume
 * @return First education entry or undefined if none exist
 */
export function getPrimaryEducation(data: ResumeData = resume): Education | undefined {
    return data.education?.[0];
}

/**
 * @brief Gets the short profile line used on website surfaces
 * @param about Optional about object; defaults to the global resume about section
 * @return Highlights text, falling back to the resume profile line
 */
export function getProfileHighlightText(about: About = resume.about): string {
    return about.Highlights || about.Resume;
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
 * @brief Gets all volunteer entries visible on site
 * @param data Optional resume data; defaults to global resume
 * @return Volunteer entries with Visibility All or Site
 */
export function getPublicVolunteer(data: ResumeData = resume): Volunteer[] {
    return (data.volunteer ?? []).filter((entry) => isVisibleOnSite(entry.Visibility));
}

/**
 * @brief Gets slug for a volunteer entry
 * @param volunteer The volunteer entry to slugify
 * @return Explicit slug or one generated from title and organization
 */
export function getVolunteerSlug(
    volunteer: Pick<Volunteer, 'title' | 'organization' | 'slug'>
): string {
    return volunteer.slug?.trim() || slugify(`${volunteer.title}-${volunteer.organization}`);
}

/**
 * @brief Gets highlight bullets for volunteer detail surfaces
 * @param volunteer The volunteer entry
 * @return Volunteer highlight bullets, or resume bullets when highlights are empty
 */
export function getVolunteerHighlights(
    volunteer: Pick<Volunteer, 'Resume' | 'Highlights'>
): string[] {
    return volunteer.Highlights.length > 0 ? volunteer.Highlights : volunteer.Resume;
}

/**
 * @brief Reports whether the about page has any content worth publishing
 * @param data Optional resume data; defaults to global resume
 * @return True when the about section is visible and at least one block is filled in
 */
export function hasAboutContent(data: ResumeData = resume): boolean {
    const about = data.about;

    if (!about || !isVisibleOnSite(about.Visibility)) {
        return false;
    }

    return (
        about.intro.length > 0 ||
        about.path.length > 0 ||
        about.future.length > 0 ||
        about.earlyWork.roles.length > 0 ||
        Boolean(about.earlyWork.Summary)
    );
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
 * @param education Optional education entry; defaults to the primary entry
 * @return Category and course pairs after filtering and sorting
 */
export function getVisibleCourseCategories(
    education: Education | undefined = getPrimaryEducation()
): Array<{ category: string; courses: Course[] }> {
    return Object.entries(education?.courses ?? {})
        .map(([category, courses]) => ({
            category,
            courses: courses
                .filter((course) => isVisibleOnSite(course.Visibility))
                .filter((course) => String(course.relevancy ?? '').toLowerCase() === 'yes')
                .filter((course) => {
                    const prefix = (course.code ?? '').trim().split(' ')[0] ?? '';
                    return SITE_COURSE_PREFIXES.has(prefix);
                })
                .sort((left, right) => compareCoursesByNumber(left, right)),
        }))
        .filter((entry) => entry.courses.length > 0);
}

/**
 * @brief Looks up a course by its code among the courses the education page renders
 * @param code Course code such as EENG 411
 * @param data Optional resume data; defaults to global resume
 * @return Matching course, or undefined when the code is unknown or the course is not shown
 */
export function getVisibleCourseByCode(
    code: string | undefined,
    data: ResumeData = resume
): Course | undefined {
    if (!code) {
        return undefined;
    }

    const wanted = code.trim().toLowerCase();

    for (const { courses } of getVisibleCourseCategories(getPrimaryEducation(data))) {
        for (const course of courses) {
            if (course.code.trim().toLowerCase() === wanted) {
                return course;
            }
        }
    }

    return undefined;
}

/**
 * @brief Builds the link to a course on the education page
 * @param code Course code named on a project
 * @param data Optional resume data; defaults to global resume
 * @return Href to the course entry, or undefined when that course is not on the site
 */
export function getCourseHref(
    code: string | undefined,
    data: ResumeData = resume
): string | undefined {
    const course = getVisibleCourseByCode(code, data);
    return course ? `/education#${getCourseSlug(course)}` : undefined;
}

/**
 * @brief Gets the visible projects that came out of a given course
 * @param course Course to match against each project's course field
 * @param data Optional resume data; defaults to global resume
 * @return Projects whose course field names this course
 */
export function getProjectsForCourse(
    course: Pick<Course, 'code'>,
    data: ResumeData = resume
): Project[] {
    const wanted = course.code.trim().toLowerCase();

    return getPortfolioProjects(data).filter(
        (project) => (project.course ?? '').trim().toLowerCase() === wanted
    );
}

/**
 * @brief Gets certifications visible on the site
 * @param data Optional resume data; defaults to global resume
 * @return Certifications with Visibility All or Site
 */
export function getPublicCertifications(data: ResumeData = resume): Certification[] {
    return (data.certifications ?? []).filter((entry) => isVisibleOnSite(entry.Visibility));
}

/**
 * @brief Builds the anchor id used by the education page for a certification
 * @param certification Certification entry
 * @return Anchor slug such as certification-matlab-machine-learning-techniques
 */
export function getCertificationSlug(certification: Pick<Certification, 'name'>): string {
    return `certification-${slugify(certification.name)}`;
}

/**
 * @brief Builds the anchor id used by the education page for a course
 * @param course Course entry
 * @return Anchor slug such as course-eeng-383
 */
export function getCourseSlug(course: Pick<Course, 'code'>): string {
    return `course-${slugify(course.code)}`;
}

/**
 * @brief Gets the skills declared on a single experience item
 * @param experience Experience item with a skills field
 * @return Ordered list of skills for the experience
 */
export function getExperienceSkills(experience: Pick<Experience, 'skills'>): string[] {
    return sortSkillsByPriority(normalizeSkillArray(experience.skills));
}

/**
 * @brief Gets the skills declared on a single project item
 * @param project Project item with a skills field
 * @return Ordered list of skills for the project
 */
export function getProjectSkills(project: Pick<Project, 'skills'>): string[] {
    return sortSkillsByPriority(normalizeSkillArray(project.skills));
}

/**
 * @brief Gets the skills declared on a single volunteer item
 * @param volunteer Volunteer item with a skills field
 * @return Ordered list of skills for the volunteer entry
 */
export function getVolunteerSkills(volunteer: Pick<Volunteer, 'skills'>): string[] {
    return sortSkillsByPriority(normalizeSkillArray(volunteer.skills));
}

/**
 * @brief Gets a skill's position in the curated priority order
 * @param name Skill label
 * @return Rank index, or a value past the end for skills that are not ranked
 */
function getSkillRank(name: string): number {
    return SKILL_RANKS.get(name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
}

/**
 * @brief Orders skill labels by the curated priority in resume-data.json
 * @param names Skill labels to order
 * @return Labels sorted by priority, with unranked ones alphabetical at the end
 */
export function sortSkillsByPriority(names: string[]): string[] {
    return [...names].sort((left, right) => {
        const rankDelta = getSkillRank(left) - getSkillRank(right);
        return rankDelta !== 0
            ? rankDelta
            : left.localeCompare(right, 'en', { sensitivity: 'base' });
    });
}

/**
 * @brief Builds the anchor id used by the skills index for a skill name
 * @param name Skill or technology label
 * @return Anchor slug such as skill-c-plus-plus
 * @details Spells out the symbols that carry meaning in language names so that C and C++
 *          do not collapse onto the same anchor.
 */
export function getSkillSlug(name: string): string {
    const spelled = name.toLowerCase().replace(/\+/g, ' plus ').replace(/#/g, ' sharp ');

    return `skill-${slugify(spelled)}`;
}

/**
 * @brief Builds the skills index from the work each skill was gained on
 * @param data Optional resume data; defaults to global resume
 * @return Skill entries in curated priority order, each with every source that names it
 * @details Skills are declared on experiences, projects, volunteer entries, coursework, and
 *          certifications rather than in a list of their own, so every skill on the index
 *          carries at least one source and the index needs no categories.
 */
export function getSkillIndex(data: ResumeData = resume): SkillEntry[] {
    const referencesBySkill = new Map<string, SkillReference[]>();
    const labelsBySkill = new Map<string, string>();

    /**
     * @brief Records a source under the lowercase form of a skill name
     * @param names Skill labels declared on the item
     * @param reference Link back to the item that names them
     * @return Nothing
     */
    const addReferences = (names: string[], reference: SkillReference): void => {
        for (const name of names) {
            const key = name.toLowerCase();
            const existing = referencesBySkill.get(key);

            if (!labelsBySkill.has(key)) {
                labelsBySkill.set(key, name);
            }

            if (existing) {
                existing.push(reference);
            } else {
                referencesBySkill.set(key, [reference]);
            }
        }
    };

    for (const experience of getPublicExperiences(data)) {
        addReferences(getExperienceSkills(experience), {
            label: `${experience.title}, ${experience.company}`,
            href: `/experiences/${getExperienceSlug(experience)}`,
            kind: 'Experience',
        });
    }

    for (const project of getPortfolioProjects(data)) {
        addReferences(getProjectSkills(project), {
            label: project.title,
            href: `/projects/${getProjectSlug(project)}`,
            kind: 'Project',
        });
    }

    for (const volunteer of getPublicVolunteer(data)) {
        addReferences(getVolunteerSkills(volunteer), {
            label: `${volunteer.title}, ${volunteer.organization}`,
            href: `/volunteer/${getVolunteerSlug(volunteer)}`,
            kind: 'Volunteer',
        });
    }

    // Only courses the education page renders, so every course link has a target
    for (const { courses } of getVisibleCourseCategories(getPrimaryEducation(data))) {
        for (const course of courses) {
            addReferences(course.skills ?? [], {
                label: `${course.code} ${course.alias ?? course.name}`,
                href: `/education#${getCourseSlug(course)}`,
                kind: 'Course',
            });
        }
    }

    for (const certification of getPublicCertifications(data)) {
        addReferences(certification.skills ?? [], {
            label: certification.name,
            href: `/education#${getCertificationSlug(certification)}`,
            kind: 'Certification',
        });
    }

    return [...referencesBySkill.entries()]
        .map(([key, references]) => {
            const label = labelsBySkill.get(key) ?? key;

            return {
                name: label,
                slug: getSkillSlug(label),
                references,
            };
        })
        .sort((left, right) => {
            const rankDelta = getSkillRank(left.name) - getSkillRank(right.name);
            return rankDelta !== 0
                ? rankDelta
                : left.name.localeCompare(right.name, 'en', { sensitivity: 'base' });
        });
}

/**
 * @brief Builds the link target for a skill named on an experience, project, or volunteer entry
 * @param name Technology label shown on the entry
 * @return Href pointing at that skill's row on the skills page
 */
export function getSkillHref(name: string): string {
    return `/skills#${getSkillSlug(name)}`;
}
