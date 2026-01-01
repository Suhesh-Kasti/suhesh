// Main JS - Multiple Skills Sliders with Smooth Animations
(function () {
  "use strict";

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  function initAll() {
    if (typeof Swiper !== 'undefined') {
      initializeSliders();
    }
    initializeAccordions();
  }

  function initializeSliders() {
    // Hero Slider
    const heroSlider = document.querySelector(".hero-slider");
    if (heroSlider) {
      new Swiper(heroSlider, {
        speed: 1000,
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        navigation: {
          nextEl: ".hero-slider-next",
          prevEl: ".hero-slider-prev",
        },
        pagination: {
          el: ".hero-slider-pagination",
          clickable: true,
        }
      });
    }

    // Skills Sliders - Initialize ALL of them (multiple categories)
    const skillsSliders = document.querySelectorAll(".skills-slider");
    skillsSliders.forEach((slider, index) => {
      new Swiper(slider, {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        speed: 600, // Smooth transition
        loop: true,
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: false,
        },
        navigation: {
          nextEl: slider.querySelector(".swiper-button-next"),
          prevEl: slider.querySelector(".swiper-button-prev"),
        },
        pagination: {
          el: slider.querySelector(".skills-slider-pagination"),
          clickable: true,
        },
        breakpoints: {
          640: {
            coverflowEffect: {
              depth: 250,
            }
          },
          1024: {
            coverflowEffect: {
              depth: 300,
            }
          }
        }
      });
    });

    console.log(`✅ Initialized ${skillsSliders.length} skills slider(s)`);

    // Testimonial Slider
    const testimonialSlider = document.querySelector(".testimonial-slider");
    if (testimonialSlider) {
      new Swiper(testimonialSlider, {
        speed: 600, // Smooth
        spaceBetween: 30,
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: false },
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        },
        pagination: {
          el: ".testimonial-slider-pagination",
          clickable: true,
        }
      });
    }
  }

  function initializeAccordions() {
    const accordionContainers = document.querySelectorAll('.accordion, [data-accordion]');

    if (!accordionContainers.length) return;

    accordionContainers.forEach(container => {
      const items = container.querySelectorAll('.accordion-item, [data-accordion-item]');

      items.forEach(item => {
        const header = item.querySelector('.accordion-header, .accordion-title, [data-accordion-trigger]');
        const content = item.querySelector('.accordion-content, .accordion-body, [data-accordion-content]');

        if (!header || !content) return;

        if (!item.classList.contains('active')) {
          content.style.maxHeight = '0px';
          content.style.overflow = 'hidden';
          content.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          content.style.overflow = 'hidden';
          content.style.transition = 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }

        header.addEventListener('click', function (e) {
          e.preventDefault();
          const isActive = item.classList.contains('active');

          if (isActive) {
            item.classList.remove('active');
            content.style.maxHeight = '0px';
          } else {
            item.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });

        window.addEventListener('resize', () => {
          if (item.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });
      });
    });

    if (accordionContainers.length) {
      console.log(`✅ Initialized ${accordionContainers.length} accordion(s)`);
    }
  }
})();
