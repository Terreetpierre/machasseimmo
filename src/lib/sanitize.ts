// Nettoyage des réponses de formulaire avant enregistrement.
import { EMPTY, type FormState } from '../islands/form-schema';

/** Garde uniquement les réponses connues du formulaire, avec des longueurs raisonnables. */
export function cleanAnswers(r: unknown): FormState {
  const out: FormState = {};
  if (!r || typeof r !== 'object') return out;
  for (const [k, v] of Object.entries(r as Record<string, unknown>)) {
    if (!(k in EMPTY)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 2000);
    else if (typeof v === 'boolean') out[k] = v;
    else if (Array.isArray(v)) out[k] = v.filter((x) => typeof x === 'string').slice(0, 40).map((x) => x.slice(0, 200));
  }
  return out;
}
