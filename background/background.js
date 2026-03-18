/**
 * Cross-browser proxy background script.
 * Uses chrome.proxy (Chrome) or browser.proxy (Firefox) with normalized config.
 * Proxy auth: Chrome only, via webRequest.onAuthRequired + webRequestAuthProvider.
 */

// Firefox/MV3: the `browser` object is not always available depending on context.
// More robust detection via UA + fallback on `browser.proxy`.
const IS_FIREFOX =
  (typeof navigator !== "undefined" &&
    /firefox/i.test(navigator.userAgent || "")) ||
  (typeof browser !== "undefined" && !!browser.proxy);

const proxyAPI = IS_FIREFOX
  ? // Firefox: prefer `browser.proxy` if available
    (typeof browser !== "undefined" ? browser.proxy : chrome.proxy)
  : // Chrome: use `chrome.proxy`
    chrome.proxy;

// In-memory proxy credentials for onAuthRequired (must respond synchronously)
let proxyAuth = { host: "", port: 0, username: "", password: "" };

// True when proxy is enabled (used to add Windows User-Agent on outgoing requests)
let proxyEnabled = false;

// Country code of the current proxy region (e.g. FR, DE) for Accept-Language / locale
let proxyCountryCode = "";

// Traffic stats (download/upload bytes) - updated from webRequest
let trafficStats = { downloadBytes: 0, uploadBytes: 0 };

// Windows-style User-Agent for requests when proxy is on
const WINDOWS_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Accept-Language by proxy country (region) so requests match the proxy locale
const COUNTRY_ACCEPT_LANGUAGE = {
  FR: "fr-FR,fr;q=0.9,en;q=0.8",
  BE: "fr-BE,fr;q=0.9,nl;q=0.8,en;q=0.7",
  CH: "de-CH,de;q=0.9,fr;q=0.8,en;q=0.7",
  DE: "de-DE,de;q=0.9,en;q=0.8",
  ES: "es-ES,es;q=0.9,en;q=0.8",
  IT: "it-IT,it;q=0.9,en;q=0.8",
  NL: "nl-NL,nl;q=0.9,en;q=0.8",
  GB: "en-GB,en;q=0.9",
  US: "en-US,en;q=0.9",
  CA: "en-CA,en;q=0.9,fr;q=0.8",
  PT: "pt-PT,pt;q=0.9,es;q=0.8,en;q=0.7",
  BR: "pt-BR,pt;q=0.9,en;q=0.8",
  PL: "pl-PL,pl;q=0.9,en;q=0.8",
  RU: "ru-RU,ru;q=0.9,en;q=0.8",
  JP: "ja-JP,ja;q=0.9,en;q=0.8",
  CN: "zh-CN,zh;q=0.9,en;q=0.8",
  KR: "ko-KR,ko;q=0.9,en;q=0.8",
  IN: "en-IN,en;q=0.9,hi;q=0.8",
  AU: "en-AU,en;q=0.9",
  SE: "sv-SE,sv;q=0.9,en;q=0.8",
  NO: "nb-NO,nb;q=0.9,en;q=0.8",
  DK: "da-DK,da;q=0.9,en;q=0.8",
  FI: "fi-FI,fi;q=0.9,en;q=0.8",
  TR: "tr-TR,tr;q=0.9,en;q=0.8",
  GR: "el-GR,el;q=0.9,en;q=0.8",
  CZ: "cs-CZ,cs;q=0.9,en;q=0.8",
  RO: "ro-RO,ro;q=0.9,en;q=0.8",
  HU: "hu-HU,hu;q=0.9,en;q=0.8",
  AT: "de-AT,de;q=0.9,en;q=0.8",
  IE: "en-IE,en;q=0.9",
  SG: "en-SG,en;q=0.9,zh;q=0.8",
  MX: "es-MX,es;q=0.9,en;q=0.8",
  AR: "es-AR,es;q=0.9,en;q=0.8",
  CL: "es-CL,es;q=0.9,en;q=0.8",
  CO: "es-CO,es;q=0.9,en;q=0.8",
};
const DEFAULT_ACCEPT_LANGUAGE = "en-US,en;q=0.9";

/** Normalize stored country code to 2-letter uppercase. */
function normalizeCountryCode(v) {
  return (v || "").toString().toUpperCase().slice(0, 2);
}

function getAcceptLanguageForCountry(code) {
  if (!code || code.length !== 2) return DEFAULT_ACCEPT_LANGUAGE;
  return COUNTRY_ACCEPT_LANGUAGE[code.toUpperCase()] || DEFAULT_ACCEPT_LANGUAGE;
}

