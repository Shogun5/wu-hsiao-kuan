import { Sound } from './audio.js?v=202611141205';
import { setLang, initialLang, hint } from './i18n.js?v=202611141205';

const sound = new Sound();
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;

// ---------- 3D stage (the page works without it)
let stage = null;
try {
  const { createStage } = await import('./scene.js?v=202611141205');
  stage = createStage($('#stage'), {
    onTrigram: i => sound.pluck(i + 2, .55),
    onSpin: v => sound.whoosh(v),
    onStir: v => { const n = performance.now(); if (n - (window.__stirT || 0) > 700) { window.__stirT = n; sound.whoosh(4 + v * 2); sound.pluck(Math.floor(Math.random() * 5) + 4, .3); } },
    onBurst: () => sound.blip(587.33 * [1, 1.5, 2][Math.floor(Math.random() * 3)]),
  });
  window.__stage = stage;
} catch (e) {
  console.warn('3D stage unavailable:', e);
  $('#stage').remove();
}

// ---------- 中文 ⇄ English
let lang = initialLang(), form = 'xingyi';
const langBtn = $('#lang'), btnLabel = $('#sound').childNodes[1];
function showHint() { const [m, t] = hint(lang, form); $('.hint-mouse').textContent = m; $('.hint-touch').textContent = t; }
function applyLang(first) {
  setLang(lang);
  window.renderContent(lang, !first);
  if (!first) $$('[data-form]').forEach(x => { if (x.classList.contains('on')) form = x.dataset.form; });
  showHint();
  langBtn.textContent = lang === 'en' ? '中文' : 'EN';
  btnLabel.textContent = lang === 'en' ? 'Sound' : '聲';
}
if (lang !== 'zh') applyLang(true);
langBtn.textContent = lang === 'en' ? '中文' : 'EN';
langBtn.addEventListener('click', () => { lang = lang === 'en' ? 'zh' : 'en'; applyLang(false); sound.pluck(6, .3); });

// ---------- sound toggle
const btn = $('#sound');
btn.addEventListener('click', async () => {
  const on = await sound.toggle();
  btn.setAttribute('aria-pressed', on);
  $('i', btn).textContent = on ? 'ON' : 'OFF';
  if (on) stage?.pulseAll();
});

// ---------- reveal on scroll, staggered inside each parent
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const sibs = $$(':scope > .reveal', e.target.parentElement);
  e.target.style.setProperty('--d', Math.min(sibs.indexOf(e.target), 5) * 110 + 'ms');
  e.target.classList.add('in'); io.unobserve(e.target);
  $$('[data-count]', e.target).forEach(countUp);
}), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

function countUp(el) {
  const n = +el.dataset.count, t0 = performance.now();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const step = t => { const k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ---------- which section owns the stage
const links = $$('.links a');
const sections = [$('#top'), ...$$('main .sec')];
let current = null;
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  stage?.setScroll(Math.min(1, scrollY / innerHeight));
  const mid = innerHeight * .5;
  let sec = sections[0];
  for (const s of sections) if (s.getBoundingClientRect().top <= mid) sec = s;
  if (scrollY >= max - 4) sec = sections.at(-1);
  if (sec === current) return;
  const first = current === null; current = sec;
  const focus = sec.id === 'top' ? 'hero' : sec.id === 'wu' ? 'wu' : sec.id === 'spec' ? 'tech' : 'other';
  body.dataset.focus = focus;
  stage?.setFocus(focus);
  if (focus === 'wu') stage?.setMode($('.art.on').dataset.mode);
  if (focus === 'tech') stage?.setTech($('.pillar.on').dataset.tech);
  links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + sec.id));
  if (!first) { if (focus === 'wu') sound.drum(); else sound.pluck(sections.indexOf(sec), .32); }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

// ---------- the three arts drive the emblem
$$('.art').forEach((b, i) => {
  const pick = () => {
    if (b.classList.contains('on')) return;
    $$('.art').forEach(x => x.classList.toggle('on', x === b));
    stage?.setMode(b.dataset.mode);
    if (b.dataset.mode === 'xingyi') sound.drum(.6); else { sound.pluck(i * 2 + 3, .5); if (b.dataset.mode === 'bagua') sound.whoosh(8); }
  };
  b.addEventListener('click', pick);
  b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pick(); });
});

// ---------- three scenes: 太極 (scan re-posed), 形意 (the scan, on the five elements), 八卦 (captured form)
$$('.forms button').forEach(b => b.addEventListener('click', () => {
  if (b.classList.contains('on')) return;
  $$('.forms button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  const k = b.dataset.form, five = k === 'xingyi';
  stage?.setForm(k);
  form = k; showHint();
  if (five) sound.drum(.5); else if (k === 'bagua') sound.whoosh(8); else sound.pluck(3, .5);
}));

// ---------- the three specialties drive what the figure shows
$$('.pillar').forEach((b, i) => {
  const pick = () => {
    if (b.classList.contains('on')) return;
    $$('.pillar').forEach(x => x.classList.toggle('on', x === b));
    stage?.setTech(b.dataset.tech);
    sound.blip([587.33, 739.99, 880, 1174.66][i]);
  };
  b.addEventListener('click', pick);
  b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pick(); });
});

// ---------- photo strip: swipe / drag / arrows
{
  const track = $('.gallery-track'), shots = $$('img', track), count = $('.gallery-count');
  const pad = n => String(n).padStart(2, '0');
  const current = () => { const x = track.scrollLeft + track.clientWidth * .35; let k = 0; shots.forEach((im, i) => { if (im.offsetLeft - track.offsetLeft <= x) k = i; }); return k; };
  const go = i => { const im = shots[Math.max(0, Math.min(shots.length - 1, i))]; track.scrollTo({ left: im.offsetLeft - track.offsetLeft, behavior: 'smooth' }); };
  track.addEventListener('scroll', () => { count.textContent = pad(current() + 1) + ' / ' + pad(shots.length); }, { passive: true });
  $$('.gallery-btn').forEach(b => b.addEventListener('click', () => { go(current() + +b.dataset.dir); sound.pluck(5, .25); }));
  track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(current() + 1); if (e.key === 'ArrowLeft') go(current() - 1); });
  let down = false, x0 = 0, s0 = 0;                    // mouse drag (touch scrolls natively)
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = track.scrollLeft; track.classList.add('drag'); track.setPointerCapture(e.pointerId); });
  track.addEventListener('pointermove', e => { if (down) track.scrollLeft = s0 - (e.clientX - x0); });
  const up = () => { if (!down) return; down = false; track.classList.remove('drag'); go(current()); };
  track.addEventListener('pointerup', up); track.addEventListener('pointercancel', up);
}

// ---------- small sounds on things you can touch
$$('[data-note]').forEach(el => el.addEventListener('pointerenter', e => {
  if (e.pointerType === 'mouse') sound.pluck(+el.dataset.note, .28);
}));
$('.more').addEventListener('toggle', () => sound.pluck(8, .3));
$('.mail').addEventListener('pointerenter', () => sound.bowl(330, .08));
