// Cards for the records shown on country and region pages.

import Link from "next/link";
import type { Country, Gap, Organization, Person, Policy, Startup } from "@/lib/types";
import { tierName, type Tier } from "@/lib/groups";
import { firstSentence, host, isUrl, links, num } from "@/lib/format";
import { Card, Chip, LastChecked, ReviewNote, SourceLinks, TierChip } from "./ui";

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="mt-3 block font-mono text-[11px] uppercase tracking-widest text-muted">{children}</span>
);

export function GapCard({ gap, scopeName }: { gap: Gap; scopeName: string }) {
  return (
    <Card>
      <div className="flex flex-wrap gap-1.5">
        {gap.segment ? <Chip accent>{gap.segment}</Chip> : null}
        <Chip>{scopeName}</Chip>
      </div>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{gap.title}</h3>
      {gap.evidence ? (
        <>
          <Label>Evidence</Label>
          <p className="text-sm">{gap.evidence}</p>
        </>
      ) : null}
      {gap.root_causes ? (
        <>
          <Label>Root causes</Label>
          <p className="text-sm">{gap.root_causes}</p>
        </>
      ) : null}
      {gap.who_is_working ? (
        <p className="mt-3 text-sm text-muted">
          <b className="text-fg">Who is working on it:</b> {gap.who_is_working}
        </p>
      ) : null}
      {gap.opportunity ? (
        <p className="mt-2 text-sm text-muted">
          <b className="text-fg">Opportunity:</b> {gap.opportunity}
        </p>
      ) : null}
      <SourceLinks items={links(gap.evidence_source)} />
      <ReviewNote needs={gap.needs_review} note={gap.review_note} />
      <LastChecked value={gap.last_verified} />
    </Card>
  );
}

export function PersonCard({ person, nameOf }: { person: Person; nameOf?: (iso: string) => string }) {
  const urls = links(person.public_links).filter(isUrl);
  const confirmed = links(person.source).filter((u) => isUrl(u) && !urls.includes(u));
  return (
    <Card>
      <div className="flex flex-wrap gap-1.5">
        {(person.countries ?? []).map((c) => (
          <Chip key={c}>{nameOf ? nameOf(c) : c}</Chip>
        ))}
        {person.diaspora ? <Chip accent>diaspora{person.based_in ? ` · ${person.based_in}` : ""}</Chip> : null}
      </div>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{person.name}</h3>
      <p className="text-sm text-muted">
        {person.role}
        {person.organization ? `, ${person.organization}` : ""}
      </p>
      {person.focus ? <p className="mt-2 text-sm">{person.focus}</p> : null}
      {person.talk_to_about ? (
        <p className="mt-2 text-sm text-muted">
          <b className="text-fg">Talk to them about:</b> {person.talk_to_about}
        </p>
      ) : null}
      <SourceLinks items={urls} label="Public links" />
      <SourceLinks items={confirmed} label="Role confirmed at" />
      {person.source && !isUrl(person.source) ? (
        <p className="mt-1 text-xs text-muted">Confirmed by: {person.source}</p>
      ) : null}
      <ReviewNote needs={person.needs_review} note={person.review_note} />
      <LastChecked value={person.last_verified} />
    </Card>
  );
}

const ORG_TYPES: Record<string, string> = {
  gov: "Government",
  regulator: "Regulator",
  research: "Research",
  DFI: "Development finance",
  investor: "Investor",
  corporate: "Company",
  NGO: "Non-profit",
  multilateral: "Multilateral",
};

