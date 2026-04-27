const osTheme = window.matchMedia('(prefers-color-scheme: dark)');

function updateFavicon() {
  const isDark = osTheme.matches; // OS/browser theme, NOT your site theme

  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.type = 'image/svg+xml';
  favicon.href = isDark
    ? '/assets/logos/LP_black.svg'
    : '/assets/logos/LP_white.svg';
}

document.addEventListener('DOMContentLoaded', updateFavicon);
osTheme.addEventListener('change', updateFavicon);
