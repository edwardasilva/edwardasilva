#!/usr/bin/env node

/**
 * Resume Builder
 * Generates LaTeX resume and README from resume-data.json
 */

const { 
  loadResumeData, 
  filters, 
  escapeLatex, 
  extractSkillNames,
  extractCertificationNames,
  extractCourseNames,
  writeFile 
} = require('./utils');

/**
 * Generate LaTeX Resume
 */
function generateResume(data) {
  const resumeExperience = filters.filterResumeExperience(data.experience);
  const resumeProjects = filters.filterResumeProjects(data.projects);
  const resumeCertifications = filters.filterResumeCertifications(data.certifications);
  const resumeCourses = filters.filterResumeCourses(data.education.courses);

  // Calculate spacing based on content length
  const calculateVSpace = (contentLength, baseSpace = 5) => {
    if (contentLength <= 2) return baseSpace;
    if (contentLength <= 4) return baseSpace - 2;
    if (contentLength <= 6) return baseSpace - 4;
    return baseSpace - 6;
  };

  const experienceVSpace = calculateVSpace(resumeExperience.length);
  const projectsVSpace = calculateVSpace(resumeProjects.length);
  const educationVSpace = calculateVSpace(data.education.honors.length + data.education.scholarships.length);
  const contactInfoLength = 4;
  const nameVSpace = calculateVSpace(contactInfoLength, 5);
  const skillsCount = Object.values(filters.filterResumeSkills(data.skills)).flat().length;
  const skillsVSpace = calculateVSpace(skillsCount, 5);
  
  const sectionTransitionSpace = (contentLength) => {
    if (contentLength <= 2) return 14;
    if (contentLength <= 4) return 12;
    if (contentLength <= 6) return 10;
    return 8;
  };
  
  const educationTransitionSpace = sectionTransitionSpace(data.education.honors.length + data.education.scholarships.length);
  const experienceTransitionSpace = sectionTransitionSpace(resumeExperience.length);
  const projectsTransitionSpace = sectionTransitionSpace(resumeProjects.length);
  
  const itemSpacing = (contentLength) => {
    if (contentLength <= 2) return 5;
    if (contentLength <= 4) return 3;
    return 2;
  };
  
  const experienceItemSpacing = itemSpacing(resumeExperience.length);
  const projectItemSpacing = itemSpacing(resumeProjects.length);

  const template = 
`\\documentclass[11pt]{article}
\\usepackage{geometry}
\\geometry{letterpaper,top=0.5in,bottom=0.5in,left=0.5in,right=0.5in}

\\usepackage{XCharter}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{bookmark}
\\usepackage{titlesec}
\\raggedright
\\pagestyle{empty}

\\input{glyphtounicode}
\\pdfgentounicode=1

% Document metadata
\\title{${escapeLatex(data.personal.name)} - Resume}
\\author{${escapeLatex(data.personal.name)}}

\\hypersetup{
    pdftitle={${escapeLatex(data.personal.name)} - Resume},
    pdfauthor={${escapeLatex(data.personal.name)}},
    pdfsubject={Resume},
    pdfkeywords={${escapeLatex(data.personal.name)}, ${extractSkillNames(filters.filterResumeSkills(data.skills).Programming).map(skill => escapeLatex(skill)).join(', ')}, ${data.education.institution}, ${data.education.degree}, ${data.education.specialization}, ${data.education.minor}, ${data.education.minorSpecialization}},
    colorlinks=false,
    linkcolor=black,
    urlcolor=black,
    citecolor=black,
    filecolor=black
}

\\titleformat{\\section}{\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule\\vspace{-10pt}]

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\setlist[itemize]{itemsep=-2pt, leftmargin=12pt}

\\begin{document}

\\thispagestyle{empty}
\\pdfbookmark[0]{${escapeLatex(data.personal.name)} - Resume}{main}

\\centerline{\\huge ${escapeLatex(data.personal.name)}}
\\vspace{${nameVSpace}pt}

\\centerline{
\\href{${data.personal.linkedin}}{Linkedin.com/in/edwardasilva}
| \\href{${data.personal.website}}{easilva.com}
| \\href{mailto:${data.personal.email}}{${data.personal.email}} 
| \\href{tel:${data.personal.phone.replace(/[()]/g, '')}}{${data.personal.phone}}
}

\\vspace{-${educationTransitionSpace}pt}
\\section*{Education}
\\pdfbookmark[1]{Education}{education}
\\vspace{${educationVSpace}pt}

\\textbf{${escapeLatex(data.education.institution)}}, \\textbf{GPA:} ${data.education.gpa}  \\hfill Expected ${escapeLatex(data.education.expectedGraduation)}\\\\
\\textbf{${escapeLatex(data.education.degree)}} -- ${escapeLatex(data.education.specialization)}  \\\\
${escapeLatex(data.education.minor)} -- ${escapeLatex(data.education.minorSpecialization)}\\\\
\\textbf{Courses:} ${extractCourseNames(resumeCourses).map(course => escapeLatex(course)).join(', ')}\\\\
\\textbf{Certifications:} ${extractCertificationNames(resumeCertifications).map(cert => escapeLatex(cert)).join(', ')}

\\vspace{-${Math.max(educationTransitionSpace, educationVSpace + 5)}pt}
\\section*{Skills}
\\pdfbookmark[1]{Skills}{skills}
\\vspace{${skillsVSpace}pt}

\\textbf{Programming Languages:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Programming).map(skill => escapeLatex(skill)).join(', ')} \\\\
\\textbf{Hardware:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Hardware).map(skill => escapeLatex(skill)).join(', ')} \\\\
\\textbf{Software:} ${extractSkillNames(filters.filterResumeSkills(data.skills).Software).map(skill => escapeLatex(skill)).join(', ')} \\\\

\\vspace{-${experienceTransitionSpace}pt}
\\section*{Experience}
\\pdfbookmark[1]{Experience}{experience}
\\vspace{${experienceVSpace}pt}

${resumeExperience.map(exp => `\\textbf{${escapeLatex(exp.title)}, }{${escapeLatex(exp.company)}} -- ${escapeLatex(exp.location)} \\hfill ${escapeLatex(exp.duration)} \\\\
\\vspace{-${experienceItemSpacing}pt}
\\begin{itemize}
${exp.description.map(item => `  \\item ${escapeLatex(item)}`).join('\n')}
\\end{itemize}`).join('\n\n')}

\\vspace{-${Math.max(experienceTransitionSpace, experienceVSpace + 5)}pt}
\\section*{Projects}
\\pdfbookmark[1]{Projects}{projects}
\\vspace{${projectsVSpace}pt}
${resumeProjects.map(project => `\\textbf{${escapeLatex(project.title)}}, ${project.technologies.map(tech => escapeLatex(tech)).join(', ')}, ${project.github ? `\\href{${project.github}}{Github}` : ''} \\hfill ${escapeLatex(project.duration)}
\\vspace{-${projectItemSpacing}pt}
\\begin{itemize}
${project.description.map(item => `  \\item ${escapeLatex(item)}`).join('\n')}
\\end{itemize}`).join('\n\n')}

\\vspace{-${Math.max(projectsTransitionSpace, projectsVSpace + 5)}pt}

\\end{document}`;

  return template;
}

