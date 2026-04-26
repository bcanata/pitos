import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const splashDir = path.join(publicDir, 'splash');

  mkdirSync(iconsDir, { recursive: true });
  mkdirSync(splashDir, { recursive: true });

  const source = path.join(publicDir, 'logo.png');
  const brand = { r: 0x51, g: 0x2f, b: 0x75, alpha: 255 };

  // Regular icons
  for (const size of [192, 256, 384, 512]) {
    await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  // Maskable icon — logo at 65% inside a solid brand-color square
  {
    const size = 512;
    const logoSize = Math.floor(size * 0.65);
    const offset = Math.floor((size - logoSize) / 2);
    const logo = await sharp(source)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: brand } })
      .composite([{ input: logo, top: offset, left: offset }])
      .png()
      .toFile(path.join(iconsDir, 'icon-maskable-512.png'));
    console.log('✓ icon-maskable-512.png');
  }

  // Monochrome icon — grayscale silhouette
  await sharp(source)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .grayscale()
    .png()
    .toFile(path.join(iconsDir, 'icon-monochrome-512.png'));
  console.log('✓ icon-monochrome-512.png');

  // Apple touch icons — logo on brand background (iOS strips transparency)
  for (const { size, name } of [
    { size: 180, name: 'apple-touch-icon' },
    { size: 167, name: 'apple-touch-icon-167' },
    { size: 152, name: 'apple-touch-icon-152' },
    { size: 120, name: 'apple-touch-icon-120' },
  ]) {
    const logoSize = Math.floor(size * 0.75);
    const offset = Math.floor((size - logoSize) / 2);
    const logo = await sharp(source)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: brand } })
      .composite([{ input: logo, top: offset, left: offset }])
      .png()
      .toFile(path.join(publicDir, `${name}.png`));
    console.log(`✓ ${name}.png`);
  }

  // iOS splash screens — logo centered on brand background
  const splashes = [
    { w: 640, h: 1136 },
    { w: 750, h: 1334 },
    { w: 1242, h: 2208 },
    { w: 1125, h: 2436 },
    { w: 828, h: 1792 },
    { w: 1170, h: 2532 },
    { w: 1179, h: 2556 },
    { w: 1290, h: 2796 },
    { w: 1536, h: 2048 },
    { w: 2048, h: 2732 },
  ];

  for (const { w, h } of splashes) {
    const logoSize = Math.floor(Math.min(w, h) * 0.33);
    const logo = await sharp(source)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const left = Math.floor((w - logoSize) / 2);
    const top = Math.floor((h - logoSize) / 2);
    await sharp({ create: { width: w, height: h, channels: 3, background: brand } })
      .composite([{ input: logo, top, left }])
      .png()
      .toFile(path.join(splashDir, `splash-${w}x${h}.png`));
    console.log(`✓ splash-${w}x${h}.png`);
  }

  console.log('\nAll PWA assets generated successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
