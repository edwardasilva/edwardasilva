// Information content for dynamic loading
const infoContent = {
  // Education
  "deans-list": "Achieved Dean's List status for maintaining a GPA of 3.8 or higher for two semesters.",
  "honor-roll": "Recognized on the Honor Roll for maintaining a GPA between 3.5 and 3.79 for two semesters.",
  "provost-scholarship": "Awarded a merit-based scholarship of $9,000 per year for academic excellence throughout undergraduate studies.",
  "c-mapp": "Selected as a Colorado Mines Advanced Planning Program Scholar receiving $1,000 annually for demonstrating academic potential and leadership qualities.",
  "abs-scholar": "Recipient of the prestigious American Bureau of Shipping Scholarship valued at $4,000 for excellence in engineering studies related to maritime applications.",
  
  // Certifications
  "matlab-machine-learning-essentials": "Completed the MATLAB Machine Learning Techniques learning path, demonstrating comprehensive knowledge in machine learning techniques and their implementation in MATLAB. This credential validates proficiency in data preprocessing, feature engineering, supervised and unsupervised learning algorithms, and model evaluation.",
  "matlab-onramps": "Completed multiple MATLAB Onramp courses, which provide hands-on introduction to essential MATLAB skills and specialized applications. These self-paced tutorials cover fundamentals of MATLAB programming, machine learning techniques, and signal processing.",
  "matlab-machine-learning": "Completed the MATLAB Machine Learning Onramp certification, demonstrating proficiency in implementing machine learning algorithms using MATLAB.",
  "matlab-signal": "Earned the MATLAB Signal Processing Onramp certification, validating skills in digital signal processing techniques and algorithms.",
  "matlab-fundamentals": "Achieved the MATLAB Onramp certification, confirming mastery of essential MATLAB programming and problem-solving capabilities.",
  "mta-java": "Earned Microsoft Technical Associate certification in Java Programming, validating proficiency in Java syntax, data structures, and object-oriented programming concepts.",
  "mta-python": "Received Microsoft Technical Associate certification in Python Programming, demonstrating competency in Python syntax, functions, and software development principles.",
  
  // Courses
  "CSCI 102": "A programming course in Python designed for students with little or no programming experience. Covers designing and programming Python applications, loops, decision statements, lists, tuples, sets, dictionaries, strings, Python functions, file I/O, object-oriented programming, and code tracing.",
  "CSCI 128": "Introduction to programming with no prior experience needed. Teaches basic programming constructs including data types, conditionals, loops, file I/O, functions, and Python 3 objects. Emphasizes data science, best practices in code development, software ethics, numeric and non-numeric data representation, file systems, debugging, and problem-solving.",
  "CSCI 200": "Covers programming concepts and methodology for object-oriented design including recursion, pointers, linked lists, abstract data types, and object-oriented programming principles.",
  "CSCI 220": "Fundamental data structures such as stacks, queues, trees, and graphs with a strong emphasis on algorithm analysis and software development practices.",
  "CSCI 274": "Comprehensive introduction to Linux OS, covering command-line tools, remote access (ssh), file system management, editing, compilation, execution, shell scripting, processes, permissions, and networking.",
  "CSCI 290": "Programming challenges promoting algorithmic thinking, creative problem-solving, and participation in coding competitions.",
  "CSCI 306": "Covers software development lifecycle including design, implementation, testing, maintenance, team collaboration, and version control systems.",
  "CSCI 341": "Covers foundational computer organization concepts, assembly language, digital logic design, CPU design, memory hierarchy, and I/O systems.",
  "CSCI 358": "Essential concepts including logic, set theory, functions, relations, combinatorics, graph theory, and formal languages.",
  "EENG 282": "Detailed coverage of DC and AC circuits, circuit theorems, transient and steady-state analysis, and practical laboratory applications.",
  "EENG 284": "Introduction to digital systems covering number systems, Boolean algebra, logic gates, Karnaugh maps, flip-flops, and sequential logic circuits.",
  "EENG 307": "Includes analysis and design using Laplace transforms, transfer functions, stability criteria, root locus, and frequency response.",
  "EENG 310": "Comprehensive theory of linear systems, Fourier analysis, sampling theory, signal filtering, and applications in communications and signal processing.",
  "EENG 311": "Advanced study of probability, random processes, noise characterization, and information theory in electrical engineering.",
  "EENG 340": "Hands-on engineering experience requiring documented employment and formal approval.",
  "EENG 350": "Emphasis on collaborative experimental design and application of engineering principles in EE systems.",
  "EENG 383": "Detailed coverage of microcontroller-based system design, real-time programming, and hardware interfacing.",
  "EENG 385": "Study of semiconductor devices, including diodes, BJTs, FETs, operational amplifiers, and detailed analog circuit design.",
  "EENG 386": "Comprehensive exploration of electrostatics, magnetostatics, Maxwell's equations, electromagnetic wave propagation, transmission lines, and waveguide analysis.",
  "EENG 389": "Covers operation, performance characteristics, and applications of transformers, DC motors, and AC machines.",
  "EENG 391": "In-depth review and preparation focusing on computational methods for electrical engineering.",
  "EENG 392": "Targeted preparation including conceptual reviews and extensive practice problems.",
  "EDNS 151": "Team-based design projects focused on creative problem-solving, prototyping skills, and effective presentation techniques.",
  "EBGN 201": "Overview of macroeconomic concepts such as GDP, inflation, unemployment, monetary, and fiscal policies.",
  "MATH 111": "In-depth study of limits, continuity, derivatives, their applications, and introduction to integral calculus.",
  "MATH 112": "Detailed coverage of integration methods, sequences and series, and applications of polar coordinates.",
  "MATH 213": "Advanced calculus covering partial derivatives, multiple integrals, vector calculus, and their applications.",
  "MATH 225": "Comprehensive analysis of first and second-order equations, Laplace transforms, and numerical methods.",
  "MATH 332": "Rigorous exploration of matrices, vector spaces, eigenvalues, eigenvectors, and linear transformations.",
  "PHGN 100": "Fundamental mechanics including kinematics, Newtonian mechanics, energy, momentum, rotational dynamics, and oscillations.",
  "PHGN 200": "Comprehensive treatment of electric and magnetic fields, Coulomb's law, circuit theory, and Maxwell's equations.",
  "CHGN 121": "Fundamental principles including atomic structure, chemical bonding, stoichiometry, gas laws, and thermochemistry.",
  "CHGN 122": "Advanced chemical concepts including reaction kinetics, equilibrium, thermodynamics, electrochemistry, and nuclear chemistry.",
  "HASS 100": "Ethical and cultural dimensions of science and technology, emphasizing critical analysis and communication.",
  "HASS 200": "Examines global cultural dynamics and multidisciplinary perspectives on international issues.",
  "HNRS 198": "Practical research experience emphasizing scholarly inquiry and investigation methods.",
};

