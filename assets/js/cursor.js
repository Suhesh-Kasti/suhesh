// Simple custom cursor implementation
document.addEventListener('DOMContentLoaded', function() {
  // Only run on non-touch devices
  if (window.matchMedia("(hover: hover)").matches) {
    // Remove any existing cursor elements
    const existingCursors = document.querySelectorAll('#circle');
    existingCursors.forEach(cursor => cursor.remove());

    // Force cursor: none on all elements
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Create cursor element
    const circle = document.createElement('div');
    circle.id = 'circle';
    document.body.appendChild(circle);

    console.log('Custom cursor element added to the DOM');

    // Initialize variables
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const easing = 0.25;

    // Set initial CSS variables
    circle.style.setProperty('--xpos', '0px');
    circle.style.setProperty('--ypos', '0px');

    // Track mouse movement
    document.addEventListener('pointermove', (evt) => {
      targetX = evt.clientX - circle.getBoundingClientRect().width / 2;
      targetY = evt.clientY - circle.getBoundingClientRect().height / 2;
    });

    // Animation function for smooth cursor movement
    function animateCircle() {
      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;

      circle.style.setProperty('--xpos', `${currentX}px`);
      circle.style.setProperty('--ypos', `${currentY}px`);

      requestAnimationFrame(animateCircle);
    }

    // Start the animation
    animateCircle();
  }
});