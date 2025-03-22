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

// Function to ensure all scrollbars are removed with browser-specific handling
function removeAllScrollbars() {
  // Create style element if it doesn't exist
  let styleElement = document.getElementById('no-scrollbar-style');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'no-scrollbar-style';
    document.head.appendChild(styleElement);
  }
  
  // Different CSS for different browsers
  let cssText = `
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
  
  // Special handling for IE
  if (browser.isIE) {
    cssText += `
      * { -ms-overflow-style: none !important; }
    `;
  }
  
  // Special handling for Firefox
  if (browser.isFirefox) {
    cssText += `
      * { scrollbar-width: none !important; }
    `;
  }
  
  styleElement.textContent = cssText;
  
  // Apply to all elements that might have scrollbars
  const scrollableElements = document.querySelectorAll('div, pre, textarea, code, nav, section, article');
  scrollableElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.overflow === 'auto' || 
        style.overflow === 'scroll' ||
        style.overflowX === 'auto' || 
        style.overflowX === 'scroll' ||
        style.overflowY === 'auto' || 
        style.overflowY === 'scroll') {
      el.style.scrollbarWidth = 'none';
      el.style.msOverflowStyle = 'none';
    }
  });
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

// Add these utilities to global scope
window.perfMonitor = perfMonitor;
window.lazyLoadImages = lazyLoadImages;
window.preloadCriticalImages = preloadCriticalImages;
window.savePreference = savePreference;
window.getPreference = getPreference;
window.debounce = debounce;
window.throttle = throttle;
window.copyToClipboard = copyToClipboard;
window.removeAllScrollbars = removeAllScrollbars;
window.browser = browser;
window.supportsFeature = supportsFeature;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Apply polyfills
  polyfillCustomEvent();
  
  // Start performance monitoring
  perfMonitor.start('page-initialization');
  
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
  
  // Remove all scrollbars with browser-specific handling
  removeAllScrollbars();
  
  // Re-apply after any dynamic content is loaded - use MutationObserver if supported
  if (window.MutationObserver) {
    const observer = new MutationObserver(throttle(removeAllScrollbars, 100));
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  } else {
    // Fallback for older browsers - periodic checking
    setInterval(removeAllScrollbars, 2000);
  }
  
  // Initialize lazy loading after short delay
  setTimeout(() => {
    lazyLoadImages();
  }, 100);
  
  // End performance monitoring
  setTimeout(() => {
    perfMonitor.end('page-initialization');
  }, 0);
});
