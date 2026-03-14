#!/usr/bin/env node
/**
 * Installs the OpenVPN native messaging host so the extension can start/stop OpenVPN.
 * Run from project root: node scripts/install-native-host.js
 * Requires Node.js and OpenVPN installed. On Windows, run once (manifest is per-user).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ROOT = path.join(__dirname, '..');
const NATIVE_DIR = path.join(PROJECT_ROOT, 'native');
const TEMPLATE = path.join(NATIVE_DIR, 'com.vpn_cx_proxy.openvpn.json.template');
const HOST_SCRIPT = path.join(NATIVE_DIR, 'openvpn-host.js');
const HOST_BAT = path.join(NATIVE_DIR, 'openvpn-host.bat');

function getManifestPath() {
  const name = 'com.vpn_cx_proxy.openvpn.json';
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || os.homedir(), 'vpn-cx-proxy', name);
  }
  return path.join(os.homedir(), '.config', 'vpn-cx-proxy', name);
}

function getChromeHostsDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data', 'NativeMessagingHosts');
  }
  return path.join(os.homedir(), '.config', 'google-chrome', 'NativeMessagingHosts');
}

function getFirefoxHostsDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'Mozilla', 'NativeMessagingHosts');
  }
  return path.join(os.homedir(), '.mozilla', 'native-messaging-hosts');
}

function main() {
  if (!fs.existsSync(HOST_SCRIPT)) {
    console.error('Not found:', HOST_SCRIPT);
    process.exit(1);
  }

  // Path to the executable Chrome/Firefox will run
  const hostPath = process.platform === 'win32' ? HOST_BAT : HOST_SCRIPT;
  if (process.platform === 'win32' && !fs.existsSync(HOST_BAT)) {
    console.error('Not found:', HOST_BAT);
    process.exit(1);
  }

  let template = fs.readFileSync(TEMPLATE, 'utf8');
  const absolutePath = hostPath.replace(/\\/g, '\\\\');
  template = template.replace('ABSOLUTE_PATH_TO_OPENVPN_HOST', absolutePath);

  const chromeId = process.env.VPN_CX_CHROME_ID || 'REPLACE_WITH_CHROME_EXTENSION_ID';
  const firefoxId = process.env.VPN_CX_FIREFOX_ID || 'REPLACE_WITH_FIREFOX_EXTENSION_ID';
  template = template.replace('REPLACE_WITH_CHROME_EXTENSION_ID', chromeId);
  template = template.replace('REPLACE_WITH_FIREFOX_EXTENSION_ID', firefoxId);

  const manifestStr = template;

  const manifestPath = getManifestPath();
  const manifestDir = path.dirname(manifestPath);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  fs.writeFileSync(manifestPath, manifestStr);
  console.log('Written:', manifestPath);

  const chromeDir = getChromeHostsDir();
  const firefoxDir = getFirefoxHostsDir();
  console.log('\nTo register the host:');
  console.log('  Chrome: copy the manifest to');
  console.log('    ', chromeDir);
  console.log('    or create a symlink from', path.join(chromeDir, 'com.vpn_cx_proxy.openvpn.json'), 'to', manifestPath);
  console.log('  Firefox: copy or symlink to');
  console.log('    ', firefoxDir);
  console.log('\nReplace in the manifest REPLACE_WITH_CHROME_EXTENSION_ID / REPLACE_WITH_FIREFOX_EXTENSION_ID');
  console.log('with your extension ID (Chrome: chrome://extensions, Firefox: about:debugging).');
  console.log('\nOptionally set env vars before running this script:');
  console.log('  VPN_CX_CHROME_ID=your_chrome_extension_id');
  console.log('  VPN_CX_FIREFOX_ID=your_firefox_extension_id');
}

main();
