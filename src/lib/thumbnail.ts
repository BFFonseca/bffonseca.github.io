import type { ImageMetadata } from 'astro';
import type { CollectionEntry } from 'astro:content';

// Picks the thumbnail for a blog post or project:
//   1. a file named thumbnail.png / .jpg / .jpeg in the entry's folder or its media/ folder
//   2. otherwise, the last local image used in the Markdown body
//   3. otherwise, none

const images = import.meta.glob<ImageMetadata>(
  '/src/content/**/*.{png,jpg,jpeg,gif,webp,PNG,JPG,JPEG,GIF,WEBP}',
  { eager: true, import: 'default' },
);

const THUMB_NAME = /^thumbnail\.(png|jpe?g)$/i;

// Markdown images ![alt](src "title") and HTML <img ...> tags, in document order.
// Markdown destinations may be wrapped in <...> (allows spaces) and followed by a "title".
const IMAGE_TAG = /!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^)\s]+))(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)|<img\b[^>]*>/gi;
const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))?.slice(1).find((v) => v !== undefined);

export interface Thumb {
  src: ImageMetadata;
  alt: string;
}

// Normalise a path, resolving "." and ".." segments.
function normalise(path: string): string {
  const out: string[] = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return '/' + out.join('/');
}

// Map an image reference in the body to a key in `images`, or undefined.
function resolveRef(ref: string, dir: string): string | undefined {
  let path = decodeURIComponent(ref.split(/[?#]/)[0]);
  if (/^[a-z]+:\/\//i.test(path)) {
    // Remote URLs (e.g. raw.githubusercontent.com/.../src/content/...) that point at a repo file.
    const i = path.indexOf('/src/content/');
    if (i === -1) return undefined;
    path = path.slice(i);
  } else if (!path.startsWith('/')) {
    path = `${dir}/${path}`;
  }
  const key = normalise(path);
  return key in images ? key : undefined;
}

export function getThumbnail(entry: CollectionEntry<'blog'> | CollectionEntry<'projects'>): Thumb | undefined {
  if (!entry.filePath) return undefined;
  const dir = normalise(entry.filePath.replace(/\\/g, '/').replace(/\/[^/]*$/, ''));
  const alt = entry.data.thumbnailAlt;

  // 1. Dedicated thumbnail file.
  for (const folder of [dir, `${dir}/media`]) {
    const key = Object.keys(images).find(
      (k) => k.slice(0, k.lastIndexOf('/')) === folder && THUMB_NAME.test(k.slice(k.lastIndexOf('/') + 1)),
    );
    if (key) return { src: images[key], alt: alt ?? '' };
  }

  // 2. Last local image in the body.
  let last: Thumb | undefined;
  for (const m of (entry.body ?? '').matchAll(IMAGE_TAG)) {
    const isHtml = m[0].startsWith('<');
    const ref = isHtml ? attr(m[0], 'src') : (m[2] ?? m[3]);
    const key = ref && resolveRef(ref, dir);
    if (key) last = { src: images[key], alt: alt ?? (isHtml ? attr(m[0], 'alt') : m[1]) ?? '' };
  }
  return last;
}
