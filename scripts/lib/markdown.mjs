// Dependency-free Markdown to HTML renderer used by scripts/build-docs.mjs.
// Scope: the subset of Markdown used by this repository's documentation (headings, paragraphs,
// emphasis, code, fenced code, tables, nested lists, task lists, blockquotes, rules, images, links).
// All text is HTML-escaped; raw HTML in a source file is rendered as literal text, never executed.

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Plain text of an inline Markdown fragment (for slugs, TOC entries and labels). */
export function plain(src) {
  return src
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`+([^`]+)`+/g, '$1')
    .replace(/\\([\\`*_{}\[\]()#+\-.!|<>~])/g, '$1')
    .replace(/(\*\*|__|\*|_)(?=\S)(.+?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugify(text) {
  return (
    plain(text)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

const TOKEN = /\u0000(\d+)\u0000/g;

function inlineRaw(src, stash, ctx) {
  const put = (html) => {
    stash.push(html);
    return `\u0000${stash.length - 1}\u0000`;
  };
  let s = src;
  // code spans first, so nothing inside them is interpreted
  s = s.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (_m, _t, code) => put(`<code>${esc(code.replace(/\n/g, ' ').trim())}</code>`));
  // backslash escapes
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|<>~])/g, (_m, c) => put(esc(c)));
  // images
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, alt, url, title) => {
    const src2 = ctx.mapUrl(url, 'img');
    return put(`<img src="${esc(src2)}" alt="${esc(plain(alt))}"${title ? ` title="${esc(title)}"` : ''} loading="lazy" decoding="async">`);
  });
  // links (one level of nested brackets allowed in the text)
  s = s.replace(/\[((?:[^\[\]]|\[[^\]]*\])*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_m, text, url, title) => {
    const href = ctx.mapUrl(url, 'link');
    const ext = /^https?:/i.test(href);
    return put(`<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${ext ? ' rel="noopener"' : ''}>${inlineRaw(text, stash, ctx)}</a>`);
  });
  // autolinks and bare URLs
  s = s.replace(/<(https?:\/\/[^>\s]+)>/g, (_m, u) => put(`<a href="${esc(u)}" rel="noopener">${esc(u)}</a>`));
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]*[^\s<).,;:!?])/g, (_m, pre, u) => `${pre}${put(`<a href="${esc(u)}" rel="noopener">${esc(u)}</a>`)}`);
  s = esc(s);
  // hard line breaks (two trailing spaces) then emphasis
  s = s.replace(/ {2,}\n/g, '<br>\n');
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^\w])__(?=\S)([\s\S]*?\S)__(?!\w)/g, '$1<strong>$2</strong>');
  s = s.replace(/(^|[^*\w])\*(?=[^\s*])([^*]*?[^\s*])\*(?!\*)/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^\w])_(?=[^\s_])([^_]*?[^\s_])_(?!\w)/g, '$1<em>$2</em>');
  return s;
}

export function inline(src, ctx) {
  const stash = [];
  let s = inlineRaw(src, stash, ctx);
  while (TOKEN.test(s)) {
    TOKEN.lastIndex = 0;
    s = s.replace(TOKEN, (_m, i) => stash[Number(i)]);
  }
  TOKEN.lastIndex = 0;
  return s.trim();
}

// ---------- block level ----------

