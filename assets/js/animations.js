// Modern smooth page transitions using GSAP
function initPageTransitions() {
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined') {
    console.log('GSAP not loaded yet, waiting...');
    setTimeout(initPageTransitions, 50);
    return;
  }

  console.log('✅ Initializing page transitions with GSAP');

  // Create page transition elements - slide-in effect
  const pageTransitionContainer = document.createElement('div');
  pageTransitionContainer.classList.add('page-transition-container');

  // Create slide element
  const slideElement = document.createElement('div');
  slideElement.classList.add('page-transition-slide');

  pageTransitionContainer.appendChild(slideElement);
  document.body.appendChild(pageTransitionContainer);

  console.log('✅ Page transition elements created');

  // Animation timeline for page load with smooth slide-up effect
  const pageLoadTimeline = gsap.timeline({
    onStart: () => {
      console.log('🎬 Page load animation started');
    },
    onComplete: () => {
      console.log('✅ Page load animation completed');
      // Hide container after animation
      gsap.set(pageTransitionContainer, { opacity: 0, visibility: 'hidden' });
    }
  });

  // Initial state - slide element ready to animate
  pageLoadTimeline
    .set(pageTransitionContainer, { opacity: 1, visibility: 'visible' })
    .set(slideElement, { y: '0%' })

    // Smooth slide up animation with modern easing - slower and more visible
    .to(slideElement, {
      y: '-100%',
      duration: 1.5,
      ease: 'power2.inOut',
    }, '+=0.5'); // Add 0.5s delay so you can see it

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Improved function for creating staggered animations with performance optimizations
  function createStaggerAnimation(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, just make elements visible without animation
    if (prefersReducedMotion) {
      gsap.set(elements, { y: 0, opacity: 1 });
      return;
    }

    const defaults = {
      y: 20, // Smaller movement for better performance
      opacity: 0,
      duration: 0.5, // Faster for better responsiveness
      stagger: 0.05, // Faster stagger
      ease: 'power1.out', // Simpler easing function
      scrollTrigger: {
        trigger: elements[0].parentElement,
        start: 'top 90%', // Start animations earlier
        toggleActions: 'play none none none'
      }
    };

    const settings = {...defaults, ...options};

    // Set initial state
    gsap.set(elements, { y: settings.y, opacity: 0 });

    // Create animation with improved performance settings
    return gsap.to(elements, {
      y: 0,
      opacity: 1,
      duration: settings.duration,
      stagger: settings.stagger,
      ease: settings.ease,
      scrollTrigger: settings.scrollTrigger,
      clearProps: 'all', // Clear all props after animation for better performance
      onComplete: function() {
        // Remove scroll triggers after animation completes
        if (this.scrollTrigger) {
          this.scrollTrigger.kill();
        }
      }
    });
  }

  // Apply animations to different elements with a shorter delay
  setTimeout(() => {
    // Animate headers with improved settings
    createStaggerAnimation('h1, h2, h3', {
      y: 40,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Animate skill cards with improved settings
    createStaggerAnimation('.skill-card', {
      y: 40,
      stagger: 0.06,
      scrollTrigger: {
        start: 'top 85%'
      }
    });

    // Animate buttons with improved settings
    createStaggerAnimation('.btn', {
      y: 15,
      stagger: 0.04,
      duration: 0.5
    });

    // Animate images with improved settings - exclude certificate slider images
    createStaggerAnimation('img:not(.logo-dark img, .logo-light img, .certificate-image, .swiper-slide img)', {
      y: 0,
      scale: 0.99, // Minimal scale for smoother animation
      opacity: 0,
      scrollTrigger: {
        start: 'top 85%'
      },
      duration: 0.6, // Faster animation
      ease: 'power2.out', // Smoother easing
      onComplete: function() {
        gsap.set(this.targets(), { clearProps: 'all' });
      }
    });

    // Banner content with improved settings
    createStaggerAnimation('.banner-title, .banner-subtitle, .banner-content, .banner-bullets li', {
      y: 25,
      stagger: 0.08,
      duration: 0.8
    });
  }, 50); // Reduced delay for faster initial animations

  // Modern smooth slide-in link click animation for internal links
  console.log('🔗 Setting up link click handlers');
  const links = document.querySelectorAll('a');
  console.log(`Found ${links.length} links`);

  links.forEach(link => {
    // Only handle internal links
    if (link.hostname === window.location.hostname && !link.hasAttribute('target')) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip anchor links and empty links
        if (!href || href.startsWith('#') || href === '') return;

        console.log(`🎬 Triggering page transition to: ${href}`);
        e.preventDefault();

        // Modern smooth slide-in transition for page exit
        const exitTimeline = gsap.timeline({
          onStart: () => {
            console.log('🎬 Page exit animation started');
          },
          onComplete: () => {
            console.log(`✅ Page exit animation completed, navigating to: ${href}`);
            window.location.href = href;
          }
        });

        exitTimeline
          .set(pageTransitionContainer, { opacity: 1, visibility: 'visible' })
          .set(slideElement, { y: '100%' })

          // Smooth slide in from bottom with modern easing - slower and more visible
          .to(slideElement, {
            y: '0%',
            duration: 1,
            ease: 'power2.inOut'
          });
      });
    }
  });

  // Theme toggle animation
  const themeToggle = document.querySelector('.theme-switcher');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      // Flash screen effect
      gsap.to('body', {
        backgroundColor: 'rgba(255,255,255,0.1)',
        duration: 0.1,
        onComplete: () => {
          gsap.to('body', {
            backgroundColor: 'transparent',
            duration: 0.3
          });
        }
      });
    });
  }

  // Fixed navbar scroll animation
  const header = document.querySelector('.header');
  if (header) {
    const headerHeight = header.offsetHeight;
    let lastScrollTop = 0;
    let ticking = false;

    // Make sure the header has the right styles
    header.style.width = '100%';
    header.style.zIndex = '1000';

    // Function to handle scroll events
    function handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Show header when scrolling up from anywhere on the page
      if (scrollTop < lastScrollTop) {
        // Scrolling up - always show header
        gsap.to(header, {
          y: 0,
          duration: 0.2,
          ease: "power2.out"
        });
      } else if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
        // Scrolling down and not at the top - hide header
        gsap.to(header, {
          y: -headerHeight,
          duration: 0.2,
          ease: "power2.in"
        });
      }

      // Always show header at the top of the page
      if (scrollTop <= 10) {
        gsap.to(header, {
          y: 0,
          duration: 0.1
        });
      }

      // Update last scroll position
      lastScrollTop = scrollTop;
      ticking = false;
    }

    // Scroll event handler with requestAnimationFrame
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }

    // Add scroll event listener with passive flag for better performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Also handle touch events for mobile
    window.addEventListener('touchmove', onScroll, { passive: true });
    window.addEventListener('touchend', onScroll, { passive: true });
  }
}

// Initialize page transitions when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageTransitions);
} else {
  initPageTransitions();
}