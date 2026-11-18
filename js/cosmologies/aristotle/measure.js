// Measurements taken on a system of spheres, to set beside what is observed.
// Pure functions: the same ones serve the tests and the trials shown on screen.

import { DEG, TAU, rot, orientations, apply, transpose, lonLat, angleDiff } from '../../core/kinematics.js';

// Direction of a body against the fixed stars, T days from the start, with
// every sphere turning. Only the spheres that carry the body are worked out:
// from the last one that takes no motion from above, down to its own.
export function against(system, id, T) {
  const angle = (s) => (s.phase || 0) + s.rate * T;
  const b = system.bodies.find((x) => x.id === id);
  let first = b.sphere;
  while (first > 0 && system.spheres[first].receives !== false) first--;
  const part = system.spheres.slice(first, b.sphere + 1);
  const O = orientations(part, part.map(angle));
  const stars = system.spheres[0];
  return apply(transpose(rot(stars.axis, angle(stars))), apply(O[O.length - 1], b.position));
}

// Its place along and off the zodiac, in radians.
export function place(system, id, T) {
  return lonLat(against(system, id, T), system.basis);
}

// The lengths of the four seasons in days, from the spring equinox: how long
// the Sun takes over each quarter of the zodiac.
export function seasons(system, step = 0.02) {
  const times = { 0: [], 90: [], 180: [], 270: [] };
  let before = place(system, 'sun', 0).lon;
  for (let t = step; t < 800; t += step) {
    const now = place(system, 'sun', t).lon;
    for (const q of [0, 90, 180, 270]) {
      const a = angleDiff(before, q * DEG), b = angleDiff(now, q * DEG);
      if (a < 0 && b >= 0 && a > -0.1) times[q].push(t - (step * b) / (b - a));
    }
    before = now;
  }
  const spring = times[0][0];
  const after = (q, t) => times[q].find((x) => x > t);
  const summer = after(90, spring), autumn = after(180, summer), winter = after(270, autumn);
  return [summer - spring, autumn - summer, winter - autumn, after(0, winter) - winter];
}

// How a body wanders over a stretch of days:
//   arc       the furthest it ever falls back along the zodiac, in degrees (0 if it never turns back)
//   turns     how many separate times it turns back (a falling-back already under way at the start is not counted)
//   every     days from one turning-back to the next (null if fewer than two)
//   north, south   the furthest it strays off the zodiac's middle, in degrees
//   crossings how many times it crosses the middle
export function wander(system, id, days, step = 0.5) {
  let lon = 0, prev = null, peak = -Infinity, arc = 0, north = -Infinity, south = Infinity, crossings = 0;
  let falling = null, lastLat = null;
  const starts = [];
  for (let t = 0; t <= days; t += step) {
    const p = place(system, id, t);
    if (prev !== null) {
      const d = angleDiff(p.lon, prev);
      lon += d;
      if (d < -1e-9) { if (falling === false) starts.push(t); falling = true; }
      if (d > 1e-9) falling = false;
    }
    prev = p.lon;
    peak = Math.max(peak, lon);
    arc = Math.max(arc, peak - lon);
    north = Math.max(north, p.lat);
    south = Math.min(south, p.lat);
    if (lastLat !== null && lastLat * p.lat < 0) crossings++;
    lastLat = p.lat === 0 ? lastLat : p.lat;
  }
  const gaps = starts.slice(1).map((t, i) => t - starts[i]);
  return {
    arc: arc / DEG,
    turns: starts.length,
    every: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
    north: north / DEG,
    south: south / DEG,
    crossings,
  };
}

// The furthest a body gets from the Sun along the zodiac, in degrees.
export function elongation(system, id, days, step = 1) {
  let most = 0;
  for (let t = 0; t <= days; t += step) most = Math.max(most, Math.abs(angleDiff(place(system, id, t).lon, place(system, 'sun', t).lon)));
  return most / DEG;
}

// How high the Sun stands at noon and how long it is above the horizon, for a
// place at the given latitude, when it is `north` degrees north of the equator.
export function daylight(latitudeDeg, northDeg) {
  const x = -Math.tan(latitudeDeg * DEG) * Math.tan(northDeg * DEG);
  const half = x <= -1 ? Math.PI : x >= 1 ? 0 : Math.acos(x);
  return { noon: 90 - latitudeDeg + northDeg, hours: (half / TAU) * 48 };
}
