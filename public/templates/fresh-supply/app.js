const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const header = $('[data-header]');
const menu = $('[data-menu]');
const mobileNav = $('[data-mobile]');
const drawer = $('[data-drawer]');
const scrim = $('[data-scrim]');
const itemsRoot = $('[data-items]');
const countRoot = $('[data-count]');
const toast = $('[data-toast]');
let requestItems = [];

addEventListener('scroll', () => header.classList.toggle('fixed', scrollY > 76), { passive: true });

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  mobileNav.classList.toggle('open', open);
  mobileNav.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('lock', open);
}

menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
$$('[data-link]').forEach(link => link.addEventListener('click', () => setMenu(false)));

function showToast(message, duration = 1800) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function renderRequest() {
  countRoot.textContent = requestItems.length;
  itemsRoot.innerHTML = requestItems.length
    ? requestItems.map((name, index) => `<div class="request-item"><span>${name}</span><button type="button" aria-label="移除${name}" data-remove="${index}">×</button></div>`).join('')
    : '<p class="empty">从今日菜品中加入商品，或直接填写采购需求。</p>';
  $$('[data-remove]').forEach(button => button.addEventListener('click', () => {
    requestItems.splice(Number(button.dataset.remove), 1);
    renderRequest();
  }));
}

$$('[data-add]').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.name;
  if (!requestItems.includes(name)) requestItems.push(name);
  renderRequest();
  showToast(`✓ ${name}已加入询价单`);
}));

$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(item => {
    const selected = item === button;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  $$('[data-category]').forEach(card => {
    card.classList.toggle('hidden', button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
  });
}));

function openQuote() {
  setMenu(false);
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  scrim.classList.add('show');
  document.body.classList.add('lock');
  $('[data-close-quote]').focus();
}

function closeQuote() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  scrim.classList.remove('show');
  document.body.classList.remove('lock');
}

$$('[data-open-quote]').forEach(button => button.addEventListener('click', openQuote));
$('[data-close-quote]').addEventListener('click', closeQuote);
scrim.addEventListener('click', closeQuote);

$('[data-quote-form]').addEventListener('submit', event => {
  event.preventDefault();
  closeQuote();
  event.currentTarget.reset();
  requestItems = [];
  renderRequest();
  showToast('✓ 采购需求已提交，客户经理将在 2 小时内联系您', 3500);
});

const deliveryPlans = {
  上海: '上海主要城区已覆盖｜次日 05:30–09:00 配送',
  苏州: '苏州核心城区已覆盖｜次日 06:00–10:00 配送',
  杭州: '杭州主要城区已覆盖｜次日 06:00–10:30 配送',
  嘉兴: '嘉兴城区已覆盖｜次日 06:30–10:30 配送',
  无锡: '无锡核心城区已覆盖｜次日 06:30–11:00 配送',
};

$('[data-coverage-form]').addEventListener('submit', event => {
  event.preventDefault();
  const city = $('#city').value;
  $('[data-coverage-result]').textContent = city ? `✓ ${deliveryPlans[city]}` : '';
});

$('[data-login]').addEventListener('click', () => showToast('客户系统为演示入口，暂未接入真实账号', 2400));

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

renderRequest();
