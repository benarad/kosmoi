// "The model tested": what the spheres of Lambda 8 can and cannot give, each
// trial setting a measurement taken on the model beside what was observed.
//
// `measure` says what to measure on the scene's system (see main.js):
//   { kind: 'seasons' }
//   { kind: 'wander', body, days, span, show: [...] } where span says in
//     words how long `days` is, and show is drawn from
//     'turns' (how often and how far it turns back), 'stray' (how far off the
//     zodiac's middle), 'crossings', 'sun' (furthest from the Sun)
// With no `measure`, `model` says in words what the model gives.
// `seen` is the observation it is set against. The sources for what was
// observed and objected are in reference/notes/lambda-8-model.md.

export const TRIALS = [
  {
    title: 'The seasons are not equal',
    ref: 'Eudoxus’ Sun',
    scene: 'trial-sun',
    measure: { kind: 'seasons' },
    seen: 'Callippus gave the seasons as 94, 92, 89 and 90 days, counting from the spring equinox.',
    say: 'Sixty or seventy years before Eudoxus, Meton and Euctemon had found that the four seasons are not equal in length, which means that the Sun does not move round the zodiac at a constant speed. In Eudoxus’ model the Sun does move at a constant speed, so the model makes all four seasons the same.',
  },
  {
    title: 'Callippus’ correction, as Schiaparelli reconstructed it',
    ref: 'Callippus’ Sun, conjectured',
    scene: 'trial-sun-callippus',
    measure: { kind: 'seasons' },
    seen: 'Callippus’ figures were 94, 92, 89 and 90 days.',
    say: 'According to Simplicius, who is drawing on Eudemus, Callippus added two spheres for the Sun in order to account for the unequal seasons. We are not told how he arranged them, and Aristotle gives only their number. The arrangement shown here is a conjecture by Schiaparelli. The two extra spheres move the Sun round a small figure of eight, only four degrees long, once a year. This makes the Sun speed up and slow down slightly, and the lengths of the seasons then agree with Callippus’ figures.',
  },
  {
    title: 'Mars turns back three times too often',
    ref: 'Eudoxus’ Mars, with the period as transmitted',
    scene: 'trial-mars',
    measure: { kind: 'wander', body: 'mars', days: 3120, span: 'eight and a half years', show: ['turns'] },
    seen: 'Mars in fact turns back about once every 780 days.',
    say: 'Simplicius reports that the third and fourth spheres of Mars turn once in eight months and twenty days. With that period the model does make Mars turn back, but it does so about three times as often as the real planet.',
  },
  {
    title: 'With its true period, Mars never turns back',
    ref: 'Eudoxus’ Mars, with 780 days',
    scene: 'trial-mars-true',
    measure: { kind: 'wander', body: 'mars', days: 3120, span: 'eight and a half years', show: ['turns', 'stray'] },
    seen: 'Mars turns back about once every 780 days and stays within a few degrees of the middle of the zodiac.',
    say: 'If the two spheres are given the correct period of 780 days, the planet moves round its figure of eight too slowly to cancel its forward motion along the zodiac, and it never turns back at all. It can be made to turn back by tilting the fourth sphere much further, but then it wanders thirty degrees away from the zodiac. You can try this under Astronomy by following Mars, choosing the period of 780 days and setting the tilt to 90°.',
  },
  {
    title: 'Venus never turns back',
    ref: 'Eudoxus’ Venus',
    scene: 'trial-venus',
    measure: { kind: 'wander', body: 'venus', days: 2280, span: 'six years', show: ['turns', 'sun', 'stray'] },
    seen: 'Venus turns back about once every 584 days and is never more than about 47° from the Sun.',
    say: 'The model keeps Venus close to the Sun, as it should, because the planet cannot move further from the Sun than the tilt of its fourth sphere allows. But the model never makes Venus turn back, whatever tilt is chosen.',
  },
  {
    title: 'Too many crossings',
    ref: 'Eudoxus’ Saturn',
    scene: 'trial-saturn',
    measure: { kind: 'wander', body: 'saturn', days: 390, span: 'thirteen months', show: ['crossings', 'stray'] },
    seen: 'Saturn crosses the middle of the zodiac twice in each circuit, that is twice in about thirty years, and moves up to two and a half degrees to either side of it.',
    say: 'As a planet moves round its figure of eight it crosses the middle of the zodiac four times in each turn of its two inner spheres. For Saturn that means four crossings every thirteen months, when there should be two in thirty years. The model therefore ties the planet’s movement north and south to the wrong period, and it also makes that movement far too small.',
  },
  {
    title: 'The Moon as Simplicius reports it',
    ref: 'Eudoxus’ Moon',
    scene: 'trial-moon',
    measure: { kind: 'wander', body: 'moon', days: 27.4, step: 0.05, span: 'a month', show: ['stray', 'crossings'] },
    seen: 'The Moon crosses the middle of the zodiac twice a month and moves about 5° to either side of it.',
    say: 'In Simplicius’ report the slow motion belongs to the Moon’s third sphere. If that is right, the Moon stays on one side of the middle of the zodiac for about nine years at a time. If the speeds of the second and third spheres are exchanged, as many modern scholars propose, the Moon crosses twice a month as it should. That option is available under Astronomy.',
  },
  {
    title: 'Always at the same distance',
    ref: 'Simplicius, On De Caelo 504.17–506.3',
    scene: 'trial-distance',
    measure: null,
    model: 'Each planet always stays at the same distance from the Earth, however its spheres move.',
    seen: 'Venus and Mars are much brighter in the middle of their retrogradations than at other times. The Moon does not always appear the same size, and an eclipse of the Sun is sometimes total and sometimes leaves a ring of light.',
    say: 'This was the objection that eventually told against the whole theory. Since every planet is fixed in a sphere centred on the Earth, its distance from the Earth can never change. Simplicius, quoting Sosigenes, says that the authors of the theory were aware of the difficulty, that Aristotle discussed it in his Physical Problems, and that nobody before Autolycus even attempted to solve it. No system of spheres that share a single centre can account for it.',
  },
].map((step) => ({ lit: [], ...step }));
