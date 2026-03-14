/**
 * Cross-browser proxy background script.
 * Uses chrome.proxy (Chrome) or browser.proxy (Firefox) with normalized config.
 * Proxy auth: Chrome only, via webRequest.onAuthRequired + webRequestAuthProvider.
 */

const proxyAPI = typeof browser !== 'undefined' ? browser.proxy : chrome.proxy;

// In-memory proxy credentials for onAuthRequired (must respond synchronously)
let proxyAuth = { host: '', port: 0, username: '', password: '' };

// Traffic stats (download/upload bytes) - updated from webRequest
let trafficStats = { downloadBytes: 0, uploadBytes: 0 };

const DEFAULT_CONFIG = {
  enabled: false,
  host: '',
  port: 1080,
  type: 'socks5' // 'http' | 'socks4' | 'socks5' | 'openvpn'
};

// OpenVPN uses a local SOCKS5 proxy (e.g. from OpenVPN plugin or separate proxy)
const PROXY_SCHEME_FOR_TYPE = {
  socks5: 'socks5',
  socks4: 'socks4',
  http: 'http',
  openvpn: 'socks5'
};

/**
 * Get Chrome-style ProxyConfig for fixed_servers mode.
 * @param {{ host: string, port: number, type: string }} config
 * @returns {chrome.proxy.ProxyConfig}
 */
function getChromeProxyConfig(config) {
  const scheme = PROXY_SCHEME_FOR_TYPE[config.type] || 'socks5';
  return {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme,
        host: config.host,
        port: config.port
      },
      bypassList: ['localhost', '127.0.0.1', '<local>']
    }
  };
}

/**
 * Get Firefox-style proxy settings object.
 * @param {{ host: string, port: number, type: string }} config
 * @returns {object}
 */
function getFirefoxProxySettings(config) {
  const address = `${config.host}:${config.port}`;
  const settings = {
    proxyType: 'manual',
    passthrough: 'localhost,127.0.0.1'
  };
  const effectiveType = config.type === 'openvpn' ? 'socks5' : config.type;
  if (effectiveType === 'socks5' || effectiveType === 'socks4') {
    settings.socks = address;
    settings.socksVersion = effectiveType === 'socks5' ? 5 : 4;
    settings.proxyDNS = true;
  } else {
    settings.http = address;
    settings.ssl = address;
  }
  return settings;
}

/**
 * Apply proxy using the correct API and format for the current browser.
 * @param {{ host: string, port: number, type: string }} config
 */
function applyProxy(config) {
  if (!config.host || !config.port) {
    clearProxy();
    return;
  }
  const isFirefox = typeof browser !== 'undefined';
  if (isFirefox) {
    proxyAPI.settings.set({ value: getFirefoxProxySettings(config) });
  } else {
    chrome.proxy.settings.set({
      value: getChromeProxyConfig(config),
      scope: 'regular'
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Proxy set error:', chrome.runtime.lastError);
      }
    });
  }
}

/**
 * Clear proxy and use direct connection.
 */
function clearProxy() {
  if (typeof browser !== 'undefined') {
    proxyAPI.settings.set({ value: { proxyType: 'none' } });
  } else {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      if (chrome.runtime.lastError) {
        console.error('Proxy clear error:', chrome.runtime.lastError);
      }
    });
  }
}

/**
 * Load saved config from storage and apply proxy state.
 */
function loadAndApplyState() {
  const storage = chrome.storage;
  storage.local.get(['enabled', 'host', 'port', 'type'], (data) => {
    const config = { ...DEFAULT_CONFIG, ...data };
    if (config.enabled && config.host && config.port) {
      applyProxy(config);
    } else {
      clearProxy();
    }
  });
}

// Apply on install
chrome.runtime.onInstalled.addListener(loadAndApplyState);
// By default user is disconnected when browser starts (proxy off)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({
    enabled: false,
    host: '',
    port: 1080
  }, () => {
    proxyAuth = { host: '', port: 0, username: '', password: '' };
    clearProxy();
  });
});

