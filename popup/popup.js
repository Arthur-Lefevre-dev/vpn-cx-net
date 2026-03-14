/**
 * Popup: country list from Decodo API or data.csv, flag icons from icons/flags/XX.png, default selection = none.
 */

const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const proxyInfo = document.getElementById('proxyInfo');
const serverSelectWrap = document.getElementById('serverSelectWrap');
const serverSelectTrigger = document.getElementById('serverSelectTrigger');
const serverSelectValue = document.getElementById('serverSelectValue');
const serverSelectDropdown = document.getElementById('serverSelectDropdown');
const toggleBtn = document.getElementById('toggleBtn');
const optionsBtn = document.getElementById('optionsBtn');
const currentCountry = document.getElementById('currentCountry');
const currentCountryFlag = document.getElementById('currentCountryFlag');
const currentCountryName = document.getElementById('currentCountryName');
const trafficDown = document.getElementById('trafficDown');
const trafficUp = document.getElementById('trafficUp');
const trafficTotal = document.getElementById('trafficTotal');

const COUNTRY_NAMES = {
  FR: 'France', US: 'États-Unis', GB: 'Royaume-Uni', DE: 'Allemagne', ES: 'Espagne',
  IT: 'Italie', NL: 'Pays-Bas', BE: 'Belgique', CA: 'Canada', AU: 'Australie', JP: 'Japon',
  BR: 'Brésil', IN: 'Inde', MX: 'Mexique', PL: 'Pologne', SE: 'Suède',
  CH: 'Suisse', AT: 'Autriche', PT: 'Portugal', RU: 'Russie',
  KR: 'Corée du Sud', SG: 'Singapour', HK: 'Hong Kong', TR: 'Turquie'
};

function flagIconUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  return chrome.runtime.getURL('icons/flags/' + countryCode.toUpperCase() + '.png');
}

function flagCdnUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  return 'https://flagcdn.com/w40/' + countryCode.toLowerCase() + '.png';
}

/** Create an img element for a country flag (local icon with CDN fallback). */
function createFlagImg(code) {
  const img = document.createElement('img');
  img.className = 'flag-img';
  img.alt = '';
  img.src = flagIconUrl(code);
  img.onerror = function () {
    this.onerror = null;
    this.src = flagCdnUrl(code);
    this.alt = code;
  };
  return img;
}

function countryName(server) {
  const code = (server.countryCode || server.name || 'XX').toUpperCase();
  return COUNTRY_NAMES[code] || code;
}

/** Get normalized country code from server object. */
function serverCountryCode(server) {
  return (server.countryCode || server.name || 'XX').toUpperCase();
}

/** Update current selection display: trigger value, big flag block, and optional container. */
function setSelectionDisplay(serverOrNull) {
  if (serverSelectValue) {
    serverSelectValue.textContent = '';
    serverSelectValue.querySelectorAll('.flag-img').forEach((el) => el.remove());
  }
  if (currentCountry) currentCountry.setAttribute('aria-hidden', serverOrNull ? 'false' : 'true');
  if (currentCountryFlag) {
    if (serverOrNull) {
      const code = serverCountryCode(serverOrNull);
      currentCountryFlag.src = flagIconUrl(code);
      currentCountryFlag.onerror = function () {
        this.onerror = null;
        this.src = flagCdnUrl(code);
      };
      currentCountryFlag.alt = code;
    } else {
      currentCountryFlag.removeAttribute('src');
    }
  }
  if (currentCountryName) currentCountryName.textContent = serverOrNull ? countryName(serverOrNull) : '';
  if (serverSelectValue) {
    if (serverOrNull) {
      const code = serverCountryCode(serverOrNull);
      serverSelectValue.appendChild(createFlagImg(code));
      serverSelectValue.appendChild(document.createTextNode(' ' + countryName(serverOrNull)));
    } else {
      serverSelectValue.textContent = '— Choisir un pays —';
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
}

let currentServers = [];
let selectedIndex = -1;

function renderState(state) {
  const enabled = !!state.enabled;
  const hasConfig = !!(state.host && state.port);
  const servers = state.dedicatedServers || [];
  currentServers = servers;

  if (statusDot) {
    statusDot.classList.toggle('active', enabled);
    statusDot.classList.toggle('inactive', !enabled);
  }
  if (statusText) statusText.textContent = enabled ? 'Proxy actif' : 'Proxy désactivé';

  const traffic = state.trafficStats || {};
  const down = traffic.downloadBytes != null ? traffic.downloadBytes : 0;
  const up = traffic.uploadBytes != null ? traffic.uploadBytes : 0;
  if (trafficDown) trafficDown.textContent = down > 0 ? formatBytes(down) : '—';
  if (trafficUp) trafficUp.textContent = up > 0 ? formatBytes(up) : '—';
  if (trafficTotal) trafficTotal.textContent = down + up > 0 ? formatBytes(down + up) : '—';

  if (proxyInfo) {
    if (enabled && hasConfig) {
      const typeLabel = { openvpn: 'OpenVPN', socks5: 'SOCKS5', socks4: 'SOCKS4', http: 'HTTP' }[state.type] || state.type || 'SOCKS5';
      proxyInfo.textContent = `${state.host}:${state.port} (${typeLabel})`;
      proxyInfo.hidden = false;
    } else {
      proxyInfo.textContent = '';
      proxyInfo.hidden = true;
    }
  }

  selectedIndex = -1;
  setSelectionDisplay(null);
  if (hasConfig && servers.length > 0) {
    const idx = servers.findIndex((s) => s.host === state.host && s.port === state.port);
    if (idx >= 0) {
      selectedIndex = idx;
      setSelectionDisplay(servers[idx]);
    }
  }

  if (!serverSelectDropdown) return;
  serverSelectDropdown.innerHTML = '';
  if (servers.length > 0 && serverSelectWrap) {
    serverSelectWrap.hidden = false;
    const defaultOpt = document.createElement('button');
    defaultOpt.type = 'button';
    defaultOpt.className = 'server-select-option server-select-option-default';
    defaultOpt.role = 'option';
    defaultOpt.dataset.index = '-1';
    defaultOpt.textContent = '— Choisir un pays —';
    serverSelectDropdown.appendChild(defaultOpt);
    servers.forEach((s, i) => {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'server-select-option';
      opt.role = 'option';
      opt.dataset.index = String(i);
      opt.appendChild(createFlagImg(serverCountryCode(s)));
      opt.appendChild(document.createTextNode(' ' + countryName(s)));
      serverSelectDropdown.appendChild(opt);
    });
  } else if (serverSelectWrap) {
    serverSelectWrap.hidden = true;
  }

  if (toggleBtn) {
    toggleBtn.disabled = !hasConfig && !enabled;
    if (!hasConfig && !enabled) {
      toggleBtn.textContent = 'Configurer dans Paramètres';
    } else if (enabled) {
      toggleBtn.textContent = 'Désactiver le proxy';
      toggleBtn.classList.add('off');
    } else {
      toggleBtn.textContent = 'Activer le proxy';
      toggleBtn.classList.remove('off');
    }
  }
}

function closeDropdown() {
  if (serverSelectDropdown) serverSelectDropdown.setAttribute('aria-hidden', 'true');
  if (serverSelectTrigger) serverSelectTrigger.setAttribute('aria-expanded', 'false');
}

function openDropdown() {
  if (serverSelectDropdown) serverSelectDropdown.setAttribute('aria-hidden', 'false');
  if (serverSelectTrigger) serverSelectTrigger.setAttribute('aria-expanded', 'true');
}

if (serverSelectTrigger) {
  serverSelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (serverSelectDropdown && serverSelectDropdown.getAttribute('aria-hidden') === 'true') {
      openDropdown();
    } else {
      closeDropdown();
    }
  });
}

