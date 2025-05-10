// main script
(function () {
  "use strict";

  // Defer non-critical operations
  document.addEventListener("DOMContentLoaded", function() {
    // Clickable checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length) {
      checkboxes.forEach(checkbox => {
        // remove the disabled attribute; added by kramdown by default
        checkbox.removeAttribute('disabled');
      });
    }

    // Initialize modern interactive hero slider
    const heroSliderElement = document.querySelector(".hero-slider");
    if (heroSliderElement) {
      // Create custom pagination
      const paginationContainer = document.querySelector('.hero-slider-pagination');
      if (paginationContainer) {
        const slides = heroSliderElement.querySelectorAll('.swiper-slide');
        slides.forEach((_, index) => {
          const bullet = document.createElement('span');
          bullet.classList.add('pagination-bullet');
          bullet.style.width = '8px';
          bullet.style.height = '8px';
          bullet.style.display = 'block';
          bullet.style.borderRadius = '50%';
          bullet.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
          bullet.style.margin = '0 4px';
          bullet.style.cursor = 'pointer';
          bullet.style.transition = 'all 0.3s ease';
          paginationContainer.appendChild(bullet);
        });
      }

      // Initialize Swiper with creative effects
      const heroSlider = new Swiper(".hero-slider", {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        effect: "creative",
        creativeEffect: {
          prev: {
            shadow: true,
            translate: ["-20%", 0, -1],
            opacity: 0
          },
          next: {
            shadow: true,
            translate: ["100%", 0, 0],
            opacity: 0
          },
        },
        speed: 1200,
        autoplay: {
          delay: 6000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: ".hero-slider-next",
          prevEl: ".hero-slider-prev",
        },
        pagination: {
          el: ".hero-slider-pagination",
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className}" style="width: 8px; height: 8px; background-color: rgba(255, 255, 255, 0.5); transition: all 0.3s ease;"></span>`;
          },
        },
        on: {
          init: function() {
            updateHeroProgress(this);
            updateHeroSlides(this);
          },
          slideChange: function() {
            updateHeroProgress(this);
            updateHeroSlides(this);
          },
          autoplayTimeLeft: function(s, time, progress) {
            const progressBar = document.querySelector('.hero-slider-progress');
            if (progressBar) {
              progressBar.style.width = `${(1 - progress) * 100}%`;
            }
          },
          resize: function() {
            this.update();
          }
        }
      });

      // Helper function to update progress bar
      function updateHeroProgress(swiper) {
        const progressBar = document.querySelector('.hero-slider-progress');
        if (progressBar) {
          progressBar.style.width = '100%';
          setTimeout(() => {
            progressBar.style.transition = 'width 6s cubic-bezier(0.4, 0, 0.2, 1)';
            progressBar.style.width = '0%';
          }, 50);
        }
      }

      // Helper function to enhance slide transitions
      function updateHeroSlides(swiper) {
        const slides = swiper.slides;
        const activeIndex = swiper.activeIndex;

        slides.forEach((slide, index) => {
          // Reset all slides
          slide.style.transition = 'all 0.5s ease';

          // Add special effects to active slide
          if (index === activeIndex) {
            const caption = slide.querySelector('.text-white');
            if (caption) {
              caption.style.opacity = '0';
              caption.style.transform = 'translateY(20px)';

              // Animate caption with delay
              setTimeout(() => {
                caption.style.transition = 'all 0.8s ease 0.3s';
                caption.style.opacity = '1';
                caption.style.transform = 'translateY(0)';
              }, 300);
            }
          }
        });
      }

      // Interactive hover effects
      heroSliderElement.addEventListener("mouseenter", function() {
        heroSlider.autoplay.stop();
        document.querySelector('.hero-slider-progress').style.transition = 'none';

        // Show navigation controls with fade-in
        const navButtons = heroSliderElement.querySelectorAll('.hero-slider-prev, .hero-slider-next');
        navButtons.forEach(btn => {
          btn.style.opacity = '1';
          btn.style.transform = 'scale(1.1)';
        });
      }, { passive: true });

      heroSliderElement.addEventListener("mouseleave", function() {
        heroSlider.autoplay.start();
        updateHeroProgress(heroSlider);

        // Hide navigation controls with fade-out
        const navButtons = heroSliderElement.querySelectorAll('.hero-slider-prev, .hero-slider-next');
        navButtons.forEach(btn => {
          btn.style.opacity = '0.8';
          btn.style.transform = 'scale(1)';
        });
      }, { passive: true });

      // Touch events for mobile
      heroSliderElement.addEventListener("touchstart", function() {
        heroSlider.autoplay.stop();
      }, { passive: true });

      heroSliderElement.addEventListener("touchend", function() {
        heroSlider.autoplay.start();
        updateHeroProgress(heroSlider);
      }, { passive: true });
    }

    // Dropdown Menu Toggler For Mobile
    // ----------------------------------------
    const dropdownMenuToggler = document.querySelectorAll(
      ".nav-dropdown > .nav-link",
    );

    if (dropdownMenuToggler.length) {
      dropdownMenuToggler.forEach((toggler) => {
        toggler.addEventListener("click", function(e) {
          e.preventDefault(); // Prevent default action
          e.stopPropagation(); // Stop event bubbling

          // Close other open dropdowns
          dropdownMenuToggler.forEach(otherToggler => {
            if (otherToggler !== toggler) {
              otherToggler.parentElement.classList.remove("active");
            }
          });

          // Toggle the clicked dropdown
          this.parentElement.classList.toggle("active");
        });
      });

      // Close dropdowns when clicking outside
      document.addEventListener("click", function(e) {
        const isDropdown = e.target.closest(".nav-dropdown");
        if (!isDropdown) {
          document.querySelectorAll(".nav-dropdown").forEach(dropdown => {
            dropdown.classList.remove("active");
          });
        }
      });
    }

    // Enhanced Accordion functionality with performance optimizations
    initializeAccordions();

    // Initialize Skills Sliders
    initializeSkillsSliders();

    // Testimonial Slider with performance optimizations
    initializeTestimonialSlider();
  });

  function initializeAccordions() {
    const accordions = document.querySelectorAll(".accordion");
    if (!accordions.length) return;

    function initializeAccordion(accordion) {
      const items = accordion.querySelectorAll(".accordion-item");
      const headers = accordion.querySelectorAll(".accordion-header");

      // Set initial ARIA attributes
      headers.forEach((header, index) => {
        const content = header.nextElementSibling;
        const headerId = `accordion-header-${index}`;
        const contentId = `accordion-content-${index}`;

        header.setAttribute("id", headerId);
        header.setAttribute("aria-controls", contentId);
        header.setAttribute("aria-expanded", "false");
        header.setAttribute("role", "button");
        header.setAttribute("tabindex", "0");

        content.setAttribute("id", contentId);
        content.setAttribute("role", "region");
        content.setAttribute("aria-labelledby", headerId);
      });

      // Handle click and keyboard events with debounced functions
      headers.forEach((header) => {
        const content = header.nextElementSibling;

        const handleClick = (event) => {
          event.preventDefault();
          toggleAccordion(header, content, items);
        };

        const handleKeydown = (event) => {
          if (["Enter", " "].includes(event.key)) {
            event.preventDefault();
            toggleAccordion(header, content, items);
          }
        };

        header.addEventListener("click", handleClick);
        header.addEventListener("keydown", handleKeydown);
      });
    }

    function toggleAccordion(header, content, items) {
      const parent = header.parentElement;
      const isExpanded = header.getAttribute("aria-expanded") === "true";

      // Toggle current accordion
      header.setAttribute("aria-expanded", !isExpanded);
      parent.classList.toggle("active");

      if (!isExpanded) {
        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
          content.style.maxHeight = `${content.scrollHeight}px`;
          content.classList.add("active");
        });
      } else {
        content.style.maxHeight = "0px";
        content.classList.remove("active");
      }

      // Close other open accordions
      items.forEach((item) => {
        if (item !== parent && item.classList.contains("active")) {
          const siblingHeader = item.querySelector(".accordion-header");
          const siblingContent = item.querySelector(".accordion-content");

          siblingHeader.setAttribute("aria-expanded", "false");
          item.classList.remove("active");
          siblingContent.style.maxHeight = "0px";
          siblingContent.classList.remove("active");
        }
      });
    }

    // Initialize all accordions
    accordions.forEach(initializeAccordion);

    // Optional: Open first item in each accordion
    accordions.forEach((accordion) => {
      const firstItem = accordion.querySelector(".accordion-item");
      if (firstItem) {
        const header = firstItem.querySelector(".accordion-header");
        const content = firstItem.querySelector(".accordion-content");

        firstItem.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        content.classList.add("active");
        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
          content.style.maxHeight = `${content.scrollHeight}px`;
        });
      }
    });
  }

  function initializeSkillsSliders() {
    const skillsSliders = document.querySelectorAll(".skills-slider");
    if (!skillsSliders.length) return;

    skillsSliders.forEach((slider, index) => {
      const skillsSwiper = new Swiper(slider, {
        slidesPerView: "auto",
        spaceBetween: 30,
        loop: true,
        centeredSlides: true,
        effect: "coverflow",
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        },
        speed: 800,
        autoplay: {
          delay: 4000,
          disableOnInteraction: false,
        },
        pagination: {
          el: slider.parentNode.querySelector(".skills-slider-pagination"),
          clickable: true,
        },
        navigation: {
          nextEl: slider.parentNode.querySelector(".swiper-button-next"),
          prevEl: slider.parentNode.querySelector(".swiper-button-prev"),
        },
        breakpoints: {
          320: {
            slidesPerView: 1.2,
            spaceBetween: 20,
          },
          640: {
            slidesPerView: 1.5,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2.2,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
        },
        on: {
          init: function() {
            updateActiveSlide(this);
          },
          slideChange: function() {
            updateActiveSlide(this);
          },
          resize: function() {
            this.update();
          }
        }
      });

      // Enhanced animation for active slide
      function updateActiveSlide(swiper) {
        const slides = swiper.slides;
        const activeIndex = swiper.activeIndex;

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const isActive = i === activeIndex;
          const isPrev = i === getPrevIndex(activeIndex, slides.length);
          const isNext = i === getNextIndex(activeIndex, slides.length);

          // Apply different animations based on slide position
          if (isActive) {
            slide.style.transition = "all 0.8s ease";
          } else {
            slide.style.transition = "all 0.5s ease";
          }
        }
      }

      // Helper functions to get prev/next indices even in loop mode
      function getPrevIndex(current, total) {
        return (current - 1 + total) % total;
      }

      function getNextIndex(current, total) {
        return (current + 1) % total;
      }

      // Pause autoplay on hover for better UX
      slider.addEventListener("mouseenter", function() {
        skillsSwiper.autoplay.stop();
      }, { passive: true });

      slider.addEventListener("mouseleave", function() {
        skillsSwiper.autoplay.start();
      }, { passive: true });

      // Touch events for mobile
      slider.addEventListener("touchstart", function() {
        skillsSwiper.autoplay.stop();
      }, { passive: true });

      slider.addEventListener("touchend", function() {
        skillsSwiper.autoplay.start();
      }, { passive: true });

      // Handle window resize for responsiveness
      window.addEventListener('resize', function() {
        skillsSwiper.update();
      }, { passive: true });
    });
  }

  function initializeTestimonialSlider() {
    const testimonialSliderElement = document.querySelector(".testimonial-slider");
    if (!testimonialSliderElement) return;

    const testimonialSwiper = new Swiper(".testimonial-slider", {
      spaceBetween: 24,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".testimonial-slider-pagination",
        type: "bullets",
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        },
      },
    });

    // Use passive event listeners for better performance
    testimonialSliderElement.addEventListener("mouseenter", function () {
      testimonialSwiper.autoplay.stop();
    }, { passive: true });

    testimonialSliderElement.addEventListener("mouseleave", function () {
      testimonialSwiper.autoplay.start();
    }, { passive: true });

    testimonialSliderElement.addEventListener("touchstart", function () {
      testimonialSwiper.autoplay.stop();
    }, { passive: true });

    testimonialSliderElement.addEventListener("touchend", function () {
      testimonialSwiper.autoplay.start();
    }, { passive: true });
  }
})();
