import { defineConfig } from 'astro/config';

// Premium Aluminium Doors Website — static output only.
// No integrations, no adapters, no server runtime: keeps the build
// lightweight and deployable to any static host at near-zero cost.
export default defineConfig({
  output: 'static',
  // Directory-style routes (e.g. /aluminium-doors/) with a consistent
  // trailing slash — avoids duplicate-URL SEO issues on static hosting.
  trailingSlash: 'always',
  vite: {
    preview: {
      // "astro preview" is used as the production server on Railway
      // (a Node host, not a static-file host). Its dev/preview server
      // rejects requests whose Host header isn't in this allowlist, so
      // Railway's public domain must be listed here explicitly.
      allowedHosts: ['aluminium-doors-website-production.up.railway.app'],
    },
  },
});
