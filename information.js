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

// Cache for frequently accessed elements
const cache = {
  elements: {}
};

// Get element with caching
function getElement(id) {
  if (!cache.elements[id]) {
    cache.elements[id] = document.getElementById(id);
  }
  return cache.elements[id];
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Core initialization 
  initializeThemeToggle();
  populateAllCourseDescriptions();
  populateCertificationContent();
  initializeEventListeners();
  setupAnimations();
  enhanceNavigation();
  
  // Add new enhancements
  enhanceSkillTags();
  addHeaderParallax();
  
  // Add click handler for project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Don't trigger if clicking on a link
      if (e.target.tagName === 'A') return;
      
      // Toggle active class for subtle highlight
      this.classList.toggle('active-project');
      
      // Optional: expand card description
      const description = this.querySelector('ul');
      if (description) {
        description.style.maxHeight = description.style.maxHeight ? null : description.scrollHeight + 'px';
      }
    });
  });
});

// Event listeners initialization - simplified and optimized
function initializeEventListeners() {
  // Navigation smooth scrolling - delegate to parent container
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.addEventListener('click', e => {
      const link = e.target.closest('a');
      if (link) handleNavClick.call(link, e);
    });
  }
  
  // Add event listener for the resume download button
  document.addEventListener('click', event => {
    if (event.target.classList.contains('resume-button')) {
      downloadResume();
    }
  });
  
  // Delegate course details to body - single event listener
  document.body.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    if (summary && summary.parentElement.tagName === 'DETAILS' && summary.parentElement.open) {
      const description = summary.parentElement.querySelector('.course-description[data-course]');
      if (description && !description.textContent.trim()) {
        const courseCode = description.getAttribute('data-course');
        description.textContent = infoContent[courseCode] || 'Course description not available.';
        
        // Add subtle animation to newly revealed content
        description.classList.add('fade-in');
      }
    }
  });

  // Add scroll event listener for revealing elements
  window.addEventListener('scroll', throttle(revealOnScroll, 100));

  // Add event listener for card hover effects
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = 'var(--shadow-lg)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

// Setup animations for page elements
function setupAnimations() {
  // Add animation classes to each section
  const sections = document.querySelectorAll('.section');
  sections.forEach((section, index) => {
    section.classList.add('fade-in');
    section.style.animationDelay = `${index * 0.1}s`;
    section.style.opacity = '0'; // Start hidden
  });
  
  // Add animation to header elements
  const header = document.querySelector('header');
  if (header) {
    const headerElements = header.querySelectorAll('h1, h2, p, button');
    headerElements.forEach((el, index) => {
      el.classList.add('fade-in');
      el.style.animationDelay = `${0.3 + (index * 0.15)}s`;
      el.style.opacity = '0'; // Start hidden
    });
  }
  
  // Add animation to timeline items
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    item.classList.add('slide-in-left');
    item.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    item.style.opacity = '0'; // Start hidden
  });
  
  // Add animation to skill categories
  const skillItems = document.querySelectorAll('.skill-category');
  skillItems.forEach((item, index) => {
    item.classList.add('scale-in');
    item.style.animationDelay = `${0.2 + (index * 0.1)}s`;
    item.style.opacity = '0'; // Start hidden
  });

  // Trigger animation for elements in viewport on page load
  setTimeout(() => {
    revealOnScroll();
  }, 100);
}

// Reveal elements when they enter the viewport
function revealOnScroll() {
  const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
  
  elements.forEach(element => {
    if (isElementInViewport(element) && element.style.opacity === '0') {
      element.style.opacity = '1';
    }
  });
}

// Check if element is in viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.9 &&
    rect.bottom >= 0
  );
}

// Throttle function to limit function calls
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Enhance navigation with active state tracking
function enhanceNavigation() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Highlight active section in navigation
  const highlightActiveSection = throttle(() => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const scrollPosition = window.scrollY;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.id;
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, 100);
  
  // Add scroll event listener
  window.addEventListener('scroll', highlightActiveSection);
  
  // Run once on page load
  highlightActiveSection();
}

// Navigation click handler - optimized
function handleNavClick(e) {
  const href = this.getAttribute('href');
  
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Update active class
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
      
      // Smooth scroll to target
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  }
}

