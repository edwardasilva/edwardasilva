#!/usr/bin/env node

/**
 * Site Builder
 * Generates website HTML and JavaScript data from resume-data.json
 */

const { 
  loadResumeData, 
  filters, 
  groupCertificationsByOrganization, 
  groupProjectsByType, 
  extractSkillNames,
  writeFile 
} = require('./utils');

/**
 * Generate data for HTML embedding
 */
function generateDataForHTML(data) {
  const relevantCourses = filters.filterRelevantCourses(data.education.courses);

  const infoContent = {
    // Education
    "deans-list": "Achieved Dean's List status for maintaining a GPA of 3.8 or higher for two semesters.",
    "honor-roll": "Recognized on the Honor Roll for maintaining a GPA between 3.5 and 3.79 for two semesters.",
    "provost-scholarship": "Awarded a merit-based scholarship of $9,000 per year for academic excellence throughout undergraduate studies.",
    "c-mapp": "Selected as a C-MAPP Scholar receiving $1,000 annually for demonstrating academic potential and leadership qualities.",
    "abs-scholar": "Recipient of the prestigious American Bureau of Shipping Scholarship valued at $4,000 for excellence in engineering studies related to maritime applications.",
    
    // Certifications
    ...Object.fromEntries(
      data.certifications.map(cert => {
        const key = cert.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return [key, cert.description];
      })
    ),
    
    // Courses
    ...Object.fromEntries(
      Object.entries(relevantCourses).flatMap(([category, courses]) =>
        courses.map(course => [course.code, course.description])
      )
    ),
  };

  const courseCategories = Object.fromEntries(
    Object.entries(relevantCourses)
      .filter(([category, courses]) => courses.length > 0)
      .map(([category, courses]) => [
        category,
        courses.map(course => course.code)
      ])
  );

  return { infoContent, courseCategories };
}

/**
 * Generate complete HTML website
 */
function generateHTML(data) {
  const websiteExperience = filters.filterWebsiteExperience(data.experience);
  const websiteProjects = filters.filterWebsiteProjects(data.projects);
  const relevantCourses = filters.filterRelevantCourses(data.education.courses);
  const { infoContent, courseCategories } = generateDataForHTML(data);

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="format-detection" content="telephone=no">

    <title>${data.personal.name}</title>
    <meta name="description" content="Explore the professional portfolio of ${data.personal.name}, an electrical engineering student with a minor in computer science, showcasing his projects, skills, and achievements.">
    <meta name="author" content="${data.personal.name}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="keywords" content="${data.personal.name}, Eddie Silva, portfolio, electrical engineering, computer science, projects, skills, Colorado School of Mines, software engineering, hardware, embedded systems, MATLAB, Java, Python, C++, Arduino, Raspberry Pi, controls, automation, power systems, wind energy, solar tracking, machine learning, digital circuits, programming, engineering student, research, internship, electrical engineer, software developer, robotics, signal processing, feedback control, Denver, Colorado Springs, Golden Colorado">

    <meta name="classification" content="Portfolio, Engineering, Technology">
    <meta name="category" content="Engineering Portfolio">
    <meta name="coverage" content="Worldwide">
    <meta name="distribution" content="Global">
    <meta name="rating" content="General">

    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">
    <meta name="expires" content="never">

    <meta name="industry" content="Engineering, Technology, Software Development">
    <meta name="occupation" content="Electrical Engineering Student, Software Developer">
    <meta name="skills" content="Electrical Engineering, Software Engineering, Embedded Systems, Control Systems, Machine Learning">

    <meta name="university" content="${data.education.institution}">
    <meta name="education" content="Electrical Engineering, Computer Science">
    <meta name="location" content="Golden, Colorado, Denver, Colorado Springs">

    <meta property="og:title" content="${data.personal.name}">
    <meta property="og:description" content="Professional portfolio of ${data.personal.name}, showcasing projects and skills">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${data.personal.website}">

    <meta name="linkedin:profile" content="${data.personal.linkedin}">
    <meta name="github:profile" content="${data.personal.github}">

    <link rel="canonical" href="${data.personal.website}/">
    <link rel="icon" type="image/svg+xml" href="assets/oscilloscope-favicon.svg">
    <link rel="stylesheet" href="main.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "${data.personal.name}",
        "jobTitle": "Electrical Engineering Student",
        "alumniOf": {
            "@type": "CollegeOrUniversity",
            "name": "${data.education.institution}"
        },
        "url": "${data.personal.website}",
        "sameAs": [
            "${data.personal.linkedin}",
            "${data.personal.github}"
        ],
        "knowsAbout": [
            "Electrical Engineering",
            "Computer Science",
            "Embedded Systems",
            "Control Systems",
            "Software Development",
            "Digital Signal Processing"
        ]
    }
    </script>
