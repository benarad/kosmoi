// Draws a list of spheres from system.buildSystem: all seven sets nested, or
// the sets of one or two planets by themselves, or none at all (just the sky).
// The viewer stands outside the whole, or on the ground at its centre.
//
// - A sphere with a motion of its own is a solid ring (its equator). In the
//   set being followed it also gets one meridian and its two poles pinned
//   into the sphere outside it.
// - An unwinding sphere is a dashed ring.
// - A sphere that adds no motion (a first sphere carried by the one above, or
//   one of Callippus' whose work is not recorded) is a dotted ring.

import * as THREE from 'three';
import { apply, cross, dot, normalize } from '../../core/kinematics.js';
import {
  frame, setOrientation, ring, dashedRing, polePin, shell, body, rod, aim, label, closedCurve, Trail, zodiacBand, starField, onZodiac, dispose, vec,
} from '../../stage/parts.js';
import { STARS, NAMED_STARS } from '../../stage/stars.js';

// Radii on screen. Aristotle gives no sizes or distances, and his spheres
// touch one another with no gap; these are only for legibility.
export const R_STARS = 10;
const R_OUTER = 9.55, R_INNER = 1.45, SET_GAP = 1.7;
const TRAIL_POINTS = 6000;

// A radius for every sphere that is drawn. A few sets by themselves are
// spread out; all together, they are packed in. Either way there is a wider
// gap between one planet's spheres and the next's.
function layout(spheres, shown, few) {
  const radii = spheres.map(() => 0);
  radii[0] = R_STARS;
  const drawn = spheres.map((s, i) => i).filter((i) => i > 0 && shown[i]);
  const gap = (k) => (spheres[drawn[k]].body !== spheres[drawn[k - 1]].body ? SET_GAP : 1);
  let units = 0;
  for (let k = 1; k < drawn.length; k++) units += gap(k);
  const top = few ? 9.0 : R_OUTER;
  const step = few ? Math.min(0.9, 6 / Math.max(1, units)) : (R_OUTER - R_INNER) / Math.max(1, units);
  let r = top;
  drawn.forEach((i, k) => { if (k > 0) r -= step * gap(k); radii[i] = r; });
  return radii;
}

export class HeavenView {
  constructor(stage) {
    this.stage = stage;
    this.root = null;
    this.show = null;
    this.lit = null;
    this.dim = 0.2;
  }