/**
 * Generate README content
 */
function generateREADME(data) {
  const template = `# ${data.personal.name}

${data.education.degree} student at ${data.education.institution} with a ${data.education.minor}, focusing on ${data.education.specialization.toLowerCase()}.

## Contact

- **Personal:** [${data.personal.email}](mailto:${data.personal.email})
- **LinkedIn:** [${data.personal.name}](${data.personal.linkedin})
- **Website:** [${data.personal.website.replace('https://', '')}](${data.personal.website})

## Education

**${data.education.institution}**, ${data.education.expectedGraduation} | GPA: ${data.education.gpa}

**${data.education.degree}**, ${data.education.specialization}

**${data.education.minor}**, ${data.education.minorSpecialization}

## Skills

- **Programming:** ${extractSkillNames(data.skills.Programming).join(', ')}
- **Hardware:** ${extractSkillNames(data.skills.Hardware).join(', ')}
- **Software & Tools:** ${extractSkillNames(data.skills.Software).join(', ')}

## Certifications

${data.certifications.map(cert => `- **${cert.name}**${cert.credly ? ` - [Credly Badge](${cert.credly})` : ''}`).join('\n')}

## Career Goals

${data.careerGoals.map(goal => `- ${goal}`).join('\n')}
`;

  return template;
}

/**
 * Main build function
 */
function buildResume() {
  console.log('Starting resume build...\n');
  
  const data = loadResumeData();
  
  writeFile('../README.md', generateREADME(data));
  writeFile('../resume/Edward_Silva_Resume.tex', generateResume(data));
  
  console.log('\nResume build completed!');
  console.log('\nGenerated files:');
  console.log('- README.md');
  console.log('- resume/Edward_Silva_Resume.tex');
  console.log('\nTo update:');
  console.log('1. Edit resume-data.json');
  console.log('2. Run: node build-resume.js');
  console.log('3. For PDF: cd resume && pdflatex Edward_Silva_Resume.tex');
}

// Run if called directly
if (require.main === module) {
  buildResume();
}

module.exports = {
  generateResume,
  generateREADME,
  buildResume
};