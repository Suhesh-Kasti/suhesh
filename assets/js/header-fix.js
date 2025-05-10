// Modern and smooth header animation
document.addEventListener('DOMContentLoaded', function() {
  // Get the header element
  const header = document.querySelector('.header');
  if (!header) return;

  // Set initial styles
  header.style.position = 'fixed';
  header.style.top = '0';
  header.style.left = '0';
  header.style.right = '0';
  header.style.width = '100%';
  header.style.zIndex = '1000';
  header.style.transform = 'translateY(0)';
  header.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease';

  // Get header height
  const headerHeight = header.offsetHeight || 80;

  // Create a placeholder to prevent content jump
  const placeholder = document.createElement('div');
  placeholder.style.height = `${headerHeight}px`;
  placeholder.style.display = 'block';
  placeholder.id = 'header-placeholder';

  // Insert the placeholder after the header
  if (header.parentNode) {
    header.parentNode.insertBefore(placeholder, header.nextSibling);
  }

  // Variables for scroll handling
  let lastScrollTop = 0;
  let isHeaderVisible = true;
  let scrollTimer = null;

  // Scroll handler with improved animation
  function handleScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Don't do anything for small scroll amounts
    if (Math.abs(currentScrollTop - lastScrollTop) <= 5) return;

    // Clear any existing scroll timer
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    // Determine if we should show or hide the header
    if (currentScrollTop > lastScrollTop && currentScrollTop > headerHeight) {
      // Scrolling DOWN and not at the top - hide header
      if (isHeaderVisible) {
        header.style.transform = 'translateY(-100%)';
        header.style.boxShadow = 'none';
        isHeaderVisible = false;
      }
    } else {
      // Scrolling UP or at the top - show header
      if (!isHeaderVisible) {
        header.style.transform = 'translateY(0)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        isHeaderVisible = true;
      }
    }

    // Always show header at the top
    if (currentScrollTop <= 10) {
      header.style.transform = 'translateY(0)';
      header.style.boxShadow = 'none';
      isHeaderVisible = true;
    }

    // Update last scroll position
    lastScrollTop = currentScrollTop;

    // Set a timer to add shadow after scrolling stops
    scrollTimer = setTimeout(() => {
      if (isHeaderVisible && currentScrollTop > 10) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      }
    }, 300);
  }

  // Use requestAnimationFrame for smoother performance
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Add scroll event listener
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial check
  handleScroll();
});
