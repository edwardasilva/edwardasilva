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
    fixDropdownBehavior(); // Add this line to call the existing function
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
  
  // Course details with event delegation - FIX DROPDOWN ISSUE
  document.body.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    if (summary && summary.parentElement.tagName === 'DETAILS') {
      // Only load content for THIS specific dropdown if it's actually open
      // Add a small delay to check if it's actually open after the click
      setTimeout(() => {
        if (summary.parentElement.hasAttribute('open')) {
          const description = summary.parentElement.querySelector('.course-description[data-course]');
          if (description && !description.textContent.trim()) {
            loadCourseDescription(description);
          }
        }
      }, 10);
      
      // Stop event propagation to prevent multiple dropdowns from being affected
      event.stopPropagation();
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
  link.href = 'assets/resume/resume.pdf';
  link.download = 'Edward_Silva_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Theme toggle with smooth transition - optimized version
function initializeThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  // Cache DOM references and values
  const html = document.documentElement;
  const body = document.body;
  const themeTransitionClass = 'theme-transition';
  
  // Pre-compute theme values to avoid recalculation
  const themeValues = {
    dark: {
      icon: '☀️',
      bgRgb: '17, 24, 39'
    },
    light: {
      icon: '🌙',
      bgRgb: '255, 255, 255'
    }
  };
  
  // Combine operations for better performance
  const updateTheme = (newTheme) => {
    const values = themeValues[newTheme];
    
    // Apply all changes in one batch to reduce reflows
    requestAnimationFrame(() => {
      body.classList.add(themeTransitionClass);
      html.setAttribute('data-theme', newTheme);
      html.style.setProperty('--bg-rgb', values.bgRgb);
      toggle.innerHTML = values.icon;
      toggle.classList.add('rotating');
      
      // Store preference
      localStorage.setItem('theme', newTheme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        body.classList.remove(themeTransitionClass);
        toggle.classList.remove('rotating');
      }, 500);
    });
  };
  
  // Single event handler
  toggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
  });
  
  // Set initial icon based on current theme (runs only once)
  const currentTheme = html.getAttribute('data-theme');
  toggle.innerHTML = themeValues[currentTheme].icon;
  
  // Add rotation animation CSS only if needed (once)
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


/**
 * Utility functions for enhanced portfolio site functionality
 */

// Browser detection for targeted fixes
const browser = {
  isIE: !!document.documentMode,
  isEdge: !document.documentMode && !!window.StyleMedia,
  isChrome: !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  isFirefox: typeof InstallTrigger !== 'undefined',
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

// Performance monitoring with fallbacks
const perfMonitor = {
  marks: {},
  
  // Start timing an operation with fallback for older browsers
  start: function(label) {
    if (window.performance && window.performance.now) {
      this.marks[label] = performance.now();
    } else {
      this.marks[label] = Date.now(); // Fallback to Date.now
    }
  },
  
  // End timing and log result
  end: function(label) {
    if (this.marks[label]) {
      const now = (window.performance && window.performance.now) ? performance.now() : Date.now();
      const duration = now - this.marks[label];
      console.log(`⚡️ ${label}: ${duration.toFixed(2)}ms`);
      delete this.marks[label];
      return duration;
    }
    return null;
  }
};

// Feature detection helper
function supportsFeature(feature) {
  switch(feature) {
    case 'IntersectionObserver':
      return 'IntersectionObserver' in window;
    case 'PassiveEvents':
      let supportsPassive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: function() { supportsPassive = true; return true; }
        });
        window.addEventListener('testPassive', null, opts);
        window.removeEventListener('testPassive', null, opts);
      } catch (e) {}
      return supportsPassive;
    case 'CustomEvent':
      return typeof window.CustomEvent === "function";
    case 'Promises':
      return typeof Promise !== 'undefined';
    case 'LocalStorage':
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch(e) {
        return false;
      }
    default:
      return false;
  }
}

// Lazy load images with cross-browser support
function lazyLoadImages() {
  if (supportsFeature('IntersectionObserver')) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            // Create new image to preload and handle errors
            const tempImg = new Image();
            tempImg.onload = function() {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.add('fade-in');
            };
            tempImg.onerror = function() {
              // Fallback to placeholder or original src if available
              if (img.src) {
                console.warn('Failed to load image:', src);
              } else {
                img.src = 'assets/placeholder.jpg'; // Fallback image
              }
              img.removeAttribute('data-src');
            };
            tempImg.src = src;
          }
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // Apply to all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    const lazyLoad = function() {
      let lazyImages = document.querySelectorAll('img[data-src]');
      let scrollTop = window.pageYOffset;
      
      lazyImages.forEach(function(img) {
        if (img.offsetTop < window.innerHeight + scrollTop) {
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
        }
      });
      
      // If all images are loaded, stop listening
      if (lazyImages.length === 0) { 
        document.removeEventListener('scroll', lazyLoadThrottled);
        window.removeEventListener('resize', lazyLoadThrottled);
        window.removeEventListener('orientationchange', lazyLoadThrottled);
      }
    };
    
    // Throttled version for performance
    const lazyLoadThrottled = throttle(lazyLoad, 200);
    
    // Add event listeners with passive option when supported
    const passiveOption = supportsFeature('PassiveEvents') ? { passive: true } : false;
    document.addEventListener('scroll', lazyLoadThrottled, passiveOption);
    window.addEventListener('resize', lazyLoadThrottled, passiveOption);
    window.addEventListener('orientationchange', lazyLoadThrottled, passiveOption);
    
    // Initial load
    lazyLoad();
  }
}

