
// Mobile Navbar Dropdown Toggle
document.addEventListener('DOMContentLoaded', function () {
  const navDropdowns = document.querySelectorAll('.nav-dropdown');

  navDropdowns.forEach(function (dropdown) {
    const toggleBtn = dropdown.querySelector('.nav-link');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        // Only active on mobile/tablet where hover doesn't work effectively
        // We can check if the toggler is visible or based on window width
        if (window.innerWidth < 1024) {
          e.preventDefault();

          // Close other dropdowns
          navDropdowns.forEach(other => {
            if (other && other !== dropdown) {
              other.classList.remove('active');
            }
          });

          // Toggle current
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      navDropdowns.forEach(function (dropdown) {
        dropdown.classList.remove('active');
      });
    }
  });
});
