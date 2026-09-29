'use strict';

const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
const canHover = matchMedia('(hover:hover) and (pointer:fine)').matches;
const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;

const pieces = [
  { cat: 'bows', name: 'The Noir Satin Bow', price: 35, img: '1596462502278-27bfdc403348', desc: 'Oversized hand-folded satin with a hidden barrette clip.' },
  { cat: 'bows', name: 'Champagne Velvet Bow', price: 40, img: '1503342217505-b0a15ec3261c', desc: 'Soft velvet loops edged in gold-toned trim.' },
  { cat: 'crowns', name: 'Rose Garland Crown', price: 85, img: '1490750967868-88aa4486c946', desc: 'Silk blooms and pearl accents on a fitted wire band.' },
  { cat: 'crowns', name: 'Blush Halo', price: 95, img: '1522337360788-8b13dee7a37e', desc: 'A weightless halo of hand-shaped petals for the bride.' },
  { cat: 'fascinators', name: 'Midnight Fascinator', price: 120, img: '1487530811176-3780de880c2d', desc: 'Sculpted feathers and netting, set at a flattering angle.' },
  { cat: 'fascinators', name: 'Gilded Feather Piece', price: 135, img: '1519741497674-611481863552', desc: 'Statement headpiece for galas and race-day style.' },
  { cat: 'corsages', name: 'Pearl Wrist Corsage', price: 45, img: '1523438885200-e635ba2c371e', desc: 'Petite blooms on a satin wristband, sewn to match your gown.' },
  { cat: 'boutonnieres', name: 'Ivory Boutonniere', price: 25, img: '1507003211169-0a1dd7228f2d', desc: 'A crisp lapel bloom wrapped in silk ribbon.' }
];

/* ---------- Gallery build (flat blush shows until each image loads) ---------- */
const grid = document.getElementById('grid');
grid.innerHTML = pieces.map(p => `
  <article class="card" data-cat="${p.cat}" tabindex="0">
    <img src="${U(p.img)}" alt="${p.name}" loading="lazy">
    <h3>${p.name}</h3>
    <div class="over">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <span class="price">Starting at $${p.price}</span>
      <a href="#commission" data-style="${p.name}">Commission This Style</a>
    </div>
  </article>`).join('');
const cards = [...grid.children];
grid.querySelectorAll('img').forEach(img => {
  const ok = () => img.classList.add('loaded');
  img.complete && img.naturalWidth ? ok() : img.addEventListener('load', ok, { once: true });
});

/* ---------- Cinematic staggered entrance matrix ---------- */
const stagger = (els, base = 50, step = 70) => {
  els.forEach((el, i) => {
    el.style.setProperty('--d', `${base + i * step}ms`);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  });
};
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  const t = e.target;
  if (t === grid) stagger(cards.filter(c => !c.classList.contains('hide')));
  else if (t.classList.contains('filters')) { t.classList.add('in'); [...t.children].forEach((b, i) => b.style.setProperty('--d', `${50 + i * 70}ms`)); }
  else stagger([...t.children]);
  io.unobserve(t);
}), { threshold: 0.15 });
document.querySelectorAll('[data-stagger], .filters, #grid').forEach(el => io.observe(el));

/* ---------- Filters (re-run the cascade on every change) ---------- */
const buttons = document.querySelectorAll('.filters button');
buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.filter, shown = [];
  cards.forEach(c => {
    const show = f === 'all' || c.dataset.cat === f;
    c.classList.remove('in');
    c.classList.toggle('hide', !show);
    if (show) shown.push(c);
  });
  stagger(shown);
}));

/* ---------- Scroll-driven typography (exact scroll percentages) ---------- */
const scaleEls = [...document.querySelectorAll('[data-scale]')];
const marks = [...document.querySelectorAll('[data-mark]')];
const heroCopy = document.querySelector('[data-hero]');
const nav = document.getElementById('nav');
let ticking = false;

function scrollCraft() {
  const vh = innerHeight;
  const y = scrollY;
  nav.classList.toggle('small', y > 60);
  if (!calm) {
    // hero headline grows and fades across the first viewport
    const hp = Math.min(Math.max(y / vh, 0), 1);
    heroCopy.style.setProperty('--hs', (1 + hp * 0.35).toFixed(3));
    heroCopy.style.setProperty('--ho', (1 - hp * 1.1).toFixed(3));
    // headings scale 0.8 -> 1.08 as they travel through the viewport
    scaleEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = Math.min(Math.max(1 - r.top / (vh * 0.9), 0), 1);
      el.style.setProperty('--s', (0.8 + p * 0.28).toFixed(3));
    });
    // watermarks slide horizontally with their section's own scroll percentage
    marks.forEach(el => {
      const sec = el.parentElement.getBoundingClientRect();
      const p = Math.min(Math.max((vh - sec.top) / (vh + sec.height), 0), 1);
      const range = Math.max(el.scrollWidth - innerWidth, 200);
      el.style.setProperty('--x', `${(-p * range).toFixed(1)}px`);
    });
  }
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(scrollCraft); } }, { passive: true });
addEventListener('resize', scrollCraft);
scrollCraft();

/* ---------- Magnetic attraction (35px radius, elastic snap) ---------- */
if (canHover && !calm) {
  const mags = [...document.querySelectorAll('.mag')];
  const RADIUS = 35, PULL = 0.4;
  addEventListener('mousemove', e => {
    mags.forEach(el => {
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) <= RADIUS) {
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        el.style.transform = `translate(${((e.clientX - cx) * PULL).toFixed(1)}px,${((e.clientY - cy) * PULL).toFixed(1)}px)`;
        el.dataset.pulled = '1';
      } else if (el.dataset.pulled) {
        el.style.transform = '';
        delete el.dataset.pulled;
      }
    });
  }, { passive: true });
}

/* ---------- 3D card tilt with shadow physics ---------- */
if (canHover && !calm) {
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.classList.remove('leave');
      card.style.setProperty('--rx', `${(-py * 16).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(px * 18).toFixed(2)}deg`);
      card.style.setProperty('--sx', `${(-px * 36).toFixed(1)}px`);
      card.style.setProperty('--sy', `${(14 - py * 30).toFixed(1)}px`);
      card.style.setProperty('--ix', `${(-px * 22).toFixed(1)}px`);
      card.style.setProperty('--iy', `${(-py * 22).toFixed(1)}px`);
    });
    card.addEventListener('mouseleave', () => {
      card.classList.add('leave');
      ['--rx', '--ry', '--sx', '--sy', '--ix', '--iy'].forEach(v => card.style.removeProperty(v));
    });
  });
}

/* ---------- Commission form ---------- */
const form = document.getElementById('form');
const notes = document.getElementById('notes');
document.getElementById('yr').textContent = new Date().getFullYear();
form.date.min = new Date().toISOString().split('T')[0];
grid.addEventListener('click', e => {
  const link = e.target.closest('[data-style]');
  if (link) notes.value = `I would like a piece inspired by "${link.dataset.style}". `;
});
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach(input => {
    const valid = input.value.trim() !== '' && input.checkValidity();
    input.parentElement.classList.toggle('err', !valid);
    if (!valid && ok) { input.focus(); ok = false; }
  });
  if (ok) openModal();
});
form.addEventListener('input', e => e.target.parentElement.classList.remove('err'));

/* ---------- Confirmation modal ---------- */
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
function openModal() { modal.hidden = false; closeBtn.focus(); }
function closeModal() { modal.hidden = true; form.reset(); }
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
