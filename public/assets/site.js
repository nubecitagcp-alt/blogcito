const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

function currentTheme() {
  return root.dataset.theme || (systemTheme.matches ? 'dark' : 'light');
}

function updateThemeControl() {
  const dark = currentTheme() === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'Activar tema claro' : 'Activar tema oscuro');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#18151f' : '#f9f7f4';
}

themeButton.hidden = false;
updateThemeControl();
systemTheme.addEventListener('change', updateThemeControl);
themeButton.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('diogo-theme', next);
  } catch {
    // Keep the selected theme for this page when storage is unavailable.
  }
  updateThemeControl();
});

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const mobileNav = matchMedia('(max-width: 680px)');

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuButton.hidden = false;
header.classList.add('nav-ready');
menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
mobileNav.addEventListener('change', () => setMenu(false));
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    menuButton.focus();
  }
});

const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const sectionTargets = navLinks.map((link) => document.querySelector(link.hash));
let currentNavLink = navLinks[0];
let scrollFrame = 0;

function updateScroll() {
  scrollFrame = 0;
  const scrollRange = root.scrollHeight - innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, Math.max(0, scrollY / scrollRange)) : 0;
  header.style.setProperty('--progress', progress);

  if (!navLinks.length) return;
  const navThreshold = header.offsetHeight + 74;
  const lastVisible = sectionTargets.findLastIndex((section) => section.getBoundingClientRect().top <= navThreshold);
  const next = navLinks[Math.max(0, lastVisible)];
  if (next === currentNavLink) return;
  currentNavLink.removeAttribute('aria-current');
  next.setAttribute('aria-current', 'location');
  currentNavLink = next;
}

function scheduleScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}

window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUpdate);
window.addEventListener('pageshow', scheduleScrollUpdate);
scheduleScrollUpdate();

if ('IntersectionObserver' in window && !motionPreference.matches) {
  const reveal = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('visible');
      observer.unobserve(target);
    });
  });
  document.querySelectorAll('.reveal').forEach((element) => {
    if (element.getBoundingClientRect().top < innerHeight) return;
    element.classList.add('pending');
    reveal.observe(element);
  });
}

const filters = document.querySelector('.filters');
if (filters) {
  const buttons = [...filters.querySelectorAll('button')];
  const stories = [...document.querySelectorAll('.story-card')];
  const announcement = document.querySelector('#filter-result');
  filters.hidden = false;

  filters.addEventListener('click', (event) => {
    const selected = event.target.closest('[data-filter]');
    if (!selected || selected.getAttribute('aria-pressed') === 'true') return;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));

    let visibleCount = 0;
    stories.forEach((story) => {
      const matches = selected.dataset.filter === 'todas' || selected.dataset.filter === story.dataset.category;
      const wasHidden = story.hidden;
      story.hidden = !matches;
      if (!matches) return;
      visibleCount += 1;
      story.classList.add('visible');
      if (wasHidden && !motionPreference.matches && story.animate) {
        story.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }], { duration: 270, easing: 'ease-out' });
      }
    });
    announcement.textContent = visibleCount === 1 ? '1 entrada visible.' : `${visibleCount} entradas visibles.`;
    scheduleScrollUpdate();
  });
}

const featurePanels = [...document.querySelectorAll('.feature-panel')];
if (featurePanels.length) {
  const largeScreen = matchMedia('(min-width: 681px)');
  featurePanels.forEach((panel) => {
    function activate() {
      if (!largeScreen.matches) return;
      featurePanels.forEach((item) => item.classList.toggle('is-active', item === panel));
    }
    panel.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') activate();
    });
    panel.addEventListener('focus', activate);
  });
}

document.querySelectorAll('.photo-rail').forEach((rail) => {
  const track = rail.querySelector('.rail-track');
  const cards = [...track.querySelectorAll('.place-card')];
  const controls = rail.querySelector('.rail-controls');
  const [previous, next] = controls.querySelectorAll('button');

  function updateRailControls() {
    const max = track.scrollWidth - track.clientWidth;
    controls.hidden = max < 3;
    previous.disabled = track.scrollLeft < 3;
    next.disabled = track.scrollLeft > max - 3;
  }

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-rail-step]');
    if (!button) return;
    const cardSpacing = cards[1].offsetLeft - cards[0].offsetLeft;
    track.scrollBy({ left: Number(button.dataset.railStep) * cardSpacing, behavior: motionPreference.matches ? 'auto' : 'smooth' });
  });
  track.addEventListener('scroll', updateRailControls, { passive: true });
  window.addEventListener('resize', updateRailControls);
  updateRailControls();
});

const lightbox = document.querySelector('.lightbox');
if (lightbox && typeof lightbox.showModal === 'function') {
  const gallery = [...document.querySelectorAll('a[data-caption]')];
  const image = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  const count = lightbox.querySelector('.photo-count');
  let openedFrom;
  let photoIndex = 0;

  function showPhoto(index) {
    photoIndex = (index + gallery.length) % gallery.length;
    const link = gallery[photoIndex];
    image.src = link.href;
    image.alt = link.querySelector('img').alt || link.dataset.caption;
    caption.textContent = link.dataset.caption;
    count.textContent = `${photoIndex + 1} / ${gallery.length}`;
  }

  gallery.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      openedFrom = link;
      showPhoto(index);
      lightbox.showModal();
      document.body.classList.add('modal-open');
    });
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.closest('.lightbox-close')) {
      lightbox.close();
      return;
    }
    const control = event.target.closest('[data-photo-step]');
    if (control) showPhoto(photoIndex + Number(control.dataset.photoStep));
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    openedFrom?.focus({ preventScroll: true });
  });
}