const DEFAULT_CONFIG = {
  enabled: false,
  host: "",
  port: 1080,
  type: "socks5", // 'http' | 'socks4' | 'socks5' | 'openvpn'
};

// OpenVPN uses a local SOCKS5 proxy (e.g. from OpenVPN plugin or separate proxy)
const PROXY_SCHEME_FOR_TYPE = {
  socks5: "socks5",
  socks4: "socks4",
  http: "http",
  openvpn: "socks5",
};

/**
 * Get Chrome-style ProxyConfig for fixed_servers mode.
 * @param {{ host: string, port: number, type: string }} config
 * @returns {chrome.proxy.ProxyConfig}
 */
function getChromeProxyConfig(config) {
  const scheme = PROXY_SCHEME_FOR_TYPE[config.type] || "socks5";
  return {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme,
        host: config.host,
        port: config.port,
      },
      bypassList: ["localhost", "127.0.0.1", "<local>"],
    },
  };
}

/**
 * Get Firefox-style proxy settings object.
 * @param {{ host: string, port: number, type: string }} config
 * @returns {object}
 */
function getFirefoxProxySettings(config) {
  const host = config.host;
  const port = parseInt(config.port, 10) || 0;
  const settings = {
    proxyType: "manual",
    passthrough: "localhost,127.0.0.1",
  };
  const effectiveType = config.type === "openvpn" ? "socks5" : config.type;
  if (effectiveType === "socks5" || effectiveType === "socks4") {
    // Firefox expects `socks` as a single string that may include the port.
    settings.socks = host + ":" + port;
    settings.socksVersion = effectiveType === "socks5" ? 5 : 4;
    settings.proxyDNS = true;
  } else {
    // For HTTP/HTTPS proxy, include the scheme (as in MDN examples).
    const addr = "http://" + host + ":" + port;
    settings.http = addr;
    settings.ssl = addr;
  }
  return settings;
}

/**
 * Apply proxy using the correct API and format for the current browser.
 * @param {{ host: string, port: number, type: string }} config
 */
function applyProxy(config) {
  if (!config.host || !config.port) {
    return Promise.resolve().then(() => {
      clearProxy();
      setProxyEnabled(false);
    });
  }
  setProxyEnabled(true);
  if (IS_FIREFOX) {
    try {
      const p = proxyAPI.settings.set({ value: getFirefoxProxySettings(config) });
      console.log("Firefox proxy set:", config, getFirefoxProxySettings(config));
      if (p && typeof p.catch === "function") {
        return p.catch((err) => {
          console.error("Firefox proxy set failed:", err, config);
          throw err;
        });
      }
      return Promise.resolve();
    } catch (err) {
      console.error("Firefox proxy set threw:", err);
      return Promise.reject(err);
    }
  } else {
    return new Promise((resolve, reject) => {
      try {
        chrome.proxy.settings.set(
          {
            value: getChromeProxyConfig(config),
            scope: "regular",
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error("Proxy set error:", chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
              return;
            }
            resolve();
          },
        );
      } catch (e) {
        reject(e);
      }
    });
  }
}

/**
 * Clear proxy and use direct connection.
 */
