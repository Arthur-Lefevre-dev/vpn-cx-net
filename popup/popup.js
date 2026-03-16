/**
 * Popup: country list from Decodo API or data.csv, flag icons from web (CDN), default selection = none.
 */

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const proxyInfo = document.getElementById("proxyInfo");
const serverSelectWrap = document.getElementById("serverSelectWrap");
const serverSelectTrigger = document.getElementById("serverSelectTrigger");
const serverSelectValue = document.getElementById("serverSelectValue");
const serverSelectDropdown = document.getElementById("serverSelectDropdown");
const toggleBtn = document.getElementById("toggleBtn");
const optionsBtn = document.getElementById("optionsBtn");
const currentCountry = document.getElementById("currentCountry");
const currentCountryFlag = document.getElementById("currentCountryFlag");
const currentCountryName = document.getElementById("currentCountryName");
const trafficDown = document.getElementById("trafficDown");
const trafficUp = document.getElementById("trafficUp");
const trafficTotal = document.getElementById("trafficTotal");
const localeSelect = document.getElementById("localeSelect");

/** Safe i18n: use getMessage when locales.js is loaded, else fallback/key. */
function msg(key, fallback) {
  return typeof getMessage !== "undefined" ? getMessage(key) : (fallback !== undefined ? fallback : key);
}

const PROXY_TYPE_LABELS = { openvpn: "OpenVPN", socks5: "SOCKS5", socks4: "SOCKS4", http: "HTTP" };

/** URL for a country flag image (web CDN). */
function flagImageUrl(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "";
  return "https://flagcdn.com/w40/" + countryCode.toLowerCase() + ".png";
}

/** Create an img element for a country flag (loaded from web). */
function createFlagImg(code) {
  const img = document.createElement("img");
  img.className = "flag-img";
  img.alt = code || "";
  img.src = flagImageUrl(code);
  return img;
}

/** Create a "?" span used as flag for the Random option. */
function createRandomFlagSpan() {
  const span = document.createElement("span");
  span.className = "flag-img flag-random";
  span.setAttribute("aria-hidden", "true");
  span.textContent = "?";
  return span;
}

function countryName(server) {
  return typeof getCountryName !== "undefined"
    ? getCountryName(serverCountryCode(server))
    : serverCountryCode(server);
}

/** Get normalized country code from server object. */
function serverCountryCode(server) {
  return (server.countryCode || server.name || "XX").toUpperCase();
}

const RANDOM_INDEX = "random";

/** Update current selection display: trigger value, big flag block, and optional container. */
function setSelectionDisplay(serverOrNull) {
  if (serverSelectValue) {
    serverSelectValue.textContent = "";
    serverSelectValue.querySelectorAll(".flag-img, .flag-random").forEach((el) => el.remove());
  }
  if (currentCountry) {
    currentCountry.setAttribute("aria-hidden", serverOrNull ? "false" : "true");
    currentCountry.classList.toggle("is-random", !!(serverOrNull && serverOrNull.isRandom));
  }
  if (currentCountryFlag) {
    if (serverOrNull && !serverOrNull.isRandom) {
      const code = serverCountryCode(serverOrNull);
      currentCountryFlag.src = flagImageUrl(code);
      currentCountryFlag.alt = code;
    } else {
      currentCountryFlag.removeAttribute("src");
      currentCountryFlag.alt = serverOrNull && serverOrNull.isRandom ? "?" : "";
    }
  }
  if (currentCountryName)
    currentCountryName.textContent = serverOrNull
      ? (serverOrNull.isRandom ? "Random" : countryName(serverOrNull))
      : "";
  if (serverSelectValue) {
    if (serverOrNull) {
      if (serverOrNull.isRandom) {
        serverSelectValue.appendChild(createRandomFlagSpan());
        serverSelectValue.appendChild(document.createTextNode(" Random"));
      } else {
        const code = serverCountryCode(serverOrNull);
        serverSelectValue.appendChild(createFlagImg(code));
        serverSelectValue.appendChild(document.createTextNode(" " + countryName(serverOrNull)));
      }
    } else {
      serverSelectValue.textContent = msg("chooseCountryPlaceholder", "— Choose a country —");
    }
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(1)) +
    " " +
    ["B", "KB", "MB", "GB"][i]
  );
}

let currentServers = [];
let currentRandomServers = [];
let selectedIndex = -1;

