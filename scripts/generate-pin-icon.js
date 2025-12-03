/* eslint-env node */
/* global __dirname, Buffer */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Sizes needed for iOS and Android
const sizes = {
  icon: 1024,  // App Store
  adaptive: 192, // Android adaptive icon
};

async function generatePinIcon() {
  console.log('🎨 Generating Tonight app icon with pin emoji...');

  // Create SVG for the icon
  const iconSvg = `
    <svg width="${sizes.icon}" height="${sizes.icon}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F5F5F5;stop-opacity:1" />
        </radialGradient>
        <filter id="shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="15"/>
          <feOffset dx="0" dy="10" result="offsetblur"/>
          <feFlood flood-color="#000000" flood-opacity="0.2"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFFC00;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFD60A;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${sizes.icon}" height="${sizes.icon}" rx="227" fill="url(#bg)"/>
      
      <!-- Pin emoji stylized (larger, centered) -->
      <g transform="translate(512, 512)" filter="url(#shadow)">
        <!-- Pin circle base -->
        <circle cx="0" cy="-100" r="180" fill="url(#pinGradient)" opacity="0.95"/>
        <!-- Pin point -->
        <path d="M 0,-280 L -60,0 L 60,0 Z" fill="url(#pinGradient)" opacity="0.95"/>
        <!-- Highlight for 3D effect -->
        <ellipse cx="-40" cy="-120" rx="60" ry="80" fill="white" opacity="0.3"/>
      </g>
    </svg>
  `;

  try {
    // Generate main icon
    await sharp(Buffer.from(iconSvg))
      .resize(sizes.icon, sizes.icon)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    
    console.log('✓ Generated icon.png (1024x1024)');

    // Generate adaptive icon for Android
    await sharp(Buffer.from(iconSvg))
      .resize(sizes.adaptive, sizes.adaptive)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    
    console.log('✓ Generated adaptive-icon.png (192x192)');

    // Generate favicon
    await sharp(Buffer.from(iconSvg))
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png'));
    
    console.log('✓ Generated favicon.png (48x48)');

    console.log('✅ All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generatePinIcon();

