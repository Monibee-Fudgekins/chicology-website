import fs from 'node:fs';
import path from 'node:path';

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
};

export function listMarkdownSlugs() {
  const dir = path.join(process.cwd(), 'content', 'blog');
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.(md|mdx)$/i, ''));
}
