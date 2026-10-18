// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { securityHeaders } from './src/lib/security-headers.mjs';

// Pages statiques ; seule la route /api/projet tourne en fonction serveur sur Vercel.
export default defineConfig({
  site: 'https://www.tonchasseurimmo-roannais.fr',
  output: 'static',
  adapter: vercel(),
  integrations: [preact(), sitemap({ filter: (page) => !page.includes('/api/') }), securityHeaders()],
  build: { format: 'directory' },
});
