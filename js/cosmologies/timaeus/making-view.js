// Draws the making of the world as Timaeus tells it, from the turmoil the
// maker took over to the soul's two circles (30a-36e), one act at a time. Each
// act runs from 0 to 1 and begins where the one before it ended:
//
//   turmoil   all that was visible, moving without measure or order (30a). It is a
//             swarm of no kind: the four kinds are the maker's work and come later.
//   gather    what was scattered drawn together into one whole (30b-31b)
//   elements  fire and earth made, then air and water between them, and the four
//             bound by one proportion (31b-32c)
//   all       the whole of each used up, and nothing left outside (32c-33b)
//   sphere    the body turned into a sphere, smooth all round (33b-d)
//   spin      the sphere set turning in its own place (34a)
//   ensouled  soul set in the middle, stretched through the whole, wrapped round it (34b)
//   mix       the soul's stuff mixed from Being, the Same and the Different (35a)
//   divide    marked off by 1, 2, 3, 4, 8, 9, 27, and the intervals filled (35b-36b)
//   split     the whole split lengthwise in two (36b)
//   cross     the two laid across each other at their middles, like a chi (36b)
//   bend      each bent round into a circle and joined opposite the crossing (36c)
//   turn      the outer named for the Same, the inner for the Different, and set turning (36c)
//   seven     the inner split in six places into seven unequal circles (36d)
//   whole     the body fitted inside the soul, centre to centre (36d-e)
//   tell      what the soul's two circles tell it: firm and true opinions from the
//             Different, understanding and knowledge from the Same (37a-c)
//   image     the heaven turning, a moving likeness of eternity, with nothing in it
//             yet that can count (37c-38c)
//   planets   a body made for each of the seven and set in its circle (38c-d)
//
// What is drawn is the story as Timaeus tells it. Whether it is meant as a
// story of things that happened is disputed (reference/notes/timaeus-model.md).
// Speeds from `turn` onwards only show which way each thing turns; their true
// proportions are in the heaven itself (heaven-view.js), which the sequence
// goes over to once the seven are in their circles.

import * as THREE from 'three';
import { shell, body, rod, aim, label, dispose, vec } from '../../stage/parts.js';
import { SOUL } from './model.js';
import { ACTS } from './sequence.js';
import { R_ALL, R_OUT, BAND } from './heaven-view.js';

const R = R_ALL;
const R_INNER = 9.72;                                   // the inner of the two circles lies just inside the outer
const HALF = R * Math.tan((BAND * Math.PI) / 180);      // half the width of one strip
const GAP = 0.55;                                       // how far apart the two halves are drawn once split
const N = 240;                                          // pieces along a strip
const SPECKS = 1500;
// How far out the specks of the body lie at each stage: astray, drawn together,
// with nothing left outside, and as a sphere. The first three are shapeless
// clouds, bulging here and hollow there.
const ASTRAY = 13.2, GATHERED = 10.4, COMPACT = 9.4, BALL = 8.8;
const KINDS = ['fire', 'air', 'water', 'earth'];       // in the order of the proportion (32b)
const PLACES = [-6.6, -2.2, 2.2, 6.6];                  // where each kind stands in the row that shows the proportion
const BODILY = ['turmoil', 'gather', 'elements', 'all', 'sphere', 'spin', 'ensouled', 'whole'];
// The acts played over the finished soul and body, which stay as `whole` left them.
const LATER = ['tell', 'image', 'planets'];
// What Timaeus calls the four of the seven that he names (38c-d). The other three he leaves unnamed.
const NAMED = { moon: 'the Moon', sun: 'the Sun', venus: 'the Morning Star', mercury: 'the star sacred to Hermes' };
const BEAD = 0.11;                                      // the mark on each of the seven circles, before it is a star
const SAME_TURN = (2 * Math.PI) / 16;                   // radians a second: for show only
const DIFFERENT_TURN = (2 * Math.PI) / 44;
const DAYS = 10;                                        // days of the model per second, for the marks on the seven circles

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
const span = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
// Up between a and b, and down again before b is passed.
const bump = (x, a, b) => ease(span(x, a, a + 0.08)) * (1 - ease(span(x, b - 0.08, b)));

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

