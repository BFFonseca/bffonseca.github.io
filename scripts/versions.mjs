// Version history: a frozen copy of the site for every PR merged into main,
// served at /versions/pr-<N>/ and picked from the version switcher.
//
//   node scripts/versions.mjs build    --store <dir>   build every PR missing from the store
//   node scripts/versions.mjs assemble --store <dir>   copy the store into dist/versions/
//
// The store (the `versions` branch in CI) keeps each PR's raw `astro build` output,
// so a version is only ever built once. Links are rewritten and the switcher is
// injected at assemble time, so fixes to either reach every old version on the next deploy.
//
// A PR is skipped while its merge commit has the same files as main's HEAD: that
// version is the release. A direct commit to main after it makes it a version again.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

const PREFIX = '/versions';
const [command, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(
  rest.flatMap((arg, i) => (arg.startsWith('--') ? [[arg.slice(2), rest[i + 1]?.startsWith('--') ? true : rest[i + 1] ?? true]] : [])),
);
if (!['build', 'assemble'].includes(command) || typeof args.store !== 'string') {
  console.error('Usage: node scripts/versions.mjs <build|assemble> --store <dir> [--only <N,N>] [--retry-failed] [--out dist]');
  process.exit(1);
}

const STORE = resolve(args.store);
const INDEX = join(STORE, 'index.json');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const run = (cmd, a, cwd) => execFileSync(cmd, a, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });

// Every PR on main's first-parent history: GitHub merge commits ("Merge pull request #N
// from owner/branch", PR title in the body) and squash merges ("Title (#N)").
function mergedPRs() {
  const log = git('log', '--first-parent', '--format=%H%x1f%cI%x1f%s%x1f%b%x1e', 'HEAD');
  const prs = [];
  for (const record of log.split('\x1e')) {
    const [sha, date, subject, body = ''] = record.trim().split('\x1f');
    if (!sha) continue;
    let m = subject.match(/^Merge pull request #(\d+) from [^/]+\/(.+)$/);
    if (m) {
      const title = body.trim().split('\n')[0].replace(/^\s*[-*]\s+/, '').trim();
      prs.push({ number: Number(m[1]), sha, date, branch: m[2], title: title || m[2] });
      continue;
    }
    m = subject.match(/^(.*) \(#(\d+)\)$/);
    if (m) prs.push({ number: Number(m[2]), sha, date, branch: '', title: m[1] });
  }
  // Keep the newest commit per PR number, newest first
  const seen = new Set();
  return prs.filter((pr) => !seen.has(pr.number) && seen.add(pr.number));
}

const treeOf = (rev) => git('rev-parse', `${rev}^{tree}`);
const isRelease = (pr) => treeOf(pr.sha) === treeOf('HEAD');

async function loadIndex() {
  try {
    return JSON.parse(await readFile(INDEX, 'utf8'));
  } catch {
    return {};
  }
}

async function build() {
  const index = await loadIndex();
  const only = typeof args.only === 'string' ? new Set(args.only.split(',').map(Number)) : null;
  const todo = mergedPRs()
    .filter((pr) => !only || only.has(pr.number))
    .filter((pr) => !isRelease(pr))
    .filter((pr) => {
      const entry = index[pr.number];
      if (!entry || entry.sha !== pr.sha) return true;
      return entry.status === 'failed' && args['retry-failed'];
    })
    .reverse(); // oldest first, so dependencies mostly change forwards

  if (!todo.length) return console.log('All versions already built.');
  console.log(`Building ${todo.length} version(s): ${todo.map((p) => `#${p.number}`).join(', ')}`);

  // One reused worktree, so node_modules carries over while package-lock.json stays the same
  const work = join(tmpdir(), 'debugled-version-build');
  await rm(work, { recursive: true, force: true });
  git('worktree', 'prune');
  git('worktree', 'add', '--detach', work, todo[0].sha);
  let lastLock = null;

  try {
    for (const pr of todo) {
      console.log(`\n=== PR #${pr.number}: ${pr.title} (${pr.sha.slice(0, 7)}) ===`);
      const dest = join(STORE, `pr-${pr.number}`);
      try {
        execFileSync('git', ['checkout', '--force', '--detach', pr.sha], { cwd: work, stdio: 'inherit' });
        execFileSync('git', ['clean', '-fdxq', '-e', 'node_modules'], { cwd: work, stdio: 'inherit' });
        const lock = existsSync(join(work, 'package-lock.json')) ? await readFile(join(work, 'package-lock.json'), 'utf8') : '';
        if (lock !== lastLock) {
          await rm(join(work, 'node_modules'), { recursive: true, force: true });
          // Early PRs have no lockfile: resolve dependencies as they were on the merge date,
          // or today's releases may no longer build that code
          const install = ['install', '--no-audit', '--no-fund', '--no-save', `--before=${pr.date}`];
          if (lock) {
            try {
              run('npm', ['ci', '--no-audit', '--no-fund'], work);
            } catch {
              run('npm', install, work);
            }
          } else {
            run('npm', install, work);
          }
          lastLock = lock;
        }
        run('npx', ['astro', 'build'], work);
        await rm(dest, { recursive: true, force: true });
        await cp(join(work, 'dist'), dest, { recursive: true });
        index[pr.number] = { ...pr, status: 'ok' };
      } catch (err) {
        console.error(`PR #${pr.number} failed to build: ${err.message}`);
        lastLock = null; // the install may be half done
        await rm(dest, { recursive: true, force: true });
        index[pr.number] = { ...pr, status: 'failed' };
      }
      await mkdir(STORE, { recursive: true });
      await writeFile(INDEX, JSON.stringify(index, null, 2) + '\n');
    }
  } finally {
    git('worktree', 'remove', '--force', work);
  }
}

// ---- assemble ----

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])));
  return nested.flat();
}

