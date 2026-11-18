// The page for Plato's Timaeus: the controls on the left, the margin on the
// right, the readout and the frame loop. Two things can be on stage. One is
// the heaven itself (cosmologies/timaeus/heaven-view.js), finished, to be
// looked around in, or in the sequence only as far as it has been made. The
// other is the making of the world, act by act (making-view.js). The sequence
// "The making" goes through both with Greek and English beside it. The margin
// lists the gods of the Timaeus, or the steps, or the eight circuits. The
// model is in cosmologies/timaeus/model.js; the stage is the one the
// Aristotle page uses.

import { DEG, dot } from './core/kinematics.js';
import {
  YEAR, SOURCES, SIZES, defaultConfig, buildModel, circleOf, longitude, heaven, seen,
} from './cosmologies/timaeus/model.js';
import { fallsBehind, fromSun, NOON } from './cosmologies/timaeus/measure.js';
import { MAKING, ACT_SECONDS, ARRIVAL_SECONDS, sceneOf } from './cosmologies/timaeus/sequence.js';
import { GODS, GOD_GROUPS } from './cosmologies/timaeus/gods.js';
import { TimaeusView } from './cosmologies/timaeus/heaven-view.js';
import { MakingView } from './cosmologies/timaeus/making-view.js';
import { Stage, THEMES, upQuaternion } from './stage/stage.js';

const $ = (id) => document.getElementById(id);
const prefers = (q) => window.matchMedia && window.matchMedia(q).matches;
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

const stage = new Stage($('stage'));
const view = new TimaeusView(stage);      // the finished heaven
const making = new MakingView(stage);     // the making of it

// The place the sky is watched from. Athens lies at 37°58′ north.
const LATITUDE = 38;
const ZENITH = [Math.cos(LATITUDE * DEG), 0, Math.sin(LATITUDE * DEG)];
const EAST = [0, 1, 0];
// From outside the axis stands upright, as on an armillary sphere, and the
// picture is turned so that one of the two places where the bands cross faces
// the viewer, a little to the right. RIGHT is the direction on the viewer's right.
const TURNED = 40 * DEG;
const RIGHT = [Math.sin(TURNED), Math.cos(TURNED), 0];
const STANDING = upQuaternion([0, 0, 1], RIGHT);
// While the soul's strips lie flat, the place where they will cross faces the viewer squarely.
const FACING = stage.squareOn(upQuaternion([0, 0, 1], [0, 1, 0]));

const state = {
  config: defaultConfig(),
  view: 'outside',                        // 'outside' the heaven, or on the 'ground' at Athens
  astronomy: false,                       // the readings and the sources of the numbers, on show
  focus: null,                            // the star being followed, or null for none
  clock: 'held',                          // the Same: 'held' still, 'daily' running, or seen once a day at 'noon'
  clocks: { outside: 'held', ground: 'daily' },   // the clock last used from each place to stand
  playing: !prefers('(prefers-reduced-motion: reduce)'),
  speed: { held: 60, daily: 0.05, noon: 14 },     // days of the model per second of watching
  show: { trail: true, labels: true, stars: true },
  margin: 'gods',                         // what the margin lists: the 'gods', or the 'list' of steps or circuits
  god: null,                              // the god last pointed at in the margin, whose description stays up
  theme: prefers('(prefers-color-scheme: light)') ? 'light' : 'dark',
};

// The sequence: whether it is being gone through, and the step reached.
const walk = { active: false, index: 0, saved: null };

// With the Same running the heaven is a blur at more than a few turns a
// second, but a followed star's path is easiest to read then.
const SPEED_RANGE = { held: [3, 3000], daily: [0.01, 4], noon: [1, 200] };

