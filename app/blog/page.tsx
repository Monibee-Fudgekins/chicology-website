import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import Link from 'next/link';

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
};

function getAllPosts(): PostMeta[] {
  const dir = path.join(process.cwd(), 'content', 'blog');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  
  const posts = files.map((filename) => {
    const slug = filename.replace(/\.(md|mdx)$/i, '');
    const filePath = path.join(dir, filename);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    
    return {
      slug,
      title: data.title || slug,
      date: String(data.date || ''),
      summary: data.summary || '',
    };
  });
  
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export default function BlogIndexPage() {
  const posts = getAllPosts();
  
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-xl font-semibold text-slate-900 transition group-hover:text-slate-600 dark:text-slate-100 dark:group-hover:text-slate-300">
                {post.title}
              </h2>
              <time className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
                {post.date}
              </time>
              {post.summary && (
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {post.summary}
                </p>
              )}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
