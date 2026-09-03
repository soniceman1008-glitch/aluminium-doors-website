Place final production images here (project photos, product photography,
logo assets, etc.) once they are available.

Guidelines for later phases:
- Prefer WebP or AVIF formats for photographs.
- Provide real, properly licensed project/product photography only —
  no stock or placeholder imagery should ship in the production build.
- Keep filenames descriptive and lowercase-with-hyphens
  (e.g. sliding-door-charcoal-01.webp).

placeholders/ subfolder
------------------------
Contains illustrated architectural SVG graphics (generic modern facades
with gradient sky/glazing, roofline, and landscaping details — not
photos, not stock or competitor images) used as temporary stand-ins on
the Home page until real photography is supplied:

  hero.svg               — Hero section image
  about.svg               — About preview section image
  category-doors.svg      — Aluminium Doors product card image
  category-windows.svg    — Aluminium Windows product card image
  gallery-1.svg .. -4.svg  — Featured Projects / Gallery preview tiles

To swap in real photography later, replace the referenced file at the
same path (or update the `src` in the corresponding component under
src/components/home/) and delete the placeholder SVG once it is no
longer referenced anywhere.

Also in placeholders/ — Aluminium Doors / Aluminium Windows pages:

  doors-hero.svg / windows-hero.svg   — product page hero images
  door-sliding.svg, door-bifold.svg, door-hinged.svg,
    door-french.svg, door-custom.svg  — Aluminium Doors category tiles
  window-sliding.svg, window-awning.svg, window-casement.svg,
    window-fixed.svg, window-custom.svg — Aluminium Windows category tiles

Referenced from src/components/shared/*.astro, src/components/product/*.astro
and src/pages/aluminium-doors.astro / aluminium-windows.astro. Same
swap-in-place approach applies.

Also in placeholders/ — Gallery / About pages:

  gallery-hero.svg      — Gallery page hero image
  about-visual.svg      — About page visual section image (wide format)
  project-1.svg .. -8.svg — Gallery page project tiles

Referenced from src/pages/gallery.astro and src/pages/about.astro.