function renderState(state) {
  const enabled = !!state.enabled;
  const hasConfig = !!(state.host && state.port);
  const servers = (state.dedicatedServers || []).slice().sort((a, b) =>
    countryName(a).localeCompare(countryName(b))
  );
  currentServers = servers;
  currentRandomServers = state.randomServers || [];

  if (statusDot) {
    statusDot.classList.toggle("active", enabled);
    statusDot.classList.toggle("inactive", !enabled);
  }
  if (statusText)
    statusText.textContent = enabled ? msg("proxyActive", "Proxy active") : msg("proxyDisabled", "Proxy disabled");

  const traffic = state.trafficStats || {};
  const down = traffic.downloadBytes != null ? traffic.downloadBytes : 0;
  const up = traffic.uploadBytes != null ? traffic.uploadBytes : 0;
  if (trafficDown) trafficDown.textContent = down > 0 ? formatBytes(down) : "—";
  if (trafficUp) trafficUp.textContent = up > 0 ? formatBytes(up) : "—";
  if (trafficTotal)
    trafficTotal.textContent = down + up > 0 ? formatBytes(down + up) : "—";

  if (proxyInfo) {
    if (enabled && hasConfig) {
      const typeLabel = PROXY_TYPE_LABELS[state.type] || state.type || "SOCKS5";
      proxyInfo.textContent = `${state.host}:${state.port} (${typeLabel})`;
      proxyInfo.hidden = false;
    } else {
      proxyInfo.textContent = "";
      proxyInfo.hidden = true;
    }
  }

  selectedIndex = -1;
  setSelectionDisplay(null);
  if (enabled && hasConfig) {
    if (state.isRandomConnection) {
      selectedIndex = RANDOM_INDEX;
      setSelectionDisplay({ isRandom: true });
    } else if (servers.length > 0) {
      const idx = servers.findIndex((s) => s.host === state.host && s.port === state.port);
      if (idx >= 0) {
        selectedIndex = idx;
        setSelectionDisplay(servers[idx]);
      }
    }
  }

  if (!serverSelectDropdown) return;
  serverSelectDropdown.innerHTML = "";
  const hasOptions = servers.length > 0 || currentRandomServers.length > 0;
  if (hasOptions && serverSelectWrap) {
    serverSelectWrap.hidden = false;
    const defaultOpt = document.createElement("button");
    defaultOpt.type = "button";
    defaultOpt.className = "server-select-option server-select-option-default";
    defaultOpt.role = "option";
    defaultOpt.dataset.index = "-1";
    defaultOpt.textContent = msg("chooseCountryPlaceholder", "— Choose a country —");
    serverSelectDropdown.appendChild(defaultOpt);
    servers.forEach((s, i) => {
      const opt = document.createElement("button");
      opt.type = "button";
      opt.className = "server-select-option";
      opt.role = "option";
      opt.dataset.index = String(i);
      opt.appendChild(createFlagImg(serverCountryCode(s)));
      opt.appendChild(document.createTextNode(" " + countryName(s)));
      serverSelectDropdown.appendChild(opt);
    });
    if (currentRandomServers.length > 0) {
      const randomOpt = document.createElement("button");
      randomOpt.type = "button";
      randomOpt.className = "server-select-option";
      randomOpt.role = "option";
      randomOpt.dataset.index = RANDOM_INDEX;
      randomOpt.appendChild(createRandomFlagSpan());
      randomOpt.appendChild(document.createTextNode(" Random"));
      serverSelectDropdown.appendChild(randomOpt);
    }
  } else if (serverSelectWrap) {
    serverSelectWrap.hidden = true;
  }

  if (toggleBtn) {
    toggleBtn.disabled = !hasConfig && !enabled;
    if (!hasConfig && !enabled) {
      toggleBtn.textContent = msg("configureInSettings");
    } else if (enabled) {
      toggleBtn.textContent = msg("disableProxy");
      toggleBtn.classList.add("off");
    } else {
      toggleBtn.textContent = msg("enableProxy");
      toggleBtn.classList.remove("off");
    }
  }
}

function closeDropdown() {
  if (serverSelectDropdown)
    serverSelectDropdown.setAttribute("aria-hidden", "true");
  if (serverSelectTrigger)
    serverSelectTrigger.setAttribute("aria-expanded", "false");
}

function openDropdown() {
  if (serverSelectDropdown)
    serverSelectDropdown.setAttribute("aria-hidden", "false");
  if (serverSelectTrigger)
    serverSelectTrigger.setAttribute("aria-expanded", "true");
}

if (serverSelectTrigger) {
  serverSelectTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (
      serverSelectDropdown &&
      serverSelectDropdown.getAttribute("aria-hidden") === "true"
    ) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });
}

