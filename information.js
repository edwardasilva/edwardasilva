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
  "CSCI 102": "Introductory course designed to introduce students to the basic principles of computer science. Students will learn programming fundamentals and computational thinking.",
  "CSCI 128": "Introduces computer science concepts and practice with emphasis on STEM applications: data structures, algorithms, abstraction, and computing concepts in STEM.",
  "CSCI 200": "Covers programming concepts and methodology for object-oriented design. Topics include recursion, pointers, linked lists, ADTs, and OOP.",
  "CSCI 220": "Fundamentals of data structures including stacks, queues, trees, and graphs. Emphasis on algorithm analysis and software development.",
  "CSCI 290": "Programming challenges that promote algorithmic thinking, creative problem solving, and coding competitions.",
  "CSCI 306": "Introduction to software engineering practices: design, implementation, testing, maintenance, team collaboration, and version control.",
  "CSCI 341": "Computer organization fundamentals: assembly language, digital logic, CPU design, memory hierarchy, and I/O systems.",
  "CSCI 358": "Discrete math for CS: logic, set theory, functions, relations, combinatorics, graphs, and formal languages.",
  "EENG 282": "Covers DC and AC circuits, circuit theorems, transient and steady-state analysis, and practical applications.",
  "EENG 284": "Covers fundamentals of digital systems: number systems, Boolean algebra, logic gates, Karnaugh maps, flip-flops, and sequential logic.",
  "EENG 307": "Introduction to classical control systems: Laplace transforms, transfer functions, stability, root locus, and frequency response.",
  "EENG 310": "Signal and system theory: linear systems, Fourier analysis, sampling, filtering, and applications in communications and signal processing.",
  "EENG 311": "Information systems science II: probability, random processes, noise, and information theory as applied to EE systems.",
  "EENG 340": "Cooperative education course with engineering experience. Requires documented employment and approval.",
  "EENG 350": "Experimental design and project-based exploration of EE systems. Emphasis on teamwork and engineering practice.",
  "EENG 383": "Design and implementation of embedded systems including microcontrollers, real-time programming, and interfacing.",
  "EENG 385": "Study of electronic devices and circuits: diodes, BJTs, FETs, op-amps, and analog circuit design.",
  "EENG 386": "Covers electrostatics, magnetostatics, Maxwell's equations, wave propagation, transmission lines, and waveguides.",
  "EENG 389": "Study of electric machines: transformers, DC and AC motors, performance characteristics and applications.",
  "EENG 391": "Preparation for the FE exam focusing on computational methods used in electrical engineering.",
  "EENG 392": "FE preparation for Information and Systems Sciences. Practice problems and conceptual review.",
  "EDNS 151": "Team-based introductory design course using creative problem solving, prototyping, and presentation techniques.",
  "EBGN 201": "Introduction to macroeconomic principles: GDP, inflation, unemployment, monetary and fiscal policy.",
  "MATH 111": "Differential calculus for science/engineering majors: limits, continuity, derivatives, applications, and intro to integrals.",
  "MATH 112": "Integral calculus and applications: methods of integration, sequences and series, and polar coordinates.",
  "MATH 213": "Multivariable calculus: partial derivatives, multiple integrals, vector calculus, and applications.",
  "MATH 225": "Differential equations: first- and second-order equations, Laplace transforms, and numerical methods.",
  "MATH 332": "Linear algebra: matrices, vector spaces, eigenvalues, and linear transformations.",
  "PHGN 100": "Mechanics for scientists and engineers: kinematics, Newton's laws, energy, momentum, rotation, and oscillations.",
  "PHGN 200": "Electricity, magnetism, and optics: Coulomb's law, electric/magnetic fields, circuits, Maxwell's equations.",
  "CHGN 121": "Fundamental principles of chemistry: atomic structure, stoichiometry, gas laws, thermochemistry, and bonding.",
  "CHGN 122": "Continues general chemistry: kinetics, equilibrium, thermodynamics, electrochemistry, and nuclear chemistry.",
  "HASS 100": "Nature and Human Values explores ethical and cultural dimensions of science, technology, and the environment.",
  "HASS 200": "Global Studies: explores global interconnections and cultural dynamics through multidisciplinary perspectives.",
  "HNRS 198": "Research internship course providing practical experience in scholarly inquiry and investigation.",
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

