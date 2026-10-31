/* VulnGPT showcase: vanilla progressive enhancement. No inline scripts; pages work without this file. */
(() => {
  'use strict';
  const d = document;
  const root = d.documentElement;
  root.classList.add('js');
  const $ = (s, r = d) => r.querySelector(s);
  const $$ = (s, r = d) => Array.from(r.querySelectorAll(s));
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Mobile navigation */
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  if (toggle && nav) {
    const set = (open, back) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      if (!open && back) toggle.focus();
    };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') set(false, true);
    });
    d.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) set(false);
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  /* Lightbox: native <dialog> gives modal focus containment and Esc; we restore focus and handle the backdrop */
  const links = $$('[data-lightbox]');
  if (links.length && typeof HTMLDialogElement === 'function') {
    const dlg = d.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-labelledby', 'lb-title');
    dlg.innerHTML =
      '<div class="lightbox__bar"><p class="lightbox__title" id="lb-title"></p>' +
      '<button type="button" class="lightbox__close">Close</button></div>' +
      '<div class="lightbox__stage" tabindex="0" role="region" aria-label="Full-size capture"><img alt=""></div>' +
      '<p class="lightbox__cap"></p>';
    d.body.appendChild(dlg);
    const title = $('.lightbox__title', dlg);
    const cap = $('.lightbox__cap', dlg);
    const pic = $('img', dlg);
    const closeBtn = $('.lightbox__close', dlg);
    let from = null;
    const open = (a) => {
      from = a;
      const thumb = $('img', a);
      title.textContent = (a.dataset.title || 'Capture') + ' · full size';
      cap.textContent = a.dataset.caption || '';
      pic.alt = thumb ? thumb.alt : '';
      pic.src = a.href;
      dlg.showModal();
      closeBtn.focus();
    };
    links.forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      open(a);
    }));
    closeBtn.addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => {
      pic.removeAttribute('src');
      if (from) from.focus();
    });
  }

  /* Section index sync (tour rail, product table of contents) */
  if ('IntersectionObserver' in window) {
    $$('[data-spy]').forEach((rail) => {
      const map = new Map();
      $$('a[href^="#"]', rail).forEach((a) => {
        const t = d.getElementById(a.getAttribute('href').slice(1));
        if (t) map.set(t, a);
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          map.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
          const a = map.get(en.target);
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'location');
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      map.forEach((_, t) => io.observe(t));
    });

    /* Reveal: only elements already below the fold get hidden, so slow scripts never blank the page */
    if (!calm) {
      const els = $$('[data-reveal]').filter((el) => el.getBoundingClientRect().top > innerHeight);
      if (els.length) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
          });
        }, { rootMargin: '0px 0px -8% 0px' });
        els.forEach((el) => { el.classList.add('reveal-pending'); io.observe(el); });
      }
    }
  }
})();
