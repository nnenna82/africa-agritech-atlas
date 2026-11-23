import { getAtlas } from "@/lib/data";
import { date } from "@/lib/format";

export default async function SiteFooter() {
  const atlas = await getAtlas();
  return (
    <footer className="border-t border-line bg-surface" data-source={atlas.source}>
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted">
        <p>
          Africa AgriTech Atlas. Data as of {date(atlas.meta.as_of) ?? "November 2026"}. Every record links to its
          source. Color groups compare countries with each other; they are not grades.
        </p>
        <p className="mt-1">
          Map outlines: Natural Earth (public domain). Western Sahara is shown in grey because its status is disputed.
        </p>
      </div>
    </footer>
  );
}
