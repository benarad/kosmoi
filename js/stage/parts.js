// Pieces a cosmology can put on the stage: rings, pole pins, shells, bodies,
// labels, a growing trail, a closed curve, and a zodiac band.

import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const Z = new THREE.Vector3(0, 0, 1);
const Y = new THREE.Vector3(0, 1, 0);

export const vec = (a) => new THREE.Vector3(a[0], a[1], a[2]);

// A group whose orientation is set directly from a 3x3 matrix of rows, as the
// kinematics module produces them.
export function frame() {
  const g = new THREE.Group();
  g.matrixAutoUpdate = false;
  return g;
}

export function setOrientation(group, O) {
  group.matrix.set(
    O[0][0], O[0][1], O[0][2], 0,
    O[1][0], O[1][1], O[1][2], 0,
    O[2][0], O[2][1], O[2][2], 0,
    0, 0, 0, 1,
  );
  group.matrixWorldNeedsUpdate = true;
}

function flat(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity });
}

// A great circle of the given radius, lying in the plane whose normal is given.
export function ring(radius, normal, color, { tube = 0.045, opacity = 1 } = {}) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 192), flat(color, opacity));
  mesh.quaternion.setFromUnitVectors(Z, vec(normal));
  return mesh;
}

// A great circle drawn as a broken line: long dashes by default, dots if asked.
// Used for spheres that undo another's motion or add none of their own.
export function dashedRing(radius, normal, color, { linewidth = 1.6, opacity = 0.9, dash = 0.3, gap = 0.2 } = {}) {
  const pts = [];
  const N = 160;
  for (let k = 0; k <= N; k++) {
    const a = (2 * Math.PI * k) / N;
    pts.push(radius * Math.cos(a), radius * Math.sin(a), 0);
  }
  const geo = new LineGeometry();
  geo.setPositions(pts);
  const mat = new LineMaterial({ color, linewidth, transparent: true, opacity, fog: true, depthWrite: false, dashed: true, dashSize: dash, gapSize: gap });
  const line = new Line2(geo, mat);
  line.computeLineDistances();
  line.quaternion.setFromUnitVectors(Z, vec(normal));
  line.frustumCulled = false;
  return line;
}

// The fixed stars as points on a sphere: `stars` is [longitude, latitude,
// magnitude] in degrees in the zodiac's frame (see stage/stars.js). Brighter
// stars are drawn larger. `scale` is the device pixel ratio; `size` and
// `opacity` tone the whole field down, and stars fainter than `faintest` are
// left out.
export function starField(stars, basis, radius, color, { scale = 1, size = 1, opacity = 1, faintest = 99 } = {}) {
  const group = new THREE.Group();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const g = canvas.getContext('2d');
  const blur = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  blur.addColorStop(0, 'rgba(255,255,255,1)');
  blur.addColorStop(0.55, 'rgba(255,255,255,1)');
  blur.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = blur;
  g.fillRect(0, 0, 64, 64);
  const disc = new THREE.CanvasTexture(canvas);
  const rad = Math.PI / 180;
  for (const [from, to, px] of [[-9, 1.5, 6.4], [1.5, 2.6, 4.6], [2.6, 3.6, 3.4], [3.6, 99, 2.4]]) {
    const at = [];
    for (const [lon, lat, mag] of stars) {
      if (mag < from || mag >= to || mag > faintest) continue;
      const cl = Math.cos(lon * rad) * Math.cos(lat * rad), sl = Math.sin(lon * rad) * Math.cos(lat * rad), sb = Math.sin(lat * rad);
      for (let k = 0; k < 3; k++) at.push(radius * (basis.x[k] * cl + basis.y[k] * sl + basis.pole[k] * sb));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(at, 3));
    const mat = new THREE.PointsMaterial({ size: px * size * scale, sizeAttenuation: false, color, map: disc, transparent: true, opacity, depthWrite: false });
    mat.userData.base = opacity;
    group.add(new THREE.Points(geo, mat));
  }
  return group;
}

// A direction in the zodiac's frame, from longitude and latitude in degrees.
export function onZodiac(basis, lonDeg, latDeg = 0) {
  const rad = Math.PI / 180;
  const cl = Math.cos(lonDeg * rad) * Math.cos(latDeg * rad), sl = Math.sin(lonDeg * rad) * Math.cos(latDeg * rad), sb = Math.sin(latDeg * rad);
  return new THREE.Vector3(...[0, 1, 2].map((k) => basis.x[k] * cl + basis.y[k] * sl + basis.pole[k] * sb));
}

