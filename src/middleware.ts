// Protège le back-office (/admin) et son API (/api/admin) derrière la connexion de Pierre.
import { defineMiddleware } from 'astro:middleware';
import { isAdmin } from './lib/auth';

// Les réponses du back-office et des API contiennent des données personnelles : jamais en cache, jamais indexées.
const privateHeaders = async (res: Response | Promise<Response>) => {
  const r = await res;
  r.headers.set('Cache-Control', 'private, no-store');
  r.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return r;
};

export const onRequest = defineMiddleware((ctx, next) => {
  const path = ctx.url.pathname;
  const isPage = path === '/admin' || path.startsWith('/admin/');
  const isApi = path.startsWith('/api/');
  if (ctx.isPrerendered || !(isPage || isApi)) return next();
  if (path.startsWith('/admin/login') || (isApi && !path.startsWith('/api/admin/'))) return privateHeaders(next());
  if (isAdmin(ctx.cookies)) return privateHeaders(next());
  if (isApi) return new Response(JSON.stringify({ ok: false, error: 'Non connecté' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  return ctx.redirect('/admin/login?next=' + encodeURIComponent(path + ctx.url.search));
});
