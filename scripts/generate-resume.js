/**
 * scripts/generate-resume.js
 * Generate Resume Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 09 November, 2026
 *
 * Turns resume-data.json into the LaTeX body of the resume, and into the list of text the finished
 * PDF has to contain. Only entries marked Visibility "All" reach the resume. A field with the wrong
 * kind of value stops the build and names the field. Fitting the page happens in
 * scripts/build-resume.js.
 *
 * File Structure:
 * - Global Constants: file paths and month abbreviations
 * - Text helpers: LaTeX escaping and date formatting
 * - Validation: names the first field that cannot be rendered
 * - Data helpers: resume-visible courses, skills, and profile text
 * - Rendering: LaTeX for each section and the full body
 * - expectedText: the strings the PDF must contain, in reading order
 *
 * Where this file is used within the repository:
 * - Run by scripts/build-resume.js before compiling the PDF
 *
 * Usage:
 * $ `node scripts/generate-resume.js` : Writes build/resume/body.tex from resume-data.json
 *
 * Copyright (c) 2026 Edward Silva. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C_DATA_PATH = path.join(ROOT_DIR, 'information', 'resume-data.json');

export const C_BUILD_DIR = path.join(ROOT_DIR, 'build', 'resume');

// Three-letter months on the PDF, where the space is tight. May is already three letters.
const C_MONTH_ABBREVIATIONS = {
    January: 'Jan',
    February: 'Feb',
    March: 'Mar',
    April: 'Apr',
    June: 'Jun',
    July: 'Jul',
    August: 'Aug',
    September: 'Sep',
    October: 'Oct',
    November: 'Nov',
    December: 'Dec',
};

const C_SIGNALS_ALIASES = ['Signals and Systems I', 'Signals and Systems II'];

/**
 * @brief Escapes special characters for LaTeX in a single pass
 * @param text Text to escape
 * @return Escaped LaTeX string
 * @details Control characters other than tab and newline are dropped first, since pdflatex
 * rejects them.
 */