const VIEWS = [
  { id: 'outside', name: 'Outside the heaven',
    note: 'This view shows the whole heaven from outside. Nobody could stand here, because Timaeus says that nothing visible was left outside the world (33c).' },
  { id: 'ground', name: 'At Athens',
    note: 'This view shows the sky from the ground at Athens, looking south. You can drag the picture to look in other directions. The circles are not drawn in this view. It shows only what can be seen from the ground, which is the fixed stars in their positions of 350 BC, the seven planets, and a faint band that marks the path the planets follow.' },
];

const CLOCK_NOTES = {
  held: 'The turning of the Same is stopped so that the slower motions along the Different are easier to see.',
  daily: 'The Same turns the whole heaven once a day, so time passes much more slowly on this setting. If you are following a planet, its path is drawn behind it, and you can see how the two motions together wind the path into a spiral (39a).',
  noon: 'The picture is updated once a day, always at noon. This takes the daily turning of the Same out of view, so that you can see how things change over the course of a year.',
};

let model = null;
let T = 0;                    // days the Different has run
let Td = 0;                   // days the Same has run
let owed = 0;                 // from noon to noon: the part of a day not yet stepped
let act = null;               // a scene of the making on stage: { acts, total, at, still }, with `at` in seconds
let arrival = null;           // what is coming to be in the heaven while a step plays: { name, total, at }
let scrubbing = false;        // the step's slider is being dragged
let hover = null;             // what the row pointed at picks out in the picture: a circuit, or a god that is in it
let rows = {};                // the list's row for each circuit, step or god
let sinceReadout = 1;         // seconds since the readout was last refreshed
let lastView = null;          // what the stage was last set up for
let lastSky = null;           // the daylight last painted on the sky

// ---------- what is on stage ----------

const scene = () => (walk.active ? sceneOf(MAKING[walk.index]) : null);
const heavenScene = () => { const s = scene(); return s && s.heaven ? s.heaven : null; };
const eyeNow = () => { const s = scene(); return s ? (s.heaven ? s.heaven.view : 'outside') : state.view; };
// The star whose path is traced: the one chosen, or in the sequence the one the step follows.
const focusNow = () => (walk.active ? (heavenScene() || {}).follow || null : state.focus);
const followed = () => { const id = focusNow(); return id ? circleOf(model, id) : null; };
const look = () => view.setLook(state.show, hover);
const heightOf = (v) => Math.asin(clamp(dot(v, ZENITH), -1, 1)) / DEG;   // degrees above the horizon at Athens

function rebuild() {
  model = buildModel(state.config);
  const theme = THEMES[state.theme], eye = eyeNow();
  const h = heavenScene() || {};          // what the step asks of the heaven, if it is a step that looks at it
  if (act) {
    view.clear();
    // Left standing from one step of the making to the next, so that what is turning does not start again.
    if (!making.root || making.theme !== theme || making.model.config.sizes !== state.config.sizes) making.build(model, { theme, right: RIGHT });
    making.setLabels(state.show.labels);
  } else {
    making.clear();
    // In the sequence the heaven is shown only as far as it has been made.
    view.build(model, {
      theme, focus: focusNow(), eye, zenith: ZENITH, right: RIGHT,
      lacks: [...(h.lacks || []), ...(h.arrive === 'light' || h.arrive === 'stars' ? [h.arrive] : [])],
      souls: h.arrive === 'souls' || h.arrive === 'sown',
      extent: h.near,
    });
    if (arrival) view.setArrival(arrival.name, arrival.at / arrival.total);
  }
  hover = null;
  look();
  stage.setEye(eye);
  if (eye === 'outside') {
    // With the circles at Plato's numbers the inner ones are small, and the viewer may come much closer.
    // While the strips lie flat they are long, and the viewer has to stand a long way back.
    // A step that stands close in, to show the Earth or the Moon's path about it, may come closer still.
    stage.controls.minDistance = state.config.sizes === 'even' && !h.near ? 16 : 2.5;
    stage.controls.maxDistance = act ? 460 : 150;
  }
  const standing = act ? 'making' : eye;
  if (standing !== lastView) {
    lastView = standing;
    if (!act) stage.setUp(eye === 'ground' ? upQuaternion(ZENITH, EAST) : STANDING, false);
    stage.setSky(null);
  }
  lastSky = null;
  sinceReadout = 1;
  if (act) {
    // A step of the making has no clock and nothing to read off.
    setReadout('', null);
    $('elapsed').textContent = '';
  }

  const exploring = !walk.active;
  $('explore').hidden = !exploring;
  $('walk').hidden = exploring;
  $('time-heaven').hidden = !!act;
  $('astronomy').hidden = !state.astronomy;
  $('mode-making').setAttribute('aria-pressed', String(walk.active));
  $('mode-look').setAttribute('aria-pressed', String(exploring && !state.astronomy));
  $('mode-astronomy').setAttribute('aria-pressed', String(exploring && state.astronomy));
  $('drag-note').textContent = eye === 'ground' ? 'Drag to look round.' : 'Drag to turn the view, and scroll to move in or out.';
  if (walk.active) renderWalk();
  else { renderView(); renderFocus(); renderSizes(); }
  renderMargin();
  renderSpeed();
}

