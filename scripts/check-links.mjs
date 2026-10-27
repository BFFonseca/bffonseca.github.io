// Checks every internal link in the built site (dist/) for a target that exists.
// External links (http://, mailto:, ...) are skipped so CI never fails on someone else's site.
// Run after `npm run build`.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, resolve, relative } from 'node:path';

const DIST = resolve('dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => {
    const path = join(dir, e.name);
    return e.isDirectory() ? walk(path) : [path];
  }));
  return files.flat();
}

async function exists(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

// "/blog/post" can be served by blog/post, blog/post/index.html or blog/post.html
async function resolveTarget(path) {
  for (const candidate of [path, join(path, 'index.html'), `${path}.html`]) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

const ids = new Map(); // file -> Set of element ids, for #fragment checks
function idsIn(html) {
  return new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));
}

try {
  await stat(DIST);
} catch {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = (await walk(DIST)).filter((f) => f.endsWith('.html'));
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  ids.set(file, idsIn(html));

  for (const [, attr, raw] of html.matchAll(/\s(href|src)=["']([^"']*)["']/g)) {
    const link = raw.replaceAll('&amp;', '&');
    if (!link || /^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith('//')) continue;

    const [pathAndQuery, fragment] = link.split('#');
    const path = decodeURIComponent(pathAndQuery.split('?')[0]);
    checked++;

    let target = file;
    if (path) {
      const abs = path.startsWith('/') ? join(DIST, path) : resolve(dirname(file), path);
      target = await resolveTarget(abs);
      if (!target) {
        broken.push({ file, attr, link, reason: 'target not found' });
        continue;
      }
    }

    if (fragment && target.endsWith('.html')) {
      if (!ids.has(target)) ids.set(target, idsIn(await readFile(target, 'utf8')));
      if (!ids.get(target).has(decodeURIComponent(fragment))) {
        broken.push({ file, attr, link, reason: `no element with id "${fragment}"` });
      }
    }
  }
}

for (const { file, attr, link, reason } of broken) {
  console.error(`✗ ${relative(DIST, file)}: ${attr}="${link}" (${reason})`);
}
console.log(`Checked ${checked} internal links in ${htmlFiles.length} pages: ${broken.length} broken.`);
process.exit(broken.length ? 1 : 0);
