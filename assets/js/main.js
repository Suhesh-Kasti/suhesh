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

    // Initialize banner slider
    const bannerSliderElement = document.querySelector(".banner-slider");
    if (bannerSliderElement) {
      const bannerSlider = new Swiper(".banner-slider", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        effect: "fade",
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
          768: {
            effect: "fade",
          },
        },
      });
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
