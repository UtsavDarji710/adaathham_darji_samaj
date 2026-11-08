import fs from "fs";
import zlib from "zlib";

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width = 0, height = 0;
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (type === "IHDR") {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === "IDAT") {
      idats.push(buf.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  
  let srcPos = 0;
  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcPos++];
    const lineStart = y * stride;
    const prevLineStart = (y - 1) * stride;

    for (let x = 0; x < stride; x++) {
      const rawByte = decompressed[srcPos++];
      const a = x >= bpp ? pixels[lineStart + x - bpp] : 0;
      const b = y > 0 ? pixels[prevLineStart + x] : 0;
      const c = (x >= bpp && y > 0) ? pixels[prevLineStart + x - bpp] : 0;

      let val = rawByte;
      if (filter === 0) {
        val = rawByte;
      } else if (filter === 1) { // Sub
        val = (rawByte + a) & 0xff;
      } else if (filter === 2) { // Up
        val = (rawByte + b) & 0xff;
      } else if (filter === 3) { // Average
        val = (rawByte + Math.floor((a + b) / 2)) & 0xff;
      } else if (filter === 4) { // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (rawByte + pr) & 0xff;
      }
      pixels[lineStart + x] = val;
    }
  }
  return { width, height, pixels };
}

function encodePNG(width, height, pixels) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk("IHDR", ihdrData);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let dest = 0;
  for (let y = 0; y < height; y++) {
    scanlines[dest++] = 0;
    const src = y * width * 4;
    pixels.copy(scanlines, dest, src, src + width * 4);
    dest += width * 4;
  }

  const idat = makeChunk("IDAT", zlib.deflateSync(scanlines, { level: 9 }));
  const iend = makeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

/**
 * Resample source image with bilinear filtering and place in target canvas
 * @param {Object} src - { width, height, pixels }
 * @param {number} targetSize - Target width/height (square)
 * @param {number} scaleRatio - Scale of logo relative to target canvas (0.0 to 1.0)
 * @param {number[]} [bgColor] - Optional background [R, G, B, A]
 */
function renderIcon(src, targetSize, scaleRatio, bgColor = [0, 0, 0, 0]) {
  const target = Buffer.alloc(targetSize * targetSize * 4);

  // Initialize canvas with background color
  for (let i = 0; i < targetSize * targetSize; i++) {
    target[i * 4] = bgColor[0];
    target[i * 4 + 1] = bgColor[1];
    target[i * 4 + 2] = bgColor[2];
    target[i * 4 + 3] = bgColor[3];
  }

  const logoSize = Math.round(targetSize * scaleRatio);
  const offsetX = Math.round((targetSize - logoSize) / 2);
  const offsetY = Math.round((targetSize - logoSize) / 2);

  for (let ty = 0; ty < logoSize; ty++) {
    const sy = (ty / logoSize) * (src.height - 1);
    const y0 = Math.floor(sy);
    const y1 = Math.min(y0 + 1, src.height - 1);
    const fy = sy - y0;

    for (let tx = 0; tx < logoSize; tx++) {
      const sx = (tx / logoSize) * (src.width - 1);
      const x0 = Math.floor(sx);
      const x1 = Math.min(x0 + 1, src.width - 1);
      const fx = sx - x0;

      const idx00 = (y0 * src.width + x0) * 4;
      const idx10 = (y0 * src.width + x1) * 4;
      const idx01 = (y1 * src.width + x0) * 4;
      const idx11 = (y1 * src.width + x1) * 4;

      const destX = offsetX + tx;
      const destY = offsetY + ty;
      if (destX < 0 || destX >= targetSize || destY < 0 || destY >= targetSize) continue;
      const destIdx = (destY * targetSize + destX) * 4;

      // Bilinear interpolation for each RGBA channel
      const c = [0, 0, 0, 0];
      for (let ch = 0; ch < 4; ch++) {
        const top = src.pixels[idx00 + ch] * (1 - fx) + src.pixels[idx10 + ch] * fx;
        const bottom = src.pixels[idx01 + ch] * (1 - fx) + src.pixels[idx11 + ch] * fx;
        c[ch] = Math.round(top * (1 - fy) + bottom * fy);
      }

      // Alpha composite over background
      const srcA = c[3] / 255;
      const bgA = bgColor[3] / 255;
      const outA = srcA + bgA * (1 - srcA);

      if (outA > 0) {
        target[destIdx] = Math.round((c[0] * srcA + bgColor[0] * bgA * (1 - srcA)) / outA);
        target[destIdx + 1] = Math.round((c[1] * srcA + bgColor[1] * bgA * (1 - srcA)) / outA);
        target[destIdx + 2] = Math.round((c[2] * srcA + bgColor[2] * bgA * (1 - srcA)) / outA);
        target[destIdx + 3] = Math.round(outA * 255);
      }
    }
  }

  return encodePNG(targetSize, targetSize, target);
}

// 1. Load high-res base logo
console.log("Loading base logo: public/logo.png...");
const baseLogo = decodePNG("public/logo.png");
console.log(`Decoded logo: ${baseLogo.width}x${baseLogo.height}`);

// Background colors
const IVORY_BG = [253, 251, 247, 255]; // #FDFBF7 (PWA background color)
const WHITE_BG = [255, 255, 255, 255]; // #FFFFFF
const TRANSPARENT = [0, 0, 0, 0];

// 2. Generate Standard Launcher Icons (purpose: "any")
// 92% logo content scale leaves a clean 4% border margin so standard square icons never bleed.
console.log("Generating Standard Launcher Icons (purpose: any)...");
const icon192 = renderIcon(baseLogo, 192, 0.92, TRANSPARENT);
fs.writeFileSync("public/icon-192x192.png", icon192);

const icon512 = renderIcon(baseLogo, 512, 0.92, TRANSPARENT);
fs.writeFileSync("public/icon-512x512.png", icon512);

// 3. Generate Android Adaptive Maskable Icons (purpose: "maskable")
// Standard W3C & Android Adaptive Icon safe-zone circle diameter is 80% (radius 40%).
// We set scale to 70% centered on brand ivory background (#FDFBF7).
// This guarantees that ANY Android adaptive mask (circle, squircle, pebble, rounded-rect)
// displays the entire logo without touching any edges!
console.log("Generating Android Adaptive Maskable Icons (purpose: maskable)...");
const iconMaskable192 = renderIcon(baseLogo, 192, 0.70, IVORY_BG);
fs.writeFileSync("public/icon-maskable-192x192.png", iconMaskable192);

const iconMaskable512 = renderIcon(baseLogo, 512, 0.70, IVORY_BG);
fs.writeFileSync("public/icon-maskable-512x512.png", iconMaskable512);

// 4. Generate Apple Touch Icon (180x180 for iOS)
console.log("Generating Apple Touch Icon...");
const appleIcon = renderIcon(baseLogo, 180, 0.85, WHITE_BG);
fs.writeFileSync("public/apple-touch-icon.png", appleIcon);

// 5. Generate Favicons (32x32, 16x16)
console.log("Generating crisp Favicons...");
const fav32 = renderIcon(baseLogo, 32, 0.95, TRANSPARENT);
fs.writeFileSync("public/favicon-32x32.png", fav32);

const fav16 = renderIcon(baseLogo, 16, 0.95, TRANSPARENT);
fs.writeFileSync("public/favicon-16x16.png", fav16);

console.log("✅ All icons generated successfully!");

