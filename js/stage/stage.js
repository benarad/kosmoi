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

    new ResizeObserver(() => this.resize()).observe(container);
    this.resize();

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (const f of this._frame) f(dt);
      this._render(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  onFrame(f) { this._frame.push(f); }

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

  // Labels registered here fade as they pass behind the scene.
  trackLabel(obj) { this._labels.add(obj); }
  untrackLabel(obj) { this._labels.delete(obj); }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
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

    const p = new THREE.Vector3();
    for (const obj of this._labels) {
      obj.getWorldPosition(p);
      const depth = p.distanceTo(this.camera.position) - d;        // negative: nearer than the centre
      const t = outside ? Math.max(0, Math.min(1, (depth + this.extent) / (2 * this.extent))) : 0;
      obj.element.style.opacity = (1 - 0.72 * t).toFixed(2);
    }
    this.labelRenderer.render(this.scene, this.camera);
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
