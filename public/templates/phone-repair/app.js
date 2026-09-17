const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const header = $('[data-header]');
const menu = $('[data-menu]');
const mobileNav = $('[data-mobile]');
const estimateDialog = $('[data-estimate-dialog]');
const bookingDialog = $('[data-book-dialog]');
const deviceSelect = $('[data-device]');
const repairSelect = $('[data-repair-select]');
const priceOutput = $('[data-price]');
const timeOutput = $('[data-time]');
const bookingSummary = $('[data-book-summary]');
const dateInput = $('[data-date]');
const toast = $('[data-toast]');

const repairs = {
  display: { label: 'Schermo', price: 89, time: 90 },
  battery: { label: 'Batteria', price: 59, time: 55 },
  charge: { label: 'Ricarica', price: 69, time: 75 },
  camera: { label: 'Fotocamera', price: 79, time: 80 },
  audio: { label: 'Audio', price: 64, time: 70 },
};

const devices = {
  smartphone: { label: 'Smartphone', multiplier: 1 },
  tablet: { label: 'Tablet', multiplier: 1.35 },
  watch: { label: 'Smartwatch', multiplier: .82 },
};

addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 70), { passive: true });

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('lock', open);
}

menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
$$('[data-link]').forEach(link => link.addEventListener('click', () => setMenu(false)));

function getQuote() {
  const repair = repairs[repairSelect.value];
  const device = devices[deviceSelect.value];
  const price = Math.round(repair.price * device.multiplier / 5) * 5;
  const time = Math.round(repair.time * (device.multiplier > 1 ? 1.25 : 1) / 5) * 5;
  return { repair, device, price, time };
}

function updateQuote() {
  const quote = getQuote();
  priceOutput.textContent = `da € ${quote.price}`;
  timeOutput.textContent = `circa ${quote.time} minuti`;
}

function openEstimate(repair = 'display') {
  setMenu(false);
  repairSelect.value = repair;
  updateQuote();
  if (!estimateDialog.open) estimateDialog.showModal();
}

function setMinimumDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const localDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000);
  dateInput.min = localDate.toISOString().split('T')[0];
}

function openBooking(summary = 'Diagnosi completa · stima in negozio') {
  setMenu(false);
  bookingSummary.textContent = summary;
  setMinimumDate();
  if (!bookingDialog.open) bookingDialog.showModal();
}

$$('[data-estimate]').forEach(button => button.addEventListener('click', () => openEstimate()));
$$('[data-repair]').forEach(button => button.addEventListener('click', () => openEstimate(button.dataset.repair)));
$$('[data-book]').forEach(button => button.addEventListener('click', () => openBooking()));

deviceSelect.addEventListener('change', updateQuote);
repairSelect.addEventListener('change', updateQuote);

$('[data-estimate-form]').addEventListener('submit', event => {
  event.preventDefault();
  const quote = getQuote();
  const model = $('[data-model]').value.trim();
  const modelLabel = model ? ` · ${model}` : '';
  estimateDialog.close();
  openBooking(`${quote.device.label}${modelLabel} · ${quote.repair.label} · da € ${quote.price}`);
});

$('[data-book-form]').addEventListener('submit', event => {
  event.preventDefault();
  bookingDialog.close();
  event.currentTarget.reset();
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove('show'), 3500);
});

$('[data-close-estimate]').addEventListener('click', () => estimateDialog.close());
$('[data-close-book]').addEventListener('click', () => bookingDialog.close());

[estimateDialog, bookingDialog].forEach(dialog => {
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
});

const revealItems = $$('.reveal');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealItems.forEach(item => item.classList.add('show'));
} else {
  revealItems.forEach((item, index) => { item.style.transitionDelay = `${(index % 3) * 45}ms`; });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08 });
  revealItems.forEach(item => observer.observe(item));
}

updateQuote();
