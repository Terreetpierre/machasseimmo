import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Field } from '../fields';
import { EMPTY, STEPS, brief, type FieldDef, type FormState } from '../form-schema';
import '../islands.css';

type Statut = { id: string; label: string };
export type EditorClient = {
  id: number; ref: string; created_at: string; type: 'achat' | 'vente' | 'rdv'; statut: string; source: 'site' | 'manuel';
  reponses: FormState; decouverte: FormState | null; rdv: { type?: string; jour?: string; heure?: string } | null; notes: string;
};

// Libellé de chaque question, pour afficher les réponses données sur le site.
const LABELS: Record<string, string> = {};
const collect = (defs: FieldDef[]) => defs.forEach((d) => {
  if (d.kind === 'row') collect(d.fields);
  else if (d.kind === 'achatOnly') collect([d.field]);
  else if ('key' in d && 'label' in d) LABELS[d.key] ??= d.label;
});
Object.values(STEPS).forEach((s) => collect(s.fields));
LABELS.rgpd = 'Accord pour être recontacté(e)';
LABELS.payChoice = 'Souhait de contact';

// Le rendez-vous de découverte reprend le formulaire complet, sans les cases réservées au site.
const forAdmin = (defs: FieldDef[]): FieldDef[] => defs.filter((d) => d.kind !== 'consent' && d.kind !== 'info');
const sectionsFor = (mode: 'achat' | 'vente', f: FormState) =>
  mode === 'vente' ? ['vbien', 'contact'] : ['profil', 'secteur', 'bien', ...(f.projet === 'Investissement locatif' ? ['invest'] : []), 'financement', 'contact'];

