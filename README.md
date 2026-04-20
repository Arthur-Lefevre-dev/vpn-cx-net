# VPN CX Net

**Chrome** and **Firefox** browser extension to configure and enable/disable a proxy (HTTP, SOCKS4, SOCKS5). Ideal for routing all browser traffic through a VPN or proxy server.

## Features

- **Enable/disable** the proxy with one click from the toolbar
- **Blocked domains (publisher)**: edit **`data/blocked-domains.json`** before building; listed hostnames are blocked **only while the proxy is enabled** in the toolbar (see below)
- **Settings**: **OpenVPN** (path to .ovpn file, start/stop) + optional **Decodo API key** to load the country list from the API
- **Country list**: by default from `data/data.csv`; if a Decodo API key is set in Settings, the list is fetched from the [Decodo API](https://help.decodo.com/reference)
- **Popup**: **Country** selector with flag icons (loaded from the web). No country is selected by default
- **Persistence**: configuration and state (on/off) are saved
- **Language**: English (default), French, German, Japanese, and Chinese (Simplified); switch in the popup or in Settings
- **Terms of use**: shown on first launch (and when terms are updated); must be accepted to use the extension
- **Compatibility**: Chrome (Manifest V3), Firefox 140+ (desktop), Firefox for Android 142+

## Installation

### Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project folder (`vpn-cx-net`)

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Choose the `manifest.json` file at the project root

For a permanent installation, you must [sign the extension](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/) with a Mozilla account.

## Usage

1. Click the extension icon
2. Choose a **country** from the menu. By default “— Choose a country —” is shown; no country is pre-selected
3. The proxy turns on with the selected country’s server. Use **Disable proxy** to turn it off

Browser traffic will go through the configured server. Decodo credentials are provided automatically (Chrome).

### Country list: data.csv or Decodo API

Without an API key, the **`data/data.csv`** file defines the server list (Country menu).

**Decodo format (recommended) — one line per server:**

```
host:port:username:password
```

The country is inferred from the username (e.g. `user-xxx-country-be` → Belgium). Example:

```
isp.decodo.com:10001:user-sp1rg83e7n-country-be:laZqb7S~4bo8yJp6Eq
isp.decodo.com:10002:user-sp1rg83e7n-country-es:laZqb7S~4bo8yJp6Eq
isp.decodo.com:10003:user-sp1rg83e7n-country-fr:laZqb7S~4bo8yJp6Eq
```

**CSV format with header** (comma or `|`): `ip,location,asn` or `countryCode,host,port,username,password`.

**Proxy authentication (Chrome)**: when you choose a country whose server has credentials in the CSV (Decodo format), the extension automatically fills the proxy “Sign in” prompt (username and password). No manual entry. On Firefox, the dialog may still appear depending on the version.

**Flag icons**: flags are loaded from the web (e.g. flagcdn.com) for display in the popup.

**Decodo API**: in Settings, optional “Decodo API key” field. If set, the country list is loaded from the Decodo API instead of `data/data.csv`.

### Blocked domains for your users (`data/blocked-domains.json`)

The extension reads **`data/blocked-domains.json`** from the package at startup (not configurable in the UI). **Edit this file before you build** and publish to the stores so every user of your extension gets the same blocklist. **Blocking is active only when the proxy is turned on** in the extension popup; if the proxy is disabled, those domains are not blocked.

Supported JSON shapes:

```json
{
  "version": 1,
  "domains": ["example.com", "doubleclick.net"]
}
```

or a root array:

```json
["example.com", "doubleclick.net"]
```

**Valid JSON**: each domain must be a **quoted string** (`"youtube.com"`, not `youtube.com`). Invalid JSON is ignored; check the extension **service worker / background** console for parse errors.

You may use the property names **`domains`**, **`blockedDomains`**, or **`hosts`** (object form). Subdomains are blocked too (e.g. `example.com` also blocks `www.example.com`). Up to **400** hostnames are applied.

### Using OpenVPN

- **Without native host**: choose **OpenVPN (local proxy)** in Settings, then enter the address and port of the local proxy (often `127.0.0.1` and `1080`) exposed by your OpenVPN client or a SOCKS service. Save and enable the proxy in the popup.
- **With native host (start from the extension)**:
  1. Install [OpenVPN](https://openvpn.net/community-resources/downloads/) and [Node.js](https://nodejs.org/).
  2. From the project root: `node scripts/install-native-host.js`. This creates a manifest in `%LOCALAPPDATA%\vpn-cx-proxy\` (Windows) or `~/.config/vpn-cx-proxy/` (Linux).
  3. In that manifest, replace `REPLACE_WITH_CHROME_EXTENSION_ID` and `REPLACE_WITH_FIREFOX_EXTENSION_ID` with your extension ID (Chrome: `chrome://extensions`; Firefox: `about:debugging`).
  4. Copy (or create a symlink) the manifest file to the native messaging hosts folder:
     - **Chrome**: `%LOCALAPPDATA%\Google\Chrome\User Data\NativeMessagingHosts\`
     - **Firefox**: `%APPDATA%\Mozilla\NativeMessagingHosts\` (Windows) or `~/.mozilla/native-messaging-hosts/` (Linux).
  5. In the extension Settings, under “Start OpenVPN from the extension”, enter the full path to your `.ovpn` file, then use **Start OpenVPN** / **Stop OpenVPN**.

## Build (Chrome & Firefox)

To generate packages ready for the stores:

```bash
npm install
npm run build
```

Archives are created in `dist/`:

- **dist/vpn-cx-proxy-chrome.zip** — submit to the [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
- **dist/vpn-cx-proxy-firefox.zip** — submit to [addons.mozilla.org](https://addons.mozilla.org/developers/) (Firefox accepts the .zip; it will be signed and distributed as .xpi)

The build script produces two packages: the Chrome zip uses the root `manifest.json` (with `background.service_worker`); the Firefox zip uses a derived manifest without `service_worker` so it passes AMO validation without warnings. All other files are identical. The `native/` folder is not included in either zip; the OpenVPN native host is installed separately on the user’s machine (see OpenVPN section above).

## Project structure

```
vpn-cx-net/
├── manifest.json       # Chrome manifest (Firefox zip gets a variant without service_worker)
├── locales.js          # i18n (EN / FR / DE / JA / ZH)
├── background/         # Background script (proxy on/off, OpenVPN native)
├── popup/              # Popup (status, toggle, language, options link)
├── options/            # Settings page (OpenVPN, Decodo API key, language)
├── data/               # data.csv + blocked-domains.json (publisher blocklist)
├── icons/              # Extension icons (optional)
├── native/             # Native host to start/stop OpenVPN (separate install)
├── scripts/            # Scripts (build, icons, install native host)
├── dist/               # Generated by npm run build (Chrome / Firefox zips)
├── README.md
└── PRIVACY.md          # Privacy policy (for store submissions)
```

## Icons (optional)

The extension works without custom icons. To add them:

1. Create the `icons/` folder at the root.
2. Generate PNGs with the provided script:
   ```bash
   npm install pngjs
   node scripts/generate-icons.js
   ```
3. Add to `manifest.json` under `action` and at the root:
   - `"default_icon": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png" }`
   - `"icons": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png" }`

## Why Manifest V3?

- **Chrome**: New extensions must use Manifest V3 to be published on the Chrome Web Store; V2 is deprecated.
- **Firefox**: Supports MV3 from Firefox 109+ and requires it for signing/distribution on addons.mozilla.org in practice.
- **Single codebase**: One codebase (background script) runs as a service worker on Chrome and as a background script on Firefox; the build script produces two zips with the appropriate manifest for each store.

## Privacy

See **[PRIVACY.md](./PRIVACY.md)** for a policy summary suitable for **GitHub** and **store submissions** (local extension data, third parties, publisher **blocklist** shipped in `data/blocked-domains.json`, and—when you use the operator’s proxy/VPN—**URL retention up to 30 days** in **anonymized** form for abuse prevention, **not** for ad profiling).

The **full Terms of use** (including prohibited use and liability) are shown **inside the extension** in **EN / FR / DE / JA / ZH**.

## Permissions

- **proxy**: to apply browser proxy settings
- **storage**: to save configuration and state
- **nativeMessaging**: to start/stop OpenVPN via the native host (optional)
- **&lt;all_urls&gt;**: required by the proxy API to redirect all traffic

## Limitations

- **Proxy authentication**: native APIs do not always handle authentication (login/password) in a simple way. For an authenticated proxy, you may need a URL like `http://user:pass@host:port` on the server side or a local tunnel.
- **Firefox private mode**: on Firefox, changing the proxy may require permission to access private browsing windows (extension settings).

## Licence

MIT (or as specified for your project).

---

**Made by [Arthur Lefevre](https://github.com/Arthur-Lefevre-dev)**
