// Connexion au back-office (un seul compte : Pierre) et accès de Claude par clé.
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];
export const COOKIE = 'tci_admin';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

const secret = () => env('SESSION_SECRET') || env('ADMIN_PASSWORD') || '';
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const adminConfigured = () => !!env('ADMIN_PASSWORD');

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
