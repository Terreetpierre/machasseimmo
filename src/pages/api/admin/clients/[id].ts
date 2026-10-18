// Mise à jour d'un client depuis le back-office (statut, notes, réponses du rendez-vous de découverte).
import type { APIRoute } from 'astro';
import { deleteClient, ficheClaude, updateClient } from '../../../../lib/db';

export const prerender = false;

const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json(400, { ok: false });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json(400, { ok: false });
  const row = await updateClient(id, {
    statut: body.statut,
    notes: typeof body.notes === 'string' ? body.notes.slice(0, 20000) : undefined,
    type: body.type,
    decouverte: body.decouverte && typeof body.decouverte === 'object' ? body.decouverte : undefined,
  });
  if (!row) return json(404, { ok: false, error: 'Client introuvable' });
  return json(200, { ok: true, updated_at: row.updated_at, fiche: ficheClaude(row) });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json(400, { ok: false });
  await deleteClient(id);
  return json(200, { ok: true });
};