// A circle of latitude on a sphere whose pole is +z.
export function parallel(radius, latDeg, color, { tube = 0.02, opacity = 1 } = {}) {
  const lat = (latDeg * Math.PI) / 180;
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius * Math.cos(lat), tube, 6, 160), flat(color, opacity));
  mesh.position.z = radius * Math.sin(lat);
  return mesh;
}

// The part of a sphere's surface between two latitudes, pole at +z. Shaded.
export function latitudeBand(radius, fromDeg, toDeg, color) {
  const rad = Math.PI / 180;
  const geo = new THREE.SphereGeometry(radius, 96, 12, 0, 2 * Math.PI, (90 - toDeg) * rad, (toDeg - fromDeg) * rad);
  geo.rotateX(Math.PI / 2);
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color }));
}

// A band round a sphere: the strip that lies within `halfWidthDeg` of the
// great circle whose pole is `normal`. One flat colour, seen from both sides
// and seen through, as a strip of an armillary sphere would be.
export function band(radius, normal, halfWidthDeg, color, { opacity = 0.4 } = {}) {
  const rad = Math.PI / 180;
  const geo = new THREE.SphereGeometry(radius, 144, 3, 0, 2 * Math.PI, (90 - halfWidthDeg) * rad, 2 * halfWidthDeg * rad);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.quaternion.setFromUnitVectors(Z, vec(normal));
  return mesh;
}

// An arrow from one point to another.
export function arrow(from, to, color, { thick = 0.045 } = {}) {
  const a = vec(from), b = vec(to);
  const dir = b.clone().sub(a), len = dir.length();
  dir.normalize();
  const head = Math.min(0.5, len * 0.4);
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(thick, thick, len - head, 8), flat(color));
  shaft.position.copy(a).addScaledVector(dir, (len - head) / 2);
  shaft.quaternion.setFromUnitVectors(Y, dir);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(thick * 3.2, head, 12), flat(color));
  tip.position.copy(a).addScaledVector(dir, len - head / 2);
  tip.quaternion.setFromUnitVectors(Y, dir);
  g.add(shaft, tip);
  return g;
}

// A pole of a sphere and the pin that fixes it in the sphere outside it.
export function polePin(axis, inner, outer, color, { thick = 0.032, knob = 0.11 } = {}) {
  const g = new THREE.Group();
  const a = vec(axis);
  const mat = flat(color);
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(thick, thick, outer - inner, 8), mat);
  pin.quaternion.setFromUnitVectors(Y, a);
  pin.position.copy(a).multiplyScalar((inner + outer) / 2);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(knob, 16, 12), mat);
  dot.position.copy(a).multiplyScalar(inner);
  g.add(pin, dot);
  return g;
}

// The whole sphere as a faint surface.
export function shell(radius, color, opacity = 0.07) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 32), mat);
}

// A solid body (the Earth, a planet). Shaded, so it reads as a ball.
export function body(radius, color, glow = 0) {
  const mat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: glow });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 20), mat);
}

// A straight rod from the centre outwards along +Y of its own frame; point it
// with `aim`.
export function rod(lengthUnits, color, { thick = 0.014, opacity = 0.5 } = {}) {
  const geo = new THREE.CylinderGeometry(thick, thick, 1, 6);
  geo.translate(0, 0.5, 0);
  const mesh = new THREE.Mesh(geo, flat(color, opacity));
  mesh.scale.set(1, lengthUnits, 1);
  return mesh;
}

export function aim(mesh, direction) {
  mesh.quaternion.setFromUnitVectors(Y, direction);
}

export function label(text, className = '') {
  const el = document.createElement('div');
  el.className = `label ${className}`.trim();
  el.textContent = text;
  const obj = new CSS2DObject(el);
  obj.center.set(0, 1);          // the label sits up and to the right of its point
  return obj;
}

function lineMaterial(color, linewidth, opacity) {
  return new LineMaterial({ color, linewidth, transparent: true, opacity, fog: true, depthWrite: false });
}

