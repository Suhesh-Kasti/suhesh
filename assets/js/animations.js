// Page transitions and animations using GSAP
document.addEventListener('DOMContentLoaded', function() {
  // Create page transition element
  const pageTransition = document.createElement('div');
  pageTransition.classList.add('page-transition');
  document.body.appendChild(pageTransition);

  // Animation timeline for page load
  const pageLoadTimeline = gsap.timeline();

  pageLoadTimeline
    .set(pageTransition, { y: '0%' })
    .to(pageTransition, {
      y: '-100%',
      duration: 0.8,
      ease: 'power3.inOut',
      delay: 0.2
    });

  // Create staggered animations for elements
  gsap.registerPlugin(ScrollTrigger);

  // Function to create staggered animation for elements
  function createStaggerAnimation(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const defaults = {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: elements[0].parentElement,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    };

    const settings = {...defaults, ...options};

    // Set initial state
    gsap.set(elements, { y: settings.y, opacity: 0 });

    // Create animation
    gsap.to(elements, {
      y: 0,
      opacity: 1,
      duration: settings.duration,
      stagger: settings.stagger,
      ease: settings.ease,
      scrollTrigger: settings.scrollTrigger
    });
  }

  // Apply animations to different elements
  setTimeout(() => {
    // Animate headers
    createStaggerAnimation('h1, h2, h3', { y: 50 });

    // Animate skill cards
    createStaggerAnimation('.skill-card', {
      y: 50,
      stagger: 0.08,
      scrollTrigger: {
        start: 'top 85%'
      }
    });

    // Animate buttons
    createStaggerAnimation('.btn', { y: 20, stagger: 0.05 });

    // Animate images
    createStaggerAnimation('img:not(.logo-dark img, .logo-light img)', {
      y: 0,
      scale: 0.95,
      opacity: 0,
      scrollTrigger: {
        start: 'top 85%'
      },
      onComplete: function() {
        gsap.set(this.targets(), { scale: 1 });
      }
    });

    // Banner content
    createStaggerAnimation('.banner-title, .banner-subtitle, .banner-content, .banner-bullets li', {
      y: 30,
      stagger: 0.1,
      duration: 1
    });
  }, 100);

  // Link click animation for internal links
  document.querySelectorAll('a').forEach(link => {
    // Only handle internal links
    if (link.hostname === window.location.hostname && !link.hasAttribute('target')) {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip anchor links
        if (href.startsWith('#')) return;

        e.preventDefault();

        // Page exit animation
        gsap.to(pageTransition, {
          y: '0%',
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => {
            window.location.href = href;
          }
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

  // Navbar scroll animation - fixed version
  const header = document.querySelector('.header');
  if (header) {
    const headerHeight = header.offsetHeight;
    let lastScrollTop = 0;

    // We don't need a placeholder since the header is already sticky
    // Just make sure the header has the right styles
    header.style.width = '100%';
    header.style.zIndex = '1000';

    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > headerHeight) {
        if (scrollTop > lastScrollTop + 10) {
          // Scrolling down - hide header (faster animation)
          gsap.to(header, {
            y: -headerHeight,
            duration: 0.15,
            ease: "power2.inOut"
          });
        } else if (scrollTop < lastScrollTop - 10) {
          // Scrolling up - show header (faster animation)
          gsap.to(header, {
            y: 0,
            duration: 0.15,
            ease: "power2.inOut"
          });
        }
      } else {
        // At the top - reset header
        gsap.to(header, {
          y: 0,
          duration: 0.1
        });
      }

      lastScrollTop = scrollTop;
    }, { passive: true });
  }
});