// Optimize performance by using event delegation
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle initialization
  initializeThemeToggle();
  
  // Initialize lazy loading for sections
  initializeLazyLoading();
  
  // Add event delegation for info buttons and course dropdown
  document.body.addEventListener('click', function(event) {
    // Handle info buttons
    if (event.target.classList.contains('info-button')) {
      handleInfoButtonClick(event.target);
    }
    
    // Handle view all courses button
    if (event.target.closest('.view-all-courses-btn')) {
      toggleAllCourses();
    }
    
    // Handle category headers for collapsing/expanding
    if (event.target.closest('.category-header')) {
      toggleCategoryContent(event.target.closest('.category-header'));
    }
  });
  
  // Initialize the courses wrapper with categorized courses
  initializeCoursesWrapper();
  
  // Add transcript reference notice
  addTranscriptReference();
});

// Download resume function
function downloadResume() {
  // Create link to resume file
  const link = document.createElement('a');
  link.href = 'assets/Edward_Silva_Resume.pdf';
  link.download = 'Edward_Silva_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize theme toggle
function initializeThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update icon
      toggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    });
    
    // Set initial icon based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    toggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
  }
}

// Handle info button clicks efficiently
function handleInfoButtonClick(button) {
  const infoId = button.getAttribute('data-info');
  const infoBox = button.nextElementSibling;
  
  if (infoBox) {
    // Check if content is already loaded
    const infoContent = infoBox.querySelector('.info-content');
    if (infoContent && !infoContent.textContent) {
      infoContent.textContent = window.infoContent[infoId] || 'Information not available';
    }
    
    // Toggle visibility with class for animation
    infoBox.classList.toggle('active');
  }
}

// Initialize lazy loading for sections
function initializeLazyLoading() {
  // Intersection Observer for lazy loading sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });
  
  // Observe all sections
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}

// Toggle all courses dropdown
function toggleAllCourses() {
  const button = document.querySelector('.view-all-courses-btn');
  const coursesWrapper = document.querySelector('.all-courses-wrapper');
  
  button.classList.toggle('active');
  coursesWrapper.classList.toggle('visible');
  
  // Set arrow direction
  const arrow = button.querySelector('.dropdown-arrow');
  if (arrow) {
    arrow.textContent = button.classList.contains('active') ? '▲' : '▼';
  }
}

// Toggle category content visibility
function toggleCategoryContent(header) {
  const content = header.nextElementSibling;
  const arrow = header.querySelector('.category-arrow');
  
  // Toggle expanded class
  content.classList.toggle('expanded');
  
  // Update arrow direction
  if (arrow) {
    arrow.textContent = content.classList.contains('expanded') ? '▲' : '▼';
  }
}

// Initialize the courses wrapper with categorized courses
function initializeCoursesWrapper() {
  const coursesWrapper = document.getElementById('courses-wrapper');
  
  if (coursesWrapper) {
    let html = '';
    
    // Generate HTML for each category
    for (const [category, courses] of Object.entries(courseCategories)) {
      html += `
        <div class="course-category">
          <div class="category-header">
            <h3>${category}</h3>
            <span class="category-arrow">▼</span>
          </div>
          <div class="category-content">
      `;
      
      // Add each course in the category
      courses.forEach(courseCode => {
        if (infoContent[courseCode]) {
          html += `
            <div class="course-item">
              <div class="course-name">${courseCode}</div>
              <div class="course-description">${infoContent[courseCode]}</div>
            </div>
          `;
        }
      });
      
      html += `
          </div>
        </div>
      `;
    }
    
    // Set the HTML content
    coursesWrapper.innerHTML = html;
  }
}
