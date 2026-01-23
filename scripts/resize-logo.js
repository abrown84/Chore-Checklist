import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const sourceImage = join(rootDir, 'public', 'dailybag-transparent.png');

async function resizeLogos() {
  console.log('Resizing dailybag.jpeg to all required sizes...\n');

  // PWA icons for public/ folder
  const publicSizes = [
    { name: 'favicon.png', size: 64 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'icon-144.png', size: 144 },
    { name: 'icon-152.png', size: 152 },
    { name: 'icon-180.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  // Source assets
  const srcAssets = [
    { name: 'daily-bag-icon.png', size: 512 },
    { name: 'daily-bag-icon-transparent.png', size: 512 },
    { name: 'daily-bag-icon-white.png', size: 512 },
  ];

  // Generate public icons
  for (const { name, size } of publicSizes) {
    const outputPath = join(rootDir, 'public', name);
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`✓ public/${name} (${size}x${size})`);
  }

  // Generate src/assets icons
  for (const { name, size } of srcAssets) {
    const outputPath = join(rootDir, 'src', 'assets', name);
    await sharp(sourceImage)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`✓ src/assets/${name} (${size}x${size})`);
  }

  console.log('\n✅ All icons generated successfully!');
}

resizeLogos().catch(console.error);
