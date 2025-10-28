#!/usr/bin/env node

/**
 * Resume Builder (clean)
 * Generates LaTeX resume and README from resume-data.json
 */

const {
  loadResumeData,
  filters,
  escapeLatex,
  extractSkillNames,
  getEducationContext,
  writeFile
} = require('./utils');

function generateResume(data, options = {}) {
  const { includeMS = false, includeProfile = false } = options;

  const resumeExperience = filters.filterResumeExperience(data.experience);
  const resumeProjects = filters.filterResumeProjects(data.projects);
  const resumeEducations = filters.filterResumeEducation(data.education);
  const { primaryEducation } = getEducationContext(data.education, data.educationSupplementary) || {};

  // Handle profile filtering - override with options
  const shouldShowProfile = includeProfile || filters.shouldShowResumeProfile(data.profile);
  const profileText = shouldShowProfile ? filters.getProfileText(data.profile) : null;

  // Filter and format coursework
  const resumeCourses = filters.filterResumeCourses(data.educationSupplementary?.courses || {});

  // Check if both Signals and Systems I and II are present
  const hasSS1 = resumeCourses.some(c => c.alias === 'Signals and Systems I');
  const hasSS2 = resumeCourses.some(c => c.alias === 'Signals and Systems II');

  const courseNames = resumeCourses
    .map(course => {
      // Skip individual Signals and Systems courses if both are present (we'll add combined version)
      if ((course.alias === 'Signals and Systems I' || course.alias === 'Signals and Systems II') && hasSS1 && hasSS2) {
        return null;
      }
      // Use alias if available, otherwise use the full name
      if (course.alias) {
        return course.alias;
      }
      return course.name || course;
    })
    .filter(Boolean);

  // Add combined Signals and Systems I/II if both are present
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

  // Filter education based on includeMS option
  const filteredEducations = includeMS
    ? resumeEducations
    : resumeEducations.filter(e => !isMasters(e));

  const mastersEntry = includeMS ? (resumeEducations.find(isMasters) || null) : null;
  const bachelorsEntry = filteredEducations.find(isBachelors) || null;
  const shouldStackMsBs = Boolean(mastersEntry);

  const otherEducations = filteredEducations.filter(e => e && e !== mastersEntry && e !== bachelorsEntry && e !== primaryEducation);
  const otherEducationBlocks = shouldStackMsBs ? '' : otherEducations.map(ed => {
    const lines = [];
    const inst = ed.institution || '';
    const expected = ed.expectedGraduation ? `Expected ${escapeLatex(ed.expectedGraduation)}` : '';
    lines.push(`\\textbf{${escapeLatex(inst)}} ${expected ? `\\hfill ${expected}` : ''} \\\\`);
    const degreeLine = `\\textbf{${escapeLatex(ed.degree || '')}}${ed.specialization ? ` -- ${escapeLatex(ed.specialization)}` : ''}`;
    lines.push(`${degreeLine} \\\\`);
    if (ed.minor || ed.minorSpecialization) {
      lines.push(`${escapeLatex(ed.minor || '')}${ed.minorSpecialization ? ` -- ${escapeLatex(ed.minorSpecialization)}` : ''} \\\\`);
    }
    return lines.join('\n');
  }).join('\n\n');

  const buildEducationBody = () => {
    if (shouldStackMsBs && mastersEntry) {
      const inst = mastersEntry.institution || (bachelorsEntry ? bachelorsEntry.institution : (primaryEducation ? primaryEducation.institution : ''));
      const lines = [];
      lines.push(`\\textbf{${escapeLatex(inst)}} \\\\`);
      const msExpected = mastersEntry.expectedGraduation ? ` \\hfill Expected ${escapeLatex(mastersEntry.expectedGraduation)}` : '';
      lines.push(`\\textbf{${escapeLatex(mastersEntry.degree)}}${mastersEntry.specialization ? ` -- ${escapeLatex(mastersEntry.specialization)}` : ''}${msExpected} \\\\`);
      if (bachelorsEntry) {
        const bsExpected = bachelorsEntry.expectedGraduation ? ` \\hfill Expected ${escapeLatex(bachelorsEntry.expectedGraduation)}` : '';
        const bsDegreeNorm = String(bachelorsEntry.degree || '')
          .replace(/\b[in]\b\s*/i, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();
        const bsMinorPart = bachelorsEntry.minor ? `, ${escapeLatex(bachelorsEntry.minor)}` : '';
        lines.push(`\\textbf{${escapeLatex(bsDegreeNorm)}}${bsMinorPart}${bsExpected} \\\\`);
      }
      return lines.join('\n');
    }

    // When not including MS, use bachelorsEntry if available, otherwise use primaryEducation
    const eduToDisplay = !includeMS && bachelorsEntry ? bachelorsEntry : primaryEducation;

    if (eduToDisplay) {
      const lines = [];
      lines.push(`\\textbf{${escapeLatex(eduToDisplay.institution)}} ${eduToDisplay.expectedGraduation ? `\\hfill Expected ${escapeLatex(eduToDisplay.expectedGraduation)}` : ''} \\\\`);
      if (eduToDisplay.degree && eduToDisplay.minor) {
        lines.push(`\\textbf{${escapeLatex(eduToDisplay.degree)}} , ${escapeLatex(eduToDisplay.minor)} \\\\`);
      } else {
        lines.push(`\\textbf{${escapeLatex(eduToDisplay.degree)}}${eduToDisplay.specialization ? ` -- ${escapeLatex(eduToDisplay.specialization)}` : ''} \\\\`);
        if (eduToDisplay.minor || eduToDisplay.minorSpecialization) {
          lines.push(`${escapeLatex(eduToDisplay.minor || '')}${eduToDisplay.minorSpecialization ? ` -- ${escapeLatex(eduToDisplay.minorSpecialization)}` : ''} \\\\`);
        }
      }
      return lines.join('\n');
    }
    return '';
  };
  const educationBody = buildEducationBody();

  const contactParts = [];
  if (data.personal.linkedin) contactParts.push(`\\href{${data.personal.linkedin}}{${escapeLatex(data.personal.linkedin.replace('https://www.', '').replace('http://www.', ''))}}`);
  if (data.personal.website) contactParts.push(`\\href{${data.personal.website}}{${escapeLatex(data.personal.website.replace('https://', '').replace('http://', ''))}}`);
  if (data.personal.email) contactParts.push(`\\href{mailto:${data.personal.email}}{${escapeLatex(data.personal.email)}}`);
  if (data.personal.phone) {
    const telHref = data.personal.phone.replace(/\D/g, '');
    contactParts.push(`\\href{tel:${telHref}}{${escapeLatex(data.personal.phone)}}`);
  }
  const contactLine = contactParts.join(' | ');

  const pdfKeywordParts = [];
  pdfKeywordParts.push(escapeLatex(data.personal.name));
  pdfKeywordParts.push(...extractSkillNames(filters.filterResumeSkills(data.skills).Programming).map(s => escapeLatex(s)));
  if (primaryEducation && primaryEducation.institution) pdfKeywordParts.push(escapeLatex(primaryEducation.institution));
  if (primaryEducation && primaryEducation.degree) pdfKeywordParts.push(escapeLatex(primaryEducation.degree));
  if (primaryEducation && primaryEducation.specialization) pdfKeywordParts.push(escapeLatex(primaryEducation.specialization));
  if (data.personal && data.personal.citizenship) pdfKeywordParts.push(escapeLatex(data.personal.citizenship));
  const pdfkeywords = pdfKeywordParts.join(', ');

  // Dynamic spacing calculation based on content density
  // PRIMARY GOAL: Ensure resume fits on ONE page
  const calculateDynamicSpacing = () => {
    // Count actual content lines
    const countBreaks = (s) => (s ? (s.match(/\\\\/g) || []).length : 0);

    // More accurate profile line calculation
    // Account for line wrapping at ~95 chars per line (accounting for margins)
    const calculateProfileLines = (profileText) => {
      if (!profileText) return 0;
      const charsPerLine = 95;
      const words = profileText.split(/\s+/);
      let currentLineLength = 0;
      let lineCount = 1;

      words.forEach(word => {
        if (currentLineLength + word.length + 1 > charsPerLine) {
          lineCount++;
          currentLineLength = word.length;
        } else {
          currentLineLength += word.length + 1;
        }
      });

      return lineCount;
    };

    // Hide extracurriculars when MS is included (saves space)
    const showExtracurriculars = !shouldStackMsBs;

    const contentMetrics = {
      nameAndContact: 2,
      // Section headers: Profile (if shown), Education, Skills, Experience, Projects (+ Extracurriculars if shown)
      sectionHeaders: (profileText ? 1 : 0) + (showExtracurriculars ? 5 : 4),
      profileLines: calculateProfileLines(profileText),
      skillsLines: 3,
      courseworkLines: courseworkLine ? 1 : 0,
      extracurricularLines: (showExtracurriculars && (data.extracurriculars || []).length) ? 1 : 0,
      eduLines: countBreaks(educationBody) + countBreaks(otherEducationBlocks),

      // Experience metrics
      expEntries: resumeExperience.length,
      expTitleLines: resumeExperience.length,
      expBulletLines: resumeExperience.reduce((sum, e) => sum + ((e.description && e.description.length) || 0), 0),

      // Project metrics
      projEntries: resumeProjects.length,
      projTitleLines: resumeProjects.length,
      projBulletLines: resumeProjects.reduce((sum, p) => sum + ((p.description && p.description.length) || 0), 0)
    };

    // Total base content lines (without spacing)
    const baseContentLines = Object.values(contentMetrics).reduce((sum, val) => sum + val, 0);

    // Available space on page (accounting for margins and base font size)
    // Conservative target to ensure one-page fit with buffer
    const linesPerPage = 47; // Slightly increased to allow more content while maintaining density

    // Total number of entries (for calculating gap impact)
    const totalEntries = contentMetrics.expEntries + contentMetrics.projEntries;

    // Average bullets per entry (affects itemsep importance)
    const totalBullets = contentMetrics.expBulletLines + contentMetrics.projBulletLines;
    const avgBulletsPerEntry = totalEntries > 0 ? totalBullets / totalEntries : 3;

    // Calculate content density to determine compression strategy
    const contentDensity = baseContentLines / linesPerPage;
    const isHighDensity = contentDensity > 0.85;
    const isVeryHighDensity = contentDensity > 0.95;

    // Estimate total space consumed by spacing at different levels
    const estimateTotalLines = (spacingParams) => {
      const { sectionBefore, sectionAfter, entryGap, itemsep, topsep } = spacingParams;

      // Section spacing - calibrated for denser layout
      // 1 baselineskip ≈ 1.4 lines (refined for tighter spacing)
      const numSections = contentMetrics.sectionHeaders;
      const sectionSpacing = numSections * (sectionBefore * 1.4 + sectionAfter * 1.4);

      // Entry gaps - calibrated for denser layout
      // 11pt ≈ 1 line (refined for accuracy with tighter spacing)
      const entryGaps = (totalEntries - 1) * (entryGap / 11);

      // Topsep (gap between each entry title and its bullets)
      const topSepLines = totalEntries * (topsep / 11);

      // Itemsep (gaps between bullets) - more impact with many bullets
      const itemSepLines = Math.max(0, totalBullets - totalEntries) * (itemsep / 11);

      // LaTeX overhead adjusted based on content density
      const latexOverhead = isVeryHighDensity ? 2.5 : 3.5;

      return baseContentLines + sectionSpacing + entryGaps + topSepLines + itemSepLines + latexOverhead;
    };

    // Start with ideal spacing and compress until it fits
    let bestSpacing = null;
    let attempts = [];

    // Adaptive spacing bounds based on content density
    // When MS/BS stacking is used, education is more compact (saves ~1-2 lines)
    const eduCompression = shouldStackMsBs ? 0.85 : 1.0; // Factor for education compression bonus

    // More uniformly dense spacing across all systems
    // Tighter overall to ensure one-page fit while maintaining proportional relationships
    const bounds = {
      sectionBefore: isVeryHighDensity ? [0.35, 0.5] : isHighDensity ? [0.4, 0.55] : [0.45, 0.6],
      sectionAfter: isVeryHighDensity ? [0.35, 0.5] : isHighDensity ? [0.4, 0.55] : [0.45, 0.6],
      entryGap: isVeryHighDensity ? [2, 6] : isHighDensity ? [2.5, 7] : [3, 8],
      itemsep: isVeryHighDensity ? [0.8, 2.5] : isHighDensity ? [1, 3] : [1.2, 3.5],
      topsep: isVeryHighDensity ? [1.2, 3] : isHighDensity ? [1.5, 3.5] : [1.8, 4]
    };

    // Try progressively tighter spacing levels until we fit
    const steps = isVeryHighDensity ? 20 : 15; // More granular steps for high density
    for (let i = 0; i <= steps; i++) {
      const compressionLevel = i / steps;
      const testSpacing = {
        sectionBefore: bounds.sectionBefore[1] - compressionLevel * (bounds.sectionBefore[1] - bounds.sectionBefore[0]),
        sectionAfter: bounds.sectionAfter[1] - compressionLevel * (bounds.sectionAfter[1] - bounds.sectionAfter[0]),
        entryGap: bounds.entryGap[1] - compressionLevel * (bounds.entryGap[1] - bounds.entryGap[0]),
        itemsep: bounds.itemsep[1] - compressionLevel * (bounds.itemsep[1] - bounds.itemsep[0]),
        topsep: bounds.topsep[1] - compressionLevel * (bounds.topsep[1] - bounds.topsep[0])
      };

      const estimatedLines = estimateTotalLines(testSpacing) * eduCompression;
      attempts.push({ compressionLevel: compressionLevel.toFixed(2), estimatedLines: estimatedLines.toFixed(1) });

      // Use the first spacing that fits with a small buffer
      if (estimatedLines <= linesPerPage && !bestSpacing) {
        bestSpacing = testSpacing;
        break;
      }
    }

    // If nothing fit, use maximum compression
    if (!bestSpacing) {
      bestSpacing = {
        sectionBefore: bounds.sectionBefore[0],
        sectionAfter: bounds.sectionAfter[0],
        entryGap: bounds.entryGap[0],
        itemsep: bounds.itemsep[0],
        topsep: bounds.topsep[0]
      };
    }

    // Apply additional intelligent adjustments - proportionally reduce all spacing
    if (isVeryHighDensity) {
      // Aggressive but proportional compression for very dense content
      const compressionFactor = 0.7; // Reduce all spacing by 30%
      bestSpacing.sectionBefore = Math.max(0.35, bestSpacing.sectionBefore * compressionFactor);
      bestSpacing.sectionAfter = Math.max(0.35, bestSpacing.sectionAfter * compressionFactor);
      bestSpacing.entryGap = Math.max(2, bestSpacing.entryGap * compressionFactor);
      bestSpacing.itemsep = Math.max(0.8, bestSpacing.itemsep * compressionFactor);
      bestSpacing.topsep = Math.max(1.2, bestSpacing.topsep * compressionFactor);
    } else if (totalEntries > 6) {
      // Moderate proportional compression for many entries
      const compressionFactor = 0.85; // Reduce all spacing by 15%
      bestSpacing.entryGap = Math.max(2.5, bestSpacing.entryGap * compressionFactor);
      bestSpacing.itemsep = Math.max(1, bestSpacing.itemsep * compressionFactor);
      bestSpacing.topsep = Math.max(1.5, bestSpacing.topsep * compressionFactor);
    }

    // If lots of bullets per entry, proportionally reduce bullet-related spacing
    if (avgBulletsPerEntry > 4) {
      bestSpacing.itemsep = Math.max(0.8, bestSpacing.itemsep * 0.8);
      bestSpacing.topsep = Math.max(1.2, bestSpacing.topsep * 0.85);
    }

    const finalEstimate = estimateTotalLines(bestSpacing) * eduCompression;
    const fitsOnOnePage = finalEstimate <= linesPerPage;

    return {
      sectionBeforeBs: bestSpacing.sectionBefore.toFixed(2),
      sectionAfterBs: bestSpacing.sectionAfter.toFixed(2),
      entryGap: `${Math.round(bestSpacing.entryGap)}pt`,
      itemsep: `${bestSpacing.itemsep.toFixed(1)}pt`,
      topsep: `${bestSpacing.topsep.toFixed(1)}pt`,
      // Debug info
      _debug: {
        baseContentLines,
        contentDensity: contentDensity.toFixed(2),
        isHighDensity,
        isVeryHighDensity,
        msBsStacking: shouldStackMsBs,
        eduCompressionFactor: eduCompression.toFixed(2),
        finalEstimatedLines: finalEstimate.toFixed(1),
        linesPerPage,
        fitsOnOnePage,
        compressionUsed: attempts.length > 0 ? attempts.find(a => parseFloat(a.estimatedLines) <= linesPerPage) : null,
        allAttempts: attempts,
        totalEntries,
        avgBulletsPerEntry: avgBulletsPerEntry.toFixed(1),
        metrics: contentMetrics
      }
    };
  };

  const SP = calculateDynamicSpacing();

  // Log spacing decisions for debugging
  console.log('\n=== ONE-PAGE RESUME SPACING CALCULATION ===');
  console.log(`\nContent Analysis:`);
  console.log(`  Base content lines: ${SP._debug.baseContentLines}`);
  console.log(`  Content density: ${SP._debug.contentDensity} (${SP._debug.isVeryHighDensity ? 'VERY HIGH' : SP._debug.isHighDensity ? 'HIGH' : 'NORMAL'})`);
  console.log(`  MS/BS stacking: ${SP._debug.msBsStacking ? 'YES (extracurriculars hidden)' : 'NO'}`);
  console.log(`  Edu compression factor: ${SP._debug.eduCompressionFactor}`);
  console.log(`  Estimated total (with spacing): ${SP._debug.finalEstimatedLines} lines`);
  console.log(`  Page capacity: ${SP._debug.linesPerPage} lines`);
  console.log(`  ✓ Fits on one page: ${SP._debug.fitsOnOnePage ? 'YES ✓' : 'NO - NEEDS MORE COMPRESSION ⚠'}`);
  console.log(`\nContent Breakdown:`);
  console.log(`  Sections: ${SP._debug.metrics.sectionHeaders}`);
  console.log(`  Profile: ${SP._debug.metrics.profileLines} lines`);
  console.log(`  Education: ${SP._debug.metrics.eduLines} lines`);
  console.log(`  Coursework: ${SP._debug.metrics.courseworkLines} lines`);
  console.log(`  Extracurriculars: ${SP._debug.metrics.extracurricularLines > 0 ? 'shown' : 'hidden'}`);
  console.log(`  Total entries: ${SP._debug.totalEntries} (avg ${SP._debug.avgBulletsPerEntry} bullets/entry)`);
  console.log(`  Experience: ${SP._debug.metrics.expEntries} entries, ${SP._debug.metrics.expBulletLines} bullets`);
  console.log(`  Projects: ${SP._debug.metrics.projEntries} entries, ${SP._debug.metrics.projBulletLines} bullets`);
  console.log('\nApplied Spacing:');
  console.log(`  Section before: ${SP.sectionBeforeBs}\\baselineskip`);
  console.log(`  Section after: ${SP.sectionAfterBs}\\baselineskip`);
  console.log(`  Entry gap: ${SP.entryGap}`);
  console.log(`  Bullet spacing (itemsep): ${SP.itemsep}`);
  console.log(`  Title-to-bullet (topsep): ${SP.topsep}`);
  console.log('==========================================\n');

  const template = `
\\documentclass[11pt]{article}
\\usepackage{geometry}
\\geometry{letterpaper,top=0.5in,bottom=0.5in,left=0.5in,right=0.5in}

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

\\input{glyphtounicode}
\\pdfgentounicode=1

\\title{${escapeLatex(data.personal.name)} - Resume}
\\author{${escapeLatex(data.personal.name)}}

\\hypersetup{
    pdftitle={${escapeLatex(data.personal.name)} - Resume},
    pdfauthor={${escapeLatex(data.personal.name)}},
    pdfsubject={Resume},
    pdfkeywords={${pdfkeywords}},
    colorlinks = false,
    linkcolor = black,
    urlcolor = black,
    citecolor = black,
    filecolor = black
}

% Section styling and spacing
\\titleformat{\\section}{\\bfseries\\large}{}{0pt}{}[\\vspace{2pt}\\titlerule]
\\titlespacing*{\\section}{0pt}{${SP.sectionBeforeBs}\\baselineskip}{${SP.sectionAfterBs}\\baselineskip}

% Consistent list spacing across document
\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\setlist[itemize]{leftmargin=12pt,topsep=${SP.topsep},itemsep=${SP.itemsep},parsep=0pt,partopsep=0pt}

\\begin{document}

\\thispagestyle{empty}
\\pdfbookmark[0]{${escapeLatex(data.personal.name)} - Resume}{main}

\\centerline{\\huge ${escapeLatex(data.personal.name)}}
\\vspace{3pt}

\\centerline{${contactLine}}

${profileText ? `\\section*{Profile}
\\pdfbookmark[1]{Profile}{profile}

${escapeLatex(profileText)}

` : ''}\\section*{Education}
\\pdfbookmark[1]{Education}{education}

${educationBody}

${otherEducationBlocks}

${courseworkLine ? `\\textbf{Relevant Coursework:} ${escapeLatex(courseworkLine)} \\\\` : ''}

\\section*{Skills}
\\pdfbookmark[1]{Skills}{skills}

\\textbf{Programming Languages:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Programming).map(skill => escapeLatex(skill)).join(', ')} \\\\
\\textbf{Hardware:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Hardware).map(skill => escapeLatex(skill)).join(', ')} \\\\
\\textbf{Software:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Software).map(skill => escapeLatex(skill)).join(', ')} \\\\

\\section*{Experience}
\\pdfbookmark[1]{Experience}{experience}

${resumeExperience.map(exp => `\\textbf{${escapeLatex(exp.title)}, }{${escapeLatex(exp.company)}} -- ${escapeLatex(exp.location)} \\hfill ${escapeLatex(exp.duration)} \\\\
\\begin{itemize}
${exp.description.map(item => `  \\item ${escapeLatex(item)}`).join('\n')}
\\end{itemize}`).join(`\n\n\\vspace{${SP.entryGap}}\n\n`)}

\\section*{Projects}
\\pdfbookmark[1]{Projects}{projects}

${resumeProjects.map(project => `\\textbf{${escapeLatex(project.title)}}, ${project.technologies.map(tech => escapeLatex(tech)).join(', ')} ${project.github ? `\\href{${project.github}}{Github}` : ''} \\hfill ${escapeLatex(project.duration)}
\\begin{itemize}
${project.description.map(item => `  \\item ${escapeLatex(item)}`).join('\n')}
\\end{itemize}`).join(`\n\n\\vspace{${SP.entryGap}}\n\n`)}

${!shouldStackMsBs ? `\\section*{Extracurriculars}
\\pdfbookmark[1]{Extracurriculars}{extracurriculars}
\\small ${(data.extracurriculars || []).map(e => escapeLatex(e)).join(', ')}` : ''}

\\end{document}
`;

  return template;
}

function generateREADME(data) {
  const { primaryEducation } = getEducationContext(data.education, data.educationSupplementary) || {};
  const prim = primaryEducation || {};

  const degree = prim.degree || 'Student';
  const institution = prim.institution || '';
  const minor = prim.minor || '';
  const specialization = prim.specialization ? prim.specialization.toLowerCase() : '';
  const expectedGraduation = prim.expectedGraduation || '';
  const gpa = prim.gpa || '';
  const minorSpecialization = prim.minorSpecialization || '';

  // Use the profile description from resume-data.json
  const description = data.profile && data.profile.text ? data.profile.text :
    `${degree} student at ${institution}${minor ? ` with a ${minor}` : ''}${specialization ? `, focusing on ${specialization}` : ''}.`;

  // For README, get both BS and MS degrees for better representation
  const websiteEducations = filters.filterWebsiteEducation(data.education || []);
  const isMasters = (e) => {
    const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
    return deg.startsWith('ms') || deg.includes('master');
  };
  const isBachelors = (e) => {
    const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
    return deg.startsWith('bs') || deg.includes('bachelor');
  };

  const mastersEntry = websiteEducations.find(isMasters);
  const bachelorsEntry = websiteEducations.find(isBachelors);

  // Build education display - prefer BS for main info since it has GPA
  const mainEducation = bachelorsEntry || prim;
  const mainExpectedGrad = mainEducation.expectedGraduation || '';
  const mainGpa = mainEducation.gpa || '';

  const educationParts = [`**${institution}**`];
  const educationLine = educationParts.join(', ');

  // Build degree lines for both degrees if available, with graduation years only
  const degreeLines = [];
  if (mastersEntry) {
    const msParts = [`**${mastersEntry.degree}**`];
    if (mastersEntry.expectedGraduation) {
      const year = mastersEntry.expectedGraduation;
      if (year) {
        msParts.push(year);
      }
    }
    degreeLines.push(msParts.join(', '));
  }
  if (bachelorsEntry) {
    const bsParts = [`**${bachelorsEntry.degree}**`];
    if (bachelorsEntry.minor) {
      bsParts.push(`**${bachelorsEntry.minor}**`);
    }
    if (bachelorsEntry.expectedGraduation) {
      const year = bachelorsEntry.expectedGraduation;
      if (year) {
        bsParts.push(year);
      }
    }
    degreeLines.push(bsParts.join(', '));
  }
  const degreeLine = degreeLines.join('\n\n');

  // Use website filtering for README to show more content
  const websiteSkills = filters.filterWebsiteSkills(data.skills);

  const template = `# ${data.personal.name}

${description}

## Contact

  - **Personal:** [${data.personal.email}](mailto:${data.personal.email})
  - **LinkedIn:** [${data.personal.name}](${data.personal.linkedin})
  - **Website:** [${data.personal.website.replace('https://', '')}](${data.personal.website})

## Education

${educationLine}

${degreeLine}

## Skills

- **Programming:** ${extractSkillNames(websiteSkills.Programming).join(', ')}
- **Hardware:** ${extractSkillNames(websiteSkills.Hardware).join(', ')}
- **Software & Tools:** ${extractSkillNames(websiteSkills.Software).join(', ')}

## Certifications

${filters.filterWebsiteCertifications(data.certifications || []).map(cert => typeof cert === 'string' ? `- **${cert}**` : `- **${cert.name}**${cert.link ? ` - [Certificate](${cert.link})` : ''}`).join('\n')}

## Career Goals

${(data.careerGoals || []).map(goal => `- ${goal}`).join('\n')}
`;

  return template;
}

function buildResume() {
  console.log('Starting resume build...\n');

  const data = loadResumeData();

  const path = require('path');
  const fs = require('fs');
  const outRoot = path.resolve(__dirname, '..');

  writeFile(path.join(outRoot, 'README.md'), generateREADME(data));

  // Create directory structure
  const resumeDir = path.join(outRoot, 'resume');
  const texDir = path.join(resumeDir, 'tex');
  const pdfDir = path.join(resumeDir, 'pdf');

  try {
    fs.mkdirSync(resumeDir, { recursive: true });
    fs.mkdirSync(texDir, { recursive: true });
    fs.mkdirSync(pdfDir, { recursive: true });
  } catch (_) { }

  // Generate 4 resume variations
  console.log('Generating resume variations...\n');

  // 1. BS only (default)
  const bsOnlyResume = generateResume(data, { includeMS: false, includeProfile: false });
  writeFile(path.join(texDir, 'Edward_Silva_Resume.tex'), bsOnlyResume);
  console.log('✓ Edward_Silva_Resume.tex (BS only)');

  // 2. BS + Profile
  const bsProfileResume = generateResume(data, { includeMS: false, includeProfile: true });
  writeFile(path.join(texDir, 'Edward_Silva_Resume_P.tex'), bsProfileResume);
  console.log('✓ Edward_Silva_Resume_P.tex (BS + Profile)');

  // 3. MS + BS
  const msResume = generateResume(data, { includeMS: true, includeProfile: false });
  writeFile(path.join(texDir, 'Edward_Silva_Resume_MS.tex'), msResume);
  console.log('✓ Edward_Silva_Resume_MS.tex (MS + BS)');

  // 4. MS + BS + Profile
  const msProfileResume = generateResume(data, { includeMS: true, includeProfile: true });
  writeFile(path.join(texDir, 'Edward_Silva_Resume_MSP.tex'), msProfileResume);
  console.log('✓ Edward_Silva_Resume_MSP.tex (MS + BS + Profile)');

  console.log('\nResume build completed!');
  console.log('\nGenerated files:');
  console.log('- README.md');
  console.log('- resume/tex/Edward_Silva_Resume.tex (BS only)');
  console.log('- resume/tex/Edward_Silva_Resume_P.tex (BS + Profile)');
  console.log('- resume/tex/Edward_Silva_Resume_MS.tex (MS + BS)');
  console.log('- resume/tex/Edward_Silva_Resume_MSP.tex (MS + BS + Profile)');
  console.log('\nTo update:');
  console.log('1. Edit resume-data.json');
  console.log('2. Run: node BUILD/build-resume.js or ./gen');
  console.log('3. PDFs will be in resume/pdf/ after running ./gen');
}

if (require.main === module) {
  buildResume();
}

module.exports = {
  generateResume,
  generateREADME,
  buildResume
};
