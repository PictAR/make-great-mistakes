// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth-scroll + close mobile menu
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    closeMobileMenu();
    e.preventDefault();
    el.scrollIntoView({ behavior:'smooth', block:'start' });
    history.replaceState(null, '', id);
  });
});

// Click-to-play YouTube (privacy-enhanced)
(() => {
  const card = document.querySelector('.video-card');
  if (!card) return;
  const id = card.dataset.videoId;
  card.addEventListener('click', () => {
    const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
    card.innerHTML = `<iframe src="${src}" title="Great Mistakes music video" frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  }, { once: true });
})();

// Reveal-on-scroll
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
    els.forEach(el => io.observe(el));
  } else { els.forEach(el => el.classList.add('in')); }
})();

// Shrink brand on scroll (optional)
(() => {
  const topbar = document.querySelector('.topbar');
  const hero = document.querySelector('.hero');
  if (!topbar || !hero) return;
  const onScroll = () => {
    const heroH = hero.offsetHeight || 0;
    if (window.scrollY > heroH - 60) topbar.classList.add('scrolled');
    else topbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

// Mobile menu
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');

function openMobileMenu(){
  if (!mobileMenu) return;
  mobileMenu.hidden = false;
  document.body.style.overflow = 'hidden';
  hamburger?.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu(){
  if (!mobileMenu) return;
  mobileMenu.hidden = true;
  document.body.style.overflow = '';
  hamburger?.setAttribute('aria-expanded', 'false');
}
if (hamburger && mobileMenu){
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    expanded ? closeMobileMenu() : openMobileMenu();
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });

  // Ensure mobile menu starts closed on load (in case of cache/refresh)
// Ensure mobile menu starts closed and stays in sync on resize
closeMobileMenu();
window.addEventListener('resize', () => {
  if (window.innerWidth >= 861) closeMobileMenu();
});

// Optional: close the panel if user resizes to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth >= 860) closeMobileMenu();
});


}
