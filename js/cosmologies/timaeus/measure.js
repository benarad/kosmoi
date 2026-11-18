// Measurements taken on the model of the Timaeus (model.js): how far each
// star falls behind the daily turning, how far it stands from the Sun, how
// far north it is, and the lengths of the day and the month. Pure
// mathematics; the page and the tests both use it.

import { TAU, DEG, dot, angleDiff } from '../../core/kinematics.js';
import { SAME, circleOf, longitude, among, seen } from './model.js';

// Degrees a day by which a star falls behind the fixed stars. The fixed stars
// themselves fall behind by nothing; the quicker a star goes round its own
// circle, the further it falls behind the turning of the whole (39a).
export const fallsBehind = (circle) => circle.rate / DEG;

// Degrees by which a star stands east of the Sun along the Different, from
// -180 to 180. East of the Sun it is seen in the evening, west of it before dawn.
export function fromSun(model, id, t) {
  return angleDiff(longitude(circleOf(model, id), t), longitude(circleOf(model, 'sun'), t)) / DEG;
}

// Degrees north of the equator.
export function north(model, id, t) {
  return Math.asin(Math.max(-1, Math.min(1, among(model, circleOf(model, id), t)[2]))) / DEG;
}

// The time from one meeting with the Sun to the next, in days: for the Moon,
// the month from new moon to new moon (39c). Infinity for a star that keeps
// the Sun's own pace.
export function meetsSunEvery(model, id) {
  const gain = circleOf(model, id).rate - circleOf(model, 'sun').rate;
  return Math.abs(gain) < 1e-12 ? Infinity : TAU / Math.abs(gain);
}

// What the daily clock reads when the Sun, at the start, stands due south of
// a place whose zenith lies in the plane y = 0 on the side of +x.
export const NOON = (Math.PI / 2) / SAME;

// The time of the noon nearest to `about` days after the first: the moment
// the Sun crosses the meridian, with both motions running together from a
// start at noon. `east` is the direction of the eastern horizon.
export function noonNear(model, about, east = [0, 1, 0]) {
  const sun = circleOf(model, 'sun');
  const f = (t) => dot(seen(model, sun, t, NOON + t), east);   // positive before noon, negative after
  let lo = about - 0.1, hi = about + 0.1;
  for (let k = 0; k < 50; k++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
