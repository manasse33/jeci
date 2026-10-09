/* =====================================================================
   JECI 2026 — main.js
   Composants partagés (navbar, footer), animations, onglets, lightbox
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- Configuration éditable ---------- */
  const SITE = {
    nav: [
      { label: 'Accueil',     href: 'index.html',               page: 'accueil' },
      { label: 'À propos',    href: 'index.html#apropos',       page: 'apropos' },
      { label: 'Programme',   href: 'programme.html',           page: 'programme' },
      { label: 'Intervenants',href: 'intervenants.html',        page: 'intervenants' },
      { label: 'Actualités',  href: 'actualites.html',          page: 'actualites' },
      { label: 'FAQ',         href: 'index.html#faq',           page: 'faq' }
    ],
    cta: { label: 'S’inscrire', href: 'index.html#inscription' },
    email: 'contact@jeci-congo.com',          // À REMPLACER
    telephone: '+242 00 000 0000',            // À REMPLACER
    social: [
      { n: 'Facebook',  u: '#', d: 'M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3z' },
      { n: 'Instagram', u: '#', d: 'M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zm0 1.8A2.7 2.7 0 004.8 7.5v9a2.7 2.7 0 002.7 2.7h9a2.7 2.7 0 002.7-2.7v-9a2.7 2.7 0 00-2.7-2.7h-9zM12 8a4 4 0 110 8 4 4 0 010-8zm0 1.8a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zM17 6.6a1 1 0 110 2 1 1 0 010-2z' },
      { n: 'LinkedIn',  u: '#', d: 'M5.2 8.6h3V19h-3V8.6zM6.7 4a1.7 1.7 0 110 3.5 1.7 1.7 0 010-3.5zM10.3 8.6h2.9v1.4c.4-.8 1.4-1.7 3-1.7 3.1 0 3.7 2 3.7 4.7V19h-3v-5.4c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V19h-3V8.6z' },
      { n: 'WhatsApp',  u: '#', d: 'M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3zm0 1.8a7.2 7.2 0 11-3.7 13.4l-.3-.2-2.7.7.7-2.6-.2-.3A7.2 7.2 0 0112 4.8zm-2.6 3.4c-.2 0-.4 0-.6.3-.2.3-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.6 4 3.5 2 .8 2.4.6 2.8.6.4 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.6-.3l-1.5-.7c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.6-.4z' }
    ]
  };

  const page = document.body.dataset.page || 'accueil';
  const isHome = page === 'accueil';

  /* ---------- Navbar ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    const links = SITE.nav.map(l => {
      const current = (l.page === page) ? ' aria-current="page"' : '';
      return `<a class="nav-link" href="${l.href}"${current}>${l.label}</a>`;
    }).join('');
    const mobile = SITE.nav.map(l =>
      `<a class="block py-3 text-2xl font-display font-bold border-b border-white/10" href="${l.href}">${l.label}</a>`).join('');

    header.innerHTML = `
      <div class="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
        <a href="index.html" aria-label="JECI — Accueil" class="shrink-0">
          <img src="assets/logo/jeci-logo.png" alt="JECI — Journées de l’Entrepreneur Créatif et Innovant" class="h-11 sm:h-12 w-auto rounded-xl shadow-soft" width="107" height="48">
        </a>
        <nav class="hidden lg:flex items-center gap-8 text-ivoire text-[15px]" aria-label="Navigation principale">${links}</nav>
        <div class="flex items-center gap-3">
          <a href="${SITE.cta.href}" class="btn btn-or hidden sm:inline-flex !min-h-[44px] !py-2 !px-5 text-sm">${SITE.cta.label}</a>
          <button id="burger" class="lg:hidden w-12 h-12 rounded-xl border border-white/30 text-ivoire flex items-center justify-center" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu-mobile">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path id="b1" d="M4 7h16"/><path id="b2" d="M4 12h16"/><path id="b3" d="M4 17h16"/></svg>
          </button>
        </div>
      </div>
      <div id="menu-mobile" class="lg:hidden hidden bg-marine text-ivoire px-6 pb-8 pt-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
        ${mobile}
        <a href="${SITE.cta.href}" class="btn btn-or w-full mt-6">${SITE.cta.label}</a>
      </div>`;

    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu-mobile');
    const toggle = (open) => {
      const o = open ?? menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !o);
      burger.setAttribute('aria-expanded', String(o));
      header.classList.toggle('scrolled', o || window.scrollY > 40);
    };
    burger.addEventListener('click', () => toggle());
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40 || !menu.classList.contains('hidden'));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Footer ---------- */
  const footer = document.getElementById('site-footer');
  if (footer) {
    const soc = SITE.social.map(s =>
      `<a href="${s.u}" aria-label="${s.n}" class="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center hover:bg-or hover:text-marine hover:border-or transition">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="${s.d}"/></svg></a>`).join('');
    footer.innerHTML = `
      <div class="relative overflow-hidden bg-marine text-ivoire">
        <div class="blob w-[420px] h-[420px] bg-emeraude/25 -right-40 -top-40"></div>
        <div class="blob w-[260px] h-[260px] bg-or/15 -left-24 -bottom-24"></div>
        <div class="relative max-w-7xl mx-auto px-5 lg:px-8 py-16 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img src="assets/logo/jeci-logo.png" alt="JECI" class="h-14 w-auto rounded-xl mb-6" width="125" height="56">
            <p class="max-w-md text-ivoire/75 leading-relaxed">Les Journées de l’Entrepreneur Créatif et Innovant réunissent à Brazzaville les créateurs, entrepreneurs et porteurs de projets qui construisent le Congo de demain.</p>
            <div class="flex gap-3 mt-6">${soc}</div>
          </div>
          <div>
            <p class="font-display font-bold text-lg mb-4">Navigation</p>
            <ul class="space-y-3 text-ivoire/80">
              <li><a class="hover:text-or" href="index.html">Accueil</a></li>
              <li><a class="hover:text-or" href="index.html#apropos">À propos</a></li>
              <li><a class="hover:text-or" href="programme.html">Programme</a></li>
              <li><a class="hover:text-or" href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div>
            <p class="font-display font-bold text-lg mb-4">Rendez-vous</p>
            <p class="text-ivoire/80 leading-relaxed">10 – 14 novembre 2026<br>Brazzaville, Congo<br><span class="text-ivoire/55">Lieu à confirmer</span></p>
            <p class="mt-4 text-ivoire/80"><a class="hover:text-or" href="mailto:${SITE.email}">${SITE.email}</a></p>
          </div>
        </div>
        <div class="relative border-t border-white/10">
          <div class="max-w-7xl mx-auto px-5 lg:px-8 py-6 flex flex-col sm:flex-row gap-2 justify-between text-sm text-ivoire/60">
            <p class="font-display font-semibold text-or">JECI 2026 — Créons ensemble.</p>
            <p>© 2026 JECI. Tous droits réservés.</p>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Apparition progressive (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  } else reveals.forEach(el => el.classList.add('is-visible'));

  /* ---------- Compteurs (chiffres clés) ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count, dur = 1200, t0 = performance.now();
        const tick = (t) => { const p = Math.min((t - t0) / dur, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick); co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => co.observe(c));
  }

  /* ---------- Onglets génériques (axes, jours du programme) ---------- */
  function tabs(rootSel, tabSel, panelSel, panelAttr) {
    document.querySelectorAll(rootSel).forEach(root => {
      const ts = root.querySelectorAll(tabSel);
      const ps = root.querySelectorAll(panelSel);
      const select = (id) => {
        ts.forEach(t => t.setAttribute('aria-selected', String(t.dataset.target === id)));
        ps.forEach(p => p.classList.toggle('active', p.dataset[panelAttr] === id));
      };
      ts.forEach(t => t.addEventListener('click', () => select(t.dataset.target)));
      if (ts[0]) select(ts[0].dataset.target);
    });
  }
  tabs('[data-tabs="axes"]', '.axe', '.axe-detail', 'panel');
  tabs('[data-tabs="jours"]', '.jour-btn', '.jour-panel', 'panel');

  /* ---------- FAQ (accordéon accessible) ---------- */
  document.querySelectorAll('[data-faq] button').forEach(btn => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      panel.hidden = open;
      btn.querySelector('.plus').style.transform = open ? '' : 'rotate(45deg)';
    });
  });

  /* ---------- Lightbox affiche officielle ---------- */
  const lb = document.getElementById('lightbox');
  if (lb) {
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-open-affiche]').forEach(b => b.addEventListener('click', () => {
      lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('button').focus();
    }));
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('button')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); closeIdea(); } });
  }

  /* ---------- Modale « Partage ton idée » ---------- */
  const idea = document.getElementById('idea-modal');
  function closeIdea() { if (idea) { idea.classList.add('hidden'); idea.classList.remove('flex'); document.body.style.overflow = ''; } }
  if (idea) {
    document.querySelectorAll('[data-open-idea]').forEach(b => b.addEventListener('click', () => {
      idea.classList.remove('hidden'); idea.classList.add('flex'); document.body.style.overflow = 'hidden';
      idea.querySelector('textarea').focus();
    }));
    idea.addEventListener('click', (e) => { if (e.target === idea || e.target.closest('[data-close-idea]')) closeIdea(); });
  }

  /* ---------- Année dynamique éventuelle ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
