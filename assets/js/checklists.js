(function() {
  document.addEventListener('DOMContentLoaded', initChecklists);
  
  // Expose it globally so PJAX transitions can re-init it
  window.initChecklists = initChecklists;

  function initChecklists() {
    const checkboxes = document.querySelectorAll('.task-list-item-checkbox');
    if (!checkboxes.length) return;

    // Use page path as unique key for localStorage
    const pageKey = 'checklists_' + window.location.pathname;
    let savedState = {};
    try {
      if (localStorage.getItem(pageKey)) {
        savedState = JSON.parse(localStorage.getItem(pageKey));
      }
    } catch(e) {}

    checkboxes.forEach((cb, index) => {
      // Remove disabled attribute to make it interactive
      cb.removeAttribute('disabled');
      
      // Restore previous state
      if (savedState[index]) {
        cb.checked = true;
      }

      // Add listener to save state on change
      cb.addEventListener('change', function() {
        if (this.checked) {
          savedState[index] = true;
        } else {
          delete savedState[index];
        }
        localStorage.setItem(pageKey, JSON.stringify(savedState));
      });
      
      // Wrap the checkbox and text in a cleaner styled structure if needed
      // but styling is handled by CSS via .task-list-item-checkbox
    });
  }
})();