// Course categories for organizing in the UI
const courseCategories = {
  "Computer Science": ["CSCI 102", "CSCI 128", "CSCI 200", "CSCI 220", "CSCI 290", "CSCI 306", "CSCI 341", "CSCI 358"],
  "Electrical Engineering": ["EENG 282", "EENG 284", "EENG 307", "EENG 310", "EENG 311", "EENG 340", "EENG 350", "EENG 383", "EENG 385", "EENG 386", "EENG 389", "EENG 391", "EENG 392"],
  "Mathematics": ["MATH 111", "MATH 112", "MATH 213", "MATH 225", "MATH 332"],
  "Physics": ["PHGN 100", "PHGN 200"],
  "Chemistry": ["CHGN 121", "CHGN 122"],
  "General Studies": ["EBGN 201","EDNS 151","HASS 100", "HASS 200", "HNRS 198"]
};

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Core initialization
  initializeThemeToggle();
  populateAllCourseDescriptions();
  populateCertificationContent();
  initializeEventListeners();
});

// Event listeners initialization - simplified
function initializeEventListeners() {
  // Navigation smooth scrolling
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', handleNavClick);
  });
  
  // Add event listener for the resume download button
  const resumeButton = document.getElementById('download-resume');
  if (resumeButton) {
    resumeButton.addEventListener('click', downloadResume);
  }
  
  // Delegate other events to body
  document.body.addEventListener('click', event => {
    // Details elements
    const summary = event.target.closest('summary');
    if (summary) {
      const details = summary.parentElement;
      if (details.tagName === 'DETAILS' && details.open) {
        const description = details.querySelector('.course-description[data-course]');
        if (description && !description.textContent.trim()) {
          const courseCode = description.getAttribute('data-course');
          description.textContent = infoContent[courseCode] || 'Course description not available.';
        }
      }
    }
  });
}

// Navigation click handler
function handleNavClick(e) {
  const href = this.getAttribute('href');
  
  if (href.startsWith('#')) {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Add active class to the clicked link
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
      
      // Scroll to the target element
      window.scrollTo({
        top: targetElement.offsetTop - 65,
        behavior: 'smooth'
      });
    }
  }
}

// Download resume function
function downloadResume() {
  const link = document.createElement('a');
  link.href = 'assets/Edward_Silva_Resume.pdf'; // Make sure this path is correct
  link.download = 'Edward_Silva_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Theme toggle with smooth transition
function initializeThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Add transition class for smoother theme change
    document.body.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icon
    toggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  });
  
  // Set initial icon
  const currentTheme = document.documentElement.getAttribute('data-theme');
  toggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
}

// Populate course descriptions immediately for better UX
function populateAllCourseDescriptions() {
  document.querySelectorAll('.course-description[data-course]').forEach(description => {
    const courseCode = description.getAttribute('data-course');
    description.textContent = infoContent[courseCode] || 'Course description not available.';
  });
}

// Add transcript reference
function addTranscriptReference() {
  const coursesSection = document.getElementById('courses');
  if (!coursesSection) return;
  
  const allCoursesContainer = coursesSection.querySelector('.all-courses-container');
  if (!allCoursesContainer) return;
  
  const referenceNotice = document.createElement('p');
  referenceNotice.className = 'transcript-reference';
  referenceNotice.textContent = 'For complete course details, refer to the Colorado School of Mines course catalog. Please email me for transcript verification.';
  allCoursesContainer.appendChild(referenceNotice);
}

// Populate certification content
function populateCertificationContent() {
  const certSection = document.getElementById('certifications');
  if (!certSection) return;
  
  const dropdowns = certSection.querySelectorAll('.dropdown-item');
  dropdowns.forEach(dropdown => {
    const summary = dropdown.querySelector('summary');
    const content = dropdown.querySelector('.dropdown-content');
    
    if (summary && content) {
      // Pre-populate the nested detail elements' content if needed
      dropdown.querySelectorAll('.nested .dropdown-content p:empty').forEach(p => {
        const nestedSummary = p.closest('.nested').querySelector('summary');
        if (nestedSummary) {
          const text = nestedSummary.textContent.trim();
          const key = text.toLowerCase().replace(/\s+/g, '-');
          p.textContent = infoContent[key] || `Information about ${text}`;
        }
      });
    }
  });
}
