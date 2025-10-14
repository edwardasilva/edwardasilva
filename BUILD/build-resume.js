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

function generateResume(data) {
  const resumeExperience = filters.filterResumeExperience(data.experience);
  const resumeProjects = filters.filterResumeProjects(data.projects);
  const resumeEducations = filters.filterResumeEducation(data.education);
  const { primaryEducation } = getEducationContext(data.education, data.educationSupplementary) || {};

  const isMasters = (e) => {
    const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
    return deg.startsWith('ms') || deg.includes('master');
  };
  const isBachelors = (e) => {
    const deg = (e && e.degree ? String(e.degree) : '').toLowerCase();
    return deg.startsWith('bs') || deg.includes('bachelor');
  };
  const mastersEntry = resumeEducations.find(isMasters) || null;
  const bachelorsEntry = resumeEducations.find(isBachelors) || null;
  const shouldStackMsBs = Boolean(mastersEntry);

  const otherEducations = resumeEducations.filter(e => e && e !== mastersEntry && e !== bachelorsEntry && e !== primaryEducation);
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

    if (primaryEducation) {
      const lines = [];
      lines.push(`\\textbf{${escapeLatex(primaryEducation.institution)}} ${primaryEducation.expectedGraduation ? `\\hfill Expected ${escapeLatex(primaryEducation.expectedGraduation)}` : ''} \\\\`);
      if (primaryEducation.degree && primaryEducation.minor) {
        lines.push(`\\textbf{${escapeLatex(primaryEducation.degree)}} , ${escapeLatex(primaryEducation.minor)} \\\\`);
      } else {
        lines.push(`\\textbf{${escapeLatex(primaryEducation.degree)}}${primaryEducation.specialization ? ` -- ${escapeLatex(primaryEducation.specialization)}` : ''} \\\\`);
        if (primaryEducation.minor || primaryEducation.minorSpecialization) {
          lines.push(`${escapeLatex(primaryEducation.minor || '')}${primaryEducation.minorSpecialization ? ` -- ${escapeLatex(primaryEducation.minorSpecialization)}` : ''} \\\\`);
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

    const contentMetrics = {
      nameAndContact: 2,
      sectionHeaders: 4,
      skillsLines: 3,
      extracurricularLines: (data.extracurriculars || []).length ? 1 : 0,
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
    // Target comfortable fit - not too tight, not too loose
    const linesPerPage = 45; // Sweet spot between 47 (too tight) and 50 (too loose)

    // Total number of entries (for calculating gap impact)
    const totalEntries = contentMetrics.expEntries + contentMetrics.projEntries;

    // Average bullets per entry (affects itemsep importance)
    const totalBullets = contentMetrics.expBulletLines + contentMetrics.projBulletLines;
    const avgBulletsPerEntry = totalEntries > 0 ? totalBullets / totalEntries : 3;

    // Estimate total space consumed by spacing at different levels
    // This helps us calculate what we can actually afford
    const estimateTotalLines = (spacingParams) => {
      const { sectionBefore, sectionAfter, entryGap, itemsep, topsep } = spacingParams;

      // Section spacing (4 sections: Education, Skills, Experience, Projects)
      // Convert baselineskip multipliers to line equivalents 
      // Very conservative: 1 baselineskip ≈ 1.8 lines (was 1.5)
      const sectionSpacing = 4 * (sectionBefore * 1.8 + sectionAfter * 1.8);

      // Entry gaps (between entries within sections)
      // Very conservative conversion: 8pt ≈ 1 line (was 10pt)
      const entryGaps = (totalEntries - 1) * (entryGap / 8);

      // Topsep (gap between each entry title and its bullets)
      const topSepLines = totalEntries * (topsep / 8);

      // Itemsep (gaps between bullets)
      const itemSepLines = Math.max(0, totalBullets - totalEntries) * (itemsep / 8);

      // Add LaTeX overhead (section rules, titlerule, misc spacing, list environments)
      const latexOverhead = 5; // Increased from 3

      return baseContentLines + sectionSpacing + entryGaps + topSepLines + itemSepLines + latexOverhead;
    };    // Binary search for optimal spacing that fits on one page
    // Start with ideal spacing and compress until it fits
    let bestSpacing = null;
    let attempts = [];

    // Define spacing bounds [min, max] for each parameter
    // Prioritize section spacing for better visual separation
    const bounds = {
      sectionBefore: [0.7, 0.7],  // Increased for more section separation
      sectionAfter: [0.7, 0.7],   // Increased for more section separation
      entryGap: [4, 13],
      itemsep: [2.5, 5.5],           // Slightly increased minimum (was 1.5)
      topsep: [3, 6.5]
    };

    // Try progressively tighter spacing levels until we fit
    for (let compressionLevel = 0; compressionLevel <= 1; compressionLevel += 0.1) {
      const testSpacing = {
        sectionBefore: bounds.sectionBefore[1] - compressionLevel * (bounds.sectionBefore[1] - bounds.sectionBefore[0]),
        sectionAfter: bounds.sectionAfter[1] - compressionLevel * (bounds.sectionAfter[1] - bounds.sectionAfter[0]),
        entryGap: bounds.entryGap[1] - compressionLevel * (bounds.entryGap[1] - bounds.entryGap[0]),
        itemsep: bounds.itemsep[1] - compressionLevel * (bounds.itemsep[1] - bounds.itemsep[0]),
        topsep: bounds.topsep[1] - compressionLevel * (bounds.topsep[1] - bounds.topsep[0])
      };

      const estimatedLines = estimateTotalLines(testSpacing);
      attempts.push({ compressionLevel: compressionLevel.toFixed(1), estimatedLines: estimatedLines.toFixed(1) });

      // Use the first spacing that fits, or keep going if too tight
      if (estimatedLines <= linesPerPage && !bestSpacing) {
        bestSpacing = testSpacing;
        break;
      }
    }

    // If nothing fit in the loop, use maximum compression
    if (!bestSpacing) {
      bestSpacing = {
        sectionBefore: bounds.sectionBefore[0],
        sectionAfter: bounds.sectionAfter[0],
        entryGap: bounds.entryGap[0],
        itemsep: bounds.itemsep[0],
        topsep: bounds.topsep[0]
      };
    }

    // Apply additional adjustments based on content characteristics
    // If lots of entries, reduce entry gap further
    if (totalEntries > 6) {
      bestSpacing.entryGap = Math.max(3, bestSpacing.entryGap - 1.5);
    }

    // If lots of bullets per entry, reduce itemsep
    if (avgBulletsPerEntry > 4) {
      bestSpacing.itemsep = Math.max(1.5, bestSpacing.itemsep - 0.5);
    }

    const finalEstimate = estimateTotalLines(bestSpacing);
    const fitsOnOnePage = finalEstimate <= linesPerPage;

    return {
      sectionBeforeBs: bestSpacing.sectionBefore.toFixed(2),
      sectionAfterBs: bestSpacing.sectionAfter.toFixed(2),
      entryGap: `${Math.round(bestSpacing.entryGap)}pt`,
      itemsep: `${Math.round(bestSpacing.itemsep)}pt`,
      topsep: `${Math.round(bestSpacing.topsep)}pt`,
      // Debug info
      _debug: {
        baseContentLines,
        finalEstimatedLines: finalEstimate.toFixed(1),
        linesPerPage,
        fitsOnOnePage,
        compressionUsed: attempts.length > 0 ? attempts.find(a => parseFloat(a.estimatedLines) <= linesPerPage) : null,
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
  console.log(`  Estimated total (with spacing): ${SP._debug.finalEstimatedLines} lines`);
  console.log(`  Page capacity: ${SP._debug.linesPerPage} lines`);
  console.log(`  ✓ Fits on one page: ${SP._debug.fitsOnOnePage ? 'YES' : 'NO - NEEDS MORE COMPRESSION'}`);
  console.log(`\nContent Breakdown:`);
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
\\pagestyle{empty}

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

\\section*{Education}
\\pdfbookmark[1]{Education}{education}

${educationBody}

${otherEducationBlocks}

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

\\section*{Extracurriculars}
\\pdfbookmark[1]{Extracurriculars}{extracurriculars}
\\small ${(data.extracurriculars || []).map(e => escapeLatex(e)).join(', ')}

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

  const template = `# ${data.personal.name}

${degree} student at ${institution} with a ${minor}, focusing on ${specialization}.

## Contact

  - **Personal:** [${data.personal.email}](mailto:${data.personal.email})
  - **LinkedIn:** [${data.personal.name}](${data.personal.linkedin})
  - **Website:** [${data.personal.website.replace('https://', '')}](${data.personal.website})

## Education

**${institution}**, ${expectedGraduation} | GPA: ${gpa}

**${degree}**, **${minor}**

## Skills

- **Programming:** ${extractSkillNames(data.skills.Programming).join(', ')}
- **Hardware:** ${extractSkillNames(data.skills.Hardware).join(', ')}
- **Software & Tools:** ${extractSkillNames(data.skills.Software).join(', ')}

## Certifications

${(data.certifications || []).map(cert => typeof cert === 'string' ? `- **${cert}**` : `- **${cert.name}**${cert.link ? ` - [Certificate](${cert.link})` : ''}`).join('\n')}

## Career Goals

${(data.careerGoals || []).map(goal => `- ${goal}`).join('\n')}
`;

  return template;
}

function buildResume() {
  console.log('Starting resume build...\n');

  const data = loadResumeData();

  const path = require('path');
  const outRoot = path.resolve(__dirname, '..');

  writeFile(path.join(outRoot, 'README.md'), generateREADME(data));
  const resumeDir = path.join(outRoot, 'resume');
  try {
    require('fs').mkdirSync(resumeDir, { recursive: true });
  } catch (_) { }
  writeFile(path.join(resumeDir, 'Edward_Silva_Resume.tex'), generateResume(data));

  console.log('\nResume build completed!');
  console.log('\nGenerated files:');
  console.log('- README.md');
  console.log('- resume/Edward_Silva_Resume.tex');
  console.log('\nTo update:');
  console.log('1. Edit resume-data.json');
  console.log('2. Run: node build-resume2.js');
  console.log('3. For PDF: cd resume && pdflatex Edward_Silva_Resume.tex');
}

if (require.main === module) {
  buildResume();
}

module.exports = {
  generateResume,
  generateREADME,
  buildResume
};
