import type { ComponentChildren } from 'preact';
import { formatInput, type FieldDef, type FormState } from './form-schema';

type Ctx = { f: FormState; err: Record<string, string>; set: (k: string, v: any) => void; mode: 'achat' | 'vente' };

export function Err({ msg }: { msg?: string }) {
  return msg ? <span class="f-err" role="alert">{msg}</span> : null;
}

export function Chips({ label, hint, opts, value, multi, onPick, error, large }: {
  label: string; hint?: string; opts: string[]; value: string | string[]; multi?: boolean; onPick: (o: string) => void; error?: string; large?: boolean;
}) {
  return (
    <div class="f-group" role="group" aria-label={label}>
      <span class="f-glabel">{label} {hint && <span class="f-hint">{hint}</span>}</span>
      <div class="f-chips">
        {opts.map((o) => {
          const sel = multi ? (value as string[]).includes(o) : value === o;
          return (
            <button key={o} type="button" class={'f-chip' + (sel ? ' on' : '') + (large ? ' lg' : '')} aria-pressed={sel} onClick={() => onPick(o)}>{o}</button>
          );
        })}
      </div>
      <Err msg={error} />
    </div>
  );
}

export function TextField({ label, children, error }: { label: string; children: ComponentChildren; error?: string }) {
  return (
    <label class="f-field">
      <span class="f-label">{label}</span>
      {children}
      <Err msg={error} />
    </label>
  );
}

export function Field({ def, ctx }: { def: FieldDef; ctx: Ctx }) {
  const { f, err, set } = ctx;
  switch (def.kind) {
    case 'chips': {
      const pick = (o: string) => {
        if (!def.multi) return set(def.key, o);
        const a: string[] = f[def.key] || [];
        set(def.key, a.includes(o) ? a.filter((x) => x !== o) : [...a, o]);
      };
      return <Chips label={def.label} hint={def.hint} opts={def.opts} value={f[def.key] ?? (def.multi ? [] : '')} multi={def.multi} onPick={pick} error={err[def.key]} />;
    }
    case 'input':
      return (
        <TextField label={def.label} error={err[def.key]}>
          <input class="f-input" value={f[def.key]} placeholder={def.placeholder} inputMode={def.inputMode} type={(def.type || 'text') as 'text' /* Preact 11 rejette une union ici */} autoComplete={def.autoComplete} aria-invalid={!!err[def.key]}
            onInput={(e) => set(def.key, formatInput(def.key, (e.target as HTMLInputElement).value))} />
        </TextField>
      );
    case 'select':
      return (
        <TextField label={def.label} error={err[def.key]}>
          <select class="f-input" value={f[def.key]} onChange={(e) => set(def.key, (e.target as HTMLSelectElement).value)}>
            {def.opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}
          </select>
        </TextField>
      );
    case 'textarea':
      return (
        <TextField label={def.label} error={err[def.key]}>
          <textarea class="f-input f-textarea" rows={3} value={f[def.key]} placeholder={def.placeholder} onInput={(e) => set(def.key, (e.target as HTMLTextAreaElement).value)} />
        </TextField>
      );
    case 'row':
      return <div class="f-row" style={{ '--min': def.min + 'px' }}>{def.fields.map((d, i) => <Field key={i} def={d} ctx={ctx} />)}</div>;
    case 'consent':
      return (
        <div class="f-consent-wrap">
          <label class="f-consent">
            <input type="checkbox" checked={!!f[def.key]} onChange={(e) => set(def.key, (e.target as HTMLInputElement).checked)} />
            {def.text}
          </label>
          <Err msg={err[def.key]} />
        </div>
      );
    case 'info':
      return <div class="f-info">{def.text}</div>;
    case 'achatOnly':
      return ctx.mode === 'achat' ? <Field def={def.field} ctx={ctx} /> : null;
  }
}
