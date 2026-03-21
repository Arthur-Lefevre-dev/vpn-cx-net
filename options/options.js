/**
 * Options page: OpenVPN only (+ optional Decodo API key). Language selector.
 */

const ovpnPathInput = document.getElementById("ovpnPath");
const openvpnStartBtn = document.getElementById("openvpnStartBtn");
const openvpnStopBtn = document.getElementById("openvpnStopBtn");
const openvpnStatus = document.getElementById("openvpnStatus");
const decodoApiKeyInput = document.getElementById("decodoApiKey");
const messageEl = document.getElementById("message");
const localeSelect = document.getElementById("localeSelect");
const privateBrowsingWarningWrap = document.getElementById(
  "privateBrowsingWarningWrap",
);
const privateBrowsingWarningTitle = document.getElementById(
  "privateBrowsingWarningTitle",
);
const privateBrowsingWarningText = document.getElementById(
  "privateBrowsingWarningText",
);
const privateBrowsingWarningStep1 = document.getElementById(
  "privateBrowsingWarningStep1",
);
const privateBrowsingWarningStep2 = document.getElementById(
  "privateBrowsingWarningStep2",
);
const privateBrowsingWarningStep3 = document.getElementById(
  "privateBrowsingWarningStep3",
);
const privateBrowsingVideoCaption = document.getElementById(
  "privateBrowsingVideoCaption",
);
const privateBrowsingYoutubeCta = document.getElementById(
  "privateBrowsingYoutubeCta",
);
const privateBrowsingYoutubeThumb = document.getElementById(
  "privateBrowsingYoutubeThumb",
);

const termsGate = document.getElementById("termsGate");
const termsGateTitle = document.getElementById("termsGateTitle");
const termsGateLead = document.getElementById("termsGateLead");
const termsGateBody = document.getElementById("termsGateBody");
const termsGateCheckbox = document.getElementById("termsGateCheckbox");
const termsGateCheckboxLabel = document.getElementById("termsGateCheckboxLabel");
const termsGateAccept = document.getElementById("termsGateAccept");
const termsGateLocaleSelect = document.getElementById("termsGateLocaleSelect");
const termsGateLocaleLabel = document.getElementById("termsGateLocaleLabel");

/** Safe i18n (locales.js loaded before options.js). */
const t = typeof getMessage !== "undefined" ? getMessage : (k) => k;

function normalizeLocaleCode(v) {
  return v === "fr" || v === "de" || v === "ja" || v === "zh" ? v : "en";
}

function getTermsVersion() {
  return typeof TERMS_OF_USE_VERSION !== "undefined"
    ? TERMS_OF_USE_VERSION
    : "1";
}

function isTermsAcceptedFromStorage(data) {
  return !!(data && data.termsAcceptedVersion === getTermsVersion());
}

/** Max terms paragraphs from locales.js (termsP1…termsPn). */
const TERMS_PARAGRAPH_COUNT = 6;

function renderTermsParagraphs(container) {
  if (!container || typeof getMessage === "undefined") return;
  while (container.firstChild) container.removeChild(container.firstChild);
  for (let i = 1; i <= TERMS_PARAGRAPH_COUNT; i++) {
    const key = "termsP" + i;
    const text = getMessage(key);
    if (!text || text === key) continue;
    const p = document.createElement("p");
    p.className = "terms-para";
    p.textContent = text;
    container.appendChild(p);
  }
}

function applyTermsGateLocale() {
  if (typeof getMessage === "undefined") return;
  if (termsGateTitle) termsGateTitle.textContent = getMessage("termsTitle");
  if (termsGateLead) termsGateLead.textContent = getMessage("termsLead");
  if (termsGateCheckboxLabel)
    termsGateCheckboxLabel.textContent = getMessage("termsCheckboxLabel");
  if (termsGateAccept) termsGateAccept.textContent = getMessage("termsAcceptBtn");
  if (termsGateLocaleLabel)
    termsGateLocaleLabel.textContent = getMessage("languageLabel");
  renderTermsParagraphs(termsGateBody);
}

function showTermsGate() {
  if (!termsGate) return;
  termsGate.hidden = false;
  if (termsGateCheckbox) termsGateCheckbox.checked = false;
  if (termsGateAccept) termsGateAccept.disabled = true;
  if (termsGateLocaleSelect && localeSelect)
    termsGateLocaleSelect.value = localeSelect.value;
  applyTermsGateLocale();
}

function hideTermsGate() {
  if (termsGate) termsGate.hidden = true;
}

function showMessage(text, type) {
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.className = "message " + (type || "success");
    messageEl.hidden = false;
    setTimeout(() => {
      messageEl.hidden = true;
    }, 4000);
  }
}