function clearProxy() {
  setProxyEnabled(false);
  if (IS_FIREFOX) {
    try {
      const p = proxyAPI.settings.set({ value: { proxyType: "none" } });
      console.log("Firefox proxy cleared");
      if (p && typeof p.catch === "function") {
        return p.catch((err) => {
          console.error("Firefox proxy clear failed:", err);
          throw err;
        });
      }
      return Promise.resolve();
    } catch (err) {
      console.error("Firefox proxy clear threw:", err);
      return Promise.reject(err);
    }
  } else {
    return new Promise((resolve, reject) => {
      try {
        chrome.proxy.settings.clear({ scope: "regular" }, () => {
          if (chrome.runtime.lastError) {
            console.error("Proxy clear error:", chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

/**
 * Load saved config from storage and apply proxy state.
 */
function loadAndApplyState() {
  const storage = chrome.storage;
  storage.local.get(
    ["enabled", "host", "port", "type", "proxyCountryCode"],
    (data) => {
      proxyCountryCode = normalizeCountryCode(data.proxyCountryCode);
      const config = { ...DEFAULT_CONFIG, ...data };
      if (config.enabled && config.host && config.port) {
        setProxyEnabled(true);
        applyProxy(config);
      } else {
        clearProxy();
      }
    },
  );
}

// Apply on install
chrome.runtime.onInstalled.addListener(loadAndApplyState);
// By default user is disconnected when browser starts (proxy off)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set(
    {
      enabled: false,
      host: "",
      port: 1080,
    },
    () => {
      proxyAuth = { host: "", port: 0, username: "", password: "" };
      clearProxy();
    },
  );
});

// Restore proxy auth, proxyCountryCode and proxyEnabled from storage when background loads (e.g. after restart)
chrome.storage.local.get(
  [
    "enabled",
    "host",
    "port",
    "proxyUsername",
    "proxyPassword",
    "proxyCountryCode",
  ],
  (data) => {
    proxyCountryCode = normalizeCountryCode(data.proxyCountryCode);
    if (data.enabled && data.host && data.port) {
      setProxyEnabled(true);
      const port = parseInt(data.port, 10) || 0;
      proxyAuth = {
        host: data.host,
        port,
        username: data.proxyUsername || "",
        password: data.proxyPassword || "",
      };
    } else {
      setProxyEnabled(false);
    }
  },
);

// When proxy is enabled, set User-Agent (Windows) and Accept-Language to match proxy region.
// Chrome MV3: use declarativeNetRequest (webRequest cannot modify headers in MV3).
// Firefox: use webRequest.onBeforeSendHeaders.
const WINDOWS_UA_RULE_ID = 1;
const DNR_RESOURCE_TYPES = [
  "main_frame", "sub_frame", "xmlhttprequest", "script", "stylesheet",
  "image", "font", "object", "ping", "csp_report", "media", "websocket", "other",
];

function buildRegionHeaders() {
  const acceptLanguage = getAcceptLanguageForCountry(proxyCountryCode);
  return [
    { header: "user-agent", operation: "set", value: WINDOWS_USER_AGENT },
    { header: "accept-language", operation: "set", value: acceptLanguage },
  ];
}

function applyWindowsUserAgentRule(enable) {
  if (typeof chrome === "undefined" || !chrome.declarativeNetRequest) return;
  const requestHeaders = buildRegionHeaders();
  const rule = {
    id: WINDOWS_UA_RULE_ID,
    priority: 1,
    action: { type: "modifyHeaders", requestHeaders },
    condition: { regexFilter: ".*", resourceTypes: DNR_RESOURCE_TYPES },
  };
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [WINDOWS_UA_RULE_ID],
    addRules: enable ? [rule] : [],
  });
}

function setProxyEnabled(enabled) {
  proxyEnabled = !!enabled;
  if (typeof chrome !== "undefined" && chrome.declarativeNetRequest) {
    applyWindowsUserAgentRule(proxyEnabled);
  }
}

// Firefox: modify User-Agent and Accept-Language via webRequest (Chrome uses declarativeNetRequest above)
const webRequestAPI =
  typeof chrome !== "undefined"
    ? chrome.webRequest
    : typeof browser !== "undefined"
      ? browser.webRequest
      : null;
if (IS_FIREFOX && webRequestAPI && webRequestAPI.onBeforeSendHeaders) {
  const extraInfoSpec = ["requestHeaders"];
  try {
    webRequestAPI.onBeforeSendHeaders.addListener(
      (details) => {
        if (!proxyEnabled || !details.requestHeaders) return {};
        const drop = ["user-agent", "accept-language"];
        const headers = details.requestHeaders.filter(
          (h) => !drop.includes(h.name.toLowerCase()),
        );
        headers.push({ name: "User-Agent", value: WINDOWS_USER_AGENT });
        headers.push({
          name: "Accept-Language",
          value: getAcceptLanguageForCountry(proxyCountryCode),
        });
        return { requestHeaders: headers };
      },
      { urls: ["<all_urls>"] },
      extraInfoSpec,
    );
  } catch (_) {}
}

// Track download size from response Content-Length (when proxy is used)
if (
  typeof chrome !== "undefined" &&
  chrome.webRequest &&
  chrome.webRequest.onHeadersReceived
) {
  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const headers = details.responseHeaders || [];
      for (const h of headers) {
        if (h.name.toLowerCase() === "content-length" && h.value) {
          const n = parseInt(h.value, 10);
          if (!isNaN(n) && n > 0) {
            trafficStats.downloadBytes += n;
          }
          break;
        }
      }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"],
  );
}

// Chrome: auto-fill proxy auth to avoid "Se connecter" dialog (async so we can read storage)
if (
  typeof chrome !== "undefined" &&
  chrome.webRequest &&
  chrome.webRequest.onAuthRequired
) {
  chrome.webRequest.onAuthRequired.addListener(
    (details, asyncCallback) => {
      if (!details.isProxy || !details.challenger) {
        asyncCallback({});
        return;
      }
      const { host, port } = details.challenger;
      const challengerPort =
        typeof port === "number" ? port : parseInt(port, 10) || 0;
      function tryProvideAuth(data) {
        const storedPort = parseInt(data.port, 10) || 0;
        const user = data.proxyUsername ?? proxyAuth.username;
        const pass = data.proxyPassword ?? proxyAuth.password;
        if (
          data.enabled &&
          data.host === host &&
          (storedPort === challengerPort ||
            String(data.port) === String(port)) &&
          user
        ) {
          asyncCallback({
            authCredentials: { username: user, password: pass || "" },
          });
          return;
        }
        if (
          proxyAuth.host === host &&
          proxyAuth.port === challengerPort &&
          proxyAuth.username
        ) {
          asyncCallback({
            authCredentials: {
              username: proxyAuth.username,
              password: proxyAuth.password,
            },
          });
          return;
        }
        asyncCallback({});
      }
      chrome.storage.local.get(
        ["enabled", "host", "port", "proxyUsername", "proxyPassword"],
        tryProvideAuth,
      );
    },
    { urls: ["<all_urls>"] },
    ["asyncBlocking"],
  );
}

/**
 * Extract country code from Decodo-style username (e.g. user-xxx-country-be -> BE).
 * @param {string} username
 * @returns {string}
 */
function countryFromUsername(username) {
  if (!username) return "XX";
  const m = username.match(/country-([a-z]{2})/i);
  return m ? m[1].toUpperCase() : "XX";
}

/**
 * Load servers from a single CSV path (data.csv or data-random.csv).
 * Supports Decodo line format and CSV with header.
 * @param {string} pathInExtension - e.g. "data/data.csv"
 * @param {{ premium?: boolean }} opts - if premium: true, each server gets premium: true
 * @returns {Promise<Array<{countryCode,host,port,username,password,type,name,premium?}>>}
 */
function loadServersFromCsvPath(pathInExtension, opts = {}) {
  const url = chrome.runtime.getURL(pathInExtension);
  return fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error("CSV " + r.status);
      return r.text();
    })
    .then((text) => {
      const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
      if (lines.length === 0) return [];

      const first = lines[0];
      const isDecodoLine = (line) => {
        const parts = line.split(":");
        return parts.length >= 4 && /^\d+$/.test(parts[1]);
      };

      if (isDecodoLine(first)) {
        return lines.filter(isDecodoLine).map((line) => {
          const parts = line.split(":");
          const host = parts[0];
          const port = parseInt(parts[1], 10) || 1080;
          const username = parts[2];
          const password = parts.slice(3).join(":");
          const countryCode = countryFromUsername(username);
          return {
            ...(opts.premium && { premium: true }),
            countryCode,
            host,
            port,
            username,
            password,
            type: "http",
            name: countryCode,
          };
        });
      }

      const sep = first.includes("|") ? "|" : ",";
      const header = first.toLowerCase().split(sep).map((h) => h.trim());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(sep).map((p) => p.trim());
        const row = {};
        header.forEach((h, j) => { row[h] = (parts[j] || "").trim(); });
        const host = row.ip || row.host;
        const location = (row.location || row.countrycode || "").toUpperCase();
        if (!host) continue;
        rows.push({
          ...(opts.premium && { premium: true }),
          countryCode: location || "XX",
          host,
          port: parseInt(row.port, 10) || 1080,
          username: row.username || "",
          password: row.password || "",
          type: (row.type || "http").toLowerCase(),
          name: location || host,
        });
      }
      return rows;
    })
    .catch(() => []);
}

