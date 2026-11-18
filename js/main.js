// Aristotle's cosmos. In front: the argument of Metaphysics Lambda in fourteen
// steps, what lies below the Moon, and a plain way of looking round, with the
// spheres and their movers set out in the right-hand margin. Behind one
// button, "Astronomy": the astronomers' systems, the rival reconstructions,
// every period and tilt, and the full roll-call of spheres. The reading of
// Lambda 8 clause by clause shows that detail too.

import { TAU, DEG, I3, rot, mul, dot, orientations, apply, transpose, lonLat, angleDiff } from './core/kinematics.js';
import { PLANETS, SOURCES, YEAR, OBLIQUITY } from './cosmologies/aristotle/eudoxus.js';
import { ORDER, BODIES, DAILY, buildSystem, defaultConfig, isDaily, starServed } from './cosmologies/aristotle/system.js';
import { HeavenView } from './cosmologies/aristotle/heaven-view.js';
import { SublunaryView } from './cosmologies/aristotle/sublunary-view.js';
import { seasons, wander, elongation, daylight } from './cosmologies/aristotle/measure.js';
import { Stage, THEMES, upQuaternion } from './stage/stage.js';
import { SIGNS } from './stage/parts.js';
import { SCRIPTS, sceneOf, sectionOf, litIndices } from './walk.js';

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
const view = new HeavenView(stage);       // the heaven, from outside or from the ground
const below = new SublunaryView(stage);   // what lies inside the Moon's sphere

// The place the sky is watched from. Athens lies at 37°58′ north.
const LATITUDE = 38;
const ZENITH = [Math.cos(LATITUDE * DEG), 0, Math.sin(LATITUDE * DEG)];
const EAST = [0, 1, 0];
// What the daily clock reads when the Sun, at the start, stands due south of Athens.
const NOON = (Math.PI / 2) / DAILY;
// Below the Moon the picture is turned so that Athens faces the viewer.
const BELOW_RIGHT = [Math.cos(70 * DEG), Math.sin(70 * DEG), 0];

// What the left panel sets when exploring.
const state = {
  config: defaultConfig(),
  view: 'outside',                        // 'outside' the heaven, on the 'ground' at Athens, 'below' the Moon
  astronomy: false,                       // the astronomy's switches, and the full roll-call, on show
  focus: null,                            // the body being followed, or null for none
  alone: false,                           // draw only that body's spheres
  movers: true,                           // the movers' column in the roll-call
  colourBy: 'star',                       // by the 'star' a sphere's motion is for, or by the 'work' it does
  serve: 'above',                         // which planet an unwinding sphere is for
  clock: 'held',                          // the daily rotation: 'held' still, 'daily' running, or seen once a day at 'noon'
  clocks: { outside: 'held', ground: 'daily', below: 'held' },   // the clock last used from each place to stand
  held: new Set(),                        // keys of spheres held still one by one
  playing: !prefers('(prefers-reduced-motion: reduce)'),
  speed: { held: 60, daily: 0.05, noon: 14 },  // days of the model per second of watching
  show: { trail: true, figure: true, shells: false, sight: true, labels: true, stars: true, arrows: false },
  upright: 'zodiac',
  theme: prefers('(prefers-color-scheme: light)') ? 'light' : 'dark',
};

// The guided sequences: which one is being gone through (null when exploring)
// and the step reached in each.
const walk = {
  script: null, at: { argument: 0, chapter: 0, below: 0, trials: 0 }, scene: null, saved: null,
  get active() { return this.script !== null; },
  get steps() { return SCRIPTS[this.script].steps; },
  get index() { return this.at[this.script]; },
  get step() { return this.steps[this.index]; },
};

// With the daily rotation running, anything faster than about a day a second is a blur.
const SPEED_RANGE = { held: [3, 3000], daily: [0.01, 1], noon: [1, 200] };

const SYSTEMS = [
  { id: 'eudoxus', name: 'Eudoxus', lines: '1073b17–32',
    note: 'Each planet has its own set of spheres, and the first sphere of every set moves as the fixed stars do. There are three spheres for the Sun, three for the Moon and four for each of the other planets.' },
  { id: 'callippus', name: 'Callippus', lines: '1073b32–38',
    note: 'Callippus kept the same arrangement and added two spheres each for the Sun and the Moon and one each for Mars, Venus and Mercury.' },
  { id: 'aristotle', name: 'Aristotle', lines: '1073b38–1074a14',
    note: 'The sets are combined into a single system. Below the spheres of every planet except the Moon there are unwinding spheres, one fewer than the planet’s own, which cancel its motions so that the next set starts from the motion of the fixed stars.' },
];

const LINKAGE_NOTES = {
  text: 'On the text as we have it, the first sphere of each set is carried round by the sphere above it and has no motion of its own to add. That leaves a sphere, and its mover, with nothing to do.',
  hanson: 'Hanson adds six more spheres, one below each set, which cancel the daily rotation as well and so stand still. The first sphere of the next set then supplies the daily rotation itself. These extra spheres are not in Aristotle.',
  drop: 'Dreyer, Heath and Ross pointed out that Aristotle could have left out the first sphere of every set below Saturn’s. Sosigenes had already objected to a similar proposal, on the ground that the spheres have to restore position as well as motion.',
  beere: 'On Beere’s reading a sphere passes on only the motion of its poles, so each first sphere has to turn by its own motion. The heavens look the same as they do on the reading of the text. The difference lies in which spheres are doing the work.',
};

const VIEWS = [
  { id: 'outside', name: 'Outside the heaven',
    note: 'This view looks at the whole heaven from beyond the fixed stars. According to Aristotle nobody could actually stand there, because outside the heaven there is no place, void or time (De Caelo I 9).' },
  { id: 'ground', name: 'At Athens',
    note: 'This is the view from the ground at Athens, facing south. You can drag to look in other directions. The spheres are not drawn here, only the things they carry, which are the fixed stars as they were in 350 BC and the seven wandering stars.' },
  { id: 'below', name: 'Below the Moon',
    note: 'This view shows the region inside the lowest sphere of the heaven. The only parts of the heaven that are drawn are the Moon, the Sun and the zodiac, and they move as they do in the system currently chosen.' },
];

const CLOCK_NOTES = {
  held: 'The daily turning is stopped so that the slower motions are easier to see.',
  daily: 'The heaven turns once a day, so time runs much more slowly.',
  noon: 'The picture is shown once a day, always at noon. This hides the daily turning and shows how things change over the year.',
};

