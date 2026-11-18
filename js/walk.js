// The guided sequences: what is on stage at each step. There are four, each
// a list of steps kept with its text:
//   argument  from eternal motion to the unmoved movers, across Lambda 6, 7, 8
//             and 10: the short way through (argument-text.js)
//   chapter   Metaphysics Lambda 8, clause by clause (lambda8-text.js)
//   below     below the Moon, and the sky from Athens (below-text.js)
//   trials    the model set against what was observed (trials.js)

import { ARGUMENT } from './cosmologies/aristotle/argument-text.js';
import { STEPS } from './cosmologies/aristotle/lambda8-text.js';
import { BELOW } from './cosmologies/aristotle/below-text.js';
import { TRIALS } from './cosmologies/aristotle/trials.js';

export { STEPS };

export const SCRIPTS = {
  argument: { name: 'The argument', steps: ARGUMENT },
  chapter: { name: 'Λ 8 line by line', steps: STEPS },
  below: { name: 'Below the Moon', steps: BELOW },
  trials: { name: 'The model tested', steps: TRIALS },
};

// What every scene starts from. A scene below changes only what it needs to.
const BASE = {
  system: 'aristotle', linkage: 'text', unwinding: true, sunMoonExtras: true, callippus: 'unknown', luminaries: 'reported',
  planets: null,        // changes to a planet's tilt or period: { mars: { synodicIndex: 1 } }
  view: 'outside',      // 'outside' the heaven, on the 'ground' at Athens, or 'below' the Moon
  focus: null,          // the body followed
  only: null,           // draw only these bodies' spheres
  rings: true,          // false: no spheres at all, only the sky
  movers: false,        // the movers' column in the roll-call
  colourBy: 'work',     // 'work': by what a sphere does; 'star': by the star its motion is for
  arrows: false,        // below the Moon: the motions that belong to the simple bodies
  clock: 'run',         // 'run' continuously, or jump from one 'noon' to the next
  daily: false,         // the daily rotation running
  speed: 60,            // days of the model per second
};

export const SCENES = {
  // --- the argument ---
  // The sky over Athens by night, then the same turning from outside with no
  // spheres supposed yet: only the outermost, and its mover.
  'arg-night': { view: 'ground', system: 'eudoxus', rings: false, daily: true, speed: 0.03 },
  'arg-first': { system: 'eudoxus', rings: false, movers: true, colourBy: 'star', daily: true, speed: 0.1 },
  'arg-planets': { system: 'eudoxus', rings: false, movers: true, colourBy: 'star', focus: 'mars', speed: 110 },
  // One nest of spheres by itself, then the whole heaven with a mover for each.
  'arg-saturn': { system: 'eudoxus', focus: 'saturn', only: ['saturn'], speed: 90 },
  'arg-whole': { movers: true, colourBy: 'star', speed: 60 },
  'arg-whole-daily': { movers: true, colourBy: 'star', daily: true, speed: 0.1 },

  // --- the chapter ---
  // Before any spheres: what is seen.
  sky: { system: 'eudoxus', rings: false, focus: 'mars', speed: 110 },
  'first-motion': { system: 'eudoxus', rings: false, movers: true, daily: true, speed: 0.12 },
  // Eudoxus, one set at a time.
  sun: { system: 'eudoxus', focus: 'sun', only: ['sun'], speed: 40 },
  moon: { system: 'eudoxus', focus: 'moon', only: ['moon'], speed: 4 },
  saturn: { system: 'eudoxus', focus: 'saturn', only: ['saturn'], speed: 90 },
  'venus-mercury': { system: 'eudoxus', focus: 'venus', only: ['mercury', 'venus'], speed: 40 },
  // Callippus: all seven sets, still separate.
  callippus: { system: 'callippus', speed: 60 },
  // Aristotle: joined, first without and then with the unwinding spheres.
  loose: { unwinding: false, focus: 'jupiter', speed: 220 },
  'saturn-joined': { focus: 'saturn', only: ['saturn'], speed: 90 },
  'saturn-jupiter': { focus: 'jupiter', only: ['saturn', 'jupiter'], speed: 90 },
  joined: { focus: 'jupiter', speed: 220 },
  count: { speed: 30 },
  'count-47': { sunMoonExtras: false, speed: 30 },
  // The movers, and what the motions are for.
  movers: { movers: true, speed: 30 },
  'for-the-stars': { movers: true, colourBy: 'star', speed: 30 },
  whole: { movers: true, daily: true, speed: 0.1 },

  // --- below the Moon ---
  elements: { view: 'below', speed: 30 },
  natural: { view: 'below', arrows: true, speed: 30 },
  day: { view: 'below', daily: true, speed: 0.12 },
  year: { view: 'below', speed: 40 },
  noons: { view: 'below', clock: 'noon', speed: 20 },
  'athens-noons': { view: 'ground', clock: 'noon', focus: 'sun', speed: 14 },
  'athens-night': { view: 'ground', daily: true, speed: 0.02 },

  // --- the model tested ---
  'trial-sun': { system: 'eudoxus', focus: 'sun', only: ['sun'], speed: 40 },
  'trial-sun-callippus': { system: 'callippus', callippus: 'schiaparelli', focus: 'sun', only: ['sun'], speed: 40 },
  'trial-mars': { system: 'eudoxus', focus: 'mars', only: ['mars'], speed: 70 },
  'trial-mars-true': { system: 'eudoxus', focus: 'mars', only: ['mars'], speed: 110, planets: { mars: { synodicIndex: 1, tiltDeg: 34, tiltSource: 'schiaparelli' } } },
  'trial-venus': { system: 'eudoxus', focus: 'venus', only: ['venus'], speed: 70 },
  'trial-saturn': { system: 'eudoxus', focus: 'saturn', only: ['saturn'], speed: 60 },
  'trial-moon': { system: 'eudoxus', focus: 'moon', only: ['moon'], speed: 3 },
  'trial-distance': { focus: 'mars', speed: 150 },
};

export function sceneOf(step) {
  return { ...BASE, ...SCENES[step.scene] };
}

// The first and last of the steps that share a stretch of text with step i.
export function sectionOf(i, steps = STEPS) {
  let a = i, b = i;
  while (a > 0 && steps[a - 1].ref === steps[i].ref) a--;
  while (b < steps.length - 1 && steps[b + 1].ref === steps[i].ref) b++;
  return [a, b];
}

// Which spheres a step picks out, as indices into system.spheres. A step
// names them by key ('saturn:3', 'saturn:u4', 'stars') or by kind:
// 'sun:*' the Sun's carrying spheres, 'sun:u*' the spheres that unwind them,
// '*:carrying' and '*:unwinding' every sphere of that kind.
export function litIndices(system, lit) {
  const out = [];
  system.spheres.forEach((s, i) => {
    const hit = lit.some((sel) => sel === s.key
      || (sel === '*:carrying' && s.kind === 'carrying')
      || (sel === '*:unwinding' && s.kind === 'unwinding')
      || (sel === `${s.body}:*` && s.kind === 'carrying')
      || (sel === `${s.body}:u*` && s.kind === 'unwinding'));
    if (hit) out.push(i);
  });
  return out;
}
