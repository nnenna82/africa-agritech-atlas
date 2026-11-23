import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-12">
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-3 max-w-prose text-muted">
        We could not find that page. It may not be built yet, or the link may be wrong.
      </p>
      <p className="mt-4 flex flex-wrap gap-4">
        <Link href="/" className="underline underline-offset-2">Go to the map</Link>
        <Link href="/countries" className="underline underline-offset-2">See all 54 countries</Link>
      </p>
    </div>
  );
}
