// Client-side JavaScript functions for the personal website
// This file contains all the interactive functionality for the website

// Utility functions
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

// Polyfill for CustomEvent
function polyfillCustomEvent() {
  if (typeof window.CustomEvent === 'function') return false;
  
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}

// Copy to clipboard functionality
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    return fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    textArea.remove();
    return Promise.resolve();
  } catch (err) {
    textArea.remove();
    return Promise.reject(err);
  }
}

// Animation and scroll effects
function setupAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

function revealOnScroll() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add('active');
    }
  });
}

// Navigation enhancement
function enhanceNavigation() {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');
  
  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === '#' + current) {
        item.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', throttle(updateActiveNav, 100));
  updateActiveNav();
}

function handleNavClick(e) {
  if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerHeight = document.querySelector('nav').offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
}

// Theme toggle functionality
function initializeThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}



// Navigation visibility control
function initializeNavigationVisibility() {
  const navigation = document.querySelector('.navigation');
  if (!navigation) return;

  let lastScrollTop = 0;
  const heroSection = document.querySelector('.hero');
  const heroHeight = heroSection ? heroSection.offsetHeight : 0;

  window.addEventListener('scroll', throttle(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show navigation when scrolling down past hero section
    if (scrollTop > heroHeight) {
      navigation.classList.add('visible');
    } else {
      navigation.classList.remove('visible');
    }
    
    lastScrollTop = scrollTop;
  }, 100));
}

// Content population functions
function populateAllCourseDescriptions() {
  if (typeof courseCategories === 'undefined') return;
  
  courseCategories.forEach(category => {
    category.courses.forEach(course => {
      const courseElement = document.querySelector(`[data-course="${course.name}"]`);
      if (courseElement && course.description) {
        courseElement.setAttribute('title', course.description);
      }
    });
  });
}

function populateCertificationContent() {
  const certificationElements = document.querySelectorAll('.certification');
  certificationElements.forEach(element => {
    const certName = element.getAttribute('data-certification');
    if (certName && typeof infoContent !== 'undefined' && infoContent.certifications) {
      const cert = infoContent.certifications.find(c => c.name === certName);
      if (cert && cert.description) {
        element.setAttribute('title', cert.description);
      }
    }
  });
}

function enhanceSkillTags() {
  const skillTags = document.querySelectorAll('.skill-tag');
  skillTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const skillName = tag.textContent.trim();
      copyToClipboard(skillName);
      
      // Visual feedback
      const originalText = tag.textContent;
      tag.textContent = 'Copied!';
      tag.style.backgroundColor = 'var(--accent)';
      
      setTimeout(() => {
        tag.textContent = originalText;
        tag.style.backgroundColor = '';
      }, 1000);
    });
  });
}

// Dropdown behavior fix
function fixDropdownBehavior() {
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const content = dropdown.querySelector('.dropdown-content');
    
    if (trigger && content) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        content.classList.toggle('show');
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
      document.querySelectorAll('.dropdown-content.show').forEach(content => {
        content.classList.remove('show');
      });
    }
  });
}

// Utility event listeners
function initializeUtilityEventListeners() {
  // Smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('nav')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Lazy loading for images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Scrollbar fade effect
function initScrollbarFadeEffect() {
  let scrollTimeout;
  
  document.addEventListener('scroll', () => {
    document.body.classList.add('scrolling');
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
      document.body.classList.remove('scrolling');
    }, 1000);
  });
}

// Main initialization function
function initializeEventListeners() {
  // Initialize all functionality
  polyfillCustomEvent();
  setupAnimations();
  enhanceNavigation();
  initializeThemeToggle();
  initializeNavigationVisibility();
  populateAllCourseDescriptions();
  populateCertificationContent();
  enhanceSkillTags();
  fixDropdownBehavior();
  initializeUtilityEventListeners();
  initScrollbarFadeEffect();
  
  // Add navigation click handler
  document.querySelector('nav')?.addEventListener('click', handleNavClick);
  
  // Initial scroll reveal
  revealOnScroll();
  window.addEventListener('scroll', throttle(revealOnScroll, 100));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
  initializeEventListeners();
}
