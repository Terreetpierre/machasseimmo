// Connexion au back-office (un seul compte : Pierre) et accès de Claude par clé.
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies, AstroGlobal, APIContext } from 'astro';

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];
export const COOKIE = 'tci_admin';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

const secret = () => env('SESSION_SECRET') || env('ADMIN_PASSWORD') || '';
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// Mot de passe d'au moins 12 caractères exigé : en dessous, le back-office reste fermé.
export const MIN_PASSWORD = 12;
export const adminConfigured = () => (env('ADMIN_PASSWORD') ?? '').length >= MIN_PASSWORD;

/** Adresse IP du visiteur, telle que transmise par Vercel. */
export const clientIp = (request: Request) =>
  request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'inconnue';

export const checkPassword = (pw: string) => adminConfigured() && same(pw, env('ADMIN_PASSWORD')!);

export function openSession(cookies: AstroCookies, secure: boolean) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  cookies.set(COOKIE, `${exp}.${sign(exp)}`, { path: '/', httpOnly: true, secure, sameSite: 'lax', maxAge: MAX_AGE });
}

export const closeSession = (cookies: AstroCookies) => cookies.delete(COOKIE, { path: '/' });

export function isAdmin(cookies: AstroCookies) {
  if (!adminConfigured()) return false;
  const [exp, sig] = (cookies.get(COOKIE)?.value ?? '').split('.');
  return !!exp && !!sig && Number(exp) > Date.now() / 1000 && same(sig, sign(exp));
}

/** Clé d'accès de Claude : en-tête « Authorization: Bearer <CLAUDE_API_TOKEN> ». */
export function isClaude(request: Request) {
  const token = env('CLAUDE_API_TOKEN');
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  return !!token && token.length >= 24 && same(given, token);
}

/** Garde à placer en tête de chaque route du back-office (en plus du middleware). */
export function requireAdmin(ctx: Pick<APIContext, 'cookies'> | AstroGlobal) {
  if (isAdmin(ctx.cookies)) return null;
  return new Response(JSON.stringify({ ok: false, error: 'Non connecté' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
}
