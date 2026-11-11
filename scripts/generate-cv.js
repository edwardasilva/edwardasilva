/**
 * scripts/generate-cv.js
 * Generate CV Script
 *
 * Author: Edward Silva
 * Creation Date: 11 November, 2026
 * Last Update: 11 November, 2026
 *
 * Turns resume-data.json into the LaTeX body of the two-page CV, and into the list of text the
 * finished PDF has to contain. Entries with Visibility "All", "Site", "List", or "CV" reach the CV
 * and "Hide" stays off it. The cv object sets the section order and titles and whether the GPA
 * prints. An entry's CV bullet list is used when it has items, and its Resume list otherwise. A
 * field with the wrong kind of value stops the build and names the field. Fitting the pages
 * happens in scripts/build-cv.js.
 *
 * File Structure:
 * - Global Constants: file paths and the Visibility values the CV shows
 * - Validation: names the first field that cannot be rendered
 * - Data helpers: CV-visible entries, bullets, and coursework
 * - Rendering: LaTeX for each section and the full body
 * - expectedText: the strings the PDF must contain, in reading order
 *
 * Where this file is used within the repository:
 * - Run by scripts/build-cv.js before compiling the PDF
 * - Reuses the text helpers exported by scripts/generate-resume.js
 *
 * Usage:
 * $ `node scripts/generate-cv.js` : Writes build/cv/body.tex from resume-data.json
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    C_SHOW_PHONE,
    escapeLatex,
    escapeUrl,
    formatDateRange,
    renderBullets,
    renderContact,
    shortUrl,
} from './generate-resume.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_DATA_PATH = path.join(ROOT_DIR, 'information', 'resume-data.json');

export const C_BUILD_DIR = path.join(ROOT_DIR, 'build', 'cv');

const C_CV_VISIBILITY = ['All', 'Site', 'List', 'CV'];

/**
 * @brief Stops the build when a field has the wrong kind of value
 * @param condition True when the field is usable
 * @param field Path of the field in resume-data.json
 * @param expected What the field should hold
 * @return Nothing
 */
function requireField(condition, field, expected) {
    if (!condition) {
        throw new Error(`[ERROR] resume-data.json: ${field} must be ${expected}`);
    }
}

/**
 * @brief Keeps the entries marked for the CV
 * @param entries Raw entries from resume data
 * @return Entries whose Visibility is All, Site, List, or CV
 */
function onCv(entries) {
    return (entries ?? []).filter((entry) => C_CV_VISIBILITY.includes(entry.Visibility));
}

/**
 * @brief Gets the bullets for an entry
 * @param entry Experience or project entry
 * @return The CV list when it has items, otherwise the Resume list
 */
function cvBullets(entry) {
    return entry.CV?.length > 0 ? entry.CV : (entry.Resume ?? []);
}

/**
 * @brief Gets the CV-visible education entries
 * @param data Resume data
 * @return Education entries marked for the CV
 */
function cvEducation(data) {
    return onCv(data.education);
}

/**
 * @brief Gets the CV-visible courses of one education entry
 * @param education Education entry
 * @return Course labels as "code name", ordered by Priority, then by code
 * @details The one-page Signals and Systems merge does not apply here.
 */
function cvCourseLabels(education) {
    return onCv(Object.values(education.courses ?? {}).flat())
        .sort(
            (left, right) =>
                (left.Priority ?? Number.MAX_SAFE_INTEGER) -
                    (right.Priority ?? Number.MAX_SAFE_INTEGER) ||
                String(left.code).localeCompare(String(right.code))
        )
        .map((course) => `${course.code} ${course.name}`);
}

/**
 * @brief Gets the skills line in curated order
 * @param data Resume data
 * @return TopSkills then ResumeSkills, without case-insensitive duplicates
 */
