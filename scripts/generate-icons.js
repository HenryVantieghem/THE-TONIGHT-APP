const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Colors
const color1 = '#FF6B6B'; // Top-left
const color2 = '#FF8E53'; // Bottom-right
const white = '#FFFFFF';

// Helper to create gradient SVG
function createGradientSVG(width, height, text = null, fontSize = null) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      ${text ? `
        <text 
          x="50%" 
          y="50%" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize || width / 4}" 
          font-weight="bold" 
          fill="${white}" 
          text-anchor="middle" 
          dominant-baseline="central"
        >${text}</text>
      ` : ''}
    </svg>
  `;
  return Buffer.from(svg);
}

async function generateIcons() {
  console.log('🎨 Generating app icons...\n');

  try {
    // 1. Generate icon.png (1024x1024) - with "T" letter
    console.log('Creating icon.png (1024x1024)...');
    const iconSvg = createGradientSVG(1024, 1024, 'T', 400);
    await sharp(iconSvg)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png created\n');

    // 2. Generate splash.png (1284x2778) - with "Tonight" text
    console.log('Creating splash.png (1284x2778)...');
    const splashSvg = createGradientSVG(1284, 2778, 'Tonight', 120);
    await sharp(splashSvg)
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✅ splash.png created\n');

    // 3. Generate adaptive-icon.png (1024x1024) - same as icon
    console.log('Creating adaptive-icon.png (1024x1024)...');
    await sharp(iconSvg)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png created\n');

    console.log('✨ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${assetsDir}`);
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

