function updateFavicon() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Find existing or create a new one
  let favicon = document.querySelector('link[rel="icon"]') 
             || document.querySelector('link[rel="shortcut icon"]');

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.href = isDark ? '/assets/logos/LP_black.webp' : '/assets/logos/LP_white.webp';
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', updateFavicon);

// Update when the user switches modes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', updateFavicon);
window.matchMedia('(prefers-color-scheme: light)')
  .addEventListener('change', updateFavicon);
