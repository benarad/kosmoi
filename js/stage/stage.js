// The shared stage: a 3D scene with the Earth's place at its centre, a camera
// the viewer can swing round, text labels, and a frame loop. It knows nothing
// about any particular cosmology; a cosmology adds its own objects to
// `stage.cosmos` and asks to be called once per frame.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

// Two looks: a night sky for a dim room, a drawing on paper for a bright one.
// `roles` colours a sphere by what it does, not by which planet it belongs to.
export const THEMES = {
  dark: {
    name: 'dark',
    bg: '#0d1220', ink: '#ece8dc', faint: '#8d93a6',
    star: '#8e95a8', axis: '#59607a', earth: '#7c9a86', curve: '#b7a6ff', sun: '#f5c84c',
    roles: { daily: '#93a9d4', zodiacal: '#e6b53f', synodic: '#3fc6a9', counter: '#ee739f', extra: '#f2955a' },
    ground: '#1c2a22', sky: { night: '#0d1220', day: '#4f86c4' },
    elements: { earth: '#8a7a5c', water: '#3f7fc4', air: '#bcd3ea', fire: '#f08a3c' },
    land: { growing: '#4f9a52', bare: '#9a8a58' },
  },
  light: {
    name: 'light',
    bg: '#f5f1e6', ink: '#1f2430', faint: '#6f6a5c',
    star: '#8f8876', axis: '#b0a892', earth: '#5d7968', curve: '#6a4fc4', sun: '#b9860a',
    roles: { daily: '#3f5b93', zodiacal: '#a87b08', synodic: '#0d7f69', counter: '#b5326a', extra: '#b4530f' },
    ground: '#cfc7b2', sky: { night: '#e4dfd0', day: '#f5f1e6' },
    elements: { earth: '#8a7a5c', water: '#3f78b8', air: '#7fa3c7', fire: '#d9691a' },
    land: { growing: '#3f8a45', bare: '#a39262' },
  },
};

// Which of two names stays when they would print over one another: the one
// whose kind comes higher here, and a name of no listed kind counts as 3.
const RANK = { major: 5, band: 4, compass: 4, element: 4, minor: 2, sign: 1, star: 0 };
// The sides of its point on which a name may be printed, in the order they are
// tried: up and to the right (the usual place), down and to the right, up and
// to the left, down and to the left. Each is the corner of the label that
// rests on the point. Some kinds of name are placed by the picture itself and
// stay where they are put.
const PLACES = [[0, 1], [0, 0], [1, 1], [1, 0]];
const FIXED = ['sign', 'compass', 'element', 'inward', 'beside'];
// Two names whose points move past each other faster than this, in pixels a
// second, are left to cross without either making room.
const PASSING = 45;
const STILL = { vx: 0, vy: 0 };   // how fast a control lying over the picture is moving

export class Stage {
  constructor(container) {
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.domElement.classList.add('stage-labels');
    container.appendChild(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 10, 100);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.5, 600);
    this.home = new THREE.Vector3(8, 11, 39);
    this.camera.position.copy(this.home);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    Object.assign(this.controls, {
      enableDamping: true, dampingFactor: 0.08, enablePan: false,
      minDistance: 16, maxDistance: 150, rotateSpeed: 0.7,
    });
    // Until the viewer takes hold of the camera, it keeps the whole picture in the window.
    this._moved = false;
    this.controls.addEventListener('start', () => { this._moved = true; });

