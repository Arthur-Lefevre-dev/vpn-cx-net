# VPN CX Net

**Chrome** and **Firefox** browser extension to configure and enable/disable a proxy (HTTP, SOCKS4, SOCKS5). Ideal for routing all browser traffic through a VPN or proxy server.

## Features

- **Enable/disable** the proxy with one click from the toolbar
- **Settings**: **OpenVPN** only (path to .ovpn file, start/stop) + optional **Decodo API key** to load the country list from the API
- **Country list**: by default from `data/data.csv`; if a Decodo API key is set in Settings, the list is fetched from the [Decodo API](https://help.decodo.com/reference)
- **Popup**: **Country** selector with flag icons (`icons/flags/XX.png`, e.g. FR.png, BE.png). No country is selected by default
- **Persistence**: configuration and state (on/off) are saved
- **Compatibility**: Chrome (Manifest V3) and Firefox 126+

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
2. Choose a **country** from the menu (flags from `icons/flags/XX.png`). By default “— Choose a country —” is shown; no country is pre-selected
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

**Flag icons**: place images by country code in `icons/flags/` (e.g. `FR.png`, `BE.png`, `ES.png`). Otherwise a flag emoji or CDN image is used.

**Decodo API**: in Settings, optional “Decodo API key” field. If set, the country list is loaded from the Decodo API instead of `data/data.csv`.

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

Content is the same for both (manifest is compatible with Chrome and Firefox). The `native/` folder is not included in the zip: the OpenVPN native host is installed separately on the user’s machine (see OpenVPN section above).

## Project structure

```
vpn-cx-net/
├── manifest.json       # Shared Chrome / Firefox manifest
├── locales.js          # i18n (EN/FR)
├── background/         # Service worker (proxy on/off, OpenVPN native)
├── popup/              # Popup (status, toggle, options link)
├── options/            # Settings page (OpenVPN, Decodo API key)
├── data/               # data.csv (default server list)
├── icons/              # Icons and flags (optional)
├── native/             # Native host to start/stop OpenVPN (separate install)
├── scripts/            # Scripts (build, icons, install native host)
├── dist/               # Generated by npm run build (Chrome / Firefox zips)
└── README.md
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
