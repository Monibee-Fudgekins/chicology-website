import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
};

function normalizeDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim()) {
    const d = Date.parse(value);
    if (!Number.isNaN(d)) return new Date(d).toISOString().slice(0, 10);
    return value.trim().slice(0, 10);
  }
  return '';
}

export function listMarkdownSlugs() {
  const dir = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.(md|mdx)$/i, ''));
}

export function getAllPosts(): PostMeta[] {
  const dir = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => /\.(md|mdx)$/i.test(f));
  const posts: PostMeta[] = [];

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/i, '');
    const full = path.join(dir, file);
    try {
      const raw = fs.readFileSync(full, 'utf8');
      const { data } = matter(raw);
      const title = typeof data.title === 'string' && data.title.trim() ? data.title : slug;
      const dateStr = normalizeDate(data.date);
      const summary = typeof data.summary === 'string' ? data.summary : undefined;
      posts.push({
        slug,
        title,
        date: dateStr || '1970-01-01',
        summary,
      });
    } catch {
      posts.push({ slug, title: slug, date: '1970-01-01' });
    }
  }

  posts.sort((a, b) => {
    if (a.date === b.date) return a.slug.localeCompare(b.slug);
    return a.date < b.date ? 1 : -1;
  });

  return posts;
}