function restart() {
  if (act) { act.at = act.still ? act.total : 0; return; }
  if (arrival) arrival.at = 0;
  T = 0;
  Td = state.clock === 'noon' ? NOON : 0;
  owed = 0;
  view.clearTrail();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  stage.setTheme(THEMES[state.theme]);
  $('theme').textContent = state.theme === 'dark' ? 'Paper' : 'Night';
  rebuild();
}

function advance(seconds) {
  const mode = state.clock;
  let days = seconds * state.speed[mode];
  if (mode === 'noon') {
    // Whole days only: each look at the sky comes a day after the last.
    owed += days;
    days = Math.floor(owed);
    owed -= days;
    if (!days) return;
  }
  const c = followed();
  // Small steps, so that the path stays smooth however fast the time runs.
  const fastest = c ? c.rate + (mode === 'held' ? 0 : 2 * Math.PI) : 0;
  const steps = c ? Math.max(1, Math.min(96, Math.ceil((fastest * days) / 0.02))) : 1;
  const d = days / steps;
  for (let k = 0; k < steps; k++) {
    T += d;
    if (mode !== 'held') Td += d;
    if (c && mode !== 'noon') view.recordTrail(seen(model, c, T, Td));
  }
  if (mode === 'noon') {
    Td = NOON + T;
    if (c) view.recordTrail(seen(model, c, T, Td));
  }
}

// Which act of the scene is playing, and how far through it is.
function actNow() {
  let t = act.at;
  for (let k = 0; k < act.acts.length; k++) {
    const length = ACT_SECONDS[act.acts[k]];
    if (t < length || k === act.acts.length - 1) return [act.acts[k], Math.min(1, t / length)];
    t -= length;
  }
  return [act.acts[0], 0];
}

stage.onFrame((dt) => {
  if (!model) return;
  if (act) {
    if (state.playing) act.at = Math.min(act.total, act.at + dt);
    const [name, p] = actNow();
    if (state.playing) making.tick(dt, name, p);
    making.show(name, p);
    // The picture grows and shrinks and turns with the act, and the viewer is moved to suit it.
    stage.setExtent(making.extent(name, p));
    stage.setUp(FACING.clone().slerp(STANDING, making.turned(name, p)), false);
    if (!scrubbing) $('act').value = Math.round((1000 * act.at) / act.total);
    return;
  }
  if (state.playing) advance(dt);
  if (arrival) {
    // Something is coming to be in the heaven as the step plays.
    if (state.playing) arrival.at = Math.min(arrival.total, arrival.at + dt);
    view.setArrival(arrival.name, arrival.at / arrival.total);
    if (!scrubbing) $('act').value = Math.round((1000 * arrival.at) / arrival.total);
  }
  const longitudes = {};
  for (const c of model.circles) longitudes[c.id] = longitude(c, T);
  view.update({ heaven: heaven(Td), longitudes });
  if (eyeNow() === 'ground') {
    // Twilight: the sky is dark once the Sun is 12° under the horizon.
    const sun = seen(model, circleOf(model, 'sun'), T, Td);
    const k = Math.round(clamp((heightOf(sun) + 12) / 12, 0, 1) * 200) / 200;
    if (k !== lastSky) { lastSky = k; stage.setSky(k); view.setDaylight(k); }
  }
  readout(dt);
});

