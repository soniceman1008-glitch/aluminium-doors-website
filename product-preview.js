// product-preview.js
// ---------------------------------------------------------------------------
// Drives the ProductPreview component's image-swap crossfade (see
// src/components/product/ProductPreview.astro and the "Product Preview"
// block in global.css for the CSS side).
//
// Behaviour:
//   - All of an instance's preview images are already in the DOM
//     (stacked absolutely, see the CSS), using the same <img> src values
//     the page's CategoryGrid already renders below — no extra network
//     fetches, no preloading.
//   - Clicking a trigger swaps which image carries `.is-active`. The
//     outgoing image gets a transient `.is-leaving` class (its exit
//     state) and, once its transition finishes, is returned to the
//     plain resting state so it's primed to crossfade in correctly next
//     time it's selected.
//   - Pure class toggling — transform/opacity only, no inline styles
//     (the site's CSP is style-src 'self' and blocks inline styles
//     anyway), no scroll listeners, nothing continuous.
//   - Reduced motion: the site's global prefers-reduced-motion rule
//     (global.css, section 2) already collapses every transition
//     duration to ~0.01ms site-wide, so this still resolves to the
//     final state effectively instantly with no extra handling needed
//     here.
// ---------------------------------------------------------------------------

function initPreview(root) {
  const triggers = Array.from(root.querySelectorAll('[data-preview-trigger]'));
  const images = Array.from(root.querySelectorAll('[data-preview-image]'));
  if (triggers.length === 0 || images.length === 0) return;

  // Tracks a pending "reset .is-leaving back to resting" callback per
  // image, so a fast back-and-forth click doesn't let a stale timeout
  // strip .is-active off an image that has since been reactivated.
  const pendingResets = new WeakMap();

  function settleLeaving(img) {
    const pending = pendingResets.get(img);
    if (pending) {
      img.removeEventListener('transitionend', pending.onEnd);
      clearTimeout(pending.timer);
      pendingResets.delete(img);
    }
    if (!img.classList.contains('is-active')) {
      img.classList.remove('is-leaving');
    }
  }

  function selectIndex(index) {
    const targetImage = images.find((img) => img.dataset.index === String(index));
    if (!targetImage || targetImage.classList.contains('is-active')) return;

    const currentImage = images.find((img) => img.classList.contains('is-active'));

    // A click landing on the image that's still mid-exit from a previous
    // swap: cancel its pending reset and let it re-enter cleanly instead.
    settleLeaving(targetImage);
    targetImage.classList.remove('is-leaving');
    targetImage.classList.add('is-active');

    if (currentImage && currentImage !== targetImage) {
      currentImage.classList.remove('is-active');
      currentImage.classList.add('is-leaving');

      const onEnd = (event) => {
        if (event.target !== currentImage) return;
        settleLeaving(currentImage);
      };
      const timer = setTimeout(() => settleLeaving(currentImage), 750);
      currentImage.addEventListener('transitionend', onEnd);
      pendingResets.set(currentImage, { onEnd, timer });
    }

    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-pressed', trigger.dataset.index === String(index) ? 'true' : 'false');
    });
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      selectIndex(trigger.dataset.index);
    });
  });
}

// Product hotspots (Implementation #11) — the fixed marker/panel pairs
// overlaid on some pages' ProductPreview stage (see the "showHotspots"
// prop on ProductPreview.astro and the "Product Hotspots" block in
// global.css). No-ops if a given instance has none.
function initHotspots(root) {
  const triggers = Array.from(root.querySelectorAll('[data-hotspot-trigger]'));
  if (triggers.length === 0) return;

  function panelFor(trigger) {
    const id = trigger.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }

  function close(trigger) {
    const panel = panelFor(trigger);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.closest('.product-hotspot')?.classList.remove('is-open');
    if (panel) {
      panel.classList.remove('is-visible');
      panel.hidden = true;
    }
  }

  function open(trigger) {
    const panel = panelFor(trigger);
    if (!panel) return;

    // Only one hotspot detail open at a time.
    triggers.forEach((other) => {
      if (other !== trigger && other.getAttribute('aria-expanded') === 'true') {
        close(other);
      }
    });

    trigger.setAttribute('aria-expanded', 'true');
    trigger.closest('.product-hotspot')?.classList.add('is-open');
    panel.hidden = false;
    // Double rAF: let the browser paint the panel in its hidden-just-
    // removed resting state (opacity 0 / offset transform) on one frame
    // before adding `.is-visible` on the next, so the opacity/transform
    // change is a transition instead of an instant, unanimated jump.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.add('is-visible');
      });
    });
  }

  function toggle(trigger) {
    if (trigger.getAttribute('aria-expanded') === 'true') {
      close(trigger);
    } else {
      open(trigger);
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => toggle(trigger));
  });

  root.querySelectorAll('[data-hotspot-close]').forEach((closeBtn) => {
    closeBtn.addEventListener('click', () => {
      const panel = closeBtn.closest('[data-hotspot-panel]');
      const trigger = triggers.find((t) => panelFor(t) === panel);
      if (trigger) close(trigger);
    });
  });

  // Escape closes whichever hotspot is open and returns focus to its
  // marker button, matching standard disclosure-widget behaviour.
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openTrigger = triggers.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (openTrigger) {
      close(openTrigger);
      openTrigger.focus();
    }
  });

  // Clicking anywhere else on the page (the image itself included)
  // closes an open hotspot — standard popover behaviour. Keyboard users
  // have Escape above, so this is purely a pointer convenience.
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-hotspot-trigger]') || event.target.closest('[data-hotspot-panel]')) {
      return;
    }
    const openTrigger = triggers.find((t) => t.getAttribute('aria-expanded') === 'true');
    if (openTrigger) close(openTrigger);
  });
}

function init() {
  document.querySelectorAll('.product-preview').forEach((root) => {
    initPreview(root);
    initHotspots(root);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
