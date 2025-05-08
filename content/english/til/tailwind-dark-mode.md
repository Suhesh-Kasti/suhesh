---
title: "Implementing Dark Mode with Tailwind CSS"
date: 2023-11-20T14:45:00+05:45
description: "Today I learned how to implement a dark mode toggle using Tailwind CSS and a bit of JavaScript."
image: "/images/til/dark-mode.jpg"
til_categories: ["CSS"]
til_tags: ["tailwind", "dark-mode", "web-design"]
draft: false
---

## Dark Mode with Tailwind CSS

Today I learned how to implement a proper dark mode using Tailwind CSS. Tailwind makes this surprisingly easy with its built-in dark mode variant.

## Setting Up Tailwind for Dark Mode

First, you need to configure Tailwind to use the `class` strategy for dark mode in your `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class', // or 'media' if you want to respect system preferences
  // rest of your config...
}
```

## Adding Dark Mode Classes

Once configured, you can use the `dark:` prefix to apply styles only when dark mode is active:

```html
<div class="bg-white text-black dark:bg-gray-800 dark:text-white">
  This div will have a white background with black text in light mode,
  and a dark gray background with white text in dark mode.
</div>
```

## Toggle Implementation

I created a simple toggle button with JavaScript:

```html
<button id="theme-toggle" class="p-2 rounded-md">
  <svg id="sun-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20">
    <!-- Sun icon path -->
  </svg>
  <svg id="moon-icon" class="w-6 h-6 hidden" fill="currentColor" viewBox="0 0 20 20">
    <!-- Moon icon path -->
  </svg>
</button>

<script>
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  // On page load, check for saved theme preference
  if (localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && 
       window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    sunIcon.classList.remove('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    moonIcon.classList.remove('hidden');
  }
  
  // Toggle theme when button is clicked
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    
    // Update icons
    sunIcon.classList.toggle('hidden');
    moonIcon.classList.toggle('hidden');
    
    // Save preference to localStorage
    if (document.documentElement.classList.contains('dark')) {
      localStorage.theme = 'dark';
    } else {
      localStorage.theme = 'light';
    }
  });
</script>
```

## Handling Images in Dark Mode

For images that need different versions in dark mode, I can use this approach:

```html
<img 
  src="/path/to/light-image.png" 
  class="block dark:hidden" 
  alt="Image description"
>
<img 
  src="/path/to/dark-image.png" 
  class="hidden dark:block" 
  alt="Image description"
>
```

## Benefits I Discovered

1. **Improved User Experience**: Some users prefer dark mode to reduce eye strain, especially at night.
2. **Battery Savings**: Dark mode can save battery life on devices with OLED screens.
3. **Modern Aesthetic**: Dark mode gives a modern, sleek look to websites.

## Challenges

The main challenge was ensuring sufficient contrast in both modes. I had to carefully select colors that work well in both light and dark themes.

## Next Steps

I plan to:
- Create a more sophisticated animation for the toggle
- Implement automatic switching based on time of day
- Test with users to gather feedback on the color choices
