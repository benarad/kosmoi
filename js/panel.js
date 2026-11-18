// Two things the pages' panels have in common: keeping the keyboard shortcuts
// alive after the mouse has been used, and showing a new step from its top.

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
    const above = section.getBoundingClientRect().top;
    if (above < 0) window.scrollBy(0, above);
  }
}
