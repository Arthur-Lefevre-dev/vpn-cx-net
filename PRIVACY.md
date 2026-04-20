# Privacy policy — VPN CX Net

**Last updated:** March 2026

This document describes how **VPN CX Net** (the browser extension) and, where applicable, **proxy/VPN infrastructure operated by the service provider** handle information. The **Terms of use** shown inside the extension (first launch and when the terms version changes) are the binding agreement; this file is a plain-language summary for **GitHub** and **store listings**.

---

## 1. Who this applies to

- **Extension**: developed to configure HTTP/SOCKS proxy settings in Chrome and Firefox.
- **Service operator**: when you use **proxy or VPN endpoints provided by the operator** (not only self-configured servers), additional processing on **server-side infrastructure** may apply as described in section 4.

---

## 2. Data stored by the extension (on your device)

The extension uses the browser’s **local storage** (`chrome.storage` / `browser.storage`) to save, for example:

- Proxy on/off state and selected server settings (host, port, type, credentials as needed for the proxy)
- Optional: path to your OpenVPN config, optional Decodo API key, UI language, acceptance of the terms of use version
- **Publisher blocklist**: if the **publisher** ships a `data/blocked-domains.json` in the package, those hostnames may be blocked in the browser **while the user has the extension’s proxy enabled**; the list is bundled with the install (not fetched from your servers by default)

This data **stays on your device** and is **not** sent to the extension developers by default, except where you explicitly use features that contact third-party APIs (see section 5).

---

## 3. Network traffic and the proxy

When the proxy is **enabled**, your **browser traffic** is routed through the **server you selected** (from `data.csv`, Decodo, or another configured source). That server and its operator—not this extension alone—see the traffic needed to forward your requests. You should review the privacy practices of **your proxy/VPN provider**.

---

## 4. Operator infrastructure: URL retention (when you use the service’s proxy/VPN)

When you use **proxy or VPN infrastructure operated by the VPN CX Net service provider**:

- **Visited URLs** may be retained for **up to thirty (30) days**.
- They are kept in an **anonymized** form intended so that browsing **cannot be traced back to you as an identifiable individual**.
- **Purposes**: abuse prevention, fraud prevention, and **service integrity**.
- **Not used** for **advertising profiling** or sale of browsing history as a commercial profile product.

If you only use **your own** or a **third-party** proxy without using the operator’s infrastructure, this section may not apply; your relationship is then with that third party.

---

## 5. Third-party services the extension may contact

| Service / resource | Purpose |
|--------------------|--------|
| **Decodo** (optional) | If you enter an API key in Settings, the extension requests your proxy list from Decodo. Subject to [Decodo’s policies](https://decodo.com/). |
| **Flag images** (e.g. CDN) | Country flags in the popup are loaded from the public web for display only. |
| **YouTube** | The options page may link to a help video; opening it loads YouTube under Google’s terms. |
| **Buy Me a Coffee** | Optional support link in the UI. |

---

## 6. Your rights and choices

- You can **clear** extension data via the browser’s extension storage / uninstall flow.
- You can **stop** routing traffic through the operator’s infrastructure by **disabling the proxy** or choosing endpoints you fully control.
- For questions specific to **server-side logs** (section 4), contact the **service operator** named in the store listing or project documentation.

---

## 7. Children

The extension is not directed at children. You must meet the age or consent requirements described in the in-app **Terms of use**.

---

## 8. Changes

We may update this file or the in-app terms. **Material changes** to the terms may require **re-acceptance** in the extension (versioned acceptance). The **“Last updated”** date at the top will be revised when this summary changes.

---

## 9. Language

The **full legal-style Terms of use** (including prohibited use and liability limitations) are available **inside the extension** in **English, French, German, Japanese, and Chinese (Simplified)**. This `PRIVACY.md` is provided in **English** for repositories and store privacy fields; adapt or translate for local legal requirements if needed.

---

## Contact

Use the contact or support channel indicated on the **Chrome Web Store**, **addons.mozilla.org**, or the **GitHub** repository for this project.