// One strip of the soul's stuff. Flat, it lies in the plane that faces the
// viewer at the place where the two strips will cross; bent, it curls back
// round the centre until it closes into a circle. Its marks are the seven
// numbers and then the rest of the scale, placed along it by their size.
class Strip {
  constructor(color, ink) {
    Object.assign(this, { radius: R, theta: 0, offset: 0, bend: 0, grow: 1, shift: 0, shown: 0 });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 2 * 3), 3));
    const index = [];
    for (let i = 0; i < N; i++) { const a = 2 * i; index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    geometry.setIndex(index);
    this.band = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false }));
    this.band.frustumCulled = false;

    this.values = [...SOUL.marks, ...SOUL.scale.filter((v) => !SOUL.marks.includes(v))];
    const marks = new THREE.BufferGeometry(), at = [];
    marks.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.values.length * 4 * 3), 3));
    this.values.forEach((v, k) => { const a = 4 * k; at.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); });
    marks.setIndex(at);
    this.ticks = new THREE.Mesh(marks, new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    this.ticks.frustumCulled = false;
    this.ticks.renderOrder = 2;
  }

  get length() { return 2 * Math.PI * this.radius; }

  // Where a number stands along the strip: 1 at one end, 27 at the other.
  place(value) {
    const L = this.length, s = -L / 2 + (L * (value - 1)) / 26;
    if (!this.shift) return s;
    return ((((s + this.shift + L / 2) % L) + L) % L) - L / 2;   // round the circle, once it is one and turning
  }

  // The point at s along the strip (0 at its middle) and w across it (-1 to 1 at its edges).
  point(s, w, out) {
    const c = Math.cos(this.theta), n = Math.sin(this.theta);
    let along = s, back = 0;
    if (this.bend > 1e-5) {
      const rho = this.radius / this.bend, a = s / rho;
      along = rho * Math.sin(a);
      back = rho * (1 - Math.cos(a));
    }
    const across = this.offset + w * HALF;
    out[0] = this.radius - back;
    out[1] = along * c - across * n;
    out[2] = along * n + across * c;
    return out;
  }

  update() {
    const q = [0, 0, 0], p = this.band.geometry.attributes.position, half = (this.length / 2) * this.grow;
    for (let i = 0; i <= N; i++) {
      const s = -half + (2 * half * i) / N;
      this.point(s, -1, q); p.setXYZ(2 * i, q[0], q[1], q[2]);
      this.point(s, 1, q); p.setXYZ(2 * i + 1, q[0], q[1], q[2]);
    }
    p.needsUpdate = true;
    const t = this.ticks.geometry.attributes.position;
    this.values.forEach((v, k) => {
      const s = this.place(v), d = k < 7 ? 0.085 : 0.035, reach = k < 7 ? 1 : 0.68;
      [[s - d, -reach], [s - d, reach], [s + d, -reach], [s + d, reach]].forEach(([ss, w], j) => {
        this.point(ss, w, q);
        t.setXYZ(4 * k + j, q[0], q[1], q[2]);
      });
    });
    t.needsUpdate = true;
    this.ticks.geometry.setDrawRange(0, Math.round(this.shown) * 6);
  }

  // How far from the centre the strip reaches.
  reach() {
    const q = [0, 0, 0], half = (this.length / 2) * this.grow;
    let far = 0;
    for (let i = 0; i <= 24; i++) {
      this.point(-half + (2 * half * i) / 24, 0, q);
      far = Math.max(far, Math.hypot(q[0], q[1], q[2]));
    }
    return far;
  }
}

export class MakingView {
  constructor(stage) {
    this.stage = stage;
    this.root = null;
  }