const show = (v: unknown) => (Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : String(v ?? ''));
const timeFr = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function ClientEditor({ client, statuts, initialFiche }: { client: EditorClient; statuts: Statut[]; initialFiche: object }) {
  const [f, setF] = useState<FormState>({ ...EMPTY, ...client.reponses, ...(client.decouverte ?? {}) });
  const [mode, setMode] = useState<'achat' | 'vente'>(client.type === 'vente' ? 'vente' : 'achat');
  const [statut, setStatut] = useState(client.statut);
  const [notes, setNotes] = useState(client.notes);
  const [answersDirty, setAnswersDirty] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [ficheJson, setFicheJson] = useState(JSON.stringify(initialFiche, null, 2));
  const [copied, setCopied] = useState(false);
  const latest = useRef({ f, mode, statut, notes, answersDirty });
  latest.current = { f, mode, statut, notes, answersDirty };

  // Compteur de modifications : ce qui est tapé pendant un enregistrement reste « en attente ».
  const version = useRef(0);
  const set = (k: string, v: any) => { setF((s) => ({ ...s, [k]: v })); setAnswersDirty(true); setDirty(true); version.current++; };
  const touch = () => { setDirty(true); version.current++; };

  const save = async () => {
    const cur = latest.current, v = version.current;
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: cur.statut, notes: cur.notes, type: cur.mode, ...(cur.answersDirty ? { decouverte: cur.f } : {}) }),
      });
      if (res.status === 401) { location.href = '/admin/login?next=' + encodeURIComponent(location.pathname); return; }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setFicheJson(JSON.stringify(data.fiche, null, 2));
      if (version.current === v) { setDirty(false); setAnswersDirty(false); }
      setSavedAt(new Date());
    } catch {
      setError("L'enregistrement a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // Enregistrement automatique 1,5 s après la dernière modification.
  useEffect(() => {
    if (!dirty || saving) return;
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [dirty, saving, f, statut, notes, mode]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } };
    addEventListener('beforeunload', warn); addEventListener('keydown', key);
    return () => { removeEventListener('beforeunload', warn); removeEventListener('keydown', key); };
  }, [dirty]);

  const siteAnswers = useMemo(
    () => Object.entries(client.reponses).filter(([k, v]) => LABELS[k] && show(v).trim() !== ''),
    [client.reponses],
  );
  const sections = sectionsFor(mode, f);
  const nom = [f.prenom, f.nom].filter(Boolean).join(' ') || 'Nouveau client';
  const telDigits = String(f.tel || '').replace(/\D/g, '').replace(/^0/, '33');
  const status = saving ? 'Enregistrement…' : error ? 'Non enregistré' : dirty ? 'Modifications en attente…' : savedAt ? `Enregistré à ${timeFr(savedAt)}` : 'À jour';

  const copy = async () => {
    try { await navigator.clipboard.writeText(ficheJson); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* presse-papiers indisponible */ }
  };
  const download = () => {
    const u = URL.createObjectURL(new Blob([ficheJson], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = u; a.download = client.ref + '.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  const remove = async () => {
    if (!confirm(`Supprimer définitivement la fiche de ${nom} ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' });
    if (res.ok) { setDirty(false); location.href = '/admin'; }
  };

  return (
    <div class="ce">
      <div class="ce-head">
        <a href="/admin" class="ce-back">← Tous les clients</a>
        <h1 class="heading">{nom}</h1>
        <p class="ce-meta">
          {client.ref} · reçu le {new Date(client.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          {client.source === 'manuel' ? ' · ajouté à la main' : ' · via le site'}
        </p>
        <div class="ce-actions">
          {f.tel && <a class="pill pill-accent" href={`tel:${f.tel.replace(/\s/g, '')}`}>Appeler {f.tel}</a>}
          {f.tel && <a class="pill pill-sage" href={`https://wa.me/${telDigits}`} target="_blank" rel="noopener">WhatsApp</a>}
          {f.email && <a class="pill pill-outline" href={`mailto:${f.email}`}>{f.email}</a>}
        </div>
      </div>

      <div class="ce-grid">
        <aside class="ce-side">
          <section class="ce-card">
            <h2>Statut</h2>
            <div class="ce-statuts">
              {statuts.map((s) => (
                <button type="button" key={s.id} class={'badge st-' + s.id + (statut === s.id ? ' on' : '')} aria-pressed={statut === s.id} onClick={() => { setStatut(s.id); touch(); }}>{s.label}</button>
              ))}
            </div>
          </section>

          {client.rdv && (
            <section class="ce-card ce-rdv">
              <h2>Rendez-vous demandé</h2>
              <p>{client.rdv.type} — {client.rdv.jour} à {client.rdv.heure}</p>
            </section>
          )}

          <section class="ce-card">
            <h2>Mes notes</h2>
            <textarea class="f-input f-textarea ce-notes" rows={6} value={notes} placeholder="Ressenti de l'appel, prochaines étapes, biens déjà proposés…" onInput={(e) => { setNotes((e.target as HTMLTextAreaElement).value); touch(); }} />
          </section>

          <section class="ce-card ce-claude">
            <h2>Fiche pour Claude</h2>
            {mode === 'achat' && <p class="ce-brief">{brief(f)}</p>}
            <p class="ce-help">Claude lit cette fiche (réponses du client + votre découverte + statut + notes) pour chercher les annonces.</p>
            <div class="ce-btns">
              <button type="button" class="pill pill-outline" onClick={copy}>{copied ? 'Copiée ✓' : 'Copier la fiche'}</button>
              <button type="button" class="pill pill-outline" onClick={download}>Télécharger (.json)</button>
            </div>
          </section>

          {siteAnswers.length > 0 && (
            <details class="ce-card ce-site">
              <summary><h2>Réponses données sur le site</h2></summary>
              <dl>
                {siteAnswers.map(([k, v]) => <div key={k}><dt>{LABELS[k]}</dt><dd>{show(v)}</dd></div>)}
              </dl>
            </details>
          )}

          <button type="button" class="ce-delete" onClick={remove}>Supprimer ce client</button>
        </aside>

        <div class="ce-main">
          <div class="ce-main-head">
            <div>
              <h2 class="heading">Rendez-vous de découverte</h2>
              <p>Les réponses du client sont déjà remplies : complétez ou corrigez-les pendant l'appel. Tout s'enregistre automatiquement.</p>
            </div>
            <div class="pf-mode" role="group" aria-label="Type de projet">
              <button type="button" class={mode === 'achat' ? 'on' : ''} aria-pressed={mode === 'achat'} onClick={() => { setMode('achat'); touch(); }}>Achat</button>
              <button type="button" class={mode === 'vente' ? 'on' : ''} aria-pressed={mode === 'vente'} onClick={() => { setMode('vente'); touch(); }}>Vente</button>
            </div>
          </div>
          <nav class="ce-toc" aria-label="Sections">
            {sections.map((k) => <a key={k} href={`#s-${k}`}>{STEPS[k].title}</a>)}
          </nav>
          {sections.map((k) => (
            <section key={k} id={`s-${k}`} class="ce-section">
              <h3 class="heading">{STEPS[k].title}</h3>
              <div class="pf-fields">
                {forAdmin(STEPS[k].fields).map((d, i) => <Field key={k + i} def={d} ctx={{ f, err: {}, set, mode }} />)}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div class={'ce-bar' + (error ? ' err' : dirty || saving ? ' busy' : '')} role="status">
        <span>{error || status}</span>
        <button type="button" class="pill pill-accent" disabled={saving || !dirty} onClick={save}>Enregistrer</button>
      </div>
    </div>
  );
}
