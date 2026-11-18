// Draws the heaven of the Timaeus as the text describes its making (36b-d),
// which is the making of an armillary sphere: the body of the world as a
// sphere; the band of the Same round its equator; the Different slanted across
// it and split into seven circles, each with its star; the Earth in the middle.
// The viewer stands outside the whole, or on the ground at its centre.
//
// - The Same's band is drawn at rest. It turns in its own plane, so a band
//   drawn turning would look no different.
// - Everything else turns with the Same: the fixed stars, the slanted path the
//   seven keep to among them, the seven circles, and the stars on the circles.
// - From the ground no circles are drawn, only what is seen: the fixed stars,
//   the seven, and faintly the path they keep to.
//
// In the sequence the heaven is shown only as far as it has been made. Four
// things come late in the telling, and each can be left out or brought in
// while a step plays: the Sun's light (39b), the fixed stars (40a), a soul for
// every star (41d), and the sowing of those souls in the Earth, the Moon and
// the other instruments of time (42d).
//
// Sizes are for legibility, except the proportions of the seven circles to
// one another, which come from the reading chosen (model.SIZES).

import * as THREE from 'three';
import {
  frame, setOrientation, ring, band, parallel, shell, body, rod, aim, label, Trail, starField, onZodiac, dispose, vec,
} from '../../stage/parts.js';
import { STARS, NAMED_STARS } from '../../stage/stars.js';

export const R_ALL = 10;        // the body of the world, and on it the fixed stars
export const R_OUT = 8.9;       // the outermost of the seven circles
export const BAND = 2.2;        // half the width of each of the two bands, in degrees
const TRAIL_POINTS = 24000;
const FAINTEST_OUTSIDE = 3.7;   // from outside only the brighter stars are drawn
const SOUL_DEPTH = 0.32;        // how far inside its star a soul is drawn
const UP = new THREE.Vector3(0, 1, 0);

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
const span = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;

// A round dot that is solid out to `solid` of its radius and fades from there.
function dot(solid) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const g = canvas.getContext('2d');
  const fade = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  fade.addColorStop(0, 'rgba(255,255,255,1)');
  if (solid > 0) fade.addColorStop(solid, 'rgba(255,255,255,1)');
  fade.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = fade;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// A repeatable scatter, so that the picture is the same every time.
