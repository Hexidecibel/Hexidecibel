// The hero's motorbike: a real velo ride, not a drawing of one.
//
// data/velo-ride.json is written by bin/velo-ride, which re-simulates one of my
// recorded runs with velo's own engine (hash chain verified) and samples the
// bike's pose at 30 fps. This file turns those poses into SMIL keyframes:
// GitHub shows README SVGs through <img>, where CSS animation is unreliable and
// SMIL is not.
//
// Coordinates: velo's world is metres, y-up. Here everything is pixels, y-down,
// at S px per metre. The camera follows a smoothed copy of the bike so the
// terrain glides rather than jitters; the bike's own motion is exact.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'velo-ride.json');

const S = 32; // px per metre: puts the 1.2 m wheelbase at ~38 px
const HOLD = 0.7; // s the final pose is held (fading out) before the loop restarts
const FADE_IN = 0.25;
const deg = (r) => (r * 180) / Math.PI;
const r1 = (x) => Math.round(x * 10) / 10;
const fmt = (x) => String(r1(x) === 0 ? 0 : r1(x));

/** Keep angle series continuous so a 350 -> 10 step reads as +20, not -340. */
function unwrap(a) {
  const out = [a[0]];
  for (let i = 1; i < a.length; i++) {
    let d = a[i] - a[i - 1];
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    out.push(out[i - 1] + d);
  }
  return out;
}

/** Edge-clamped Gaussian smoothing, sigma in samples. */
function smooth(a, sigma) {
  const k = [];
  const R = Math.ceil(3 * sigma);
  for (let i = -R; i <= R; i++) k.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
  return a.map((_, i) => {
    let s = 0, w = 0;
    for (let j = -R; j <= R; j++) {
      const v = a[Math.min(a.length - 1, Math.max(0, i + j))];
      s += v * k[j + R];
      w += k[j + R];
    }
    return s / w;
  });
}

/**
 * Drop keyframes that linear interpolation reproduces within `tol` (in the
 * channel's own units) - Ramer-Douglas-Peucker on each multi-value channel.
 */
function keep(times, rows, tol) {
  const kept = new Set([0, times.length - 1]);
  const rec = (a, b) => {
    let worst = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const u = (times[i] - times[a]) / (times[b] - times[a]);
      for (let c = 0; c < rows[i].length; c++) {
        const e = Math.abs(rows[a][c] + (rows[b][c] - rows[a][c]) * u - rows[i][c]);
        if (e > worst) { worst = e; at = i; }
      }
    }
    if (worst > tol) { kept.add(at); rec(a, at); rec(at, b); }
  };
  rec(0, times.length - 1);
  return [...kept].sort((x, y) => x - y);
}

export function loadRide() {
  return JSON.parse(readFileSync(DATA, 'utf8'));
}

/**
 * Build the ride for one theme. Returns { defs, terrain, bike, caption, dur }:
 * SVG fragments for the hero to place, the bike drawn on top of the terrain.
 *
 * `still` draws one fixed frame with no animation at all (prefers-reduced-
 * motion). It is the frame the bike is furthest over backwards.
 */
