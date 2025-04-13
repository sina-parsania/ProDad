#!/usr/bin/env node

/**
 * This script validates the PWA setup for the ProDad application.
 * Run it after building the project to check if the PWA assets are correctly generated.
 *
 * To use: node pwa-validate.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple colored logging helper
const chalk = {
  green: (s) => `✅ ${s}`,
  red: (s) => `❌ ${s}`,
  yellow: (s) => `⚠️ ${s}`,
  blue: (s) => `ℹ️ ${s}`,
};

console.log(chalk.blue('Validating PWA setup for ProDad application...'));

const publicDir = path.resolve(__dirname, 'public');

// Check for manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log(chalk.green('Found manifest.json'));

  // Validate manifest.json content
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check required fields
    const requiredFields = [
      'name',
      'short_name',
      'icons',
      'start_url',
      'display',
      'background_color',
      'theme_color',
    ];
    const missingFields = requiredFields.filter((field) => !manifest[field]);

    if (missingFields.length === 0) {
      console.log(chalk.green('manifest.json contains all required fields'));
    } else {
      console.log(chalk.yellow(`manifest.json is missing fields: ${missingFields.join(', ')}`));
    }

    // Check icons
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(chalk.green(`Found ${manifest.icons.length} icons defined in manifest`));

      // Check if icon files exist
      const missingIcons = manifest.icons.filter(
        (icon) => !fs.existsSync(path.join(publicDir, icon.src.replace(/^\//, ''))),
      );

      if (missingIcons.length === 0) {
        console.log(chalk.green('All icon files exist'));
      } else {
        console.log(
          chalk.yellow(`Missing icon files: ${missingIcons.map((icon) => icon.src).join(', ')}`),
        );
      }
    } else {
      console.log(chalk.red('No icons defined in manifest.json'));
    }
  } catch (error) {
    console.log(chalk.red(`Error parsing manifest.json: ${error.message}`));
  }
} else {
  console.log(chalk.red('manifest.json not found in public directory'));
}

// Check for service worker files after build
const swPath = path.join(publicDir, 'sw.js');

// Use glob to find workbox files
const workboxFiles = fs.readdirSync(publicDir).filter((file) => file.startsWith('workbox-'));

if (fs.existsSync(swPath)) {
  console.log(chalk.green('Found service worker: sw.js'));
} else {
  console.log(
    chalk.yellow('Service worker (sw.js) not found. Make sure to build the project first.'),
  );
}

if (workboxFiles.length > 0) {
  console.log(chalk.green(`Found ${workboxFiles.length} Workbox files`));
} else {
  console.log(chalk.yellow('No Workbox files found. Make sure to build the project first.'));
}

// Check for offline fallback
const fallbackPath = path.join(publicDir, 'fallback.html');
if (fs.existsSync(fallbackPath)) {
  console.log(chalk.green('Found offline fallback page'));
} else {
  console.log(chalk.red('Offline fallback page not found'));
}

// Check for app icons
const iconDir = path.join(publicDir, 'icons');
if (fs.existsSync(iconDir)) {
  const iconFiles = fs.readdirSync(iconDir).filter((file) => file.endsWith('.png'));
  console.log(chalk.green(`Found ${iconFiles.length} icon files in icons directory`));
} else {
  console.log(chalk.red('Icons directory not found'));
}

console.log(chalk.blue('\nNext steps:'));
console.log('1. Build the project with: npm run build');
console.log('2. Start the production server: npm run start');
console.log('3. Use Chrome DevTools > Application > Lighthouse to audit PWA features');
console.log('4. Test offline functionality by turning off network in DevTools');
console.log("5. Try installing the PWA using the browser's install option");

console.log(chalk.blue('\nPWA validation completed.'));