function escapeLatex(text) {
    const replacements = {
        '\\': '\\textbackslash{}',
        $: '\\$',
        '#': '\\#',
        '%': '\\%',
        '&': '\\&',
        _: '\\_',
        '^': '\\^{}',
        '{': '\\{',
        '}': '\\}',
        '~': '\\textasciitilde{}',
        '<': '\\textless{}',
        '>': '\\textgreater{}',
    };

    const printable = Array.from(String(text))
        .filter((character) => {
            const code = character.charCodeAt(0);
            return character === '\t' || character === '\n' || (code > 31 && code !== 127);
        })
        .join('');

    return printable.replace(/[\\$#%&_^{}~<>]/g, (character) => replacements[character]);
}

/**
 * @brief Escapes a link target for \href
 * @param url Address to link to
 * @return The address with the characters hyperref treats specially escaped
 */
function escapeUrl(url) {
    return String(url).replace(/[\\#%{}]/g, (character) => `\\${character}`);
}

/**
 * @brief Formats a date range for the resume
 * @param text Date or duration string
 * @return String with months abbreviated and spaced hyphens turned into en dashes
 */
function formatDateRange(text) {
    const months = new RegExp(`\\b(${Object.keys(C_MONTH_ABBREVIATIONS).join('|')})\\b`, 'g');

    return text.replace(months, (month) => C_MONTH_ABBREVIATIONS[month]).replace(/\s-\s/g, ' – ');
}

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
 * @brief Checks the fields the resume renders
 * @param data Resume data
 * @return Nothing
 * @details Only entries bound for the resume are checked, so a half-written hidden entry is fine.
 */
function validate(data) {
    /**
     * @brief Checks for non-empty text
     * @param value Field value
     * @return True for a string with content
     */
    const isText = (value) => typeof value === 'string' && value.trim() !== '';
    /**
     * @brief Checks for a list of non-empty text
     * @param value Field value
     * @return True for an array of strings with content
     */
    const isTextList = (value) => Array.isArray(value) && value.every(isText);

    requireField(isText(data.personal?.name), 'personal.name', 'text');

    onResume(data.experiences).forEach((entry, index) => {
        const field = `experiences[${index}]`;

        requireField(isText(entry.title), `${field}.title`, 'text');
        requireField(isText(entry.company), `${field}.company`, 'text');
        requireField(isText(entry.duration), `${field}.duration`, 'text');
        requireField(isTextList(entry.Resume), `${field}.Resume`, 'a list of text');
    });

    onResume(data.projects).forEach((entry, index) => {
        const field = `projects[${index}]`;

        requireField(isText(entry.title), `${field}.title`, 'text');
        requireField(isText(entry.duration), `${field}.duration`, 'text');
        requireField(isTextList(entry.Resume), `${field}.Resume`, 'a list of text');
    });

    requireField(
        Array.isArray(data.education) && data.education.length > 0,
        'education',
        'a list with at least one entry'
    );
}

/**
 * @brief Keeps the entries marked for the resume
 * @param entries Raw entries from resume data
 * @return Entries with Visibility "All"
 */
function onResume(entries) {
    return (entries ?? []).filter((entry) => entry.Visibility === 'All');
}

/**
 * @brief Gets the education entries for the resume
 * @param data Resume data
 * @return Marked entries, or the first entry when none is marked
 */
function resumeEducation(data) {
    const marked = onResume(data.education);

    return marked.length > 0 ? marked : data.education.slice(0, 1);
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
 * @brief Gets the courses marked for the resume
 * @param data Resume data
 * @return Courses ordered by Priority, then by code
 */
function collectCourses(data) {
    const courses = data.education.flatMap((entry) => Object.values(entry.courses ?? {}).flat());

    return onResume(courses).sort(
        (left, right) =>
            (left.Priority ?? Number.MAX_SAFE_INTEGER) -
                (right.Priority ?? Number.MAX_SAFE_INTEGER) ||
            String(left.code).localeCompare(String(right.code))
    );
}

/**
 * @brief Gets the coursework names for the resume
 * @param courses Courses marked for the resume
 * @return Display names, with both Signals and Systems courses merged into one
 */
function courseworkNames(courses) {
    const aliases = courses.map((course) => course.alias);
    const mergeSignals = C_SIGNALS_ALIASES.every((alias) => aliases.includes(alias));
    const names = courses
        .filter((course) => !(mergeSignals && C_SIGNALS_ALIASES.includes(course.alias)))
        .map((course) => course.alias || course.name);

    return mergeSignals ? ['Signals and Systems I/II', ...names] : names;
}

/**
 * @brief Gets the profile line, when the about section is marked for the resume
 * @param data Resume data
 * @return Profile text, or an empty string
 */
function profileText(data) {
    return data.about?.Visibility === 'All' ? data.about.Resume || data.about.Highlights || '' : '';
}

/**
 * @brief Renders a bullet list
 * @param bullets Bullet strings
 * @return LaTeX itemize block
 */
function renderBullets(bullets) {
    const items = bullets.map((bullet) => `  \\item\\relax ${escapeLatex(bullet)}`).join('\n');

    return `\\begin{itemize}\n${items}\n\\end{itemize}`;
}

/**
 * @brief Renders a comma-separated skill list
 * @param skills Skill labels
 * @return Escaped LaTeX string
 */
function renderSkills(skills) {
    return (skills ?? []).map(escapeLatex).join(', ');
}

/**
 * @brief Renders one experience entry
 * @param experience Experience entry
 * @return LaTeX for the entry
 */
function renderExperience(experience) {
    const skills = renderSkills(experience.skills);
    const location = experience.location ? escapeLatex(experience.location) : '';
    const details =
        skills && location
            ? `${skills} \\hfill ${location}`
            : skills || (location && `\\hfill ${location}`);

    return `\\textbf{${escapeLatex(experience.title)}}, ${escapeLatex(experience.company)} \\hfill ${escapeLatex(formatDateRange(experience.duration))} \\\\\n${details}\n${renderBullets(experience.Resume)}`;
}

/**
 * @brief Renders one project entry
 * @param project Project entry
 * @return LaTeX for the entry
 */
function renderProject(project) {
    const repository = project.github ? `\\href{${escapeUrl(project.github)}}{GitHub}` : '';

    return `\\textbf{${escapeLatex(project.title)}}, ${renderSkills(project.skills)} ${repository} \\hfill ${escapeLatex(formatDateRange(project.duration))}\n${renderBullets(project.Resume)}`;
}

/**
 * @brief Renders one education entry
 * @param education Education entry
 * @return LaTeX lines for the school and degree
 */
function renderEducation(education) {
    const date = education.graduationDate ? `\\hfill ${escapeLatex(education.graduationDate)}` : '';
    const degree = `\\textbf{${escapeLatex(education.degree)}}`;
    const degreeLine = education.minor
        ? `${degree}, ${escapeLatex(education.minor)}`
        : `${degree}${education.specialization ? ` -- ${escapeLatex(education.specialization)}` : ''}`;

    return `\\textbf{${escapeLatex(education.institution)}} ${date} \\\\\n${degreeLine} \\\\`;
}

/**
 * @brief Gets a URL as a person reads it
 * @param url Full URL
 * @return URL with no scheme and no www.
 */
function shortUrl(url) {
    return url.replace(/^https?:\/\/(www\.)?/, '');
}

/**
 * @brief Renders the contact line under the name
 * @param personal Personal details
 * @return LaTeX links separated by pipes
 */
function renderContact({ linkedin, website, email, phone }) {
    const parts = [];

    if (linkedin) {
        parts.push(`\\href{${escapeUrl(linkedin)}}{${escapeLatex(shortUrl(linkedin))}}`);
    }

    if (website) {
        parts.push(`\\href{${escapeUrl(website)}}{${escapeLatex(shortUrl(website))}}`);
    }

    if (email) {
        parts.push(`\\href{mailto:${escapeUrl(email)}}{${escapeLatex(email)}}`);
    }

    if (phone) {
        parts.push(`\\href{tel:${phone.replace(/\D/g, '')}}{${escapeLatex(phone)}}`);
    }

    return parts.join(' | ');
}

/**
 * @brief Renders one section title with its PDF bookmark
 * @param title Section title
 * @return LaTeX lines
 */
function renderSectionTitle(title) {
    return `\\section*{${title}}%\n\\pdfbookmark[1]{${title}}{${title.toLowerCase()}}%`;
}

/**
 * @brief Generates the LaTeX body of the resume
 * @param data Resume data
 * @return PDF metadata, header, and sections
 */
function generateBody(data) {
    const name = escapeLatex(data.personal.name);
    const skills = collectSkills(data).map(escapeLatex);
    const educations = resumeEducation(data);
    const primaryEducation = educations[0];
    const coursework = courseworkNames(collectCourses(data)).join(', ');
    const profile = profileText(data);
    const pdfKeywords = [
        name,
        ...skills,
        ...[
            primaryEducation?.institution,
            primaryEducation?.degree,
            primaryEducation?.specialization,
            data.personal.citizenship,
        ]
            .filter(Boolean)
            .map(escapeLatex),
    ].join(', ');

    return [
        `\\hypersetup{pdftitle={${name} - Resume}, pdfauthor={${name}}, pdfsubject={Resume}, pdfkeywords={${pdfKeywords}}}`,
        `\\pdfbookmark[0]{${name} - Resume}{main}%`,
        `\\centerline{\\huge ${name}}%`,
        '\\vspace{3pt}%',
        `\\centerline{${renderContact(data.personal)}}%`,
        '\\vspace{\\afterheader}%',
        ...(profile ? [renderSectionTitle('Profile'), escapeLatex(profile)] : []),
        renderSectionTitle('Experience'),
        onResume(data.experiences).map(renderExperience).join('\n\\entrygap\n'),
        renderSectionTitle('Projects'),
        onResume(data.projects).map(renderProject).join('\n\\entrygap\n'),
        renderSectionTitle('Skills'),
        `\\textbf{Skills:} ${skills.join(', ')}`,
        renderSectionTitle('Education'),
        educations.map(renderEducation).join('\n\n'),
        ...(coursework ? [`\\textbf{Relevant Coursework:} ${escapeLatex(coursework)}`] : []),
        '',
    ].join('\n');
}

/**
 * @brief Lists the text the finished PDF has to contain
 * @param data Resume data
 * @return Strings in reading order
 * @details Used by the text check in scripts/build-resume.js. Dates and locations share a line
 * with other text in ways a text extractor can reorder, so the check covers the name, contact
 * items, section titles, entry titles, bullets, skills, and coursework.
 */
export function expectedText(data) {
    const { name, linkedin, website, email, phone } = data.personal;
    const profile = profileText(data);
    const courses = courseworkNames(collectCourses(data));
    const educations = resumeEducation(data);

    return [
        name,
        ...[linkedin, website].filter(Boolean).map(shortUrl),
        email,
        phone,
        ...(profile ? ['Profile', profile] : []),
        'Experience',
        ...onResume(data.experiences).flatMap((entry) => [
            entry.title,
            entry.company,
            ...entry.Resume,
        ]),
        'Projects',
        ...onResume(data.projects).flatMap((entry) => [entry.title, ...entry.Resume]),
        'Skills',
        ...collectSkills(data),
        'Education',
        ...educations.flatMap((entry) => [entry.institution, entry.degree]),
        ...courses,
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
export function writeResumeBody() {
    const data = loadResumeData();

    fs.mkdirSync(C_BUILD_DIR, { recursive: true });
    fs.writeFileSync(path.join(C_BUILD_DIR, 'body.tex'), generateBody(data), 'utf8');
    console.log(`[SUCCESS] Generated ${path.relative(ROOT_DIR, C_BUILD_DIR)}/body.tex`);

    return data;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    writeResumeBody();
}