// ---------- the left panel, looking around ----------

function renderSpeed() {
  const mode = state.clock, [lo, hi] = SPEED_RANGE[mode], s = clamp(state.speed[mode], lo, hi);
  $('speed').value = Math.round((1000 * Math.log(s / lo)) / Math.log(hi / lo));
  const secs = (mode === 'daily' ? 1 : YEAR) / s;
  const shown = secs >= 10 ? Math.round(secs) : secs >= 1 ? secs.toFixed(1) : secs.toFixed(2);
  $('speed-text').textContent = `${mode === 'daily' ? 'a day' : 'a year'} in ${shown} s`;
  $('clock').value = mode;
  $('clock-note').textContent = CLOCK_NOTES[mode];
}

function setClock(mode) {
  if (!walk.active) state.clocks[state.view] = mode;
  if (mode === state.clock) return;
  state.clock = mode;
  if (mode === 'noon') {
    // Begin from the nearest noon.
    T = Math.round(T);
    Td = NOON + T;
    owed = 0;
  }
  // The path so far was drawn on another clock and no longer joins up.
  view.clearTrail();
  renderSpeed();
}

function renderView() {
  const box = $('views');
  box.textContent = '';
  for (const v of VIEWS) {
    const b = el('button', '', v.name);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.view === v.id));
    b.onclick = () => {
      if (state.view === v.id) return;
      state.view = v.id;
      setClock(state.clocks[v.id]);       // from the ground the sky turns; from outside it is held, unless changed
      rebuild();
    };
    box.appendChild(b);
  }
  $('view-note').textContent = VIEWS.find((v) => v.id === state.view).note;
  for (const e of document.querySelectorAll('[data-views]')) e.hidden = !e.dataset.views.split(' ').includes(state.view);
}

function chooseFocus(id) {
  state.focus = state.focus === id ? null : id;
  rebuild();
}

function renderFocus() {
  const box = $('focus');
  box.textContent = '';
  for (const c of model.circles) {
    const b = el('button', '', c.name);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.focus === c.id));
    b.onclick = () => chooseFocus(c.id);
    box.appendChild(b);
  }
  const c = followed();
  $('focus-note').textContent = c ? c.says : 'Choose a planet to highlight its circle and trace its path.';
}

function renderSizes() {
  const select = $('sizes');
  if (!select.options.length) {
    for (const [key, s] of Object.entries(SIZES)) select.append(new Option(s.name, key));
  }
  select.value = state.config.sizes;
  $('sizes-note').textContent = SIZES[state.config.sizes].note;
}

function renderLegend() {
  const box = $('legend');
  box.textContent = '';
  for (const s of Object.values(SOURCES)) {
    const li = el('li');
    li.append(el('b', '', s.label), document.createTextNode(s.detail));
    box.appendChild(li);
  }
}

// ---------- the left panel, going through the making ----------

function renderWalk() {
  const i = walk.index, step = MAKING[i];
  $('walk-head').textContent = step.title;
  $('walk-where').textContent = step.ref;
  $('walk-count').textContent = `${i + 1} of ${MAKING.length}`;
  $('walk-say').textContent = step.say;
  $('walk-greek').textContent = step.el;
  $('walk-english').textContent = step.en;
  $('walk-dispute').textContent = step.dispute || '';
  $('walk-prev').disabled = i === 0;
  $('walk-next').disabled = i === MAKING.length - 1;
  $('act-row').hidden = !(arrival || (act && !act.still));
}

