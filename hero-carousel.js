// hero-carousel.js
// ---------------------------------------------------------------------------
// Drives the home hero's automatic layered product carousel (see
// src/components/home/Hero.astro for the markup and the "Hero Product
// Carousel" section in global.css for the coverflow-style transition
// CSS).
//
// Layering model:
//   Every slide is always assigned a `data-pos` value — its signed
//   circular distance from the active slide: 0 (centered, full size/
//   opacity), ±1 (the partially-visible side peeks), ±2 (further out,
//   fully hidden). CSS gives each of those a fixed transform/opacity;
//   changing which slide is active just recomputes `data-pos` for
//   every slide and lets the existing CSS transition animate each one
//   from its old position to its new one. That means there's no
//   separate "entering from off-screen" case to special-case in JS
//   (unlike a simple two-state carousel) — every slide already has a
//   real resting position at all times, so a plain class/attribute
//   swap is enough for a smooth, correctly-directioned transition,
//   including for an arbitrary dot-jump (the shortest-path distance is
//   computed per slide, so a jump of more than one step still moves
//   every slide the short way round).
//
// Behaviour otherwise unchanged from the previous version of this
// carousel:
//   - Auto-advances on a timer; any direct interaction (hover, keyboard
//     focus inside the carousel, a swipe, or clicking an arrow/dot)
//     pauses it, resuming automatically a few seconds after the last
//     interaction ends.
//   - `prefers-reduced-motion`: autoplay never starts — manual
//     navigation still works, resolving instantly via the site's global
//     reduced-motion transition-duration override (global.css, section 2).
//   - Pure class/attribute toggling (transform/opacity only), no inline
//     styles, no scroll listeners, no animation library.
// ---------------------------------------------------------------------------

const ROTATE_MS = 5000;
const RESUME_DELAY_MS = 5000;
const SWIPE_THRESHOLD = 40;
const SIDE_POSITIONS = 2; // matches the ±2 range styled in global.css

