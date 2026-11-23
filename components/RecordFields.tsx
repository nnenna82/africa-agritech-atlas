"use client";

// The input fields for one kind of record. Used by the suggestion form and the owner's review page.

import { useId } from "react";
import type { CountryLite } from "@/lib/scope";
import { FIELDS, type Field, type RecordType, type Values } from "@/lib/suggest";

export const inputCls =
  "min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-[15px] text-fg placeholder:text-muted";
const labelCls = "block text-sm font-medium";

export default function RecordFields({
  type,
  values,
  onChange,
  countries,
  requireAll = true,
}: {
  type: RecordType;
  values: Values;
  onChange: (v: Values) => void;
  countries: CountryLite[];
  /** Corrections only need the fields that change, so nothing is required. */
  requireAll?: boolean;
}) {
  const set = (k: string, v: string | boolean | string[]) => onChange({ ...values, [k]: v });
  return (
    <div className="space-y-4">
      {FIELDS[type].map((f) => (
        <FieldInput
          key={f.key}
          f={f}
          value={values[f.key]}
          set={(v) => set(f.key, v)}
          countries={countries}
          required={requireAll && !!f.required}
        />
      ))}
    </div>
  );
}

function FieldInput({
  f,
  value,
  set,
  countries,
  required,
}: {
  f: Field;
  value: string | boolean | string[] | undefined;
  set: (v: string | boolean | string[]) => void;
  countries: CountryLite[];
  required: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const label = (
    <>
      {f.label}
      {required ? <span className="text-muted"> (required)</span> : null}
    </>
  );
  const hint = f.hint ? (
    <p id={hintId} className="mt-1 text-xs text-muted">
      {f.hint}
    </p>
  ) : null;
  const describedBy = f.hint ? hintId : undefined;
  const str = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? value : [];

  if (f.kind === "checkbox")
    return (
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={value === true} onChange={(e) => set(e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
        {f.label}
      </label>
    );

  if (f.kind === "textarea" || f.kind === "links")
    return (
      <div>
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
        {hint}
        <textarea
          id={id}
          rows={f.kind === "links" ? 2 : 3}
          value={str}
          required={required}
          maxLength={1500}
          aria-describedby={describedBy}
          onChange={(e) => set(e.target.value)}
          className={`${inputCls} mt-1`}
        />
      </div>
    );

  if (f.kind === "select" || f.kind === "country")
    return (
      <div>
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
        {hint}
        <select id={id} value={str} required={required} aria-describedby={describedBy} onChange={(e) => set(e.target.value)} className={`${inputCls} mt-1`}>
          <option value="">Choose…</option>
          {f.kind === "country" ? (
            <>
              {f.continental ? <option value="AU">Continental (all of Africa)</option> : null}
              {countries.map((c) => (
                <option key={c.iso3} value={c.iso3}>
                  {c.name}
                </option>
              ))}
            </>
          ) : (
            f.options?.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))
          )}
        </select>
      </div>
    );

  if (f.kind === "countries" || f.kind === "tags") {
    const opts = f.kind === "countries" ? countries.map((c) => ({ v: c.iso3, l: c.name })) : (f.options ?? []).map((o) => ({ v: o, l: o }));
    const name = (v: string) => opts.find((o) => o.v === v)?.l ?? v;
    return (
      <fieldset>
        <legend className={labelCls}>{label}</legend>
        {list.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {list.map((v) => (
              <li key={v}>
                <button
                  type="button"
                  onClick={() => set(list.filter((x) => x !== v))}
                  className="inline-flex min-h-9 items-center gap-1 rounded-full bg-accent-soft px-3 text-sm"
                  aria-label={`Remove ${name(v)}`}
                >
                  {name(v)} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <select
          aria-label={`Add to ${f.label.toLowerCase()}`}
          value=""
          onChange={(e) => e.target.value && set([...list, e.target.value])}
          className={`${inputCls} mt-2`}
        >
          <option value="">{f.kind === "countries" ? "Add a country…" : "Add one…"}</option>
          {opts
            .filter((o) => !list.includes(o.v))
            .map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
        </select>
      </fieldset>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {hint}
      <input
        id={id}
        type={f.kind === "number" ? "number" : f.kind === "url" ? "url" : "text"}
        inputMode={f.kind === "number" ? "numeric" : undefined}
        placeholder={f.kind === "url" ? "https://" : undefined}
        value={str}
        required={required}
        maxLength={f.kind === "number" ? undefined : 500}
        min={f.kind === "number" ? 1800 : undefined}
        max={f.kind === "number" ? 2100 : undefined}
        aria-describedby={describedBy}
        onChange={(e) => set(e.target.value)}
        className={`${inputCls} mt-1`}
      />
    </div>
  );
}
