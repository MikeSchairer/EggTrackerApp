import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. High-resolution brand SVG icon
const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="eggGrad" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#fef3c7" />
      <stop offset="85%" stop-color="#fde68a" />
      <stop offset="100%" stop-color="#fcd34d" />
    </linearGradient>
    <linearGradient id="sheenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#451a03" flood-opacity="0.45" />
    </filter>
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#78350f" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Squircle rounded background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Subtle inner border -->
  <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#fef3c7" stroke-width="4" stroke-opacity="0.35" />

  <!-- Warm ambient backdrop ring -->
  <circle cx="256" cy="270" r="160" fill="#fbbf24" opacity="0.25" />

  <!-- Nest twigs / base accents -->
  <path d="M 140 375 C 190 415 322 415 372 375 C 330 395 182 395 140 375 Z" fill="#78350f" opacity="0.35" />
  <path d="M 120 385 Q 256 425 392 385 Q 256 405 120 385 Z" fill="#451a03" opacity="0.3" />

  <!-- Golden Egg silhouette with 3D gradient & shadow -->
  <!-- Classic egg shape: narrower at top (cy ~ 180), wider at bottom (cy ~ 330) -->
  <path filter="url(#dropShadow)" d="M 256 120 C 180 120 135 210 135 300 C 135 375 185 415 256 415 C 327 415 377 375 377 300 C 377 210 332 120 256 120 Z" fill="url(#eggGrad)" />

  <!-- Egg sheen reflection -->
  <path d="M 200 160 C 170 200 160 250 162 290 C 160 240 175 190 208 155 C 215 147 210 148 200 160 Z" fill="url(#sheenGrad)" opacity="0.75" />
  
  <!-- Subtle top-left gloss dot -->
  <ellipse cx="215" cy="180" rx="14" ry="24" transform="rotate(-30 215 180)" fill="#ffffff" opacity="0.6" />

  <!-- Stylized Chicken Crown / Crest on the egg -->
  <g filter="url(#subtleGlow)">
    <!-- Small heart or comb badge emblem on the center of egg -->
    <path d="M 256 250 C 256 240 268 232 278 238 C 288 245 288 260 274 274 L 256 290 L 238 274 C 224 260 224 245 234 238 C 244 232 256 240 256 250 Z" fill="#b45309" opacity="0.85" />
    <!-- Mini sparkling stars -->
    <polygon points="340,170 345,182 357,187 345,192 340,204 335,192 323,187 335,182" fill="#fffbeb" opacity="0.9" />
    <polygon points="175,230 178,238 186,241 178,244 175,252 172,244 164,241 172,238" fill="#fffbeb" opacity="0.7" />
  </g>
</svg>`;

// 2. Maskable version with 15% safe padding
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="eggGradMask" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#fef3c7" />
      <stop offset="85%" stop-color="#fde68a" />
      <stop offset="100%" stop-color="#fcd34d" />
    </linearGradient>
    <filter id="dropShadowMask" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#451a03" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Full-bleed background for maskable (covers full square) -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />

  <!-- Egg centered with ~15% safe padding (fits in 80% circle) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <circle cx="256" cy="270" r="150" fill="#fbbf24" opacity="0.25" />
    <path filter="url(#dropShadowMask)" d="M 256 120 C 180 120 135 210 135 300 C 135 375 185 415 256 415 C 327 415 377 375 377 300 C 377 210 332 120 256 120 Z" fill="url(#eggGradMask)" />
    <ellipse cx="215" cy="180" rx="14" ry="24" transform="rotate(-30 215 180)" fill="#ffffff" opacity="0.6" />
    <path d="M 256 250 C 256 240 268 232 278 238 C 288 245 288 260 274 274 L 256 290 L 238 274 C 224 260 224 245 234 238 C 244 232 256 240 256 250 Z" fill="#b45309" opacity="0.85" />
    <polygon points="340,170 345,182 357,187 345,192 340,204 335,192 323,187 335,182" fill="#fffbeb" opacity="0.9" />
  </g>
</svg>`;

// 3. Splash Screen Image (1284x2778 high-res mobile startup image)
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1284 2778" width="1284" height="2778">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#292524" />
      <stop offset="70%" stop-color="#1c1917" />
      <stop offset="100%" stop-color="#0c0a09" />
    </radialGradient>
    <linearGradient id="eggGradSplash" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#fef3c7" />
      <stop offset="85%" stop-color="#fde68a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="splashGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="24" stdDeviation="40" flood-color="#d97706" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="1284" height="2778" fill="url(#splashBg)" />

  <!-- Ambient warm background glow -->
  <circle cx="642" cy="1180" r="420" fill="#d97706" opacity="0.12" filter="blur(80px)" />

  <!-- Center Egg Emblem -->
  <g transform="translate(642, 1180) scale(2.2)" filter="url(#splashGlow)">
    <!-- Base squircle container -->
    <rect x="-90" y="-90" width="180" height="180" rx="44" fill="#d97706" />
    <rect x="-86" y="-86" width="172" height="172" rx="40" fill="none" stroke="#fef3c7" stroke-width="2" stroke-opacity="0.4" />
    
    <!-- Egg in center -->
    <path d="M 0 -45 C -25 -45 -42 -12 -42 18 C -42 42 -24 55 0 55 C 24 55 42 42 42 18 C 42 -12 25 -45 0 -45 Z" fill="url(#eggGradSplash)" />
    <!-- Gloss -->
    <ellipse cx="-12" cy="-22" rx="4" ry="8" transform="rotate(-30 -12 -22)" fill="#ffffff" opacity="0.75" />
  </g>

  <!-- Title Text -->
  <text x="642" y="1520" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="800" fill="#fafaf9" letter-spacing="-1">
    Flocker
  </text>

  <!-- Subtitle Tagline -->
  <text x="642" y="1585" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="500" fill="#a8a29e" letter-spacing="1">
    HOMESTEAD POULTRY &amp; EGG MANAGER
  </text>

  <!-- Bottom Accent / Powered by Homestead -->
  <text x="642" y="2580" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600" fill="#78716c" letter-spacing="2">
    SMART FLOCK TRACKING
  </text>
</svg>`;

async function run() {
  console.log('Writing public/icon.svg...');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg, 'utf-8');

  console.log('Generating PNG icons via Sharp...');
  const brandBuffer = Buffer.from(brandSvg);
  const maskableBuffer = Buffer.from(maskableSvg);
  const splashBuffer = Buffer.from(splashSvg);

  // 192x192 PNG
  await sharp(brandBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512 PNG
  await sharp(brandBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 Maskable PNG
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // 180x180 Apple Touch Icon PNG
  await sharp(brandBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Splash Screen PNG for iOS and mobile bookmark
  await sharp(splashBuffer)
    .resize(1284, 2778)
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'apple-splash-1284x2778.png'));

  console.log('Successfully generated all PWA icons & splash assets!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
