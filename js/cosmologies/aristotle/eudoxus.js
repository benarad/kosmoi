// Eudoxus' sets of spheres for the five planets, as Aristotle reports them
// (Metaphysics Lambda 8, 1073b17-32) and as they are usually reconstructed
// from Simplicius. Pure data and geometry: nothing here touches the screen.
//
// Every number carries a `source` key into SOURCES, so the interface can say
// whether it is in Aristotle, in Simplicius, a modern conjecture, or only a
// choice made for the picture. See reference/notes/lambda-8-model.md.

import { TAU, DEG, add, scale, cross, eclipticBasis } from '../../core/kinematics.js';

export const YEAR = 365.25;                 // days
export const MONTH = 30;                    // days, as Simplicius' months are usually converted
export const SIDEREAL_DAY = YEAR / (YEAR + 1); // the fixed stars turn once more than the Sun in a year
export const OBLIQUITY = 24 * DEG;          // a fifteenth of a circle, the early Greek figure

export const SOURCES = {
  aristotle: {
    label: 'Aristotle',
    detail: 'Metaphysics Λ 8, 1073b17–32.',
  },
  simplicius: {
    label: 'Simplicius',
    detail: 'On De Caelo 493.4–506.8, from Sosigenes, who drew on Eudemus. Aristotle gives no periods.',
  },
  schiaparelli: {
    label: 'Schiaparelli',
    detail: 'Le sfere omocentriche (1875). This is a modern conjecture and is not found in any ancient source.',
  },
  ideler: {
    label: 'Ideler',
    detail: 'Ideler (1828–30), followed by Schiaparelli and Heath, exchanged the speeds that Simplicius gives for the second and third spheres. Dicks and Mendell defend Simplicius’ report.',
  },
  theon: {
    label: 'Theon of Smyrna',
    detail: 'Theon, who took it from Adrastus, wrote centuries after Eudoxus. Eudoxus’ own figure is not recorded.',
  },
  unrecorded: {
    label: 'Not recorded',
    detail: 'Aristotle gives only how many spheres Callippus added. Eudemus explained them, but his account is lost.',
  },
  hanson: {
    label: 'Hanson',
    detail: 'N. R. Hanson, “On Counting Aristotle’s Spheres” (1963).',
  },
  beere: {
    label: 'Beere',
    detail: 'J. Beere, “Counting the Unmoved Movers” (2003).',
  },
  mendell: {
    label: 'Mendell',
    detail: 'H. Mendell, Vignettes of Ancient Mathematics, table of possible tilts. This is a modern conjecture.',
  },
  modern: {
    label: 'Modern value',
    detail: 'Not in the ancient sources.',
  },
  display: {
    label: 'Display choice',
    detail: 'This is not attested anywhere. It was chosen so that the picture could be drawn.',
  },
  custom: {
    label: 'Your setting',
    detail: 'Set with the slider.',
  },
};

// Zodiacal and synodic periods are the ones Simplicius reports. Tilts are the
// angle between the axes of the third and fourth spheres; the hippopede is
// twice the tilt long. Where a planet has more than one candidate period, the
// tilts proposed for each are listed with it.
export const PLANETS = [
  {
    id: 'saturn', name: 'Saturn', god: 'Kronos', greek: 'ὁ τοῦ Κρόνου',
    zodiacal: { days: 30 * YEAR, label: '30 years', source: 'simplicius' },
    synodic: [
      { days: 13 * MONTH, label: '13 months', source: 'simplicius',
        tilts: [{ deg: 6, source: 'schiaparelli' }, { deg: 6, source: 'mendell' }] },
    ],
    poleLongitude: 200, followsSun: false,
    colors: { dark: '#a9bf63', light: '#5f7a1a' },
  },
  {
    id: 'jupiter', name: 'Jupiter', god: 'Zeus', greek: 'ὁ τοῦ Διός',
    zodiacal: { days: 12 * YEAR, label: '12 years', source: 'simplicius' },
    synodic: [
      { days: 13 * MONTH, label: '13 months', source: 'simplicius',
        tilts: [{ deg: 13, source: 'schiaparelli' }, { deg: 10, source: 'mendell' }] },
    ],
    poleLongitude: 160, followsSun: false,
    colors: { dark: '#b9a6f2', light: '#5b45a8' },
  },
  {
    id: 'mars', name: 'Mars', god: 'Ares', greek: 'ὁ τοῦ Ἄρεος',
    zodiacal: { days: 2 * YEAR, label: '2 years', source: 'simplicius' },
    synodic: [
      { days: 8 * MONTH + 20, label: '8 months 20 days', source: 'simplicius',
        note: 'This is the figure as transmitted. It is usually thought to be corrupt, since the true period is about three times as long.',
        tilts: [{ deg: 34, source: 'schiaparelli' }, { deg: 40, source: 'mendell' }] },
      { days: 780, label: '780 days', source: 'modern',
        note: 'This is the true synodic period. With it the model produces no retrogradation at opposition.',
        tilts: [{ deg: 90, source: 'schiaparelli' }, { deg: 105, source: 'mendell' }] },
    ],
    poleLongitude: 220, followsSun: false,
    colors: { dark: '#f0694f', light: '#b23a1e' },
  },
  {
    id: 'venus', name: 'Venus', god: 'Aphrodite', greek: 'ὁ τῆς Ἀφροδίτης',
    zodiacal: { days: YEAR, label: '1 year', source: 'simplicius' },
    synodic: [
      { days: 19 * MONTH, label: '19 months', source: 'simplicius',
        tilts: [{ deg: 46, source: 'schiaparelli' }, { deg: 45, source: 'mendell' }, { deg: 150, source: 'mendell' }] },
    ],
    poleLongitude: 180, followsSun: true,
    colors: { dark: '#f2a3cc', light: '#b0447f' },
  },
  {
    id: 'mercury', name: 'Mercury', god: 'Hermes', greek: 'ὁ τοῦ Ἑρμοῦ',
    zodiacal: { days: YEAR, label: '1 year', source: 'simplicius' },
    synodic: [
      { days: 110, label: '110 days', source: 'simplicius',
        tilts: [{ deg: 23, source: 'schiaparelli' }, { deg: 30, source: 'mendell' }, { deg: 20, source: 'mendell' }] },
    ],
    poleLongitude: 180, followsSun: true,
    colors: { dark: '#5cc8c2', light: '#12807a' },
  },
];

