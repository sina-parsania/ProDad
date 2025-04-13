#!/usr/bin/env node

/**
 * This script generates PWA icons for the ProDad application.
 * It creates icons in all necessary sizes for PWA standards.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the icons directory exists
const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create an SVG based on the ProDadLogo component
const generateLogoSVG = () => {
  // Colors based on the application theme
  const primaryColor = '#4f46e5'; // Indigo color as used in the theme
  const primaryColorLight = 'rgba(79, 70, 229, 0.15)';

  // SVG markup based on the ProDadLogo component
  return `<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Large circle (father) with gap -->
    <path d="M60 10c27.614 0 50 22.386 50 50s-22.386 50-50 50-50-22.386-50-50 22.386-50 50-50z" fill="${primaryColorLight}" />
    <path d="M110 60c0 27.614-22.386 50-50 50S10 87.614 10 60 32.386 10 60 10s50 22.386 50 50z M60 110V85" stroke="${primaryColor}" stroke-width="12" stroke-linecap="round" fill="none" stroke-dasharray="275" stroke-dashoffset="60" />
    
    <!-- Small circle (child) -->
    <circle cx="60" cy="55" r="15" fill="${primaryColor}" />
  </svg>`;
};

// Icon sizes for PWA
const sizes = [48, 72, 96, 144, 192, 512];

// Generate the SVG content
const svgContent = generateLogoSVG();

// Create a temporary SVG file
const tempSvgPath = path.join(iconsDir, 'temp-logo.svg');
fs.writeFileSync(tempSvgPath, svgContent);

// Generate icons for all sizes
async function generateIcons() {
  console.log('Generating PWA icons for ProDad...');

  const svgBuffer = fs.readFileSync(tempSvgPath);

  // Generate each icon size
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);

      console.log(`✅ Generated ${outputPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${outputPath}:`, error);
    }
  }

  // Remove temporary SVG
  fs.unlinkSync(tempSvgPath);

  console.log('✅ All icons generated successfully!');
}

// Run the icon generation
generateIcons().catch((err) => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
