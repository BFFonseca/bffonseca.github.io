// Version switcher. Loaded by the release site (Nav) and injected into every old
// version by scripts/versions.mjs, always from the release root, so old versions
// run the current switcher no matter when they were built.
//
// Release: fills each [data-version-switcher] slot with a dropdown.
// Old version: adds a banner to the top of the page with the dropdown and a way back.
(() => {
  if (window.__versionSwitcher) return; // the release Nav and an injected tag can both load it
  window.__versionSwitcher = true;

  const match = location.pathname.match(/^\/versions\/(pr-\d+)(\/.*)?$/);
  const current = match ? match[1] : 'release';
  const rest = (match ? match[2] : location.pathname) || '/';
  const baseOf = (id) => (id === 'release' ? '' : `/versions/${id}`);

  // Same page in the other version, or that version's home page if the page didn't exist yet
  async function go(id) {
    const base = baseOf(id);
    const target = base + rest + location.search + location.hash;
    try {
      const res = await fetch(base + rest, { method: 'HEAD' });
      location.href = res.ok ? target : base + '/';
    } catch {
      location.href = target;
    }
  }

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  function dropdown(versions, className) {
    const select = document.createElement('select');
    select.className = className;
    select.setAttribute('aria-label', 'Site version');
    const options = [{ id: 'release', label: 'release' }].concat(
      versions.map((v) => ({ id: v.id, label: `#${v.number} · ${v.title} · ${formatDate(v.date)}` })),
    );
    for (const { id, label } of options) {
      const option = new Option(label, id, false, id === current);
      select.add(option);
    }
    select.addEventListener('change', () => go(select.value));
    return select;
  }

  function banner(versions) {
    const v = versions.find((x) => x.id === current);
    const style = document.createElement('style');
    style.textContent = `
      .vs-banner{position:relative;z-index:1000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.5rem 1rem;
        padding:.6rem 1rem;background:#FAC775;color:#412402;font:500 13px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-align:center}
      .vs-banner a{color:inherit;text-decoration:underline;cursor:pointer}
      .vs-banner select{max-width:14rem;font:inherit;color:inherit;background:#FAEEDA;border:1px solid #854F0B;border-radius:6px;padding:.15rem .4rem}`;
    const bar = document.createElement('div');
    bar.className = 'vs-banner';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Site version');
    const text = document.createElement('span');
    text.textContent = v
      ? `You're viewing an old version: PR #${v.number} "${v.title}", ${formatDate(v.date)}`
      : "You're viewing an old version of this site";
    const back = document.createElement('a');
    back.textContent = 'Back to release';
    back.href = rest;
    back.addEventListener('click', (e) => {
      e.preventDefault();
      go('release');
    });
    bar.append(text, dropdown(versions, ''), back);
    document.head.append(style);
    document.body.prepend(bar);
  }

  async function init() {
    let versions;
    try {
      const res = await fetch('/versions/versions.json', { cache: 'no-cache' });
      if (!res.ok) return; // no versions published (e.g. dev server): show nothing
      ({ versions } = await res.json());
    } catch {
      return;
    }

    if (current !== 'release') return banner(versions);
    if (!versions.length) return;
    for (const slot of document.querySelectorAll('[data-version-switcher]')) {
      slot.append(dropdown(versions, 'version-select'));
      slot.hidden = false;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
