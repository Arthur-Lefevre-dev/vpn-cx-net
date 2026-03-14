/**
 * Options page: OpenVPN only (+ optional Decodo API key). Language selector.
 */

const ovpnPathInput = document.getElementById('ovpnPath');
const openvpnStartBtn = document.getElementById('openvpnStartBtn');
const openvpnStopBtn = document.getElementById('openvpnStopBtn');
const openvpnStatus = document.getElementById('openvpnStatus');
const decodoApiKeyInput = document.getElementById('decodoApiKey');
const messageEl = document.getElementById('message');
const localeSelect = document.getElementById('localeSelect');

function showMessage(text, type) {
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + (type || 'success');
    messageEl.hidden = false;
    setTimeout(() => { messageEl.hidden = true; }, 4000);
  }
}

function setOpenVpnStatus(text, isError) {
  if (openvpnStatus) {
    openvpnStatus.textContent = text;
    openvpnStatus.className = 'message openvpn-status' + (isError ? ' error' : ' success');
    openvpnStatus.hidden = !text;
  }
}

/** Apply current locale to all option page strings (call after setLocale). */
function applyLocale() {
  if (typeof getMessage === 'undefined') return;
  const doc = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = getMessage(key); };
  doc('optionsAppName', 'appName');
  doc('optionsSubtitle', 'openvpn');
  doc('languageLabel', 'languageLabel');
  doc('openvpnTitle', 'openvpn');
  doc('openvpnHelp', 'openvpnHelp');
  doc('ovpnPathLabel', 'ovpnPathLabel');
  doc('decodoApiKeyLabel', 'decodoApiKeyLabel');
  doc('decodoApiKeyHelp', 'decodoApiKeyHelp');
  doc('creditPrefix', 'madeBy');
  if (ovpnPathInput) ovpnPathInput.placeholder = getMessage('ovpnPathPlaceholder');
  if (decodoApiKeyInput) decodoApiKeyInput.placeholder = getMessage('decodoApiKeyPlaceholder');
  if (openvpnStartBtn) openvpnStartBtn.textContent = getMessage('openvpnStart');
  if (openvpnStopBtn) openvpnStopBtn.textContent = getMessage('openvpnStop');
  document.title = getMessage('settingsTitle');
}

function loadOptions() {
  chrome.storage.local.get(['ovpnPath', 'decodoApiKey', 'locale'], (data) => {
    if (ovpnPathInput) ovpnPathInput.value = data.ovpnPath || '';
    if (decodoApiKeyInput) decodoApiKeyInput.value = data.decodoApiKey || '';
    if (typeof setLocale !== 'undefined') setLocale(data.locale || 'en');
    applyLocale();
    if (localeSelect) localeSelect.value = (data.locale === 'fr' ? 'fr' : 'en');
  });
}

if (openvpnStartBtn) {
  openvpnStartBtn.addEventListener('click', () => {
  const path = ovpnPathInput.value.trim();
  const t = typeof getMessage !== 'undefined' ? getMessage : (k) => k;
  if (!path) {
    setOpenVpnStatus(t('ovpnPathRequired'), true);
    return;
  }
  chrome.storage.local.set({ ovpnPath: path }, () => {});
  setOpenVpnStatus(t('openvpnStarting'));
  openvpnStartBtn.disabled = true;
  chrome.runtime.sendMessage({
    action: 'openvpnNative',
    payload: { action: 'start', configPath: path }
  }, (response) => {
    openvpnStartBtn.disabled = false;
    if (response && response.success) {
      setOpenVpnStatus(t('openvpnStarted'));
    } else {
      setOpenVpnStatus((response && response.error) || t('openvpnStartFailed'), true);
    }
  });
});
}

if (openvpnStopBtn) {
  openvpnStopBtn.addEventListener('click', () => {
  const t = typeof getMessage !== 'undefined' ? getMessage : (k) => k;
  setOpenVpnStatus(t('openvpnStopping'));
  openvpnStopBtn.disabled = true;
  chrome.runtime.sendMessage({
    action: 'openvpnNative',
    payload: { action: 'stop' }
  }, (response) => {
    openvpnStopBtn.disabled = false;
    if (response && response.success) {
      setOpenVpnStatus(t('openvpnStopped'));
    } else {
      setOpenVpnStatus((response && response.error) || t('openvpnStopFailed'), true);
    }
  });
});
}

if (decodoApiKeyInput) {
  decodoApiKeyInput.addEventListener('blur', () => {
    chrome.storage.local.set({ decodoApiKey: decodoApiKeyInput.value.trim() }, () => {});
  });
}

if (localeSelect) {
  localeSelect.addEventListener('change', () => {
    const locale = localeSelect.value === 'fr' ? 'fr' : 'en';
    chrome.storage.local.set({ locale }, () => {
      if (typeof setLocale !== 'undefined') setLocale(locale);
      applyLocale();
    });
  });
}

loadOptions();