// Move to step i. A step of the making plays from its beginning. A step that
// looks at the heaven sets its clock going, and if something comes to be in
// it, that plays from its beginning too.
function goTo(i) {
  walk.index = clamp(i, 0, MAKING.length - 1);
  const s = sceneOf(MAKING[walk.index]);
  arrival = s.heaven && s.heaven.arrive ? { name: s.heaven.arrive, total: ARRIVAL_SECONDS[s.heaven.arrive], at: 0 } : null;
  if (s.heaven) {
    act = null;
    state.clock = s.heaven.clock;
    state.speed[state.clock] = s.heaven.speed;
    restart();
  } else {
    const total = s.acts.reduce((sum, a) => sum + ACT_SECONDS[a], 0);
    act = { acts: s.acts, total, at: s.still ? total : 0, still: !!s.still };
  }
  rebuild();
  // Keep the step's row in sight in the list. In a narrow window the list is
  // as long as the page, and the page is left where it is.
  const box = $('rollcall'), row = state.margin === 'list' ? rows[walk.index] : null;
  if (row && box.scrollHeight > box.clientHeight) row.scrollIntoView({ block: 'nearest' });
}

// Take the sequence up where it was left, or go back to looking around.
function setWalking(on) {
  if (on === walk.active) return;
  if (on) {
    walk.saved = { clock: state.clock, speed: { ...state.speed } };
    walk.active = true;
    stage.resetView();
    goTo(walk.index);
  } else {
    walk.active = false;
    act = null;
    arrival = null;
    state.clock = walk.saved.clock;
    state.speed = walk.saved.speed;
    stage.resetView();
    restart();
    rebuild();
  }
}

// ---------- the margin ----------

// The margin lists the gods of the Timaeus, or else the steps of the sequence
// (while it is being gone through) or the eight circuits (looking around).
function renderMargin() {
  const gods = state.margin === 'gods';
  $('tab-gods').setAttribute('aria-pressed', String(gods));
  $('tab-list').setAttribute('aria-pressed', String(!gods));
  $('tab-list').textContent = walk.active ? 'The steps' : 'The circuits';
  $('rollcall-wrap').classList.toggle('gods', gods);
  $('detail').hidden = !gods && walk.active;
  if (gods) renderGods();
  else if (walk.active) renderSteps();
  else renderCircuits();
}

const stepAt = (ref) => MAKING.findIndex((s) => s.ref === ref);

// The gods, each with what Timaeus calls it. Going through the sequence, a
// god whose making has not yet been told is shown faint. Pointing at a row
// picks the god out in the picture, if it is there, and puts up what Timaeus
// says of it and how that is disputed; clicking goes to the step that tells
// its making.
function renderGods() {
  const theme = THEMES[state.theme];
  const colours = { ink: theme.ink, zodiacal: theme.roles.zodiacal, star: theme.star, earth: theme.earth, curve: theme.curve };
  const box = $('rollcall');
  box.textContent = '';
  rows = {};
  let group = null;
  for (const g of GODS) {
    if (g.group !== group) {
      group = g.group;
      box.appendChild(el('p', 'tc-head', GOD_GROUPS[group]));
    }
    const told = stepAt(g.at), made = !walk.active || walk.index >= stepAt(g.from || g.at);
    const r = el('div', 'tc-row god choose');
    r.tabIndex = 0;
    const mark = el('span', g.dot ? 'dot' : 'dot hollow');
    if (g.dot) mark.style.background = colours[g.dot];
    const what = el('span', 'what', g.name);
    what.appendChild(el('small', '', `“${g.called}”`));
    r.append(mark, what, el('span', 'period', g.ref));
    r.classList.toggle('unmade', !made);
    r.classList.toggle('focused', walk.active && walk.index === told);
    r.title = `Go to step ${told + 1}, ${MAKING[told].title}`;
    // The picture answers only for a god that is in it by now.
    const on = () => { hover = made && !act ? g.lit : null; state.god = g.id; look(); showGod(); showPointed(g.id); };
    const off = () => { hover = null; look(); showPointed(null); };
    r.onmouseenter = on; r.onmouseleave = off; r.onfocus = on; r.onblur = off;
    const go = () => { if (walk.active) goTo(told); else { walk.index = told; setWalking(true); } };
    r.onclick = go;
    r.onkeydown = (e) => { if (e.code === 'Enter') go(); };
    box.appendChild(r);
    rows[g.id] = r;
  }
  $('margin-title').textContent = 'The gods of the Timaeus';
  $('count-line').textContent = 'Timaeus speaks of a maker, of five gods or kinds of god that he made, and of something divine in each of us.';
  $('count-note').textContent = walk.active
    ? 'A god that has not yet appeared in the story is shown faintly. Point at a row to read about that god, or click it to go to the step that introduces it.'
    : 'Point at a row to read about that god, or click it to go to the step that introduces it.';
  showGod();
}

