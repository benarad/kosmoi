// What lies below the Moon: the four simple bodies in their places about the
// Earth, with the Sun on its slanted circle coming over the lands of the north
// and going away again.
//
// Of the heaven only what matters here is drawn: the Moon, the Sun, and on
// the outermost sphere the zodiac and the circles the Sun turns back at. The
// layers are shown twice over: as faint whole spheres, and as coloured rings
// where an upright plane through the middle cuts them.
//
// Sizes are for legibility only. Aristotle gives none, beyond holding the
// Earth small beside the heaven (De Caelo II.14).

import * as THREE from 'three';
import {
  frame, setOrientation, ring, shell, body, rod, aim, label, zodiacBand, parallel, latitudeBand, arrow, dispose, vec,
} from '../../stage/parts.js';

const R_EARTH = 3, R_WATER = 3.6, R_AIR = 5.6, R_FIRE = 7.8;      // each the outer edge of its layer
const R_MOON = 8.05, R_SUN = 9.1, R_STARS = 10;

export class SublunaryView {
  constructor(stage) {
    this.stage = stage;
    this.root = null;
  }

  // basis: the zodiac's frame; latitude: of the place marked on the Earth, in degrees;
  // tilt: the slant of the zodiac to the equator, in degrees; right: the direction
  // (level, in the model's frame) that lies to the viewer's right to begin with.
  build({ theme, basis, latitude, tilt, right = [1, 0, 0], arrows = false, place = 'Athens' }) {
    this.clear();
    this.theme = theme;
    const root = this.root = new THREE.Group();
    this.stage.cosmos.add(root);
    this.stage.setExtent(R_STARS * 1.1);      // the pole stands straight up here, and its name needs the room
    this.labels = [];
    const e = theme.elements;

    // The picture is laid out for someone looking with `R` to their right and
    // the pole up: `at(x, y)` is a point of the upright plane facing them.
    const R = vec(right), U = new THREE.Vector3(0, 0, 1), B = new THREE.Vector3().crossVectors(R, U);
    const at = (x, y, z = 0) => new THREE.Vector3().addScaledVector(R, x).addScaledVector(U, y).addScaledVector(B, z);
    const add = (text, cls, where, parent = root, colour = null) => {
      const l = label(text, cls);
      l.position.copy(where);
      // Most names sit up and to the right of their point; these sit on it, or level beside it.
      if (cls.includes('element')) l.center.set(0.5, 0.5);
      if (cls.includes('inward') || cls.includes('beside')) l.center.set(0, 0.5);
      if (colour) l.element.style.color = colour;
      parent.add(l);
      this.labels.push(l);
      return l;
    };

    // The lights of the stage would hide day and night; here the Sun lights the Earth.
    this.stage.hemi.intensity = 0.4;
    this.stage.key.visible = false;
    this.sunlight = new THREE.DirectionalLight(0xffffff, 2.6);
    root.add(this.sunlight, this.sunlight.target);

    // At rest: the axis of the daily turning and, on the outermost sphere, its
    // equator and the two circles the Sun turns back at.
    const axis = rod(2 * (R_STARS + 0.9), theme.axis, { thick: 0.02, opacity: 0.55 });
    aim(axis, U);
    axis.position.set(0, 0, -(R_STARS + 0.9));
    root.add(axis);
    add('pole of the heaven', 'minor', new THREE.Vector3(0, 0, R_STARS + 0.9));
    root.add(ring(R_STARS, [0, 0, 1], theme.roles.daily, { tube: 0.026, opacity: 0.9 }));
    const t = (tilt * Math.PI) / 180;
    for (const [name, lat] of [['equator of the heaven', 0], ['summer turning', t], ['winter turning', -t]]) {
      if (lat) root.add(parallel(R_STARS, (lat * 180) / Math.PI, theme.roles.daily, { tube: 0.014, opacity: 0.6 }));
      add(name, 'minor inward', at(-R_STARS * Math.cos(lat), R_STARS * Math.sin(lat)));
    }

    // Turning with the fixed stars: the zodiac, along whose middle the Sun goes.
    this.heaven = frame();
    root.add(this.heaven);
    // (Its twelve names would crowd the picture; one name for the whole serves.)
    const band = zodiacBand(R_STARS, basis, theme.roles.zodiacal, { names: null });
    this.heaven.add(band.group);
    add('the zodiac', 'minor', new THREE.Vector3(...basis.x).multiplyScalar(-(R_STARS + 0.25)), this.heaven);

    this.sun = body(0.46, theme.sun, 0.95);
    add('Sun', 'major', new THREE.Vector3(), this.sun);
    this.moon = body(0.24, theme.ink, 0.5);
    add('Moon', 'minor', new THREE.Vector3(), this.moon);
    root.add(this.sun, this.moon);

    // The Moon's sphere, the lowest of the heaven, and inside it fire, air and
    // water about the earth.
    root.add(shell(R_FIRE, e.fire, 0.05), shell(R_AIR, e.air, 0.05), shell(R_WATER, e.water, 0.07));
    const cut = (inner, outer, color, opacity) => {
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(inner, outer, 160),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }),
      );
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), B);
      return mesh;
    };
    root.add(cut(R_EARTH, R_WATER, e.water, 0.55), cut(R_WATER, R_AIR, e.air, 0.2), cut(R_AIR, R_FIRE, e.fire, 0.22));
    const facing = [B.x, B.y, B.z];
    for (const [r, color] of [[R_WATER, e.water], [R_AIR, e.air], [R_FIRE, e.fire]]) root.add(ring(r, facing, color, { tube: 0.014, opacity: 0.7 }));
    root.add(new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 64, 48), new THREE.MeshLambertMaterial({ color: e.earth })));

    // On the Earth: the circles under the equator and the Sun's turnings, the
    // lands where people can live, and the place the sky is watched from.
    // Aristotle bounds the habitable lands, north and south alike, by the
    // circle under the Sun's turning and the circle under the ever-visible
    // circle (Meteorologica II.5, 362a32-b9). The ever-visible circle depends
    // on where one stands; it is taken here as it is at the place marked,
    // which puts it as many degrees from the pole as that place is from the equator.
    const globe = R_EARTH + 0.012, everVisible = 90 - latitude;
    root.add(parallel(globe, 0, theme.ink, { tube: 0.012, opacity: 0.6 }));
    for (const lat of [tilt, -tilt, everVisible, -everVisible]) root.add(parallel(globe, lat, theme.ink, { tube: 0.008, opacity: 0.45 }));
    this.north = latitudeBand(globe, tilt, everVisible, theme.land.bare);
    this.south = latitudeBand(globe, -everVisible, -tilt, theme.land.bare);
    root.add(this.north, this.south);
    const lat = (latitude * Math.PI) / 180;
    const pin = body(0.075, theme.ink, 0.7);
    pin.position.set(Math.cos(lat), 0, Math.sin(lat)).multiplyScalar(R_EARTH + 0.05);
    add(place, 'minor', new THREE.Vector3(), pin);
    root.add(pin);

    // Names of the layers, one under another, a little to the left of the axis.
    const down = (r) => at(-0.3 * r, -0.954 * r);
    for (const [text, r, colour] of [
      ['earth', R_EARTH * 0.62, null], ['water', (R_EARTH + R_WATER) / 2, e.water], ['air', (R_WATER + R_AIR) / 2, e.air],
      ['fire', (R_AIR + R_FIRE) / 2, e.fire], ['the Moon’s sphere', R_FIRE + 0.42, null],
    ]) add(text, text === 'earth' ? 'element inside' : 'element', down(r), root, colour);

    // The motions that belong to each by nature: straight down to the middle, or straight up from it.
    this.arrows = new THREE.Group();
    const out = (r, shift = 0) => at(0.79 * r + shift, -0.613 * r);
    const point = (v) => [v.x, v.y, v.z];
    this.arrows.add(arrow(point(out(5.3)), point(out(3.75)), theme.ink), arrow(point(out(5.95)), point(out(7.55)), theme.ink));
    add('earth and water move down', 'minor beside', out(4.5, 0.25), this.arrows);
    add('air and fire move up', 'minor beside', out(6.75, 0.25), this.arrows);
    this.arrows.visible = arrows;
    root.add(this.arrows);
    this.arrowLabels = this.labels.slice(-2);

    for (const l of this.labels) this.stage.trackLabel(l);
  }

  clear() {
    if (!this.root) return;
    for (const l of this.labels) this.stage.untrackLabel(l);
    this.stage.hemi.intensity = 2.2;
    this.stage.key.visible = true;
    dispose(this.root);
    this.root = null;
  }

  // heaven: orientation of the sphere of the fixed stars; sun, moon: their
  // directions as the Earth sees them; north: how far the lands of the north
  // are in their growing season, from 0 to 1.
  update({ heaven, sun, moon, north }) {
    if (!this.root) return;
    setOrientation(this.heaven, heaven);
    this.sun.position.set(sun[0], sun[1], sun[2]).multiplyScalar(R_SUN);
    this.moon.position.set(moon[0], moon[1], moon[2]).multiplyScalar(R_MOON);
    // A directional light shines from its position towards its target, which sits at the centre.
    this.sunlight.position.set(sun[0], sun[1], sun[2]).multiplyScalar(50);
    // The lands keep a little light of their own, so that their colour shows on the night side too.
    const mix = (k) => new THREE.Color(this.theme.land.bare).lerp(new THREE.Color(this.theme.land.growing), k);
    for (const [band, k] of [[this.north, north], [this.south, 1 - north]]) {
      band.material.color.copy(mix(k));
      band.material.emissive.copy(band.material.color);
      band.material.emissiveIntensity = 0.3;
    }
  }

  setLook({ labels = true, arrows = false }) {
    if (!this.root) return;
    this.arrows.visible = arrows;
    for (const l of this.labels) l.visible = labels;
    for (const l of this.arrowLabels) l.visible = labels && arrows;
  }
}
