'use strict';

const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

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

const fallback = 'linear-gradient(135deg,#1a1a1c,#2a1a1e 60%,#3a2d12)';

/* Build the gallery */
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

grid.querySelectorAll('img').forEach(img =>
  img.addEventListener('error', () => { img.removeAttribute('src'); img.style.background = fallback; }, { once: true }));
document.querySelector('.hero-img').addEventListener('error', e => { e.target.style.background = fallback; });
document.querySelector('.craft-img img').addEventListener('error', e => { e.target.style.background = fallback; });

/* Filters */
const buttons = document.querySelectorAll('.filters button');
const cards = [...grid.children];
buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.filter;
  cards.forEach(c => {
    const show = f === 'all' || c.dataset.cat === f;
    c.classList.toggle('hide', !show);
    if (show) {
      c.classList.add('enter');
      requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('enter')));
    }
  });
}));

/* Scroll reveal */
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Nav shrink + year */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('small', scrollY > 60), { passive: true });
document.getElementById('yr').textContent = new Date().getFullYear();

/* Commission form */
const form = document.getElementById('form');
const notes = document.getElementById('notes');
grid.addEventListener('click', e => {
  const link = e.target.closest('[data-style]');
  if (link) notes.value = `I would like a piece inspired by "${link.dataset.style}". `;
});
form.date.min = new Date().toISOString().split('T')[0];

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

/* Modal */
const modal = document.getElementById('modal');
const closeBtn = document.getElementById('close');
function openModal() { modal.hidden = false; closeBtn.focus(); }
function closeModal() { modal.hidden = true; form.reset(); }
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
