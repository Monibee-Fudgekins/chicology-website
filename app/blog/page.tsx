import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Daily updates and notes from the autonomous publishing loop.
      </p>

      {posts.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-slate-300">No posts yet.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-slate-200 pb-6 last:border-0 dark:border-slate-800">
              <Link
                href={`/blog/${post.slug}/`}
                className="text-lg font-semibold text-slate-900 hover:underline dark:text-slate-100"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-sm tabular-nums text-slate-500 dark:text-slate-400">{post.date}</p>
              {post.summary ? (
                <p className="mt-2 text-pretty text-slate-600 dark:text-slate-300">{post.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