// Preload critical images with error handling
function preloadCriticalImages(imageUrls) {
  if (!imageUrls || !imageUrls.length) return;
  
  imageUrls.forEach(url => {
    const img = new Image();
    img.onerror = function() {
      console.warn('Failed to preload image:', url);
    };
    img.src = url;
  });
}

// Save user preferences with try-catch
function savePreference(key, value) {
  if (!supportsFeature('LocalStorage')) {
    console.warn('LocalStorage not supported in this browser');
    return false;
  }
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('Could not save preference:', e);
    return false;
  }
}

// Get user preference with fallback
function getPreference(key, defaultValue) {
  if (!supportsFeature('LocalStorage')) {
    return defaultValue;
  }
  
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

// Debounce function to limit function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function implementation
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Copy text to clipboard with cross-browser support
function copyToClipboard(text) {
  // Use modern Clipboard API if available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(err => {
        console.error('Could not copy text with Clipboard API:', err);
        return fallbackCopyToClipboard(text);
      });
  } else {
    // Fallback for older browsers
    return Promise.resolve(fallbackCopyToClipboard(text));
  }
}

// Fallback copy method for browsers without clipboard API
function fallbackCopyToClipboard(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    
    // Check for iOS devices
    if (browser.isIOS) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.focus();
      textArea.select();
    }
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Could not copy text with fallback method:', err);
    return false;
  }
}

// Polyfill for CustomEvent for IE support
function polyfillCustomEvent() {
  if (!supportsFeature('CustomEvent')) {
    window.CustomEvent = function(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: null };
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }
}

// Ensure proper dropdown behavior - prevent all opening at once
function fixDropdownBehavior() {
  // Select all summary elements that are direct children of details elements
  const summaryElements = document.querySelectorAll('details > summary');
  
  summaryElements.forEach(summary => {
    summary.addEventListener('click', function(e) {
      // Stop propagation to parent elements to prevent triggering multiple dropdowns
      e.stopPropagation();
      
      // Close all other details at the same level if this is a nested dropdown
      const parentDetails = this.parentElement;
      const isNested = parentDetails.classList.contains('nested');
      
      // If this is a nested dropdown, close siblings when opening
      if (isNested) {
        const siblingDetails = parentDetails.parentElement.querySelectorAll('details.nested');
        siblingDetails.forEach(details => {
          if (details !== parentDetails && details.hasAttribute('open')) {
            details.removeAttribute('open');
          }
        });
      }
    });
  });
}

// Add these utilities to global scope
window.perfMonitor = perfMonitor;
window.lazyLoadImages = lazyLoadImages;
window.preloadCriticalImages = preloadCriticalImages;
window.savePreference = savePreference;
window.getPreference = getPreference;
window.debounce = debounce;
window.throttle = throttle;
window.copyToClipboard = copyToClipboard;
window.browser = browser;
window.supportsFeature = supportsFeature;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Apply polyfills
  polyfillCustomEvent();
  
  // Start performance monitoring
  perfMonitor.start('page-initialization');
  
  // Fix dropdown behavior to prevent all opening at once
  fixDropdownBehavior();
  
  // Add "copy email" functionality to email links with cross-browser handling
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', function(e) {
      // Don't prevent default - still allow email client to open
      const email = this.getAttribute('href').replace('mailto:', '');
      
      // Create copy button dynamically
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.className = 'copy-btn';
      copyBtn.style.position = 'absolute';
      copyBtn.style.fontSize = '12px';
      copyBtn.style.padding = '2px 8px';
      copyBtn.style.borderRadius = '4px';
      copyBtn.style.backgroundColor = 'var(--primary)';
      copyBtn.style.color = 'white';
      copyBtn.style.border = 'none';
      copyBtn.style.cursor = 'pointer';
      copyBtn.style.zIndex = '100';
      
      // Position near the link with proper calculations for all browsers
      const rect = this.getBoundingClientRect();
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      
      copyBtn.style.top = `${rect.bottom + scrollY + 5}px`;
      copyBtn.style.left = `${rect.left + scrollX}px`;
      
      // Add to document
      document.body.appendChild(copyBtn);
      
      // Handle click with proper promise handling
      copyBtn.addEventListener('click', function() {
        if (supportsFeature('Promises')) {
          copyToClipboard(email).then(success => {
            if (success) {
              this.textContent = 'Copied!';
              setTimeout(() => {
                if (document.body.contains(this)) {
                  document.body.removeChild(this);
                }
              }, 1500);
            } else {
              this.textContent = 'Failed!';
              setTimeout(() => {
                if (document.body.contains(this)) {
                  document.body.removeChild(this);
                }
              }, 1500);
            }
          });
        } else {
          // Fallback for browsers without Promise support
          const success = fallbackCopyToClipboard(email);
          if (success) {
            this.textContent = 'Copied!';
          } else {
            this.textContent = 'Failed!';
          }
          setTimeout(() => {
            if (document.body.contains(this)) {
              document.body.removeChild(this);
            }
          }, 1500);
        }
      });
      
      // Remove after 3 seconds if not clicked
      setTimeout(() => {
        if (document.body.contains(copyBtn)) {
          document.body.removeChild(copyBtn);
        }
      }, 3000);
    });
  });
  
  // Initialize lazy loading
  lazyLoadImages();
  
  // End performance monitoring
  perfMonitor.end('page-initialization');
});
