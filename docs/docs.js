/* Documentation enhancements: contents rail state and hub search. Vanilla, no inline script; pages work without it. */
(() => {
  'use strict';
  const d = document;
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => Array.from(r.querySelectorAll(s));

  /* Contents rail: open on desktop, collapsed behind a summary on small screens */
  const toc = $('.doc-toc details');
  if (toc) {
    const wide = matchMedia('(min-width: 1040px)');
    const sync = () => { toc.open = wide.matches; };
    sync();
    wide.addEventListener('change', sync);
    toc.addEventListener('click', (e) => { if (e.target.closest('a') && !wide.matches) toc.open = false; });
  }

  /* Hub search: filters the server-rendered list using /docs/search-index.json (titles, descriptions, headings) */
  const form = $('[data-doc-search]');
  if (!form) return;
  const input = $('input[type="search"]', form);
  const field = $('.doc-search__field', form);
  const clear = $('.doc-search__clear', form);
  const count = $('#doc-count', form);
  const none = $('#doc-nomatch');
  const rows = $$('.doc-list li[data-doc]');
  const sections = $$('[data-cat]');
  const hideOnSearch = $$('[data-hide-on-search]');
  const total = rows.length;
  const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

  const hay = new Map(rows.map((li) => [li, norm(li.textContent || '')]));

  let timer = 0;
  const run = () => {
    const q = input.value.trim();
    const terms = norm(q).split(/\s+/).filter(Boolean);
    let shown = 0;
    rows.forEach((li) => {
      const ok = terms.every((t) => (hay.get(li) || '').includes(t));
      li.hidden = !ok;
      if (ok) shown += 1;
    });
    sections.forEach((s) => { s.hidden = !$$('li[data-doc]', s).some((li) => !li.hidden); });
    hideOnSearch.forEach((s) => { s.hidden = terms.length > 0; });
    none.hidden = shown !== 0;
    field.classList.toggle('has-q', q.length > 0);
    clear.hidden = q.length === 0;
    count.textContent = !terms.length
      ? `${total} documents`
      : shown === 0
        ? `No documents match “${q}”`
        : `${shown} of ${total} documents match “${q}”`;
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };

  fetch('/docs/search-index.json', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((items) => {
      items.forEach((it) => {
        const li = rows.find((row) => {
          const a = $('a', row);
          const href = a ? a.getAttribute('href') : '';
          return href === it.url;
        });
        if (li) hay.set(li, norm([it.title, it.heading, it.description, it.category, ...(it.headings || [])].join(' ')));
      });
      run();
    })
    .catch(() => { /* the list text is already indexed as a fallback */ });

  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 80); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
    const first = rows.find((li) => !li.hidden);
    if (first) $('a', first).focus();
  });
  clear.addEventListener('click', () => { input.value = ''; run(); input.focus(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; run(); }
    if (e.key === 'ArrowDown') {
      const first = rows.find((li) => !li.hidden);
      if (first) { e.preventDefault(); $('a', first).focus(); }
    }
  });
  d.addEventListener('keydown', (e) => {
    const t = e.target;
    const typing = t instanceof HTMLElement && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); input.focus(); input.select(); }
  });

  const initial = new URL(location.href).searchParams.get('q');
  if (initial) input.value = initial;
  run();
})();
