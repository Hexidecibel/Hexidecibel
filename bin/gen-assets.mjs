#!/usr/bin/env node
// Generates every SVG under assets/: the hero, the three private-work stat
// strips and the six project cards, each in a dark and a light variant.
//
//   node bin/gen-assets.mjs
//
// Hand-rolled SVG on purpose: GitHub renders README images through <img>, so
// there is no JavaScript and no external font. Animation is CSS keyframes and
// SMIL only, and type uses system font stacks.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ride } from './ride-svg.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
mkdirSync(OUT, { recursive: true });

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";

const THEMES = {
  dark: {
    bg: '#0a0b14', panel: '#11131f', line: '#23263a', grid: '#161929',
    ink: '#f4f5fb', soft: '#a3a8c3', faint: '#5d6380',
    lime: '#c6ff3d', cyan: '#3de0ff', pink: '#ff3d8b', amber: '#ffb020',
    chip: '#1a1d2e', glowA: 0.55, glowB: 0.4,
  },
  light: {
    bg: '#fbfbfe', panel: '#ffffff', line: '#dfe2ee', grid: '#eef0f7',
    ink: '#11131f', soft: '#4a4f68', faint: '#8a8fa8',
    lime: '#5a8f00', cyan: '#0090b8', pink: '#e0186c', amber: '#c27800',
    chip: '#f0f2f8', glowA: 0.22, glowB: 0.16,
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const write = (name, svg) => {
  writeFileSync(join(OUT, name), svg.replace(/\n\s+/g, '\n').trim() + '\n');
};

// ---------------------------------------------------------------- hero
function hero(mode) {
  const t = THEMES[mode];
  const W = 1200, H = 520;
  // A real velo run, re-simulated from its recorded inputs: see ride-svg.mjs.
  const A = ride(t, { W, H });
  const Z = ride(t, { W, H, still: true });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
  <title id="t">Chris Cushman, senior full-stack engineer</title>
  <desc id="d">Senior full-stack engineer. Kotlin, Spring Boot, Java, TypeScript, React, PostgreSQL, AWS. Ships production software with AI coding agents, with plans, written conventions, guard scripts and automated tests.</desc>
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${t.grid}" stroke-width="1"/></pattern>
    <radialGradient id="ga"><stop offset="0" stop-color="${t.pink}" stop-opacity="${t.glowA}"/><stop offset="1" stop-color="${t.pink}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gb"><stop offset="0" stop-color="${t.cyan}" stop-opacity="${t.glowB}"/><stop offset="1" stop-color="${t.cyan}" stop-opacity="0"/></radialGradient>
    <linearGradient id="nm" x1="0" x2="1" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="${t.lime}"/><stop offset=".5" stop-color="${t.cyan}"/><stop offset="1" stop-color="${t.pink}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-0.5 0;0.5 0;-0.5 0" dur="9s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="ln" x1="0" x2="1"><stop offset="0" stop-color="${t.lime}"/><stop offset="1" stop-color="${t.pink}"/></linearGradient>
    ${A.defs}
    <linearGradient id="bf" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="378" y2="436"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="band" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#bf)"/></mask>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
    <clipPath id="type"><rect class="typer" x="60" y="44" width="0" height="40"/></clipPath>
  </defs>
  <style>
    .blob1{animation:drift1 14s ease-in-out infinite alternate}
    .blob2{animation:drift2 17s ease-in-out infinite alternate}
    @keyframes drift1{to{transform:translate(-160px,60px)}}
    @keyframes drift2{to{transform:translate(180px,-50px)}}
    .typer{animation:type 2.2s steps(30,end) .3s forwards}
    @keyframes type{to{width:640px}}
    .cur{animation:blink 1s steps(1) infinite}
    @keyframes blink{50%{opacity:0}}
    .rise{animation:rise .8s cubic-bezier(.2,.8,.2,1) backwards}
    .r1{animation-delay:.9s}.r2{animation-delay:1.2s}.r3{animation-delay:1.5s}.r4{animation-delay:1.8s}
    @keyframes rise{from{opacity:0;transform:translateY(18px)}}
    .still{display:none}
    .live{animation:pulse 1.6s ease-in-out infinite}
    @keyframes pulse{50%{opacity:.25}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}.ride{display:none}.still{display:inline}.typer{width:640px}.rise{opacity:1}}
  </style>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <circle class="blob1" cx="980" cy="120" r="320" fill="url(#ga)"/>
    <circle class="blob2" cx="260" cy="420" r="300" fill="url(#gb)"/>

    <g clip-path="url(#type)">
      <text x="60" y="72" font-family="${MONO}" font-size="24" fill="${t.soft}"><tspan fill="${t.lime}">chris@hexidecibel</tspan>:<tspan fill="${t.cyan}">~</tspan>$ ./whoami --short</text>
    </g>
    <rect class="cur" x="60" y="52" width="13" height="26" fill="${t.lime}" opacity=".9">
      <animate attributeName="x" begin="0.3s" dur="2.2s" fill="freeze" calcMode="discrete" values="60;81;102;123;144;165;186;207;228;249;270;291;312;333;354;375;396;417;438;459;480;501;522;543;564;585;606;627;648;669;690"/>
    </rect>

    <g class="rise r1"><text x="56" y="178" font-family="${SANS}" font-weight="800" font-size="100" letter-spacing="-3" fill="url(#nm)">Chris Cushman</text></g>
    <g class="rise r2"><text x="60" y="236" font-family="${SANS}" font-weight="700" font-size="42" fill="${t.ink}">Senior full-stack engineer</text></g>
    <g class="rise r3">
      <text x="60" y="284" font-family="${MONO}" font-size="24" fill="${t.soft}">Kotlin · Spring Boot · Java · TypeScript · React · PostgreSQL · AWS</text>
    </g>
    <g class="rise r4">
      <rect x="60" y="312" width="6" height="58" rx="3" fill="url(#ln)"/>
      <text font-family="${SANS}" font-size="26" fill="${t.ink}">
        <tspan x="84" y="335">I ship production software with AI coding agents,</tspan>
        <tspan x="84" y="367" fill="${t.soft}">backed by plans, written conventions, guard scripts and tests.</tspan>
      </text>
    </g>

    <g transform="translate(905 66)">
      <rect width="235" height="40" rx="20" fill="${t.chip}" stroke="${t.line}"/>
      <circle class="live" cx="24" cy="20" r="6" fill="${t.lime}"/>
      <text x="40" y="27" font-family="${MONO}" font-size="18" fill="${t.ink}">Seattle · 19 yrs</text>
    </g>

    <g class="ride">${A.fade}<g mask="url(#band)">${A.terrain}</g>${A.bike}</g>
    <g class="still"><g mask="url(#band)">${Z.terrain}</g>${Z.bike}</g>
    <rect x="${W - 60 - 14 - Math.ceil(A.caption.length * 16 * 0.6)}" y="${H - 18 - 19}" width="${Math.ceil(A.caption.length * 16 * 0.6) + 28}" height="28" rx="14" fill="${t.bg}" fill-opacity=".97" stroke="${t.line}"/>
    <text x="${W - 60}" y="${H - 18}" text-anchor="end" font-family="${MONO}" font-size="16" fill="${t.faint}" stroke="${t.bg}" stroke-width="5" stroke-linejoin="round" paint-order="stroke">${esc(A.caption)}</text>
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="none" stroke="${t.line}"/>
</svg>`;
}

// ------------------------------------------------------- private-work strips
const STRIPS = [
  {
    file: 'work-out4', name: 'out4.events', accent: 'lime',
    what: 'Event ticketing + social. Founded and built.',
    stack: 'Kotlin · Spring Boot · Next.js · React Native',
    stats: [['2,400', 'commits in 7 months'], ['2,900', 'automated API tests'], ['500+', 'API endpoints']],
  },
  {
    file: 'work-supdox', name: 'Supdox', accent: 'cyan',
    what: 'AI document platform. Co-founder, tech lead.',
    stack: 'Cloudflare · Hono · D1 · R2 · Durable Objects',
    stats: [['6,400+', 'automated tests'], ['40', 'releases in 7 months'], ['~90%', 'extraction accuracy']],
  },
  {
    file: 'work-sitehound', name: 'Sitehound', accent: 'pink',
    what: 'Telecom supply-chain SaaS. Principal eng → CTO.',
    stack: 'PostgreSQL · AWS (RDS, S3, SQS) · plugins',
    stats: [['100M+', 'records, 50+ tenants'], ['0', 'unplanned outages'], ['~90%', 'cost cut per env']],
  },
];

function strip(s, mode, i) {
  const t = THEMES[mode];
  const a = t[s.accent];
  const W = 1200, H = 250;
  const cols = s.stats.map(([n, label], k) => {
    const x = 560 + k * 215;
    return `<g class="in d${k}">
      <text x="${x}" y="128" font-family="${SANS}" font-weight="800" font-size="62" letter-spacing="-1.5" fill="${k === 0 ? a : t.ink}">${esc(n)}</text>
      <text x="${x}" y="166" font-family="${SANS}" font-size="21" fill="${t.soft}">${esc(label)}</text>
    </g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
  <title id="t">${esc(`${s.name}: ${s.what} ${s.stats.map((x) => x.join(' ')).join(', ')}. ${s.stack}.`)}</title>
  <defs><clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    <linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="${a}" stop-opacity="0"/><stop offset=".5" stop-color="${a}" stop-opacity=".9"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></linearGradient></defs>
  <style>
    .in{animation:in .7s cubic-bezier(.2,.8,.2,1) backwards}
    .d0{animation-delay:.15s}.d1{animation-delay:.3s}.d2{animation-delay:.45s}
    @keyframes in{from{opacity:0;transform:translateY(14px)}}
    .scan{animation:scan 5s ease-in-out ${i * 0.8}s infinite}
    @keyframes scan{0%{transform:translateX(-400px)}60%,100%{transform:translateX(1300px)}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}.in{opacity:1}}
  </style>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${t.panel}"/>
    <rect width="10" height="${H}" fill="${a}"/>
    <rect class="scan" y="${H - 4}" width="400" height="4" fill="url(#sh)"/>
    <g transform="translate(48 50)">
      <rect width="196" height="34" rx="17" fill="${t.chip}" stroke="${t.line}"/>
      <path d="M20 16v-3a6 6 0 0 1 12 0v3" fill="none" stroke="${t.soft}" stroke-width="2.4"/><rect x="17" y="15" width="18" height="12" rx="2.5" fill="${t.soft}"/>
      <text x="44" y="23" font-family="${MONO}" font-size="15" fill="${t.soft}">private · in prod</text>
    </g>
    <text x="48" y="140" font-family="${SANS}" font-weight="800" font-size="50" letter-spacing="-1" fill="${t.ink}">${esc(s.name)}</text>
    <text x="48" y="178" font-family="${SANS}" font-size="20" fill="${t.soft}">${esc(s.what)}</text>
    <text x="48" y="212" font-family="${MONO}" font-size="17" fill="${t.faint}">${esc(s.stack)}</text>
    <line x1="530" y1="60" x2="530" y2="190" stroke="${t.line}" stroke-width="2"/>
    ${cols}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${t.line}"/>
</svg>`;
}

// --------------------------------------------------------------- project cards
const CARDS = [
  { repo: 'companion', accent: 'lime', icon: 'phone', tag: ['A phone companion for', 'Claude Code sessions'], fact: '610 commits · 6 platforms, 1 codebase', chips: ['React', 'Tauri', 'Node'] },
  { repo: 'codegrind', accent: 'cyan', icon: 'code', tag: ['AI interview trainer that', 'proves problems solvable'], fact: 'reference runs in a sandbox first', chips: ['TypeScript', 'Docker', 'LLMs'] },
  { repo: 'porch', accent: 'amber', icon: 'door', tag: ['Self-hosted tunnels,', 'shares and doors'], fact: 'E2E shares · one box, your domain', chips: ['Python', 'HTTPS', 'PWA'] },
  { repo: 'music-errywhere', accent: 'pink', icon: 'wave', tag: ['Multi-room synced audio', 'with a guest-friendly PWA'], fact: 'sample-aligned · sub-5 ms drift', chips: ['TypeScript', 'Snapcast', 'Pi'] },
  { repo: 'photobooth', accent: 'amber', icon: 'camera', tag: ['Raspberry Pi 5 photo booth', 'with a browser UI'], fact: '14 effects · plugins · CUPS print', chips: ['Python', 'FastAPI', 'picamera2'] },
  { repo: 'hexi-studio', accent: 'cyan', icon: 'image', tag: ['Self-hosted photo platform', 'and image CDN'], fact: 'Cloudflare Workers or Docker', chips: ['TypeScript', 'Hono', 'R2'] },
];

const ICONS = {
  phone: (c) => `<rect x="-14" y="-24" width="28" height="48" rx="6" fill="none" stroke="${c}" stroke-width="4"/><path d="M-5 16h10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  code: (c) => `<path d="M-10-14L-24 0l14 14M10-14L24 0 10 14" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  door: (c) => `<path d="M-16 24V-22h28v46M-24 24h40" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><circle cx="5" cy="2" r="3.5" fill="${c}"/>`,
  wave: (c) => `<path d="M-26 0h6l5-16 8 32 8-26 6 20 5-10h14" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  camera: (c) => `<rect x="-24" y="-14" width="48" height="34" rx="6" fill="none" stroke="${c}" stroke-width="4"/><path d="M-10-14l4-8h12l4 8" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><circle cy="3" r="9" fill="none" stroke="${c}" stroke-width="4"/>`,
  image: (c) => `<rect x="-24" y="-20" width="48" height="40" rx="6" fill="none" stroke="${c}" stroke-width="4"/><path d="M-20 16l14-14 10 10 6-6 10 10" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><circle cx="10" cy="-8" r="4" fill="${c}"/>`,
};

function card(c, mode, i) {
  const t = THEMES[mode];
  const a = t[c.accent];
  const W = 600, H = 330;
  let cx = 40;
  const chips = c.chips.map((ch) => {
    const w = ch.length * 13 + 30;
    const g = `<rect x="${cx}" y="262" width="${w}" height="38" rx="19" fill="${t.chip}" stroke="${t.line}"/><text x="${cx + w / 2}" y="288" text-anchor="middle" font-family="${MONO}" font-size="19" fill="${t.ink}">${esc(ch)}</text>`;
    cx += w + 10;
    return g;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
  <title id="t">${esc(`${c.repo}: ${c.tag.join(' ')}. ${c.fact}.`)}</title>
  <defs><clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    <radialGradient id="gl"><stop offset="0" stop-color="${a}" stop-opacity="${t.glowA * 0.7}"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient></defs>
  <style>
    .gl{animation:gl ${6 + i}s ease-in-out infinite alternate}
    @keyframes gl{to{transform:translate(-120px,40px) scale(1.2)}}
    .ic{animation:bob 3s ease-in-out ${i * 0.3}s infinite}
    @keyframes bob{50%{transform:translateY(-5px)}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}}
  </style>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${t.panel}"/>
    <circle class="gl" cx="560" cy="40" r="220" fill="url(#gl)"/>
    <rect width="${W}" height="6" fill="${a}"/>
    <g transform="translate(528 78)"><g class="ic">${ICONS[c.icon](a)}</g></g>
    <text x="40" y="96" font-family="${SANS}" font-weight="800" font-size="50" letter-spacing="-1" fill="${t.ink}">${esc(c.repo)}</text>
    <text font-family="${SANS}" font-size="27" fill="${t.ink}"><tspan x="40" y="150">${esc(c.tag[0])}</tspan><tspan x="40" y="186">${esc(c.tag[1])}</tspan></text>
    <text x="40" y="232" font-family="${MONO}" font-size="20" fill="${a}">${esc(c.fact)}</text>
    ${chips}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${t.line}"/>
</svg>`;
}

