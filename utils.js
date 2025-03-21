/**
 * Utility functions for enhanced portfolio site functionality
 */

// Performance monitoring
const perfMonitor = {
  marks: {},
  
  // Start timing an operation
  start: function(label) {
    this.marks[label] = performance.now();
  },
  
  // End timing and log result
  end: function(label) {
    if (this.marks[label]) {
      const duration = performance.now() - this.marks[label];
      console.log(`⚡️ ${label}: ${duration.toFixed(2)}ms`);
      delete this.marks[label];
      return duration;
    }
    return null;
  }
};

// Lazy load images
function lazyLoadImages() {
  // Use Intersection Observer API to load images only when they enter viewport
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('fade-in');
          }
          
          observer.unobserve(img);
        }
      });
    });
    
    // Apply to all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}

// Preload critical images
function preloadCriticalImages(imageUrls) {
  if (!imageUrls || !imageUrls.length) return;
  
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// Save user preferences
function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn('Could not save preference:', e);
    return false;
  }
}

// Get user preference
function getPreference(key, defaultValue) {
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

// Copy text to clipboard
function copyToClipboard(text) {
  // Use modern Clipboard API if available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(err => {
        console.error('Could not copy text:', err);
        return false;
      });
  } else {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(success);
    } catch (err) {
      console.error('Could not copy text:', err);
      return Promise.resolve(false);
    }
  }
}

// Function to ensure all scrollbars are removed
function removeAllScrollbars() {
  // Apply to both document and all scrollable elements
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    *::-webkit-scrollbar,
    *::-webkit-scrollbar-thumb,
    *::-webkit-scrollbar-track,
    *::-webkit-scrollbar-button,
    *::-webkit-scrollbar-corner,
    *::-webkit-resizer {
      width: 0 !important;
      height: 0 !important;
      display: none !important;
      background: transparent !important;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Apply to all elements that might have scrollbars
  const scrollableElements = document.querySelectorAll('div, pre, textarea, code, nav, section, article');
  scrollableElements.forEach(el => {
    if (getComputedStyle(el).overflow === 'auto' || 
        getComputedStyle(el).overflow === 'scroll' ||
        getComputedStyle(el).overflowX === 'auto' || 
        getComputedStyle(el).overflowX === 'scroll' ||
        getComputedStyle(el).overflowY === 'auto' || 
        getComputedStyle(el).overflowY === 'scroll') {
      el.style.scrollbarWidth = 'none';
      el.style.msOverflowStyle = 'none';
    }
  });
}

// Add these utilities to global scope
window.perfMonitor = perfMonitor;
window.lazyLoadImages = lazyLoadImages;
window.preloadCriticalImages = preloadCriticalImages;
window.savePreference = savePreference;
window.getPreference = getPreference;
window.debounce = debounce;
window.copyToClipboard = copyToClipboard;
window.removeAllScrollbars = removeAllScrollbars;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Start performance monitoring
  perfMonitor.start('page-initialization');
  
  // Add "copy email" functionality to email links
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
      
      // Position near the link
      const rect = this.getBoundingClientRect();
      copyBtn.style.top = `${rect.bottom + window.scrollY + 5}px`;
      copyBtn.style.left = `${rect.left + window.scrollX}px`;
      
      // Add to document
      document.body.appendChild(copyBtn);
      
      // Handle click
      copyBtn.addEventListener('click', function() {
        copyToClipboard(email).then(success => {
          if (success) {
            this.textContent = 'Copied!';
            setTimeout(() => {
              document.body.removeChild(this);
            }, 1500);
          }
        });
      });
      
      // Remove after 3 seconds if not clicked
      setTimeout(() => {
        if (document.body.contains(copyBtn)) {
          document.body.removeChild(copyBtn);
        }
      }, 3000);
    });
  });
  
  // Remove all scrollbars
  removeAllScrollbars();
  
  // Re-apply after any dynamic content is loaded
  const observer = new MutationObserver(removeAllScrollbars);
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  // End performance monitoring
  setTimeout(() => {
    perfMonitor.end('page-initialization');
  }, 0);
});