/**
 * Load premium servers (data.csv) and random pool (data-random.csv).
 * @returns {Promise<{ dedicatedServers: Array, randomServers: Array }>}
 */
function loadDefaultServersFromCSV() {
  return Promise.all([
    loadServersFromCsvPath("data/data.csv", { premium: true }),
    loadServersFromCsvPath("data/data-random.csv", {}),
  ]).then(([dedicatedServers, randomServers]) => ({ dedicatedServers, randomServers }));
}

/**
 * Fetch proxy list from Decodo API (optional). Requires decodoApiKey in storage.
 * API: https://help.decodo.com/reference
 * @param {string} apiKey
 * @returns {Promise<Array<{countryCode,host,port,username,password,type,name}>>}
 */
function loadServersFromDecodoAPI(apiKey) {
  if (!apiKey || !apiKey.trim()) return Promise.resolve([]);
  return fetch("https://api.decodo.com/v1/endpoints", {
    headers: { Authorization: "Bearer " + apiKey.trim() },
  })
    .then((r) => {
      if (!r.ok) throw new Error("API " + r.status);
      return r.json();
    })
    .then((data) => {
      const list = data.data || data.endpoints || (Array.isArray(data) ? data : []);
      return list
        .map((e) => {
          const countryCode =
            (e.country_code || e.countryCode || e.location || "")
              .toString()
              .toUpperCase()
              .slice(0, 2) || "XX";
          return {
            fromDecodo: true,
            countryCode,
            host: e.host || e.endpoint || "isp.decodo.com",
            port: parseInt(e.port, 10) || 10001,
            username: e.username || e.user || "",
            password: e.password || "",
            type: (e.type || "http").toLowerCase(),
            name: countryCode,
          };
        })
        .filter((s) => s.host);
    })
    .catch(() => []);
}