for (const mode of ['dark', 'light']) {
  write(`hero-${mode}.svg`, hero(mode));
  STRIPS.forEach((s, i) => write(`${s.file}-${mode}.svg`, strip(s, mode, i)));
  CARDS.forEach((c, i) => write(`card-${c.repo}-${mode}.svg`, card(c, mode, i)));
  write(`play-${mode}.svg`, play(mode));
}
console.log('wrote', 2 * (2 + STRIPS.length + CARDS.length), 'svgs to', OUT);

// ------------------------------------------------------------- play button
function play(mode) {
  const t = THEMES[mode];
  const W = 760, H = 120;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
  <title id="t">Play velo, my browser motorbike physics game, and visit my site</title>
  <defs>
    <linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="${t.lime}"/><stop offset=".55" stop-color="${t.cyan}"/><stop offset="1" stop-color="${t.pink}"/>
      <animateTransform attributeName="gradientTransform" type="translate" values="-0.3 0;0.3 0;-0.3 0" dur="6s" repeatCount="indefinite"/></linearGradient>
    <clipPath id="c"><rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="${(H - 8) / 2}"/></clipPath>
  </defs>
  <style>
    .sh{animation:sh 3.2s ease-in-out infinite}
    @keyframes sh{0%{transform:translateX(-200px)}70%,100%{transform:translateX(${W + 200}px)}}
    .tri{animation:pu 1.4s ease-in-out infinite;transform-origin:68px 60px;transform-box:view-box}
    @keyframes pu{50%{transform:scale(1.15)}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}}
  </style>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="url(#b)"/>
    <rect class="sh" x="-120" y="0" width="90" height="${H}" fill="#fff" opacity=".28" transform="skewX(-20)"/>
  </g>
  <circle cx="68" cy="60" r="36" fill="#0a0b14"/>
  <path class="tri" d="M58 42L86 60 58 78Z" fill="#c6ff3d"/>
  <text x="124" y="57" font-family="${SANS}" font-weight="800" font-size="34" fill="#0a0b14">PLAY VELO  ·  visit my site</text>
  <text x="124" y="88" font-family="${MONO}" font-size="19" fill="#0a0b14" opacity=".8">a 2D motorbike physics game I wrote, in your browser</text>
</svg>`;
}
