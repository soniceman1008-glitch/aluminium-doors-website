// back-to-top.js
// ---------------------------------------------------------------------------
// Shows the floating "back to top" button (see `#back-to-top` in
// BaseLayout.astro and the "Back to Top" section in global.css) once
// the visitor has scrolled a meaningful distance down the page, and
// scrolls smoothly back to the top when it's activated.
//
// Visibility is driven by IntersectionObserver watching a tiny,
// invisible `#scroll-sentinel` element positioned a fixed distance down
// the page, rather than a scroll event listener — the sentinel is
// on-screen near the top of the page and stops being on-screen once the
// visitor scrolls past it. This matches src/scripts/scroll-reveal.js's
// established "no scroll listeners anywhere" approach.
//
// While hidden, the button is taken out of the tab order
// (tabindex="-1") and hidden from assistive tech (aria-hidden="true")
// so it can never be silently focused when it isn't visible.
// ---------------------------------------------------------------------------

function init() {
  const button = document.getElementById('back-to-top');
  const sentinel = document.getElementById('scroll-sentinel');
  if (!button || !sentinel) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setVisible(visible) {
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible) {
      button.removeAttribute('tabindex');
    } else {
      button.setAttribute('tabindex', '-1');
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setVisible(!entry.isIntersecting));
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
  } else {
    // No IntersectionObserver support: default to visible rather than
    // leave no way at all to reach the control.
    setVisible(true);
  }

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
