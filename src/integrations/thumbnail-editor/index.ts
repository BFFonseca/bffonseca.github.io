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

type Crop = { x?: number; y?: number; zoom?: number };
type FullCrop = Crop & { strip?: Crop; hero?: Crop };

const KEYS = ['x', 'y', 'zoom'] as const;

function clean(c: unknown): Crop {
  const out: Crop = {};
  if (!c || typeof c !== 'object') return out;
  for (const k of KEYS) {
    const v = (c as Record<string, unknown>)[k];
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[k] = k === 'zoom' ? Math.min(10, Math.max(1, round(v, 2))) : Math.min(100, Math.max(0, round(v, 1)));
    }
  }
  return out;
}

const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function toYaml(crop: FullCrop): string[] {
  const lines: string[] = [];
  const base = clean(crop);
  for (const k of KEYS) if (base[k] !== undefined) lines.push(`  ${k}: ${base[k]}`);
  for (const v of ['strip', 'hero'] as const) {
    const sub = clean(crop[v]);
    const subLines = KEYS.filter((k) => sub[k] !== undefined).map((k) => `    ${k}: ${sub[k]}`);
    if (subLines.length) lines.push(`  ${v}:`, ...subLines);
  }
  return lines.length ? ['thumbnailCrop:', ...lines] : [];
}

// Replace (or remove) the thumbnailCrop block in the frontmatter, leaving everything else as is.
export function setCropInMarkdown(md: string, crop: FullCrop): string {
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
  lines.splice(at, 0, ...toYaml(crop));
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
          const md = await readFile(abs, 'utf-8');
          await writeFile(abs, setCropInMarkdown(md, crop ?? {}), 'utf-8');
          reply(200, { ok: true, yaml: toYaml(crop ?? {}).join('\n') });
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
