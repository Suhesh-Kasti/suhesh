// Modern, Performant, "Alive" Animations
function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initAnimations, 100);
    return;
  }

  console.log('✅ Initializing Smooth & Clean Animations');
  gsap.registerPlugin(ScrollTrigger);

  // --------------------------------------------------------------------------
  // 1. Robust Page Transition (Curtain Slide Up)
  // --------------------------------------------------------------------------
  let curtain = document.querySelector('.page-transition-curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.className = 'page-transition-curtain';
    document.body.appendChild(curtain);

    const style = document.createElement('style');
    style.textContent = `
      .page-transition-curtain {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%; 
        background-color: #000000;
        z-index: 999999;
        pointer-events: none;
        will-change: transform;
        transform: translateY(0%);
      }
      body:not(.dark) .page-transition-curtain {
        background-color: #000000;
      }
    `;
    document.head.appendChild(style);
  }

  // ENTER: Page Loaded -> Reveal Content
  gsap.set(curtain, { transform: "translateY(0%)", display: "block" });

  const enterTl = gsap.timeline({
    delay: 0.1,
    onComplete: () => {
      gsap.set(curtain, { transform: "translateY(100%)", display: "none" }); // HIDE COMPLETELY to fix black bar issue
    }
  });

  enterTl.to(curtain, {
    transform: "translateY(-100%)",
    duration: 1.0,
    ease: "power3.inOut"
  });

  // EXIT: Link Click -> Cover Content
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    if (link.hostname === window.location.hostname &&
      !link.hash &&
      link.target !== '_blank' &&
      !link.dataset.noTransition) {

      link.addEventListener('click', e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const targetUrl = link.href;

        // Reset to bottom and MAKE VISIBLE
        gsap.set(curtain, { transform: "translateY(100%)", display: "block", pointerEvents: "all" });

        gsap.to(curtain, {
          transform: "translateY(0%)",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            window.location.href = targetUrl;
          }
        });
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}