if (serverSelectDropdown) {
  serverSelectDropdown.addEventListener("click", (e) => {
    const opt = e.target.closest(".server-select-option");
    if (!opt) return;
    const idx = opt.dataset.index;
    if (idx === "-1") {
      setSelectionDisplay(null);
      selectedIndex = -1;
      closeDropdown();
      chrome.runtime.sendMessage(
        {
          action: "setState",
          payload: { enabled: false, host: "", port: 0, type: "http", isRandomConnection: false },
        },
        () => loadState(),
      );
      return;
    }
    if (idx === RANDOM_INDEX) {
      if (currentRandomServers.length === 0) return;
      const server = currentRandomServers[Math.floor(Math.random() * currentRandomServers.length)];
      selectedIndex = RANDOM_INDEX;
      setSelectionDisplay({ isRandom: true });
      closeDropdown();
      chrome.runtime.sendMessage(
        {
          action: "setState",
          payload: {
            enabled: true,
            host: server.host,
            port: server.port,
            type: server.type || "http",
            username: server.username || "",
            password: server.password || "",
            countryCode: serverCountryCode(server),
            isRandomConnection: true,
          },
        },
        () => loadState(),
      );
      return;
    }
    const i = parseInt(idx, 10);
    if (!Number.isFinite(i) || !currentServers[i]) return;
    const server = currentServers[i];
    selectedIndex = i;
    setSelectionDisplay(server);
    closeDropdown();
    chrome.runtime.sendMessage(
      {
        action: "setState",
        payload: {
          enabled: true,
          host: server.host,
          port: server.port,
          type: server.type || "http",
          username: server.username || "",
          password: server.password || "",
          countryCode: serverCountryCode(server),
          isRandomConnection: false,
        },
      },
      () => loadState(),
    );
  });
}

document.addEventListener("click", () => closeDropdown());

/** Update only traffic values in the UI (for real-time refresh). */
function updateTrafficDisplay(trafficStats) {
  const traffic = trafficStats || {};
  const down = traffic.downloadBytes != null ? traffic.downloadBytes : 0;
  const up = traffic.uploadBytes != null ? traffic.uploadBytes : 0;
  if (trafficDown) trafficDown.textContent = down > 0 ? formatBytes(down) : "—";
  if (trafficUp) trafficUp.textContent = up > 0 ? formatBytes(up) : "—";
  if (trafficTotal)
    trafficTotal.textContent = down + up > 0 ? formatBytes(down + up) : "—";
}

function loadState() {
  chrome.runtime.sendMessage({ action: "getState" }, (state) => {
    if (chrome.runtime.lastError) {
      if (statusText) statusText.textContent = msg("error", "Error");
      return;
    }
    renderState(state || {});
  });
}

/** Set static labels from current locale (call after setLocale). */
function updateStaticLabels() {
  if (typeof getMessage === "undefined") return;
  const set = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = getMessage(key);
  };
  set("appTitle", "appName");
  set("trafficLabelDown", "trafficDown");
  set("trafficLabelUp", "trafficUp");
  set("trafficLabelTotal", "trafficTotal");
  set("countryLabel", "country");
  set("localeLabel", "languageLabel");
  set("supportMessage", "supportMessage");
  if (serverSelectTrigger) serverSelectTrigger.setAttribute("aria-label", getMessage("chooseCountry"));
  if (optionsBtn) optionsBtn.textContent = getMessage("settings");
  set("creditPrefix", "madeBy");
  if (statusText) statusText.textContent = getMessage("loading");
  if (localeSelect) localeSelect.setAttribute("aria-label", getMessage("languageLabel"));
}

if (optionsBtn) {
  optionsBtn.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options/options.html"), "_blank");
    }
  });
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "getState" }, (state) => {
      if (chrome.runtime.lastError) return;
      const nextEnabled = !state.enabled;
      const payload = {
        enabled: nextEnabled,
        host: state.host,
        port: state.port,
        type: state.type,
        isRandomConnection: nextEnabled ? !!state.isRandomConnection : false,
      };
      if (nextEnabled && state.proxyCountryCode) {
        payload.countryCode = state.proxyCountryCode;
      }
      if (nextEnabled && state.proxyUsername != null) payload.username = state.proxyUsername;
      if (nextEnabled && state.proxyPassword != null) payload.password = state.proxyPassword;
      chrome.runtime.sendMessage(
        { action: "setState", payload },
        () => loadState(),
      );
    });
  });
}

// Load locale from storage (default: en), then init UI and state
chrome.storage.local.get(["locale"], (data) => {
  const locale = data.locale === "fr" ? "fr" : "en";
  if (typeof setLocale !== "undefined") setLocale(locale);
  if (localeSelect) localeSelect.value = locale;
  updateStaticLabels();
  loadState();
  startTrafficRefresh();
});

if (localeSelect) {
  localeSelect.addEventListener("change", () => {
    const locale = localeSelect.value === "fr" ? "fr" : "en";
    chrome.storage.local.set({ locale }, () => {
      if (typeof setLocale !== "undefined") setLocale(locale);
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
    chrome.runtime.sendMessage({ action: "getTraffic" }, (data) => {
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
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopTrafficRefresh();
  else startTrafficRefresh();
});
window.addEventListener("pagehide", stopTrafficRefresh);
