export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <section className="py-16">
        <h1 className="text-4xl font-bold tracking-tight">AI Website</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          A self-iterating site that improves itself daily with AI, publishes to Cloudflare Pages, and stays secure.
        </p>
      </section>
      <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800">
        <h2 className="text-2xl font-semibold">Recent updates</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Daily updates will appear here as blog posts.
        </p>
      </section>
    </main>
  );
}