  // focus: the id of the body being followed, or null;
  // only: ids of the bodies whose spheres are drawn, or null for all;
  // rings: false to draw no spheres at all, only the sky;
  // colour: sphere -> colour, if not the usual colour by what the sphere does;
  // eye: 'outside', or 'ground' with `zenith` the direction straight overhead.
  build(system, { theme, focus = null, only = null, rings = true, colour = null, eye = 'outside', zenith = null }) {
    this.clear();
    const ground = eye === 'ground';
    if (ground) rings = false;
    this.ground = ground;
    this.zenith = ground ? vec(zenith) : null;
    this.daylight = 0;
    this.system = system;
    this.theme = theme;
    this.colour = colour || ((s) => theme.roles[s.role]);
    const { spheres, bodies, basis } = system;
    const root = this.root = new THREE.Group();
    this.stage.cosmos.add(root);
    this.stage.setExtent(R_STARS);
    this.labels = [];

    const shown = spheres.map((s, i) => i === 0 || !only || only.includes(s.body));
    const radii = this.radii = layout(spheres, shown, !!only);

    this.frames = [];
    this.drawn = spheres.map(() => false);
    this.drawn[0] = !ground;      // the outermost sphere has no ring of its own, but can be picked out like the rest
    this.materials = spheres.map(() => []);
    this.shells = [];
    let outer = R_STARS;
    spheres.forEach((s, i) => {
      const f = frame();
      root.add(f);
      this.frames.push(f);
      if (i === 0 || !shown[i]) return;
      if (rings) {
        const parts = this.drawSphere(s, i, radii[i], outer, s.body === focus, basis);
        f.add(parts);
        parts.traverse((o) => { if (o.material) { o.material.userData.base = o.material.opacity; this.materials[i].push(o.material); } });
        this.drawn[i] = true;
        if (s.body === focus && s.kind === 'carrying') {
          const surface = shell(radii[i], this.colour(s));
          surface.visible = false;
          f.add(surface);
          this.shells.push(surface);
        }
      }
      outer = radii[i];
    });

    // One more shell, moved to whichever single sphere is picked out.
    this.pointer = shell(1, theme.ink, 0.1);
    this.pointer.visible = false;
    root.add(this.pointer);

    // On the sphere of the fixed stars: the zodiac, and the path of the body being followed.
    const band = zodiacBand(R_STARS, basis, theme.star);
    this.frames[0].add(band.group);
    this.labels.push(...band.labels);
    // From the ground the stars are the sky; from outside they only mark the
    // outermost sphere, so fewer are drawn, and fainter.
    const scale = this.stage.renderer.getPixelRatio();
    this.stars = starField(STARS, basis, R_STARS, theme.ink, ground ? { scale } : { scale, size: 0.62, opacity: 0.55, faintest: 3.7 });
    this.frames[0].add(this.stars);
    this.starLabels = [];
    if (ground) {
      for (const [name, lon, lat] of NAMED_STARS) {
        const l = label(name, 'star');
        l.position.copy(onZodiac(basis, lon, lat)).multiplyScalar(R_STARS);
        this.frames[0].add(l);
        this.labels.push(l);
        this.starLabels.push(l);
      }
    }

    this.focusBody = bodies.find((b) => b.id === focus) || null;
    this.trail = null;
    this.sight = null;
    this.figureHolder = null;
    for (const b of bodies) {
      if (only && !only.includes(b.id)) continue;
      const mesh = body((ground ? 0.1 : only ? 0.27 : 0.16) * (b.size || 1), b.colors[theme.name], b.id === 'sun' ? 0.95 : 0.55);
      // With no spheres drawn there are no distances either: every body is
      // shown where it is seen, on the sky.
      mesh.position.copy(vec(b.position)).multiplyScalar(rings ? radii[b.sphere] : R_STARS - (ground ? 0.1 : 0.35));
      const name = label(b.name, b.id === focus ? 'major' : 'minor');
      mesh.add(name);
      this.frames[b.sphere].add(mesh);
      this.labels.push(name);
    }

    const fb = this.focusBody;
    if (fb) {
      this.trail = new Trail(TRAIL_POINTS, fb.colors[theme.name]);
      this.frames[0].add(this.trail.object);
      if (!ground) {
        this.sight = rod(R_STARS, theme.ink, { thick: 0.012, opacity: 0.35 });
        root.add(this.sight);
      }
      if (fb.figure && rings) {
        this.figureHolder = new THREE.Group();
        this.frames[fb.figure.carrier].add(this.figureHolder);
        if (only && fb.followsSun && !only.includes('sun')) {
          const sun = body(0.2, theme.sun, 0.9);
          sun.position.copy(vec(fb.figure.centre)).multiplyScalar(radii[fb.figure.carrier]);
          const sunLabel = label('mean Sun', 'minor');
          sun.add(sunLabel);
          this.frames[fb.figure.carrier].add(sun);
          this.labels.push(sunLabel);
        }
      }
    }

    // At rest: the Earth and the axis of the heaven; or, seen from the Earth,
    // the ground underfoot and the four quarters of the horizon.
    if (ground) {
      const up = vec(zenith);
      const floor = new THREE.Mesh(new THREE.CircleGeometry(R_STARS * 1.6, 96), new THREE.MeshBasicMaterial({ color: theme.ground, side: THREE.DoubleSide, fog: false }));
      floor.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), up);
      root.add(floor);
      const northward = new THREE.Vector3(0, 0, 1).addScaledVector(up, -up.z).normalize();
      const eastward = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), up).normalize();
      for (const [name, d] of [['north', northward], ['east', eastward], ['south', northward.clone().negate()], ['west', eastward.clone().negate()]]) {
        const l = label(name, 'compass');
        l.center.set(0.5, 1);
        l.position.copy(d).multiplyScalar(R_STARS).addScaledVector(up, 0.3);
        root.add(l);
        this.labels.push(l);
      }
      // The one point of the sky that does not move.
      const pole = body(0.035, theme.axis, 0.9);
      pole.position.set(0, 0, R_STARS);
      root.add(pole);
    } else {
      const earth = body(only ? 0.6 : 0.5, theme.earth, 0.15);
      const earthLabel = label('Earth', 'minor');
      earth.add(earthLabel);
      root.add(earth);
      this.labels.push(earthLabel);
      const axis = rod(2 * (R_STARS + 0.9), theme.axis, { thick: 0.02, opacity: 0.55 });
      aim(axis, new THREE.Vector3(0, 0, 1));
      axis.position.set(0, 0, -(R_STARS + 0.9));
      root.add(axis);
    }
    const north = label('pole of the heaven', 'minor');
    north.position.set(0, 0, ground ? R_STARS : R_STARS + 0.9);
    root.add(north);
    this.labels.push(north);

    for (const l of this.labels) this.stage.trackLabel(l);
    this.applyLook();
  }

  drawSphere(s, i, r, outer, full, basis) {
    const { spheres, bodies } = this.system;
    const color = this.colour(s);
    const g = new THREE.Group();
    if (s.rate === 0) {
      g.add(dashedRing(r, s.axis, color, { dash: 0.05, gap: 0.15, linewidth: full ? 2.2 : 1.5, opacity: full ? 0.9 : 0.6 }));
    } else if (s.kind === 'unwinding') {
      g.add(dashedRing(r, s.axis, color, { dash: 0.34, gap: 0.2, linewidth: full ? 2.2 : 1.5, opacity: full ? 0.95 : 0.6 }));
    } else {
      g.add(ring(r, s.axis, color, { tube: full ? 0.042 : 0.022, opacity: full ? 1 : 0.6 }));
      if (full) {
        // The meridian is drawn through the poles of the sphere inside (so one
        // can see them carried round), or through the body this sphere carries.
        const next = spheres[i + 1];
        const carried = bodies.find((b) => b.sphere === i);
        const through = carried ? carried.position : next && next.body === s.body ? next.axis : basis.pole;
        let normal = cross(s.axis, through);
        if (dot(normal, normal) < 1e-8) normal = cross(s.axis, basis.pole);
        if (dot(normal, normal) < 1e-8) normal = cross(s.axis, basis.x);
        g.add(ring(r, normalize(normal), color, { tube: 0.018, opacity: 0.5 }));
        g.add(polePin(s.axis, r, outer, color, { thick: 0.026, knob: 0.085 }));
        g.add(polePin(s.axis.map((x) => -x), r, outer, color, { thick: 0.026, knob: 0.085 }));
      }
    }
    return g;
  }

  clear() {
    if (!this.root) return;
    for (const l of this.labels) this.stage.untrackLabel(l);
    dispose(this.root);
    this.root = null;
    this.trail = null;
    this.sight = null;
    this.figureHolder = null;
  }

  // O: the orientation of every sphere, from kinematics.orientations.
  update(O) {
    if (!this.root) return;
    O.forEach((o, i) => setOrientation(this.frames[i], o));
    if (this.sight) {
      const p = apply(O[this.focusBody.sphere], this.focusBody.position);
      aim(this.sight, new THREE.Vector3(p[0], p[1], p[2]));
    }
    if (this.ground) this.showLabels();
  }

  // Which names show. From the ground: none of what is below the horizon, and
  // no stars' names by day.
  showLabels() {
    const show = this.show || { labels: true, stars: true };
    const p = new THREE.Vector3();
    for (const l of this.labels) {
      let visible = show.labels;
      if (visible && this.ground) {
        l.getWorldPosition(p);
        this.root.worldToLocal(p);
        visible = p.dot(this.zenith) > -0.01 * p.length();
      }
      l.visible = visible;
    }
    for (const l of this.starLabels) l.visible = l.visible && show.stars && this.daylight < 0.5;
  }

  // The closed curve the followed body runs round, as points in the frame of
  // the sphere it rides on (see main.js), or nothing to take it away.
  setFigure(points) {
    if (!this.figureHolder) return;
    while (this.figureHolder.children.length) {
      const old = this.figureHolder.children[0];
      old.geometry.dispose();
      old.material.dispose();
      this.figureHolder.remove(old);
    }
    if (points) this.figureHolder.add(closedCurve(points, this.theme.curve, { linewidth: 2, opacity: 0.95 }));
  }

  showFigure(on) { if (this.figureHolder) this.figureHolder.visible = on; }

  // Record where the followed body is against the stars: `v` is its direction
  // in the frame of the sphere of the fixed stars.
  recordTrail(v) {
    if (!this.trail) return;
    const r = R_STARS - 0.04, x = v[0] * r, y = v[1] * r, z = v[2] * r;
    if (this.trail.distanceSqFromLast(x, y, z) > 0.0016) this.trail.push(x, y, z);
  }

  clearTrail() { if (this.trail) this.trail.clear(); }

  // How much of the day's light there is, from 0 (night) to 1: the stars go out as it comes.
  setDaylight(k) {
    if (!this.root) return;
    this.daylight = k;
    for (const points of this.stars.children) {
      points.material.opacity = points.material.userData.base * (1 - k);
      points.visible = k < 0.97;
    }
  }

  // The point on the ring of sphere i from which the line to its mover is
  // drawn: the point of the ring that lies nearest, on the page, to `toward`
  // (the mover's mark), or with no `toward` the point furthest to the right.
  // `rect` is the stage's box on the page. Null if that sphere is not drawn.
  //
  // The point is looked for on the ring as a circle in space, not among points
  // fixed in the sphere. Points fixed in the sphere go round with it, and
  // choosing among them made the end of the line slide along the ring and jump
  // back many times a second on any sphere that turns quickly. The nearest
  // point is used because it stays put when a ring seen almost edge-on tilts
  // a little, where the rightmost point swings from one end of it to the other.
  ringPoint(i, camera, rect, toward = null) {
    if (!this.root || !this.drawn[i]) return null;
    const r = this.radii[i];
    // The ring's plane as it now lies: its normal is the sphere's axis, carried by all the spheres outside it.
    const n = vec(this.system.spheres[i].axis).transformDirection(this.frames[i].matrixWorld);
    // Two directions in that plane, taken from the camera and not from the sphere.
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const u = right.clone().addScaledVector(n, -right.dot(n));
    if (u.lengthSq() < 1e-8) u.setFromMatrixColumn(camera.matrixWorld, 1).addScaledVector(n, -u.dot(n));   // the ring is seen edge-on from the side
    u.normalize();
    const v = new THREE.Vector3().crossVectors(n, u);
    const p = new THREE.Vector3();
    const page = (angle) => {
      p.copy(u).multiplyScalar(r * Math.cos(angle)).addScaledVector(v, r * Math.sin(angle)).project(camera);
      return { x: rect.left + ((p.x + 1) / 2) * rect.width, y: rect.top + ((1 - p.y) / 2) * rect.height, behind: p.z >= 1 };
    };
    // What is to be made as small as possible: the distance to the mark, or how far short of the right the point falls.
    const cost = (angle) => {
      const q = page(angle);
      return toward ? Math.hypot(q.x - toward.x, q.y - toward.y) : -q.x;
    };
    // Look all round the ring first, then close in on the best place by golden-section search.
    const N = 48;
    let best = 0, least = Infinity;
    for (let k = 0; k < N; k++) {
      const c = cost((2 * Math.PI * k) / N);
      if (c < least) { least = c; best = k; }
    }
    const g = (Math.sqrt(5) - 1) / 2, step = (2 * Math.PI) / N;
    let lo = (best - 1) * step, hi = (best + 1) * step;
    let a = hi - g * (hi - lo), b = lo + g * (hi - lo);
    let fa = cost(a), fb = cost(b);
    for (let k = 0; k < 26; k++) {
      if (fa > fb) { lo = a; a = b; fa = fb; b = lo + g * (hi - lo); fb = cost(b); }
      else { hi = b; b = a; fb = fa; a = hi - g * (hi - lo); fa = cost(a); }
    }
    const found = page((lo + hi) / 2);
    return found.behind ? null : { x: found.x, y: found.y };
  }

  // show: { trail, figure, shells, sight, labels, stars }; lit: indices of the spheres
  // picked out, or null; dim: how far the others fade (1 = not at all).
  setLook(show, lit, dim = 0.2) {
    this.show = show;
    this.lit = lit && lit.length ? lit : null;
    this.dim = dim;
    if (this.root) this.applyLook();
  }

  applyLook() {
    if (!this.show) return;
    const { show, lit } = this;
    this.materials.forEach((mats, i) => {
      const k = !lit || lit.includes(i) ? 1 : this.dim;
      for (const m of mats) { m.transparent = true; m.opacity = m.userData.base * k; }
    });
    for (const s of this.shells) s.visible = show.shells;
    const one = lit && lit.length === 1 && this.drawn[lit[0]] ? lit[0] : null;
    this.pointer.visible = one !== null;
    if (one !== null) {
      if (this.pointer.parent) this.pointer.parent.remove(this.pointer);
      this.frames[one].add(this.pointer);
      this.pointer.scale.setScalar(this.radii[one]);
      this.pointer.material.color.set(this.colour(this.system.spheres[one]));
    }
    this.stars.visible = show.stars;
    if (this.trail) this.trail.object.visible = show.trail;
    if (this.sight) this.sight.visible = show.sight;
    this.showLabels();
  }
}
