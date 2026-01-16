import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Daily Bag Logo - Radiant Achievement Design
// A stylized money bag with checkmark in amber/orange gradient

const size = 512;
const padding = 40;
const bagWidth = size - (padding * 2);
const bagHeight = size - (padding * 2);

// Create SVG logo
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Main gradient - warm amber to deep orange -->
    <linearGradient id="bagGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FBBF24;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#F59E0B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EA580C;stop-opacity:1" />
    </linearGradient>

    <!-- Subtle highlight gradient for depth -->
    <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FCD34D;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:0" />
    </linearGradient>

    <!-- Shadow for subtle depth -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#92400E" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background (transparent) -->

  <!-- Main bag body - rounded bottom pouch -->
  <g filter="url(#shadow)">
    <!-- Bag body - organic rounded shape -->
    <path
      d="M 256 450
         C 140 450 80 380 80 280
         C 80 200 120 160 180 140
         L 180 120
         C 180 100 200 85 220 80
         L 220 70
         C 220 50 235 40 256 40
         C 277 40 292 50 292 70
         L 292 80
         C 312 85 332 100 332 120
         L 332 140
         C 392 160 432 200 432 280
         C 432 380 372 450 256 450
         Z"
      fill="url(#bagGradient)"
    />

    <!-- Bag tie/knot at top -->
    <ellipse
      cx="256"
      cy="130"
      rx="65"
      ry="20"
      fill="url(#bagGradient)"
    />

    <!-- Top opening detail -->
    <path
      d="M 200 95
         C 210 75 240 65 256 65
         C 272 65 302 75 312 95
         C 302 85 280 78 256 78
         C 232 78 210 85 200 95
         Z"
      fill="#D97706"
      opacity="0.5"
    />

    <!-- Highlight overlay for dimension -->
    <path
      d="M 256 450
         C 140 450 80 380 80 280
         C 80 200 120 160 180 140
         L 180 120
         C 180 100 200 85 220 80
         L 220 70
         C 220 50 235 40 256 40
         C 260 40 264 41 267 42
         L 267 70
         C 267 55 262 50 256 50
         C 250 50 230 55 230 75
         L 230 90
         C 215 95 195 105 195 125
         L 195 150
         C 150 170 115 210 115 285
         C 115 365 165 420 256 435
         C 180 420 130 370 130 285
         C 130 220 160 180 200 160
         L 200 130
         C 200 115 215 100 235 95
         L 235 80
         C 235 65 245 55 256 55
         C 265 55 275 62 277 75
         L 277 88
         Z"
      fill="url(#highlightGradient)"
    />
  </g>

  <!-- Checkmark - white, bold, centered -->
  <g transform="translate(256, 290)">
    <path
      d="M -70 -10
         L -25 35
         L 75 -65"
      fill="none"
      stroke="white"
      stroke-width="32"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
</svg>`;

// Save SVG
const svgPath = '../src/brand_assets/dailybag-logo-new.svg';
writeFileSync(new URL(svgPath, import.meta.url), svg);
console.log('SVG saved to:', svgPath);

// Convert to PNG using sharp
async function generatePNG() {
  try {
    const pngPath = '../src/brand_assets/dailybag-logo-new.png';
    await sharp(Buffer.from(svg))
      .resize(512, 512)
      .png()
      .toFile(new URL(pngPath, import.meta.url).pathname.slice(1));

    console.log('PNG saved to:', pngPath);

    // Also generate smaller sizes for various uses
    const sizes = [192, 180, 152, 144, 128, 96, 72, 48, 32, 16];

    for (const s of sizes) {
      const smallPath = `../src/brand_assets/dailybag-logo-${s}.png`;
      await sharp(Buffer.from(svg))
        .resize(s, s)
        .png()
        .toFile(new URL(smallPath, import.meta.url).pathname.slice(1));
      console.log(`Generated ${s}x${s} icon`);
    }

    console.log('\nAll logo sizes generated successfully!');
  } catch (err) {
    console.error('Error generating PNG:', err);
  }
}

generatePNG();
