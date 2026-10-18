// Protège le back-office (/admin) et son API (/api/admin) derrière la connexion de Pierre.
import { defineMiddleware } from 'astro:middleware';
import { isAdmin } from './lib/auth';

export const onRequest = defineMiddleware((ctx, next) => {
  const path = ctx.url.pathname;
  const isPage = path === '/admin' || path.startsWith('/admin/');
  const isApi = path.startsWith('/api/admin/');
  if (ctx.isPrerendered || !(isPage || isApi) || path.startsWith('/admin/login')) return next();
  if (isAdmin(ctx.cookies)) return next();
  if (isApi) return new Response(JSON.stringify({ ok: false, error: 'Non connecté' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  return ctx.redirect('/admin/login?next=' + encodeURIComponent(path + ctx.url.search));
});
