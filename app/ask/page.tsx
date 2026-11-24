import type { Metadata } from "next";
import AskChat from "@/components/AskChat";
import { Breadcrumbs, Eyebrow } from "@/components/ui";
import { chatEnabled } from "@/lib/chat-config";
import { getAtlas } from "@/lib/data";

export const metadata: Metadata = { title: "Ask the Atlas" };

export default async function AskPage() {
  const atlas = await getAtlas();
  const names = Object.fromEntries(atlas.countries.map((c) => [c.iso3, c.name]));
  return (
    <>
      <Breadcrumbs items={[{ label: "Ask the Atlas" }]} />
      <Eyebrow>Ask the Atlas · AI answers from Atlas records</Eyebrow>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Ask the Atlas</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Ask about a country, a problem, a startup or who to talk to. Answers use only what is in the Atlas and link to
        the records they come from.
      </p>
      {chatEnabled() ? (
        <AskChat countryNames={names} />
      ) : (
        <p className="mt-6 max-w-2xl rounded-lg bg-gold-soft p-4">
          <b>The chat is not switched on yet.</b> In the meantime, the{" "}
          <a href="/gaps" className="underline underline-offset-2">
            Gap map
          </a>
          ,{" "}
          <a href="/people" className="underline underline-offset-2">
            People
          </a>{" "}
          and country pages have the same information.
        </p>
      )}
      <p className="mt-10 max-w-2xl text-xs text-muted">
        To keep costs down, each visitor can ask up to 10 questions a day, and the chat pauses for the day once its
        daily budget is used. Questions are not stored with anything that identifies you; answers to repeated
        questions are saved for a week so they can be reused.
      </p>
    </>
  );
}