const RE = {
  fence: /^(\s*)(`{3,}|~{3,})\s*([\w+-]*)\s*$/,
  heading: /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/,
  hr: /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/,
  quote: /^\s{0,3}>/,
  list: /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/,
  sep: /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)*\|?\s*$/,
};

const indentOf = (line) => line.match(/^\s*/)[0].replace(/\t/g, '    ').length;

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  let inCode = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '`') inCode = !inCode;
    if (ch === '\\' && s[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (ch === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}

const startsBlock = (line) =>
  RE.fence.test(line) || RE.heading.test(line) || RE.hr.test(line) || RE.quote.test(line) ||
  /^\s{0,3}(?:[-*+]|1[.)])\s+\S/.test(line);

/** Linear `flowchart` with a single unbranched path => ordered list of labels, else null. */
export function linearFlow(source) {
  const lines = source.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!/^(flowchart|graph)\s+(LR|RL|TD|TB|BT)\b/i.test(lines[0] || '')) return null;
  const labels = new Map();
  const edges = [];
  const nodeRe = /^([A-Za-z_][\w-]*)(?:\s*\[\s*"?([^\]"]*)"?\s*\]|\s*\(\s*"?([^)"]*)"?\s*\))?$/;
  for (const line of lines.slice(1)) {
    if (/^(subgraph|end\b|classDef|class\s|style\s|click\s|%%)/i.test(line) || /[{}]/.test(line)) return null;
    const parts = line.split(/\s*(?:-->|---|-\.->|==>)\s*(?:\|[^|]*\|\s*)?/);
    if (parts.length < 2 && !nodeRe.test(line)) return null;
    let prev = null;
    for (const raw of parts) {
      if (/--\s*"/.test(raw) || /-- /.test(raw)) return null;
      const m = raw.trim().match(nodeRe);
      if (!m) return null;
      const id = m[1];
      const label = m[2] ?? m[3];
      if (label !== undefined && !labels.has(id)) labels.set(id, label.replace(/<br\s*\/?>/gi, ' ').trim());
      if (!labels.has(id)) labels.set(id, id);
      if (prev) edges.push([prev, id]);
      prev = id;
    }
  }
  if (edges.length < 1) return null;
  const out = new Map();
  const inn = new Map();
  for (const [a, b] of edges) {
    if (out.has(a) || inn.has(b)) return null;
    out.set(a, b);
    inn.set(b, a);
  }
  const starts = [...labels.keys()].filter((id) => !inn.has(id));
  if (starts.length !== 1) return null;
  const order = [];
  const seen = new Set();
  for (let id = starts[0]; id; id = out.get(id)) {
    if (seen.has(id)) return null;
    seen.add(id);
    order.push(labels.get(id));
  }
  return order.length === labels.size ? order : null;
}

export function renderBlocks(input, ctx) {
  const lines = Array.isArray(input) ? input : input.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    let m = line.match(RE.fence);
    if (m) {
      const [, , marker, lang] = m;
      const body = [];
      i += 1;
      while (i < lines.length && !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1;
      out.push(codeBlock(body.join('\n'), lang, ctx));
      continue;
    }

    m = line.match(RE.heading);
    if (m) {
      out.push(ctx.heading(m[1].length, m[2]));
      i += 1;
      continue;
    }

    if (RE.hr.test(line) && !RE.list.test(line)) { out.push('<hr>'); i += 1; continue; }

    if (RE.quote.test(line)) {
      const body = [];
      while (i < lines.length && lines[i].trim() && RE.quote.test(lines[i])) { body.push(lines[i].replace(/^\s{0,3}>\s?/, '')); i += 1; }
      out.push(`<blockquote>\n${renderBlocks(body, ctx)}\n</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && RE.sep.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitRow(line);
      const seps = splitRow(lines[i + 1]);
      const align = seps.map((c) => (/^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : ''));
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes('|')) { rows.push(splitRow(lines[i])); i += 1; }
      out.push(table(head, rows, align, ctx));
      continue;
    }

    m = line.match(RE.list);
    if (m && !RE.hr.test(line)) {
      const res = parseList(lines, i, ctx);
      out.push(res.html);
      i = res.next;
      continue;
    }

    // paragraph
    const para = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i]) &&
      !(lines[i].includes('|') && i + 1 < lines.length && RE.sep.test(lines[i + 1]) && lines[i + 1].includes('-'))) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(`<p>${inline(para.map((l, k) => (k === para.length - 1 ? l.replace(/\s+$/, '') : l)).join('\n'), ctx)}</p>`);
  }
  return out.join('\n');
}

function parseList(lines, start, ctx) {
  const first = lines[start].match(RE.list);
  const baseIndent = indentOf(lines[start]);
  const ordered = /\d/.test(first[2]);
  const startNum = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let i = start;
  let loose = false;
  while (i < lines.length) {
    const m = lines[i].match(RE.list);
    if (!m || indentOf(lines[i]) !== baseIndent || /\d/.test(m[2]) !== ordered || RE.hr.test(lines[i])) break;
    const markerWidth = lines[i].indexOf(m[3], lines[i].indexOf(m[2]) + m[2].length);
    const contentIndent = markerWidth > 0 ? markerWidth : baseIndent + 2;
    const content = [m[3]];
    i += 1;
    let sawBlank = false;
    while (i < lines.length) {
      const ln = lines[i];
      if (!ln.trim()) {
        // blank line: continues the item only if the next non-blank line is indented under it
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j += 1;
        if (j < lines.length && indentOf(lines[j]) > baseIndent) { content.push(''); sawBlank = true; i += 1; continue; }
        if (j < lines.length && indentOf(lines[j]) === baseIndent && RE.list.test(lines[j]) && /\d/.test(lines[j].match(RE.list)[2]) === ordered) loose = true;
        break;
      }
      const ind = indentOf(ln);
      if (ind > baseIndent) { content.push(ln.slice(Math.min(contentIndent, ln.length - ln.trimStart().length))); i += 1; continue; }
      if (ind === baseIndent && RE.list.test(ln)) break;
      if (!sawBlank && !startsBlock(ln) && ind >= baseIndent) { content.push(ln.trim()); i += 1; continue; } // lazy continuation
      break;
    }
    items.push(content);
    if (sawBlank) loose = true;
  }
  const lis = items.map((content) => {
    let first2 = content[0];
    let task = '';
    const tm = first2.match(/^\[([ xX])\]\s+(.*)$/);
    if (tm) {
      const done = tm[1] !== ' ';
      task = `<span class="task" data-done="${done}"><span aria-hidden="true">${done ? '☑' : '☐'}</span><span class="visually-hidden">${done ? 'Done:' : 'To do:'}</span></span> `;
      first2 = tm[2];
    }
    const body = [first2, ...content.slice(1)];
    let html = renderBlocks(body, ctx);
    if (!loose) html = html.replace(/^<p>([\s\S]*?)<\/p>/, '$1');
    return `<li>${task}${html}</li>`;
  });
  const tag = ordered ? 'ol' : 'ul';
  const startAttr = ordered && startNum !== 1 ? ` start="${startNum}"` : '';
  return { html: `<${tag}${startAttr}>\n${lis.join('\n')}\n</${tag}>`, next: i };
}

function table(head, rows, align, ctx) {
  const cls = (k) => (align[k] ? ` class="align-${align[k]}"` : '');
  const th = head.map((c, k) => `<th scope="col"${cls(k)}>${inline(c, ctx)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${head.map((_h, k) => `<td${cls(k)}>${inline(r[k] ?? '', ctx)}</td>`).join('')}</tr>`)
    .join('\n');
  const label = ctx.tableLabel();
  return `<div class="table-wrap" role="region" aria-label="${esc(label)}" tabindex="0">\n<table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${body}\n</tbody>\n</table>\n</div>`;
}

function codeBlock(code, lang, ctx) {
  if (lang === 'mermaid') {
    const flow = linearFlow(code);
    if (flow) {
      const steps = flow.map((l) => `<li>${esc(l)}</li>`).join('\n');
      return `<figure class="flow">\n<figcaption>Investigation flow</figcaption>\n<ol class="flow__steps">\n${steps}\n</ol>\n</figure>`;
    }
    ctx.notes.push('mermaid: branching chart rendered as labelled source');
    return `<figure class="code-figure">\n<figcaption>Diagram source (Mermaid). This flowchart branches, so it is shown as text rather than as an ordered list.</figcaption>\n<pre tabindex="0"><code class="language-mermaid">${esc(code)}</code></pre>\n</figure>`;
  }
  const label = lang ? ` class="language-${esc(lang)}"` : '';
  return `<pre tabindex="0"><code${label}>${esc(code)}</code></pre>`;
}
