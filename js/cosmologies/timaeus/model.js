// The heaven of Plato's Timaeus (36b-d, 38c-40d) as two kinds of turning: the
// Same, which carries the whole heaven round once a day, and the Different,
// which runs the other way along a slanted circle and is split into seven
// circles, one for each wandering star. Pure data and geometry: nothing here
// touches the screen.
//
// The reading built here is the one now usual (Vlastos, Gregory, Bodnar,
// Petrucci): each of the seven has these two steady circular motions and no
// other. What that leaves out, and Cornford's different account, are set out
// in reference/notes/timaeus-model.md.
//
// Every number carries a `source` key into SOURCES, so the page can say
// whether it is in the Timaeus, in another ancient source, a modern value, or
// only a choice made for the picture.

import { TAU, DEG, rot, apply, eclipticBasis } from '../../core/kinematics.js';
import { BODIES as PALETTE } from '../aristotle/system.js';

export const YEAR = 365.25;                 // days
// One turning of the Same, in days. In a year the fixed stars come round once
// more often than the Sun does, since the Sun goes once round the other way.
export const TURNING = YEAR / (YEAR + 1);
export const SAME = -TAU / TURNING;         // radians a day; the minus sign is east to west
export const SLANT = 24 * DEG;              // of the Different to the Same

const MONTH = 27.321662;                    // the Moon's circuit against the fixed stars, in days

export const SOURCES = {
  timaeus: {
    label: 'Timaeus',
    detail: 'This is stated in the Timaeus, in the passage cited.',
  },
  eudoxus: {
    label: 'Eudoxus',
    detail: 'This is the period that Eudoxus gave, as Simplicius reports it (On De Caelo 495). The Timaeus gives no period for the three outer planets and says that few people have worked them out (39c–d).',
  },
  eudemus: {
    label: 'Eudemus',
    detail: 'In the fourth century BC the slant of the zodiac was taken to be 24°, which is the angle subtended by one side of a regular fifteen-sided figure (Eudemus fr. 145 Wehrli, in Theon of Smyrna). The Timaeus says only that the Different runs along the diagonal (36c).',
  },
  cornford: {
    label: 'Cornford',
    detail: 'Plato’s Cosmology (1937), p. 79. He calls this the simplest view and thinks that Plato left the meaning vague on purpose.',
  },
  chalcidius: {
    label: 'Chalcidius',
    detail: 'Chalcidius’ commentary on the Timaeus, written in the fourth century AD, as Heath reports it (Aristarchus of Samos, p. 164).',
  },
  worked: {
    label: 'Worked out',
    detail: 'This follows from the other figures and is not stated anywhere.',
  },
  modern: {
    label: 'Modern value',
    detail: 'This is not in the Timaeus.',
  },
  display: {
    label: 'Display choice',
    detail: 'This is not attested anywhere. It was chosen so that the picture could be drawn.',
  },
};

// The turning of the Same, described as the seven circles are below.
export const THE_SAME = {
  id: 'same', name: 'The Same', days: TURNING, label: 'a day', source: 'timaeus', ref: '39c',
  says: 'The Same turns the whole heaven from east to west in the plane of the equator, and it carries everything inside the heaven round with it, all the way down to the centre (36c, 36e). A night and a day together make up one revolution of the Same, which Timaeus calls the most intelligent of the revolutions (39c). One revolution brings the fixed stars back to the same place in 23 hours and 56 minutes. The day from one noon to the next is about four minutes longer, because the Sun has moved a short distance along its own circle in the meantime.',
};

// The seven circles of the Different, from the Earth outwards, in the order
// Timaeus gives (38c-d). `start` is where each star is put on its circle at
// the beginning, in degrees eastward from the point where the two bands cross.
const SEVEN = [
  {
    id: 'moon', name: 'Moon', called: null, days: MONTH, label: '27⅓ days', source: 'modern', ref: '38d', start: 40,
    says: 'The Moon is placed in the circle nearest the Earth (38d). Its circle is the smallest, and it goes round faster than any other planet. Because it moves so fast along its own circle, it drops further behind the daily turning than the others do, and so it looks like the slowest of them although it is in fact the fastest (39a). A month has passed when the Moon has gone round its circle and caught up with the Sun again (39c).',
  },
  {
    id: 'sun', name: 'Sun', called: null, days: YEAR, label: 'a year', source: 'timaeus', ref: '39c', start: 270,
    says: 'The Sun is placed in the second circle from the Earth (38d). The maker lit it so that the living things that are capable of it could learn about number by watching the heaven turn (39b). A year has passed when the Sun has gone once round its own circle (39c). The model takes the year to be 365¼ days.',
  },
  {
    id: 'venus', name: 'Venus', called: 'the Morning Star', days: YEAR, label: 'a year', source: 'timaeus', ref: '38d', start: 230,
    says: 'Timaeus calls this planet the Morning Star, and says that its circle keeps pace with the Sun’s (38d). On the interpretation used here it therefore always stays at the same distance from the Sun. That is not what we see in the sky. Timaeus himself says that the Sun, the Morning Star and the star of Hermes overtake one another and are overtaken, but he does not explain how this happens.',
  },
  {
    id: 'mercury', name: 'Mercury', called: 'the star sacred to Hermes', days: YEAR, label: 'a year', source: 'timaeus', ref: '38d', start: 290,
    says: 'Timaeus calls this planet the star sacred to Hermes. Like the Morning Star it keeps pace with the Sun (38d), and the same difficulty arises, because on the interpretation used here it never moves ahead of the Sun or falls behind it.',
  },
  {
    id: 'mars', name: 'Mars', called: null, days: 2 * YEAR, label: '2 years', source: 'eudoxus', ref: '38d–e', start: 100,
  },
  {
    id: 'jupiter', name: 'Jupiter', called: null, days: 12 * YEAR, label: '12 years', source: 'eudoxus', ref: '38d–e', start: 160,
  },
  {
    id: 'saturn', name: 'Saturn', called: null, days: 30 * YEAR, label: '30 years', source: 'eudoxus', ref: '38d–e', start: 320,
  },
];
const UNNAMED = 'Timaeus does not name this planet or the other two outer ones. He says that it would take too long to explain where the remaining planets were placed and why (38d–e), and that few people have worked out their periods (39c). The period used here is the one that Eudoxus gave.';

