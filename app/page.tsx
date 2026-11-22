export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">
        Africa AgriTech Atlas · Phase 0
      </p>
      <h1 className="mt-3 font-display text-5xl font-bold text-fg sm:text-6xl">
        Hello, <span className="text-accent">Atlas</span>
      </h1>
      <div className="mt-5 h-1 w-16 rounded bg-gold" aria-hidden="true" />
      <p className="mt-5 max-w-prose text-muted">
        A living map of agricultural and infrastructure technology across all 54 African
        countries. Coming soon.
      </p>
      <div className="mt-8 rounded-lg border border-line bg-gold-soft p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Next up</p>
        <p className="mt-1">
          Phase 1: the clickable Africa map and the country pages.{" "}
          <a href="https://github.com/nnenna82/africa-agritech-atlas" className="text-accent underline">
            See the project on GitHub
          </a>
          .
        </p>
      </div>
    </main>
  );
}
