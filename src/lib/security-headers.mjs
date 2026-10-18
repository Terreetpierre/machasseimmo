// En-têtes de sécurité appliqués à toutes les pages sur Vercel, statiques comprises.
// L'adaptateur Vercel génère .vercel/output/config.json ; on y ajoute une route d'en-têtes en tête de liste.
import { readFile, writeFile } from 'node:fs/promises';

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
};

export function securityHeaders() {
  return {
    name: 'tci-security-headers',
    hooks: {
      'astro:build:done': async ({ logger }) => {
        const file = new URL('../../.vercel/output/config.json', import.meta.url);
        let config;
        try { config = JSON.parse(await readFile(file, 'utf8')); } catch { return; }
        const headers = Object.fromEntries(Object.entries(SECURITY_HEADERS).map(([k, v]) => [k.toLowerCase(), v]));
        config.routes = [{ src: '^/(.*)$', headers, continue: true }, ...(config.routes ?? []).filter((r) => r.src !== '^/(.*)$' || !r.headers?.['x-frame-options'])];
        await writeFile(file, JSON.stringify(config, null, '\t'));
        logger.info('En-têtes de sécurité ajoutés à la configuration Vercel');
      },
    },
  };
}
