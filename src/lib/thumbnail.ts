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

// ---------------------------------------------------------------------------------------------
// Per-slot resolution. A thumbnail has four slots: strip/hero × desktop/mobile. Each slot's
// image and crop come from the most specific `thumbnailCrop` level that sets them:
//   thumbnailCrop.<variant>.<screen>  →  thumbnailCrop.<variant>  →  thumbnailCrop  →  defaults
// (image falls back to the automatic thumbnail picked by getThumbnail above).

export type Variant = 'strip' | 'hero';
export type Screen = 'desktop' | 'mobile';
type Entry = CollectionEntry<'blog'> | CollectionEntry<'projects'>;

export interface SlotCrop { x?: number; y?: number; zoom?: number; image?: string }
export interface VariantCrop extends SlotCrop { desktop?: SlotCrop; mobile?: SlotCrop }
export interface ThumbnailCrop extends SlotCrop { strip?: VariantCrop; hero?: VariantCrop }

export const VARIANTS: Variant[] = ['strip', 'hero'];
export const SCREENS: Screen[] = ['desktop', 'mobile'];

export function entryDir(entry: Entry): string | undefined {
  return entry.filePath ? normalise(entry.filePath.replace(/\\/g, '/').replace(/\/[^/]*$/, '')) : undefined;
}

// Every image stored in the entry's folder (any depth), as paths relative to that folder.
export function entryImages(entry: Entry): { path: string; src: ImageMetadata }[] {
  const dir = entryDir(entry);
  if (!dir) return [];
  return Object.keys(images)
    .filter((k) => k.startsWith(dir + '/'))
    .sort()
    .map((k) => ({ path: k.slice(dir.length + 1), src: images[k] }));
}

// The `thumbnailCrop` levels that apply to a slot, most specific first.
export function slotLevels(crop: ThumbnailCrop | undefined, v: Variant, s: Screen): SlotCrop[] {
  const c = crop ?? {};
  return [c[v]?.[s], c[v], c].filter((l): l is SlotCrop => !!l);
}

export interface Slot { src: ImageMetadata; alt: string; x: number; y: number; zoom: number }

export function resolveSlot(
  entry: Entry,
  v: Variant,
  s: Screen,
  defaults: { x: number; y: number; zoom: number },
): Slot | undefined {
  const levels = slotLevels(entry.data.thumbnailCrop as ThumbnailCrop | undefined, v, s);
  const pick = <K extends keyof SlotCrop>(k: K) => levels.find((l) => l[k] !== undefined)?.[k];
  const auto = getThumbnail(entry);
  const dir = entryDir(entry);
  const chosen = pick('image');
  const key = chosen && dir ? normalise(`${dir}/${chosen}`) : undefined;
  const src = (key && images[key]) || auto?.src;
  if (!src) return undefined;
  return {
    src,
    alt: entry.data.thumbnailAlt ?? auto?.alt ?? '',
    x: pick('x') ?? defaults.x,
    y: pick('y') ?? defaults.y,
    zoom: pick('zoom') ?? defaults.zoom,
  };
}
