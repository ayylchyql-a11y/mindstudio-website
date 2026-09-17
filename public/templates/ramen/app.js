const body = document.body;
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const dialog = document.querySelector('[data-reservation-dialog]');
const form = document.querySelector('[data-reservation-form]');
const toast = document.querySelector('[data-toast]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setMenu = (open) => {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.classList.toggle('is-open', open);
  body.classList.toggle('menu-open', open);
};

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
document.querySelectorAll('[data-menu-link]').forEach((link) => link.addEventListener('click', () => setMenu(false)));

const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 68);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

document.querySelectorAll('[data-open-reservation]').forEach((button) => {
  button.addEventListener('click', () => {
    setMenu(false);
    dialog.showModal();
    const dateInput = dialog.querySelector('input[type="date"]');
    dateInput.min = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
});

const closeDialog = () => dialog.close();
document.querySelector('[data-close-reservation]').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) closeDialog();
});

let toastTimer;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  closeDialog();
  form.reset();
  window.clearTimeout(toastTimer);
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4200);
});

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const dishes = [...document.querySelectorAll('[data-category]')];
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    dishes.forEach((dish) => {
      const visible = filter === 'tutti' || dish.dataset.category.split(' ').includes(filter);
      dish.classList.toggle('is-hidden', !visible);
    });
  });
});

const revealItems = [...document.querySelectorAll('.reveal')];
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const group = entry.target.parentElement?.querySelectorAll(':scope > .reveal') || [];
      const index = [...group].indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.max(0, index) * 45}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
}
