// The whole heaven of Metaphysics Lambda 8 as one ordered list of spheres,
// outermost first, for any of the three systems Aristotle goes through
// (Eudoxus, Callippus, his own) and for the rival accounts of how his own
// joins the sets together. Pure data and geometry.
//
// Sources and the reasons for each choice are in reference/notes/lambda-8-model.md.

import { TAU, DEG, add, scale, cross, eclipticBasis } from '../../core/kinematics.js';
import { PLANETS, YEAR, SIDEREAL_DAY, OBLIQUITY, eudoxanPlanet, describeSpheres } from './eudoxus.js';

// From the fixed stars inwards. Aristotle fixes Saturn and Jupiter at the top
// and the Moon at the bottom (1074a6-12); the order of the rest follows
// Timaeus 38d.
export const ORDER = ['saturn', 'jupiter', 'mars', 'mercury', 'venus', 'sun', 'moon'];

export const DAILY = -TAU / SIDEREAL_DAY;            // east to west, once a sidereal day
export const isDaily = (s) => Math.abs(Math.abs(s.rate) - Math.abs(DAILY)) < 1e-9;

const LUNATION = 29.530589;
const SIDEREAL_MONTH = 27.321662;
const DRACONITIC_MONTH = 27.212221;
const ANOMALISTIC_MONTH = 27.55455;
const NODE_CIRCUIT = 223 * LUNATION;                 // Schiaparelli's figure for the Moon's nodes
const SUN_NODE_YEARS = 2922;                         // from Theon's 365 1/8 days for the Sun's return in latitude

export const LUMINARIES = [
  {
    id: 'sun', name: 'Sun', god: 'Helios', greek: 'ὁ ἥλιος',
    colors: { dark: '#ffd35a', light: '#b07d00' }, size: 1.5, followsSun: false,
    slantDeg: 0.5, slantSource: 'theon', start: 270,
    // Schiaparelli's guess at Callippus' two extra spheres: a small hippopede run through once a year.
    anomalyDeg: 2, anomalyDays: YEAR, slowestAt: 67,
  },
  {
    id: 'moon', name: 'Moon', god: 'Selene', greek: 'ἡ σελήνη',
    colors: { dark: '#a8c0ee', light: '#3f5f9e' }, size: 0.9, followsSun: false,
    slantDeg: 5, slantSource: 'modern', start: 40,
    anomalyDeg: 6, anomalyDays: ANOMALISTIC_MONTH, slowestAt: 0,
  },
];

export const BODIES = Object.fromEntries([...PLANETS, ...LUMINARIES].map((b) => [b.id, b]));

export function defaultConfig() {
  const planets = {};
  for (const p of PLANETS) {
    const t = p.synodic[0].tilts[0];
    planets[p.id] = { synodicIndex: 0, tiltDeg: t.deg, tiltSource: t.source };
  }
  return {
    system: 'aristotle',          // 'eudoxus' | 'callippus' | 'aristotle'
    linkage: 'text',              // how Aristotle's sets join: 'text' | 'hanson' | 'drop' | 'beere'
    unwinding: true,              // Aristotle's unwinding spheres in place
    sunMoonExtras: true,          // Callippus' two extra spheres each for Sun and Moon (1074a12-14)
    callippus: 'unknown',         // what Callippus' extra spheres did: 'unknown' | 'schiaparelli'
    luminaries: 'reported',       // Sun's and Moon's second and third spheres: 'reported' | 'exchanged'
    planets,
  };
}

const dirOnZodiac = (E, lon) => add(scale(E.x, Math.cos(lon)), scale(E.y, Math.sin(lon)));
const years = (n) => (n === 1 ? '1 year' : `${n} years`);

// ---------- the carrying spheres of each body, outermost first ----------
// Each returns { spheres, position, figure } where position is the body's
// place on the last sphere and figure says which spheres trace the closed
// curve it runs round (null if there is none worth drawing).