  // right: the level direction on the viewer's right in the finished heaven,
  // used only to put the Same's name where it can be read.
  build(model, { theme, right = [0, 1, 0] }) {
    this.clear();
    this.model = model;
    this.theme = theme;
    this.showLabels = true;
    const b = model.basis, soul = theme.curve;
    const root = this.root = new THREE.Group();
    this.stage.cosmos.add(root);
    this.labels = [];
    const add = (text, cls, where, parent) => {
      const l = label(text, cls);
      l.position.copy(where);
      parent.add(l);
      this.labels.push(l);
      return l;
    };

    // The clocks of the things that keep moving once an act is over.
    this.time = { wild: 0, spin: 0, same: 0, carried: 0, different: 0, days: 0 };

    // ----- the body: a swarm of no kind, then the four kinds, then a sphere -----
    // Each speck keeps one direction from the middle and one depth along it
    // throughout. What changes from act to act is how far out the whole lies.
    const rand = scatter(7);
    this.dir = new Float32Array(SPECKS * 3);
    this.depth = new Float32Array(SPECKS);      // 0 at the middle, 1 at the edge, spread so as to fill a ball evenly
    this.lump = new Float32Array(SPECKS);       // how far the shapeless cloud bulges in this speck's direction
    this.stray = new Float32Array(SPECKS);      // for the few still outside once the rest are gathered: how far out; else 0
    this.sway = new Float32Array(SPECKS * 18);  // three swayings on each axis: a speed and a starting point for each
    for (let i = 0; i < SPECKS; i++) {
      const u = 2 * rand() - 1, a = 2 * Math.PI * rand(), s = Math.sqrt(1 - u * u);
      const x = s * Math.cos(a), y = s * Math.sin(a), z = u;
      this.dir.set([x, y, z], 3 * i);
      this.depth[i] = Math.cbrt(rand());
      this.lump[i] = 1 + 0.2 * Math.sin(2.3 * x + 1.1) * Math.cos(1.7 * y - 0.4) + 0.12 * Math.sin(3.1 * z + 2);
      this.stray[i] = rand() < 0.11 ? 12.4 + 2.4 * rand() : 0;
      for (let k = 0; k < 3; k++) {
        // A slow surge, a quicker swing and a fast quiver.
        this.sway.set([0.3 + 0.6 * rand(), 2 * Math.PI * rand(), 1.6 + 2 * rand(), 2 * Math.PI * rand(), 7 + 8 * rand(), 2 * Math.PI * rand()], 18 * i + 6 * k);
      }
    }
    // The swarm has no colour of its own. Each kind's colour comes with the kind.
    this.plain = new THREE.Color(theme.ink).lerp(new THREE.Color(theme.bg), 0.42);
    this.kindColours = KINDS.map((k) => new THREE.Color(theme.elements[k]));
    this.along = vec(right);
    const dust = new THREE.BufferGeometry();
    dust.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPECKS * 3), 3));
    dust.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPECKS * 3), 3));
    this.specks = new THREE.Points(dust, new THREE.PointsMaterial({
      size: 3.2 * this.stage.renderer.getPixelRatio(), sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false,
    }));
    this.specks.frustumCulled = false;
    this.frame = new THREE.Vector2();           // the size of the stage on screen, by which the specks are sized
    this.bodyFrame = new THREE.Group();
    this.bodyFrame.add(this.specks);
    root.add(this.bodyFrame);
    // The four kinds named in a row, in the order of the proportion that binds them.
    this.kindNames = KINDS.map((name, k) => {
      const l = add(name, 'band', this.along.clone().multiplyScalar(PLACES[k]).add(new THREE.Vector3(0, 0, -5.6)), root);
      l.center.set(0.5, 0);
      return l;
    });
    this.proportion = add('as fire is to air, so is air to water, and water to earth', 'minor', new THREE.Vector3(0, 0, 6.3), root);
    this.proportion.center.set(0.5, 1);

    this.shell = shell(R, theme.ink, 0.03);
    root.add(this.shell);
    this.axis = rod(2 * (R + 0.9), theme.axis, { thick: 0.02, opacity: 0.55 });
    aim(this.axis, new THREE.Vector3(0, 0, 1));
    this.axis.position.set(0, 0, -(R + 0.9));
    root.add(this.axis);
    this.axisName = add('the axis', 'minor', new THREE.Vector3(0, 0, R + 0.9), root);

    // ----- the soul, set in the middle and stretched to the outside -----
    this.halo = shell(1, soul, 0.1);
    this.core = body(0.34, soul, 0.9);
    root.add(this.halo, this.core);
    this.soulName = add('soul', 'band', new THREE.Vector3(0, 0, 0), this.core);

    // ----- the mixing: an undivided and a divided kind of Being, of the Same and of the Different -----
    this.blobs = [];
    for (let kind = 0; kind < 3; kind++) {
      for (const row of [1, -1]) {
        const tint = new THREE.Color(soul).lerp(new THREE.Color(row > 0 ? '#ffffff' : '#000000'), row > 0 ? 0.5 : 0.38);
        const mesh = body(0.95, tint, 0.55);
        root.add(mesh);
        this.blobs.push({ mesh, kind, row, tint });
      }
    }
    this.mixNames = [
      ...['Being', 'the Same', 'the Different'].map((name, k) => {
        const l = add(name, 'band', new THREE.Vector3(R, 7 * (k - 1), 5.3), root);
        l.center.set(0.5, 1);
        return l;
      }),
      ...[['undivided', 3.4], ['divided among bodies', -3.4]].map(([name, z]) => {
        const l = add(name, 'minor', new THREE.Vector3(R, -8.7, z), root);
        l.center.set(1, 0.5);
        return l;
      }),
    ];

    // ----- the two strips. The second turns with the Same once the Same has the mastery. -----
    this.heaven = new THREE.Group();
    root.add(this.heaven);
    this.A = new Strip(soul, theme.ink);
    this.B = new Strip(soul, theme.ink);
    root.add(this.A.band, this.A.ticks);
    this.heaven.add(this.B.band, this.B.ticks);
    this.numbers = SOUL.marks.map((n) => {
      const l = add(String(n), 'minor', new THREE.Vector3(), root);
      l.center.set(0.5, 1);
      return l;
    });

    const r = vec(right), towards = new THREE.Vector3().crossVectors(r, new THREE.Vector3(0, 0, 1));
    this.sameName = add('the Same', 'band', r.clone().multiplyScalar(-0.9).addScaledVector(towards, 0.43).normalize().multiplyScalar(R + 0.25), root);
    const slant = this.slant = new THREE.Group();
    slant.matrixAutoUpdate = false;
    slant.matrix.makeBasis(vec(b.x), vec(b.y), vec(b.pole));
    this.heaven.add(slant);
    const a = -30 * (Math.PI / 180);
    this.differentName = add('the Different', 'band', new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(R + 0.25), slant);

    // ----- the seven circles, and a mark on each to show how fast it turns -----
    const gold = theme.roles.zodiacal;
    this.inkColour = new THREE.Color(theme.ink);
    this.sevens = model.circles.map((c, k) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(R_INNER, 0.024, 8, 160), new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.8 }));
      mesh.userData.radius = R_INNER;
      const bead = body(BEAD, theme.ink, 0.5);
      slant.add(mesh, bead);
      // Once a body is made for it (38c), the mark is a star of its own colour, as large as
      // the finished heaven draws it: no larger than the room between its circle and the next allows.
      const r = R_OUT * c.radius, inner = k ? R_OUT * model.circles[k - 1].radius : 0;
      const outer = k < model.circles.length - 1 ? R_OUT * model.circles[k + 1].radius : R;
      const size = Math.min(0.17 * c.size, 0.3 * Math.min(r - inner, outer - r));
      const name = NAMED[c.id] ? add(NAMED[c.id], 'minor', new THREE.Vector3(), bead) : null;
      return { circle: c, mesh, bead, size, colour: new THREE.Color(c.colors[theme.name]), name };
    });

    // The Earth, by which Timaeus places the circles (38d) before he comes to its making (40b-c).
    this.earth = body(Math.min(0.45, 0.36 * R_OUT * model.circles[0].radius), theme.earth, 0.15);
    root.add(this.earth);
    this.earthName = add('Earth', 'minor', new THREE.Vector3(), this.earth);

    // What each of the two circles tells the soul (37b-c).
    this.told = [
      'the circle of the Different brings firm and true opinions about what is perceived',
      'the circle of the Same brings understanding and knowledge of what is reasoned',
    ].map((text) => {
      const l = add(text, 'band', new THREE.Vector3(0, 0, -(R + 0.4)), root);
      l.center.set(0.5, 0);
      return l;
    });

    this.bodyName = add('the body of the world', 'minor', new THREE.Vector3(0, 0, -(R + 0.4)), root);
    this.bodyName.center.set(0.5, 0);

    for (const l of this.labels) this.stage.trackLabel(l);
  }

  clear() {
    if (!this.root) return;
    for (const l of this.labels) this.stage.untrackLabel(l);
    dispose(this.root);
    this.root = null;
  }

  setLabels(on) { this.showLabels = on; }

  // Let the things that keep moving move on by dt seconds.
  tick(dt, act, p) {
    if (!this.root) return;
    const t = this.time;
    t.wild += dt;
    if (act === 'spin') t.spin += dt * SAME_TURN * ease(p);
    if (act === 'ensouled') t.spin += dt * SAME_TURN;
    if (act === 'turn' || act === 'seven' || act === 'whole' || LATER.includes(act)) {
      const going = act === 'turn' ? ease(span(p, 0.25, 0.6)) : 1;
      t.same -= dt * SAME_TURN * going;                       // east to west
      t.carried -= dt * SAME_TURN * (act === 'turn' ? ease(span(p, 0.7, 1)) : 1);
      t.different += dt * DIFFERENT_TURN * going;             // west to east
      if (act !== 'turn') t.days += dt * DAYS * (act === 'seven' ? ease(span(p, 0.75, 1)) : 1);
    }
  }

  // How far the picture reaches from the centre, for the stage to stand back by.
  extent(act, p) {
    if (act === 'turmoil') return 15.5;
    if (act === 'gather') return lerp(15.5, 14.5, ease(p));
    if (act === 'elements') return 14.5;
    if (act === 'all') return lerp(14.5, 11.5, ease(p));
    if (act === 'sphere') return lerp(11.5, R * 1.05, ease(p));
    if (act === 'mix') return lerp(16, Math.PI * R * 1.06, ease(span(p, 0.78, 1)));
    if (act === 'divide' || act === 'split' || act === 'cross') return Math.PI * R * 1.06;
    if (act === 'bend') return Math.max(R * 1.05, Math.max(this.A.reach(), this.B.reach()) * 1.05);
    return R * 1.05;
  }

  // How far the picture has turned from facing the crossing (0) to standing as the finished heaven does (1).
  turned(act, p) {
    if (act === 'mix') return 1 - ease(span(p, 0, 0.1));
    if (act === 'divide' || act === 'split' || act === 'cross') return 0;
    if (act === 'bend') return ease(span(p, 0.12, 0.9));
    return 1;
  }

  // Set the picture to act `act` at `p` of the way through it.
  show(act, p) {
    if (!this.root) return;
    // A later act is played over the soul and body as `whole` left them.
    const later = LATER.includes(act) ? act : null, played = p;
    if (later) { act = 'whole'; p = 1; }
    const e = ease(p), t = this.time, theme = this.theme, names = this.showLabels;
    const soul = new THREE.Color(theme.curve);
    const after = (name) => ACTS.indexOf(act) > ACTS.indexOf(name);
    const from = (name) => ACTS.indexOf(act) >= ACTS.indexOf(name);

    // ----- the body -----
    const bodily = BODILY.includes(act);
    const frame = this.stage.renderer.getSize(this.frame), across = Math.min(frame.x, frame.y);   // the stage on screen
    this.specks.visible = bodily;
    // How far each kind has come out of the swarm, and how far it stands apart at its place in the row.
    let made = [1, 1, 1, 1], apart = [0, 0, 0, 0];
    if (bodily) {
      // The cloud each speck is moving from and to, how far it has got, and how much it still sways.
      let size = [BALL, BALL, 1], unrest = 0;
      if (act === 'turmoil') { size = [ASTRAY, ASTRAY, 0]; unrest = 1; made = [0, 0, 0, 0]; }
      if (act === 'gather') { size = [ASTRAY, GATHERED, e]; unrest = lerp(1, 0.5, e); made = [0, 0, 0, 0]; }
      if (act === 'elements') {
        // Fire and earth first; then air and water between them; then the four bound into one.
        const ends = ease(span(p, 0.04, 0.28)), between = ease(span(p, 0.34, 0.58)), bound = ease(span(p, 0.68, 0.98));
        size = [GATHERED, GATHERED, 0];
        unrest = lerp(0.5, 0.3, e);
        made = [ends, between, between, ends];
        apart = made.map((m) => m * (1 - bound));
      }
      if (act === 'all') { size = [GATHERED, COMPACT, e]; unrest = lerp(0.3, 0.2, e); }
      if (act === 'sphere') { size = [COMPACT, BALL, e]; unrest = 0.2 * (1 - e); }
      const radius = (i, stage) => (stage === BALL ? BALL * this.depth[i]
        : stage === GATHERED && this.stray[i] ? this.stray[i] * this.lump[i]
        : stage * this.depth[i] * this.lump[i]);
      const pos = this.specks.geometry.attributes.position.array, col = this.specks.geometry.attributes.color.array;
      const d = this.dir, s = this.sway, row = this.along, tint = new THREE.Color();
      for (let i = 0; i < SPECKS; i++) {
        const kind = i % 4, r = lerp(radius(i, size[0]), radius(i, size[1]), size[2]);
        const out = apart[kind], wave = 0.42 * ASTRAY * this.depth[i];
        for (let j = 0; j < 3; j++) {
          let v = d[3 * i + j] * r;
          // Standing apart, a kind is a smaller cloud of its own at its place in the row.
          if (out) v = lerp(v, 0.33 * v + PLACES[kind] * row.getComponent(j), out);
          if (unrest) {
            const a = 18 * i + 6 * j;
            v += unrest * (2.3 * Math.sin(s[a] * t.wild + s[a + 1] + wave * d[3 * i + ((j + 1) % 3)])
              + 0.9 * Math.sin(s[a + 2] * t.wild + s[a + 3]) + 0.32 * Math.sin(s[a + 4] * t.wild + s[a + 5]));
          }
          pos[3 * i + j] = v;
        }
        tint.copy(this.plain).lerp(this.kindColours[kind], made[kind]).toArray(col, 3 * i);
      }
      this.specks.geometry.attributes.position.needsUpdate = true;
      this.specks.geometry.attributes.color.needsUpdate = true;
      // On a small stage the specks are drawn smaller, so that a swarm still looks like one.
      this.specks.material.size = this.stage.renderer.getPixelRatio() * Math.max(1.3, Math.min(3.2, across / 235));
      this.specks.material.opacity = act === 'whole' ? 0.36 * e : 0.9;
      this.bodyFrame.rotation.z = act === 'whole' ? t.carried : act === 'spin' || act === 'ensouled' ? t.spin : 0;
    }
    // A stage too small to hold the four names apart shows only the line above them, which gives their order.
    this.kindNames.forEach((l, k) => { l.visible = names && across >= 340 && act === 'elements' && apart[k] > 0.5; });
    this.proportion.visible = names && act === 'elements' && apart[1] > 0.9;
    const round = act === 'sphere' || act === 'spin' || act === 'ensouled' || act === 'whole';
    this.shell.visible = round;
    this.shell.material.opacity = 0.03 * (act === 'sphere' || act === 'whole' ? e : 1);
    const upright = act === 'spin' || act === 'ensouled' || from('turn');
    this.axis.visible = upright;
    this.axis.material.opacity = 0.55 * (act === 'spin' ? e : 1);
    this.axisName.visible = names && upright && (act !== 'spin' || p > 0.5);
    this.bodyName.visible = names && act === 'whole' && p > 0.5 && later !== 'tell';

    // ----- the soul set in the body -----
    const wrapped = act === 'ensouled' || act === 'whole';
    this.halo.visible = wrapped;
    this.core.visible = act === 'ensouled' && p < 0.9;
    if (wrapped) {
      this.halo.scale.setScalar(act === 'whole' ? R + 0.45 : lerp(0.4, R + 0.45, e));
      this.halo.material.opacity = act === 'whole' ? 0.07 * e : 0.1;
    }
    this.soulName.visible = names && act === 'ensouled' && p < 0.9;

    // ----- the mixing -----
    const mixing = act === 'mix';
    const pairs = ease(span(p, 0.08, 0.38)), gone = span(p, 0.8, 1);
    for (const blob of this.blobs) {
      blob.mesh.visible = mixing && gone < 1;
      if (!mixing) continue;
      // The Different is hard to mix, and comes in last.
      const joined = ease(blob.kind === 2 ? span(p, 0.56, 0.8) : span(p, 0.46, 0.7));
      blob.mesh.position.set(R, 7 * (blob.kind - 1) * (1 - joined), blob.row * 3.4 * (1 - pairs));
      blob.mesh.scale.setScalar(lerp(1, 1.25, pairs) * lerp(1, 1.3, joined) * (1 - 0.85 * gone));
      blob.mesh.material.color.copy(blob.tint).lerp(soul, pairs);
      blob.mesh.material.emissive.copy(blob.mesh.material.color);
    }
    this.mixNames.forEach((l, k) => { l.visible = names && mixing && (k < 3 ? p < 0.52 : p < 0.3); });

    // ----- the strips -----
    const A = this.A, B = this.B, stripped = from('mix');
    const split = act === 'split' ? e : after('split') ? 1 : 0;
    const crossed = act === 'cross' ? e : after('cross') ? 1 : 0;
    const bent = act === 'bend' ? e : after('bend') ? 1 : 0;
    const grown = mixing ? ease(gone) : 1;
    A.offset = (HALF + GAP * split) * (1 - crossed);
    B.offset = -(HALF + GAP * split) * (1 - crossed);
    B.theta = this.model.basis.pole[2] > 0 ? Math.atan2(-this.model.basis.pole[1], this.model.basis.pole[2]) * crossed : 0;
    B.radius = lerp(R, R_INNER, crossed);
    A.bend = B.bend = bent;
    A.grow = B.grow = grown;
    const marks = act === 'divide' ? 7 * span(p, 0.04, 0.55) + (A.values.length - 7) * span(p, 0.62, 1) : after('divide') ? A.values.length : 0;
    A.shown = B.shown = marks;
    A.shift = from('turn') ? t.same * A.radius : 0;
    B.shift = from('turn') ? t.different * B.radius : 0;
    const named = act === 'turn' ? ease(span(p, 0, 0.3)) : after('turn') ? 1 : 0;
    const fading = act === 'seven' ? 1 - ease(span(p, 0, 0.35)) : 1;
    A.band.material.color.copy(soul).lerp(new THREE.Color(theme.roles.daily), named);
    B.band.material.color.copy(soul).lerp(new THREE.Color(theme.roles.zodiacal), named);
    A.band.visible = A.ticks.visible = stripped && grown > 0;
    B.band.visible = stripped && grown > 0 && !after('seven') && fading > 0;
    B.ticks.visible = B.band.visible;
    B.band.material.opacity = 0.62 * fading;
    B.ticks.material.opacity = 0.9 * fading;
    // While one circle is telling the soul what it has met, the other is dimmed (37b-c).
    const different = later === 'tell' ? bump(played, 0.06, 0.48) : 0, same = later === 'tell' ? bump(played, 0.52, 0.94) : 0;
    A.band.material.opacity = 0.62 * (1 - 0.72 * different);
    A.ticks.material.opacity = (after('turn') ? 0.45 : 0.9) * (1 - 0.72 * different);
    this.told[0].visible = names && across >= 340 && different > 0.5;
    this.told[1].visible = names && across >= 340 && same > 0.5;
    if (stripped) { A.update(); B.update(); }
    this.heaven.rotation.z = from('turn') ? t.carried : 0;

    // The seven numbers, written above their marks until the strip closes into a circle.
    const q = [0, 0, 0];
    this.numbers.forEach((l, k) => {
      l.visible = names && (act === 'divide' ? k < Math.round(marks) : act === 'split' || act === 'cross' || (act === 'bend' && p < 0.45));
      if (l.visible) { A.point(A.place(SOUL.marks[k]), 1.9, q); l.position.set(q[0], q[1], q[2]); }
    });
    this.sameName.visible = names && named > 0.5;
    this.differentName.visible = names && named > 0.5;

    // ----- the seven circles -----
    const cut = act === 'seven' ? ease(span(p, 0.1, 0.8)) : after('seven') ? 1 : 0;
    this.sevens.forEach(({ circle, mesh, bead, size, colour, name }, k) => {
      const on = from('seven');
      mesh.visible = on;
      bead.visible = on && (act !== 'seven' || p > 0.75);
      if (!on) return;
      // Each begins as one of seven slices across the band's width and draws in to its own size.
      const radius = lerp(R_INNER, R_OUT * circle.radius, cut), slice = (k - 3) * ((2 * HALF) / 7) * (1 - cut);
      if (Math.abs(radius - mesh.userData.radius) > 1e-4) {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.TorusGeometry(radius, 0.024 * Math.min(1, radius / 1.2), 8, 160);
        mesh.userData.radius = radius;
      }
      mesh.position.z = slice;
      mesh.material.opacity = 0.8 * (1 - 0.72 * same);
      const angle = circle.phase + circle.rate * t.days;
      bead.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0);
      // A body is made for each in turn, beginning with the Moon (38c-d).
      const starred = later === 'planets' ? ease(span(played, 0.1 + 0.105 * k, 0.3 + 0.105 * k)) : 0;
      bead.scale.setScalar(lerp(Math.min(1, radius / 1.6), size / BEAD, starred));
      bead.material.color.copy(this.inkColour).lerp(colour, starred);
      bead.material.emissive.copy(bead.material.color);
      if (name) name.visible = names && starred > 0.6;
    });

    this.earth.visible = later === 'planets';
    this.earth.scale.setScalar(Math.max(0.001, ease(span(played, 0, 0.1))));
    this.earthName.visible = names && later === 'planets' && played > 0.08;
  }
}
