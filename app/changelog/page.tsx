// Historical note (content/changelog.md was a single entry: 2025-08-20 Initial scaffold).
// Future CI can append entries directly to this page or reintroduce storage if needed.
export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Changelog</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">CI will append entries to content/changelog.md after deploys.</p>
    </main>
  );
}