function planetSet(planet, cfg, E, callippan) {
  const params = cfg.planets[planet.id];
  const extra = callippan && ['mars', 'venus', 'mercury'].includes(planet.id);
  if (extra && cfg.callippus === 'schiaparelli' && planet.id !== 'mercury') return schiaparelliTrio(planet, E);

  const syn = planet.synodic[params.synodicIndex];
  const m = eudoxanPlanet({
    zodiacal: planet.zodiacal.days, synodic: syn.days, tilt: params.tiltDeg * DEG, poleLongitude: planet.poleLongitude * DEG,
  });
  const words = describeSpheres(planet, params);
  const spheres = m.spheres.map((s, i) => ({
    n: s.id, role: s.role, axis: s.axis, rate: s.rate,
    what: words[i].short, period: words[i].period, text: words[i].text, sources: words[i].sources,
  }));
  if (extra) spheres.push(unknownExtra(5, spheres[3].axis));
  return { spheres, position: m.planet, figure: { inner: [3, 4], days: syn.days, centre: m.planet } };
}

// Schiaparelli's suggestion for what Callippus did with Mars and Venus: three
// spheres in place of Eudoxus' last two, the middle one turning twice as fast
// the other way (Heath, Aristarchus of Samos, pp. 213-15).
function schiaparelliTrio(planet, E) {
  const synodic = planet.id === 'mars' ? 780 : planet.synodic[0].days;
  const incl = 45 * DEG;
  const A = dirOnZodiac(E, planet.poleLongitude * DEG);
  const P1 = cross(E.pole, A);                                   // the middle of the figure
  const P2 = add(scale(P1, Math.cos(incl)), scale(A, Math.sin(incl)));
  const M = cross(E.pole, P2);
  const w = TAU / synodic;
  const src = [['Arrangement, speeds and the 45°', 'schiaparelli']];
  const period = planet.id === 'mars' ? '780 days' : planet.synodic[0].label;
  return {
    spheres: [
      { n: 1, role: 'daily', axis: [0, 0, 1], rate: DAILY, what: 'as the fixed stars', period: 'a day', text: '', sources: [['Motion', 'aristotle']] },
      { n: 2, role: 'zodiacal', axis: E.pole, rate: TAU / planet.zodiacal.days, what: 'along the zodiac', period: planet.zodiacal.label,
        text: `It turns along the circle through the middle of the zodiac, from west to east, once in ${planet.zodiacal.label}.`,
        sources: [['Axis', 'aristotle'], ['Period', planet.zodiacal.source]] },
      { n: 3, role: 'synodic', axis: A, rate: w, what: 'poles on the zodiac', period,
        text: `Its poles lie on the circle through the middle of the zodiac. It turns once in ${period}.`, sources: src },
      { n: 4, role: 'counter', axis: P1, rate: -2 * w, what: 'pole on the third’s equator, turning twice as fast the other way', period: `half of ${period}`,
        text: 'Its pole lies on the equator of the third sphere, and it turns twice as fast as the third in the opposite direction.', sources: src },
      { n: 5, role: 'extra', axis: P2, rate: w, what: 'tilted 45° to the fourth, and carries the planet', period,
        text: 'It is tilted 45° to the fourth sphere and turns at the same rate as the third. The planet is carried on its equator.', sources: src },
    ],
    position: M,
    figure: { inner: [3, 4, 5], days: synodic, centre: P1 },
  };
}

function unknownExtra(n, axis) {
  return {
    n, role: 'extra', axis, rate: 0, unknown: true,
    what: 'added by Callippus (its motion is not recorded)', period: '',
    text: 'This is one of the spheres that Callippus added. Aristotle tells us only how many there were, so no motion is shown for it here.',
    sources: [['That there was one', 'aristotle'], ['What it did', 'unrecorded']],
  };
}