function showPointed(id) {
  for (const [key, r] of Object.entries(rows)) r.classList.toggle('lit', key === id);
}

// What Timaeus says of the god last pointed at, and how it is disputed. It
// stays up when the pointer leaves the row, so that it can be read to the end.
function showGod() {
  const box = $('detail');
  box.textContent = '';
  const g = GODS.find((x) => x.id === state.god);
  if (!g) {
    box.appendChild(el('p', 'hint', 'Point at a god to read what Timaeus says about it and what scholars disagree about.'));
    return;
  }
  const head = el('p', 'god-head');
  const greek = el('span', 'greek-phrase', g.greek);
  greek.lang = 'grc';
  head.append(el('b', '', g.name), greek, el('span', 'where-phrase', g.ref));
  box.append(head, el('p', '', g.says), el('p', 'dispute', g.dispute));
  box.scrollTop = 0;
}

// Going through the making, the margin lists its steps.
function renderSteps() {
  const box = $('rollcall');
  box.textContent = '';
  rows = {};
  MAKING.forEach((step, k) => {
    const r = el('div', 'tc-row step choose');
    r.tabIndex = 0;
    r.append(el('span', 'num', String(k + 1)), el('span', 'what', step.title), el('span', 'period', step.ref.replace('Timaeus ', '')));
    r.classList.toggle('focused', k === walk.index);
    r.onclick = () => goTo(k);
    r.onkeydown = (e) => { if (e.code === 'Enter') goTo(k); };
    box.appendChild(r);
    rows[k] = r;
  });
  // Where the steps begin and end in the text: "36d–e" ends at 36e.
  const ends = (ref) => { const [, page, from, to] = /(\d+)([a-e])(?:–(\d*[a-e]))?/.exec(ref); return [page + from, !to ? page + from : /\d/.test(to) ? to : page + to]; };
  const first = ends(MAKING[0].ref)[0], last = ends(MAKING[MAKING.length - 1].ref)[1];
  $('margin-title').textContent = 'The making, step by step';
  $('count-line').textContent = `${MAKING.length} steps, from ${first} to ${last}.`;
  $('count-note').textContent = 'The steps end where the maker’s own work ends. Timaeus goes on to describe how the young gods made the human body, which is not shown here.';
}

// What a row of the list says when it is pointed at: what Timaeus says of the
// circuit, and where each figure used for it comes from.
function showDetail(id) {
  const box = $('detail');
  box.textContent = '';
  const c = id === 'same' ? model.same : id ? circleOf(model, id) : null;
  if (!c) {
    box.appendChild(el('p', 'hint', 'Point at a circuit to read what Timaeus says about it. Click one of the seven planets to follow it.'));
    return;
  }
  box.appendChild(el('p', '', c.says));
  const list = el('ul', 'sources');
  const line = (what, source) => {
    const li = el('li');
    const b = el('b', '', SOURCES[source].label);
    b.title = SOURCES[source].detail;
    li.append(el('span', '', what), b);
    list.appendChild(li);
  };
  line(`Period: ${c.label}`, c.source);
  if (id !== 'same') {
    line('Size of its circle', c.sizeSource);
    line('Where it starts', 'display');
  }
  box.appendChild(list);
}