// A closed curve through the given points ([x, y, z] arrays).
export function closedCurve(points, color, { linewidth = 2, opacity = 0.85 } = {}) {
  const flatPts = [];
  for (const p of points) flatPts.push(p[0], p[1], p[2]);
  flatPts.push(points[0][0], points[0][1], points[0][2]);
  const geo = new LineGeometry();
  geo.setPositions(flatPts);
  const line = new Line2(geo, lineMaterial(color, linewidth, opacity));
  line.frustumCulled = false;
  return line;
}

// A path that grows point by point and forgets its oldest points when full.
export class Trail {
  constructor(maxPoints, color, { linewidth = 1.9, opacity = 0.9 } = {}) {
    this.max = maxPoints;
    this.count = 0;
    this.points = new Float32Array(maxPoints * 3);
    this.segments = new Float32Array((maxPoints - 1) * 6);
    this.geometry = new LineSegmentsGeometry();
    this.geometry.setPositions(this.segments);     // keeps this very array; we write into it in place
    this.geometry.instanceCount = 0;
    this.object = new LineSegments2(this.geometry, lineMaterial(color, linewidth, opacity));
    this.object.frustumCulled = false;
  }

  clear() {
    this.count = 0;
    this.geometry.instanceCount = 0;
  }

  // Squared distance from the newest point, or Infinity if the trail is empty.
  distanceSqFromLast(x, y, z) {
    if (!this.count) return Infinity;
    const i = (this.count - 1) * 3, p = this.points;
    return (p[i] - x) ** 2 + (p[i + 1] - y) ** 2 + (p[i + 2] - z) ** 2;
  }

  push(x, y, z) {
    const p = this.points, s = this.segments;
    if (this.count === this.max) {
      p.copyWithin(0, 3);
      s.copyWithin(0, 6);
      this.count--;
    }
    const i = this.count * 3;
    p[i] = x; p[i + 1] = y; p[i + 2] = z;
    if (this.count > 0) {
      const j = (this.count - 1) * 6;
      s[j] = p[i - 3]; s[j + 1] = p[i - 2]; s[j + 2] = p[i - 1];
      s[j + 3] = x; s[j + 4] = y; s[j + 5] = z;
    }
    this.count++;
    this.geometry.instanceCount = Math.max(0, this.count - 1);
    this.geometry.attributes.instanceStart.data.needsUpdate = true;
  }
}

// The zodiac on the sphere of the fixed stars: the circle through its middle,
// its two edges, twelve divisions and their names (or no names, with
// `names: null`). `basis` is the zodiac's frame from kinematics.eclipticBasis.
export function zodiacBand(radius, basis, color, { halfWidth = 8, names = SIGNS } = {}) {
  const g = new THREE.Group();
  g.matrixAutoUpdate = false;
  g.matrix.makeBasis(vec(basis.x), vec(basis.y), vec(basis.pole));   // local z is the zodiac's pole
  const labels = [];
  const b = (halfWidth * Math.PI) / 180;

  g.add(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.03, 8, 192), flat(color)));
  for (const sign of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.TorusGeometry(radius * Math.cos(b), 0.014, 6, 192), flat(color, 0.6));
    edge.position.z = sign * radius * Math.sin(b);
    g.add(edge);
  }
  for (let k = 0; k < 12; k++) {
    const lon = (k * Math.PI) / 6;
    const u = new THREE.Vector3(Math.cos(lon), Math.sin(lon), 0);
    const from = u.clone().multiplyScalar(Math.cos(-b)).add(new THREE.Vector3(0, 0, Math.sin(-b)));
    const along = u.clone().multiplyScalar(-Math.sin(-b)).add(new THREE.Vector3(0, 0, Math.cos(-b)));
    const tick = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.014, 6, 8, 2 * b), flat(color, 0.6));
    tick.matrixAutoUpdate = false;
    tick.matrix.makeBasis(from, along, new THREE.Vector3().crossVectors(from, along));
    g.add(tick);

    if (!names) continue;
    const mid = lon + Math.PI / 12;
    const name = label(names[k], 'sign');
    name.center.set(0.5, 0.5);
    name.position.set(Math.cos(mid) * (radius + 0.85), Math.sin(mid) * (radius + 0.85), 0);
    g.add(name);
    labels.push(name);
  }
  return { group: g, labels };
}

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Free the GPU memory of everything under `root` and take its labels off the page.
export function dispose(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
    if (o.element && o.element.parentNode) o.element.parentNode.removeChild(o.element);
  });
  if (root.parent) root.parent.remove(root);
}
