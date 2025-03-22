// Information content for dynamic loading
const infoContent = {
  // Education
  "deans-list": "Achieved Dean's List status for maintaining a GPA of 3.8 or higher for two semesters.",
  "honor-roll": "Recognized on the Honor Roll for maintaining a GPA between 3.5 and 3.79 for two semesters.",
  "provost-scholarship": "Awarded a merit-based scholarship of $9,000 per year for academic excellence throughout undergraduate studies.",
  "c-mapp": "Selected as a C-MAPP Scholar receiving $1,000 annually for demonstrating academic potential and leadership qualities.",
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

// Cache implementation for DOM elements
const elementCache = new Map();

// Get element with caching
function getElement(id) {
  if (!elementCache.has(id)) {
    elementCache.set(id, document.getElementById(id));
  }
  return elementCache.get(id);
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Core initialization in a try-catch for error resilience
  try {
    initializeThemeToggle();
    populateAllCourseDescriptions();
    populateCertificationContent();
    initializeEventListeners();
    setupAnimations();
    enhanceNavigation();
    enhanceSkillTags();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Event listeners initialization - optimized using event delegation
function initializeEventListeners() {
  // Navigation smooth scrolling with event delegation
  document.querySelector('.nav-links')?.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      handleNavClick.call(e.target, e);
    }
  });
  
  // Resume download button
  document.addEventListener('click', event => {
    if (event.target.matches('.resume-button')) {
      downloadResume();
    }
  });
  
  // Course details with event delegation
  document.body.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    if (summary && summary.parentElement.matches('details[open]')) {
      const description = summary.parentElement.querySelector('.course-description[data-course]');
      if (description && !description.textContent.trim()) {
        loadCourseDescription(description);
      }
    }
  });

  // Scroll events for animations with throttling
  window.addEventListener('scroll', throttle(revealOnScroll, 100));

  // Back to top button
  document.querySelector('.back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Load course description helper
function loadCourseDescription(element) {
  const courseCode = element.getAttribute('data-course');
  element.textContent = infoContent[courseCode] || 'Course description not available.';
  element.classList.add('fade-in');
}

// Setup animations for page elements
function setupAnimations() {
  // Add animation classes with staggered delays
  const animateSections = (selector, animationClass, baseDelay = 0, delayIncrement = 0.1) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add(animationClass);
      el.style.animationDelay = `${baseDelay + (i * delayIncrement)}s`;
      el.style.opacity = '0'; // Start hidden
    });
  };
  
  // Apply animations to various elements
  animateSections('.section', 'fade-in');
  animateSections('header h1, header h2, header p, .resume-button', 'fade-in', 0.3, 0.15);
  animateSections('.timeline-item', 'slide-in-left', 0.1, 0.1);
  animateSections('.skill-category', 'scale-in', 0.2, 0.1);
  
  // Reveal visible elements on page load
  setTimeout(revealOnScroll, 100);
}

// Reveal elements when they enter the viewport - performance optimized
function revealOnScroll() {
  const elements = document.querySelectorAll('[class*="fade-in"], [class*="slide-in"], [class*="scale-in"]');
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  
  elements.forEach(element => {
    if (element.style.opacity === '0') {
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.top <= viewportHeight * 0.9 && rect.bottom >= 0;
      
      if (isInViewport) {
        element.style.opacity = '1';
      }
    }
  });
}

