const nav = document.getElementById('main-nav');
const navLinks = nav.querySelectorAll('a');

function setNavColor(color, icon) {
  navLinks.forEach(el => el.style.color = color);
  if (icon) document.getElementById('nav-icon').textContent = icon;
}

const visibleSections = new Set();

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      visibleSections.add(entry.target);
    } else {
      visibleSections.delete(entry.target);
    }
  });

  // Pick the topmost visible section
  const sections = [...visibleSections].sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
  );

  if (sections.length > 0) {
    setNavColor(sections[0].dataset.navcolor, sections[0].dataset.navicon);
  }
}, {
  threshold: 0,
  rootMargin: "-10% 0px -85% 0px"
});

document.querySelectorAll('section[data-navcolor]')
  .forEach(section => observer.observe(section));
