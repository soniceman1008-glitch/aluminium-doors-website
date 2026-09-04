// page-loader.js
// ---------------------------------------------------------------------------
// Hides the initial page-load overlay (see the `#page-loader` markup in
// BaseLayout.astro and its CSS in global.css, section 17 "Page Loader")
// once the page is ready.
//
// The overlay only ever becomes visible when the synchronous inline
// script in <head> added "js-loader-active" to <html> — i.e. JS is
// enabled and the visitor doesn't prefer reduced motion (same gate as
// the "js-anim-ready" scroll-reveal system). So if this script never
// runs at all, the loader was never shown in the first place and
// there's nothing to clean up.
//
// Fades the overlay out via a CSS class (opacity + pointer-events only,
// no inline styles) rather than removing it from the DOM, and includes
// a short safety fallback so a slow `load` event can never hold it up
// longer than necessary.
// ---------------------------------------------------------------------------

const MAX_WAIT_MS = 1500;

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('is-hidden');
}

function init() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  if (document.readyState === 'complete') {
    hideLoader();
    return;
  }

  window.addEventListener('load', hideLoader, { once: true });
  // Safety net: don't let the overlay outlive a slow/unfired `load`
  // event and block interaction with the page underneath it.
  setTimeout(hideLoader, MAX_WAIT_MS);
}

init();
