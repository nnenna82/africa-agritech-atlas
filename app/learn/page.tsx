import type { Metadata } from "next";
import Link from "next/link";
import Roadmap from "@/components/Roadmap";
import { Breadcrumbs, Eyebrow, Section, Swatch } from "@/components/ui";
import { CJ_URL } from "@/lib/chain";
import { getAtlas } from "@/lib/data";
import { date } from "@/lib/format";
import { PILLARS, TIER_NAMES, tierColor, type Tier } from "@/lib/groups";

export const metadata: Metadata = { title: "Learn" };

const GLOSSARY: [string, string][] = [
  ["AfCFTA", "African Continental Free Trade Area: one market for goods and services across Africa."],
  ["AfDB", "African Development Bank."],
  ["AIDI", "The AfDB's Africa Infrastructure Development Index."],
  ["CAADP", "Comprehensive Africa Agriculture Development Programme: the African Union's farming commitments."],
  ["Biennial Review", "The AU's check, every two years, on how each country is doing on CAADP. A score of 9.29 out of 10 counts as on track."],
  ["Cold chain", "Keeping food cool from harvest to sale, with cold rooms and refrigerated transport."],
  ["DFI", "Development finance institution: a public lender or investor, such as AfDB, IFC or the UK's BII."],
  ["Extension", "Advice and training for farmers on what and how to plant."],
  ["Inputs", "What farmers buy before planting: seed, fertilizer, crop protection."],
  ["PIDA", "Programme for Infrastructure Development in Africa: the continental plan for roads, power and water."],
  ["REC", "Regional economic community, such as ECOWAS or the East African Community."],
  ["Value chain", "Every step a crop goes through, from seed to the buyer's plate, and the value added at each step."],
];

export default async function LearnPage() {
  const atlas = await getAtlas();
  const noCaadp = atlas.countries.filter((c) => c.caadp_br4_score == null).length;
  const noData = atlas.countries.filter((c) => c.atlas?.score == null).map((c) => c.name);

  return (
    <>
      <Breadcrumbs items={[{ label: "Learn" }]} />
      <Eyebrow>Learn</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Learning roadmap</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        About 12 weeks from getting oriented to making your first contribution to African agriculture.
      </p>
      <p className="mt-4 max-w-2xl rounded-lg bg-gold-soft p-3 text-sm">
        <b>New to farm value chains?</b> Start with{" "}
        <a href={CJ_URL} className="underline underline-offset-2">
          Crop Journeys
        </a>
        : follow cocoa, maize, coffee and tomatoes from seed to shelf, with hands-on labs and a jargon notebook.
      </p>

      <Roadmap />

      <Section title="How the color groups work">
        <div className="max-w-prose space-y-3">
          <p>
            Each country is placed in one of five groups by comparing it with the other African countries. The groups
            are not grades, and the Atlas never shows a score as a number.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
            {TIER_NAMES.map((n, i) => (
              <li key={n} className="flex items-center gap-1.5">
                <Swatch color={tierColor(i as Tier)} />
                {n}
              </li>
            ))}
          </ul>
          <p>Five equal pillars, each asking one question:</p>
          <ul className="list-disc space-y-1 pl-5">
            {PILLARS.map((p) => (
              <li key={p.key}>
                <b>{p.label}:</b> {p.question}
              </li>
            ))}
          </ul>
          <p>
            Each indicator (for example cereal yield or electricity access) is ranked against the other African
            countries with data. A pillar is the average of its indicators, and the overall result is the average of
            the pillars. A country needs data for at least 4 of the 5 pillars; otherwise it shows &ldquo;Not enough
            data&rdquo;{noData.length ? ` (today: ${noData.join(" and ")})` : ""}. The countries with enough data are
            then split into five groups of about equal size.
          </p>
          <p>
            <b>Read the pillars, not just the group.</b> A country can lead on policy and trail on infrastructure, and
            that is usually where its gaps are. Each country page shows the group for every pillar and the real figures
            behind it.
          </p>
          <h3 className="pt-2 font-display text-lg font-bold">Known weak spots</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              {noCaadp} countries have no CAADP review score in the Atlas, so their policy pillar uses public spending
              only.
            </li>
            <li>Irrigation figures are old for most countries (estimates from around 2012 to 2020), so treat them as approximate.</li>
            <li>The groups can move when new data comes in.{atlas.meta.score_method?.version ? ` Data version: ${atlas.meta.score_method.version}.` : ""}</li>
          </ul>
          <p className="text-sm text-muted">
            Sources: FAO and World Bank via Our World in Data, Global Findex 2024, the AU&rsquo;s 4th CAADP Biennial
            Review, ITU. Data as of {date(atlas.meta.as_of) ?? "November 2026"}.
          </p>
        </div>
      </Section>

      <Section title="How to be useful">
        <ul className="max-w-prose list-disc space-y-2 pl-5">
          <li>
            Start from a documented{" "}
            <Link href="/gaps" className="underline underline-offset-2">
              gap
            </Link>
            , not from a technology.
          </li>
          <li>Talk to the people closest to the problem before proposing a fix.</li>
          <li>
            Check who already tried. Gro Intelligence, Wefarm and Sendy all shut down; their stories on the{" "}
            <Link href="/startups" className="underline underline-offset-2">
              Startups page
            </Link>{" "}
            are free lessons.
          </li>
          <li>
            Spotted something wrong or missing?{" "}
            <Link href="/suggest" className="underline underline-offset-2">
              Suggest a correction
            </Link>
            .
          </li>
        </ul>
      </Section>

      <Section title="Glossary">
        <dl className="grid max-w-3xl gap-x-6 gap-y-3 sm:grid-cols-[10rem_1fr]">
          {GLOSSARY.map(([t, d]) => (
            <div key={t} className="contents">
              <dt className="font-semibold">{t}</dt>
              <dd className="text-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
