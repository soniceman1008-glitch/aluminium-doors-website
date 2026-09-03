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
      // Allow the "astro preview" server to accept requests through a
      // reverse proxy on a public hostname (e.g. Railway's generated
      // domain). Vite/Astro's preview server otherwise only accepts
      // localhost Host headers and returns 403 for anything else.
      allowedHosts: true,
    },
  },
});
