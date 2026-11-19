// The controls in the corner of the picture, and the presentation view.
//
// The corner holds what concerns the page as a whole and has to be in reach
// whatever the left panel is showing: the choice between the dark and the
// light theme, and the button for the presentation view.
//
// The presentation view is for a classroom or a projector. While a sequence
// is being gone through, the left panel shows nothing but the step, in larger
// type, and the margin is put away, so that the picture has most of the
// window. The step's text can be put away too, and its bar of controls then
// lies over a corner of the picture. The margin can be brought back, and the
// type can be made larger or smaller to suit the room. These three choices
// are remembered from one visit to the next.
//
// The view itself is a matter of classes on <html>, which css/app.css reads:
// `presenting`, `no-text` and `with-margin`, with the variable --scale for
// the size of the type. A page adds `walking` while a sequence is being gone
// through.

import { isShortcut } from './panel.js';

const SCALES = [1, 1.15, 1.3, 1.5, 1.75, 2, 2.3];
const KEY = 'kosmoi.present';
const NARROW = '(max-width: 820px)';      // the phone layout, which has no room for the view

function recall() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}

function make(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

// `stage` is the element that holds the picture, `margin` what the margin's
// button is called on this page, `theme` the theme in force, and `setTheme`
// the page's own function for changing it.
export function viewCorner({ stage, margin, theme, setTheme }) {
  const root = document.documentElement;
  const saved = recall();
  const view = {
    on: false,
    text: saved.text !== false,
    margin: saved.margin === true,
    scale: SCALES.includes(saved.scale) ? saved.scale : 1.3,
  };

  const corner = make('div', 'corner');
  corner.setAttribute('role', 'group');
  corner.setAttribute('aria-label', 'The view');
  // Where the step's bar goes when its text is put away.
  const holder = make('div', 'stage-bar');

  const button = (label, title, act, only = true) => {
    const b = make('button', only ? 'only-presenting' : '', label);
    b.type = 'button';
    b.title = title;
    b.onclick = act;
    corner.appendChild(b);
    return b;
  };

  const text = button('', 'Show or hide the left panel (T)', () => change({ text: !view.text }));
  text.append(make('span', 'when-walking', 'Text'), make('span', 'when-exploring', 'Controls'));
  const side = button(margin, 'Show or hide the margin on the right (M)', () => change({ margin: !view.margin }));
  const smaller = button('A−', 'Smaller type (the minus key)', () => resize(-1));
  const larger = button('A+', 'Larger type (the plus key)', () => resize(1));
  smaller.setAttribute('aria-label', 'Smaller type');
  larger.setAttribute('aria-label', 'Larger type');
  const full = button('Full screen', 'Fill the whole screen (F)', toggleFull);
  full.hidden = !document.fullscreenEnabled;

  const themes = make('span', 'seg theme');
  themes.setAttribute('role', 'group');
  themes.setAttribute('aria-label', 'Theme');
  const themeButtons = {};
  for (const [name, label, title] of [
    ['dark', 'Dark', 'A night sky, for a dim room'],
    ['light', 'Light', 'A drawing on paper, for a bright room or a projector'],
  ]) {
    const b = make('button', '', label);
    b.type = 'button';
    b.title = title;
    b.onclick = () => { setTheme(name); showTheme(name); };
    themes.appendChild(b);
    themeButtons[name] = b;
  }
  corner.appendChild(themes);
  const showTheme = (name) => {
    for (const [id, b] of Object.entries(themeButtons)) b.setAttribute('aria-pressed', String(id === name));
  };
  showTheme(theme);

  const present = button('Present', '', () => change({ on: !view.on }), false);
  present.classList.add('present');
  // Both lie over the picture, and the stage keeps the picture's names clear of anything marked so.
  corner.dataset.clear = '';
  holder.dataset.clear = '';
  stage.append(corner, holder);

  function toggleFull() {
    const done = document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen();
    if (done && done.catch) done.catch(() => {});       // the browser may refuse, and then nothing changes
  }

  function resize(by) {
    const at = SCALES.indexOf(view.scale);
    change({ scale: SCALES[Math.max(0, Math.min(SCALES.length - 1, at + by))] });
  }

  function change(to) {
    if (to.on && window.matchMedia(NARROW).matches) return;
    Object.assign(view, to);
    if (to.on === false && document.fullscreenElement) toggleFull();
    try { localStorage.setItem(KEY, JSON.stringify({ text: view.text, margin: view.margin, scale: view.scale })); } catch { /* not remembered, then */ }
    show();
    // The left panel holds different things in the two views, so it is shown from its top after a change of view.
    if ('on' in to || 'text' in to) { const panel = document.querySelector('.panel'); if (panel) panel.scrollTop = 0; }
  }

  function show() {
    root.classList.toggle('presenting', view.on);
    root.classList.toggle('no-text', view.on && !view.text);
    root.classList.toggle('with-margin', view.on && view.margin);
    root.style.setProperty('--scale', String(view.on ? view.scale : 1));
    text.setAttribute('aria-pressed', String(view.text));
    side.setAttribute('aria-pressed', String(view.margin));
    smaller.disabled = view.scale === SCALES[0];
    larger.disabled = view.scale === SCALES[SCALES.length - 1];
    present.textContent = view.on ? 'Exit' : 'Present';
    present.title = view.on
      ? 'Leave the presentation view (Esc)'
      : 'For a classroom or a projector: a larger picture, and the step’s text in larger type (P)';
    // The step's bar goes with its text, or over the picture when the text is put away.
    const bar = document.querySelector('.walk-bar'), home = document.querySelector('#walk > section');
    if (bar && home) {
      const out = view.on && !view.text;
      if (out && bar.parentElement !== holder) holder.appendChild(bar);
      if (!out && bar.parentElement !== home) home.prepend(bar);
    }
  }

  document.addEventListener('fullscreenchange', () => {
    full.textContent = document.fullscreenElement ? 'Leave full screen' : 'Full screen';
  });
  // A window made narrow goes over to the phone layout, which has no presentation view.
  window.matchMedia(NARROW).addEventListener('change', (e) => { if (e.matches && view.on) change({ on: false }); });

  window.addEventListener('keydown', (e) => {
    if (!isShortcut(e)) return;
    const key = e.key.toLowerCase();
    if (key === 'p') change({ on: !view.on });
    else if (!view.on) return;
    else if (key === 'escape') change({ on: false });
    else if (key === 't') change({ text: !view.text });
    else if (key === 'm') change({ margin: !view.margin });
    else if (key === '+' || key === '=') resize(1);
    else if (key === '-' || key === '_') resize(-1);
    else if (key === 'f' && document.fullscreenEnabled) toggleFull();
    else return;
    e.preventDefault();
  });

  show();
  return { get presenting() { return view.on; } };
}