if (serverSelectDropdown) {
  serverSelectDropdown.addEventListener('click', (e) => {
  const opt = e.target.closest('.server-select-option');
  if (!opt) return;
  const idx = parseInt(opt.dataset.index, 10);
  if (idx < 0) {
    setSelectionDisplay(null);
    selectedIndex = -1;
    closeDropdown();
    chrome.runtime.sendMessage({
      action: 'setState',
      payload: { enabled: false, host: '', port: 0, type: 'http' }
    }, () => loadState());
    return;
  }
  if (!currentServers[idx]) return;
  const server = currentServers[idx];
  selectedIndex = idx;
  setSelectionDisplay(server);
  closeDropdown();

  chrome.runtime.sendMessage({
    action: 'setState',
    payload: {
      enabled: true,
      host: server.host,
      port: server.port,
      type: server.type || 'http',
      username: server.username || '',
      password: server.password || ''
    }
  }, () => loadState());
  });
}

document.addEventListener('click', () => closeDropdown());

/** Update only traffic values in the UI (for real-time refresh). */
function updateTrafficDisplay(trafficStats) {
  const traffic = trafficStats || {};
  const down = traffic.downloadBytes != null ? traffic.downloadBytes : 0;
  const up = traffic.uploadBytes != null ? traffic.uploadBytes : 0;
  if (trafficDown) trafficDown.textContent = down > 0 ? formatBytes(down) : '—';
  if (trafficUp) trafficUp.textContent = up > 0 ? formatBytes(up) : '—';
  if (trafficTotal) trafficTotal.textContent = down + up > 0 ? formatBytes(down + up) : '—';
}

function loadState() {
  chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
    if (chrome.runtime.lastError) {
      if (statusText) statusText.textContent = 'Erreur';
      return;
    }
    renderState(state || {});
  });
}

if (optionsBtn) {
  optionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'), '_blank');
    }
  });
}

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
      if (chrome.runtime.lastError) return;
      const nextEnabled = !state.enabled;
      chrome.runtime.sendMessage({
        action: 'setState',
        payload: {
          enabled: nextEnabled,
          host: state.host,
          port: state.port,
          type: state.type
        }
      }, () => loadState());
    });
  });
}

loadState();

// Refresh traffic stats every 2s while popup is open (real-time update)
let trafficRefreshInterval = null;
function startTrafficRefresh() {
  if (trafficRefreshInterval) return;
  trafficRefreshInterval = setInterval(() => {
    chrome.runtime.sendMessage({ action: 'getTraffic' }, (data) => {
      if (!chrome.runtime.lastError && data && data.trafficStats) {
        updateTrafficDisplay(data.trafficStats);
      }
    });
  }, 2000);
}
function stopTrafficRefresh() {
  if (trafficRefreshInterval) {
    clearInterval(trafficRefreshInterval);
    trafficRefreshInterval = null;
  }
}
startTrafficRefresh();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTrafficRefresh();
  else startTrafficRefresh();
});
window.addEventListener('pagehide', stopTrafficRefresh);