// How large the seven circles are. Timaeus says that they are unequal and
// were cut "by the double and triple intervals, three of each" (36d). `radii`
// are in any unit; only their proportions matter.
export const SIZES = {
  even: {
    name: 'spaced evenly', radii: [1, 2, 3, 4, 5, 6, 7], source: 'display',
    note: 'The circles are spaced evenly here so that each of them can be seen. Timaeus says that they are unequal in size and that they were divided according to the three double intervals and the three triple intervals (36d).',
  },
  numbers: {
    name: '1, 2, 3, 4, 8, 9, 27', radii: [1, 2, 3, 4, 8, 9, 27], source: 'cornford',
    note: 'On the simplest interpretation, the seven numbers from the division of the soul are the radii of the circles, measured from the Earth. Cornford thought that Plato left this vague on purpose, and Petrucci doubts whether the numbers are meant as distances at all. You can scroll to move in towards the four inner circles.',
  },
  gaps: {
    name: 'the same numbers as gaps', radii: [1, 3, 6, 10, 18, 27, 54], source: 'chalcidius',
    note: 'Chalcidius took the seven numbers to be the distances between each circle and the next, which makes the radii 1, 3, 6, 10, 18, 27 and 54. Macrobius reports that some Platonists multiplied the numbers together, but the distances that result are too unequal to draw. You can scroll to move in towards the inner circles.',
  },
};

// The division of the soul (35b-36b). `portions` are the seven Timaeus takes,
// in the order he takes them. `marks` are the same numbers as places along one
// strip. `scale` is the whole series once the double and triple intervals have
// been filled with their means and the 4:3 intervals with 9:8 intervals: each
// octave filled in the same way, as Brisson sets it out (2021, p. 75). Every
// step in it is 9:8 or the remainder 256:243.
const OCTAVE = [1, 9 / 8, 81 / 64, 4 / 3, 3 / 2, 27 / 16, 243 / 128];
export const SOUL = {
  portions: [1, 2, 3, 4, 9, 8, 27],
  marks: [1, 2, 3, 4, 8, 9, 27],
  scale: [0, 1, 2, 3, 4].flatMap((k) => OCTAVE.map((x) => x * 2 ** k)).filter((v) => v <= 27),
};

export const defaultConfig = () => ({ sizes: 'even' });

// The model for a given reading: the frame of the Different inside the frame
// of the fixed stars, and the seven circles with their speeds and sizes.
// `radius` is a fraction of the outermost circle's.
export function buildModel(config = defaultConfig()) {
  const radii = SIZES[config.sizes].radii, outermost = radii[radii.length - 1];
  return {
    config,
    basis: eclipticBasis(SLANT),
    same: THE_SAME,
    circles: SEVEN.map((c, k) => ({
      ...c,
      order: k + 1,
      says: c.says || UNNAMED,
      colors: PALETTE[c.id].colors,
      size: PALETTE[c.id].size || 1,
      rate: TAU / c.days,                    // radians a day along the Different, west to east
      phase: c.start * DEG,
      radius: radii[k] / outermost,
      sizeSource: SIZES[config.sizes].source,
    })),
  };
}

export const circleOf = (model, id) => model.circles.find((c) => c.id === id);

// How far round its circle a star is after t days: radians eastward from the
// point where the two bands cross.
export const longitude = (circle, t) => circle.phase + circle.rate * t;

// Its direction against the fixed stars.
export function among(model, circle, t) {
  const l = longitude(circle, t), b = model.basis, c = Math.cos(l), s = Math.sin(l);
  return [b.x[0] * c + b.y[0] * s, b.x[1] * c + b.y[1] * s, b.x[2] * c + b.y[2] * s];
}

// The orientation of the whole heaven after the Same has run for td days.
export const heaven = (td) => rot([0, 0, 1], SAME * td);

// The star's direction as the Earth sees it, with the Different having run
// for t days and the Same for td.
export const seen = (model, circle, t, td) => apply(heaven(td), among(model, circle, t));
