// Accès de Claude aux fiches de recherche (lecture seule).
// GET /api/claude/clients            → toutes les fiches
// GET /api/claude/clients?statut=recherche&type=achat
// En-tête requis : Authorization: Bearer <CLAUDE_API_TOKEN>
import type { APIRoute } from 'astro';
import { isClaude } from '../../../lib/auth';
import { ficheClaude, listClients } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  if (!isClaude(request)) return new Response(JSON.stringify({ ok: false, error: 'Clé invalide' }), { status: 401 });
  const statut = url.searchParams.get('statut');
  const type = url.searchParams.get('type');
  const rows = (await listClients()).filter((c) => (!statut || c.statut === statut) && (!type || c.type === type));
  return new Response(JSON.stringify({ ok: true, total: rows.length, clients: rows.map(ficheClaude) }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
