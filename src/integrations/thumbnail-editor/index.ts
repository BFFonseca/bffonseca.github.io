// Dev-only thumbnail crop editor. Adds /dev/thumbnails while `npm run dev` is running and a
// small endpoint that writes `thumbnailCrop` into a post's/project's frontmatter.
// Nothing here is part of `astro build`, so it never ships to the live site.
import type { AstroIntegration } from 'astro';
import type { Plugin } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const EDITOR_ROUTE = '/dev/thumbnails';
export const SAVE_ENDPOINT = '/__thumbnail-editor/save';

type Slot = { x?: number; y?: number; zoom?: number; image?: string };
type VariantCrop = Slot & { desktop?: Slot; mobile?: Slot };
type FullCrop = Slot & { strip?: VariantCrop; hero?: VariantCrop };

const NUM_KEYS = ['x', 'y', 'zoom'] as const;
const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

// Decides whether an `image` value may be written (the save endpoint passes a stricter check).
type ImageCheck = (img: string) => boolean;
const noParentDirs: ImageCheck = (img) => !img.split(/[\\/]/).includes('..') && !path.isAbsolute(img);

// Keep only valid values, rounded.
function slotLines(c: unknown, pad: string, okImage: ImageCheck): string[] {
  if (!c || typeof c !== 'object') return [];
  const o = c as Record<string, unknown>;
  const lines: string[] = [];
  for (const k of NUM_KEYS) {
    const v = o[k];
    if (typeof v !== 'number' || !Number.isFinite(v)) continue;
    const val = k === 'zoom' ? Math.min(10, Math.max(1, round(v, 2))) : Math.min(100, Math.max(0, round(v, 1)));
    lines.push(`${pad}${k}: ${val}`);
  }
  const img = o.image;
  if (typeof img === 'string' && img && okImage(img)) {
    lines.push(`${pad}image: '${img.replace(/'/g, "''")}'`);
  }
  return lines;
}

function toYaml(crop: FullCrop, okImage: ImageCheck = noParentDirs): string[] {
  const lines = slotLines(crop, '  ', okImage);
  for (const v of ['strip', 'hero'] as const) {
    const vl = slotLines(crop?.[v], '    ', okImage);
    for (const s of ['desktop', 'mobile'] as const) {
      const sl = slotLines(crop?.[v]?.[s], '      ', okImage);
      if (sl.length) vl.push(`    ${s}:`, ...sl);
    }
    if (vl.length) lines.push(`  ${v}:`, ...vl);
  }
  return lines.length ? ['thumbnailCrop:', ...lines] : [];
}

// Replace (or remove) the thumbnailCrop block in the frontmatter, leaving everything else as is.
export function setCropInMarkdown(md: string, crop: FullCrop, okImage: ImageCheck = noParentDirs): string {
  const eol = md.includes('\r\n') ? '\r\n' : '\n';
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('No frontmatter found');
  const lines = m[1].split(/\r?\n/);
  let at = lines.findIndex((l) => /^thumbnailCrop\s*:/.test(l));
  if (at >= 0) {
    let end = at + 1;
    while (end < lines.length && /^\s+\S/.test(lines[end])) end++;
    lines.splice(at, end - at);
  } else {
    at = lines.length;
  }
  lines.splice(at, 0, ...toYaml(crop, okImage));
  return `---${eol}${lines.join(eol)}${eol}---` + md.slice(m[0].length);
}

function savePlugin(root: string): Plugin {
  const contentDir = path.resolve(root, 'src/content');
  return {
    name: 'thumbnail-editor-save',
    configureServer(server) {
      server.middlewares.use(SAVE_ENDPOINT, async (req, res) => {
        const reply = (status: number, body: object) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') return reply(405, { error: 'POST only' });
        try {
          let raw = '';
          for await (const chunk of req) raw += chunk;
          const { file, crop } = JSON.parse(raw) as { file: string; crop: FullCrop };
          const abs = path.resolve(root, file);
          if (!abs.startsWith(contentDir + path.sep) || !abs.endsWith('.md')) {
            return reply(400, { error: 'File must be a .md under src/content' });
          }
          // Images may live in another entry's folder (e.g. a related blog post: ../../blog/7/media/x.png),
          // as long as they resolve to an image file under src/content.
          const okImage: ImageCheck = (img) => {
            if (img === 'none') return true;
            const target = path.resolve(path.dirname(abs), img);
            return target.startsWith(contentDir + path.sep) && /\.(png|jpe?g|gif|webp)$/i.test(target);
          };
          const md = await readFile(abs, 'utf-8');
          await writeFile(abs, setCropInMarkdown(md, crop ?? {}, okImage), 'utf-8');
          reply(200, { ok: true, yaml: toYaml(crop ?? {}, okImage).join('\n') });
        } catch (err) {
          reply(500, { error: String(err) });
        }
      });
    },
  };
}

export default function thumbnailEditor(): AstroIntegration {
  return {
    name: 'thumbnail-editor',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig, config }) => {
        if (command !== 'dev') return;
        injectRoute({
          pattern: EDITOR_ROUTE,
          entrypoint: fileURLToPath(new URL('./editor.astro', import.meta.url)),
        });
        updateConfig({ vite: { plugins: [savePlugin(fileURLToPath(config.root))] } });
      },
      'astro:server:start': ({ address, logger }) => {
        logger.info(`Thumbnail crop editor: http://localhost:${address.port}${EDITOR_ROUTE}`);
      },
    },
  };
}
