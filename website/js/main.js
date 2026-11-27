// ---- Configure your WhatsApp number here (country code, no +) ----
const WHATSAPP_NUMBER = '447741922710';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

$('#year') && ($('#year').textContent = new Date().getFullYear());

// ---------- Mobile menu ----------
const menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
menuBtn?.addEventListener('click', () => navLinks.classList.toggle('open'));
$$('#navLinks a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ---------- Language toggle (English <-> Hindi) ----------
const langBtn = $('#langToggle');
let lang = localStorage.getItem('lang') || 'en';
function applyLang() {
  $$('[data-en]').forEach(el => { el.innerHTML = el.dataset[lang]; });
  document.documentElement.lang = lang === 'en' ? 'en-GB' : 'hi';
  if (langBtn) langBtn.textContent = lang === 'en' ? 'हिंदी' : 'English';
}
langBtn?.addEventListener('click', () => {
  lang = lang === 'en' ? 'hi' : 'en';
  localStorage.setItem('lang', lang);
  applyLang();
});
if (lang !== 'en') applyLang();

// ---------- Ritual filters (Pujas page) ----------
function setFilter(f) {
  $$('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === f));
  $$('#serviceGrid .card').forEach(card => card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f));
}
$('#filters')?.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (btn) setFilter(btn.dataset.filter);
});
const params = new URLSearchParams(location.search);
if (params.get('cat') && $('#filters')) setFilter(params.get('cat'));

// ---------- Wedding timeline accordion ----------
$$('#timeline li').forEach(li => li.querySelector('button').addEventListener('click', () => li.classList.toggle('open')));
$('#timeline li')?.classList.add('open');

// ---------- Booking form (Contact page) ----------
const sel = $('#ceremonySelect');
if (sel && params.get('pkg')) sel.value = params.get('pkg');
$('#bookForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const msg =
    `🙏 Namaste! I would like to book a ceremony.\n\n` +
    `Name: ${d.name}\nPhone: ${d.phone}\nCeremony: ${d.ceremony}\n` +
    `Date: ${d.date || 'Not decided'}\nLanguage: ${d.language}\n` +
    `Destination/Venue: ${d.city || '-'}\nGuests: ${d.guests || '-'}\nMessage: ${d.message || '-'}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

// ---------- Gallery lightbox ----------
const lb = $('#lightbox');
if (lb) {
  $$('.g-item img').forEach(img => img.addEventListener('click', () => {
    lb.querySelector('img').src = img.src;
    lb.querySelector('img').alt = img.alt;
    lb.querySelector('p').textContent = img.alt;
    lb.classList.add('open');
  }));
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}

// =====================================================================
// Animations
// =====================================================================
// Scroll reveal: each group of elements gets an animation style and a staggered delay
const groups = [
  ['.section-head, .wb-title', 'up'],
  ['.card, .svc, .region, .step, .vow, .pkg, .wf, .pillars div, .journey li, details, .trust-bar div, .ac-card, .film, .puja-setups figure', 'up'],
  ['.sanskara-grid div, .ac-strip img, .socials a', 'zoom'],
  ['.ex-tile', 'rise'],
  ['.g-item, .rath-photos figure', 'wipe'],
  ['.meaning-word, .dest-photo, .acharya-photo, .book-info, .rath-text', 'left'],
  ['.dest-split > div:last-child, .meaning-grid > div:last-child, .book-form, .rath-photos', 'right'],
  ['.review-box, .cta-inner, .wedding-intro > div', 'fade'],
];
const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

if (!reduceMotion && io) {
  groups.forEach(([selector, anim]) => {
    $$(selector).forEach(el => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      el.dataset.anim = anim;
      // stagger siblings of the same kind
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.setProperty('--delay', `${(sibs.indexOf(el) % 6) * 90}ms`);
      io.observe(el);
    });
  });
}

// Header shrink + scroll progress bar + parallax
const header = $('.header'), progress = $('#progress');
const parallax = $$('[data-parallax]');
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 40);
  if (progress) {
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  }
  if (!reduceMotion) parallax.forEach(el => { el.style.transform = `translate3d(0, ${y * parseFloat(el.dataset.parallax)}px, 0) scale(1.15)`; });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();

// Page entrance
requestAnimationFrame(() => document.body.classList.add('loaded'));