// The four spheres of one planet's set, outermost first, and the planet's
// place on the fourth.
//
//   1  as the fixed stars: once a day, east to west, about the axis of the heaven
//   2  along the circle through the middle of the zodiac, west to east
//   3  poles on that circle; turns once in the synodic period
//   4  inclined to the third; turns the other way in the same time; the planet
//      rides its equator
//
// `poleLongitude` (where on the zodiac the third sphere's pole sits when all
// angles are zero) and `sense` (which way the third sphere turns) are not
// attested for any planet and only fix where the picture starts.
export function eudoxanPlanet({ zodiacal, synodic, tilt, poleLongitude = 0, sense = 1, obliquity = OBLIQUITY }) {
  const basis = eclipticBasis(obliquity);
  const pole3 = add(scale(basis.x, Math.cos(poleLongitude)), scale(basis.y, Math.sin(poleLongitude)));
  const pole4 = add(scale(pole3, Math.cos(tilt)), scale(basis.pole, Math.sin(tilt)));
  const w = TAU / synodic;
  return {
    basis,
    spheres: [
      { id: 1, role: 'daily', axis: [0, 0, 1], rate: -TAU / SIDEREAL_DAY },
      { id: 2, role: 'zodiacal', axis: basis.pole, rate: TAU / zodiacal },
      { id: 3, role: 'synodic', axis: pole3, rate: sense * w },
      { id: 4, role: 'counter', axis: pole4, rate: -sense * w },
    ],
    // On the equator of the fourth sphere, a quarter-circle from the third
    // sphere's pole: the middle of the hippopede.
    planet: cross(basis.pole, pole3),
  };
}

// Model for a planet from the data above, with a chosen synodic period and tilt.
export function buildPlanet(planet, { synodicIndex = 0, tiltDeg } = {}) {
  const syn = planet.synodic[synodicIndex];
  const tilt = (tiltDeg === undefined ? syn.tilts[0].deg : tiltDeg) * DEG;
  return eudoxanPlanet({
    zodiacal: planet.zodiacal.days,
    synodic: syn.days,
    tilt,
    poleLongitude: planet.poleLongitude * DEG,
  });
}

// What each sphere does, in words, with the source of each claim.
export function describeSpheres(planet, { synodicIndex = 0, tiltDeg, tiltSource = 'schiaparelli' } = {}) {
  const syn = planet.synodic[synodicIndex];
  const tilt = tiltDeg === undefined ? syn.tilts[0].deg : tiltDeg;
  return [
    {
      id: 1, title: 'First sphere', short: 'as the fixed stars', period: 'a day',
      text: 'It moves in the same way as the sphere of the fixed stars, once a day from east to west about the axis of the heaven.',
      sources: [['Motion', 'aristotle']],
    },
    {
      id: 2, title: 'Second sphere', short: 'along the zodiac', period: planet.zodiacal.label,
      text: `It turns along the circle through the middle of the zodiac, from west to east, once in ${planet.zodiacal.label}. Aristotle says that this sphere is common to all the planets.`,
      sources: [['Axis', 'aristotle'], ['Period', planet.zodiacal.source]],
    },
    {
      id: 3, title: 'Third sphere', short: 'poles on the zodiac', period: syn.label,
      text: `Its poles lie on the circle through the middle of the zodiac. It turns once in ${syn.label}.`,
      sources: [['Poles', 'aristotle'], ['Period', syn.source], ['Where on the zodiac the poles sit', 'display']],
    },
    {
      id: 4, title: 'Fourth sphere', short: 'carries the planet', period: syn.label,
      text: `It is slanted to the third sphere by ${tilt}° and turns in the opposite direction in the same time. The planet is carried on its equator.`,
      sources: [['Slant to the third', 'aristotle'], ['Period and sense', 'simplicius'], ['Size of the slant', tiltSource]],
    },
  ];
}
