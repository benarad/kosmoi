// Nested rotating frames: the mathematics shared by every cosmology that is
// built from spheres or circles turning inside one another.
//
// Pure functions, no DOM and no dependencies, so the same file runs in the
// browser and in the command-line tests (tools/test.sh).
//
// Conventions
// - Vectors are [x, y, z]; matrices are 3x3 arrays of rows.
// - A "sphere" is { axis, rate }: a unit axis and an angular speed in radians
//   per day. Positive angles turn counter-clockwise seen from the tip of the
//   axis (right-hand rule).
// - Every sphere's axis is fixed in the sphere that carries it. Axes are
//   written down in the reference configuration, the one in which all angles
//   are zero and every sphere's own frame coincides with the outermost frame.
// - The orientation of sphere i is the orientation of sphere i-1 followed by
//   its own turn: O[i] = O[i-1] * rot(axis[i], angle[i]).
// - A sphere marked `receives: false` takes nothing from the sphere above it:
//   its orientation starts from rest. This is how separate sets (Eudoxus) and
//   some readings of how Aristotle joined them are expressed.

export const TAU = 2 * Math.PI;
export const DEG = Math.PI / 180;
export const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const length = (a) => Math.sqrt(dot(a, a));
export const normalize = (a) => scale(a, 1 / length(a));

// Rotation about a unit axis by an angle (Rodrigues' formula).
export function rot(axis, angle) {
  const [x, y, z] = axis;
  const c = Math.cos(angle), s = Math.sin(angle), C = 1 - c;
  return [
    [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
    [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
    [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
  ];
}

export function mul(A, B) {
  const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      R[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    }
  }
  return R;
}

export function apply(A, v) {
  return [
    A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
    A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
    A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2],
  ];
}

export function transpose(A) {
  return [
    [A[0][0], A[1][0], A[2][0]],
    [A[0][1], A[1][1], A[2][1]],
    [A[0][2], A[1][2], A[2][2]],
  ];
}

// Orientation of every sphere in a chain, outermost first, given each
// sphere's own angle. The result is expressed in the frame the chain hangs
// from (for a planet's set: the unmoving frame of the Earth).
export function orientations(spheres, angles) {
  const out = [];
  let O = I3;
  for (let i = 0; i < spheres.length; i++) {
    O = mul(spheres[i].receives === false ? I3 : O, rot(spheres[i].axis, angles[i]));
    out.push(O);
  }
  return out;
}

// Angles after t days of uniform turning from the reference configuration.
// A sphere may start from a `phase` other than zero.
export function anglesAt(spheres, t) {
  return spheres.map((s) => (s.phase || 0) + s.rate * t);
}

// Aristotle's unwinding spheres for a set of carrying spheres: the same axes
// taken in reverse order, each turning at the same speed the other way
// (Metaphysics Lambda 8, 1073b38-1074a5). Hung beneath the carrying spheres
// they undo them one by one, innermost first.
export function unwinders(spheres) {
  return spheres.slice().reverse().map((s) => ({ ...s, id: `unwinds ${s.id}`, undoes: s.id, rate: -s.rate || 0, phase: -(s.phase || 0) || 0 }));
}

// The zodiac's frame inside the frame of the fixed stars. The pole of the
// daily rotation is +z; the spring equinox lies along +x; `pole` is the pole
// of the circle through the middle of the zodiac, tipped over by the
// obliquity; longitude is measured from x towards y (eastward).
export function eclipticBasis(obliquity) {
  return {
    x: [1, 0, 0],
    y: [0, Math.cos(obliquity), Math.sin(obliquity)],
    pole: [0, -Math.sin(obliquity), Math.cos(obliquity)],
  };
}

// Longitude (0..TAU, eastward from basis.x) and latitude of a direction.
export function lonLat(v, basis) {
  const lon = Math.atan2(dot(v, basis.y), dot(v, basis.x));
  const s = Math.max(-1, Math.min(1, dot(v, basis.pole) / length(v)));
  return { lon: (lon + TAU) % TAU, lat: Math.asin(s) };
}

// Smallest signed difference a - b between two angles, in (-PI, PI].
export function angleDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d <= -Math.PI) d += TAU;
  return d;
}
