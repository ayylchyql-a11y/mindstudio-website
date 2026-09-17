const body = document.body;
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const bookingDialog = document.querySelector('[data-booking-dialog]');
const allergenDialog = document.querySelector('[data-allergen-dialog]');
const bookingForm = document.querySelector('[data-booking-form]');
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
const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 70);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const priceData = {
  pranzo: {
    kicker: 'Lun–Ven · esclusi festivi', title: 'Pranzo Infinity', price: '18,90', child: '€ 10,90', weekend: '€ 22,90',
    included: ['Oltre 100 piatti dal menu', 'Sushi, sashimi e cucina calda', 'Ordini illimitati per 2 ore']
  },
  cena: {
    kicker: 'Tutti i giorni · dalle 19:00', title: 'Cena Infinity', price: '29,90', child: '€ 15,90', weekend: 'Stesso prezzo',
    included: ['Menu completo da oltre 120 piatti', 'Sashimi special e creazioni Mizu', 'Ordini illimitati per 2 ore']
  }
};

const periodButtons = [...document.querySelectorAll('[data-period]')];
const priceStage = document.querySelector('[data-price-stage]');
periodButtons.forEach((button) => button.addEventListener('click', () => {
  const period = button.dataset.period;
  const data = priceData[period];
  periodButtons.forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('.pricing-switch').classList.toggle('is-dinner', period === 'cena');
  priceStage.classList.toggle('is-dinner', period === 'cena');
  document.querySelector('[data-price-kicker]').textContent = data.kicker;
  document.querySelector('[data-price-title]').textContent = data.title;
  document.querySelector('[data-price]').textContent = data.price;
  document.querySelector('[data-child-price]').textContent = data.child;
  document.querySelector('[data-weekend-price]').textContent = data.weekend;
  document.querySelectorAll('[data-included] li').forEach((item, index) => { item.textContent = data.included[index]; });
}));

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const dishes = [...document.querySelectorAll('[data-category]')];
filterButtons.forEach((button) => button.addEventListener('click', () => {
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
}));

document.querySelectorAll('.accordion button').forEach((button) => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.accordion button').forEach((item) => {
    item.setAttribute('aria-expanded', 'false');
    item.querySelector('i').textContent = '+';
    item.nextElementSibling.hidden = true;
  });
  if (!expanded) {
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('i').textContent = '−';
    button.nextElementSibling.hidden = false;
  }
}));

const closeOnBackdrop = (dialog) => dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});

document.querySelectorAll('[data-open-booking]').forEach((button) => button.addEventListener('click', () => {
  setMenu(false);
  bookingDialog.showModal();
  const dateInput = bookingDialog.querySelector('input[type="date"]');
  dateInput.min = new Date(Date.now() + 86400000).toISOString().split('T')[0];
}));
document.querySelector('[data-close-booking]').addEventListener('click', () => bookingDialog.close());
closeOnBackdrop(bookingDialog);

document.querySelector('[data-open-allergens]').addEventListener('click', () => allergenDialog.showModal());
document.querySelector('[data-close-allergens]').addEventListener('click', () => allergenDialog.close());
closeOnBackdrop(allergenDialog);

let toastTimer;
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  bookingDialog.close();
  bookingForm.reset();
  clearTimeout(toastTimer);
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
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
      entry.target.style.transitionDelay = `${Math.max(index, 0) * 45}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  revealItems.forEach((item) => observer.observe(item));
}