// Sun and Moon: a third sphere slanted across the breadth of the zodiac.
// As Simplicius reports them the second sphere carries the body round the
// zodiac and the third is slow; many modern accounts exchange the two.
function luminarySet(body, cfg, E, callippan) {
  const sun = body.id === 'sun';
  const slant = body.slantDeg * DEG;
  // The slanted circle crosses the zodiac's middle at `node`; the body starts
  // at the crossing (Sun) or a quarter-circle past it, at its greatest latitude (Moon).
  const start = body.start * DEG;
  const node = dirOnZodiac(E, sun ? start : start - TAU / 4);
  const side = cross(E.pole, node);
  const axis3 = add(scale(E.pole, Math.cos(slant)), scale(side, -Math.sin(slant)));
  const position = sun ? node : cross(axis3, node);

  const round = TAU / (sun ? YEAR : SIDEREAL_MONTH);                       // once round the zodiac, west to east
  const slow = (sun ? 1 : -1) * TAU / (sun ? SUN_NODE_YEARS * YEAR : NODE_CIRCUIT);  // Sun's in the order of the signs, Moon's against it
  const roundLabel = sun ? 'a year' : 'a month';
  const slowLabel = sun ? `${SUN_NODE_YEARS} years` : '223 months';
  const slowWay = sun ? 'in the order of the signs' : 'against the order of the signs';
  const reported = cfg.luminaries === 'reported';
  const slantWords = sun ? 'by about half a degree' : 'by about 5°, the Moon’s greatest latitude';
  const slantSources = [['Slanted across the zodiac', 'aristotle'], ['Size of the slant', body.slantSource]];

  const spheres = [
    { n: 1, role: 'daily', axis: [0, 0, 1], rate: DAILY, what: 'as the fixed stars', period: 'a day', text: '', sources: [['Motion', 'aristotle']] },
    reported
      ? { n: 2, role: 'zodiacal', axis: E.pole, rate: round - slow, what: 'along the zodiac', period: roundLabel,
          text: `It turns along the circle through the middle of the zodiac, from west to east, once in ${roundLabel}.`,
          sources: [['Axis', 'aristotle'], ['Period', 'simplicius']] }
      : { n: 2, role: 'zodiacal', axis: E.pole, rate: slow, what: `along the zodiac, slowly, ${slowWay}`, period: slowLabel,
          text: `It turns slowly along the circle through the middle of the zodiac, ${slowWay}, once in ${slowLabel}.`,
          sources: [['Axis', 'aristotle'], ['That this is the slow one', 'ideler'], ['Period', sun ? 'theon' : 'schiaparelli']] },
    reported
      ? { n: 3, role: 'synodic', axis: axis3, rate: slow, what: `slanted across the zodiac, turning slowly ${slowWay}`, period: slowLabel,
          text: `It is slanted to the second sphere ${slantWords}. It turns slowly, ${slowWay}, once in ${slowLabel}. The ${body.name} is carried on its equator.`,
          sources: [...slantSources, ['Slow, and which way', 'simplicius'], ['Period', sun ? 'theon' : 'schiaparelli']] }
      : { n: 3, role: 'synodic', axis: axis3, rate: round - slow, what: 'slanted across the zodiac', period: roundLabel,
          text: `It is slanted to the second sphere ${slantWords} and carries the ${body.name} round once in ${roundLabel}.`,
          sources: [...slantSources, ['That this is the fast one', 'ideler']] },
  ];

  if (callippan && cfg.sunMoonExtras) {
    if (cfg.callippus === 'schiaparelli') {
      // A small hippopede lying along the body's own circle, run through once
      // in the period of its inequality; its length is twice the greatest inequality.
      const tilt = body.anomalyDeg * DEG, w = TAU / body.anomalyDays;
      const pole4 = cross(position, axis3);
      const pole5 = add(scale(pole4, Math.cos(tilt)), scale(axis3, Math.sin(tilt)));
      const phase = (body.start - body.slowestAt) * DEG;
      const src = [['Arrangement and size', 'schiaparelli']];
      const days = sun ? 'a year' : 'a month';
      spheres.push(
        { n: 4, role: 'extra', axis: pole4, rate: w, phase, what: `poles on the ${body.name}’s circle`, period: days,
          text: `Its poles lie on the circle along which the ${body.name} moves, and it turns once in ${days}.`, sources: src },
        { n: 5, role: 'extra', axis: pole5, rate: -w, phase: -phase, what: `tilted ${body.anomalyDeg}° to the fourth, turning the other way, and carries the ${body.name}`, period: days,
          text: `It is tilted ${body.anomalyDeg}° to the fourth sphere and turns in the opposite direction in the same time. The effect is that the ${body.name} sometimes moves faster and sometimes slower.`, sources: src },
      );
    } else {
      spheres.push(unknownExtra(4, axis3), unknownExtra(5, axis3));
    }
  }
  return { spheres, position, figure: null };
}

