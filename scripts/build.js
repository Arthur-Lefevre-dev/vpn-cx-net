#!/usr/bin/env node
/**
 * Builds the extension for Chrome and Firefox.
 * Output: dist/vpn-cx-proxy-chrome.zip and dist/vpn-cx-proxy-firefox.zip
 * (same content; manifest is compatible with both).
 * Excludes: node_modules, scripts, .git, docs, package files, etc.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const PROJECT_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Directories and files to include in the extension package
const INCLUDED = [
  'manifest.json',
  'background',
  'popup',
  'options',
  'data',
  'icons'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function createZip(zipPath, buildDir) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    // Add build dir contents at zip root (no "build" folder inside zip)
    archive.directory(buildDir, false);
    archive.finalize();
  });
}

function main() {
  const buildDir = path.join(DIST_DIR, 'build');
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  ensureDir(buildDir);

  console.log('Copying extension files...');
  for (const name of INCLUDED) {
    const src = path.join(PROJECT_ROOT, name);
    if (!fs.existsSync(src)) {
      if (name === 'icons') {
        console.warn('  (icons/ not found, skipping)');
      }
      continue;
    }
    const dest = path.join(buildDir, name);
    copyRecursive(src, dest);
    console.log('  +', name);
  }

  ensureDir(DIST_DIR);
  const chromeZip = path.join(DIST_DIR, 'vpn-cx-proxy-chrome.zip');
  const firefoxZip = path.join(DIST_DIR, 'vpn-cx-proxy-firefox.zip');

  console.log('\nCreating Chrome package...');
  createZip(chromeZip, buildDir).then(() => {
    console.log('  ->', chromeZip);
    console.log('\nCreating Firefox package...');
    return createZip(firefoxZip, buildDir);
  }).then(() => {
    console.log('  ->', firefoxZip);
    fs.rmSync(buildDir, { recursive: true });
    console.log('\nDone. Upload vpn-cx-proxy-chrome.zip to Chrome Web Store and vpn-cx-proxy-firefox.zip to addons.mozilla.org.');
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