    // Everything a cosmology draws goes in here. Its orientation decides which
    // way is "up" on screen and can be changed without touching the model.
    this.cosmos = new THREE.Group();
    this.scene.add(this.cosmos);
    this._upTarget = null;

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x556070, 2.2);
    this.key = new THREE.DirectionalLight(0xffffff, 1.3);
    this.key.position.set(6, 9, 12);
    this.scene.add(this.hemi, this.key);
    this.eye = 'outside';

    this.extent = 10;          // radius of what is drawn, for the depth fade
    this._frame = [];
    this._labels = new Set();
    this._boxes = new WeakMap();   // the size of each name on the page, measured now and then
    this._frames = 0;
    this._clock = 2;           // seconds of drawing, for timing the names' changes of side (a name may move from the start)

    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();

    // While nothing is moving there is no need to draw sixty pictures a second.
    // A page says when it is at rest (`resting`), and the stage then draws four
    // times a second, which is often enough to pick up a change made from the
    // page. Anything the viewer does wakes it for a moment, so that turning the
    // picture stays smooth and the camera has time to settle afterwards.
    this.resting = null;
    this._awake = 0;
    for (const type of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart']) {
      window.addEventListener(type, () => this.wake(), { capture: true, passive: true });
    }

    let last = performance.now();
    const loop = (now) => {
      requestAnimationFrame(loop);
      if (this.resting && this.resting() && now > this._awake && now - last < 250) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (const f of this._frame) f(dt);
      this._render(dt);
    };
    requestAnimationFrame(loop);
  }

  onFrame(f) { this._frame.push(f); }

  // Draw at full speed for the next second and a half, whatever the page says about being at rest.
  wake() { this._awake = performance.now() + 1500; }

  setTheme(theme) {
    this.theme = theme;
    this.setSky(null);
  }

  // The colour behind everything: the theme's own, or (from the ground) the
  // sky between night (0) and day (1).
  setSky(daylight) {
    const c = new THREE.Color(this.theme.bg);
    if (daylight !== null) c.set(this.theme.sky.night).lerp(new THREE.Color(this.theme.sky.day), daylight);
    this.scene.fog.color.copy(c);
    this.container.style.background = `#${c.getHexString()}`;
  }

  // Where the viewer stands: 'outside', looking in at the whole heaven and
  // free to circle it, or on the 'ground' at the centre, looking out and free
  // only to turn the head.
  setEye(eye) {
    if (eye === this.eye) return;
    this.eye = eye;
    const c = this.controls;
    if (eye === 'ground') {
      this.camera.fov = 72;
      this.camera.near = 0.005;
      Object.assign(c, { enableZoom: false, rotateSpeed: -0.3, minDistance: 0.05, maxDistance: 0.05, minPolarAngle: Math.PI / 2 - 0.12, maxPolarAngle: Math.PI - 0.03 });
      c.target.set(0, 0.06, 0);
      // facing south, a little above the horizon (south is +Z once the zenith is up and east to the right)
      this.camera.position.set(0, 0.06 - 0.05 * Math.sin(0.35), -0.05 * Math.cos(0.35));
    } else {
      this.camera.fov = 32;
      this.camera.near = 0.5;
      Object.assign(c, { enableZoom: true, rotateSpeed: 0.7, minDistance: 16, maxDistance: 150, minPolarAngle: 0, maxPolarAngle: Math.PI });
      c.target.set(0, 0, 0);
      this._moved = false;
      this.resize();           // works out afresh how far back to stand, and stands there
    }
    this.camera.updateProjectionMatrix();
    c.update();
  }

  // Turn the whole cosmos to the given orientation (see upQuaternion below).
  setUp(quaternion, animate = true) {
    if (animate) this._upTarget = quaternion.clone();
    else { this.cosmos.quaternion.copy(quaternion); this._upTarget = null; }
  }

  // The viewer's usual place is a little to the right of the picture and above
  // it, so that spheres read as spheres. This takes an orientation for the
  // cosmos and turns it so that what it sends straight out of the screen
  // points at that place instead: a flat thing is then seen square-on.
  squareOn(quaternion) {
    const out = this.home.clone().normalize();
    const right = new THREE.Vector3(0, 1, 0).cross(out).normalize();
    const up = out.clone().cross(right);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, out)).multiply(quaternion);
  }

  resetView() {
    if (this.eye === 'ground') { const eye = this.eye; this.eye = null; this.setEye(eye); return; }
    this._moved = false;
    this.camera.position.copy(this.home);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  // How far from the centre the picture reaches: the camera stands back far enough to take it all in.
  setExtent(radius) {
    if (radius === this.extent) return;
    this.extent = radius;
    this._stand();
  }

  // Labels registered here fade as they pass behind the scene, and give way
  // to one another where they would overlap.
  trackLabel(obj) { this._labels.add(obj); }
  untrackLabel(obj) { this._labels.delete(obj); }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this._w = w;
    this._h = h;
    this._measured = -1;       // the names may have changed size with the window: measure them again
    this.wake();
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this._stand();
  }

  // Stand far enough back that everything drawn, with its labels, fits the
  // narrower side of the window. Cheap enough to call on every frame, which a
  // picture that grows or shrinks as it moves needs.
  _stand() {
    const halfAngle = (this.camera.fov * Math.PI) / 360;
    this.home.setLength((this.extent * 1.2) / (Math.tan(halfAngle) * Math.min(1, this.camera.aspect)));
    if (!this._moved && this.eye === 'outside') this.camera.position.copy(this.home);
  }

  _render(dt) {
    this.controls.update();
    if (this._upTarget) {
      this.cosmos.quaternion.slerp(this._upTarget, Math.min(1, dt * 5));
      if (this.cosmos.quaternion.angleTo(this._upTarget) < 1e-3) {
        this.cosmos.quaternion.copy(this._upTarget);
        this._upTarget = null;
      }
    }
    // Depth cue: things on the far side sink towards the background colour.
    // From the ground there is no far side, so no fade.
    const outside = this.eye === 'outside';
    const d = this.camera.position.length();
    this.scene.fog.near = outside ? d - this.extent * 0.6 : 500;
    this.scene.fog.far = outside ? d + this.extent * 3.2 : 1000;

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
    this._settleLabels(d, outside, dt);
  }

  // Where each name is printed, and how strongly. A name on the far side of
  // the picture is fainter. Where two names would print over one another, the
  // less important of the two makes room (a planet's name stays before a sign
  // of the zodiac, and a sign before a star). It moves to another side of its
  // own point if one is free, and if none is, it fades out until there is
  // room again. Between names that matter equally, the one that has been in
  // its place longer stays.
  //
  // Two things keep this from making the picture restless. Names that are
  // passing one another quickly are left alone, since the overlap is over in a
  // moment (the Moon's name going round the Earth's, at sixty days a second).
  // And a name changes sides at most once a second.
  _settleLabels(d, outside, dt) {
    // A name's size on the page changes only when its text or the size of the
    // type does, so it is measured again a few times a second and otherwise
    // remembered.
    const frame = this._frames++;
    const round = Math.floor(frame / 20);
    const fresh = round !== this._measured;
    this._measured = round;
    this._clock += dt;

    const p = new THREE.Vector3(), items = [];
    for (const obj of this._labels) {
      const el = obj.element, u = obj.userData;
      if (el.style.display === 'none') { u.gaveWay = false; continue; }
      obj.getWorldPosition(p);
      const depth = p.distanceTo(this.camera.position) - d;        // negative: nearer than the centre
      const t = outside ? Math.max(0, Math.min(1, (depth + this.extent) / (2 * this.extent))) : 0;
      const fade = (1 - 0.72 * t).toFixed(2);

      let box = this._boxes.get(obj);
      if (!box || fresh || box.text !== el.textContent) {
        const style = getComputedStyle(el), pad = (side) => parseFloat(style[`padding${side}`]) || 0;
        const kind = Object.keys(RANK).find((k) => el.classList.contains(k));
        // A name may change sides only if it was made in the usual place, up
        // and to the right of its point, and is not of a kind with a place of its own.
        const home = box ? box.home : [obj.center.x, obj.center.y];
        box = {
          text: el.textContent, w: el.offsetWidth, h: el.offsetHeight, home,
          rank: kind ? RANK[kind] : 3,
          movable: home[0] === 0 && home[1] === 1 && !FIXED.some((k) => el.classList.contains(k)),
          // The padding holds the words off the point. It changes sides with the name, so only its amounts are kept.
          padX: Math.max(pad('Left'), pad('Right')), padY: Math.max(pad('Top'), pad('Bottom')),
          pad: [pad('Left'), pad('Top'), pad('Right'), pad('Bottom')],
        };
        this._boxes.set(obj, box);
      }
      if (!box.w || !box.text) { el.style.opacity = fade; continue; }

      // Where its point is on the page, and how fast that is moving, in pixels a second.
      p.project(this.camera);
      const px = (p.x * 0.5 + 0.5) * this._w, py = (-p.y * 0.5 + 0.5) * this._h;
      const moving = u.frame === frame - 1 && dt > 0;
      u.vx = moving ? 0.5 * u.vx + 0.5 * ((px - u.px) / dt) : 0;
      u.vy = moving ? 0.5 * u.vy + 0.5 * ((py - u.py) / dt) : 0;
      Object.assign(u, { px, py, frame });
      items.push({ obj, el, box, fade, depth, px, py, vx: u.vx, vy: u.vy, gaveWay: !!u.gaveWay, changed: u.changed || 0 });
    }

    // Where the words themselves would be with the name on the given side of its point.
    const wordsAt = (it, [cx, cy]) => {
      const { w, h, movable, padX, padY, pad } = it.box;
      const x = it.px - cx * w, y = it.py - cy * h;
      return movable
        ? { x0: x + (cx ? 0 : padX), y0: y + (cy ? 0 : padY), x1: x + w - (cx ? padX : 0), y1: y + h - (cy ? padY : 0) }
        : { x0: x + pad[0], y0: y + pad[1], x1: x + w - pad[2], y1: y + h - pad[3] };
    };
    const passing = (a, b) => Math.hypot(a.vx - b.vx, a.vy - b.vy) > PASSING;
    // Controls that lie over the picture (they are marked data-clear) are in
    // the way just as another name would be, so names keep clear of them too.
    if (fresh || !this._solid) {
      const frame = this.container.getBoundingClientRect();
      this._solid = [...this.container.querySelectorAll('[data-clear]')].map((e) => e.getBoundingClientRect())
        .filter((r) => r.width && r.height)
        .map((r) => ({ x0: r.left - frame.left, y0: r.top - frame.top, x1: r.right - frame.left, y1: r.bottom - frame.top, it: STILL }));
    }
    const kept = [...this._solid];
    // Whether the words would be clear of the names already placed, with `room` to spare.
    const clear = (it, b, room) => !kept.some((k) => !passing(it, k.it) && b.x0 - room < k.x1 && b.x1 + room > k.x0 && b.y0 - room < k.y1 && b.y1 + room > k.y0);
    // Whether they would also be clear of the points that other names belong to. This is asked only of a side the name might move to.
    const open = (it, b, room) => clear(it, b, room)
      && !items.some((o) => o !== it && !passing(it, o) && o.px > b.x0 - 4 && o.px < b.x1 + 4 && o.py > b.y0 - 4 && o.py < b.y1 + 4);
    const same = (a, b) => a[0] === b[0] && a[1] === b[1];

    items.sort((a, b) => b.box.rank - a.box.rank || a.gaveWay - b.gaveWay || a.changed - b.changed || a.depth - b.depth);
    for (const it of items) {
      const { obj, el, box } = it;
      const now = [obj.center.x, obj.center.y];
      const mayMove = box.movable && this._clock - it.changed > 1;
      let side = null;
      // A name that has given way comes back only when there is a little room to spare, so that it does not flicker.
      if (clear(it, wordsAt(it, now), it.gaveWay ? 6 : 1)) {
        // Where it is will do. It goes back to its usual place once that is well clear.
        side = mayMove && !same(now, box.home) && open(it, wordsAt(it, box.home), 14) ? box.home : now;
      } else if (mayMove) {
        side = PLACES.find((c) => !same(c, now) && open(it, wordsAt(it, c), 6)) || null;
      }
      obj.userData.gaveWay = !side;
      el.style.opacity = side ? it.fade : '0';
      if (!side) continue;
      if (!same(side, now)) {
        obj.center.set(side[0], side[1]);
        el.classList.toggle('left', side[0] === 1);
        el.classList.toggle('below', side[1] === 0);
        obj.userData.changed = this._clock;
      }
      kept.push({ ...wordsAt(it, side), it });
    }
  }
}

// Orientation for `stage.cosmos` that sends the model direction `up` to the top
// of the screen and `right` to the right. Both are unit vectors in model
// coordinates and must be perpendicular.
export function upQuaternion(up, right) {
  const u = new THREE.Vector3(...up), r = new THREE.Vector3(...right);
  const back = new THREE.Vector3().crossVectors(r, u);            // model direction sent towards the viewer
  const m = new THREE.Matrix4().makeBasis(r, u, back).transpose(); // screen-from-model
  return new THREE.Quaternion().setFromRotationMatrix(m);
}
