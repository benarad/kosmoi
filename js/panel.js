// What the two pages' panels have in common: the keyboard shortcuts, the bar
// at the top of a step (its strip of steps and its links down to the parts of
// the step), the place kept in the address, and the theme that is remembered.

// ---------- the keyboard ----------

// A button, slider, menu or tick-box that has just been used with the mouse
// keeps the keyboard focus, and the browser then sends Space and the arrow
// keys to it: Space presses the button a second time, and the arrows move the
// slider. So a control that was used with a pointer gives the focus back as
// soon as it has done its work, and the page's own shortcuts go on working.
// A control reached with the Tab key keeps the focus and behaves as usual, so
// everything can still be worked from the keyboard alone.
export function giveKeysBack() {
  let pointer = false;
  document.addEventListener('pointerdown', () => { pointer = true; }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Tab') pointer = false; }, true);
  const release = (selector) => () => {
    const active = document.activeElement;
    if (pointer && active instanceof HTMLElement && active.matches(selector)) active.blur();
  };
  document.addEventListener('click', release('button'));
  document.addEventListener('change', release('select, input'));
  document.addEventListener('pointerup', release('input[type="range"]'));
}

// Whether a key press may be one of the page's own shortcuts. A key pressed
// with Command, Control or Alt belongs to the browser (Command and the left
// arrow goes back a page, Command and P prints), and a key pressed in a field
// belongs to the field.
export function isShortcut(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return false;
  return !(e.target instanceof Element && e.target.closest('input, select, textarea'));
}

// ---------- a step, shown from its top ----------

// Where the reading space begins in a narrow window. There the picture stays
// at the top of the window and the page scrolls under it, so text is first in
// sight at the picture's lower edge.
function underPicture() {
  const stage = document.getElementById('stage');
  return stage && getComputedStyle(stage).position === 'sticky' ? stage.getBoundingClientRect().bottom : 0;
}

// Shows a step from its beginning. `walk` is the element that holds the step:
// its title and controls in a bar that stays in sight (.walk-bar), and its text
// under them. If the reader had scrolled down into the last step's text, the
// panel is brought back so that the new text starts just under the bar. The bar
// itself does not move, so the pointer is still on Next.
export function showFromTop(walk) {
  const section = walk.firstElementChild, panel = walk.closest('.panel');
  if (!section || !panel) return;
  if (panel.scrollHeight > panel.clientHeight) {
    const start = panel.scrollTop + section.getBoundingClientRect().top - panel.getBoundingClientRect().top;
    if (panel.scrollTop > start) panel.scrollTop = start;
  } else {
    // In a narrow window the panel is as long as the page, and it is the page that scrolls.
    const above = section.getBoundingClientRect().top - underPicture();
    if (above < 0) window.scrollBy(0, above);
  }
}

// Brings one part of a step (its Greek, its English, what is disputed about
// it) to the top of the reading space, just under the bar. The bar may move to
// its sticking place as the text scrolls, so the distance is measured twice.
export function showPart(target) {
  const panel = target.closest('.panel'), bar = panel && panel.querySelector('.walk-bar');
  if (!bar) return;
  const scroller = panel.scrollHeight > panel.clientHeight ? panel : document.scrollingElement;
  for (let pass = 0; pass < 2; pass++) {
    scroller.scrollTop += target.getBoundingClientRect().top - bar.getBoundingClientRect().bottom - 10;
  }
}

// The links in the bar that lead down to the parts of a step, which are
// usually below the foot of the window. `parts` is a list of names and
// elements, and a part that the step does not have (its element is hidden) is
// left out.
export function partLinks(box, parts) {
  box.textContent = '';
  for (const [name, target] of parts) {
    if (!target || target.hidden) continue;
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'link';
    link.textContent = name;
    link.onclick = () => showPart(target);
    box.appendChild(link);
  }
}

// ---------- the strip of steps ----------

// A row of small marks under Back and Next, one for each step of a sequence.
// It shows how long the sequence is and how far through it the reader has
// come, and a click on a mark goes straight to that step. `steps` gives the
// name of each step, for the mark's tooltip, and `groups` (if the sequence has
// any) the name of each group of steps and the index of its first step. The
// marks are left out of the Tab order, because from the keyboard the arrow
// keys already move through the steps. Returns a function that marks the step
// reached.
export function stepStrip(box, { steps, groups = [], choose }) {
  box.textContent = '';
  const marks = steps.map((name, k) => {
    const mark = document.createElement('button');
    mark.type = 'button';
    mark.tabIndex = -1;
    const group = groups.filter((g) => g.from <= k).pop();
    mark.title = `${k + 1}. ${name}${group ? `\n${group.name}` : ''}`;
    mark.setAttribute('aria-label', `Step ${k + 1}, ${name}`);
    if (k > 0 && groups.some((g) => g.from === k)) mark.classList.add('starts');
    mark.onclick = () => choose(k);
    box.appendChild(mark);
    return mark;
  });
  return (index) => marks.forEach((mark, k) => {
    mark.classList.toggle('done', k < index);
    mark.classList.toggle('here', k === index);
    if (k === index) mark.setAttribute('aria-current', 'step'); else mark.removeAttribute('aria-current');
  });
}

// ---------- the place, kept in the address ----------

// The address says where the reader is: "#making/12" is the twelfth step of
// the sequence called "making", and "#look" is looking around. A link to a
// step can therefore be copied from the address bar, and reloading the page
// comes back to the same step. The step in the address counts from one.
export function readPlace() {
  const found = /^#([a-z]+)(?:\/(\d+))?$/.exec(location.hash);
  return found ? { mode: found[1], step: found[2] ? Number(found[2]) - 1 : null } : null;
}

// Writes the place into the address without adding to the browser's history,
// so that Back in the browser still leaves the page.
export function writePlace(mode, step = null) {
  const hash = `#${mode}${step === null ? '' : `/${step + 1}`}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

// ---------- the theme, remembered ----------

// The theme the reader last chose, if the browser will say. Storage can be
// switched off or refused, and the page then follows the system's setting.
export function savedTheme() {
  try {
    const theme = localStorage.getItem('kosmoi.theme');
    return theme === 'dark' || theme === 'light' ? theme : null;
  } catch { return null; }
}

export function saveTheme(theme) {
  try { localStorage.setItem('kosmoi.theme', theme); } catch { /* it is only a convenience */ }
}