</head>

<body>
    <nav class="navigation">
        <div class="nav-container">
            <div class="nav-content">
                <div class="nav-brand">
                    <a href="#home" class="brand-link">${data.personal.name}</a>
                </div>
                <div class="nav-menu">
                    <div class="nav-links">
                        <a href="#profile" class="nav-link">Profile</a>
                        <a href="#education" class="nav-link">Education</a>
                        <a href="#skills" class="nav-link">Skills</a>
                        <a href="#experience" class="nav-link">Experience</a>
                        <a href="#projects" class="nav-link">Projects</a>
                        <a href="#certifications" class="nav-link">Certifications</a>
                        <a href="#courses" class="nav-link">Courses</a>
                        <a href="#goals" class="nav-link">Goals</a>
                    </div>
                </div>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
                    <svg class="theme-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                </button>
            </div>
        </div>
    </nav>

    <main>
        <div class="container">
            <section id="home" class="hero">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1 class="hero-title">${data.personal.name}</h1>
                        <p class="hero-subtitle">Electrical Engineering Student</p>
                    </div>
                    <div class="hero-contact">
                        <a href="mailto:${data.personal.email}" class="contact-item">
                            📧 ${data.personal.email}
                        </a>
                        <a href="${data.personal.linkedin}" class="contact-item" target="_blank" rel="noopener">
                            👔 LinkedIn
                        </a>
                        <a href="${data.personal.github}" class="contact-item" target="_blank" rel="noopener">
                            💻 GitHub
                        </a>
                    </div>
                    <div class="resume-buttons">
                        <a href="resume/Edward_Silva_Resume.pdf" class="resume-button btn btn-primary" target="_blank" rel="noopener">
                            📄 View Resume
                        </a>
                    </div>
                </div>
            </section>

            <section id="profile" class="section">
                <div class="section-header">
                    <h2>Profile</h2>
                </div>
                <div class="card profile-summary">
                    <div class="profile-content">
                        <p class="profile-lead">Electrical Engineering student at ${data.education.institution} with a strong foundation in software development, embedded systems, and electrical design. Proven track record of delivering innovative solutions through hands-on experience in defense technology, renewable energy research, and educational leadership.</p>

                        <div class="profile-highlights">
                            <div class="highlight-item">
                                <div class="highlight-content">
                                    <h4>Technical Excellence</h4>
                                    <p>Proficient in C/C++, Python, Java, and embedded systems development with experience optimizing DSP algorithms and implementing SIMD operations for real-time applications.</p>
                                </div>
                            </div>

                            <div class="highlight-item">
                                <div class="highlight-content">
                                    <h4>Industry Experience</h4>
                                    <p>Versatile engineering professional with experience spanning defense systems optimization, residential electrical design, educational technology, and renewable energy research across both software and hardware domains.</p>
                                </div>
                            </div>

                            <div class="highlight-item">
                                <div class="highlight-content">
                                    <h4>Research & Innovation</h4>
                                    <p>Contributed to cutting-edge research in offshore wind farm control systems and renewable energy integration, with a passion for sustainable technology solutions.</p>
                                </div>
                            </div>
                        </div>

                        <div class="profile-goal">
                            <p><strong>Career Objective:</strong> Seeking opportunities to apply technical expertise in digital signal processing, control systems, and embedded software development while pursuing long-term goals in R&D and academic research.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="education" class="section">
                <div class="section-header">
                    <h2>Education</h2>
                </div>
                <div class="card">
                    <div class="education-header">
                        <div class="education-info">
                            <h3>${data.education.degree}, ${data.education.specialization}</h3>
                            <p><strong>${data.education.institution}</strong> | Expected ${data.education.expectedGraduation}</p>
                            <p><strong>${data.education.minor}</strong>, ${data.education.minorSpecialization}</p>
                            <div class="gpa-indicator">
                                <span class="gpa-label">GPA</span>
                                <span class="gpa-value">${data.education.gpa}</span>
                            </div>
                        </div>
                    </div>

                    <div class="achievement-container">
                        <details class="dropdown-item section-dropdown">
                            <summary>Honors</summary>
                            <div class="dropdown-content">
                                <ul class="skill-list">