// Astro's _astro/ files have a content hash in their name, so the same name means
// the same file in every version. They live once in /versions/_astro/ instead of in
// each version (one build alone carries a 52 MB GIF). A name that does show up with
// different bytes (a "conflict") stays inside its own version.
// Files the release itself already serves at /_astro/ aren't pooled at all.
const POOL = `${PREFIX}/_astro`;
const inRelease = new Set();

// "/blog" -> "/versions/pr-3/blog", "/_astro/x.js" -> "/versions/_astro/x.js".
// Leaves "//cdn", "https://" and relative paths alone.
function rewriteUrl(url, ctx) {
  if (!url.startsWith('/') || url.startsWith('//') || url.startsWith(PREFIX + '/')) return url;
  if (url.startsWith('/_astro/')) {
    const name = url.slice('/_astro/'.length).split(/[?#]/)[0];
    if (ctx.conflicts.has(name)) return ctx.base + url;
    return inRelease.has(name) ? url : PREFIX + url;
  }
  return ctx.base + url;
}

function rewriteHtml(html, ctx) {
  // url-valued attributes, including data-* ones that hold a path
  html = html.replace(/(\s(?:href|src|action|poster|data-[\w-]+)\s*=\s*)(["'])(\/(?!\/)[^"']*)\2/gi,
    (_, attr, q, url) => `${attr}${q}${rewriteUrl(url, ctx)}${q}`);
  html = html.replace(/(\s(?:srcset|imagesrcset)\s*=\s*)(["'])([^"']*)\2/gi, (_, attr, q, set) =>
    `${attr}${q}${set.replace(/(^|,\s*)(\/(?!\/)\S+)/g, (m, sep, url) => sep + rewriteUrl(url, ctx))}${q}`);
  // <meta http-equiv="refresh" content="0;url=/x"> (Astro redirects)
  html = html.replace(/(content\s*=\s*["'][^"']*url=)(\/(?!\/)[^"']*)/gi, (_, pre, url) => pre + rewriteUrl(url, ctx));
  // inline styles and scripts
  return rewriteJs(rewriteCss(html, ctx), ctx);
}

function rewriteCss(css, ctx) {
  return css.replace(/url\(\s*(["']?)(\/(?!\/)[^"')]*)\1\s*\)/g, (_, q, url) => `url(${q}${rewriteUrl(url, ctx)}${q})`);
}

// Bundled scripts only reference assets as "/_astro/..." string literals
function rewriteJs(js, ctx) {
  return js.replace(/(["'`])(\/_astro\/[^"'`]*)/g, (_, q, url) => q + rewriteUrl(url, ctx));
}

const sameBytes = async (a, b) => (await readFile(a)).equals(await readFile(b));

function injectHead(html, pr) {
  const tags = [
    '<meta name="robots" content="noindex">',
    `<meta name="debugled-version" content="pr-${pr.number}">`,
    `<script src="/version-switcher.js" defer></script>`,
  ].join('');
  // Old versions never count towards analytics
  html = html.replace(/<meta name="goatcounter-code"[^>]*>/g, '');
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tags) : tags + html;
}

async function assemble() {
  const out = resolve(typeof args.out === 'string' ? args.out : 'dist');
  const index = await loadIndex();
  const versionsDir = join(out, PREFIX.slice(1));
  await rm(versionsDir, { recursive: true, force: true });
  await mkdir(versionsDir, { recursive: true });

  const listed = [];
  const pooledNew = [];
  for (const pr of mergedPRs()) {
    const entry = index[pr.number];
    if (isRelease(pr) || entry?.sha !== pr.sha || entry.status !== 'ok') continue;
    const src = join(STORE, `pr-${pr.number}`);
    if (!(await stat(src).catch(() => null))) continue;

    const base = `${PREFIX}/pr-${pr.number}`;
    const dest = join(out, base.slice(1));
    const ctx = { base, conflicts: new Set() };
    await cp(src, dest, { recursive: true });

    // Move hashed assets into the shared pool
    const astroDir = join(dest, '_astro');
    if (await stat(astroDir).catch(() => null)) {
      for (const file of await walk(astroDir)) {
        const name = relative(astroDir, file).split(sep).join('/');
        const pooled = join(out, POOL.slice(1), name);
        const release = join(out, '_astro', name);
        if (inRelease.has(name) || (existsSync(release) && (await sameBytes(file, release)))) {
          inRelease.add(name);
          await rm(file);
        } else if (!existsSync(pooled)) {
          await mkdir(dirname(pooled), { recursive: true });
          await rename(file, pooled);
          pooledNew.push(pooled);
        } else if (await sameBytes(file, pooled)) {
          await rm(file);
        } else {
          console.warn(`  #${pr.number}: _astro/${name} differs from the pooled copy; keeping it in the version`);
          ctx.conflicts.add(name);
        }
      }
    }

    for (const file of await walk(dest)) {
      const ext = extname(file);
      if (!['.html', '.css', '.js', '.mjs'].includes(ext)) continue;
      let text = await readFile(file, 'utf8');
      if (ext === '.html') text = injectHead(rewriteHtml(text, ctx), pr);
      else if (ext === '.css') text = rewriteCss(text, ctx);
      else text = rewriteJs(text, ctx);
      await writeFile(file, text);
    }
    listed.push({ id: `pr-${pr.number}`, number: pr.number, title: pr.title, branch: pr.branch, date: pr.date, sha: pr.sha });
  }

  // Pooled files point at other pooled files, never at a version
  const poolCtx = { base: '', conflicts: new Set() };
  for (const file of pooledNew) {
    const ext = extname(file);
    if (ext === '.css') await writeFile(file, rewriteCss(await readFile(file, 'utf8'), poolCtx));
    else if (ext === '.js' || ext === '.mjs') await writeFile(file, rewriteJs(await readFile(file, 'utf8'), poolCtx));
  }

  await writeFile(join(versionsDir, 'versions.json'), JSON.stringify({ versions: listed }, null, 2) + '\n');
  console.log(`Assembled ${listed.length} version(s) into ${versionsDir}`);
}

await (command === 'build' ? build() : assemble());