function setOpenVpnStatus(text, isError) {
  if (openvpnStatus) {
    openvpnStatus.textContent = text;
    openvpnStatus.className =
      "message openvpn-status" + (isError ? " error" : " success");
    openvpnStatus.hidden = !text;
  }
}

function renderAboutAddonsStep(stepEl, stepRaw) {
  // Avoid assigning untrusted HTML to `innerHTML` (store violations).
  // We parse the i18n string to extract the text around the about:addons anchor,
  // then build the clickable link via DOM APIs.
  if (!stepEl) return;
  const raw = (stepRaw || "").toString();

  const anchorTagRe =
    /<a[^>]*href=["']about:addons["'][^>]*>\s*about:addons\s*<\/a>/i;
  const m = raw.match(anchorTagRe);

  let prefixRaw = "";
  let suffixRaw = "";
  if (m && typeof m.index === "number") {
    prefixRaw = raw.slice(0, m.index);
    suffixRaw = raw.slice(m.index + m[0].length);
  } else {
    const idx = raw.indexOf("about:addons");
    if (idx >= 0) {
      prefixRaw = raw.slice(0, idx);
      suffixRaw = raw.slice(idx + "about:addons".length);
    } else {
      // Fallback: if we can't parse, still show the URL.
      prefixRaw = raw;
      suffixRaw = "";
    }
  }

  // Strip any remaining tags (should be none after the extraction).
  const stripTags = (s) => s.replace(/<[^>]*>/g, "");
  const prefixText = stripTags(prefixRaw);
  const suffixText = stripTags(suffixRaw);

  // Clear and rebuild.
  while (stepEl.firstChild) stepEl.removeChild(stepEl.firstChild);
  if (prefixText) stepEl.appendChild(document.createTextNode(prefixText));

  const a = document.createElement("a");
  a.href = "about:addons";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "about:addons";
  if (!a.dataset.bound) {
    a.dataset.bound = "1";
  }
  a.addEventListener("click", (e) => {
    // Best-effort open + clipboard backup.
    // We do NOT block default navigation so that it remains a real link when allowed.
    try {
      window.open("about:addons", "_blank", "noopener");
    } catch {
      // ignored
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText("about:addons")
        .then(() => showMessage(t("aboutAddonsCopied"), "success"))
        .catch(() => showMessage(t("aboutAddonsCopyFailed"), "error"));
    }
  });

  stepEl.appendChild(a);
  if (suffixText) stepEl.appendChild(document.createTextNode(suffixText));
}

/** Apply current locale to all option page strings (call after setLocale). */
function applyLocale() {
  if (typeof getMessage === "undefined") return;
  const doc = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = getMessage(key);
  };
  doc("optionsAppName", "appName");
  doc("optionsSubtitle", "openvpn");
  doc("languageLabel", "languageLabel");
  doc("openvpnTitle", "openvpn");
  doc("openvpnHelp", "openvpnHelp");
  doc("ovpnPathLabel", "ovpnPathLabel");
  doc("decodoApiKeyLabel", "decodoApiKeyLabel");
  doc("decodoApiKeyHelp", "decodoApiKeyHelp");
  const affEl = document.getElementById("decodoAffiliationLink");
  if (affEl) affEl.textContent = getMessage("decodoAffiliationLink");
  doc("creditPrefix", "madeBy");
  if (ovpnPathInput)
    ovpnPathInput.placeholder = getMessage("ovpnPathPlaceholder");
  if (decodoApiKeyInput)
    decodoApiKeyInput.placeholder = getMessage("decodoApiKeyPlaceholder");
  if (openvpnStartBtn) openvpnStartBtn.textContent = getMessage("openvpnStart");
  if (openvpnStopBtn) openvpnStopBtn.textContent = getMessage("openvpnStop");
  document.title = getMessage("settingsTitle");
  applyTermsGateLocale();
}

function updatePrivateBrowsingWarning() {
  if (!privateBrowsingWarningWrap || !chrome?.runtime?.sendMessage) return;
  chrome.runtime.sendMessage({ action: "getState" }, (state) => {
    const incognitoAllowed = !!(state && state.incognitoAllowed);
    privateBrowsingWarningWrap.hidden = incognitoAllowed;
    if (!incognitoAllowed) {
      if (privateBrowsingWarningTitle)
        privateBrowsingWarningTitle.textContent = t(
          "privateBrowsingStepsTitle",
        );
      if (privateBrowsingWarningText)
        privateBrowsingWarningText.textContent = t("privateBrowsingRequired");
      if (privateBrowsingWarningStep1)
        renderAboutAddonsStep(
          privateBrowsingWarningStep1,
          t("privateBrowsingStep1"),
        );
      if (privateBrowsingWarningStep2)
        privateBrowsingWarningStep2.textContent = t("privateBrowsingStep2");
      if (privateBrowsingWarningStep3)
        privateBrowsingWarningStep3.textContent = t("privateBrowsingStep3");
      if (privateBrowsingVideoCaption)
        privateBrowsingVideoCaption.textContent = t(
          "privateBrowsingVideoCaption",
        );
      if (privateBrowsingYoutubeCta)
        privateBrowsingYoutubeCta.textContent = t(
          "privateBrowsingWatchOnYoutube",
        );
      if (privateBrowsingYoutubeThumb)
        privateBrowsingYoutubeThumb.alt = t("privateBrowsingVideoThumbAlt");
    }
  });
}

