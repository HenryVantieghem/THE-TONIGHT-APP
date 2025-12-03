const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Indigo palette
const indigo = '#6366F1';
const indigoLight = '#818CF8';
const indigoDark = '#4F46E5';
const white = '#FFFFFF';

// Create skeuomorphic map + camera icon
function createIconSVG(size) {
  const s = size; // shorthand
  const center = s / 2;

  return Buffer.from(`
    <svg width="${s}" height="${s}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background gradient -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${indigoLight}"/>
          <stop offset="50%" style="stop-color:${indigo}"/>
          <stop offset="100%" style="stop-color:${indigoDark}"/>
        </linearGradient>

        <!-- Lens gradient for 3D effect -->
        <radialGradient id="lensGrad" cx="35%" cy="35%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4"/>
          <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.1"/>
          <stop offset="100%" style="stop-color:#000000;stop-opacity:0.2"/>
        </radialGradient>

        <!-- Pin gradient -->
        <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#EF4444"/>
          <stop offset="100%" style="stop-color:#DC2626"/>
        </linearGradient>

        <!-- Shadow filter -->
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="${s * 0.02}" stdDeviation="${s * 0.03}" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- Rounded background -->
      <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="url(#bgGrad)"/>

      <!-- Folded map shape -->
      <g filter="url(#shadow)">
        <!-- Map base -->
        <path d="
          M ${s * 0.2} ${s * 0.25}
          L ${s * 0.5} ${s * 0.2}
          L ${s * 0.8} ${s * 0.25}
          L ${s * 0.8} ${s * 0.65}
          L ${s * 0.5} ${s * 0.7}
          L ${s * 0.2} ${s * 0.65}
          Z
        " fill="${white}" fill-opacity="0.95"/>

        <!-- Map fold lines -->
        <line x1="${s * 0.35}" y1="${s * 0.22}" x2="${s * 0.35}" y2="${s * 0.67}"
              stroke="${indigo}" stroke-width="${s * 0.005}" stroke-opacity="0.3"/>
        <line x1="${s * 0.65}" y1="${s * 0.22}" x2="${s * 0.65}" y2="${s * 0.67}"
              stroke="${indigo}" stroke-width="${s * 0.005}" stroke-opacity="0.3"/>

        <!-- Map grid/streets -->
        <line x1="${s * 0.25}" y1="${s * 0.35}" x2="${s * 0.75}" y2="${s * 0.35}"
              stroke="${indigo}" stroke-width="${s * 0.008}" stroke-opacity="0.2"/>
        <line x1="${s * 0.25}" y1="${s * 0.5}" x2="${s * 0.75}" y2="${s * 0.5}"
              stroke="${indigo}" stroke-width="${s * 0.008}" stroke-opacity="0.2"/>
      </g>

      <!-- Location pin -->
      <g filter="url(#shadow)">
        <path d="
          M ${s * 0.5} ${s * 0.6}
          C ${s * 0.5} ${s * 0.6} ${s * 0.38} ${s * 0.45} ${s * 0.38} ${s * 0.38}
          C ${s * 0.38} ${s * 0.31} ${s * 0.44} ${s * 0.26} ${s * 0.5} ${s * 0.26}
          C ${s * 0.56} ${s * 0.26} ${s * 0.62} ${s * 0.31} ${s * 0.62} ${s * 0.38}
          C ${s * 0.62} ${s * 0.45} ${s * 0.5} ${s * 0.6} ${s * 0.5} ${s * 0.6}
          Z
        " fill="url(#pinGrad)"/>
        <!-- Pin center dot -->
        <circle cx="${s * 0.5}" cy="${s * 0.38}" r="${s * 0.05}" fill="${white}"/>
      </g>

      <!-- Camera lens (bottom right) -->
      <g filter="url(#shadow)">
        <!-- Outer ring -->
        <circle cx="${s * 0.72}" cy="${s * 0.72}" r="${s * 0.18}"
                fill="${white}" stroke="${indigoDark}" stroke-width="${s * 0.02}"/>
        <!-- Inner lens -->
        <circle cx="${s * 0.72}" cy="${s * 0.72}" r="${s * 0.12}" fill="${indigoDark}"/>
        <!-- Lens reflection -->
        <circle cx="${s * 0.72}" cy="${s * 0.72}" r="${s * 0.12}" fill="url(#lensGrad)"/>
        <!-- Aperture blades hint -->
        <circle cx="${s * 0.72}" cy="${s * 0.72}" r="${s * 0.06}"
                fill="none" stroke="${white}" stroke-width="${s * 0.01}" stroke-opacity="0.5"/>
      </g>
    </svg>
  `);
}

// Create splash screen
function createSplashSVG(width, height) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${indigoLight}"/>
          <stop offset="50%" style="stop-color:${indigo}"/>
          <stop offset="100%" style="stop-color:${indigoDark}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#splashGrad)"/>
    </svg>
  `);
}

async function generateIcons() {
  console.log('Generating app icons...\n');

  try {
    // 1. Generate icon.png (1024x1024)
    console.log('Creating icon.png (1024x1024)...');
    await sharp(createIconSVG(1024))
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('Done: icon.png\n');

    // 2. Generate adaptive-icon.png (1024x1024)
    console.log('Creating adaptive-icon.png (1024x1024)...');
    await sharp(createIconSVG(1024))
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('Done: adaptive-icon.png\n');

    // 3. Generate splash.png (1284x2778)
    console.log('Creating splash.png (1284x2778)...');
    await sharp(createSplashSVG(1284, 2778))
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('Done: splash.png\n');

    // 4. Generate favicon.png (48x48)
    console.log('Creating favicon.png (48x48)...');
    await sharp(createIconSVG(512))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    console.log('Done: favicon.png\n');

    console.log('All icons generated successfully!');
    console.log(`Icons saved to: ${assetsDir}`);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
