"use client";

// The owner's review page. Log in with a link sent by email, then approve or reject suggestions.
// The database itself checks that the person logged in is the owner; this page only shows the result.

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { refreshAtlas } from "@/app/admin/actions";
import { date, host } from "@/lib/format";
import type { CountryLite } from "@/lib/scope";
import { RECORD_TYPES, recordLabel, toRecord, toValues, type RecordType, type Values } from "@/lib/suggest";
import { supabase } from "@/lib/supabase";
import type { RecordIndex } from "./SuggestForm";
import RecordFields, { inputCls } from "./RecordFields";

type Suggestion = {
  id: number;
  record_type: RecordType;
  kind: "addition" | "correction";
  target_id: string | null;
  data: Record<string, unknown>;
  source_url: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  result_id: string | null;
};

const PAGE: Record<RecordType, string> = {
  people: "/people",
  startups: "/startups",
  organizations: "/organizations",
  policies: "/regulation",
  gaps: "/gaps",
  benchmarks: "/global",
};

const btn = "min-h-11 rounded-md px-4 text-sm font-medium";

export default function AdminPanel({ countries, index }: { countries: CountryLite[]; index: RecordIndex }) {
  const db = supabase();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [owner, setOwner] = useState<boolean | null>(null);

  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!db || !session) return;
    db.rpc("is_owner").then(({ data }) => setOwner(data === true));
  }, [db, session]);

  if (!db) return <p className="mt-6 text-muted">The admin page needs the Supabase settings, which this copy of the site does not have.</p>;
  if (session === undefined) return <p className="mt-6 text-muted">Checking whether you are logged in…</p>;
  if (!session) return <Login />;

  const signOut = () => {
    db.auth.signOut();
    setOwner(null);
  };
  return (
    <>
      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
        Logged in as <b className="text-fg">{session.user.email}</b>
        <button type="button" onClick={signOut} className={`${btn} border border-line text-fg`}>
          Log out
        </button>
      </p>
      {owner === null ? (
        <p className="mt-6 text-muted">Checking access…</p>
      ) : owner ? (
        <Review session={session} countries={countries} index={index} />
      ) : (
        <p className="mt-6 rounded-lg bg-gold-soft p-4">
          This account is not the Atlas owner, so it cannot review suggestions. If you are the owner, log out and use
          your owner email.
        </p>
      )}
    </>
  );
}

/** An expired or already-used login link comes back with an error in the address. */
function linkError(): string | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search.slice(1));
  const d = p.get("error_description");
  return d ? `That login link did not work (${d.replace(/\+/g, " ")}). Links work once and expire after an hour. Please ask for a new one below.` : null;
}

function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(linkError);
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await supabase()!.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setBusy(false);
    if (err) setError(`That did not work: ${err.message}`);
    else setSent(true);
  }

  if (sent)
    return (
      <p className="mt-6 max-w-xl rounded-lg bg-accent-soft p-4" role="status">
        <b>Check your email.</b> We sent a login link to {email}. Open it on this device; it brings you back here,
        logged in. The link works once and expires after an hour.
      </p>
    );
  return (
    <form onSubmit={send} className="mt-6 max-w-md space-y-3">
      <label htmlFor="a-email" className="block text-sm font-medium">
        Owner email
      </label>
      <input
        id="a-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputCls}
      />
      {error ? (
        <p role="alert" className="rounded bg-gold-soft p-2 text-sm">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} className={`${btn} bg-accent text-surface disabled:opacity-60`}>
        {busy ? "Sending…" : "Email me a login link"}
      </button>
      <p className="text-xs text-muted">
        No password. Only the owner&rsquo;s email can review suggestions. Open the emailed link in the same browser
        you asked from (on a phone, use &ldquo;Open in browser&rdquo; if your email app shows its own window).
      </p>
    </form>
  );
}