function scatter(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class TimaeusView {
  constructor(stage) {
    this.stage = stage;
    this.root = null;
    this.show = null;
    this.lit = null;
  }

  // focus: the id of the star being followed, or null;
  // eye: 'outside', or 'ground' with `zenith` the direction straight overhead;
  // right: the level direction that lies to the viewer's right from outside,
  // used only to put the two bands' names where they can be read;
  // lacks: what has not yet been made, any of 'light' and 'stars';
  // souls: whether the souls given to the stars are to be drawn (see setArrival);
  // extent: how far from the centre the viewer is to see.
  build(model, { theme, focus = null, eye = 'outside', zenith = null, right = [0, 1, 0], lacks = [], souls = false, extent = R_ALL }) {
    this.clear();
    const ground = this.ground = eye === 'ground';
    this.zenith = ground ? vec(zenith) : null;
    this.daylight = 0;
    this.alight = lacks.includes('light') ? 0 : 1;      // how far the Sun's light has been kindled
    this.starry = lacks.includes('stars') ? 0 : 1;      // how far the fixed stars have come out
    this.small = false;                                 // whether the stage is too small on screen for every name
    this.frameSize = new THREE.Vector2();
    this.given = 0;                                     // how many of the souls have been given their stars
    this.sowing = 0;                                    // how far the souls have gone from their stars to where they are sown
    this.model = model;
    this.theme = theme;
    this.focus = focus;
    const b = model.basis, circles = model.circles;
    const same = theme.roles.daily, different = theme.roles.zodiacal;
    const root = this.root = new THREE.Group();
    this.stage.cosmos.add(root);
    this.stage.setExtent(extent);
    this.labels = [];
    this.starLabels = [];
    const add = (text, cls, where, parent) => {
      const l = label(text, cls);
      l.position.copy(where);
      parent.add(l);
      this.labels.push(l);
      return l;
    };

    // Turning with the Same: the fixed stars and, among them, the frame of the
    // Different. In that frame z is the Different's pole and x is one of the
    // two places where the bands cross, so a star that has gone an angle a
    // round its circle of radius r stands at (r cos a, r sin a, 0).
    this.heaven = frame();
    root.add(this.heaven);
    const slant = this.slant = new THREE.Group();
    slant.matrixAutoUpdate = false;
    slant.matrix.makeBasis(vec(b.x), vec(b.y), vec(b.pole));
    this.heaven.add(slant);

    // From the ground the stars are the sky; from outside they only mark the
    // sphere of the whole, so fewer are drawn, and fainter.
    const scale = this.stage.renderer.getPixelRatio();
    this.stars = starField(STARS, b, R_ALL, theme.ink, ground ? { scale } : { scale, size: 0.62, opacity: 0.55, faintest: FAINTEST_OUTSIDE });
    this.heaven.add(this.stars);
    if (ground) {
      for (const [name, lon, lat] of NAMED_STARS) this.starLabels.push(add(name, 'star', onZodiac(b, lon, lat).multiplyScalar(R_ALL), this.heaven));
    }

    // The path the seven keep to among the fixed stars: where the plane of the
    // Different meets the sphere of the whole.
    slant.add(band(R_ALL - 0.03, [0, 0, 1], BAND, different, { opacity: ground ? 0.1 : 0.16 }));
    slant.add(ring(R_ALL - 0.03, [0, 0, 1], different, { tube: 0.012, opacity: 0.5 }));

    // The seven circles and the star on each.
    this.materials = {};
    this.lights = {};
    this.radii = {};
    this.glow = null;
    circles.forEach((c, k) => {
      const r = R_OUT * c.radius;
      this.radii[c.id] = ground ? R_ALL - 0.1 : r;
      // Where circles lie close together, they and their stars are drawn finer:
      // nothing is larger than the room between a circle and its neighbours allows.
      const inner = k ? R_OUT * circles[k - 1].radius : 0;
      const outer = k < circles.length - 1 ? R_OUT * circles[k + 1].radius : R_ALL;
      const room = Math.min(r - inner, outer - r);
      if (!ground) {
        const followed = c.id === focus, fine = Math.min(1, room / 0.8);
        const circle = ring(r, [0, 0, 1], different, { tube: (followed ? 0.04 : 0.024) * fine, opacity: followed ? 1 : 0.72 });
        circle.material.userData.base = circle.material.opacity;
        this.materials[c.id] = [circle.material];
        slant.add(circle);
      }
      const size = ground ? 0.1 * c.size : Math.min(0.17 * c.size, 0.3 * room);
      const star = body(size, c.colors[theme.name], 0.55);
      add(c.name, c.id === focus ? 'major' : 'minor', new THREE.Vector3(), star);
      slant.add(star);
      this.lights[c.id] = star;
      if (c.id === 'sun' && !ground) {
        // The light kindled in the second circle (39b): a glow about the Sun's body.
        this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot(0), color: c.colors[theme.name], transparent: true, opacity: 0, depthWrite: false }));
        this.glow.scale.setScalar(9 * size);
        star.add(this.glow);
      }
    });

    // The path of the star being followed, as the Earth sees it: drawn at rest,
    // so that with the Same turning it is wound into a spiral (39a).
    this.trail = null;
    const followed = circles.find((c) => c.id === focus);
    if (followed) {
      this.trail = new Trail(TRAIL_POINTS, followed.colors[theme.name], { linewidth: 1.6, opacity: 0.85 });
      root.add(this.trail.object);
    }

    this.shell = null;
    this.earth = null;
    this.day = null;
    if (ground) {
      // The ground underfoot, the four quarters of the horizon, and the one point of the sky that does not move.
      const up = vec(zenith);
      const floor = new THREE.Mesh(new THREE.CircleGeometry(R_ALL * 1.6, 96), new THREE.MeshBasicMaterial({ color: theme.ground, side: THREE.DoubleSide, fog: false }));
      floor.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), up);
      root.add(floor);
      const northward = new THREE.Vector3(0, 0, 1).addScaledVector(up, -up.z).normalize();
      const eastward = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), up).normalize();
      for (const [name, d] of [['north', northward], ['east', eastward], ['south', northward.clone().negate()], ['west', eastward.clone().negate()]]) {
        add(name, 'compass', d.clone().multiplyScalar(R_ALL).addScaledVector(up, 0.3), root).center.set(0.5, 1);
      }
      const pole = body(0.035, theme.axis, 0.9);
      pole.position.set(0, 0, R_ALL);
      root.add(pole);
      add('the pole', 'minor', new THREE.Vector3(0, 0, R_ALL), root);
    } else {
      // At rest: the body of the world, the band of the Same, the Earth and the axis.
      this.shell = shell(R_ALL, theme.ink, 0.03);
      root.add(this.shell);
      const strip = band(R_ALL, [0, 0, 1], BAND, same, { opacity: 0.34 });
      const edges = [-1, 1].map((s) => parallel(R_ALL, s * BAND, same, { tube: 0.016, opacity: 0.9 }));
      root.add(strip, ...edges);
      this.materials.same = [strip.material, ...edges.map((e) => e.material)];
      for (const m of this.materials.same) m.userData.base = m.opacity;

      // The two bands' names: the Same's at rest on the near left of its band,
      // the Different's on the slanted path, just before the crossing that faces the viewer.
      const r = vec(right), towards = new THREE.Vector3().crossVectors(r, new THREE.Vector3(0, 0, 1));
      add('the Same', 'band', r.clone().multiplyScalar(-0.9).addScaledVector(towards, 0.43).normalize().multiplyScalar(R_ALL + 0.25), root);
      const a = -30 * (Math.PI / 180);
      add('the Different', 'band', new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(R_ALL + 0.25), slant);

      const size = Math.min(0.45, 0.36 * R_OUT * circles[0].radius);
      const earth = this.earth = body(size, theme.earth, 0.15);
      add('Earth', 'minor', new THREE.Vector3(), earth);
      root.add(earth);
      // The half of the Earth that faces the Sun, once the Sun is alight: night and day (39c, 40c).
      this.day = new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.02, 32, 12, 0, 2 * Math.PI, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.earth).lerp(new THREE.Color('#ffffff'), 0.6), transparent: true, opacity: 0 }),
      );
      earth.add(this.day);
      const axis = rod(2 * (R_ALL + 0.9), theme.axis, { thick: 0.02, opacity: 0.55 });
      aim(axis, new THREE.Vector3(0, 0, 1));
      axis.position.set(0, 0, -(R_ALL + 0.9));
      root.add(axis);
      add('the axis', 'minor', new THREE.Vector3(0, 0, R_ALL + 0.9), root);
    }

    // A soul for every star that is drawn, each beside its own star (41d-e),
    // and the place where each is to be sown (42d). How many go where is not
    // said: a third are given to the Earth, a third to the Moon, and a third
    // are shared among the other six.
    this.souls = null;
    if (souls && !ground) {
      const rand = scatter(11), homes = [], order = [];
      for (const [lon, lat, mag] of STARS) {
        if (mag > FAINTEST_OUTSIDE) continue;
        homes.push(onZodiac(b, lon, lat).multiplyScalar(R_ALL - SOUL_DEPTH));
        order.push(rand());
      }
      // In no order of place: the stars are given their souls here and there over the whole heaven.
      const turn = homes.map((_, i) => i).sort((i, j) => order[i] - order[j]);
      const n = homes.length;
      this.soulHome = turn.map((i) => homes[i]);
      this.soulSeat = turn.map((_, k) => (k % 3 === 0 ? -1 : k % 3 === 1 ? 0 : 1 + (((k - 2) / 3) % 6)));   // -1 the Earth, else the place of a circle among the seven
      this.soulAside = turn.map(() => {
        const u = 2 * rand() - 1, a = 2 * Math.PI * rand(), s = Math.sqrt(1 - u * u);
        return new THREE.Vector3(s * Math.cos(a), s * Math.sin(a), u).multiplyScalar(0.16 + 0.2 * rand());
      });
      this.soulWhen = turn.map(() => rand());
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * n), 3));
      this.souls = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 5 * scale, sizeAttenuation: false, color: theme.curve, map: dot(0.5), transparent: true, opacity: 0.95, depthWrite: false,
      }));
      this.souls.frustumCulled = false;
      this.souls.renderOrder = 3;
      this.heaven.add(this.souls);
    }

    for (const l of this.labels) this.stage.trackLabel(l);
    this.applyLook();
  }

  clear() {
    if (!this.root) return;
    for (const l of this.labels) this.stage.untrackLabel(l);
    dispose(this.root);
    this.root = null;
    this.trail = null;
    this.souls = null;
  }

  // heaven: the orientation of the whole heaven (model.heaven);
  // longitudes: for each of the seven, how far round its circle it is, in radians.
  update({ heaven, longitudes }) {
    if (!this.root) return;
    setOrientation(this.heaven, heaven);
    for (const c of this.model.circles) {
      const a = longitudes[c.id], r = this.radii[c.id];
      this.lights[c.id].position.set(r * Math.cos(a), r * Math.sin(a), 0);
    }
    if (this.day) {
      // The lit half of the Earth is the half towards the Sun.
      const sun = new THREE.Vector3().copy(this.lights.sun.position).applyMatrix4(this.slant.matrix).applyMatrix4(this.heaven.matrix);
      this.day.quaternion.setFromUnitVectors(UP, sun.normalize());
    }
    if (this.souls) this.placeSouls();
    // On a small stage the names would lie on top of one another, so only the larger ones are kept.
    const size = this.stage.renderer.getSize(this.frameSize), small = Math.min(size.x, size.y) < 340;
    if (this.ground || small !== this.small) { this.small = small; this.showLabels(); }
  }

  // Where each soul is: beside its star, or on its way to where it is sown,
  // or there. All in the frame that turns with the Same.
  placeSouls() {
    const at = this.souls.geometry.attributes.position, seat = new THREE.Vector3(), p = new THREE.Vector3();
    const circles = this.model.circles;
    for (let i = 0; i < this.soulHome.length; i++) {
      p.copy(this.soulHome[i]);
      // They leave a few at a time, and each takes a little under half the step to arrive.
      const gone = this.sowing > 0 ? ease(span(this.sowing, 0.58 * this.soulWhen[i], 0.58 * this.soulWhen[i] + 0.42)) : 0;
      if (gone > 0) {
        const k = this.soulSeat[i];
        if (k < 0) seat.set(0, 0, 0);
        else seat.copy(this.lights[circles[k].id].position).applyMatrix4(this.slant.matrix);
        // Sown, a soul is drawn just outside the body it was sown in, so that it can still be seen.
        const host = k < 0 ? this.earth : this.lights[circles[k].id];
        const out = host.geometry.parameters.radius + this.soulAside[i].length();
        seat.addScaledVector(this.soulAside[i], out / this.soulAside[i].length());
        p.lerp(seat, gone);
      }
      at.setXYZ(i, p.x, p.y, p.z);
    }
    at.needsUpdate = true;
    this.souls.geometry.setDrawRange(0, Math.round(this.given * this.soulHome.length));
  }

  // What is coming to be while a step of the sequence plays, and how far it
  // has come, from 0 to 1: the Sun's 'light', the fixed 'stars', the 'souls'
  // given to the stars, or the souls 'sown'.
  setArrival(name, p) {
    if (!this.root) return;
    if (name === 'light') this.alight = ease(span(p, 0.08, 0.9));
    if (name === 'stars') this.starry = span(p, 0.04, 0.96);
    if (name === 'souls') this.given = span(p, 0.04, 0.82);
    if (name === 'sown') { this.given = 1; this.sowing = span(p, 0.03, 0.97); }
    this.paint();
  }

  // Which names show. From the ground: none of what is below the horizon, and
  // no stars' names by day.
  showLabels() {
    const show = this.show || { labels: true, stars: true };
    const p = new THREE.Vector3();
    for (const l of this.labels) {
      let visible = show.labels && !(this.small && !this.ground && l.element.classList.contains('minor'));
      if (visible && this.ground) {
        l.getWorldPosition(p);
        this.root.worldToLocal(p);
        visible = p.dot(this.zenith) > -0.01 * p.length();
      }
      l.visible = visible;
    }
    for (const l of this.starLabels) l.visible = l.visible && show.stars && this.daylight < 0.5 && this.starry > 0.9;
  }

  // Record where the followed star is: `v` is its direction as the Earth sees it.
  recordTrail(v) {
    if (!this.trail) return;
    const r = this.radii[this.focus] - (this.ground ? 0.03 : 0), x = v[0] * r, y = v[1] * r, z = v[2] * r;
    // A point for every degree and a quarter or so, whatever the size of the circle.
    if (this.trail.distanceSqFromLast(x, y, z) > (0.022 * r) ** 2) this.trail.push(x, y, z);
  }

  clearTrail() { if (this.trail) this.trail.clear(); }

  // How much of the day's light there is, from 0 (night) to 1: the stars go out as it comes.
  setDaylight(k) {
    if (!this.root) return;
    this.daylight = k;
    this.paint();
  }

  // Sets everything whose brightness depends on what has been made, on the
  // daylight and on what is picked out: the fixed stars, the Sun's light, and
  // the lit half of the Earth.
  paint() {
    const shown = !this.show || this.show.stars;
    // The stars come out brightest first, and go out as daylight comes.
    const kinds = this.stars.children.length;
    this.stars.children.forEach((points, k) => {
      const out = clamp01(this.starry * (1 + 0.5 * (kinds - 1)) - 0.5 * k);
      const base = Math.min(1, points.material.userData.base * (this.lit === 'stars' ? 1.7 : 1));
      points.material.opacity = base * (1 - this.daylight) * out;
      points.visible = out > 0 && this.daylight < 0.97;
    });
    this.stars.visible = shown && this.starry > 0;
    this.lights.sun.material.emissiveIntensity = lerp(0.55, 0.95, this.alight);
    if (this.glow) this.glow.material.opacity = 0.5 * this.alight;
    if (this.day) {
      this.day.visible = this.alight > 0;
      this.day.material.opacity = 0.9 * this.alight;
    }
  }

  // show: { trail, labels, stars }; lit: what is picked out, or null. It may
  // be one circuit ('same' or one of the seven), or one of the gods that are
  // in the picture: the 'world', the 'seven', the 'stars' or the 'earth'.
  setLook(show, lit) {
    this.show = show;
    this.lit = lit;
    if (this.root) this.applyLook();
  }

  applyLook() {
    if (!this.show) return;
    const { show, lit } = this;
    const one = lit && this.materials[lit] ? lit : null;
    const dimmed = (id) => {
      if (one) return one !== id;
      if (lit === 'seven') return id === 'same';
      return lit === 'stars' || lit === 'earth';
    };
    for (const [id, mats] of Object.entries(this.materials)) {
      for (const m of mats) { m.transparent = true; m.opacity = m.userData.base * (dimmed(id) ? 0.3 : 1); }
    }
    if (this.shell) this.shell.material.opacity = lit === 'world' ? 0.1 : 0.03;
    if (this.earth) {
      this.earth.material.emissiveIntensity = lit === 'earth' ? 0.7 : 0.15;
      this.earth.scale.setScalar(lit === 'earth' ? 1.4 : 1);
    }
    if (this.trail) this.trail.object.visible = show.trail;
    this.paint();
    this.showLabels();
  }
}
