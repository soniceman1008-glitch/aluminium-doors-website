// footer-accordion.js
// ---------------------------------------------------------------------------
// Mobile footer accordion (Implementation #13). See the "Footer Accordion"
// section in global.css for the +/- icon and the grid-template-rows
// 0fr -> 1fr collapse/expand transition this drives via a single
// `.is-open` class — no inline styles or JS-computed heights (this site's
// CSP is style-src 'self', same reasoning as every other dynamic-visual-
// state component in this codebase, e.g. hero-carousel.js).
//
// Desktop (>= 768px, matching the footer grid's own existing two/four-
// column breakpoint) keeps every panel permanently visible via a CSS
// override in global.css, regardless of aria-expanded/`.is-open` — this
// script never fights that by forcing panels open/closed itself. Its one
// desktop-sensitive job is `inert`: a panel collapsed on mobile must not
// be reachable by Tab, but the same panel must NEVER become inert on
// desktop, where it's always visible. That's gated by a MediaQueryList
// matching the same breakpoint, with a `change` listener so crossing it
// (resize, rotation, devtools) re-syncs immediately rather than leaving
// desktop content stuck inert from a stale mobile state.
// ---------------------------------------------------------------------------

const MOBILE_QUERY = '(max-width: 767px)';

function initFooterAccordion(footer) {
  const triggers = Array.from(footer.querySelectorAll('[data-footer-accordion-trigger]'));
  if (triggers.length === 0) return;

  const mobileMql = window.matchMedia(MOBILE_QUERY);

  function panelFor(trigger) {
    const panelId = trigger.getAttribute('aria-controls');
    return panelId ? document.getElementById(panelId) : null;
  }

  // Applies/removes `inert` on every panel to match its own current
  // open/closed state, but only while the mobile query matches — on
  // desktop every panel is forced visible by CSS, so none of them are
  // ever made inert there, whatever their tracked state happens to be.
  function syncInert() {
    triggers.forEach((trigger) => {
      const panel = panelFor(trigger);
      if (!panel) return;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (mobileMql.matches && !isOpen) {
        panel.setAttribute('inert', '');
      } else {
        panel.removeAttribute('inert');
      }
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const panel = panelFor(trigger);
      if (!panel) return;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('is-open', !isOpen);
      syncInert();
    });
  });

  if (typeof mobileMql.addEventListener === 'function') {
    mobileMql.addEventListener('change', syncInert);
  } else if (typeof mobileMql.addListener === 'function') {
    // Older Safari.
    mobileMql.addListener(syncInert);
  }

  syncInert();
}

function init() {
  document.querySelectorAll('[data-footer-accordion]').forEach(initFooterAccordion);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