// Download resume function with feedback
function downloadResume() {
  const button = document.querySelector('.resume-button');
  
  // Visual feedback
  if (button) {
    const originalText = button.textContent;
    button.textContent = 'Downloading...';
    button.style.opacity = '0.8';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.opacity = '1';
    }, 1500);
  }
  
  const link = document.createElement('a');
  link.href = 'assets/resume.pdf';
  link.download = 'Edward_Silva_Resume.pdf';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Theme toggle with smooth transition - enhanced
function initializeThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  const updateThemeIcon = (theme) => {
    toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    
    // Add animation
    toggle.classList.add('rotating');
    setTimeout(() => toggle.classList.remove('rotating'), 500);
  };
  
  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
    
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 500);
  });
  
  // Set initial icon based on current theme
  updateThemeIcon(document.documentElement.getAttribute('data-theme'));
  
  // Add CSS for rotation animation
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

// Populate course descriptions - optimized with batch operation
function populateAllCourseDescriptions() {
  const descriptions = document.querySelectorAll('.course-description[data-course]');
  if (descriptions.length === 0) return;
  
  // Use DocumentFragment for batch updates
  const fragment = document.createDocumentFragment();
  descriptions.forEach(description => {
    const courseCode = description.getAttribute('data-course');
    description.textContent = infoContent[courseCode] || 'Course description not available.';
    fragment.appendChild(description.cloneNode(true));
  });
  
  // Only update DOM once if needed
  if (fragment.children.length) {
    descriptions[0].parentNode.replaceChildren(fragment);
  }
}

// Add transcript reference - optimized
function addTranscriptReference() {
  const coursesSection = getElement('courses');
  if (!coursesSection) return;
  
  const allCoursesContainer = coursesSection.querySelector('.all-courses-container');
  if (!allCoursesContainer) return;
  
  // Check if reference already exists to avoid duplicates
  if (!allCoursesContainer.querySelector('.transcript-reference')) {
    const referenceNotice = document.createElement('p');
    referenceNotice.className = 'transcript-reference';
    referenceNotice.textContent = 'For complete course details, refer to the Colorado School of Mines course catalog. Please email me for transcript verification.';
    allCoursesContainer.appendChild(referenceNotice);
  }
}

// Populate certification content - optimized
function populateCertificationContent() {
  const certSection = getElement('certifications');
  if (!certSection) return;
  
  const dropdowns = certSection.querySelectorAll('.dropdown-item');
  // Fast return if no content to populate
  if (dropdowns.length === 0) return;
  
  // Processing all at once with less DOM operations
  dropdowns.forEach(dropdown => {
    const nestedElements = dropdown.querySelectorAll('.nested .dropdown-content p:empty');
    if (nestedElements.length === 0) return;
    
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

// Reveal initial elements with staggered animation - modify to run immediately
function revealInitialElements() {
  // Elements to animate in sequence
  const elementsToAnimate = [
    'header h1',                    // Name (first)
    'header h2',                    // Title
    'header p',                     // Description
    'header .resume-button',        // Resume button
    '.contact-info',                // Contact info section
    '.nav-links',                   // Navigation
    '#education .section-header'    // First section header
  ];
  
  // Apply staggered animations immediately
  elementsToAnimate.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      // Show immediately with minimal delay
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    }
  });
}

// Add interactive element for skill tags
function enhanceSkillTags() {
  const skillTags = document.querySelectorAll('.skill-tag');
  
  skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      // Create small pop effect
      tag.style.transform = 'scale(1.1) translateY(-3px)';
      tag.style.boxShadow = 'var(--shadow-md)';
    });
    
    tag.addEventListener('mouseleave', () => {
      // Return to normal
      tag.style.transform = '';
      tag.style.boxShadow = '';
    });
  });
}

// Add parallax scroll effect to header
function addHeaderParallax() {
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const header = document.querySelector('header');
    
    if (header && scrollPosition < header.offsetHeight) {
      // Move background elements at different rates for parallax effect
      const bgElements = header.querySelectorAll('::before, ::after');
      const parallaxRate = scrollPosition * 0.4;
      
      bgElements.forEach(el => {
        el.style.transform = `translateY(${parallaxRate}px)`;
      });
    }
  });
}
