// Modern, Performant, "Alive" Animations
function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initAnimations, 100);
    return;
  }


  gsap.registerPlugin(ScrollTrigger);

  // --------------------------------------------------------------------------
  // 1. Smooth Page Transition (Fade Out on Exit)
  // --------------------------------------------------------------------------
  // ENTER: Fade in the document body immediately
  gsap.fromTo(document.body, {opacity: 0}, {opacity: 1, duration: 0.8, ease: "power2.out"});

  // EXIT: Link Click -> Fade Out Page -> Navigate
  document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    if (link.hostname === window.location.hostname &&
      !link.hash &&
      link.target !== '_blank' &&
      !link.dataset.noTransition) {

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      const targetUrl = link.href;

      // Disable pointer events during transition
      document.body.style.pointerEvents = "none";

      // Animate body out smoothly, then navigate
      gsap.to(document.body, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          window.location.href = targetUrl;
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 2. Alive Content Animations
  // --------------------------------------------------------------------------
  const animateTypes = [
    { selector: 'h1, h2, h3', y: 30 },
    { selector: 'p', y: 20 },
    { selector: '.btn', y: 15 },
    { selector: '.skill-card', y: 30 },
    { selector: 'img', y: 20 },
    { selector: '.feature-section', y: 40 }
  ];

  animateTypes.forEach(type => {
    const elements = document.querySelectorAll(type.selector);
    if (!elements.length) return;

    gsap.set(elements, { opacity: 0, y: type.y });

    ScrollTrigger.batch(elements, {
      start: "top 90%",
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        overwrite: true
      })
    });
  });

  // --------------------------------------------------------------------------
  // 3. Simple Micro-Interactions
  // --------------------------------------------------------------------------
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -5, duration: 0.3, ease: "power2.out" });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
    });
  });

  // Failsafe
  setTimeout(() => {
    gsap.to('h1, h2, h3, p, img, .btn', { opacity: 1, y: 0, duration: 0.5, clearProps: "all" });
  }, 2000);

  // Header Scroll
  const header = document.querySelector('.header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const current = window.pageYOffset;
      if (current > 50) header.classList.add('header-scrolled');
      else header.classList.remove('header-scrolled');

      if (current > lastScroll && current > 200) {
        gsap.to(header, { y: -100, duration: 0.3 });
      } else {
        gsap.to(header, { y: 0, duration: 0.3 });
      }
      lastScroll = current;
    }, { passive: true });
  }

  // Restore document body upon hitting the "Back" button (bfcache page-restore feature)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      gsap.set(document.body, {opacity: 1, y: 0, clearProps: "all"});
      document.body.style.pointerEvents = "auto";
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}