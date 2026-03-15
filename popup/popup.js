/**
 * Popup: country list from Decodo API or data.csv, flag icons from web (CDN), default selection = none.
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
const localeSelect = document.getElementById('localeSelect');

/** URL for a country flag image (web CDN). */
function flagImageUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  return 'https://flagcdn.com/w40/' + countryCode.toLowerCase() + '.png';
}

/** Create an img element for a country flag (loaded from web). */
function createFlagImg(code) {
  const img = document.createElement('img');
  img.className = 'flag-img';
  img.alt = code || '';
  img.src = flagImageUrl(code);
  return img;
}

function countryName(server) {
  return typeof getCountryName !== 'undefined' ? getCountryName(serverCountryCode(server)) : serverCountryCode(server);
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
      currentCountryFlag.src = flagImageUrl(code);
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
      serverSelectValue.textContent = typeof getMessage !== 'undefined' ? getMessage('chooseCountryPlaceholder') : '— Choose a country —';
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
  if (statusText) statusText.textContent = enabled ? (typeof getMessage !== 'undefined' ? getMessage('proxyActive') : 'Proxy active') : (typeof getMessage !== 'undefined' ? getMessage('proxyDisabled') : 'Proxy disabled');

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
  // Only restore selected country when proxy is enabled; when disabled, show "Choose a country"
  if (enabled && hasConfig && servers.length > 0) {
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
    defaultOpt.textContent = typeof getMessage !== 'undefined' ? getMessage('chooseCountryPlaceholder') : '— Choose a country —';
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
    const t = typeof getMessage !== 'undefined' ? getMessage : (k) => k;
    if (!hasConfig && !enabled) {
      toggleBtn.textContent = t('configureInSettings');
    } else if (enabled) {
      toggleBtn.textContent = t('disableProxy');
      toggleBtn.classList.add('off');
    } else {
      toggleBtn.textContent = t('enableProxy');
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
      if (statusText) statusText.textContent = typeof getMessage !== 'undefined' ? getMessage('error') : 'Error';
      return;
    }
    renderState(state || {});
  });
}

/** Set static labels from current locale (call after setLocale). */
function updateStaticLabels() {
  if (typeof getMessage === 'undefined') return;
  const appTitle = document.getElementById('appTitle');
  if (appTitle) appTitle.textContent = getMessage('appName');
  const trafficLabelDown = document.getElementById('trafficLabelDown');
  if (trafficLabelDown) trafficLabelDown.textContent = getMessage('trafficDown');
  const trafficLabelUp = document.getElementById('trafficLabelUp');
  if (trafficLabelUp) trafficLabelUp.textContent = getMessage('trafficUp');
  const trafficLabelTotal = document.getElementById('trafficLabelTotal');
  if (trafficLabelTotal) trafficLabelTotal.textContent = getMessage('trafficTotal');
  const countryLabel = document.getElementById('countryLabel');
  if (countryLabel) countryLabel.textContent = getMessage('country');
  if (serverSelectTrigger) serverSelectTrigger.setAttribute('aria-label', getMessage('chooseCountry'));
  if (optionsBtn) optionsBtn.textContent = getMessage('settings');
  const creditPrefix = document.getElementById('creditPrefix');
  if (creditPrefix) creditPrefix.textContent = getMessage('madeBy');
  if (statusText) statusText.textContent = getMessage('loading');
  if (localeSelect) localeSelect.setAttribute('aria-label', getMessage('languageLabel'));
  const localeLabel = document.getElementById('localeLabel');
  if (localeLabel) localeLabel.textContent = getMessage('languageLabel');
  const supportMessage = document.getElementById('supportMessage');
  if (supportMessage) supportMessage.textContent = getMessage('supportMessage');
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

// Load locale from storage (default: en), then init UI and state
chrome.storage.local.get(['locale'], (data) => {
  const locale = data.locale === 'fr' ? 'fr' : 'en';
  if (typeof setLocale !== 'undefined') setLocale(locale);
  if (localeSelect) localeSelect.value = locale;
  updateStaticLabels();
  loadState();
  startTrafficRefresh();
});

if (localeSelect) {
  localeSelect.addEventListener('change', () => {
    const locale = localeSelect.value === 'fr' ? 'fr' : 'en';
    chrome.storage.local.set({ locale }, () => {
      if (typeof setLocale !== 'undefined') setLocale(locale);
      updateStaticLabels();
      loadState();
    });
  });
}

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
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTrafficRefresh();
  else startTrafficRefresh();
});
window.addEventListener('pagehide', stopTrafficRefresh);