${data.education.honors.map(honor => `                                    <details class="dropdown-item nested">
                                        <summary>${honor}</summary>
                                        <div class="dropdown-content">
                                            <p>${honor.includes("Dean's List") ? "Achieved Dean's List status for maintaining a GPA of 3.8 or higher for two semesters." : "Recognized on the Honor Roll for maintaining a GPA between 3.5 and 3.79 for two semesters."}</p>
                                        </div>
                                    </details>`).join('\n')}
                                </ul>
                            </div>
                        </details>

                        <details class="dropdown-item section-dropdown">
                            <summary>Scholarships</summary>
                            <div class="dropdown-content">
                                <ul class="skill-list">
${data.education.scholarships.map(scholarship => `                                    <details class="dropdown-item nested">
                                        <summary>${scholarship}</summary>
                                        <div class="dropdown-content">
                                            <p>${scholarship.includes("Provost") ? "Awarded a merit-based scholarship of $9,000 per year for academic excellence throughout undergraduate studies." : scholarship.includes("C-MAPP") ? "Selected as a C-MAPP Scholar receiving $1,000 annually for demonstrating academic potential and leadership qualities." : "Recipient of the prestigious American Bureau of Shipping Scholarship valued at $4,000 for excellence in engineering studies related to maritime applications."}</p>
                                        </div>
                                    </details>`).join('\n')}
                                </ul>
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            <section id="skills" class="section">
                <div class="section-header">
                    <h2>Skills</h2>
                </div>
                <div class="skills-grid">
${Object.entries(filters.filterWebsiteSkills(data.skills)).map(([category, skills]) => {
  const skillNames = extractSkillNames(skills);
  
  return `                        <div class="skill-category">
                            <span class="skill-icon">${category === 'Programming' ? '💻' : category === 'Hardware' ? '⚙️' : '🔧'}</span>
                            <h3>${category}</h3>
                            <div class="skill-tags">
${skillNames.map(skill => `                                <span class="skill-tag">${skill}</span>`).join('\n')}
                            </div>
                        </div>`;
}).join('\n')}
                </div>
            </section>

            <section id="experience" class="section">
                <div class="section-header">
                    <h2>Experience</h2>
                </div>
                <div class="timeline">
${websiteExperience.map(exp => `                    <div class="timeline-item">
                        <div class="timeline-date">${exp.duration}</div>
                        <div class="card">
                            <h4>${exp.title}</h4>
                            <p><strong>${exp.company}</strong> | ${exp.location}</p>
                            <ul>
${exp.description.map(item => `                                <li>${item}</li>`).join('\n')}
                            </ul>
                        </div>
                    </div>`).join('\n')}
                </div>

                <section id="teaching" class="section">
                    <div class="section-header">
                        <h2>Teaching Experience</h2>
                    </div>
                    <div class="timeline">
${data.teachingExperience.map(exp => `                        <div class="timeline-item">
                            <div class="timeline-date">${exp.duration}</div>
                            <div class="card">
                                <h4>${exp.title}</h4>
                                <p><strong>${exp.company}</strong> | ${exp.location}</p>
                                <ul>
${exp.description.map(item => `                                    <li>${item}</li>`).join('\n')}
                                </ul>
                            </div>
                        </div>`).join('\n')}
                    </div>
                </section>

                <section id="research" class="section">
                    <div class="section-header">
                        <h2>Research Experience</h2>
                    </div>
                    <div class="timeline">
${data.researchExperience.map(exp => `                        <div class="timeline-item">
                            <div class="timeline-date">${exp.duration}</div>
                            <div class="card">
                                <div class="research-header">
                                    <div>
                                        <h4>${exp.title}</h4>
                                        <p><strong>${exp.company}</strong> | ${exp.location}</p>
                                    </div>
                                </div>
                                <ul>
${exp.description.map(item => `                                    <li>${item}</li>`).join('\n')}
                                </ul>
                            </div>
                        </div>`).join('\n')}
                    </div>
                </section>
            </section>

            <section id="projects" class="section">
                <div class="section-header">
                    <h2>Projects</h2>
                </div>
                <div class="timeline">