// Restore proxy auth from storage when background loads (e.g. after restart)
chrome.storage.local.get(['enabled', 'host', 'port', 'proxyUsername', 'proxyPassword'], (data) => {
  if (data.enabled && data.host && data.port) {
    const port = parseInt(data.port, 10) || 0;
    proxyAuth = {
      host: data.host,
      port,
      username: data.proxyUsername || '',
      password: data.proxyPassword || ''
    };
  }
});

// Track download size from response Content-Length (when proxy is used)
if (typeof chrome !== 'undefined' && chrome.webRequest && chrome.webRequest.onHeadersReceived) {
  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const headers = details.responseHeaders || [];
      for (const h of headers) {
        if (h.name.toLowerCase() === 'content-length' && h.value) {
          const n = parseInt(h.value, 10);
          if (!isNaN(n) && n > 0) {
            trafficStats.downloadBytes += n;
          }
          break;
        }
      }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders']
  );
}

// Chrome: auto-fill proxy auth to avoid "Se connecter" dialog (async so we can read storage)
if (typeof chrome !== 'undefined' && chrome.webRequest && chrome.webRequest.onAuthRequired) {
  chrome.webRequest.onAuthRequired.addListener(
    (details, asyncCallback) => {
      if (!details.isProxy || !details.challenger) {
        asyncCallback({});
        return;
      }
      const { host, port } = details.challenger;
      const challengerPort = typeof port === 'number' ? port : parseInt(port, 10) || 0;
      function tryProvideAuth(data) {
        const storedPort = parseInt(data.port, 10) || 0;
        const user = data.proxyUsername ?? proxyAuth.username;
        const pass = data.proxyPassword ?? proxyAuth.password;
        if (data.enabled && data.host === host && (storedPort === challengerPort || String(data.port) === String(port)) && user) {
          asyncCallback({ authCredentials: { username: user, password: pass || '' } });
          return;
        }
        if (proxyAuth.host === host && proxyAuth.port === challengerPort && proxyAuth.username) {
          asyncCallback({ authCredentials: { username: proxyAuth.username, password: proxyAuth.password } });
          return;
        }
        asyncCallback({});
      }
      chrome.storage.local.get(['enabled', 'host', 'port', 'proxyUsername', 'proxyPassword'], tryProvideAuth);
    },
    { urls: ['<all_urls>'] },
    ['asyncBlocking']
  );
}

/**
 * Extract country code from Decodo-style username (e.g. user-xxx-country-be -> BE).
 * @param {string} username
 * @returns {string}
 */
function countryFromUsername(username) {
  if (!username) return 'XX';
  const m = username.match(/country-([a-z]{2})/i);
  return m ? m[1].toUpperCase() : 'XX';
}

/**
 * Parse default servers from bundled data/data.csv.
 * Supports:
 *   - Decodo line format: host:port:username:password (country from username, e.g. country-be)
 *   - CSV with header: ip,location,asn or countryCode,host,port,username,password
 * @returns {Promise<Array<{countryCode,host,port,username,password,type,name}>>}
 */
function loadDefaultServersFromCSV() {
  const url = chrome.runtime.getURL('data/data.csv');
  return fetch(url)
    .then((r) => r.text())
    .then((text) => {
      const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) return [];

      const first = lines[0];
      const isDecodoLine = (line) => {
        const parts = line.split(':');
        return parts.length >= 4 && /^\d+$/.test(parts[1]);
      };

      if (isDecodoLine(first)) {
        return lines
          .filter(isDecodoLine)
          .map((line) => {
            const parts = line.split(':');
            const host = parts[0];
            const port = parseInt(parts[1], 10) || 1080;
            const username = parts[2];
            const password = parts.slice(3).join(':'); // password may contain ':'
            const countryCode = countryFromUsername(username);
            return {
              countryCode,
              host,
              port,
              username,
              password,
              type: 'http',
              name: countryCode
            };
          });
      }

      const sep = first.includes('|') ? '|' : ',';
      const header = first.toLowerCase().split(sep).map((h) => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(sep).map((p) => p.trim());
        const row = {};
        header.forEach((h, j) => {
          row[h] = (parts[j] || '').trim();
        });
        const host = row.ip || row.host;
        const location = (row.location || row.countrycode || '').toUpperCase();
        if (!host) continue;
        rows.push({
          countryCode: location || 'XX',
          host,
          port: parseInt(row.port, 10) || 1080,
          username: row.username || '',
          password: row.password || '',
          type: (row.type || 'http').toLowerCase(),
          name: location || host
        });
      }
      return rows;
    })
    .catch(() => []);
}

