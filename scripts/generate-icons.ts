import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createSolidPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      
      // Draw a subtle border and inner shape for ceiling applet
      const isEdge = x < 8 || x >= width - 8 || y < 8 || y >= height - 8;
      const isCornerMark = (x >= 24 && x <= 48 && y >= 24 && y <= 48) || 
                           (x >= width - 48 && x <= width - 24 && y >= 24 && y <= 48) ||
                           (x >= 24 && x <= 48 && y >= height - 48 && y <= height - 24) ||
                           (x >= width - 48 && x <= width - 24 && y >= height - 48 && y <= height - 24);
      
      const isCenter = Math.hypot(x - width / 2, y - height / 2) < width * 0.28;

      if (isEdge) {
        rawData[pixelOffset] = 2; // #0284c7 border
        rawData[pixelOffset + 1] = 132;
        rawData[pixelOffset + 2] = 199;
        rawData[pixelOffset + 3] = 255;
      } else if (isCornerMark) {
        rawData[pixelOffset] = 245; // Amber corner marks
        rawData[pixelOffset + 1] = 158;
        rawData[pixelOffset + 2] = 11;
        rawData[pixelOffset + 3] = 255;
      } else if (isCenter) {
        rawData[pixelOffset] = 30; // Deep ceiling blue
        rawData[pixelOffset + 1] = 58;
        rawData[pixelOffset + 2] = 138;
        rawData[pixelOffset + 3] = 255;
      } else {
        rawData[pixelOffset] = r; // Background #0f172a
        rawData[pixelOffset + 1] = g;
        rawData[pixelOffset + 2] = b;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf: Buffer): number {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc ^ byte) & 1 ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return (crc ^ -1) >>> 0;
  }

  function chunk(type: string, data: Buffer): Buffer {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflated);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192, 512x512, maskable 512x512, apple-touch-icon 180x180, favicon
const pwa192 = createSolidPng(192, 192, 15, 23, 42);
const pwa512 = createSolidPng(512, 512, 15, 23, 42);
const apple180 = createSolidPng(180, 180, 15, 23, 42);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple180);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), apple180);

console.log('PWA PNG icons generated successfully in public/');