// ---------- the list ----------

const FIRST = {
  separate: {
    what: 'as the fixed stars', period: 'a day',
    text: 'It moves in the same way as the sphere of the fixed stars, once a day from east to west. In this system each planet has its own set of spheres, and each set begins with a sphere like this one.',
    sources: [['Motion', 'aristotle']],
  },
  text: {
    what: 'carried round by the sphere above, and adds no motion', period: '',
    text: 'This sphere is supposed to move as the fixed stars do. But the sphere above it already moves in that way and carries this one round with it, so this sphere has no motion of its own to add and its mover has nothing to move. That is what follows from the text as we have it.',
    sources: [['That it is there', 'aristotle']],
  },
  hanson: {
    what: 'once a day', period: 'a day',
    text: 'On Hanson’s reading the sphere above this one has been brought to rest, so this sphere turns once a day by its own motion.',
    sources: [['That it is there', 'aristotle'], ['A sphere at rest above it', 'hanson']],
  },
  beere: {
    what: 'turns once a day by its own motion', period: 'a day',
    text: 'The poles of this sphere lie on the axis about which the sphere above it turns. On Beere’s reading that sphere therefore passes no motion on to this one, which has to turn once a day by its own motion.',
    sources: [['That it is there', 'aristotle'], ['Only the poles are carried', 'beere']],
  },
  loose: {
    what: 'carried round by the sphere above', period: '',
    text: 'Because there are no unwinding spheres above it, this sphere is carried along by all the motions of the planet above.',
    sources: [['That it is there', 'aristotle']],
  },
};

