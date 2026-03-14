/**
 * Options page: OpenVPN only (+ optional Decodo API key).
 */

const ovpnPathInput = document.getElementById('ovpnPath');
const openvpnStartBtn = document.getElementById('openvpnStartBtn');
const openvpnStopBtn = document.getElementById('openvpnStopBtn');
const openvpnStatus = document.getElementById('openvpnStatus');
const decodoApiKeyInput = document.getElementById('decodoApiKey');
const messageEl = document.getElementById('message');

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

function loadOptions() {
  chrome.storage.local.get(['ovpnPath', 'decodoApiKey'], (data) => {
    if (ovpnPathInput) ovpnPathInput.value = data.ovpnPath || '';
    if (decodoApiKeyInput) decodoApiKeyInput.value = data.decodoApiKey || '';
  });
}

if (openvpnStartBtn) {
  openvpnStartBtn.addEventListener('click', () => {
  const path = ovpnPathInput.value.trim();
  if (!path) {
    setOpenVpnStatus('Indiquez le chemin du fichier .ovpn.', true);
    return;
  }
  chrome.storage.local.set({ ovpnPath: path }, () => {});
  setOpenVpnStatus('Démarrage…');
  openvpnStartBtn.disabled = true;
  chrome.runtime.sendMessage({
    action: 'openvpnNative',
    payload: { action: 'start', configPath: path }
  }, (response) => {
    openvpnStartBtn.disabled = false;
    if (response && response.success) {
      setOpenVpnStatus('OpenVPN démarré.');
    } else {
      setOpenVpnStatus((response && response.error) || 'Échec. Vérifiez que le host natif est installé (voir README).', true);
    }
  });
});
}

if (openvpnStopBtn) {
  openvpnStopBtn.addEventListener('click', () => {
  setOpenVpnStatus('Arrêt…');
  openvpnStopBtn.disabled = true;
  chrome.runtime.sendMessage({
    action: 'openvpnNative',
    payload: { action: 'stop' }
  }, (response) => {
    openvpnStopBtn.disabled = false;
    if (response && response.success) {
      setOpenVpnStatus('OpenVPN arrêté.');
    } else {
      setOpenVpnStatus((response && response.error) || 'Échec ou OpenVPN n’était pas démarré.', true);
    }
  });
});
}

if (decodoApiKeyInput) {
  decodoApiKeyInput.addEventListener('blur', () => {
    chrome.storage.local.set({ decodoApiKey: decodoApiKeyInput.value.trim() }, () => {});
  });
}

loadOptions();