export function ride(t, { W, H, still = false }) {
  const R = loadRide();
  const sm = R.samples;
  const n = sm.length;
  const Tw = sm[n - 1].t;
  const dur = Tw + HOLD;
  const times = sm.map((s) => s.t);

  // --- the camera: bike drifts left -> right across the band while the view
  // follows a smoothed track, so pits and drops read as motion of the ground.
  const sigma = 0.35 * R.source.fps;
  const cx = smooth(sm.map((s) => s.px), sigma);
  const cy = smooth(sm.map((s) => s.py), sigma * 0.6);
  const BX0 = 300, BX1 = 860, GY = 432; // screen x drift, screen y of the pivot
  const cam = sm.map((s, i) => [BX0 + ((BX1 - BX0) * s.t) / Tw - S * cx[i], GY + S * cy[i]]);

  // --- the bike, chassis-local wherever possible
  const ang = unwrap(sm.map((s) => s.ang));
  const chassis = sm.map((s) => [S * s.px, -S * s.py]);
  const rot = ang.map((a) => [-deg(a)]);
  const local = (k) => sm.map((s, i) => {
    const dx = s.wx[k] - s.px, dy = s.wy[k] - s.py;
    const c = Math.cos(ang[i]), sn = Math.sin(ang[i]);
    return [S * (c * dx + sn * dy), -S * (-sn * dx + c * dy)];
  });
  const wl = [local(0), local(1)];
  const spin = [0, 1].map((k) => unwrap(sm.map((s) => s.ws[k])).map((w, i) => [-deg(w - ang[i])]));
  const arm = unwrap(sm.map((s) => Math.atan2(s.hy - s.py, s.hx - s.px)));
  const rider = arm.map((a, i) => [-deg(a - ang[i] - Math.PI / 2)]);

  // The still frame: the wheelie at the finish, mid-way over the back (~110deg).
  let si = ang.findIndex((a) => a >= (110 * Math.PI) / 180);
  if (si < 0) si = ang.indexOf(Math.max(...ang));

  /** An attribute or transform, animated or fixed at the still frame. */
  const kt = (i) => (times[i] / dur).toFixed(4);
  const anim = (rows, tol, make) => {
    if (still) return { attr: rows[si], el: '' };
    const idx = keep(times, rows, tol);
    const keyTimes = [...idx.map(kt), '1'].join(';');
    const vals = [...idx.map((i) => rows[i]), rows[n - 1]];
    return { attr: rows[0], el: make(vals, keyTimes) };
  };
  const common = `dur="${dur.toFixed(2)}s" repeatCount="indefinite" calcMode="linear"`;
  const tr = (rows, tol) => anim(rows, tol, (vals, k) =>
    `<animateTransform attributeName="transform" type="translate" values="${vals.map((v) => `${fmt(v[0])} ${fmt(v[1])}`).join(';')}" keyTimes="${k}" ${common}/>`);
  const rt = (rows, tol) => anim(rows, tol, (vals, k) =>
    `<animateTransform attributeName="transform" type="rotate" values="${vals.map((v) => fmt(v[0])).join(';')}" keyTimes="${k}" ${common}/>`);
  const at = (name, rows, tol) => anim(rows, tol, (vals, k) =>
    `<animate attributeName="${name}" values="${vals.map((v) => fmt(v[0])).join(';')}" keyTimes="${k}" ${common}/>`);
  const T = (a) => `transform="translate(${fmt(a.attr[0])} ${fmt(a.attr[1])})"`;
  const Rt = (a) => `transform="rotate(${fmt(a.attr[0])})"`;

  const camA = tr(cam, 0.3);
  const camEl = (inner) => `<g ${T(camA)}>${camA.el}${inner}</g>`;

  // --- terrain: velo levels are caves (free space inside one ring), so the
  // rock is everything outside it. Fill that, stroke the ring.
  const big = 4000;
  const ring = R.polys.map((p) => 'M' + p.pts.map(([x, y]) => `${fmt(S * x)} ${fmt(-S * y)}`).join('L') + 'Z').join('');
  const xs = sm.map((s) => S * s.px);
  const rock = `M${-big} ${-big}H${big}V${big}H${-big}Z${ring}`;
  const fl = R.flower;
  const flower = `<g transform="translate(${fmt(S * fl.x)} ${fmt(-S * fl.y)})" stroke="${t.lime}" stroke-width="2.5" fill="none" stroke-linecap="round"><circle r="7"/><path d="M0 7V18"/></g>`;
  const terrain = camEl(`
    <path d="${rock}" fill="${t.panel}" fill-rule="evenodd" opacity=".9"/>
    <path d="${ring}" fill="none" stroke="url(#rl)" stroke-width="3.5" stroke-linejoin="round"/>
    ${flower}`);

  // --- the bike art, in chassis-local pixels with y down and the rider's
  // pivot at the origin. Same palette as before: ink wheels, pink frame,
  // amber helmet. Proportions from velo's spec (wheel r 0.25 m, anchors
  // +-0.6 m, arm 0.55 m, head r 0.16 m).
  const wr = S * R.bike.wheelRadius;
  const an = R.bike.anchors.map((a) => [S * a.x, -S * a.y]);
  const head = S * R.bike.armLength;
  const hr = S * R.bike.headRadius;
  const wheel = (k) => {
    const p = tr(wl[k], 0.25);
    const sp = rt(spin[k], 4);
    return `<g ${T(p)}>${p.el}<g ${Rt(sp)}>${sp.el}<circle r="${fmt(wr)}" fill="none" stroke="${t.ink}" stroke-width="3"/><path d="M${fmt(-wr)} 0H${fmt(wr)}M0 ${fmt(-wr)}V${fmt(wr)}" stroke="${t.ink}" stroke-width="1.5"/></g></g>`;
  };
  const link = (k) => {
    const x2 = at('x2', wl[k].map((v) => [v[0]]), 0.25);
    const y2 = at('y2', wl[k].map((v) => [v[1]]), 0.25);
    return `<line x1="${fmt(an[k][0])}" y1="${fmt(an[k][1])}" x2="${fmt(x2.attr[0])}" y2="${fmt(y2.attr[0])}" stroke="${t.pink}" stroke-width="3" stroke-linecap="round">${x2.el}${y2.el}</line>`;
  };
  const ch = tr(chassis, 0.25);
  const cr = rt(rot, 0.5);
  const rd = rt(rider, 1);
  const [a0, a1] = an;
  const bike = camEl(`
    <g ${T(ch)}>${ch.el}<g ${Rt(cr)}>${cr.el}
      ${link(0)}${link(1)}${wheel(0)}${wheel(1)}
      <path d="M${fmt(a0[0])} ${fmt(a0[1])}L-9 -3H9L${fmt(a1[0])} ${fmt(a1[1])}" fill="none" stroke="${t.pink}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M-5 -3H11L8 -9H-1Z" fill="${t.pink}"/>
      <g ${Rt(rd)}>${rd.el}
        <path d="M-3 0L-1 ${fmt(-head * 0.62)}L9 ${fmt(-head * 0.42)}" fill="none" stroke="${t.ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cy="${fmt(-head)}" r="${fmt(hr + 0.8)}" fill="${t.amber}"/>
      </g>
    </g></g>`);

  // Gradient along the ridden stretch, in the terrain's own (pre-camera) space.
  const defs = `<linearGradient id="rl" gradientUnits="userSpaceOnUse" x1="${fmt(Math.min(...xs))}" x2="${fmt(Math.max(...xs))}" y1="0" y2="0"><stop offset="0" stop-color="${t.lime}"/><stop offset="1" stop-color="${t.pink}"/></linearGradient>`;

  // The loop seam: fade in, ride, hold the finish, fade out.
  const fade = still ? '' :
    `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;${(FADE_IN / dur).toFixed(4)};${((Tw + 0.15) / dur).toFixed(4)};${((Tw + HOLD - 0.1) / dur).toFixed(4)};1" dur="${dur.toFixed(2)}s" repeatCount="indefinite"/>`;

  const caption = `real replay · velo ${R.source.level} · re-simulated from recorded inputs`;
  return { defs, terrain, bike, fade, caption, dur, source: R.source, stillT: times[si], stillDeg: deg(ang[si]) };
}