function Review({ session, countries, index }: { session: Session; countries: CountryLite[]; index: RecordIndex }) {
  const db = supabase()!;
  const [rows, setRows] = useState<Suggestion[] | null>(null);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error: err } = await db.from("suggestions").select("*").order("created_at", { ascending: false }).limit(300);
    if (err) setError(err.message);
    else setRows(data as Suggestion[]);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p role="alert" className="mt-6 text-sm">Could not load suggestions: {error}</p>;
  if (!rows) return <p className="mt-6 text-muted">Loading suggestions…</p>;
  const shown = rows.filter((r) => r.status === tab);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Show">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
              tab === t ? "border-accent bg-accent text-surface" : "border-line bg-surface text-fg"
            }`}
          >
            {t === "pending" ? "Waiting" : t === "approved" ? "Approved" : "Rejected"} ({rows.filter((r) => r.status === t).length})
          </button>
        ))}
      </div>
      {shown.length ? (
        <ul className="mt-6 space-y-6">
          {shown.map((s) => (
            <li key={s.id}>
              <Item s={s} session={session} countries={countries} index={index} onDone={load} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          {tab === "pending" ? "Nothing waiting. New suggestions will show here." : "None yet."}
        </p>
      )}
    </>
  );
}

function Item({
  s,
  session,
  countries,
  index,
  onDone,
}: {
  s: Suggestion;
  session: Session;
  countries: CountryLite[];
  index: RecordIndex;
  onDone: () => void;
}) {
  const db = supabase()!;
  const [values, setValues] = useState<Values>(() => toValues(s.record_type, s.data));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const typeLabel = RECORD_TYPES.find((r) => r.key === s.record_type)?.label ?? s.record_type;
  const targetLabel = s.target_id ? (index[s.record_type].find((r) => r.id === s.target_id)?.label ?? s.target_id) : null;

  async function decide(decision: "approved" | "rejected") {
    if (decision === "rejected" && !window.confirm("Reject this suggestion? It will not appear on the site.")) return;
    setBusy(true);
    setMsg(null);
    const edited = decision === "approved" ? toRecord(s.record_type, values) : null;
    const { error } = await db.rpc("review_suggestion", { sid: s.id, decision, edited });
    if (error) {
      setBusy(false);
      setMsg(`That did not work: ${error.message}`);
      return;
    }
    if (decision === "approved") await refreshAtlas(session.access_token);
    setBusy(false);
    onDone();
  }

  return (
    <article className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        {s.kind === "correction" ? "Correction" : "New"} · {typeLabel} · sent {date(s.created_at)}
      </p>
      <h2 className="mt-1 font-display text-xl font-bold leading-snug">
        {s.kind === "correction" ? (targetLabel ?? "Correction") : recordLabel(s.data)}
      </h2>
      {targetLabel ? (
        <p className="mt-1">
          Correcting: <b>{targetLabel}</b> <span className="text-sm text-muted">(only filled-in fields will change)</span>
        </p>
      ) : null}
      <p className="mt-2 text-sm">
        <b>Source:</b>{" "}
        <a href={s.source_url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
          {host(s.source_url)}
          <span className="sr-only"> (opens in a new tab)</span> ↗
        </a>{" "}
        <span className="text-muted">Check it before approving.</span>
      </p>
      {s.note ? (
        <p className="mt-1 text-sm">
          <b>Note:</b> {s.note}
        </p>
      ) : null}

      {s.status === "pending" ? (
        <>
          <details className="mt-4" open>
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">Fields (you can fix typos before approving)</summary>
            <div className="mt-2">
              <RecordFields type={s.record_type} values={values} onChange={setValues} countries={countries} requireAll={false} />
            </div>
          </details>
          {msg ? (
            <p role="alert" className="mt-3 rounded bg-gold-soft p-2 text-sm">
              {msg}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy} onClick={() => decide("approved")} className={`${btn} bg-accent text-surface disabled:opacity-60`}>
              {busy ? "Saving…" : "Approve and publish"}
            </button>
            <button type="button" disabled={busy} onClick={() => decide("rejected")} className={`${btn} border border-line text-fg disabled:opacity-60`}>
              Reject
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">
          {s.status === "approved" ? "Approved" : "Rejected"} {date(s.reviewed_at)}.
          {s.status === "approved" ? (
            <>
              {" "}
              <Link href={PAGE[s.record_type]} className="underline underline-offset-2">
                See it on the site →
              </Link>
            </>
          ) : null}
        </p>
      )}
    </article>
  );
}

