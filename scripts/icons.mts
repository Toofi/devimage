/**
 * Génère les icônes de la PWA (public/icons/icon-<taille>.png), sans dépendance :
 * le dessin est décrit par des formes (distances signées) et encodé en PNG à la main.
 *
 *   npm run icons
 *
 * Le motif : un mot (bande ocre) au-dessus de trois images, celle du milieu entourée au stylo rouge.
 * Tout tient dans la zone sûre des icônes « maskable » (cercle de 80 % au centre).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SUPERSAMPLING = 4;

type Rgb = readonly [number, number, number];
const PAPER: Rgb = [0xfb, 0xf6, 0xec];
const INK: Rgb = [0x2e, 0x2a, 0x26];
const WHITE: Rgb = [0xff, 0xfd, 0xf7];
const SAGE_SOFT: Rgb = [0xdc, 0xe6, 0xd6];
const OCHRE: Rgb = [0xd7, 0xa5, 0x3c];
const PEN: Rgb = [0xc0, 0x39, 0x2b];

/** Distance signée à un rectangle arrondi (négative à l'intérieur). Coordonnées entre 0 et 1. */
function roundedRect(
  x: number,
  y: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  r: number,
): number {
  const qx = Math.abs(x - cx) - hw + r;
  const qy = Math.abs(y - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

const TILE = 0.075;
const STROKE = 0.016;
const TILES_Y = 0.58;
const tileCenters = [0.25, 0.5, 0.75];

/** Couleur du motif en un point. */
function colorAt(x: number, y: number): Rgb {
  const ring = Math.abs(Math.hypot(x - 0.5, y - TILES_Y) - 0.118);
  if (ring < STROKE * 1.2) return PEN;

  for (const [i, cx] of tileCenters.entries()) {
    const d = roundedRect(x, y, cx, TILES_Y, TILE, TILE, 0.03);
    if (d < -STROKE) return i === 1 ? SAGE_SOFT : WHITE;
    if (d < 0) return INK;
  }

  const word = roundedRect(x, y, 0.5, 0.34, 0.2, 0.045, 0.02);
  if (word < -STROKE) return OCHRE;
  if (word < 0) return INK;

  return PAPER;
}

function render(size: number): Buffer {
  const rowBytes = size * 3 + 1;
  const raw = Buffer.alloc(rowBytes * size);
  const samples = SUPERSAMPLING * SUPERSAMPLING;
  for (let py = 0; py < size; py++) {
    raw[py * rowBytes] = 0; // filtre PNG « None »
    for (let px = 0; px < size; px++) {
      const sum = [0, 0, 0];
      for (let s = 0; s < samples; s++) {
        const x = (px + ((s % SUPERSAMPLING) + 0.5) / SUPERSAMPLING) / size;
        const y = (py + (Math.floor(s / SUPERSAMPLING) + 0.5) / SUPERSAMPLING) / size;
        colorAt(x, y).forEach((c, k) => (sum[k] += c));
      }
      sum.forEach((c, k) => (raw[py * rowBytes + 1 + px * 3 + k] = Math.round(c / samples)));
    }
  }
  return encodePng(size, raw);
}

function encodePng(size: number, raw: Buffer): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8 bits, RVB, sans entrelacement
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

await mkdir('public/icons', { recursive: true });
for (const size of SIZES) {
  await writeFile(`public/icons/icon-${size}x${size}.png`, render(size));
}
console.log(`${SIZES.length} icônes générées dans public/icons/`);