function initCarousel(root) {
  const stage = root.querySelector('[data-carousel-stage]');
  const slideEls = Array.from(root.querySelectorAll('[data-carousel-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  // Floating info card (see the "Hero Floating Information Card" section
  // in global.css and Hero.astro): lives inside the same stage, kept in
  // sync here rather than duplicating the slide data separately — its
  // image/title are just mirrored from whichever slide is active.
  const infoCard = root.querySelector('[data-hero-info-card]');
  const infoImage = root.querySelector('[data-hero-info-image]');
  const infoTitle = root.querySelector('[data-hero-info-title]');
  // Ambient light control (Implementation #12): the toggle button,
  // its popover panel, and the vertical intensity slider inside it —
  // see the "Ambient Light Control" section in global.css.
  const ambientToggle = root.querySelector('[data-ambient-toggle]');
  const ambientPanel = root.querySelector('[data-ambient-panel]');
  const ambientSlider = root.querySelector('[data-ambient-slider]');

  if (!stage || slideEls.length === 0) return;

  const total = slideEls.length;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let activeIndex = 0;
  let autoplayTimer = null;
  let resumeTimer = null;

  // Signed shortest-path circular distance of slide `index` from
  // `activeIndex`, clamped to the range global.css has explicit
  // transform/opacity/scale rules for.
  function positionOf(index) {
    let diff = ((index - activeIndex) % total + total) % total; // 0..total-1
    if (diff > total / 2) diff -= total;
    if (diff > SIDE_POSITIONS) diff = SIDE_POSITIONS;
    if (diff < -SIDE_POSITIONS) diff = -SIDE_POSITIONS;
    return diff;
  }

  // Mirrors the newly-active slide's own image/title into the floating
  // info card. A brief opacity crossfade (see .is-swapping in
  // global.css) covers the swap on normal motion; under reduced motion
  // it updates immediately, matching every other reduced-motion path in
  // this file (manual navigation still works, just without the fade).
  let infoSwapTimer = null;
  function updateInfoCard() {
    if (!infoCard || !infoImage || !infoTitle) return;
    const activeSlide = slideEls[activeIndex];
    const sourceImage = activeSlide?.querySelector('.hero-carousel__image');
    const sourceTitle = activeSlide?.querySelector('.hero-carousel__name');
    if (!sourceImage || !sourceTitle) return;

    const newSrc = sourceImage.getAttribute('src');
    if (!newSrc || infoImage.getAttribute('src') === newSrc) return;
    const newAlt = sourceImage.getAttribute('alt') || '';
    const newTitle = sourceTitle.textContent || '';

    const applySwap = () => {
      infoImage.setAttribute('src', newSrc);
      infoImage.setAttribute('alt', newAlt);
      infoTitle.textContent = newTitle;
      infoCard.classList.remove('is-swapping');
    };

    if (reducedMotion) {
      applySwap();
      return;
    }

    if (infoSwapTimer) clearTimeout(infoSwapTimer);
    infoCard.classList.add('is-swapping');
    infoSwapTimer = setTimeout(() => {
      infoSwapTimer = null;
      applySwap();
    }, 220);
  }

  function applyPositions() {
    slideEls.forEach((el, i) => {
      const pos = positionOf(i);
      el.dataset.pos = String(pos);
      el.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
    });
    dots.forEach((dot) => {
      dot.setAttribute('aria-selected', dot.dataset.index === String(activeIndex) ? 'true' : 'false');
    });
    updateInfoCard();
  }

  function goTo(newIndex) {
    newIndex = ((newIndex % total) + total) % total;
    if (newIndex === activeIndex) return;
    activeIndex = newIndex;
    applyPositions();
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    if (reducedMotion || total <= 1) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goTo(activeIndex + 1);
    }, ROTATE_MS);
  }

  // Pauses now, and schedules a resume a few seconds after the *last*
  // call to this — each new interaction pushes the resume back out.
  function pauseForInteraction() {
    stopAutoplay();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      resumeTimer = null;
      startAutoplay();
    }, RESUME_DELAY_MS);
  }

  prevBtn?.addEventListener('click', () => {
    goTo(activeIndex - 1);
    pauseForInteraction();
  });

  nextBtn?.addEventListener('click', () => {
    goTo(activeIndex + 1);
    pauseForInteraction();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      pauseForInteraction();
    });
  });

  // Swipe (touch only — desktop drag isn't requested and pointer-drag
  // would fight with normal text/image selection).
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  stage.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchActive = true;
      stopAutoplay();
    },
    { passive: true }
  );

  stage.addEventListener(
    'touchend',
    (event) => {
      if (!touchActive) return;
      touchActive = false;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        goTo(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
      }
      pauseForInteraction();
    },
    { passive: true }
  );

  // Hover pause (desktop): pauses for as long as the pointer is over
  // the carousel, resuming immediately on leave — unless a manual
  // interaction is already mid-way through its own resume delay, in
  // which case that delay is respected instead of cutting it short.
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', () => {
    if (!resumeTimer) startAutoplay();
  });

  // Keyboard-focus pause: pauses while any control inside the carousel
  // has focus, resumes once focus leaves it entirely.
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) {
      if (!resumeTimer) startAutoplay();
    }
  });

  // Left/right arrow keys, scoped to the carousel itself (only its own
  // buttons live inside `root`, so this can never intercept typing
  // elsewhere on the page). Skipped while focus is on the ambient
  // intensity slider — that's a native <input type="range">, which
  // already uses Left/Right (and Up/Down) itself to change its own
  // value, and this handler would otherwise also fire on the same
  // keypress (event bubbling) and hijack it into a carousel navigation.
  root.addEventListener('keydown', (event) => {
    if (event.target === ambientSlider) return;
    if (event.key === 'ArrowRight') {
      nextBtn?.click();
    } else if (event.key === 'ArrowLeft') {
      prevBtn?.click();
    }
  });

  // Ambient light control: toggle the popover, close it on Escape or an
  // outside click, and update the spotlight's intensity level as the
  // slider moves. The level is a plain data-attribute (see global.css)
  // rather than a JS-set CSS custom property — this site's CSP
  // (style-src 'self') blocks inline styles, which includes
  // element.style.setProperty on a custom property, so the attribute
  // instead selects which of a fixed set of external-stylesheet rules
  // supplies --spotlight-intensity.
  if (ambientToggle && ambientPanel) {
    const closeAmbientPanel = () => {
      ambientToggle.setAttribute('aria-expanded', 'false');
      ambientPanel.classList.remove('is-visible');
      ambientPanel.hidden = true;
    };
    const openAmbientPanel = () => {
      ambientToggle.setAttribute('aria-expanded', 'true');
      ambientPanel.hidden = false;
      // Double rAF: paint the just-unhidden panel at its base (hidden)
      // opacity/transform on one frame before adding `.is-visible` on
      // the next, so that change is a transition rather than an
      // instant, unanimated jump — same technique as the product
      // hotspot panels (src/scripts/product-preview.js).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ambientPanel.classList.add('is-visible');
        });
      });
    };

    ambientToggle.addEventListener('click', () => {
      if (ambientToggle.getAttribute('aria-expanded') === 'true') {
        closeAmbientPanel();
      } else {
        openAmbientPanel();
      }
    });

    // Click-outside-closes (a pointer convenience; Escape below covers
    // keyboard users).
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-ambient-toggle]') || event.target.closest('[data-ambient-panel]')) {
        return;
      }
      if (ambientToggle.getAttribute('aria-expanded') === 'true') {
        closeAmbientPanel();
      }
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && ambientToggle.getAttribute('aria-expanded') === 'true') {
        closeAmbientPanel();
        ambientToggle.focus();
      }
    });
  }

  if (ambientSlider) {
    ambientSlider.addEventListener('input', () => {
      root.dataset.spotlightLevel = ambientSlider.value;
    });
  }

  // Don't burn cycles auto-advancing a hidden tab.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else if (!resumeTimer) {
      startAutoplay();
    }
  });

  // The markup already renders the correct initial `data-pos`/
  // `aria-hidden` values (see Hero.astro) so there's nothing to paint
  // here — this just brings JS's own bookkeeping in sync with it.
  applyPositions();
  startAutoplay();
}

function init() {
  document.querySelectorAll('[data-hero-carousel]').forEach(initCarousel);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
