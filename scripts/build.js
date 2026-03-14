#!/usr/bin/env node
/**
 * Builds the extension for Chrome and Firefox.
 * Output: dist/vpn-cx-proxy-chrome.zip and dist/vpn-cx-proxy-firefox.zip
 * Chrome zip: manifest with background.scripts + background.service_worker.
 * Firefox zip: manifest with background.scripts only (no service_worker) to avoid
 *   "Unsupported service_worker property" warning on addons.mozilla.org.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const PROJECT_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// All paths referenced by manifest.json or at runtime must be included.
// Optional: icons/ (extension works without it; toolbar uses default placeholder).
const INCLUDED = [
  'manifest.json',   // required by both browsers
  'locales.js',      // i18n, loaded by popup and options
  'background',      // background/background.js (service_worker)
  'popup',           // popup/popup.html, popup.css, popup.js
  'options',         // options/options.html, options.css, options.js
  'data',            // data/data.csv (default server list)
  'icons'            // icons/icon16|32|48.png, icons/flags/*.png (optional)
];

// Critical entries: build fails if missing. Optional entries only warn.
const OPTIONAL = ['icons'];

// Skip these when copying (keep zip clean)
const SKIP_NAMES = new Set(['.DS_Store', 'Thumbs.db', '.gitkeep']);
const SKIP_EXT = new Set(['.map']);
function shouldSkip(name) {
  if (SKIP_NAMES.has(name)) return true;
  const ext = path.extname(name).toLowerCase();
  return SKIP_EXT.has(ext);
}

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
      if (shouldSkip(name)) continue;
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    if (shouldSkip(path.basename(src))) return;
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
      if (OPTIONAL.includes(name)) {
        console.warn('  (optional ' + name + '/ not found, skipping)');
      } else {
        console.error('Error: required path missing:', name);
        process.exit(1);
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
  const firefoxBuildDir = path.join(DIST_DIR, 'build-firefox');

  // Firefox manifest: remove service_worker (unsupported on Firefox) to avoid validator warning
  function createFirefoxBuildDir() {
    if (fs.existsSync(firefoxBuildDir)) fs.rmSync(firefoxBuildDir, { recursive: true });
    ensureDir(firefoxBuildDir);
    for (const name of fs.readdirSync(buildDir)) {
      copyRecursive(path.join(buildDir, name), path.join(firefoxBuildDir, name));
    }
    const manifestPath = path.join(buildDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.background && manifest.background.service_worker) {
      delete manifest.background.service_worker;
    }
    fs.writeFileSync(path.join(firefoxBuildDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  }

  console.log('\nCreating Chrome package...');
  createZip(chromeZip, buildDir).then(() => {
    console.log('  ->', chromeZip);
    console.log('\nCreating Firefox package (manifest without service_worker)...');
    createFirefoxBuildDir();
    return createZip(firefoxZip, firefoxBuildDir);
  }).then(() => {
    console.log('  ->', firefoxZip);
    fs.rmSync(buildDir, { recursive: true });
    if (fs.existsSync(firefoxBuildDir)) fs.rmSync(firefoxBuildDir, { recursive: true });
    console.log('\nDone. Upload vpn-cx-proxy-chrome.zip to Chrome Web Store and vpn-cx-proxy-firefox.zip to addons.mozilla.org.');
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