// Looking around, the margin lists the eight circuits.
function renderCircuits() {
  const theme = THEMES[state.theme];
  const box = $('rollcall');
  box.textContent = '';
  rows = {};
  const row = (id, name, called, period, colour) => {
    const r = el('div', 'tc-row');
    r.tabIndex = 0;
    const mark = el('span', 'dot');
    mark.style.background = colour;
    const what = el('span', 'what', name);
    if (called) what.appendChild(el('small', '', called));
    r.append(mark, what, el('span', 'period', period));
    const on = () => { hover = id; look(); showLit(); showDetail(id); };
    const off = () => { hover = null; look(); showLit(); showDetail(state.focus); };
    r.onmouseenter = on; r.onmouseleave = off; r.onfocus = on; r.onblur = off;
    box.appendChild(r);
    rows[id] = r;
    return r;
  };
  row('same', model.same.name, null, model.same.label, theme.roles.daily);
  box.appendChild(el('p', 'tc-head', 'The seven circles of the Different'));
  for (const c of model.circles) {
    const r = row(c.id, c.name, c.called, c.label, c.colors[state.theme]);
    r.classList.add('choose');
    r.onclick = () => chooseFocus(c.id);
    r.onkeydown = (e) => { if (e.code === 'Enter') chooseFocus(c.id); };
  }
  $('margin-title').textContent = 'The eight circuits';
  $('count-line').textContent = 'The heaven has eight circuits, one of the Same and seven of the Different.';
  $('count-note').textContent = 'Timaeus says that the circuits of the Same, the Moon and the Sun measure the day, the month and the year, and that Venus and Mercury keep pace with the Sun. He gives no period for the other three planets.';
  showLit();
  showDetail(state.focus);
}

function showLit() {
  for (const [id, r] of Object.entries(rows)) {
    r.classList.toggle('lit', hover === id);
    r.classList.toggle('focused', state.focus === id);
  }
}

// ---------- the readout ----------

let readoutLabels = '';
function setReadout(title, lines) {
  $('readout-section').hidden = !lines;
  if (!lines) return;
  $('readout-title').textContent = title;
  const box = $('readout'), labels = lines.map((r) => r[0]).join('|');
  if (labels !== readoutLabels) {
    readoutLabels = labels;
    box.textContent = '';
    for (const [name] of lines) box.append(el('dt', '', name), el('dd'));
  }
  lines.forEach(([, value], k) => { box.children[2 * k + 1].textContent = value; });
}

const heightWords = (deg) => (Math.abs(deg) < 0.05 ? 'on the horizon' : `${Math.abs(deg).toFixed(1)}° ${deg > 0 ? 'above' : 'below'} the horizon`);
const theName = (c) => `${c.id === 'sun' || c.id === 'moon' ? 'the ' : ''}${c.name}`;