export function OrgCard({ org }: { org: Organization }) {
  return (
    <Card>
      <div className="flex flex-wrap gap-1.5">
        {org.type ? <Chip accent>{ORG_TYPES[org.type] ?? org.type}</Chip> : null}
        {org.funder ? <Chip>funder</Chip> : null}
      </div>
      <h3 className="mt-2 font-bold leading-snug">
        {isUrl(org.website) ? (
          <a href={org.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {org.name}
            <span className="sr-only"> (website, opens in a new tab)</span> ↗
          </a>
        ) : (
          org.name
        )}
      </h3>
      {org.what ? <p className="mt-1 text-sm text-muted">{org.what}</p> : null}
      <ReviewNote needs={org.needs_review} note={org.review_note} />
    </Card>
  );
}

/** A short label from the free-text startup status. Failures stay visible on purpose. */
export function startupStatus(status: string | null): { label: string; tone: "ok" | "warn" | "stop" } {
  const s = (status ?? "").toLowerCase();
  if (/^shut down|^closed|administration/.test(s)) return { label: "shut down", tone: "stop" };
  if (/^acquired/.test(s)) return { label: "acquired", tone: "warn" };
  if (/^pivoted/.test(s)) return { label: "pivoted", tone: "warn" };
  if (/restructur/.test(s)) return { label: "restructuring", tone: "warn" };
  if (/unverified/.test(s)) return { label: "status not confirmed", tone: "warn" };
  if (/^active/.test(s)) return { label: "active", tone: "ok" };
  return { label: "status unknown", tone: "warn" };
}

export function StartupCard({ startup }: { startup: Startup }) {
  const st = startupStatus(startup.status);
  const tone =
    st.tone === "ok" ? "bg-accent-soft text-fg" : st.tone === "stop" ? "bg-fg text-bg" : "bg-gold-soft text-fg";
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`inline-block rounded px-1.5 py-0.5 font-mono text-[11px] ${tone}`}>{st.label}</span>
        {startup.segment ? <Chip>{startup.segment}</Chip> : null}
        {startup.founded ? <Chip>founded {startup.founded}</Chip> : null}
      </div>
      <h3 className="mt-2 font-bold leading-snug">
        {isUrl(startup.website) ? (
          <a href={startup.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {startup.name}
            <span className="sr-only"> (website, opens in a new tab)</span> ↗
          </a>
        ) : (
          startup.name
        )}
      </h3>
      {startup.model ? <p className="mt-1 text-sm">{startup.model}</p> : null}
      {startup.notable_funding ? (
        <p className="mt-1 text-sm text-muted">
          <b className="text-fg">Funding:</b> {startup.notable_funding}
        </p>
      ) : null}
      {startup.status && st.label !== "active" ? <p className="mt-1 text-xs text-muted">Status: {startup.status}</p> : null}
      <SourceLinks items={links(startup.source)} />
      <ReviewNote needs={startup.needs_review} note={startup.review_note} />
      <LastChecked value={startup.last_verified} />
    </Card>
  );
}

export function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <Card>
      <div className="flex flex-wrap gap-1.5">
        {policy.type ? <Chip accent>{policy.type}</Chip> : null}
        {policy.year ? <Chip>{policy.year}</Chip> : null}
        {policy.status ? <Chip>{policy.status}</Chip> : null}
      </div>
      <h3 className="mt-2 font-bold leading-snug">{policy.title}</h3>
      {policy.summary ? <p className="mt-1 text-sm text-muted">{policy.summary}</p> : null}
      {isUrl(policy.link) ? (
        <p className="mt-2 text-xs">
          <a href={policy.link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Read more at {host(policy.link)}
            <span className="sr-only"> (opens in a new tab)</span> ↗
          </a>
        </p>
      ) : null}
      <ReviewNote needs={policy.needs_review} note={policy.review_note} />
    </Card>
  );
}

/** One-line description of a country for cards: the deep-dive's first sentence, or the basic facts. */
export function countryBlurb(c: Country): string {
  if (c.deep && c.narrative) return firstSentence(c.narrative);
  const bits: string[] = [];
  if (c.ag_gdp_pct != null) bits.push(`${num(c.ag_gdp_pct)}% of GDP`);
  if (c.ag_jobs_pct != null) bits.push(`${num(c.ag_jobs_pct)}% of jobs`);
  const ag = bits.length ? `Agriculture is ${bits.join(" and ")}.` : "";
  const el = c.electricity_access_pct != null ? ` ${num(c.electricity_access_pct)}% of people have electricity.` : "";
  return (ag + el).trim() || "Not enough data yet.";
}

export function CountryCard({ country, tier }: { country: Country; tier: Tier }) {
  return (
    <Link
      href={`/country/${country.iso3}`}
      className="group flex h-full flex-col gap-2 rounded-lg border border-line bg-surface p-4 text-fg no-underline hover:border-accent"
      aria-label={`${country.name}: ${tierName(tier)}`}
    >
      <span className="flex items-center justify-between gap-2">
        <b className="font-display text-lg group-hover:underline">{country.name}</b>
        {country.deep ? <Chip accent>deep dive</Chip> : null}
      </span>
      <TierChip tier={tier} className="self-start" />
      <span className="text-sm text-muted">{countryBlurb(country)}</span>
    </Link>
  );
}
