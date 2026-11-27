// ---- Configure your WhatsApp number here (country code, no +) ----
const WHATSAPP_NUMBER = '447741922710';

document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Language toggle (English <-> Hindi) for elements with data-en / data-hi
const langBtn = document.getElementById('langToggle');
let lang = localStorage.getItem('lang') || 'en';
function applyLang() {
  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerHTML = el.dataset[lang];
  });
  document.documentElement.lang = lang;
  langBtn.textContent = lang === 'en' ? 'हिंदी' : 'English';
}
langBtn.addEventListener('click', () => {
  lang = lang === 'en' ? 'hi' : 'en';
  localStorage.setItem('lang', lang);
  applyLang();
});
if (lang !== 'en') applyLang();

// Service filters
document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  document.querySelectorAll('#serviceGrid .card').forEach(card => {
    card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f);
  });
});

// Wedding timeline accordion
document.querySelectorAll('#timeline li').forEach(li => {
  li.querySelector('button').addEventListener('click', () => li.classList.toggle('open'));
});
document.querySelector('#timeline li')?.classList.add('open');

// Package buttons pre-select the ceremony in the form
document.querySelectorAll('[data-pkg]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('ceremonySelect').value = btn.dataset.pkg;
  });
});

// Booking form -> WhatsApp message
document.getElementById('bookForm').addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  const msg =
    `🙏 Namaste! I would like to book a ceremony.\n\n` +
    `Name: ${d.name}\nPhone: ${d.phone}\nCeremony: ${d.ceremony}\n` +
    `Date: ${d.date || 'Not decided'}\nLanguage: ${d.language}\n` +
    `Destination/Venue: ${d.city || "-"}\nGuests: ${d.guests || "-"}\nMessage: ${d.message || '-'}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.section-head, .card, .wf, .vow, .pkg, .step, blockquote, .sanskara-grid div, .pillars div, .meaning-word, .arch-frame, details, .svc, .g-item, .wed-banner-text')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

// Service photo cards jump to the matching filter in the ritual list
document.querySelectorAll('.svc[data-go]').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector(`.chip[data-filter="${card.dataset.go}"]`)?.click();
  });
});

// Gallery lightbox
const lb = document.getElementById('lightbox');
document.querySelectorAll('.g-item img').forEach(img => {
  img.addEventListener('click', () => {
    lb.querySelector('img').src = img.src;
    lb.querySelector('img').alt = img.alt;
    lb.querySelector('p').textContent = img.alt;
    lb.classList.add('open');
  });
});
lb.addEventListener('click', () => lb.classList.remove('open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });

// Gallery: show all
const moreBtn = document.getElementById('moreBtn');
moreBtn?.addEventListener('click', () => {
  const g = document.getElementById('galleryGrid');
  const open = g.classList.toggle('collapsed');
  moreBtn.textContent = open ? 'View all photos' : 'Show fewer photos';
  if (open) g.scrollIntoView({ behavior: 'smooth' });
});
