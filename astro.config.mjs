import { defineConfig } from 'astro/config';

// Premium Aluminium Doors Website — static output only.
// No integrations, no adapters, no server runtime: keeps the build
// lightweight and deployable to any static host at near-zero cost.
export default defineConfig({
  output: 'static',
  // Directory-style routes (e.g. /aluminium-doors/) with a consistent
  // trailing slash — avoids duplicate-URL SEO issues on static hosting.
  trailingSlash: 'always',
  server: {
    // For "output: 'static'", "astro preview" runs Astro's own static
    // preview server (see astro/dist/core/preview/static-preview-server.js),
    // which is a different code path from Vite's plain preview server.
    // It only ever reads this top-level Astro "server.allowedHosts" option
    // (default: [] — nothing but localhost is allowed) — it does NOT read
    // "vite.preview.allowedHosts" or "vite.server.allowedHosts" at all.
    // Railway's public domain is used as the Host header on every request,
    // so it must be listed here explicitly or every request gets a 403.
    allowedHosts: ['aluminium-doors-website-production.up.railway.app'],

    // Response security headers — previously only documented as a TODO in
    // BaseLayout.astro ("response-header-only, deployment requirement")
    // because they can't be set from inside static HTML. Now that the site
    // has a real Node-based host (Railway), they're set here. Astro's
    // static preview server forwards this object to Vite's preview
    // `setHeaders`, which applies it to every response.
    //
    // script-src needs 'unsafe-inline': Astro inlines this site's small
    // interaction scripts (nav toggle, FAQ accordion, contact-form
    // validation) directly into each page's HTML rather than as external
    // files. That's safe here specifically because nothing on the site
    // ever renders user-controlled or server-fetched data as HTML/JS
    // (no set:html, no innerHTML, no CMS/database — confirmed by source
    // audit) — there is no injection point for that allowance to expose.
    // Everything else is locked to 'self' with no exceptions, since the
    // site has zero third-party scripts, fonts, styles or embeds.
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    },
  },
});
