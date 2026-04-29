// gallery.js
// Initialises a split-panel gallery inside every .ss-panel.
// Depends on: gallery.config.js (defines GALLERY_IMAGES object)

(function () {
  const INTERVAL = 4000;

  const SUBSYSTEMS = [
    'drone-construction',
    'drone-control',
    'attachments',
    'drone-network',
    'object-detection',
  ];

  function buildGallery(panel, images) {
    // ── right column ──────────────────────────────────────────
    const right = panel.querySelector('.ss-gallery-right');
    const track = right.querySelector('.ss-gallery-track');
    const dotsWrap = right.querySelector('.ss-gallery-dots');
    const progressFill = right.querySelector('.ss-progress-fill');

    let current = 0;
    let timer = null;

    if (!images || images.length === 0) {
      track.innerHTML = '<p class="ss-gallery-empty">No images found.</p>';
      right.querySelector('.ss-gallery-controls').style.display = 'none';
      return;
    }

    // Build slides
    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'ss-gallery-slide' + (i === 0 ? ' active' : '');

      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';

      slide.appendChild(img);
      track.appendChild(slide);
    });

    // Build dots
    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'ss-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
      dot.addEventListener('click', () => { goTo(i); startTimer(); });
      dotsWrap.appendChild(dot);
    });

    function getSlides() { return track.querySelectorAll('.ss-gallery-slide'); }
    function getDots()   { return dotsWrap.querySelectorAll('.ss-dot'); }

    function goTo(index) {
      const slides = getSlides();
      const dots   = getDots();
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      startProgress();
    }

    function startProgress() {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      void progressFill.offsetWidth;
      progressFill.style.transition = 'width ' + INTERVAL + 'ms linear';
      progressFill.style.width = '100%';
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), INTERVAL);
    }

    right.querySelector('.ss-prev').addEventListener('click', () => { goTo(current - 1); startTimer(); });
    right.querySelector('.ss-next').addEventListener('click', () => { goTo(current + 1); startTimer(); });

    startProgress();
    startTimer();
  }

  function init() {
    if (typeof GALLERY_IMAGES === 'undefined') {
      console.warn('gallery.config.js not loaded — run build-gallery.js');
      return;
    }

    const panels = document.querySelectorAll('.ss-panel');

    panels.forEach((panel, i) => {
      const key = SUBSYSTEMS[i];
      const images = GALLERY_IMAGES[key] || [];
      buildGallery(panel, images);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
