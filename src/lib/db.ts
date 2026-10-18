// Base de données du back-office (Postgres, ex. Neon via le Marketplace Vercel).
// La table est créée automatiquement au premier appel.
import postgres from 'postgres';
import { EMPTY, fiche, type FormState } from '../islands/form-schema';

export const STATUTS = [
  { id: 'nouveau', label: 'Nouveau' },
  { id: 'a_rappeler', label: 'À rappeler' },
  { id: 'decouverte', label: 'Découverte faite' },
  { id: 'recherche', label: 'Recherche active' },
  { id: 'offre', label: 'Offre en cours' },
  { id: 'achete', label: 'Acheté / vendu' },
  { id: 'perdu', label: 'Sans suite' },
] as const;
export type Statut = (typeof STATUTS)[number]['id'];
export type Kind = 'achat' | 'vente' | 'rdv';

export type ClientRow = {
  id: number;
  ref: string;
  created_at: Date;
  updated_at: Date;
  type: Kind;
  statut: Statut;
  source: 'site' | 'manuel';
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  reponses: FormState;
  decouverte: FormState | null;
  rdv: { type?: string; jour?: string; heure?: string } | null;
  notes: string;
};

const env = (k: string) => (import.meta.env[k] as string | undefined) ?? process.env[k];
const url = () => env('DATABASE_URL') || env('POSTGRES_URL');
export const hasDb = () => !!url();

let _sql: postgres.Sql | null = null;
let _ready: Promise<unknown> | null = null;

async function db() {
  if (!_sql) {
    const u = url();
    if (!u) throw new Error('DATABASE_URL manquante');
    _sql = postgres(u, { max: 1, prepare: false, idle_timeout: 20, ssl: /localhost|127\.0\.0\.1/.test(u) ? false : 'require' });
  }
  _ready ??= _sql`
    create table if not exists clients (
      id serial primary key,
      ref text unique not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      type text not null default 'achat',
      statut text not null default 'nouveau',
      source text not null default 'site',
      prenom text not null default '',
      nom text not null default '',
      email text not null default '',
      tel text not null default '',
      reponses jsonb not null default '{}',
      decouverte jsonb,
      rdv jsonb,
      notes text not null default ''
    )`.then(() => _sql!`
    create table if not exists rate_limits (
      key text not null,
      at timestamptz not null default now()
    )`).then(() => _sql!`create index if not exists rate_limits_key_at on rate_limits (key, at)`).catch((e) => { _ready = null; throw e; });
  await _ready;
  return _sql;
}

const contactOf = (f: FormState) => ({
  prenom: String(f.prenom ?? '').trim(),
  nom: String(f.nom ?? '').trim(),
  email: String(f.email ?? '').trim(),
  tel: String(f.tel ?? '').trim(),
});

export async function insertClient(c: { ref: string; type: Kind; source?: 'site' | 'manuel'; reponses: FormState; rdv?: ClientRow['rdv'] }) {
  const sql = await db();
  // Les références sont courtes (6 chiffres) : en cas de doublon, on ajoute un suffixe.
  for (let i = 0; i < 5; i++) {
    const ref = i ? `${c.ref}-${Math.random().toString(36).slice(2, 5).toUpperCase()}` : c.ref;
    const [row] = await sql<{ id: number; ref: string }[]>`
      insert into clients ${sql({ ref, type: c.type, source: c.source ?? 'site', ...contactOf(c.reponses), reponses: sql.json(c.reponses), rdv: c.rdv ? sql.json(c.rdv) : null })}
      on conflict (ref) do nothing
      returning id, ref`;
    if (row) return row;
  }
  throw new Error('Référence en double');
}

export async function listClients(): Promise<ClientRow[]> {
  const sql = await db();
  return sql<ClientRow[]>`select * from clients order by created_at desc`;
}

export async function getClient(id: number): Promise<ClientRow | null> {
  const sql = await db();
  const [row] = await sql<ClientRow[]>`select * from clients where id = ${id}`;
  return row ?? null;
}

export async function updateClient(id: number, p: { statut?: Statut; notes?: string; type?: Kind; decouverte?: FormState }) {
  const sql = await db();
  const set: Record<string, unknown> = { updated_at: new Date() };
  if (p.statut && STATUTS.some((s) => s.id === p.statut)) set.statut = p.statut;
  if (typeof p.notes === 'string') set.notes = p.notes;
  if (p.type === 'achat' || p.type === 'vente') set.type = p.type;
  if (p.decouverte) Object.assign(set, contactOf(p.decouverte), { decouverte: sql.json(p.decouverte) });
  const [row] = await sql<ClientRow[]>`update clients set ${sql(set)} where id = ${id} returning *`;
  return row ?? null;
}

export async function deleteClient(id: number) {
  const sql = await db();
  await sql`delete from clients where id = ${id}`;
}

/** Réponses à jour : celles du rendez-vous de découverte si Pierre les a complétées, sinon celles du site. */
export const answers = (c: ClientRow): FormState => ({ ...EMPTY, ...c.reponses, ...(c.decouverte ?? {}) });

export const mode = (c: ClientRow): 'achat' | 'vente' => (c.type === 'vente' ? 'vente' : 'achat');

/** Fiche de recherche complète, lue par Claude. */
export function ficheClaude(c: ClientRow) {
  // « validation » ne concerne que le formulaire du site : inutile une fois le client dans le back-office.
  const { validation: _v, formulaire: _f, ...f } = fiche(c.ref, mode(c), true, answers(c)) as Record<string, unknown>;
  return {
    id: c.id,
    ...f,
    date_creation: c.created_at,
    mis_a_jour: c.updated_at,
    statut: c.statut,
    statut_libelle: STATUTS.find((s) => s.id === c.statut)?.label ?? c.statut,
    decouverte_faite: !!c.decouverte,
    rendez_vous_demande: c.rdv,
    notes_pierre: c.notes || null,
  };
}

/**
 * Limite de fréquence partagée entre toutes les instances Vercel (stockée en base).
 * Enregistre un essai pour `key` et indique si la limite `max` est dépassée sur `windowSec` secondes.
 */
export async function rateLimited(key: string, max: number, windowSec: number) {
  const sql = await db();
  await sql`delete from rate_limits where at < now() - interval '1 day'`;
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from rate_limits where key = ${key} and at > now() - ${windowSec} * interval '1 second'`;
  if (n >= max) return true;
  await sql`insert into rate_limits (key) values (${key})`;
  return false;
}

export async function clearRateLimit(key: string) {
  const sql = await db();
  await sql`delete from rate_limits where key = ${key}`;
}

/** Test de la base pour la page Diagnostic : renvoie le nombre de fiches clients. */
export async function compterClients() {
  const sql = await db();
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from clients`;
  return n;
}
