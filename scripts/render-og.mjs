import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('public/og-default.svg');

await sharp(svg, { density: 96 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, quality: 100 })
  .toFile('public/og-default.png');

console.log('Rendered public/og-default.png (1200x630)');
