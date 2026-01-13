import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-10 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/10" />

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
            Autonomous • Daily cadence • Cloudflare Pages + Workers
          </p>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-6xl">
            Chicology — a website that improves itself every day
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            A self-iterating Next.js site powered by an AI Worker: it renders the live site, plans a small safe improvement,
            opens a pull request, runs checks, self-reviews, and auto-merges when it’s low-risk.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              View daily updates
            </Link>
            <Link
              href="/changelog"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-950"
            >
              See what changed
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-semibold">Rendered feedback loop</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            The worker uses browser rendering to read real UI output (not just source), then targets one tiny improvement.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-semibold">Safe autonomous merging</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            PRs are labeled + auto-merge is enabled only after checks and AI approval workflows pass.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-semibold">Observability + self-healing</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            The system tracks streaks, throttles retries, and can degrade gracefully if GitHub/AI is temporarily unavailable.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-xl font-semibold">What happens daily</h2>
        <ol className="mt-4 grid gap-4 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-2">
          <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">1) Render the live site and capture a snapshot</li>
          <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">2) Propose one low-risk UI/content improvement</li>
          <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">3) Open a PR with minimal diff and clear title</li>
          <li className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">4) Auto-merge once checks + AI approval pass</li>
        </ol>
      </section>
    </main>
  );
}