// Throttle function to limit function calls
function throttle(func, limit) {
  let lastFunc, lastRan;
  return function() {
    const context = this;
    const args = arguments;
    
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Navigation enhancement
function enhanceNavigation() {
  // Implementation for tracking active section
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  if (!sections.length || !navLinks.length) return;
  
  const highlightActiveSection = throttle(() => {
    const scrollPosition = window.scrollY + 100;
    
    // Find current section
    let currentSection = sections[0];
    sections.forEach(section => {
      if (scrollPosition >= section.offsetTop) {
        currentSection = section;
      }
    });
    
    // Update active nav link
    const currentId = currentSection.id;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }, 100);
  
  window.addEventListener('scroll', highlightActiveSection);
  highlightActiveSection(); // Run once on init
}

// Navigation click handler
function handleNavClick(e) {
  const href = this.getAttribute('href');
  
  if (href?.startsWith('#')) {
    e.preventDefault();
    const targetElement = document.getElementById(href.substring(1));
    
    if (targetElement) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
      
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  }
}

// Resume download with user feedback
function downloadResume() {
  const button = document.querySelector('.resume-button');
  
  if (button) {
    const originalText = button.textContent;
    button.textContent = 'Downloading...';
    button.style.opacity = '0.8';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.opacity = '1';
    }, 1500);
  }
  
  // Create and trigger download
  const link = document.createElement('a');
  link.href = 'assets/resume.pdf';
  link.download = 'Edward_Silva_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Theme toggle with smooth transition
function initializeThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  const updateThemeIcon = (theme) => {
    toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    toggle.classList.add('rotating');
    setTimeout(() => toggle.classList.remove('rotating'), 500);
  };
  
  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update the --bg-rgb variable based on the new theme
    document.documentElement.style.setProperty('--bg-rgb', newTheme === 'dark' ? '17, 24, 39' : '255, 255, 255');
    
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
    
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 500);
  });
  
  // Set initial icon based on current theme
  updateThemeIcon(document.documentElement.getAttribute('data-theme'));
  
  // Add CSS for rotation animation if not present
  if (!document.getElementById('theme-toggle-style')) {
    const style = document.createElement('style');
    style.id = 'theme-toggle-style';
    style.textContent = `
      @keyframes rotate {
        0% { transform: rotate(0); }
        100% { transform: rotate(360deg); }
      }
      .rotating {
        animation: rotate 0.5s ease-in-out;
      }
      .theme-transition {
        transition: color 0.5s ease, background-color 0.5s ease;
      }
    `;
    document.head.appendChild(style);
  }
}

// Batch populate course descriptions
function populateAllCourseDescriptions() {
  const descriptions = document.querySelectorAll('.course-description[data-course]');
  if (!descriptions.length) return;
  
  // Process in chunks for better UI responsiveness
  const processChunk = (startIndex, chunkSize) => {
    const endIndex = Math.min(startIndex + chunkSize, descriptions.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const description = descriptions[i];
      const courseCode = description.getAttribute('data-course');
      description.textContent = infoContent[courseCode] || 'Course description not available.';
    }
    
    // Process next chunk if needed
    if (endIndex < descriptions.length) {
      setTimeout(() => processChunk(endIndex, chunkSize), 0);
    }
  };
  
  // Start processing in chunks of 5
  processChunk(0, 5);
}

// Populate certification content
function populateCertificationContent() {
  const certSection = getElement('certifications');
  if (!certSection) return;
  
  const dropdowns = certSection.querySelectorAll('.dropdown-item');
  if (!dropdowns.length) return;
  
  // Process all certification content
  dropdowns.forEach(dropdown => {
    const nestedElements = dropdown.querySelectorAll('.nested .dropdown-content p:empty');
    
    nestedElements.forEach(p => {
      const nestedSummary = p.closest('.nested').querySelector('summary');
      if (nestedSummary) {
        const text = nestedSummary.textContent.trim();
        const key = text.toLowerCase().replace(/\s+/g, '-');
        p.textContent = infoContent[key] || `Information about ${text}`;
      }
    });
  });
}

// Add interactive behavior to skill tags
function enhanceSkillTags() {
  const skillTags = document.querySelectorAll('.skill-tag');
  
  skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      tag.style.transform = 'scale(1.1) translateY(-3px)';
      tag.style.boxShadow = 'var(--shadow-md)';
    });
    
    tag.addEventListener('mouseleave', () => {
      tag.style.transform = '';
      tag.style.boxShadow = '';
    });
  });
}
