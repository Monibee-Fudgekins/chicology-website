import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const dynamicParams = false;

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'content', 'blog');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  return files.map((f) => ({ slug: f.replace(/\.(md|mdx)$/i, '') }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const file = path.join(process.cwd(), 'content', 'blog', `${slug}.mdx`);
  const alt = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);
  const target = fs.existsSync(file) ? file : alt;
  const raw = fs.readFileSync(target, 'utf8');
  const { content, data } = matter(raw);

  return (
    <main className="prose prose-slate mx-auto max-w-3xl p-6 dark:prose-invert">
      <h1 className="mb-4 text-3xl font-bold">{data.title ?? slug}</h1>
      <article>
        <pre className="whitespace-pre-wrap">{content}</pre>
      </article>
    </main>
  );
}
