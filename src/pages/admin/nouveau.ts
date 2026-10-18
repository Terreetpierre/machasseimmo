// « Nouveau client » : crée une fiche vide (client venu par téléphone, bouche-à-oreille…) et l'ouvre.
import type { APIRoute } from 'astro';
import { insertClient } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const type = form.get('type') === 'vente' ? 'vente' : 'achat';
  const { id } = await insertClient({ ref: 'CLI-' + String(Date.now()).slice(-6), type, source: 'manuel', reponses: {} });
  return redirect(`/admin/client/${id}`, 303);
};