// The four simple bodies, outermost first (On Generation and Corruption II 3; De Caelo IV 4–5).
const SIMPLE_BODIES = [
  { id: 'fire', name: 'Fire', qualities: 'hot and dry', place: 'rises above all the others, as far as the Moon’s sphere' },
  { id: 'air', name: 'Air', qualities: 'hot and moist', place: 'rises above water and earth, but not above fire' },
  { id: 'water', name: 'Water', qualities: 'cold and moist', place: 'sinks below air and fire, and rests on earth' },
  { id: 'earth', name: 'Earth', qualities: 'cold and dry', place: 'sinks below all the others, to the middle' },
];

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
const ordinal = (n) => ORDINALS[n - 1] || `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;

let now = null;               // the settings in force: the panel's, or the current scene's
let system = null;
let T = 0;                    // days since the start, for everything but the daily rotation
let Td = 0;                   // days the daily rotation has run
let owed = 0;                 // from noon to noon: the part of a day not yet stepped
const lags = new Map();       // per sphere key: days it has spent held still
let builds = 0;
let figureKey = null;
let rebuildWanted = false;
let hover = null;             // index of the sphere pointed at in the roll-call
let walkLit = [];             // indices of the spheres the current step picks out
let rowOf = [];               // roll-call row for each sphere index
let sinceReadout = 1;         // seconds since the readout was last refreshed
let lastView = null;          // the view the stage was last set up for
let lastSky = null;           // the daylight last painted on the sky
const measured = new Map();   // per step of a sequence: what was measured on its model

// ---------- the model and its picture ----------

function settings() {
  if (!walk.active) {
    return {
      config: state.config, view: state.view,
      focus: state.view === 'below' ? null : state.focus,
      only: state.view === 'outside' && state.alone && state.focus ? [state.focus] : null,
      rings: true, movers: state.movers, colourBy: state.colourBy, serve: state.serve, arrows: state.show.arrows, tethers: null,
    };
  }
  const step = walk.step, sc = sceneOf(step);
  const config = defaultConfig();
  for (const k of ['system', 'linkage', 'unwinding', 'sunMoonExtras', 'callippus', 'luminaries']) config[k] = sc[k];
  for (const [id, change] of Object.entries(sc.planets || {})) Object.assign(config.planets[id], change);
  return {
    config, view: sc.view, focus: sc.view === 'below' ? null : sc.focus, only: sc.view === 'outside' ? sc.only : null,
    rings: sc.rings, movers: step.movers ?? sc.movers, colourBy: sc.colourBy, serve: 'above', arrows: sc.arrows,
    tethers: step.tethers || null,
  };
}

// Whether the astronomy is on show: the full roll-call with its periods and
// boxes, the hippopede, the readout of where a planet is. It is in the two
// sequences that are about the astronomy, and otherwise only when asked for.
const detailed = () => (walk.active ? walk.script === 'chapter' || walk.script === 'trials' : state.astronomy);
// What is drawn: the viewer's choices, less what belongs to the astronomy while that is out of sight.
const shown = () => (detailed() ? state.show : { ...state.show, figure: false, sight: false, shells: false });
const changed = () => JSON.stringify(state.config) !== JSON.stringify(defaultConfig());

const focusBody = () => (now.focus ? system.bodies.find((b) => b.id === now.focus) : null);
const bodyNamed = (id) => system.bodies.find((b) => b.id === id);
const angleAt = (s, t, td) => (s.phase || 0) + s.rate * ((isDaily(s) ? td : t) - (lags.get(s.key) || 0));
const lit = () => (hover !== null ? [hover] : walkLit);
// Pointing at a sphere fades the rest right down; a step of a sequence picks
// spheres out more gently, since the others are part of what it shows.
function look() {
  view.setLook(shown(), lit(), hover !== null ? 0.2 : 0.45);
  below.setLook({ labels: state.show.labels, arrows: walk.active ? !!(now && now.arrows) : state.show.arrows });
}

function sphereColour(s) {
  const theme = THEMES[state.theme];
  if (now.colourBy !== 'star') return theme.roles[s.role];
  const star = starServed(s, now.serve);
  return star === 'stars' ? theme.star : BODIES[star].colors[state.theme];
}

function rebuild() {
  now = settings();
  system = buildSystem(now.config);
  const keys = new Set(system.spheres.map((s) => s.key));
  for (const k of [...state.held]) if (!keys.has(k)) state.held.delete(k);
  for (const k of [...lags.keys()]) if (!keys.has(k)) lags.delete(k);
  hover = null;
  walkLit = walk.active ? litIndices(system, walk.step.lit) : [];
  look();
  const theme = THEMES[state.theme];
  if (now.view === 'below') {
    view.clear();
    below.build({ theme, basis: system.basis, latitude: LATITUDE, tilt: OBLIQUITY / DEG, right: BELOW_RIGHT });
  } else {
    below.clear();
    view.build(system, {
      theme, focus: now.focus, only: now.only, rings: now.rings, colour: sphereColour,
      eye: now.view === 'ground' ? 'ground' : 'outside', zenith: ZENITH,
    });
  }
  look();
  stage.setEye(now.view === 'ground' ? 'ground' : 'outside');
  if (now.view !== lastView) {
    lastView = now.view;
    applyUpright(false);
    stage.setSky(null);
  }
  lastSky = null;
  builds++;
  figureKey = null;
  rebuildWanted = false;
  sinceReadout = 1;

  const exploring = !walk.active;
  $('explore').hidden = !exploring;
  $('walk').hidden = exploring;
  $('astronomy').hidden = !state.astronomy;
  for (const id of ['argument', 'below', 'chapter']) $(`mode-${id}`).setAttribute('aria-pressed', String(walk.script === id));
  $('mode-look').setAttribute('aria-pressed', String(exploring && !state.astronomy));
  $('mode-astronomy').setAttribute('aria-pressed', String(exploring ? state.astronomy : walk.script === 'trials'));
  $('changed-note').hidden = !(exploring && !state.astronomy && changed());
  $('row-arrows').hidden = !(exploring && now.view === 'below');
  $('drag-note').textContent = now.view === 'ground' ? 'Drag to look round.' : 'Drag to turn the view; scroll to move in or out.';
  if (walk.active) renderWalk();
  else { renderView(); renderSystem(); renderFocus(); renderTilt(); renderShow(); }
  renderRollcall();
  renderSpeed();
}

function restart() {
  T = 0;
  Td = state.clock === 'noon' ? NOON : 0;
  owed = 0;
  lags.clear();
  state.held.clear();
  figureKey = null;
  view.clearTrail();
}

// Which way is up on screen: the viewer's choice from outside, the zenith on
// the ground, the pole of the heaven below the Moon.
function applyUpright(animate) {
  const b = system.basis;
  stage.setUp(
    now.view === 'ground' ? upQuaternion(ZENITH, EAST)
      : now.view === 'below' ? upQuaternion([0, 0, 1], BELOW_RIGHT)
      : state.upright === 'zodiac' ? upQuaternion(b.pole, b.x)
      : upQuaternion([0, 0, 1], [1, 0, 0]),
    animate,
  );
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  stage.setTheme(THEMES[state.theme]);
  lastSky = null;
  $('theme').textContent = state.theme === 'dark' ? 'Paper' : 'Night';
  rebuild();
}

// A body's direction against the stars, that is, in the frame of the sphere
// of the fixed stars.
function direction(b, t = T, td = Td) {
  const part = system.spheres.slice(0, b.sphere + 1);
  const O = orientations(part, part.map((s) => angleAt(s, t, td)));
  return apply(transpose(O[0]), apply(O[b.sphere], b.position));
}

// The same as the Earth sees it, turning sky and all.
function seen(b, t = T, td = Td) {
  const part = system.spheres.slice(0, b.sphere + 1);
  const O = orientations(part, part.map((s) => angleAt(s, t, td)));
  return apply(O[b.sphere], b.position);
}

const heightOf = (v) => Math.asin(clamp(dot(v, ZENITH), -1, 1)) / DEG;   // degrees above the horizon at Athens
const northOf = (v) => Math.asin(clamp(v[2], -1, 1)) / DEG;              // degrees north of the equator

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
  const b = now.view === 'below' ? null : focusBody();
  let fastest = 0;
  if (b) {
    for (let i = 1; i <= b.sphere; i++) {
      const s = system.spheres[i];
      if (!isDaily(s) && !state.held.has(s.key)) fastest = Math.max(fastest, Math.abs(s.rate));
    }
  }
  // Small steps, so that the path stays smooth however fast the time runs.
  const steps = b ? Math.max(1, Math.min(64, Math.ceil((fastest * days) / 0.03))) : 1;
  const d = days / steps;
  for (let k = 0; k < steps; k++) {
    T += d;
    if (mode !== 'held') Td += d;
    for (const key of state.held) {
      const s = system.spheres.find((x) => x.key === key);
      if (s && (!isDaily(s) || mode !== 'held')) lags.set(key, (lags.get(key) || 0) + d);
    }
    if (b) view.recordTrail(direction(b));
  }
  if (mode === 'noon') Td = NOON + T;
}

// The closed curve the followed body runs round, in the frame of its second
// sphere: what its inner spheres do between them in one of their periods.
function updateFigure() {
  const b = focusBody();
  if (!b || !b.figure || !shown().figure) return view.showFigure(false);
  const inner = system.spheres.slice(b.figure.carrier + 1, b.sphere + 1);
  if (inner.some((s) => state.held.has(s.key))) return view.showFigure(false);
  const key = `${builds}|${inner.map((s) => lags.get(s.key) || 0).join()}`;
  if (key !== figureKey) {
    figureKey = key;
    const r = view.radii[b.sphere], N = 480, pts = [];
    for (let k = 0; k < N; k++) {
      const later = T + (b.figure.days * k) / N;
      let M = I3;
      for (const s of inner) M = mul(M, rot(s.axis, angleAt(s, later, Td)));
      const p = apply(M, b.position);
      pts.push([p[0] * r, p[1] * r, p[2] * r]);
    }
    view.setFigure(pts);
  }
  view.showFigure(true);
}

// A line from the sphere picked out to its mover in the margin: the sphere
// reaches towards the mover, not the mover towards the sphere. A step of a
// sequence may ask for every sphere's line at once, drawn faintly.
function updateTether() {
  const on = now.movers && now.view === 'outside';
  const stageBox = $('stage').getBoundingClientRect(), listBox = $('rollcall').getBoundingClientRect();
  const lineFor = (i) => {
    const row = rowOf[i], mark = row && row.querySelector('.mover');
    if (!mark) return '';
    const box = mark.getBoundingClientRect();
    const to = { x: box.left - 4, y: box.top + box.height / 2 };
    if (!box.width || to.y < listBox.top || to.y > listBox.bottom) return '';
    const from = view.ringPoint(i, stage.camera, stageBox, to);
    if (!from) return '';
    const bend = Math.max(40, Math.abs(to.x - from.x) * 0.45);
    return `M${from.x.toFixed(1)},${from.y.toFixed(1)} C${(from.x + bend).toFixed(1)},${from.y.toFixed(1)} ${(to.x - bend).toFixed(1)},${to.y.toFixed(1)} ${to.x.toFixed(1)},${to.y.toFixed(1)}`;
  };
  const picked = lit();
  const one = on && picked.length === 1 ? picked[0] : null;
  const every = on && now.tethers === 'all' ? system.spheres.map((s, i) => i).filter((i) => rowOf[i] && i !== one) : [];
  // Work out every line first and draw them afterwards, so that reading the page's layout is not mixed with changing it.
  const main = one !== null ? lineFor(one) : '';
  const rest = every.map(lineFor);

  const path = $('tether-path');
  path.setAttribute('d', main);
  if (main) {
    const colour = sphereColour(system.spheres[one]);
    path.style.stroke = colour;
    $('tether-head').style.fill = colour;
  }
  const all = $('tether-all');
  while (all.children.length < rest.length) all.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
  for (let k = 0; k < all.children.length; k++) {
    const line = all.children[k];
    line.setAttribute('d', rest[k] || '');
    if (rest[k]) line.style.stroke = sphereColour(system.spheres[every[k]]);
  }
}

stage.onFrame((dt) => {
  if (rebuildWanted) rebuild();
  if (!system) return;
  if (state.playing) advance(dt);
  const O = orientations(system.spheres, system.spheres.map((s) => angleAt(s, T, Td)));
  const sunBody = bodyNamed('sun');
  const sun = apply(O[sunBody.sphere], sunBody.position);
  if (now.view === 'below') {
    const moonBody = bodyNamed('moon');
    below.update({
      heaven: O[0], sun, moon: apply(O[moonBody.sphere], moonBody.position),
      north: clamp((northOf(sun) / (OBLIQUITY / DEG) + 1) / 2, 0, 1),
    });
  } else {
    view.update(O);
    updateFigure();
    if (now.view === 'ground') {
      // Twilight: the sky is dark once the Sun is 12° under the horizon.
      const k = Math.round(clamp((heightOf(sun) + 12) / 12, 0, 1) * 200) / 200;
      if (k !== lastSky) { lastSky = k; stage.setSky(k); view.setDaylight(k); }
    }
  }
  updateTether();
  readout(dt);
});

// ---------- the left panel, exploring ----------

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
    // Begin from the nearest noon; the path so far no longer joins up.
    T = Math.round(T);
    Td = NOON + T;
    owed = 0;
    view.clearTrail();
  }
  renderSpeed();
}

// Where to stand, and which of the panel's sections have anything to act on from there.
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
      setClock(state.clocks[v.id]);       // from the ground the sky turns; elsewhere it is held, unless changed
      view.clearTrail();
      rebuild();
    };
    box.appendChild(b);
  }
  $('view-note').textContent = VIEWS.find((v) => v.id === state.view).note;
  for (const e of document.querySelectorAll('[data-views]')) e.hidden = !e.dataset.views.split(' ').includes(state.view);
}

function renderSystem() {
  const c = state.config;
  const box = $('systems');
  box.textContent = '';
  for (const s of SYSTEMS) {
    const b = el('button');
    b.type = 'button';
    b.append(s.name, el('small', '', String(buildSystem({ ...c, system: s.id }).counts.total)));
    b.setAttribute('aria-pressed', String(c.system === s.id));
    b.onclick = () => { c.system = s.id; rebuild(); };
    box.appendChild(b);
  }
  const current = SYSTEMS.find((s) => s.id === c.system);
  $('system-note').textContent = `${current.note} (${current.lines})`;

  const aristotle = c.system === 'aristotle';
  $('row-unwinding').hidden = !aristotle;
  $('row-linkage').hidden = !aristotle || !c.unwinding;
  $('row-extras').hidden = c.system === 'eudoxus';
  $('row-callippus').hidden = c.system === 'eudoxus';
  $('unwinding').checked = c.unwinding;
  $('linkage').value = c.linkage;
  $('sun-moon-extras').checked = c.sunMoonExtras;
  $('callippus').value = c.callippus;
  $('luminaries').value = c.luminaries;
  $('option-note').textContent = !aristotle ? ''
    : !c.unwinding ? 'Without the unwinding spheres each planet is carried along by all the motions of the planets above it. Follow Jupiter or the Moon to see the effect.'
    : LINKAGE_NOTES[c.linkage];
}

function renderFocus() {
  const box = $('focus');
  box.textContent = '';
  const add = (id, name) => {
    const b = el('button', '', name);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.focus === id));
    b.onclick = () => chooseFocus(id);
    box.appendChild(b);
  };
  add(null, 'None');
  for (const id of ORDER) add(id, BODIES[id].name);
  $('alone').checked = state.alone;
  $('alone').disabled = !state.focus;
  const b = state.focus && BODIES[state.focus];
  $('planet-note').textContent = !b ? 'If you choose a star to follow, its own spheres are drawn in full and its path is traced.'
    : b.zodiacal ? `${b.greek}, the star of ${b.god}. It goes round the zodiac once in ${b.zodiacal.label}.`
    : `${b.greek}. It goes round the zodiac once in ${b.id === 'sun' ? 'a year' : 'a month'}.`;
}

function chooseFocus(id) {
  if (walk.active || state.view === 'below') return;
  state.focus = id;
  if (!id) state.alone = false;
  rebuild();
}

// The tilt belongs to Eudoxus' pair of spheres, so it is offered only for a
// planet whose third and fourth are that pair.
function renderTilt() {
  const b = focusBody();
  const planet = b && PLANETS.find((p) => p.id === b.id);
  const pair = planet && b.figure && b.figure.inner.length === 2;
  $('tilt-section').hidden = !pair;
  if (!pair) return;
  const params = state.config.planets[planet.id];
  const syn = planet.synodic[params.synodicIndex];
  $('tilt').value = params.tiltDeg;
  $('tilt-text').textContent = `${params.tiltDeg}° · ${SOURCES[params.tiltSource].label}`;
  $('synodic-note').textContent = syn.note || '';
  const box = $('tilt-presets');
  box.textContent = '';
  for (const t of syn.tilts) {
    const btn = el('button', '', `${SOURCES[t.source].label} ${t.deg}°`);
    btn.type = 'button';
    btn.title = SOURCES[t.source].detail;
    btn.setAttribute('aria-pressed', String(t.deg === params.tiltDeg && t.source === params.tiltSource));
    btn.onclick = () => { params.tiltDeg = t.deg; params.tiltSource = t.source; rebuildWanted = true; };
    box.appendChild(btn);
  }
  const sel = $('synodic');
  sel.textContent = '';
  planet.synodic.forEach((s, i) => {
    const o = el('option', '', `${s.label} (${SOURCES[s.source].label})`);
    o.value = i;
    sel.appendChild(o);
  });
  sel.value = params.synodicIndex;
  $('synodic-row').hidden = planet.synodic.length < 2;
}

function renderShow() {
  $('show-movers').checked = state.movers;
  $('colour-by').value = state.colourBy;
  $('serve').value = state.serve;
  $('row-serve').hidden = state.view !== 'outside' || state.colourBy !== 'star' || state.config.system !== 'aristotle' || !state.config.unwinding;
}

function renderLegend() {
  const ul = $('legend');
  for (const key of ['aristotle', 'simplicius', 'schiaparelli', 'mendell', 'ideler', 'theon', 'unrecorded', 'display']) {
    const li = el('li');
    li.append(el('b', '', SOURCES[key].label), SOURCES[key].detail);
    ul.appendChild(li);
  }
}

// ---------- the left panel, going through a sequence ----------

const degrees = (x) => `${x.toFixed(1)}°`;
const times = (n) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);

// What a trial measures on the model in front of it, in words.
function measure(step) {
  const m = step.measure;
  if (!m) return step.model || '';
  if (m.kind === 'seasons') {
    const [spring, summer, autumn, winter] = seasons(system).map((d) => d.toFixed(1));
    return `The seasons last ${spring}, ${summer}, ${autumn} and ${winter} days, counting from the spring equinox.`;
  }
  const w = wander(system, m.body, m.days, m.step);
  const say = {
    turns: () => (w.arc < 0.05 ? `It does not turn back at all in ${m.span}.`
      : w.every ? `It turns back once every ${Math.round(w.every)} days and moves backwards through ${degrees(w.arc)} each time.`
      : `It turns back once in ${m.span} and moves backwards through ${degrees(w.arc)}.`),
    stray: () => {
      const side = w.south > 0.05 ? 'north' : w.north < -0.05 ? 'south' : null;
      const far = Math.max(Math.abs(w.north), Math.abs(w.south)), near = Math.min(Math.abs(w.north), Math.abs(w.south));
      if (side) return far - near < 0.1 ? `It stays ${degrees(far)} ${side} of the middle of the zodiac the whole time.` : `It stays between ${degrees(near)} and ${degrees(far)} ${side} of the middle of the zodiac.`;
      return far - near < 0.05 ? `It moves up to ${degrees(far)} to either side of the middle of the zodiac.` : `It moves up to ${degrees(w.north)} north and ${degrees(-w.south)} south of the middle of the zodiac.`;
    },
    crossings: () => (w.crossings === 0 ? `It does not cross the middle of the zodiac at all in ${m.span}.` : `It crosses the middle of the zodiac ${times(w.crossings)} in ${m.span}.`),
    sun: () => `It is never more than ${degrees(elongation(system, m.body, m.days))} from the Sun.`,
  };
  const name = `${m.body === 'moon' ? 'The ' : ''}${BODIES[m.body].name}`;
  return m.show.map((k) => say[k]()).join(' ').replace(/^It\b/, name);
}

function renderWalk() {
  const list = walk.steps, i = walk.index, step = list[i], [a, b] = sectionOf(i, list);
  $('walk-head').textContent = step.title || `Aristotle, ${step.ref}`;
  $('walk-where').textContent = step.title ? step.ref : '';
  $('walk-count').textContent = `${i + 1} of ${list.length}`;
  for (const [id, field] of [['walk-greek', 'el'], ['walk-english', 'en']]) {
    const box = $(id);
    box.textContent = '';
    box.hidden = !step[field];
    if (!step[field]) continue;
    for (let k = a; k <= b; k++) {
      if (!list[k][field]) continue;
      const span = el('span', k === i ? 'here' : '', list[k][field]);
      span.onclick = () => goTo(k);
      box.append(span, ' ');
    }
  }
  $('walk-credit').hidden = !step.el;
  $('walk-say').textContent = step.say;
  $('walk-dispute').textContent = step.dispute || '';

  $('walk-measure').hidden = !step.seen;
  if (step.seen) {
    const key = `${walk.script}/${i}`;
    if (!measured.has(key)) measured.set(key, measure(step));
    $('measure-model').textContent = measured.get(key);
    $('measure-seen').textContent = step.seen;
  }
  $('walk-prev').disabled = i === 0;
  $('walk-next').disabled = i === list.length - 1;
}

// Move to step i of the sequence. If it belongs to a different scene the stage
// is set afresh and time starts again; otherwise only what is picked out changes.
function goTo(i) {
  const list = walk.steps;
  walk.at[walk.script] = clamp(i, 0, list.length - 1);
  const step = walk.step, scene = `${walk.script}/${step.scene}`;
  if (scene !== walk.scene) {
    walk.scene = scene;
    const sc = sceneOf(step);
    state.clock = sc.clock === 'noon' ? 'noon' : sc.daily ? 'daily' : 'held';
    state.speed[state.clock] = sc.speed;
    restart();
    rebuild();
  } else {
    now = settings();           // a step may bring the movers in, or all their lines, without changing the scene
    walkLit = litIndices(system, step.lit);
    hover = null;
    renderRollcall();
    renderWalk();
  }
  // Keep the first sphere the step points at in sight in the list. In a narrow
  // window the list is as long as the page, and the page is left where it is.
  const first = rowOf[walkLit[0]], box = $('rollcall');
  if (first && box.scrollHeight > box.clientHeight) first.scrollIntoView({ block: 'nearest' });
}

// Take up one of the sequences where it was left, or (with null) go back to exploring.
function setScript(name) {
  if (name === walk.script) return;
  if (name) {
    if (!walk.active) walk.saved = { clock: state.clock, speed: { ...state.speed } };
    walk.script = name;
    walk.scene = null;
    stage.resetView();
    goTo(walk.at[name]);
  } else {
    walk.script = null;
    walk.scene = null;
    state.clock = walk.saved.clock;
    state.speed = walk.saved.speed;
    restart();
    rebuild();
  }
}

// ---------- the roll-call ----------

// The marks explained: fewer of them while the astronomy is out of sight.
function renderKeys(full) {
  const item = (cls, mark, text) => { const li = el('li'); li.append(el('span', cls, mark), text); return li; };
  const spheres = $('sphere-key'), movers = $('mover-key');
  spheres.textContent = movers.textContent = '';
  if (full === null) return;
  if (now.rings) {
    spheres.append(item('chip solid', '', full ? 'has a motion of its own' : 'a sphere that carries'), item('chip dashed', '', full ? 'unwinds another' : 'one that unwinds'));
    if (full) spheres.append(item('chip dotted', '', 'adds none'));
  }
  if (!now.movers) return;
  movers.append(item('mover first', '', 'the first mover'), item('mover moves', '', full ? 'a mover' : 'the mover of a sphere'));
  if (full) movers.append(item('mover idle', '', 'with no motion to cause'), item('mover unknown', '?', 'not recorded'));
}

function renderRollcall() {
  const isBelow = now.view === 'below', full = detailed();
  const wrap = $('rollcall-wrap');
  wrap.classList.toggle('below', isBelow);
  wrap.classList.toggle('matrix', !isBelow && !full);
  wrap.classList.toggle('with-movers', !isBelow && now.movers);
  $('rollcall-title').textContent = isBelow ? 'Below the Moon' : full ? 'Roll-call of spheres'
    : !now.rings ? (now.movers ? 'The first heaven and its mover' : 'What is seen')
    : now.movers ? 'Spheres and their movers' : 'The spheres';
  renderKeys(isBelow ? null : full);
  if (isBelow) return renderSimpleBodies();
  if (!full) return renderMatrix();

  const c = now.config, n = system.counts;
  const line = $('count-line');
  line.textContent = '';
  if (!now.rings) line.append('What is seen, before any spheres are supposed');
  else {
    if (n.unwinding) line.append(el('b', '', n.carrying), ' carrying + ', el('b', '', n.unwinding), ' unwinding = ', el('b', '', n.total));
    else line.append(el('b', '', n.total), ' spheres');
    line.append(', and the sphere of the fixed stars');
  }
  $('count-note').textContent = !now.rings || c.system !== 'aristotle' || !c.unwinding ? ''
    : !c.sunMoonExtras && c.linkage === 'text' ? 'Aristotle says forty-seven (1074a13). Removing the four extra spheres and the two unwinding spheres that matched the Sun’s leaves forty-nine.'
    : c.linkage === 'hanson' ? 'Six of these are not in Aristotle.'
    : c.linkage === 'drop' ? 'Six of Aristotle’s spheres are left out.'
    : '';

  // The movers: one for each sphere, the first for the fixed stars.
  const listed = system.spheres.filter((s, i) => now.rings || i === 0);
  const idle = listed.filter((s) => s.mover.state === 'idle').length;
  const unknown = listed.filter((s) => s.mover.state === 'unknown').length;
  $('mover-line').hidden = !now.movers;
  $('mover-line').textContent = !now.rings ? 'So far there is one mover, the first, which causes the first motion.'
    : `There are ${listed.length} movers, the first and one for each sphere.`
      + (idle ? ` ${idle === 1 ? 'One of them has' : `${idle} of them have`} no motion to cause.` : '')
      + (unknown ? ` We are not told what motion ${unknown === 1 ? 'one of them causes' : `${unknown} of them cause`}.` : '');

  const list = $('rollcall');
  const scroll = list.scrollTop;
  list.textContent = '';
  rowOf = [];
  let number = 0, group = null;
  system.spheres.forEach((s, i) => {
    if (!now.rings && i > 0) return;
    if (s.body && (!group || group.dataset.body !== s.body)) {
      const b = BODIES[s.body];
      const mine = system.spheres.filter((x) => x.body === s.body);
      const unw = mine.filter((x) => x.kind === 'unwinding').length;
      group = el('div', `rc-group${now.focus === s.body ? ' focused' : ''}`);
      group.dataset.body = s.body;
      const head = el('button', 'rc-head');
      head.type = 'button';
      const dot = el('span', 'dot');
      dot.style.background = b.colors[state.theme];
      head.append(dot, b.name, el('small', '', unw ? `${mine.length - unw} + ${unw}` : String(mine.length)));
      head.onclick = () => chooseFocus(s.body);
      group.appendChild(head);
      list.appendChild(group);
    }
    const row = el('div', `rc-row${s.body ? '' : ' stars'}`);
    const chip = el('span', `chip ${s.rate === 0 ? 'dotted' : s.kind === 'unwinding' ? 'dashed' : 'solid'}`);
    chip.style.borderTopColor = sphereColour(s);
    const what = el('span', 'what');
    const name = s.kind === 'stars' ? s.title : s.kind === 'unwinding' ? (s.undoes === 'daily' ? 'unwinds the daily turn' : `unwinds ${s.n}`) : String(s.n);
    what.append(el('b', '', name), s.kind === 'unwinding' ? '' : ` ${s.what}`);
    if (s.period && s.rate !== 0) what.append(el('small', '', s.period));
    what.title = `${s.title}: ${s.what}`;
    const carried = el('span', 'carried', `×${s.motions}`);
    carried.title = s.motions === 1 ? 'moves with one motion' : s.motions === 0 ? 'at rest' : `moves with ${s.motions} motions`;
    const turn = el('input');
    turn.type = 'checkbox';
    turn.checked = !state.held.has(s.key);
    turn.title = 'turning';
    turn.setAttribute('aria-label', `${s.title} turning`);
    turn.style.visibility = s.rate === 0 ? 'hidden' : '';
    turn.onclick = (e) => e.stopPropagation();
    turn.onchange = () => { if (turn.checked) state.held.delete(s.key); else state.held.add(s.key); };
    const mover = el('span', `mover ${i === 0 ? 'first' : s.mover.state}`, s.mover.state === 'unknown' ? '?' : '');
    mover.title = moverWords(s, i);
    row.append(el('span', 'num', s.body ? String(++number) : ''), chip, what, carried, turn, mover);
    row.onmouseenter = () => { hover = i; showLit(); };
    row.onmouseleave = () => { hover = null; showLit(); };
    row.onclick = () => { if (s.body && s.body !== now.focus) chooseFocus(s.body); };
    (s.body ? group : list).appendChild(row);
    rowOf[i] = row;
  });
  list.scrollTop = scroll;
  showLit();
}

// The short form of the roll-call, for when the astronomy is out of sight: a
// row for each star, a mark for each sphere that serves it, and under each
// mark its mover. The whole heaven fits in one view, and nothing scrolls.
function renderMatrix() {
  const n = system.counts;
  const line = $('count-line');
  line.textContent = '';
  if (!now.rings) line.append(now.movers ? 'Only the outermost sphere, which carries the fixed stars, has been introduced so far.' : 'The fixed stars and the seven stars that wander among them. No spheres have been introduced yet.');
  else if (n.unwinding) line.append(el('b', '', n.total), ' spheres below the fixed stars. ', el('b', '', n.carrying), ' of them carry the seven wandering stars and ', el('b', '', n.unwinding), ' cancel those motions.');
  else line.append(el('b', '', n.total), ' spheres, and the sphere of the fixed stars');
  $('count-note').textContent = '';
  const count = now.rings ? system.spheres.length : 1;
  $('mover-line').hidden = !now.movers;
  $('mover-line').textContent = count === 1 ? 'So far there is one mover, the first, which causes the first motion.' : `There are ${count} movers, the first and one for each sphere, in the same order as the spheres.`;

  const list = $('rollcall');
  list.textContent = '';
  rowOf = [];
  let group = null, before = null;
  system.spheres.forEach((s, i) => {
    if (!now.rings && (i > 0 || !now.movers)) return;      // nothing to list while only the sky is being looked at
    const id = s.body || 'stars';
    if (!group || group.dataset.body !== id) {
      group = el('div', `mx-row${s.body && now.focus === s.body ? ' focused' : ''}`);
      group.dataset.body = id;
      const name = el(s.body ? 'button' : 'span', 'mx-name');
      if (s.body) {
        const dot = el('span', 'dot');
        dot.style.background = BODIES[s.body].colors[state.theme];
        name.type = 'button';
        name.append(dot, BODIES[s.body].name);
        name.title = walk.active ? '' : `Follow ${BODIES[s.body].name}`;
        name.onclick = () => chooseFocus(s.body);
      } else name.textContent = 'Fixed stars';
      group.append(name, el('div', 'mx-pairs'));
      list.appendChild(group);
      before = null;
    }
    const pairs = group.lastChild;
    if (s.kind === 'unwinding' && before === 'carrying') pairs.appendChild(el('span', 'mx-gap'));
    before = s.kind;
    const pair = el('span', 'mx-pair');
    const chip = el('span', `chip ${s.kind === 'unwinding' ? 'dashed' : 'solid'}`);
    chip.style.borderTopColor = sphereColour(s);
    pair.append(chip, el('span', `mover ${i === 0 ? 'first' : 'moves'}`));
    pair.tabIndex = 0;
    pair.setAttribute('role', 'img');
    pair.setAttribute('aria-label', now.movers ? `${s.title}, and its mover` : s.title);
    pair.onmouseenter = pair.onfocus = () => { hover = i; showLit(); };
    pair.onmouseleave = pair.onblur = () => { if (hover === i) { hover = null; showLit(); } };
    pair.onclick = () => { if (s.body && s.body !== now.focus) chooseFocus(s.body); };
    pairs.appendChild(pair);
    rowOf[i] = pair;
  });
  showLit();
}

// Below the Moon there are no spheres to call over: only the four simple bodies.
function renderSimpleBodies() {
  $('count-line').textContent = 'The four simple bodies. There are no spheres in this region.';
  $('count-note').textContent = '';
  $('mover-line').hidden = true;
  rowOf = [];
  const detail = $('sphere-detail');
  detail.textContent = '';
  detail.append(
    el('p', '', 'Each of the four simple bodies has a natural place and moves towards it in a straight line. They also change into one another, and Aristotle holds that this change continues for ever because the Sun keeps approaching and withdrawing along its slanted circle.'),
    el('p', 'mover-words', 'The places and motions are described in De Caelo IV 3–5, the four qualities in On Generation and Corruption II 3, and the role of the Sun in II 10. The thickness of the layers in the picture is arbitrary.'),
  );
  const list = $('rollcall');
  list.textContent = '';
  const colours = THEMES[state.theme].elements;
  for (const b of SIMPLE_BODIES) {
    const row = el('div', 'rc-simple');
    const dotEl = el('span', 'dot');
    dotEl.style.background = colours[b.id];
    const words = el('span', 'what');
    words.append(el('b', '', b.name), el('small', '', b.qualities), el('span', 'place', b.place));
    row.append(dotEl, words);
    list.appendChild(row);
  }
}

// The same in a line, for the box under the list.
function moverLine(s, i) {
  if (i === 0) return 'Its mover is the first mover, which is unmoved both in itself and incidentally (1073a23–25) and causes motion as something loved (Λ 7, 1072b3).';
  const nth = `Its mover is the ${ordinal(s.mover.ordinal)} in order`;
  if (s.mover.state === 'idle') return `${nth}. On this reading it has no motion to cause.`;
  if (s.mover.state === 'unknown') return `${nth}. We are not told what motion it causes.`;
  return `${nth} (1073b1–3).`;
}

function moverWords(s, i) {
  const nth = `the ${ordinal(s.mover.ordinal)} in order`;
  if (i === 0) return 'Its mover is the first mover, which is unmoved both in itself and incidentally (1073a23–25) and causes motion as something loved (Λ 7, 1072b3).';
  if (s.mover.state === 'idle') return `Like every other sphere it has a mover, which is ${nth}. On this reading that mover has no motion to cause.`;
  if (s.mover.state === 'unknown') return `Its mover is ${nth}. We are not told what motion it causes.`;
  return `Its mover is ${nth} (1073b1–3). It is eternal, unmoved in itself and without magnitude (1073a36–b1), so it cannot be shown in the picture. Scholars disagree about whether the lower movers are carried round with their spheres.`;
}

// Pick out on stage and in the list whatever is pointed at, or failing that
// whatever the current step names; and describe it.
function showLit() {
  const picked = lit();
  look();
  if (now.view === 'below') return;
  rowOf.forEach((row, i) => { if (row) row.classList.toggle('lit', picked.includes(i)); });
  showDetail(picked.length === 1 ? system.spheres[picked[0]] : null, picked[0]);
}

function showDetail(s, i) {
  const box = $('sphere-detail');
  box.textContent = '';
  if (!s) {
    box.appendChild(el('p', 'hint', !detailed()
      ? (!now.rings ? (now.view === 'ground' ? 'This step shows only the sky as it looks from the ground.' : 'Point at the mark to highlight the outermost sphere.')
        : now.view === 'ground' ? 'The spheres are not drawn in the view from the ground, but they are still what moves the sky. Point at a mark to read what that sphere does.'
        : `Each mark stands for a sphere${now.movers ? ', and the point below it is that sphere’s mover' : ''}. Point at a mark to highlight the sphere in the picture and read what it does.`)
      : now.view === 'ground'
        ? 'The spheres are not drawn in the view from the ground, but they are still moving the sky. If you untick the box beside a sphere it stops turning, and you can see how the sky moves without it.'
        : 'Point at a sphere to highlight it and to read what it does and where that information comes from. If you untick its box the sphere stops turning, and you can see what the others do without it.'));
    if (now.movers) box.appendChild(el('p', 'mover-words', 'Every sphere has its own mover, which is eternal, unmoved in itself and without magnitude (1073a36–b1). Because it has no magnitude it cannot be shown in the picture. Scholars disagree about whether the lower movers are carried round with their spheres.'));
    return;
  }
  box.appendChild(el('p', '', `${s.title}. ${s.text}`));
  const ul = el('ul', 'sources');
  for (const [what, key] of s.sources) {
    const li = el('li');
    const b = el('b', '', SOURCES[key].label);
    b.title = SOURCES[key].detail;
    li.append(el('span', '', what), b);
    ul.appendChild(li);
  }
  box.appendChild(ul);
  if (now.movers) box.appendChild(el('p', 'mover-words', moverLine(s, i)));
  box.scrollTop = 0;
}

// ---------- the readout ----------

let readoutLabels = '';
function setReadout(title, rows) {
  $('readout-section').hidden = !rows;
  if (!rows) return;
  $('readout-title').textContent = title;
  const box = $('readout'), labels = rows.map((r) => r[0]).join('|');
  if (labels !== readoutLabels) {
    readoutLabels = labels;
    box.textContent = '';
    for (const [name] of rows) box.append(el('dt', '', name), el('dd'));
  }
  rows.forEach(([, value], k) => { box.children[2 * k + 1].textContent = value; });
}

const hoursWords = (h) => {
  const minutes = Math.round(h * 60);
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
};
const heightWords = (deg) => (Math.abs(deg) < 0.05 ? 'on the horizon' : `${Math.abs(deg).toFixed(1)}° ${deg > 0 ? 'above' : 'below'} the horizon`);
const northWords = (deg) => (Math.abs(deg) < 0.05 ? 'over the equator' : `${Math.abs(deg).toFixed(1)}° ${deg > 0 ? 'north' : 'south'} of the equator`);

// Where the followed body is among the stars.
function placeRows(b) {
  const here = lonLat(direction(b), system.basis);
  const lonDeg = here.lon / DEG, latDeg = here.lat / DEG;
  // Which way is it going? Look a moment ahead.
  const h = 0.05;
  const there = lonLat(direction(b, T + h, Td), system.basis);
  const rate = angleDiff(there.lon, here.lon) / h;
  const second = system.spheres.find((s) => s.key === `${b.id}:2`);
  const slow = 0.05 * Math.abs(second ? second.rate : TAU / YEAR);
  const rows = [
    ['Along the zodiac', `${lonDeg.toFixed(1)}° · in ${SIGNS[Math.floor(lonDeg / 30) % 12]}`],
    ['From the middle of the zodiac', Math.abs(latDeg) < 0.005 ? 'on it' : `${Math.abs(latDeg).toFixed(2)}° ${latDeg > 0 ? 'north' : 'south'}`],
    ['Motion', !state.playing ? 'paused' : Math.abs(rate) < slow ? 'standing still' : rate > 0 ? 'forward, west to east' : 'retrograde, east to west'],
  ];
  if (b.followsSun) {
    const sun = lonLat(direction(bodyNamed('sun')), system.basis);
    const e = angleDiff(here.lon, sun.lon) / DEG;
    rows.push(['From the Sun', Math.abs(e) < 0.05 ? 'with it' : `${Math.abs(e).toFixed(1)}° ${e > 0 ? 'east (evening)' : 'west (morning)'}`]);
  }
  return rows;
}

// The Sun over Athens: how far north it is and what that does to the day.
function sunRows() {
  const sunBody = bodyNamed('sun');
  const north = northOf(seen(sunBody)), later = northOf(seen(sunBody, T + 0.5, Td));
  const day = daylight(LATITUDE, north);
  return [
    ['Position of the Sun', northWords(north)],
    ['Direction', Math.abs(later - north) < 0.02 ? 'turning back' : later > north ? 'moving north' : 'moving south'],
    ['Height at noon in Athens', `${day.noon.toFixed(0)}°`],
    ['Length of day in Athens', hoursWords(day.hours)],
  ];
}

function readout(dt) {
  sinceReadout += dt;
  if (sinceReadout < 0.12) return;
  sinceReadout = 0;

  const years = Math.floor(T / YEAR), whole = Math.floor(T - years * YEAR);
  $('elapsed').textContent = years ? `${years} y ${whole} d` : `${whole} d`;

  const b = focusBody(), name = b && `${b.id === 'sun' || b.id === 'moon' ? 'the ' : ''}${b.name}`;
  if (now.view === 'below') return setReadout('The Sun and the lands of the north', sunRows());
  if (now.view === 'ground') {
    const height = heightOf(seen(bodyNamed('sun')));
    const rows = [
      ['Height of the Sun', heightWords(height)],
      ['Time of day', height > 0 ? 'day' : height > -12 ? 'twilight' : 'night'],
      ...sunRows().slice(2),
    ];
    if (b && b.id !== 'sun') rows.unshift([`Height of ${name}`, heightWords(heightOf(seen(b)))]);
    return setReadout('The sky over Athens', rows);
  }
  // Where a planet is along the zodiac, and which way it is going, belongs to the astronomy.
  const place = b && detailed();
  setReadout(place ? `Where ${name} is` : '', place ? placeRows(b) : null);
}

// ---------- wiring ----------

function setPlaying(on) {
  state.playing = on;
  $('play').textContent = on ? 'Pause' : 'Play';
}

for (const id of ['argument', 'below', 'chapter']) $(`mode-${id}`).onclick = () => setScript(id);
$('mode-look').onclick = () => {
  state.astronomy = false;
  if (walk.active) setScript(null); else rebuild();
};
// One button for the astronomy: it opens the switches and the full roll-call, and closes them again.
$('mode-astronomy').onclick = () => {
  state.astronomy = walk.active ? true : !state.astronomy;
  if (walk.active) setScript(null); else rebuild();
};
$('run-trials').onclick = () => setScript('trials');
$('restore').onclick = () => { state.config = defaultConfig(); rebuild(); };
$('walk-prev').onclick = () => goTo(walk.index - 1);
$('walk-next').onclick = () => goTo(walk.index + 1);

$('play').onclick = () => setPlaying(!state.playing);
$('reset').onclick = () => { restart(); renderRollcall(); };
$('speed').oninput = (e) => {
  const [lo, hi] = SPEED_RANGE[state.clock];
  state.speed[state.clock] = lo * Math.pow(hi / lo, e.target.value / 1000);
  renderSpeed();
};
$('clock').onchange = (e) => setClock(e.target.value);

$('unwinding').onchange = (e) => { state.config.unwinding = e.target.checked; rebuild(); };
$('sun-moon-extras').onchange = (e) => { state.config.sunMoonExtras = e.target.checked; rebuild(); };
for (const id of ['linkage', 'callippus', 'luminaries']) {
  $(id).onchange = (e) => { state.config[id] = e.target.value; rebuild(); };
}
$('alone').onchange = (e) => { state.alone = e.target.checked; rebuild(); };

$('tilt').oninput = (e) => {
  const planet = PLANETS.find((p) => p.id === state.focus);
  if (!planet) return;
  const params = state.config.planets[planet.id];
  params.tiltDeg = Number(e.target.value);
  const match = planet.synodic[params.synodicIndex].tilts.find((t) => t.deg === params.tiltDeg);
  params.tiltSource = match ? match.source : 'custom';
  rebuildWanted = true;
};
$('synodic').onchange = (e) => {
  const planet = PLANETS.find((p) => p.id === state.focus);
  const params = state.config.planets[planet.id];
  params.synodicIndex = Number(e.target.value);
  const first = planet.synodic[params.synodicIndex].tilts[0];
  params.tiltDeg = first.deg;
  params.tiltSource = first.source;
  rebuild();
};

for (const key of Object.keys(state.show)) {
  const box = $(`show-${key}`);
  box.checked = state.show[key];
  box.onchange = () => { state.show[key] = box.checked; look(); };
}
$('show-movers').onchange = (e) => { state.movers = e.target.checked; rebuild(); };
$('colour-by').onchange = (e) => { state.colourBy = e.target.value; rebuild(); };
$('serve').onchange = (e) => { state.serve = e.target.value; rebuild(); };
$('clear-trail').onclick = () => view.clearTrail();
$('reset-view').onclick = () => stage.resetView();
$('theme').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); };
$('upright').onchange = (e) => { state.upright = e.target.value; applyUpright(true); };

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
  state, stage, view, below, walk,
  get system() { return system; },
  get now() { return now; },
  get time() { return { T, Td }; },
  rebuild, goTo, setScript, setClock, measure, advance,
};
