// Délai de rappel : 24 h hors week-end, du lundi au vendredi de 9 h à 18 h (heure de Paris).
// Règle : le rappel est dû le jour ouvré suivant la demande, à la même heure ramenée entre 9 h et 18 h.
// Ex. vendredi 17 h → lundi 17 h ; lundi 20 h → mardi 18 h ; samedi → lundi 18 h.

const TZ = 'Europe/Paris';
const OUVERTURE = 9, FERMETURE = 18;

/** Composantes de la date à l'heure de Paris. */
function paris(d: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' })
      .formatToParts(d).map((p) => [p.type, p.value]),
  );
  return { y: +parts.year, m: +parts.month, d: +parts.day, h: +parts.hour, min: +parts.minute, wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday) };
}

/** Date UTC correspondant à une heure locale de Paris (gère l'heure d'été). */
function fromParis(y: number, m: number, d: number, h: number, min: number) {
  const guess = new Date(Date.UTC(y, m - 1, d, h, min));
  const p = paris(guess);
  const diff = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - guess.getTime();
  return new Date(guess.getTime() - diff);
}

/** Échéance de rappel d'une demande reçue à `recu`. */
export function echeanceRappel(recu: Date) {
  const p = paris(recu);
  const weekend = p.wd === 0 || p.wd === 6;
  let h = weekend ? FERMETURE : Math.min(Math.max(p.h, OUVERTURE), FERMETURE);
  let min = weekend || p.h >= FERMETURE ? 0 : p.h < OUVERTURE ? 0 : p.min;
  if (h === FERMETURE) min = 0;
  // Jour ouvré suivant (calcul sur la date civile de Paris).
  const jour = new Date(Date.UTC(p.y, p.m - 1, p.d));
  do jour.setUTCDate(jour.getUTCDate() + 1); while (jour.getUTCDay() === 0 || jour.getUTCDay() === 6);
  return fromParis(jour.getUTCFullYear(), jour.getUTCMonth() + 1, jour.getUTCDate(), h, min);
}

/** « lundi 20 octobre à 17 h 00 » */
export const formatEcheance = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(d) +
  ' à ' + new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(d).replace(':', ' h ');