${(() => {
  const groupedProjects = groupProjectsByType(websiteProjects);
  return Object.entries(groupedProjects).flatMap(([type, projects]) => 
    projects.map(project => `                    <div class="timeline-item">
                        <div class="timeline-date">${project.duration}</div>
                        <div class="card">
                            <h4>${project.title}</h4>
                            <p><strong>${type}</strong> | ${project.technologies.join(', ')}</p>
                            <ul>
${project.description.map(item => `                                <li>${item}</li>`).join('\n')}
                            </ul>
${project.github ? `                            <div class="project-links">
                                <a href="${project.github}" target="_blank" rel="noopener" class="btn btn-primary">GitHub Repository</a>
                            </div>` : ''}
                        </div>
                    </div>`
  ));
})()}
                </div>
            </section>

            <section id="certifications" class="section">
                <div class="section-header">
                    <h2>Certifications</h2>
                </div>
                <div class="certifications-grid">
${(() => {
  const groupedCerts = groupCertificationsByOrganization(data.certifications);
  return Object.entries(groupedCerts).map(([org, certs]) => `                    <div class="card cert-card">
                        <div class="cert-header">
                            <span class="cert-icon">🏆</span>
                            <h3>${org} Certifications</h3>
                        </div>
                        <div class="cert-content">
                            <div class="cert-list">
${certs.map(cert => `                                <div class="cert-item">
                                    <h4>${cert.name}</h4>
                                    <p>${cert.description}</p>
${cert.credly ? `                                    <div class="credential-badge">
                                        <div data-iframe-width="150" data-iframe-height="270" data-share-badge-id="${cert.credly.split('/').pop()}" data-share-badge-host="https://www.credly.com"></div>
                                    </div>` : ''}
${cert.link && cert.link.trim() !== '' ? `                                    <div class="cert-links">
                                        <a href="${cert.link}" target="_blank" rel="noopener" class="underline-link">${cert.credly ? 'View Credly Badge' : 'View Certificate'}</a>
                                    </div>` : ''}
                                </div>`).join('\n')}
                            </div>
                        </div>
                    </div>`).join('\n');
})()}
                </div>
            </section>

            <section id="courses" class="section">
                <div class="section-header">
                    <h2>Relevant Courses</h2>
                </div>
                <div class="card">
${Object.entries(relevantCourses)
  .filter(([category, courses]) => courses.length > 0)
  .map(([category, courses]) => `                    <h3>${category} Courses</h3>
                    <div class="course-grid">
${courses.map(course => `                        <details class="dropdown-item">
                            <summary>${course.name} (${course.code})</summary>
                            <div class="dropdown-content">
                                <p class="course-description" data-course="${course.code}">${course.description}</p>
                            </div>
                        </details>`).join('\n')}
                    </div>`).join('\n')}
                </div>
            </section>

            <section id="goals" class="section">
                <div class="section-header">
                    <h2>Future Goals & Aspirations</h2>
                </div>
                <div class="card">
                    <h3 class="goals-header">Career Roadmap</h3>
                    <ul class="goals-roadmap">
${data.careerGoals.map(goal => `                        <li>${goal}</li>`).join('\n')}
                    </ul>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content" style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div class="footer-social">
                    <a href="${data.personal.linkedin}" class="social-link" target="_blank" rel="noopener" aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M18.335 18.339H15.67v-4.177c0-.996-.02-2.278-1.39-2.278-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.2 1.778 3.2 4.091v4.715zM7.003 8.575a1.546 1.546 0 01-1.548-1.549 1.548 1.548 0 111.547 1.549zm1.336 9.764H5.666V9.75H8.34v8.589zM19.67 3H4.329C3.593 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.338C20.4 21 21 20.42 21 19.703V4.297C21 3.58 20.4 3 19.666 3h.003z" />
                        </svg>
                    </a>  
                    <a href="${data.personal.github}" class="social-link" target="_blank" rel="noopener" aria-label="GitHub">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                    </a>
                    <a href="mailto:${data.personal.email}" class="social-link" aria-label="Email">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                    </a>
                </div>
                <p class="footer-text">Last updated: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </footer>

    <script>
        // Data from resume-data.json
        const infoContent = ${JSON.stringify(infoContent, null, 2)};
        const courseCategories = ${JSON.stringify(courseCategories, null, 2)};
    </script>
    <script src="https://www.credly.com/assets/utilities/embed.js" async></script>
</body>
</html>`;

  return template;
}

/**
 * Main site build function
 */
function buildSite() {
  console.log('Starting site build...\n');
  
  const data = loadResumeData();
  
  writeFile('../index.html', generateHTML(data));
  
  console.log('\nSite build completed!');
  console.log('\nGenerated files:');
  console.log('- index.html');
}

// Run if called directly
if (require.main === module) {
  buildSite();
}

module.exports = {
  generateHTML,
  generateDataForHTML,
  buildSite
};