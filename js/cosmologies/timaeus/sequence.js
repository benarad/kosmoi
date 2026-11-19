// The guided sequence through Timaeus' speech: what is on stage at each step.
// The steps and their text are in making-text.js. Pure data, so that the
// tests can read it.

import { MAKING } from './making-text.js';

export { MAKING };

// The acts of the making, in the order of the telling (making-view.js draws
// them), and how many seconds each takes to play.
export const ACTS = [
  'turmoil', 'gather', 'elements', 'all', 'sphere', 'spin', 'ensouled',
  'mix', 'divide', 'split', 'cross', 'bend', 'turn', 'seven', 'whole',
  'tell', 'image', 'planets',
];
export const ACT_SECONDS = {
  turmoil: 6, gather: 6, elements: 13, all: 5, sphere: 6, spin: 5, ensouled: 5,
  mix: 10, divide: 9, split: 2.5, cross: 3.5, bend: 8, turn: 5, seven: 7, whole: 5,
  tell: 10, image: 5, planets: 10,
};

// What is made in the heaven itself once the seven are in their circles, in
// the order of the telling (heaven-view.js draws each as it arrives), and how
// many seconds each takes: the Sun's light (39b), the fixed stars (40a), a
// soul for every star (41d), and the sowing of the souls (42d).
export const ARRIVALS = ['light', 'stars', 'souls', 'sown'];
export const ARRIVAL_SECONDS = { light: 6, stars: 7, souls: 7, sown: 10 };

// A scene is either acts of the making played in turn, or the heaven itself,
// looked at in one of the ways that Look around offers.
//
// `still` is for an act with nothing to play through: the turmoil the maker
// took over only seethes, and has no slider.
//
// A heaven scene says where to stand (`view`), which clock to run and how
// fast. In the second half of the sequence the heaven is shown only as far as
// it has been made: `lacks` lists what is not there yet, and `arrive` names
// the one thing that comes to be while the step plays. `follow` is a star
// whose path is traced, and `near` brings the viewer in closer.
export const SCENES = {
  sky: { heaven: { view: 'ground', clock: 'daily', speed: 0.03 } },
  likeness: { heaven: { view: 'outside', clock: 'held', speed: 60 } },
  turmoil: { acts: ['turmoil'], still: true },
  gather: { acts: ['gather'] },
  elements: { acts: ['elements'] },
  all: { acts: ['all'] },
  sphere: { acts: ['sphere'] },
  spin: { acts: ['spin'] },
  ensouled: { acts: ['ensouled'] },
  mix: { acts: ['mix'] },
  divide: { acts: ['divide'] },
  chi: { acts: ['split', 'cross', 'bend'] },
  turn: { acts: ['turn'] },
  seven: { acts: ['seven'] },
  whole: { acts: ['whole'] },
  tell: { acts: ['tell'] },
  image: { acts: ['image'], still: true },
  planets: { acts: ['planets'] },
  spirals: { heaven: { view: 'outside', clock: 'daily', speed: 0.4, follow: 'moon', near: 2.8, lacks: ['light', 'stars'] } },
  light: { heaven: { view: 'outside', clock: 'daily', speed: 0.12, lacks: ['stars'], arrive: 'light' } },
  measures: { heaven: { view: 'outside', clock: 'held', speed: 30, lacks: ['stars'] } },
  stars: { heaven: { view: 'outside', clock: 'daily', speed: 0.05, arrive: 'stars' } },
  earth: { heaven: { view: 'outside', clock: 'daily', speed: 0.12, near: 4.4 } },
  dances: { heaven: { view: 'outside', clock: 'held', speed: 60 } },
  poets: { heaven: { view: 'ground', clock: 'daily', speed: 0.03 } },
  speech: { heaven: { view: 'outside', clock: 'daily', speed: 0.02 } },
  souls: { heaven: { view: 'outside', clock: 'daily', speed: 0.05, arrive: 'souls' } },
  sown: { heaven: { view: 'outside', clock: 'daily', speed: 0.05, arrive: 'sown' } },
};

export const sceneOf = (step) => SCENES[step.scene];

// The thirty steps fall into five groups. Each is named here with the passage
// of its first step, for the list of steps in the margin and for the strip of
// marks under Back and Next.
export const GROUPS = [
  { name: 'Where Timaeus begins', first: 'Timaeus 27d–28c' },
  { name: 'The body of the world', first: 'Timaeus 29d–30a' },
  { name: 'The soul of the world', first: 'Timaeus 35a' },
  { name: 'Thought, time and the planets', first: 'Timaeus 37a–c' },
  { name: 'The heaven, the gods and the souls', first: 'Timaeus 38e–39b' },
];
