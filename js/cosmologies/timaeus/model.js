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
    detail: 'This is said in the Timaeus itself, at the place given.',
  },
  eudoxus: {
    label: 'Eudoxus',
    detail: 'This is the period Eudoxus gave, as Simplicius reports it (On De Caelo 495). The Timaeus gives no period for the three outer planets and says that few people have reckoned them (39c–d).',
  },
  eudemus: {
    label: 'Eudemus',
    detail: 'In the fourth century the slant of the zodiac was reckoned at 24°, the angle that the side of a regular fifteen-sided figure subtends (Eudemus fr. 145 Wehrli, in Theon of Smyrna). The Timaeus says only that the Different runs along the diagonal (36c).',
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
  says: 'The Same turns the whole heaven from east to west, level with the equator, and carries with it everything inside, down to the centre (36c, 36e). Night and day are the period of this one turning, which Timaeus calls the most intelligent (39c). One turning brings the fixed stars round again in 23 hours and 56 minutes. The day from noon to noon is about four minutes longer, because by then the Sun has moved a little way along its own circle.',
};

// The seven circles of the Different, from the Earth outwards, in the order
// Timaeus gives (38c-d). `start` is where each star is put on its circle at
// the beginning, in degrees eastward from the point where the two bands cross.
const SEVEN = [
  {
    id: 'moon', name: 'Moon', called: null, days: MONTH, label: '27⅓ days', source: 'modern', ref: '38d', start: 40,
    says: 'The Moon is set in the first circle about the Earth (38d). It has the smallest circle and goes round it fastest. For that very reason it falls furthest behind the daily turning, and so it looks the slowest of all, though it is the quickest (39a). A month is over when the Moon has gone round her circle and caught up with the Sun (39c).',
  },
  {
    id: 'sun', name: 'Sun', called: null, days: YEAR, label: 'a year', source: 'timaeus', ref: '39c', start: 270,
    says: 'The Sun is set in the second circle (38d). The maker kindled it as a light, so that the living things it suits could learn number from the turning of the heaven (39b). A year is over when the Sun has gone round its own circle (39c). The year is taken here as 365¼ days.',
  },
  {
    id: 'venus', name: 'Venus', called: 'the Morning Star', days: YEAR, label: 'a year', source: 'timaeus', ref: '38d', start: 230,
    says: 'Timaeus calls this the Morning Star. Its circle runs level with the Sun’s in speed (38d). On the reading shown here it therefore keeps the same distance from the Sun for ever. That is not what is seen, and Timaeus himself says that the Sun, the Morning Star and Hermes’ star overtake and are overtaken by one another. He does not say how.',
  },
  {
    id: 'mercury', name: 'Mercury', called: 'the star sacred to Hermes', days: YEAR, label: 'a year', source: 'timaeus', ref: '38d', start: 290,
    says: 'Timaeus calls this the star sacred to Hermes. Like the Morning Star it runs level with the Sun in speed (38d), and the same difficulty arises: on the reading shown here it never gains on the Sun or falls behind it.',
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
const UNNAMED = 'Timaeus does not name this star or the other two outer ones. He says that to tell where the rest were set, and why, would take longer than the subject deserves (38d–e), and that few people have reckoned their periods (39c). The period used here is the one Eudoxus gave.';

// How large the seven circles are. Timaeus says that they are unequal and
// were cut "by the double and triple intervals, three of each" (36d). `radii`
// are in any unit; only their proportions matter.
export const SIZES = {
  even: {
    name: 'evened out', radii: [1, 2, 3, 4, 5, 6, 7], source: 'display',
    note: 'The circles are spaced evenly here so that each can be seen. Timaeus says that they are unequal and were cut by the double and triple intervals, three of each (36d).',
  },
  numbers: {
    name: '1, 2, 3, 4, 8, 9, 27', radii: [1, 2, 3, 4, 8, 9, 27], source: 'cornford',
    note: 'On the simplest reading the seven numbers from the division of the soul are the radii of the circles, counted from the Earth. Cornford thought that Plato left the meaning vague on purpose, and Petrucci doubts that distances are meant at all. Scroll to move in towards the inner four.',
  },
  gaps: {
    name: 'the same numbers as gaps', radii: [1, 3, 6, 10, 18, 27, 54], source: 'chalcidius',
    note: 'Chalcidius took the seven numbers as the gaps between one circle and the next, which makes the radii 1, 3, 6, 10, 18, 27 and 54. Macrobius reports Platonists who multiplied the numbers together instead, and that gives distances too unequal to draw. Scroll to move in towards the inner circles.',
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
