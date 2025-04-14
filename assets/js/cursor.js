// Custom animated cursor implementation
document.addEventListener('DOMContentLoaded', function() {
  // Only run on non-touch devices
  if (window.matchMedia("(hover: hover)").matches) {
    // Create cursor elements
    const cursorDot = document.createElement('div');
    const cursorDotOutline = document.createElement('div');
    
    cursorDot.classList.add('cursor-dot');
    cursorDotOutline.classList.add('cursor-dot-outline');
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorDotOutline);
    
    // Initialize cursor position
    let cursorVisible = true;
    let cursorEnlarged = false;
    
    // Mouse movement position
    let endX = 0;
    let endY = 0;
    
    // Initial cursor position - needed for transition when cursor appears
    gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorDotOutline, { xPercent: -50, yPercent: -50 });
    
    // Smooth cursor animation with GSAP
    const moveCursor = gsap.quickTo([cursorDot, cursorDotOutline], "x", { 
      duration: 0.5, 
      ease: "power3.out" 
    });
    
    const moveCursorY = gsap.quickTo([cursorDot, cursorDotOutline], "y", { 
      duration: 0.5, 
      ease: "power3.out" 
    });
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
      endX = e.clientX;
      endY = e.clientY;
      
      moveCursor(endX);
      moveCursorY(endY);
      
      // Show cursor when it moves
      if (!cursorVisible) {
        toggleCursorVisibility();
      }
    });
    
    // Hide cursor when it leaves the screen
    document.addEventListener('mouseout', () => {
      toggleCursorVisibility(false);
    });
    
    document.addEventListener('mouseenter', () => {
      toggleCursorVisibility(true);
    });
    
    // Modify cursor on clickable elements
    const clickables = document.querySelectorAll('a, button, input, textarea, select, [role="button"], .btn, .swiper-button-prev, .swiper-button-next, .swiper-pagination-bullet');
    
    clickables.forEach((element) => {
      element.addEventListener('mouseover', () => {
        if (!cursorEnlarged) {
          cursorEnlarged = true;
          gsap.to(cursorDot, {
            scale: 1.5,
            duration: 0.3,
            ease: "power2.out"
          });
          gsap.to(cursorDotOutline, {
            scale: 1.2,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
      
      element.addEventListener('mouseout', () => {
        if (cursorEnlarged) {
          cursorEnlarged = false;
          gsap.to([cursorDot, cursorDotOutline], {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });
    });
    
    // Special effect when hovering over images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('mouseover', () => {
        gsap.to(cursorDot, {
          backgroundColor: 'white',
          duration: 0.3
        });
        gsap.to(cursorDotOutline, {
          borderColor: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          duration: 0.3
        });
      });
      
      img.addEventListener('mouseout', () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        // Fixed colors for both modes
        const dotColor = isDarkMode ? '#ffffff' : '#121212';
        const outlineColor = isDarkMode ? '#ffffff' : '#121212';
        const bgColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(18, 18, 18, 0.1)';
        
        gsap.to(cursorDot, {
          backgroundColor: dotColor,
          duration: 0.3
        });
        gsap.to(cursorDotOutline, {
          borderColor: outlineColor,
          backgroundColor: bgColor,
          duration: 0.3
        });
      });
    });
    
    // Add effect on mouse down
    document.addEventListener('mousedown', () => {
      gsap.to(cursorDot, {
        scale: 0.8,
        duration: 0.2
      });
      gsap.to(cursorDotOutline, {
        scale: 0.8,
        duration: 0.2
      });
    });
    
    document.addEventListener('mouseup', () => {
      gsap.to(cursorDot, {
        scale: cursorEnlarged ? 1.5 : 1,
        duration: 0.2
      });
      gsap.to(cursorDotOutline, {
        scale: cursorEnlarged ? 1.2 : 1,
        duration: 0.2
      });
    });
    
    // Toggle cursor visibility
    function toggleCursorVisibility(visible = true) {
      if (visible) {
        gsap.to([cursorDot, cursorDotOutline], {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        cursorVisible = true;
      } else {
        gsap.to([cursorDot, cursorDotOutline], {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out"
        });
        cursorVisible = false;
      }
    }
    
    // Update cursor colors on theme change
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class' && mutation.target === document.documentElement) {
          const isDarkMode = document.documentElement.classList.contains('dark');
          // Fixed colors for both modes
          const dotColor = isDarkMode ? '#ffffff' : '#121212';
          const outlineColor = isDarkMode ? '#ffffff' : '#121212';
          const bgColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(18, 18, 18, 0.1)';
          
          gsap.to(cursorDot, {
            backgroundColor: dotColor,
            duration: 0.3
          });
          gsap.to(cursorDotOutline, {
            borderColor: outlineColor,
            backgroundColor: bgColor,
            duration: 0.3
          });
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
  }
}); 