// scroll-reveal.js
// ---------------------------------------------------------------------------
// Foundation engine for the scroll-reveal animation system (see
// src/styles/animations.css for the visual side). Imported once from
// BaseLayout.astro so it's available site-wide.
//
// Design constraints (per the animation-foundation brief):
//   - CSS transforms + opacity only (handled in animations.css) — this
//     file only ever toggles a class, it never sets inline transform/
//     opacity styles itself.
//   - IntersectionObserver only. No scroll event listeners anywhere.
//   - One-shot reveal: once an element has animated in, it's unobserved.
//   - Fully inert under prefers-reduced-motion, or if IntersectionObserver
//     isn't supported: content is shown immediately, no animation at all.
//
// STATUS: in active use site-wide (see animations.css for the full list
// of what carries an `.anim-*` class and what deliberately doesn't).
//
// Usage reference:
//   <div class="anim-fade-up">...</div>
//   <div class="anim-fade-up" style="--anim-delay: 150ms">...</div>
//   <img class="anim-image-reveal" ... /> (needs an overflow:hidden ancestor)
//   <img class="anim-image-tilt-reveal" ... /> (same, plus a settling rotation)
//   <div class="anim-scale-reveal">...</div>
//   <h2 class="anim-text-reveal">Heading text</h2>
//   <div class="anim-stagger">
//     <div class="card">...</div>
//     <div class="card">...</div>
//   </div>
// ---------------------------------------------------------------------------

const REVEAL_SELECTOR =
  '.anim-fade-up, .anim-fade-in, .anim-image-reveal, .anim-image-tilt-reveal, .anim-scale-reveal, .anim-text-reveal, .anim-stagger, .anim-float';

/**
 * Splits an element's text into per-word spans, wrapped in a line span,
 * so animations.css can reveal each word with a staggered mask/slide.
 * Idempotent (safe to call more than once) and purely additive — if it
 * never runs, the element's original text is unaffected.
 */
function splitTextReveal(el) {
  if (el.dataset.animSplit === 'true') return;

  const words = el.textContent.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  el.dataset.animSplit = 'true';
  el.textContent = '';

  const line = document.createElement('span');
  line.className = 'anim-text-reveal__line';

  words.forEach((word, index) => {
    const wordEl = document.createElement('span');
    wordEl.className = 'anim-text-reveal__word';
    wordEl.style.setProperty('--anim-word-i', String(index));
    wordEl.textContent = word;
    line.appendChild(wordEl);

    if (index < words.length - 1) {
      line.appendChild(document.createTextNode(' '));
    }
  });

  el.appendChild(line);
}

function observeReveals(elements) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      // Trigger a little before the element's edge reaches the very
      // bottom of the viewport, so the reveal feels timed to arrival
      // rather than lagging behind the scroll.
      rootMargin: '0px 0px -10% 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

function init() {
  const elements = document.querySelectorAll(REVEAL_SELECTOR);
  if (elements.length === 0) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // No motion (or no browser support to animate safely): show
    // everything as-is, immediately, with no observer and no
    // text-splitting DOM churn.
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  elements.forEach((el) => {
    if (el.classList.contains('anim-text-reveal')) {
      splitTextReveal(el);
    }
  });

  observeReveals(elements);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
