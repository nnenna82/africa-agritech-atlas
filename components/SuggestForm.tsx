"use client";

// "Suggest an addition or correction". The suggestion is saved with status "pending";
// nothing appears on the site until the owner approves it on /admin.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { CountryLite } from "@/lib/scope";
import { FIELDS, RECORD_TYPES, looksPrivate, toRecord, type RecordType, type Values } from "@/lib/suggest";
import RecordFields, { inputCls } from "./RecordFields";

export type RecordIndex = Record<RecordType, { id: string; label: string }[]>;

const isType = (t: string | null): t is RecordType => RECORD_TYPES.some((r) => r.key === t);

export default function SuggestForm({ countries, index }: { countries: CountryLite[]; index: RecordIndex }) {
  const params = useSearchParams();
  const startType = isType(params.get("type")) ? (params.get("type") as RecordType) : "people";
  const startTarget = params.get("id") ?? "";
  const startCountry = countries.some((c) => c.iso3 === params.get("country")) ? (params.get("country") as string) : "";

  const [type, setType] = useState<RecordType>(startType);
  const [kind, setKind] = useState<"addition" | "correction">(startTarget ? "correction" : "addition");
  const [target, setTarget] = useState(startTarget);
  const [values, setValues] = useState<Values>(() => presetCountry(startType, startCountry));
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const changeType = (t: RecordType) => {
    setType(t);
    setTarget("");
    setValues(presetCountry(t, startCountry));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const data = toRecord(type, values);
    if (trap) return setState("sent"); // a hidden field only robots fill in
    if (!/^https?:\/\/\S+\.\S+/i.test(source.trim()))
      return setError("Please add a link (starting with https://) to a public page that confirms this.");
    if (kind === "correction" && !target) return setError("Please choose the record you want to correct.");
    if (kind === "correction" && !Object.keys(data).length && !note.trim())
      return setError("Please fill in what should change, or describe it in the note.");
    if (type === "people" && looksPrivate(JSON.stringify(data) + note))
      return setError(
        "This looks like it includes a personal email or phone number. The Atlas only lists public professional information, so please remove it.",
      );
    const db = supabase();
    if (!db) return setError("Suggestions cannot be sent right now. Please try again later.");
    setState("sending");
    const { error: err } = await db.from("suggestions").insert({
      record_type: type,
      kind,
      target_id: kind === "correction" ? target : null,
      data,
      source_url: source.trim(),
      note: note.trim() || null,
    });
    if (err) {
      setState("idle");
      setError("Sorry, that did not go through. Please check the link and try again.");
      return;
    }
    setState("sent");
  }

  if (state === "sent")
    return (
      <div className="mt-8 rounded-xl border border-line bg-surface p-6" role="status">
        <h2 className="font-display text-2xl font-bold">Thank you. Your suggestion is waiting for review.</h2>
        <p className="mt-2 text-muted">
          The Atlas owner will check the source. If it holds up, it will appear on the site. You will not be contacted.
        </p>
        <p className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setState("idle");
              setValues(presetCountry(type, startCountry));
              setSource("");
              setNote("");
              setTarget("");
            }}
            className="min-h-11 rounded-md border border-line px-4 font-medium"
          >
            Suggest something else
          </button>
          <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-2">
            Back to Home
          </Link>
        </p>
      </div>
    );

  const typeInfo = RECORD_TYPES.find((r) => r.key === type)!;
  return (
    <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6" noValidate={false}>
      <fieldset>
        <legend className="text-sm font-medium">What would you like to do?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              ["addition", "Add something new"],
              ["correction", "Correct something"],
            ] as const
          ).map(([k, l]) => (
            <label
              key={k}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium ${
                kind === k ? "border-accent bg-accent-soft" : "border-line bg-surface"
              }`}
            >
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="accent-[var(--accent)]" />
              {l}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="s-type" className="block text-sm font-medium">
          Type of record
        </label>
        <select id="s-type" value={type} onChange={(e) => changeType(e.target.value as RecordType)} className={`${inputCls} mt-1`}>
          {RECORD_TYPES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {kind === "correction" ? (
        <div>
          <label htmlFor="s-target" className="block text-sm font-medium">
            Which {typeInfo.one}? <span className="text-muted">(required)</span>
          </label>
          <select id="s-target" value={target} required onChange={(e) => setTarget(e.target.value)} className={`${inputCls} mt-1`}>
            <option value="">Choose…</option>
            {index[type].map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <p className="mt-2 rounded bg-gold-soft px-3 py-2 text-sm">
            Fill in <b>only the fields that should change</b>. Leave the rest empty and they stay as they are.
          </p>
        </div>
      ) : null}

      <RecordFields type={type} values={values} onChange={setValues} countries={countries} requireAll={kind === "addition"} />

      <div>
        <label htmlFor="s-source" className="block text-sm font-medium">
          Link that confirms this <span className="text-muted">(required)</span>
        </label>
        <p id="s-source-hint" className="mt-1 text-xs text-muted">
          A public page, such as a news article, official website or report. The owner checks it before approving.
        </p>
        <input
          id="s-source"
          type="url"
          required
          placeholder="https://"
          value={source}
          maxLength={900}
          aria-describedby="s-source-hint"
          onChange={(e) => setSource(e.target.value)}
          className={`${inputCls} mt-1`}
        />
      </div>

      <div>
        <label htmlFor="s-note" className="block text-sm font-medium">
          Note for the owner <span className="text-muted">(optional)</span>
        </label>
        <textarea id="s-note" rows={2} value={note} maxLength={1500} onChange={(e) => setNote(e.target.value)} className={`${inputCls} mt-1`} />
      </div>

      {/* Hidden from people; robots that fill every field get politely ignored. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-gold bg-gold-soft p-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending"}
          className="min-h-11 rounded-md bg-accent px-5 font-medium text-surface disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send suggestion"}
        </button>
        <span className="text-xs text-muted">Public information only: no personal emails or phone numbers.</span>
      </div>
    </form>
  );
}

/** Start the country field with the country the visitor came from (for example from a country page). */
function presetCountry(type: RecordType, iso: string): Values {
  if (!iso) return {};
  const f = FIELDS[type].find((x) => x.kind === "countries" || x.kind === "country");
  if (!f) return {};
  return { [f.key]: f.kind === "countries" ? [iso] : iso };
}