export function buildSystem(cfg) {
  const E = eclipticBasis(OBLIQUITY);
  const joined = cfg.system === 'aristotle';
  const callippan = cfg.system !== 'eudoxus';
  const unwinding = joined && cfg.unwinding;
  const spheres = [{
    key: 'stars', body: null, kind: 'stars', n: 0, role: 'daily', axis: [0, 0, 1], rate: DAILY, phase: 0, receives: false,
    title: 'The fixed stars', what: 'once a day, east to west', period: 'a day',
    text: 'This is the outermost sphere, in which the fixed stars are set. It turns once a day from east to west about the axis of the heaven.',
    sources: [['Motion', 'aristotle']],
  }];
  const bodies = [];

  for (const id of ORDER) {
    const body = BODIES[id];
    const set = PLANETS.includes(body) ? planetSet(body, cfg, E, callippan) : luminarySet(body, cfg, E, callippan);

    // What the first sphere of the set does depends on how the sets are joined.
    const first = set.spheres[0];
    let mode = 'separate', dropFirst = false;
    if (joined) {
      mode = !unwinding ? 'loose' : cfg.linkage;
      if (mode === 'drop') { mode = 'text'; dropFirst = id !== 'saturn'; }
      if (mode === 'hanson' && id === 'saturn') mode = 'text';
    }
    Object.assign(first, FIRST[mode]);
    first.rate = mode === 'text' || mode === 'loose' ? 0 : DAILY;
    first.receives = !(mode === 'separate' || mode === 'beere');

    const carrying = dropFirst ? set.spheres.slice(1) : set.spheres;
    for (const s of carrying) {
      spheres.push({ phase: 0, receives: true, ...s, key: `${id}:${s.n}`, body: id, kind: 'carrying', title: `${body.name} ${s.n}` });
    }
    const index = (n) => spheres.findIndex((s) => s.key === `${id}:${n}`);
    bodies.push({
      ...body,
      sphere: spheres.length - 1,
      position: set.position,
      figure: set.figure && { carrier: index(2), inner: set.figure.inner.map(index), days: set.figure.days, centre: set.figure.centre },
    });

    if (unwinding && id !== 'moon') {
      for (const s of set.spheres.slice(1).reverse()) {
        spheres.push({
          key: `${id}:u${s.n}`, body: id, kind: 'unwinding', n: s.n, undoes: `${id}:${s.n}`, role: s.role,
          axis: s.axis, rate: -s.rate || 0, phase: -(s.phase || 0) || 0, receives: true, unknown: s.unknown,
          title: `Unwinds ${body.name} ${s.n}`, what: s.unknown ? 'would undo the sphere Callippus added' : `turns as ${body.name} ${s.n} does, the other way`, period: s.period,
          text: `It turns about the same poles as ${body.name} ${s.n} and at the same speed, but in the opposite direction. As a result everything below it moves as if ${body.name} ${s.n} were not there.`,
          sources: [['That it is there, and how many', 'aristotle'], ['That it mirrors the sphere it undoes', 'simplicius']],
        });
      }
      if (cfg.linkage === 'hanson') {
        spheres.push({
          key: `${id}:u1`, body: id, kind: 'unwinding', n: 1, undoes: 'daily', role: 'daily',
          axis: [0, 0, 1], rate: -DAILY, phase: 0, receives: true,
          title: 'Unwinds the daily rotation', what: 'turns once a day the other way, and so stands still', period: 'a day',
          text: 'This sphere is not in Aristotle. It cancels the daily rotation as well, so that it stands still and the first sphere of the next planet can turn once a day by its own motion.',
          sources: [['The whole sphere', 'hanson']],
        });
      }
    }
  }

  // How many motions each sphere moves with: every sphere with a motion of its
  // own adds one, every unwinding sphere takes one away.
  let motions = 0;
  for (const s of spheres) {
    if (s.receives === false) motions = 0;
    if (s.rate !== 0) motions += s.kind === 'unwinding' ? -1 : 1;
    s.motions = motions;
  }

  // An unmoved mover for every sphere (1073a26-b1, 1074a14-17), ranked as the
  // motions are, the mover of the fixed stars first (1073b1-3). A sphere with
  // no motion of its own leaves its mover nothing to cause; for the spheres
  // Callippus added, what their movers cause is not recorded.
  spheres.forEach((s, i) => {
    s.mover = { ordinal: i + 1, state: s.unknown ? 'unknown' : s.rate === 0 ? 'idle' : 'moves' };
  });

  const count = (kind) => spheres.filter((s) => s.kind === kind).length;
  const counts = { carrying: count('carrying'), unwinding: count('unwinding') };
  counts.total = counts.carrying + counts.unwinding;
  return { basis: E, spheres, bodies, counts, config: cfg };
}

// The star a sphere's motion is for (1074a24-31). A carrying sphere serves the
  // planet it helps to carry. Aristotle counts each unwinding sphere with the
  // planet above it; one may also say it serves the planets below, whose
  // starting-point it restores.
export function starServed(s, unwindersServe = 'above') {
  if (s.kind === 'stars') return 'stars';
  if (s.kind === 'unwinding' && unwindersServe === 'below') return ORDER[ORDER.indexOf(s.body) + 1];
  return s.body;
}

// Each sphere's angle at model time T (days). Spheres moving with the daily
// rotation run on their own clock Td, so that it can be stopped by itself;
// `lags` holds, per sphere key, the time a sphere has spent held still.
export function anglesOf(system, T, Td, lags) {
  return system.spheres.map((s) => (s.phase || 0) + s.rate * ((isDaily(s) ? Td : T) - (lags.get(s.key) || 0)));
}
