import type { APIRoute } from 'astro';
import { closeSession } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  closeSession(cookies);
  return redirect('/admin/login', 303);
};
