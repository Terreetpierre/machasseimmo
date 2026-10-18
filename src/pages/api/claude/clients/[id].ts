// Fiche de recherche d'un client pour Claude (lecture seule). Même clé que /api/claude/clients.
import type { APIRoute } from 'astro';
import { isClaude } from '../../../../lib/auth';
import { ficheClaude, getClient } from '../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ request, params }) => {
  if (!isClaude(request)) return new Response(JSON.stringify({ ok: false, error: 'Clé invalide' }), { status: 401 });
  const c = await getClient(Number(params.id));
  if (!c) return new Response(JSON.stringify({ ok: false, error: 'Client introuvable' }), { status: 404 });
  return new Response(JSON.stringify({ ok: true, client: ficheClaude(c) }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
