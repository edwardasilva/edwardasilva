/**
 * scripts/generate-resume.js
 * Generate Resume Script
 *
 * Author: Edward Silva
 * Creation Date: 16 March, 2026
 * Last Update: 14 April, 2026
 *
 * Generates LaTeX resume files from resume-data.json. Includes filtering, formatting,
 * and auto-spacing algorithms for ATS-friendly one-page PDF output.
 *
 * File Structure:
 * - Utility Functions: loadResumeData, writeFile, escapeLatex
 * - Filter Functions: Various data filtering for resume vs website display
 * - Spacing Calculation: Auto-fitting content to target page count
 * - LaTeX Generation: Template building and resume variation output
 * - Main Logic: Data loading and file generation
 *
 * Used in: Build process, GitHub Actions CI/CD
 * Invoked via: node scripts/generate-resume.js or npm run generate:resume
 *
 * Licence/Copyright: Licensed under MIT License
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @brief Loads and parses resume data from JSON file
 * @return Parsed resume data object
 * @details Exits with error if file not found or JSON is invalid
 */
function loadResumeData() {
  try {
    const resumePath = path.resolve(__dirname, '..', 'src', 'data', 'resume-data.json');
    const data = fs.readFileSync(resumePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading resume data:', error.message);
    process.exit(1);
  }
}

/**
 * @brief Writes content to a file
 * @param filepath The destination file path
 * @param content The content to write
 * @details Logs success or error; does not exit on failure
 */
function writeFile(filepath, content) {
  try {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Generated: ${filepath}`);
  } catch (error) {
    console.error(`Error writing ${filepath}:`, error.message);
  }
}

/**
 * @brief Escapes special characters for LaTeX
 * @param text The text to escape
 * @return Escaped LaTeX string
 * @details Handles backslash, dollar, braces, underscore, and other special chars
 */
function escapeLatex(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\^{}')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

// ============ Filter Functions ============

const filters = {
  filterResumeExperience(experiences) {
    return experiences.filter((exp) => exp.experienceType === 'All');
  },
  filterResumeProjects(projects) {
    return projects.filter((project) => project.experienceType === 'All');
  },
  filterResumeEducation(education) {
    return education.filter((edu) => edu.experienceType === 'All');
  },
  filterResumeSkills(skills) {
    const filtered = {};
    Object.entries(skills).forEach(([category, skillList]) => {
      filtered[category] = skillList.filter(
        (skill) => typeof skill === 'string' || skill.experienceType === 'All'
      );
    });
    return filtered;
  },
  filterResumeCourses(courses) {
    const allCourses = [];
    Object.values(courses).forEach((categoryCourses) => {
      const filteredCourses = categoryCourses.filter(
        (course) => course.experienceType === 'All' || !course.experienceType
      );
      allCourses.push(...filteredCourses);
    });
    return allCourses;
  },
  shouldShowResumeProfile(profile) {
    if (!profile) return false;
    if (typeof profile === 'string') return true;
    return profile.experienceType === 'All';
  },
  getProfileText(profile) {
    if (!profile) return null;
    return typeof profile === 'string' ? profile : profile.text;
  },
  getEducationContext(education, supplementary = {}) {
    if (!Array.isArray(education) || education.length === 0)
      return { primaryEducation: null, supplementary };
    const isMasters = (e) => {
      const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
      return deg.startsWith('ms') || deg.includes('master');
    };
    const allEntries = education.filter((e) => e && e.experienceType === 'All');
    const mastersPrimary = allEntries.find(isMasters);
    const primary = mastersPrimary || allEntries[0] || education[0];
    return { primaryEducation: primary, supplementary };
  },
  filterWebsiteEducation(education) {
    return education.filter((edu) => edu.experienceType === 'All' || edu.experienceType === 'Site');
  },
  filterWebsiteSkills(skills) {
    const filtered = {};
    Object.entries(skills).forEach(([category, skillList]) => {
      filtered[category] = skillList.filter(
        (skill) =>
          typeof skill === 'string' ||
          skill.experienceType === 'All' ||
          skill.experienceType === 'Site'
      );
    });
    return filtered;
  },
  filterWebsiteCertifications(certifications) {
    return certifications.filter(
      (cert) =>
        typeof cert === 'string' ||
        cert.experienceType === 'All' ||
        cert.experienceType === 'Site' ||
        !cert.experienceType
    );
  },
};

/**
 * @brief Extracts skill names from skill objects
 * @param skills Array of skill objects or strings
 * @return Array of skill name strings
 */
function extractSkillNames(skills) {
  return skills.map((skill) => (typeof skill === 'string' ? skill : skill.name));
}

// ============ LaTeX Generation ============

/**
 * @brief Estimates wrapped line count for text
 * @param text The text to measure
 * @param charsPerLine Expected characters per line
 * @return Estimated number of wrapped lines
 * @details Used for auto-spacing calculations
 */
function estimateWrappedLines(text, charsPerLine) {
  if (!text) return 0;
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (!s) return 0;
  return Math.max(1, Math.ceil(s.length / charsPerLine));
}

/**
 * @brief Calculates optimal spacing profile to fit content to target page count
 * @param data The resume data object
 * @param includeProfile Whether to include profile section
 * @param includeMS Whether to include Masters degree
 * @param shouldStackMsBs Whether MS/BS are stacked
 * @param targetPages Target number of pages for output
 * @return Spacing profile object with calculated values
 * @details Uses binary search to find minimum tightening for ATS-friendly formatting
 */
function calculateSpacingProfile({
  data,
  includeProfile,
  includeMS,
  shouldStackMsBs,
  targetPages = 1,
}) {
  const CHARS_PER_LINE = 95; // ~chars per line at 11pt with 0.5" margins
  const BASELINE_PTS = 12.6; // baseline skip for 11pt
  const PAGE_TEXTHEIGHT_PTS = 10 * 72; // 10in usable height
  const LINES_PER_PAGE = PAGE_TEXTHEIGHT_PTS / BASELINE_PTS;
  const CAP_LINES = targetPages * LINES_PER_PAGE;

  const resumeExperience = filters.filterResumeExperience(data.experiences || []);
  const resumeProjects = filters.filterResumeProjects(data.projects || []);
  const resumeCourses = filters.filterResumeCourses(data.educationSupplementary?.courses || {});
  const filteredSkills = filters.filterResumeSkills(data.skills || {});

  const courseworkLine = (resumeCourses || [])
    .map((c) => c?.alias || c?.name || c)
    .filter(Boolean)
    .join(', ');

  const profileText = includeProfile ? filters.getProfileText(data.profile) : null;

  // Extracurriculars are intentionally omitted from the generated resumes.
  const extracurricularText = '';

  // Spacing bounds: loose when there's room, tight when cramped
  const loose = {
    sectionBeforeBs: 0.65,
    sectionAfterBs: 0.45,
    entryGapPt: 8.0,
    itemsepPt: 2.0,
    topsepPt: 3.0,
    afterHeaderPt: 8.0,
  };
  const tight = {
    sectionBeforeBs: 0.3,
    sectionAfterBs: 0.2,
    entryGapPt: 3.0,
    itemsepPt: 1.0,
    topsepPt: 1.5,
    afterHeaderPt: 4.0,
  };

  /**
   * @brief Interpolates between two numeric values
   * @param a Start value
   * @param b End value
   * @param t Interpolation ratio between 0 and 1
   * @return Interpolated numeric value
   */
  const lerp = (a, b, t) => a + (b - a) * t;

  /**
   * @brief Estimates the total rendered line usage for a spacing profile
   * @param sp Candidate spacing profile values
   * @return Estimated total line count consumed by the resume content
   * @details Includes section headers, lists, wrapped text, and spacing overhead.
   */
  function estimateTotalLines(sp) {
    // Header: name line + small vspace + contact line.
    let lines = 1 + 0.25 + 1;
    lines += (sp.afterHeaderPt || 0) / BASELINE_PTS;

    // Education section.
    lines += 1 + sp.sectionBeforeBs + sp.sectionAfterBs;
    // Education body is typically 2 lines for BS; stacked MS/BS can be 3.
    lines += includeMS ? (shouldStackMsBs ? 3 : 2) : 2;
    if (courseworkLine) {
      // “Relevant Coursework:” + list can wrap.
      lines += estimateWrappedLines(`Relevant Coursework: ${courseworkLine}`, CHARS_PER_LINE);
    }

    // Skills section: 3 lines that may wrap.
    lines += 1 + sp.sectionBeforeBs + sp.sectionAfterBs;
    const skillLines = [
      `Programming Languages: ${extractSkillNames(filteredSkills.Programming || []).join(', ')}`,
      `Hardware: ${extractSkillNames(filteredSkills.Hardware || []).join(', ')}`,
      `Software: ${extractSkillNames(filteredSkills.Software || []).join(', ')}`,
    ];
    lines += skillLines.reduce((sum, s) => sum + estimateWrappedLines(s, CHARS_PER_LINE), 0);

    // Experience section.
    lines += 1 + sp.sectionBeforeBs + sp.sectionAfterBs;
    resumeExperience.forEach((exp, idx) => {
      lines += 1; // title/company/location/dates line

      const items = Array.isArray(exp.description) ? exp.description : [];
      const bulletLines = items.reduce(
        (sum, item) => sum + estimateWrappedLines(item, CHARS_PER_LINE),
        0
      );

      // itemize overhead: topsep before+after, itemsep between items.
      const overheadPt = 2 * sp.topsepPt + Math.max(0, items.length - 1) * sp.itemsepPt;
      lines += overheadPt / BASELINE_PTS;
      lines += bulletLines;

      if (idx < resumeExperience.length - 1) {
        lines += sp.entryGapPt / BASELINE_PTS;
      }
    });

    // Projects section.
    lines += 1 + sp.sectionBeforeBs + sp.sectionAfterBs;
    resumeProjects.forEach((project, idx) => {
      lines += estimateWrappedLines(
        `${project.title}, ${(project.technologies || []).join(', ')} ${project.github ? 'Github' : ''}`,
        CHARS_PER_LINE
      ); // project header can wrap

      const items = Array.isArray(project.description) ? project.description : [];
      const bulletLines = items.reduce(
        (sum, item) => sum + estimateWrappedLines(item, CHARS_PER_LINE),
        0
      );

      const overheadPt = 2 * sp.topsepPt + Math.max(0, items.length - 1) * sp.itemsepPt;
      lines += overheadPt / BASELINE_PTS;
      lines += bulletLines;

      if (idx < resumeProjects.length - 1) {
        lines += sp.entryGapPt / BASELINE_PTS;
      }
    });

    // Extracurriculars section intentionally omitted.

    return lines;
  }

  const looseEstimate = estimateTotalLines(loose);

  let mode = looseEstimate <= CAP_LINES ? 'loose' : 'tighten';
  let t = 0;

  if (mode === 'tighten') {
    // Binary search for minimum tightening needed
    let loT = 0;
    let hiT = 1;
    for (let i = 0; i < 16; i++) {
      const mid = (loT + hiT) / 2;
      const sp = {
        sectionBeforeBs: lerp(loose.sectionBeforeBs, tight.sectionBeforeBs, mid),
        sectionAfterBs: lerp(loose.sectionAfterBs, tight.sectionAfterBs, mid),
        entryGapPt: lerp(loose.entryGapPt, tight.entryGapPt, mid),
        itemsepPt: lerp(loose.itemsepPt, tight.itemsepPt, mid),
        topsepPt: lerp(loose.topsepPt, tight.topsepPt, mid),
        afterHeaderPt: lerp(loose.afterHeaderPt, tight.afterHeaderPt, mid),
      };
      const est = estimateTotalLines(sp);
      if (est <= CAP_LINES) hiT = mid;
      else loT = mid;
    }
    t = hiT;
  }

  const raw =
    mode === 'tighten'
      ? {
          sectionBeforeBs: lerp(loose.sectionBeforeBs, tight.sectionBeforeBs, t),
          sectionAfterBs: lerp(loose.sectionAfterBs, tight.sectionAfterBs, t),
          entryGapPt: lerp(loose.entryGapPt, tight.entryGapPt, t),
          itemsepPt: lerp(loose.itemsepPt, tight.itemsepPt, t),
          topsepPt: lerp(loose.topsepPt, tight.topsepPt, t),
          afterHeaderPt: lerp(loose.afterHeaderPt, tight.afterHeaderPt, t),
        }
      : { ...loose };

  const spFinal = {
    sectionBeforeBs: raw.sectionBeforeBs,
    sectionAfterBs: raw.sectionAfterBs,
    entryGap: `${raw.entryGapPt.toFixed(1)}pt`,
    itemsep: `${raw.itemsepPt.toFixed(1)}pt`,
    topsep: `${raw.topsepPt.toFixed(1)}pt`,
    afterHeader: `${raw.afterHeaderPt.toFixed(1)}pt`,
    _debug: {
      mode,
      estimatedLines: estimateTotalLines(raw),
      capLines: CAP_LINES,
      tightness: t,
    },
  };

  if (process.env.RESUME_DEBUG_SPACING === '1') {
    console.log('[resume spacing] targetPages:', targetPages);
    console.log('[resume spacing] mode:', spFinal._debug.mode);
    console.log('[resume spacing] t:', spFinal._debug.tightness.toFixed(3));
    console.log(
      '[resume spacing] estimatedLines:',
      spFinal._debug.estimatedLines.toFixed(1),
      '/',
      spFinal._debug.capLines.toFixed(1)
    );
    console.log('[resume spacing] SP:', {
      sectionBeforeBs: spFinal.sectionBeforeBs.toFixed(2),
      sectionAfterBs: spFinal.sectionAfterBs.toFixed(2),
      entryGap: spFinal.entryGap,
      itemsep: spFinal.itemsep,
      topsep: spFinal.topsep,
      afterHeader: spFinal.afterHeader,
    });
  }

  return spFinal;
}

/**
 * @brief Generates LaTeX resume from resume data
 * @param data The resume data object
 * @param options Configuration options for generation
 * @param options.includeMS Whether to include Masters degree
 * @param options.includeProfile Whether to include profile summary
 * @param options.targetPages Target page count for auto-spacing
 * @return Complete LaTeX document string ready for compilation
 * @details Builds sections: experience, projects, education, skills with ATS-friendly formatting
 */
function generateResume(data, options = {}) {
  const { includeMS = false, includeProfile = false, targetPages = 1 } = options;

  const allExperiences = data.experiences || [];
  const resumeExperience = filters.filterResumeExperience(allExperiences);
  const resumeProjects = filters.filterResumeProjects(data.projects);

  let resumeEducations = filters.filterResumeEducation(data.education);
  if (includeMS) {
    const msEducations = data.education.filter((edu) => {
      const degree = (edu.degree || '').toLowerCase();
      return (
        (degree.startsWith('ms') || degree.includes('master')) && !resumeEducations.includes(edu)
      );
    });
    resumeEducations = [...resumeEducations, ...msEducations];
  }

  const { primaryEducation } =
    filters.getEducationContext(data.education, data.educationSupplementary) || {};

  const shouldShowProfile = includeProfile || filters.shouldShowResumeProfile(data.profile);
  const profileText = shouldShowProfile ? filters.getProfileText(data.profile) : null;

  const resumeCourses = filters.filterResumeCourses(data.educationSupplementary?.courses || {});
  const hasSS1 = resumeCourses.some((c) => c.alias === 'Signals and Systems I');
  const hasSS2 = resumeCourses.some((c) => c.alias === 'Signals and Systems II');

  const courseNames = resumeCourses
    .map((course) => {
      if (
        (course.alias === 'Signals and Systems I' || course.alias === 'Signals and Systems II') &&
        hasSS1 &&
        hasSS2
      ) {
        return null;
      }
      if (course.alias) return course.alias;
      return course.name || course;
    })
    .filter(Boolean);

  if (hasSS1 && hasSS2) {
    courseNames.unshift('Signals and Systems I/II');
  }

  const courseworkLine = courseNames.length > 0 ? courseNames.join(', ') : '';

  const isMasters = (e) => {
    const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
    return deg.startsWith('ms') || deg.includes('master');
  };
  const isBachelors = (e) => {
    const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
    return deg.startsWith('bs') || deg.includes('bachelor');
  };

  const filteredEducations = includeMS
    ? resumeEducations
    : resumeEducations.filter((e) => !isMasters(e));

  const mastersEntry = includeMS ? resumeEducations.find(isMasters) || null : null;
  const bachelorsEntry = filteredEducations.find(isBachelors) || null;
  const shouldStackMsBs = Boolean(mastersEntry);

  const otherEducations = filteredEducations.filter(
    (e) => e && e !== mastersEntry && e !== bachelorsEntry && e !== primaryEducation
  );
  const otherEducationBlocks = shouldStackMsBs
    ? ''
    : otherEducations
        .map((ed) => {
          const lines = [];
          const inst = ed.institution || '';
          const expected = ed.expectedGraduation
            ? `Expected ${escapeLatex(ed.expectedGraduation)}`
            : '';
          lines.push(
            `\\textbf{${escapeLatex(inst)}} ${expected ? `\\hfill ${expected}` : ''} \\\\`
          );
          const degreeLine = `\\textbf{${escapeLatex(ed.degree || '')}}${ed.specialization ? ` -- ${escapeLatex(ed.specialization)}` : ''}`;
          lines.push(`${degreeLine} \\\\`);
          if (ed.minor || ed.minorSpecialization) {
            lines.push(
              `${escapeLatex(ed.minor || '')}${ed.minorSpecialization ? ` -- ${escapeLatex(ed.minorSpecialization)}` : ''} \\\\`
            );
          }
          return lines.join('\n');
        })
        .join('\n\n');

  /**
   * @brief Builds the LaTeX body for the Education section
   * @return Education section body as LaTeX lines
   * @details Handles stacked MS/BS output when both entries are present.
   */
  const buildEducationBody = () => {
    if (shouldStackMsBs && mastersEntry) {
      const inst =
        mastersEntry.institution ||
        (bachelorsEntry
          ? bachelorsEntry.institution
          : primaryEducation
            ? primaryEducation.institution
            : '');
      const lines = [];
      lines.push(`\\textbf{${escapeLatex(inst)}} \\\\`);
      const msExpected = mastersEntry.expectedGraduation
        ? ` \\hfill Expected ${escapeLatex(mastersEntry.expectedGraduation)}`
        : '';
      lines.push(
        `\\textbf{${escapeLatex(mastersEntry.degree)}}${mastersEntry.specialization ? ` -- ${escapeLatex(mastersEntry.specialization)}` : ''}${msExpected} \\\\`
      );
      if (bachelorsEntry) {
        const bsExpected = bachelorsEntry.expectedGraduation
          ? ` \\hfill Expected ${escapeLatex(bachelorsEntry.expectedGraduation)}`
          : '';
        const bsDegreeNorm = String(bachelorsEntry.degree || '')
          .replace(/\b[in]\b\s*/i, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();
        const bsMinorPart = bachelorsEntry.minor ? `, ${escapeLatex(bachelorsEntry.minor)}` : '';
        lines.push(`\\textbf{${escapeLatex(bsDegreeNorm)}}${bsMinorPart}${bsExpected} \\\\`);
      }
      return lines.join('\n');
    }

    const eduToDisplay = !includeMS && bachelorsEntry ? bachelorsEntry : primaryEducation;

    if (eduToDisplay) {
      const lines = [];
      lines.push(
        `\\textbf{${escapeLatex(eduToDisplay.institution)}} ${eduToDisplay.expectedGraduation ? `\\hfill Expected ${escapeLatex(eduToDisplay.expectedGraduation)}` : ''} \\\\`
      );
      if (eduToDisplay.degree && eduToDisplay.minor) {
        lines.push(
          `\\textbf{${escapeLatex(eduToDisplay.degree)}}, ${escapeLatex(eduToDisplay.minor)} \\\\`
        );
      } else {
        lines.push(
          `\\textbf{${escapeLatex(eduToDisplay.degree)}}${eduToDisplay.specialization ? ` -- ${escapeLatex(eduToDisplay.specialization)}` : ''} \\\\`
        );
        if (eduToDisplay.minor || eduToDisplay.minorSpecialization) {
          lines.push(
            `${escapeLatex(eduToDisplay.minor || '')}${eduToDisplay.minorSpecialization ? ` -- ${escapeLatex(eduToDisplay.minorSpecialization)}` : ''} \\\\`
          );
        }
      }
      return lines.join('\n');
    }
    return '';
  };
  const educationBody = buildEducationBody();

  const contactParts = [];
  if (data.personal.linkedin)
    contactParts.push(
      `\\href{${data.personal.linkedin}}{${escapeLatex(data.personal.linkedin.replace('https://www.', '').replace('http://www.', ''))}}`
    );
  if (data.personal.website)
    contactParts.push(
      `\\href{${data.personal.website}}{${escapeLatex(data.personal.website.replace('https://', '').replace('http://', ''))}}`
    );
  if (data.personal.email)
    contactParts.push(`\\href{mailto:${data.personal.email}}{${escapeLatex(data.personal.email)}}`);
  if (data.personal.phone) {
    const telHref = data.personal.phone.replace(/\D/g, '');
    contactParts.push(`\\href{tel:${telHref}}{${escapeLatex(data.personal.phone)}}`);
  }
  const contactLine = contactParts.join(' | ');

  const pdfKeywordParts = [];
  pdfKeywordParts.push(escapeLatex(data.personal.name));
  pdfKeywordParts.push(
    ...extractSkillNames(filters.filterResumeSkills(data.skills).Programming).map((s) =>
      escapeLatex(s)
    )
  );
  if (primaryEducation && primaryEducation.institution)
    pdfKeywordParts.push(escapeLatex(primaryEducation.institution));
  if (primaryEducation && primaryEducation.degree)
    pdfKeywordParts.push(escapeLatex(primaryEducation.degree));
  if (primaryEducation && primaryEducation.specialization)
    pdfKeywordParts.push(escapeLatex(primaryEducation.specialization));
  if (data.personal && data.personal.citizenship)
    pdfKeywordParts.push(escapeLatex(data.personal.citizenship));
  const pdfkeywords = pdfKeywordParts.join(', ');

  // Calculate spacing (set RESUME_DEBUG_SPACING=1 to see estimates)
  const SP = calculateSpacingProfile({
    data,
    includeProfile: Boolean(profileText),
    includeMS: Boolean(includeMS),
    shouldStackMsBs,
    targetPages,
  });

  // Build Experience section
  const experienceSection = resumeExperience
    .map(
      (exp) =>
        `\\textbf{${escapeLatex(exp.title)}, }{${escapeLatex(exp.company)}} -- ${escapeLatex(exp.location)} \\hfill ${escapeLatex(exp.duration)} \\\\
\\begin{itemize}
${exp.description.map((item) => `  \\item ${escapeLatex(item)}`).join('\n')}
\\end{itemize}`
    )
    .join(`\\vspace{${SP.entryGap}}\n`);

  // Build Projects section
  const projectsSection = resumeProjects
    .map(
      (project) =>
        `\\textbf{${escapeLatex(project.title)}}, ${project.technologies.map((tech) => escapeLatex(tech)).join(', ')} ${project.github ? `\\href{${project.github}}{Github}` : ''} \\hfill ${escapeLatex(project.duration)}
\\begin{itemize}
${project.description.map((item) => `  \\item ${escapeLatex(item)}`).join('\n')}
\\end{itemize}`
    )
    .join(`\\vspace{${SP.entryGap}}\n`);

  // Build Education section (no blank lines)
  const educationSection = [
    (educationBody || '').trim(),
    otherEducationBlocks ? String(otherEducationBlocks).trim() : '',
    courseworkLine ? `\\textbf{Relevant Coursework:} ${escapeLatex(courseworkLine)} \\\\` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Build Skills section
  const skillsSection = [
    `\\textbf{Programming Languages:} ${extractSkillNames(
      filters.filterResumeSkills(data.skills).Programming
    )
      .map((skill) => escapeLatex(skill))
      .join(', ')} \\\\`,
    `\\textbf{Hardware:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Hardware)
      .map((skill) => escapeLatex(skill))
      .join(', ')} \\\\`,
    `\\textbf{Software:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Software)
      .map((skill) => escapeLatex(skill))
      .join(', ')}`,
  ].join('\n');

  // Profile section (optional)
  const profileSection = profileText
    ? `\\section*{Profile}%
\\pdfbookmark[1]{Profile}{profile}%
${escapeLatex(profileText)}
`
    : '';

  const template = `\\documentclass[11pt]{article}
\\usepackage{geometry}
\\geometry{letterpaper,top=0.5in,bottom=0.5in,left=0.5in,right=0.5in}
% --- Auto spacing profile (generated) ---
% estimatedLines: ${SP._debug.estimatedLines.toFixed(1)} / capLines: ${SP._debug.capLines.toFixed(1)} / tightness: ${SP._debug.tightness.toFixed(3)}
\\usepackage{XCharter}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{bookmark}
\\usepackage{titlesec}
\\usepackage[protrusion=true,expansion=true]{microtype}
\\raggedright
\\pagestyle{plain}
\\usepackage{lmodern}
\\urlstyle{same}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\input{glyphtounicode}
\\pdfgentounicode=1
\\title{${escapeLatex(data.personal.name)} - Resume}
\\author{${escapeLatex(data.personal.name)}}
\\hypersetup{
    pdftitle={${escapeLatex(data.personal.name)} - Resume},
    pdfauthor={${escapeLatex(data.personal.name)}},
    pdfsubject={Resume},
    pdfkeywords={${pdfkeywords}},
    colorlinks=false,linkcolor=black,urlcolor=black,citecolor=black,filecolor=black
}
% Section styling and spacing
\\titleformat{\\section}{\\bfseries\\large}{}{0pt}{}[\\vspace{2pt}\\titlerule]
\\titlespacing*{\\section}{0pt}{${SP.sectionBeforeBs.toFixed(2)}\\baselineskip}{${SP.sectionAfterBs.toFixed(2)}\\baselineskip}
% List spacing
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\setlist[itemize]{leftmargin=12pt,topsep=${SP.topsep},itemsep=${SP.itemsep},parsep=0pt,partopsep=0pt}
\\begin{document}
\\thispagestyle{empty}
\\pdfbookmark[0]{${escapeLatex(data.personal.name)} - Resume}{main}%
\\centerline{\\huge ${escapeLatex(data.personal.name)}}%
\\vspace{3pt}%
\\centerline{${contactLine}}%
\\vspace{${SP.afterHeader}}%
${profileSection}\\section*{Experience}%
\\pdfbookmark[1]{Experience}{experience}%
${experienceSection}
\\section*{Projects}%
\\pdfbookmark[1]{Projects}{projects}%
${projectsSection}
\\section*{Education}%
\\pdfbookmark[1]{Education}{education}%
${educationSection}
\\section*{Skills}%
\\pdfbookmark[1]{Skills}{skills}%
${skillsSection}
\\end{document}
`;

  return template;
}

// ============ Main ============

/**
 * @brief Cleanups stale TeX files not in allowed set
 * @param texDir The directory containing TeX files
 * @param allowedFiles Set of filenames to keep
 */
function cleanupStaleTexFiles(texDir, allowedFiles) {
  try {
    const allowed = new Set(allowedFiles);
    const existing = fs.readdirSync(texDir).filter((f) => f.endsWith('.tex'));
    for (const f of existing) {
      if (!allowed.has(f)) {
        fs.unlinkSync(path.join(texDir, f));
        console.log(`Removed stale TeX variant: ${f}`);
      }
    }
  } catch (e) {
    console.warn('Warning: could not clean TeX directory:', e?.message || e);
  }
}

console.log('Generating resume files...\n');

const data = loadResumeData();
const outRoot = path.resolve(__dirname, '..');
const texDir = path.join(outRoot, 'public', 'resume');

try {
  fs.mkdirSync(texDir, { recursive: true });
} catch (_) {
  // Directory already exists
}

console.log('Generating resume variations...\n');

const C_RESUME_VARIATIONS = [
  {
    name: 'Edward_Silva_Resume.tex',
    options: { includeMS: false, includeProfile: true, targetPages: 1 },
  },
];

cleanupStaleTexFiles(
  texDir,
  C_RESUME_VARIATIONS.map((v) => v.name)
);

C_RESUME_VARIATIONS.forEach((v) => {
  const content = generateResume(data, v.options);
  writeFile(path.join(texDir, v.name), content);
});

console.log('\nResume generation completed!');