function loadOptions() {
  chrome.storage.local.get(
    ["ovpnPath", "decodoApiKey", "locale", "termsAcceptedVersion"],
    (data) => {
      if (ovpnPathInput) ovpnPathInput.value = data.ovpnPath || "";
      if (decodoApiKeyInput) decodoApiKeyInput.value = data.decodoApiKey || "";
      const locale = normalizeLocaleCode(data.locale);
      if (typeof setLocale !== "undefined") setLocale(locale);
      applyLocale();
      if (localeSelect) localeSelect.value = locale;
      if (termsGateLocaleSelect) termsGateLocaleSelect.value = locale;

      if (!isTermsAcceptedFromStorage(data)) {
        showTermsGate();
      } else {
        hideTermsGate();
      }

      updatePrivateBrowsingWarning();
    },
  );
}

if (openvpnStartBtn) {
  openvpnStartBtn.addEventListener("click", () => {
    const path = ovpnPathInput.value.trim();
    if (!path) {
      setOpenVpnStatus(t("ovpnPathRequired"), true);
      return;
    }
    chrome.storage.local.set({ ovpnPath: path }, () => {});
    setOpenVpnStatus(t("openvpnStarting"));
    openvpnStartBtn.disabled = true;
    chrome.runtime.sendMessage(
      {
        action: "openvpnNative",
        payload: { action: "start", configPath: path },
      },
      (response) => {
        openvpnStartBtn.disabled = false;
        if (response && response.success) {
          setOpenVpnStatus(t("openvpnStarted"));
        } else {
          setOpenVpnStatus(
            (response && response.error) || t("openvpnStartFailed"),
            true,
          );
        }
      },
    );
  });
}

if (openvpnStopBtn) {
  openvpnStopBtn.addEventListener("click", () => {
    setOpenVpnStatus(t("openvpnStopping"));
    openvpnStopBtn.disabled = true;
    chrome.runtime.sendMessage(
      {
        action: "openvpnNative",
        payload: { action: "stop" },
      },
      (response) => {
        openvpnStopBtn.disabled = false;
        if (response && response.success) {
          setOpenVpnStatus(t("openvpnStopped"));
        } else {
          setOpenVpnStatus(
            (response && response.error) || t("openvpnStopFailed"),
            true,
          );
        }
      },
    );
  });
}

if (decodoApiKeyInput) {
  decodoApiKeyInput.addEventListener("blur", () => {
    chrome.storage.local.set(
      { decodoApiKey: decodoApiKeyInput.value.trim() },
      () => {},
    );
  });
}

if (localeSelect) {
  localeSelect.addEventListener("change", () => {
    const locale = normalizeLocaleCode(localeSelect.value);
    chrome.storage.local.set({ locale }, () => {
      if (typeof setLocale !== "undefined") setLocale(locale);
      if (termsGateLocaleSelect) termsGateLocaleSelect.value = locale;
      applyLocale();
      updatePrivateBrowsingWarning();
    });
  });
}

if (termsGateCheckbox && termsGateAccept) {
  termsGateCheckbox.addEventListener("change", () => {
    termsGateAccept.disabled = !termsGateCheckbox.checked;
  });
}

if (termsGateAccept) {
  termsGateAccept.addEventListener("click", () => {
    if (!termsGateCheckbox || !termsGateCheckbox.checked) return;
    chrome.storage.local.set({ termsAcceptedVersion: getTermsVersion() }, () => {
      hideTermsGate();
    });
  });
}

if (termsGateLocaleSelect) {
  termsGateLocaleSelect.addEventListener("change", () => {
    const locale = normalizeLocaleCode(termsGateLocaleSelect.value);
    chrome.storage.local.set({ locale }, () => {
      if (typeof setLocale !== "undefined") setLocale(locale);
      if (localeSelect) localeSelect.value = locale;
      applyLocale();
      updatePrivateBrowsingWarning();
    });
  });
}

loadOptions();
