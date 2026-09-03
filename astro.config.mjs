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
  },
});
