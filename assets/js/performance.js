// Performance optimizations
(function() {
  'use strict';

  // Optimize images with Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
      threshold: 0.01
    });

    // Observe all images with data-src attribute
    document.addEventListener('DOMContentLoaded', () => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    });
  }

  // Reduce layout shifts by setting image dimensions
  document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      // Add loading attribute if not present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding attribute for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  });

  // Optimize font loading
  if ('fonts' in document) {
    // Preload critical fonts
    const criticalFonts = [
      { family: 'Poppins', weight: '400' },
      { family: 'Poppins', weight: '600' },
      { family: 'Fraunces', weight: '400' }
    ];

    criticalFonts.forEach(font => {
      document.fonts.load(`${font.weight} 16px ${font.family}`).catch(() => {
        // Silently fail if font loading fails
      });
    });
  }

  // Debounce scroll events for better performance
  let scrollTimeout;
  let lastScrollY = window.scrollY;
  
  function optimizedScroll() {
    const currentScrollY = window.scrollY;
    
    // Only process if scroll position changed significantly
    if (Math.abs(currentScrollY - lastScrollY) > 5) {
      lastScrollY = currentScrollY;
      
      // Dispatch custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('optimizedScroll', {
        detail: { scrollY: currentScrollY }
      }));
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(() => {
        optimizedScroll();
        scrollTimeout = null;
      }, 100);
    }
  }, { passive: true });

  // Optimize resize events
  let resizeTimeout;
  window.addEventListener('resize', () => {
    if (!resizeTimeout) {
      resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('optimizedResize'));
        resizeTimeout = null;
      }, 150);
    }
  }, { passive: true });

  // Prefetch links on hover for faster navigation
  if ('IntersectionObserver' in window) {
    const linkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          
          // Add hover listener to prefetch
          link.addEventListener('mouseenter', function prefetchLink() {
            const href = this.getAttribute('href');
            
            // Only prefetch internal links
            if (href && href.startsWith('/') && !href.startsWith('//')) {
              const linkElement = document.createElement('link');
              linkElement.rel = 'prefetch';
              linkElement.href = href;
              document.head.appendChild(linkElement);
            }
            
            // Remove listener after first hover
            link.removeEventListener('mouseenter', prefetchLink);
          }, { once: true });
          
          linkObserver.unobserve(link);
        }
      });
    }, {
      rootMargin: '100px'
    });

    document.addEventListener('DOMContentLoaded', () => {
      const links = document.querySelectorAll('a[href^="/"]');
      links.forEach(link => linkObserver.observe(link));
    });
  }

  // Reduce animation jank by using requestAnimationFrame
  window.requestIdleCallback = window.requestIdleCallback || function(cb) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1);
  };

  // Optimize third-party scripts loading
  document.addEventListener('DOMContentLoaded', () => {
    // Defer non-critical scripts
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        // Load analytics and other non-critical scripts here
      });
    }
  });

  // Add performance marks for debugging
  if (window.performance && window.performance.mark) {
    window.addEventListener('load', () => {
      performance.mark('page-fully-loaded');
      
      // Log performance metrics in development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('Performance Metrics:', {
            'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
            'Page Load Time': Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
            'Total Time': Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
          });
        }
      }
    });
  }

  // Optimize CSS animations by pausing when not visible
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        } else {
          entry.target.style.animationPlayState = 'paused';
        }
      });
    }, {
      threshold: 0.1
    });

    document.addEventListener('DOMContentLoaded', () => {
      const animatedElements = document.querySelectorAll('[class*="animate-"]');
      animatedElements.forEach(el => animationObserver.observe(el));
    });
  }

  // Prevent layout shifts from web fonts
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');
    });
  }

})();

