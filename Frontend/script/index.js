
// ── Nav scroll shadow ─────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ── Hamburger menu ────────────────────────────────────────
function toggleMenu() {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobileMenu');
  h.classList.toggle('open');
  m.classList.toggle('open');
}
// Close on outside click
document.addEventListener('click', e => {
  const h = document.getElementById('hamburger');
  const m = document.getElementById('mobileMenu');
  if (!h.contains(e.target) && !m.contains(e.target)) {
    h.classList.remove('open');
    m.classList.remove('open');
  }
});

// ── Scroll reveal ─────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
