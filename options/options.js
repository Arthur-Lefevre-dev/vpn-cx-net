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
const privateBrowsingWarningWrap = document.getElementById("privateBrowsingWarningWrap");
const privateBrowsingWarningTitle = document.getElementById("privateBrowsingWarningTitle");
const privateBrowsingWarningText = document.getElementById("privateBrowsingWarningText");
const privateBrowsingWarningStep1 = document.getElementById("privateBrowsingWarningStep1");
const privateBrowsingWarningStep2 = document.getElementById("privateBrowsingWarningStep2");
const privateBrowsingWarningStep3 = document.getElementById("privateBrowsingWarningStep3");

/** Safe i18n (locales.js loaded before options.js). */
const t = typeof getMessage !== "undefined" ? getMessage : (k) => k;

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
}

function loadOptions() {
  chrome.storage.local.get(["ovpnPath", "decodoApiKey", "locale"], (data) => {
    if (ovpnPathInput) ovpnPathInput.value = data.ovpnPath || "";
    if (decodoApiKeyInput) decodoApiKeyInput.value = data.decodoApiKey || "";
    if (typeof setLocale !== "undefined") setLocale(data.locale || "en");
    applyLocale();
    if (localeSelect) localeSelect.value = data.locale === "fr" ? "fr" : "en";

    // Show Private Browsing instructions only when needed.
    if (privateBrowsingWarningWrap && chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ action: "getState" }, (state) => {
        const incognitoAllowed = !!(state && state.incognitoAllowed);
        privateBrowsingWarningWrap.hidden = incognitoAllowed;
        if (!incognitoAllowed) {
          if (privateBrowsingWarningTitle)
            privateBrowsingWarningTitle.textContent = t("privateBrowsingStepsTitle");
          if (privateBrowsingWarningText)
            privateBrowsingWarningText.textContent = t("privateBrowsingRequired");
          if (privateBrowsingWarningStep1)
            {
              const step1 = t("privateBrowsingStep1");
              // Fallback: if translation does not include the <a> tag,
              // wrap "about:addons" into a clickable URL anyway.
              privateBrowsingWarningStep1.innerHTML = step1.includes("about:addons")
                ? step1.includes('<a ')
                  ? step1
                  : step1.replace(
                      /about:addons/g,
                      '<a href="about:addons" target="_blank" rel="noopener noreferrer">about:addons</a>',
                    )
                : step1;
            }
          if (privateBrowsingWarningStep2)
            privateBrowsingWarningStep2.textContent = t("privateBrowsingStep2");
          if (privateBrowsingWarningStep3)
            privateBrowsingWarningStep3.textContent = t("privateBrowsingStep3");

          // Clipboard backup: if Firefox blocks the about:* navigation, the user still has the URL.
          if (privateBrowsingWarningStep1) {
            const a = privateBrowsingWarningStep1.querySelector(
              'a[href="about:addons"]',
            );
            if (a && !a.dataset.bound) {
              a.dataset.bound = "1";
              a.addEventListener("click", (e) => {
                // Backup copy: even if Firefox blocks the navigation,
                // the user still gets "about:addons" in clipboard.
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard
                    .writeText("about:addons")
                    .then(() => showMessage(t("aboutAddonsCopied"), "success"))
                    .catch(() =>
                      showMessage(t("aboutAddonsCopyFailed"), "error"),
                    );
                }
              });
            }
          }
        }
      });
    }
  });
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
    const locale = localeSelect.value === "fr" ? "fr" : "en";
    chrome.storage.local.set({ locale }, () => {
      if (typeof setLocale !== "undefined") setLocale(locale);
      applyLocale();
    });
  });
}

loadOptions();
