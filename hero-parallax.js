// hero-parallax.js
// ---------------------------------------------------------------------------
// Subtle mouse-driven parallax for the image-bearing hero (`.hero__inner`,
// present on Home and the Aluminium Doors/Windows/Gallery page heroes).
// A no-op everywhere else — About/Contact/FAQ have no `.hero__inner`.
//
// Constraints this implements:
//   - Desktop-with-a-real-mouse only: gated on
//     `(hover: hover) and (pointer: fine)`, so touch devices (and hybrid
//     devices in touch mode) never get a mousemove listener attached at all.
//   - Fully inert under prefers-reduced-motion (checked once, up front).
//   - transform: translate3d(x, y, 0) only. No rotation, no scale, z is
//     always 0 — a flat, 2-layer depth cue, not a 3D/tilt effect.
//   - Applied to the .hero__media and .hero__content CONTAINERS, not the
//     elements the entrance animation (previous step) already targets —
//     the <img> itself, the heading, the subtitle, the CTAs. Those carry
//     a CSS `animation` on `transform` with fill-mode both, which would
//     permanently win over an inline `style.transform` on the very same
//     element. Moving the containers instead sidesteps that entirely and
//     is also the more correct read of "image moves, text moves less":
//     two independent depth layers, not a repositioned photo-within-frame.
//   - transform never touches layout-affecting properties, so this can
//     never change page layout/reflow.
// ---------------------------------------------------------------------------

const IMAGE_MAX_OFFSET = 10; // px — within the requested 8-12px range
const TEXT_MAX_OFFSET = 3.5; // px — within the requested 2-5px range

function initHeroParallax() {
  const heroInner = document.querySelector('.hero__inner');
  if (!heroInner) return;

  const media = heroInner.querySelector('.hero__media');
  const content = heroInner.querySelector('.hero__content');
  if (!media && !content) return;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Touch devices and reduced-motion visitors get the static hero as-is —
  // no listener is ever attached, so there is nothing to disable later.
  if (!canHover || prefersReducedMotion) return;

  let targetX = 0;
  let targetY = 0;
  let ticking = false;

  const applyTransform = () => {
    if (media) {
      media.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    }
    if (content) {
      const ratio = TEXT_MAX_OFFSET / IMAGE_MAX_OFFSET;
      content.style.transform = `translate3d(${targetX * ratio}px, ${targetY * ratio}px, 0)`;
    }
    ticking = false;
  };

  const queueUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(applyTransform);
      ticking = true;
    }
  };

  const onPointerMove = (event) => {
    const rect = heroInner.getBoundingClientRect();
    // -0.5..0.5 across the hero's own box, independent of viewport size.
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;

    targetX = relX * 2 * IMAGE_MAX_OFFSET;
    targetY = relY * 2 * IMAGE_MAX_OFFSET;
    queueUpdate();
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
    queueUpdate();
  };

  heroInner.addEventListener('mousemove', onPointerMove, { passive: true });
  heroInner.addEventListener('mouseleave', onPointerLeave, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroParallax);
} else {
  initHeroParallax();
}
