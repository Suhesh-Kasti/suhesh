// main script
(function () {
  "use strict";

// Clickable checkboxes
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => {
  // remove the disabled attribute; added by kramdown by default
  checkbox.removeAttribute('disabled');
});

// Initialize banner slider
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
    }
  }
});

  // Dropdown Menu Toggler For Mobile
  // ----------------------------------------
  const dropdownMenuToggler = document.querySelectorAll(
    ".nav-dropdown > .nav-link",
  );

  dropdownMenuToggler.forEach((toggler) => {
    toggler?.addEventListener("click", (e) => {
      e.target.parentElement.classList.toggle("active");
    });
  });

// Enhanced Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
  const accordions = document.querySelectorAll('.accordion');
  
  function initializeAccordion(accordion) {
    const items = accordion.querySelectorAll('.accordion-item');
    const headers = accordion.querySelectorAll('.accordion-header');
    
    // Set initial ARIA attributes
    headers.forEach((header, index) => {
      const content = header.nextElementSibling;
      const headerId = `accordion-header-${index}`;
      const contentId = `accordion-content-${index}`;
      
      header.setAttribute('id', headerId);
      header.setAttribute('aria-controls', contentId);
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      
      content.setAttribute('id', contentId);
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', headerId);
    });
    
    // Handle click and keyboard events
    headers.forEach(header => {
      const handleInteraction = (event) => {
        if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) {
          return;
        }
        
        event.preventDefault();
        const content = header.nextElementSibling;
        const parent = header.parentElement;
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        // Toggle current accordion
        header.setAttribute('aria-expanded', !isExpanded);
        parent.classList.toggle('active');
        
        if (!isExpanded) {
          content.style.maxHeight = `${content.scrollHeight}px`;
          content.classList.add('active');
        } else {
          content.style.maxHeight = '0px';
          content.classList.remove('active');
        }
        
        // Close other open accordions
        items.forEach(item => {
          if (item !== parent && item.classList.contains('active')) {
            const siblingHeader = item.querySelector('.accordion-header');
            const siblingContent = item.querySelector('.accordion-content');
            
            siblingHeader.setAttribute('aria-expanded', 'false');
            item.classList.remove('active');
            siblingContent.style.maxHeight = '0px';
            siblingContent.classList.remove('active');
          }
        });
      };
      
      header.addEventListener('click', handleInteraction);
      header.addEventListener('keydown', handleInteraction);
    });
  }
  
  // Initialize all accordions
  accordions.forEach(initializeAccordion);
  
  // Optional: Open first item in each accordion
  accordions.forEach(accordion => {
    const firstItem = accordion.querySelector('.accordion-item');
    if (firstItem) {
      const header = firstItem.querySelector('.accordion-header');
      const content = firstItem.querySelector('.accordion-content');
      
      firstItem.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
      content.classList.add('active');
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
});



  // Testimonial Slider
  // ----------------------------------------
  new Swiper(".testimonial-slider", {
    spaceBetween: 24,
    loop: true,
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
})();
