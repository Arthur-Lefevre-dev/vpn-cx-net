#!/usr/bin/env node
/**
 * Native messaging host for VPN CX Proxy: start/stop OpenVPN from the browser extension.
 * Protocol: 4-byte little-endian length + UTF-8 JSON on stdin; same on stdout.
 * Install: see README (register manifest and path to this script).
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PID_FILE = path.join(os.tmpdir(), 'vpn-cx-proxy-openvpn.pid');

function readStdin() {
  const chunks = [];
  const stream = process.stdin;
  function readSize() {
    return new Promise((resolve, reject) => {
      const onData = (chunk) => {
        chunks.push(chunk);
        const total = Buffer.concat(chunks);
        if (total.length >= 4) {
          stream.removeListener('data', onData);
          stream.removeListener('error', onError);
          resolve(total);
        }
      };
      const onError = reject;
      stream.on('data', onData);
      stream.on('error', onError);
    });
  }

  function readPayload(len) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const need = len;
      const onData = (chunk) => {
        chunks.push(chunk);
        const total = Buffer.concat(chunks);
        if (total.length >= need) {
          stream.removeListener('data', onData);
          stream.removeListener('error', onError);
          resolve(total.slice(0, need));
        }
      };
      const onError = reject;
      stream.on('data', onData);
      stream.on('error', onError);
    });
  }

  return readSize().then((buf) => {
    const len = buf.readUInt32LE(0);
    if (len === 0 || len > 1024 * 1024) {
      throw new Error('Invalid message length');
    }
    return readPayload(len);
  }).then((buf) => JSON.parse(buf.toString('utf8')));
}

function sendResponse(obj) {
  const msg = JSON.stringify(obj);
  const buf = Buffer.from(msg, 'utf8');
  const header = Buffer.allocUnsafe(4);
  header.writeUInt32LE(buf.length, 0);
  process.stdout.write(header);
  process.stdout.write(buf);
}

function findOpenVpn() {
  const candidates = process.platform === 'win32'
    ? ['openvpn.exe', path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'OpenVPN', 'bin', 'openvpn.exe'), path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'OpenVPN', 'bin', 'openvpn.exe')]
    : ['openvpn'];
  for (const name of candidates) {
    if (name.includes(path.sep)) {
      if (fs.existsSync(name)) return name;
    } else {
      return name;
    }
  }
  return process.platform === 'win32' ? 'openvpn.exe' : 'openvpn';
}

function start(configPath) {
  if (fs.existsSync(PID_FILE)) {
    try {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
      process.kill(pid, 0);
      return { success: false, error: 'OpenVPN is already running (PID ' + pid + ')' };
    } catch (_) {
      fs.unlinkSync(PID_FILE);
    }
  }
  if (!configPath || !fs.existsSync(configPath)) {
    return { success: false, error: 'Config file not found: ' + configPath };
  }
  const openvpnBin = findOpenVpn();
  const child = spawn(openvpnBin, ['--config', configPath], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
  try {
    fs.writeFileSync(PID_FILE, String(child.pid));
  } catch (e) {
    return { success: false, error: 'Could not write PID file: ' + e.message };
  }
  return { success: true };
}

function stop() {
  if (!fs.existsSync(PID_FILE)) {
    return { success: false, error: 'OpenVPN was not started by this extension' };
  }
  let pid;
  try {
    pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
  } catch (e) {
    fs.unlinkSync(PID_FILE);
    return { success: false, error: 'Invalid PID file' };
  }
  try {
    process.kill(pid, 'SIGTERM');
  } catch (e) {
    if (e.code !== 'ESRCH') {
      try { process.kill(pid, 'SIGKILL'); } catch (_) {}
    }
  }
  try {
    fs.unlinkSync(PID_FILE);
  } catch (_) {}
  return { success: true };
}

readStdin()
  .then((msg) => {
    const action = msg.action;
    if (action === 'start') {
      return start(msg.configPath);
    }
    if (action === 'stop') {
      return stop();
    }
    return { success: false, error: 'Unknown action' };
  })
  .then(sendResponse)
  .catch((err) => {
    sendResponse({ success: false, error: err.message || String(err) });
  })
  .finally(() => {
    process.exit(0);
  });
