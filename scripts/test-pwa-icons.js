#!/usr/bin/env node

/**
 * This script tests that the PWA icons setup is correct
 * It verifies that:
 * 1. The manifest.json file references the correct icons
 * 2. All the referenced icons exist in the /public/icons/ directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const manifestPath = path.join(publicDir, 'manifest.json');
const iconsDir = path.join(publicDir, 'icons');

console.log('Testing PWA icons setup...');

// Check if manifest.json exists
if (!fs.existsSync(manifestPath)) {
  console.error('❌ manifest.json not found!');
  process.exit(1);
}

// Check if icons directory exists
if (!fs.existsSync(iconsDir)) {
  console.error('❌ /public/icons/ directory not found!');
  process.exit(1);
}

// Read and parse manifest.json
let manifest;
try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(manifestContent);
} catch (error) {
  console.error('❌ Error reading or parsing manifest.json:', error.message);
  process.exit(1);
}

// Check that manifest has the required fields
const requiredFields = [
  'name',
  'short_name',
  'description',
  'start_url',
  'display',
  'background_color',
  'theme_color',
  'icons',
];
const missingFields = requiredFields.filter((field) => !manifest[field]);

if (missingFields.length > 0) {
  console.error(`❌ manifest.json is missing required fields: ${missingFields.join(', ')}`);
  process.exit(1);
}

// Check that manifest does not have screenshots or other unnecessary fields
const allowedFields = new Set(requiredFields);
const extraFields = Object.keys(manifest).filter((field) => !allowedFields.has(field));

if (extraFields.length > 0) {
  console.error(
    `❌ manifest.json has extra fields that should be removed: ${extraFields.join(', ')}`,
  );
  process.exit(1);
}

// Check that icons array exists and is not empty
if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
  console.error('❌ manifest.json does not have a valid icons array!');
  process.exit(1);
}

// Required icon sizes
const requiredSizes = new Set(['48x48', '72x72', '96x96', '144x144', '192x192', '512x512']);
const foundSizes = new Set();

// Check that all icons referenced in manifest exist
console.log('Checking icon files...');
let missingIconFiles = 0;

for (const icon of manifest.icons) {
  if (!icon.src || !icon.sizes || !icon.type) {
    console.error(`❌ Icon entry is missing required fields: ${JSON.stringify(icon)}`);
    continue;
  }

  // Mark size as found
  foundSizes.add(icon.sizes);

  // Clean up the path and make it relative to public directory
  const iconPath = path.join(publicDir, icon.src.replace(/^\//, ''));

  if (!fs.existsSync(iconPath)) {
    console.error(`❌ Icon file not found: ${iconPath}`);
    missingIconFiles++;
  } else {
    console.log(`✅ Found icon: ${icon.sizes} at ${iconPath}`);
  }
}

// Check if all required sizes are present
const missingSizes = [...requiredSizes].filter((size) => !foundSizes.has(size));
if (missingSizes.length > 0) {
  console.error(`❌ Missing icons for sizes: ${missingSizes.join(', ')}`);
  process.exit(1);
}

// Final report
if (missingIconFiles > 0) {
  console.error(`❌ ${missingIconFiles} icon files are missing!`);
  process.exit(1);
} else {
  console.log('✅ All PWA icon files exist and are correctly referenced in manifest.json!');
}

console.log('✅ PWA icons setup is correct!');