/**
 * Resolve server lists: always include CSV (data.csv + data-random.csv); if API key is set, add Decodo servers too.
 * @returns {Promise<{ dedicatedServers: Array, randomServers: Array }>}
 */
function getServersSource() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["decodoApiKey"], (keyData) => {
      const apiKey = (keyData.decodoApiKey || "").trim();
      loadDefaultServersFromCSV().then(({ dedicatedServers: csvDedicated, randomServers }) => {
        if (apiKey) {
          loadServersFromDecodoAPI(apiKey).then((decodoServers) => {
            const dedicatedServers = (csvDedicated || []).concat(decodoServers || []);
            resolve({ dedicatedServers, randomServers: randomServers || [] });
          });
        } else {
          resolve({ dedicatedServers: csvDedicated || [], randomServers: randomServers || [] });
        }
      });
    });
  });
}

// Listen for messages from popup/options to toggle or update proxy
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getTraffic") {
    sendResponse({ trafficStats: { ...trafficStats } });
    return false;
  }
  if (message.action === "getState") {
    getServersSource().then(({ dedicatedServers, randomServers }) => {
      chrome.storage.local.get(
        ["enabled", "host", "port", "type", "proxyCountryCode", "isRandomConnection", "proxyUsername", "proxyPassword"],
        (data) => {
          sendResponse({
            ...DEFAULT_CONFIG,
            ...data,
            proxyCountryCode: normalizeCountryCode(data.proxyCountryCode),
            dedicatedServers: dedicatedServers || [],
            randomServers: randomServers || [],
            isRandomConnection: !!data.isRandomConnection,
            trafficStats: { ...trafficStats },
          });
        },
      );
    });
    return true; // async response
  }
  if (message.action === "setState") {
    const { enabled, host, port, type, username, password, countryCode, isRandomConnection } =
      message.payload || {};
    const proxyUsername = username ?? "";
    const proxyPassword = password ?? "";
    proxyCountryCode = enabled && countryCode ? normalizeCountryCode(countryCode) : "";
    chrome.storage.local.set(
      {
        enabled: !!enabled,
        host: host ?? "",
        port: port ?? DEFAULT_CONFIG.port,
        type: type ?? DEFAULT_CONFIG.type,
        proxyUsername,
        proxyPassword,
        proxyCountryCode: proxyCountryCode,
        isRandomConnection: !!isRandomConnection,
      },
      () => {
        if (enabled && host && port) {
          proxyAuth = {
            host,
            port: port ?? DEFAULT_CONFIG.port,
            username: proxyUsername,
            password: proxyPassword,
          };
          setProxyEnabled(true);
          Promise.resolve(
            applyProxy({ host, port, type: type ?? DEFAULT_CONFIG.type }),
          )
            .then(() => sendResponse({ success: true }))
            .catch((err) =>
              sendResponse({ success: false, error: String(err) }),
            );
          return;
        } else {
          proxyAuth = { host: "", port: 0, username: "", password: "" };
          Promise.resolve(clearProxy())
            .then(() => sendResponse({ success: true }))
            .catch((err) =>
              sendResponse({ success: false, error: String(err) }),
            );
          return;
        }
      },
    );
    return true;
  }
  if (message.action === "openvpnNative") {
    const nativeName = "com.vpn_cx_proxy.openvpn";
    try {
      chrome.runtime.sendNativeMessage(
        nativeName,
        message.payload || {},
        (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse(response || { success: true });
          }
        },
      );
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
    return true;
  }
  return false;
});