function collectSkills(data) {
    const seen = new Set();

    return [...(data.TopSkills ?? []), ...(data.ResumeSkills ?? [])].filter((name) => {
        const key = name.toLowerCase();

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

/**
 * @brief Checks the fields the CV renders
 * @param data Resume data
 * @return Nothing
 * @details Only entries bound for the CV are checked, so a half-written hidden entry is fine.
 */
function validate(data) {
    /**
     * @brief Checks for non-empty text
     * @param value Field value
     * @return True for a string with content
     */
    const isText = (value) => typeof value === 'string' && value.trim() !== '';
    /**
     * @brief Checks for a list of non-empty text, or a missing list
     * @param value Field value
     * @return True for an array of strings with content, or undefined
     */
    const isTextList = (value) =>
        value === undefined || (Array.isArray(value) && value.every(isText));

    requireField(isText(data.personal?.name), 'personal.name', 'text');
    requireField(
        Array.isArray(data.cv?.sections) && data.cv.sections.length > 0,
        'cv.sections',
        'a list with at least one section'
    );
    data.cv.sections.forEach((section, index) => {
        requireField(isText(section.id), `cv.sections[${index}].id`, 'text');
        requireField(isText(section.title), `cv.sections[${index}].title`, 'text');
        requireField(
            Object.keys(C_RENDERERS).includes(section.id),
            `cv.sections[${index}].id`,
            `one of ${Object.keys(C_RENDERERS).join(', ')}`
        );
    });

    onCv(data.experiences).forEach((entry, index) => {
        const field = `experiences[${index}]`;

        requireField(isText(entry.title), `${field}.title`, 'text');
        requireField(isText(entry.company), `${field}.company`, 'text');
        requireField(isText(entry.duration), `${field}.duration`, 'text');
        requireField(isTextList(entry.CV), `${field}.CV`, 'a list of text');
        requireField(isTextList(entry.Resume), `${field}.Resume`, 'a list of text');
    });

    onCv(data.projects).forEach((entry, index) => {
        const field = `projects[${index}]`;

        requireField(isText(entry.title), `${field}.title`, 'text');
        requireField(isText(entry.duration), `${field}.duration`, 'text');
        requireField(isTextList(entry.CV), `${field}.CV`, 'a list of text');
        requireField(isTextList(entry.Resume), `${field}.Resume`, 'a list of text');
    });

    requireField(cvEducation(data).length > 0, 'education', 'a list with an entry for the CV');
    cvEducation(data).forEach((entry, index) => {
        requireField(isText(entry.institution), `education[${index}].institution`, 'text');
        requireField(isText(entry.degree), `education[${index}].degree`, 'text');
        requireField(isTextList(entry.honors), `education[${index}].honors`, 'a list of text');
        requireField(
            isTextList(entry.scholarships),
            `education[${index}].scholarships`,
            'a list of text'
        );
    });

    onCv(data.certifications).forEach((entry, index) => {
        requireField(isText(entry.name), `certifications[${index}].name`, 'text');
    });

    onCv(data.organizations).forEach((entry, index) => {
        requireField(isText(entry.name), `organizations[${index}].name`, 'text');
    });
}

/**
 * @brief Joins the parts that exist
 * @param parts Strings, some possibly empty
 * @param separator Text between the parts
 * @return The non-empty parts joined
 */
function joinParts(parts, separator) {
    return parts.filter(Boolean).join(separator);
}

/**
 * @brief Renders a comma-separated list of escaped labels
 * @param labels Plain labels
 * @return Escaped LaTeX string
 */
function renderList(labels) {
    return (labels ?? []).map(escapeLatex).join(', ');
}

/**
 * @brief Renders one experience entry
 * @param experience Experience entry
 * @return LaTeX for the entry, with no list when it has no bullets
 */
function renderExperience(experience) {
    const skills = renderList(experience.skills);
    const location = experience.location ? escapeLatex(experience.location) : '';
    const details = skills && location ? `${skills} \\hfill ${location}` : skills || location;
    const bullets = cvBullets(experience);
    const head = `\\textbf{${escapeLatex(experience.title)}}, ${escapeLatex(experience.company)} \\hfill ${escapeLatex(formatDateRange(experience.duration))}`;

    return joinParts(
        [
            details ? `${head} \\\\\n${details}` : head,
            bullets.length > 0 ? renderBullets(bullets) : '',
        ],
        '\n'
    );
}

/**
 * @brief Renders one project entry
 * @param project Project entry
 * @return LaTeX for the entry, with no list when it has no bullets
 */
function renderProject(project) {
    const repository = project.github ? `\\href{${escapeUrl(project.github)}}{GitHub}` : '';
    const label = joinParts(
        [`\\textbf{${escapeLatex(project.title)}}`, renderList(project.skills), repository],
        ', '
    );
    const bullets = cvBullets(project);

    return joinParts(
        [
            `${label} \\hfill ${escapeLatex(formatDateRange(project.duration))}`,
            bullets.length > 0 ? renderBullets(bullets) : '',
        ],
        '\n'
    );
}

/**
 * @brief Renders a bold label followed by plain items on one line
 * @param label Label text
 * @param items Plain items
 * @return LaTeX line with the items separated by pipes, or an empty string when there are none
 */
function renderLabelledLine(label, items) {
    return items?.length > 0
        ? `\\textbf{${escapeLatex(label)}:} ${items.map(escapeLatex).join(' | ')}`
        : '';
}

/**
 * @brief Renders one education entry
 * @param education Education entry
 * @param includeGpa True when the GPA may print
 * @return LaTeX for the school, degree, honors, scholarships, and coursework
 */
function renderEducation(education, includeGpa) {
    const date = education.graduationDate
        ? ` \\hfill ${escapeLatex(education.graduationDate)}`
        : '';
    const degree = joinParts(
        [`\\textbf{${escapeLatex(education.degree)}}`, escapeLatex(education.minor ?? '')],
        ', '
    );
    const gpa = includeGpa && education.gpa ? `GPA: ${escapeLatex(education.gpa)}` : '';
    const coursework = cvCourseLabels(education);

    return joinParts(
        [
            `\\textbf{${escapeLatex(education.institution)}}${date}`,
            joinParts(
                [degree, education.location ? escapeLatex(education.location) : '', gpa],
                ', '
            ),
            renderLabelledLine('Honors', education.honors),
            renderLabelledLine('Scholarships', education.scholarships),
            coursework.length > 0
                ? `\\textbf{Coursework:} ${coursework.map(escapeLatex).join(', ')}`
                : '',
        ],
        '\n\\par\\vspace{\\listitem}\n'
    );
}

/**
 * @brief Renders one certification
 * @param certification Certification entry
 * @return LaTeX line with the name and issuer
 */
function renderCertification(certification) {
    return joinParts(
        [
            `\\textbf{${escapeLatex(certification.name)}}`,
            certification.organization ? escapeLatex(certification.organization) : '',
        ],
        ', '
    );
}

/**
 * @brief Renders one organization
 * @param organization Organization entry
 * @return LaTeX line with the name, chapter, role, and years
 */
function renderOrganization(organization) {
    const label = joinParts(
        [
            `\\textbf{${escapeLatex(organization.name)}}`,
            organization.chapter ? escapeLatex(organization.chapter) : '',
            organization.role ? escapeLatex(organization.role) : '',
        ],
        ', '
    );
    const years = organization.duration
        ? ` \\hfill ${escapeLatex(formatDateRange(organization.duration))}`
        : '';

    return `${label}${years}`;
}

/**
 * @brief The renderer for each section id the CV supports
 * @details Each takes the resume data and returns the LaTeX for the section body, or an empty
 * string when the section has nothing to show.
 */
const C_RENDERERS = {
    experience: (data) => onCv(data.experiences).map(renderExperience).join('\n\\entrygap\n'),
    projects: (data) => onCv(data.projects).map(renderProject).join('\n\\entrygap\n'),
    skills: (data) => `\\textbf{Skills:} ${renderList(collectSkills(data))}`,
    education: (data) =>
        cvEducation(data)
            .map((entry) => renderEducation(entry, data.cv.includeGpa === true))
            .join('\n\\entrygap\n'),
    certifications: (data) => onCv(data.certifications).map(renderCertification).join(' \\\\\n'),
    organizations: (data) => onCv(data.organizations).map(renderOrganization).join(' \\\\\n'),
};

/**
 * @brief Renders one section title with its PDF bookmark
 * @param section Section from cv.sections
 * @return LaTeX lines
 */
function renderSectionTitle({ id, title }) {
    return `\\section*{${escapeLatex(title)}}%\n\\pdfbookmark[1]{${escapeLatex(title)}}{${id}}%`;
}

/**
 * @brief Generates the LaTeX body of the CV
 * @param data Resume data
 * @return PDF metadata, header, and sections in cv.sections order
 */
function generateBody(data) {
    const name = escapeLatex(data.personal.name);
    const education = cvEducation(data)[0];
    const pdfKeywords = [
        name,
        ...collectSkills(data).map(escapeLatex),
        ...[education?.institution, education?.degree, data.personal.citizenship]
            .filter(Boolean)
            .map(escapeLatex),
    ].join(', ');

    const sections = data.cv.sections
        .map((section) => ({ section, body: C_RENDERERS[section.id](data) }))
        .filter(({ body }) => body !== '')
        .flatMap(({ section, body }) => [renderSectionTitle(section), body]);

    return [
        `\\hypersetup{pdftitle={${name} - Curriculum Vitae}, pdfauthor={${name}}, pdfsubject={Curriculum Vitae}, pdfkeywords={${pdfKeywords}}}`,
        `\\pdfbookmark[0]{${name} - Curriculum Vitae}{main}%`,
        `\\centerline{\\huge ${name}}%`,
        '\\vspace{3pt}%',
        `\\centerline{${renderContact(data.personal)}}%`,
        '\\vspace{\\afterheader}%',
        ...sections,
        '',
    ].join('\n');
}

/**
 * @brief Lists the text the finished PDF has to contain
 * @param data Resume data
 * @return Strings in reading order
 * @details Used by the text check in scripts/build-cv.js. Dates and locations share a line with
 * other text in ways a text extractor can reorder, so the check covers the name, contact items,
 * section titles, entry titles, bullets, skills, honors, coursework, certifications, and
 * organizations.
 */
export function expectedText(data) {
    const { name, linkedin, website, email, phone } = data.personal;
    const entries = {
        experience: () =>
            onCv(data.experiences).flatMap((entry) => [
                entry.title,
                entry.company,
                ...cvBullets(entry),
            ]),
        projects: () => onCv(data.projects).flatMap((entry) => [entry.title, ...cvBullets(entry)]),
        skills: () => collectSkills(data),
        education: () =>
            cvEducation(data).flatMap((entry) => [
                entry.institution,
                entry.degree,
                ...(entry.honors ?? []),
                ...(entry.scholarships ?? []),
                ...cvCourseLabels(entry),
            ]),
        certifications: () =>
            onCv(data.certifications).flatMap((entry) => [entry.name, entry.organization]),
        organizations: () => onCv(data.organizations).map((entry) => entry.name),
    };

    return [
        name,
        ...[linkedin, website].filter(Boolean).map(shortUrl),
        email,
        ...(C_SHOW_PHONE && phone ? [phone] : []),
        ...data.cv.sections
            .filter((section) => C_RENDERERS[section.id](data) !== '')
            .flatMap((section) => [section.title, ...entries[section.id]()]),
    ].filter(Boolean);
}

/**
 * @brief Reads and validates the resume data
 * @return Resume data
 */
function loadResumeData() {
    const data = JSON.parse(fs.readFileSync(C_DATA_PATH, 'utf8'));

    validate(data);

    return data;
}

/**
 * @brief Writes the LaTeX body for the build
 * @return Resume data, for the checks that follow
 */
export function writeCvBody() {
    const data = loadResumeData();

    fs.mkdirSync(C_BUILD_DIR, { recursive: true });
    fs.writeFileSync(path.join(C_BUILD_DIR, 'body.tex'), generateBody(data), 'utf8');
    console.log(`[SUCCESS] Generated ${path.relative(ROOT_DIR, C_BUILD_DIR)}/body.tex`);

    return data;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    writeCvBody();
}