/**
 * Fetch proxy list from Decodo API (optional). Requires decodoApiKey in storage.
 * API: https://help.decodo.com/reference
 * @param {string} apiKey
 * @returns {Promise<Array<{countryCode,host,port,username,password,type,name}>>}
 */
function loadServersFromDecodoAPI(apiKey) {
  if (!apiKey || !apiKey.trim()) return Promise.resolve([]);
  return fetch('https://api.decodo.com/v1/endpoints', {
    headers: { 'Authorization': 'Bearer ' + apiKey.trim() }
  })
    .then((r) => {
      if (!r.ok) throw new Error('API ' + r.status);
      return r.json();
    })
    .then((data) => {
      const list = data.data || data.endpoints || (Array.isArray(data) ? data : []);
      return list.map((e) => {
        const countryCode = (e.country_code || e.countryCode || e.location || '').toString().toUpperCase().slice(0, 2) || 'XX';
        return {
          countryCode,
          host: e.host || e.endpoint || 'isp.decodo.com',
          port: parseInt(e.port, 10) || 10001,
          username: e.username || e.user || '',
          password: e.password || '',
          type: (e.type || 'http').toLowerCase(),
          name: countryCode
        };
      }).filter((s) => s.host);
    })
    .catch(() => []);
}

/** Resolve list of servers (Decodo API if key set, else CSV). */
function getServersSource() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['decodoApiKey'], (keyData) => {
      const apiKey = (keyData.decodoApiKey || '').trim();
      const promise = apiKey ? loadServersFromDecodoAPI(apiKey) : loadDefaultServersFromCSV();
      promise.then(resolve);
    });
  });
}

// Listen for messages from popup/options to toggle or update proxy
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getTraffic') {
    sendResponse({ trafficStats: { ...trafficStats } });
    return false;
  }
  if (message.action === 'getState') {
    getServersSource().then((dedicatedServers) => {
      chrome.storage.local.get(['enabled', 'host', 'port', 'type'], (data) => {
        sendResponse({
          ...DEFAULT_CONFIG,
          ...data,
          dedicatedServers: dedicatedServers || [],
          trafficStats: { ...trafficStats }
        });
      });
    });
    return true; // async response
  }
  if (message.action === 'setState') {
    const { enabled, host, port, type, username, password } = message.payload || {};
    const proxyUsername = username ?? '';
    const proxyPassword = password ?? '';
    chrome.storage.local.set({
      enabled: !!enabled,
      host: host ?? '',
      port: port ?? DEFAULT_CONFIG.port,
      type: type ?? DEFAULT_CONFIG.type,
      proxyUsername,
      proxyPassword
    }, () => {
      if (enabled && host && port) {
        proxyAuth = { host, port: port ?? DEFAULT_CONFIG.port, username: proxyUsername, password: proxyPassword };
        applyProxy({ host, port, type: type ?? DEFAULT_CONFIG.type });
      } else {
        proxyAuth = { host: '', port: 0, username: '', password: '' };
        clearProxy();
      }
      sendResponse({ success: true });
    });
    return true;
  }
  if (message.action === 'clearProxy') {
    clearProxy();
    sendResponse({ success: true });
    return false;
  }
  if (message.action === 'openvpnNative') {
    const nativeName = 'com.vpn_cx_proxy.openvpn';
    try {
      chrome.runtime.sendNativeMessage(nativeName, message.payload || {}, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse(response || { success: true });
        }
      });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
  return false;
});