function readout(dt) {
  sinceReadout += dt;
  if (sinceReadout < 0.12) return;
  sinceReadout = 0;

  const years = Math.floor(T / YEAR), whole = Math.floor(T - years * YEAR);
  $('elapsed').textContent = years ? `${years} y ${whole} d` : `${whole} d`;

  const c = followed();
  if (eyeNow() === 'ground') {
    const height = heightOf(seen(model, circleOf(model, 'sun'), T, Td));
    const lines = [
      ['Height of the Sun', heightWords(height)],
      ['Time of day', height > 0 ? 'day' : height > -12 ? 'twilight' : 'night'],
    ];
    if (c && c.id !== 'sun') lines.unshift([`Height of ${theName(c)}`, heightWords(heightOf(seen(model, c, T, Td)))]);
    return setReadout('The sky over Athens', lines);
  }
  if (!c || walk.active) return setReadout('', null);
  const behind = fallsBehind(c);
  const lines = [
    ['Its own circuit', c.label],
    ['Falls behind the fixed stars', `${behind.toFixed(behind < 0.1 ? 3 : behind < 1 ? 2 : 1)}° a day`],
  ];
  if (c.id !== 'sun') {
    const e = fromSun(model, c.id, T);
    lines.push(['From the Sun', Math.abs(e) < 0.05 ? 'with it' : `${Math.abs(e).toFixed(1)}° ${e > 0 ? 'east, seen in the evening' : 'west, seen before dawn'}`]);
  }
  setReadout(`Where ${theName(c)} is`, lines);
}

// ---------- wiring ----------

function setPlaying(on) {
  state.playing = on;
  $('play').textContent = on ? 'Pause' : 'Play';
}

$('mode-making').onclick = () => setWalking(true);
$('mode-look').onclick = () => {
  state.astronomy = false;
  if (walk.active) setWalking(false); else rebuild();
};
// One button for the astronomy: it opens the readings and the sources, and closes them again.
$('mode-astronomy').onclick = () => {
  state.astronomy = walk.active ? true : !state.astronomy;
  if (walk.active) setWalking(false); else rebuild();
};
$('sizes').onchange = (e) => { state.config.sizes = e.target.value; rebuild(); };
$('walk-prev').onclick = () => goTo(walk.index - 1);
$('walk-next').onclick = () => goTo(walk.index + 1);
// The slider moves a step of the making to any point in it; the button plays it again.
$('act').oninput = (e) => { const playing = act || arrival; if (playing) playing.at = (playing.total * e.target.value) / 1000; };
$('act').onpointerdown = () => { scrubbing = true; };
$('act').onpointerup = $('act').onpointercancel = $('act').onchange = () => { scrubbing = false; };
$('again').onclick = () => { const playing = act || arrival; if (playing) { playing.at = 0; setPlaying(true); } };
// The margin's two lists.
for (const [id, margin] of [['tab-gods', 'gods'], ['tab-list', 'list']]) {
  $(id).onclick = () => { state.margin = margin; hover = null; look(); renderMargin(); };
}

$('play').onclick = () => setPlaying(!state.playing);
$('reset').onclick = () => restart();
$('speed').oninput = (e) => {
  const [lo, hi] = SPEED_RANGE[state.clock];
  state.speed[state.clock] = lo * Math.pow(hi / lo, e.target.value / 1000);
  renderSpeed();
};
$('clock').onchange = (e) => setClock(e.target.value);

for (const key of Object.keys(state.show)) {
  const box = $(`show-${key}`);
  box.checked = state.show[key];
  box.onchange = () => { state.show[key] = box.checked; look(); making.setLabels(state.show.labels); };
}
$('clear-trail').onclick = () => view.clearTrail();
$('reset-view').onclick = () => stage.resetView();
$('theme').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); };

window.addEventListener('keydown', (e) => {
  const within = (selector) => e.target instanceof Element && e.target.closest(selector);
  if (within('input, select, textarea')) return;
  if (walk.active && (e.code === 'ArrowRight' || e.code === 'ArrowLeft')) {
    e.preventDefault();
    goTo(walk.index + (e.code === 'ArrowRight' ? 1 : -1));
  } else if (e.code === 'Space' && !within('button')) {
    e.preventDefault();
    setPlaying(!state.playing);
  }
});

renderLegend();
applyTheme();
setPlaying(state.playing);

// For looking around from the browser console.
window.kosmoi = {
  state, stage, view, making, walk,
  get model() { return model; },
  get time() { return { T, Td }; },
  get act() { return act; },
  get arrival() { return arrival; },
  rebuild, restart, setClock, advance, chooseFocus, goTo, setWalking,
};
