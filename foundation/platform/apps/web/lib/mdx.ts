import { compileMDX } from 'next-mdx-remote/rsc';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface MdxFrontmatter {
  title: string;
  description: string;
}

export async function getMdxContent(slug: string, locale: string) {
  const localePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
  const fallbackPath = path.join(CONTENT_DIR, 'pl', `${slug}.mdx`);

  const filePath = fs.existsSync(localePath) ? localePath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  if (!filePath) return null;

  const source = fs.readFileSync(filePath, 'utf-8');

  return compileMDX<MdxFrontmatter>({
    source,
    options: { parseFrontmatter: true },
  });
}

export function getMdxFrontmatter(slug: string, locale: string): MdxFrontmatter | null {
  const localePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
  const fallbackPath = path.join(CONTENT_DIR, 'pl', `${slug}.mdx`);
  const filePath = fs.existsSync(localePath) ? localePath : (fs.existsSync(fallbackPath) ? fallbackPath : null);
  if (!filePath) return null;

  // gray-matter is faster for metadata-only reads
  const matter = require('gray-matter');
  const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
  return data as MdxFrontmatter;
}
