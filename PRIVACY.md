# Privacy Policy — VPN CX Net

**Last updated:** March 2025

VPN CX Net (“the extension”) respects your privacy. This document describes what data the extension uses and how it is handled.

## Summary

- **No personal data is collected or transmitted** to our servers or to third parties for analysis or marketing.
- Settings and preferences are **stored locally** in your browser (the extension’s storage API).
- Traffic statistics (download/upload volume) are **computed and displayed locally**; they are not sent to any server.

## Data stored locally

The extension uses the browser’s local storage (Chrome `chrome.storage.local` / Firefox equivalent) only for:

- **Proxy state**: enabled or disabled, server address and port, proxy type (HTTP, SOCKS, etc.).
- **Preferences**: interface language (English/French).
- **OpenVPN option**: path to the `.ovpn` file and status, if you use the “Start / Stop OpenVPN” feature in Settings.
- **Decodo option**: if you enter a Decodo API key in Settings, it is kept locally to fetch the server list from the Decodo API.

This data **stays on your device** and is not sent to our servers (we do not operate any servers for this extension).

## Traffic statistics

The extension displays volume statistics (download and upload) in the popup. These values are **computed locally** from response headers (e.g. `Content-Length`). They are **neither stored persistently nor transmitted** to any third party.

## Data sent to third parties (at your choice)

- **Decodo API**: if you have entered a Decodo API key in Settings, the extension sends requests to the Decodo API to fetch the server list. Decodo’s terms of use and privacy policy apply to those requests.
- **Flag display**: flag images are loaded from a CDN (e.g. flagcdn.com) for display in the popup. No executable code is loaded from external servers.

## Proxy authentication

When you use a proxy server that requires a username and password, the extension can provide these credentials to the browser automatically (via the proxy auth API). These credentials are **stored locally** and used only to respond to the proxy’s authentication requests; they are not sent to any server other than the proxy you selected.

## OpenVPN native program (optional)

If you install the “native host” and use the “Start OpenVPN” / “Stop OpenVPN” buttons in Settings, the extension communicates with a program installed on your machine to start or stop the OpenVPN process. **No data is sent over the internet** as part of this communication; it stays between the extension and the local program.

## Changes

Any significant change to this policy will be reflected in this document with an updated date at the top. We encourage you to check this page from time to time.

## Contact

For any question about this privacy policy or the VPN CX Net extension, you can open an issue on the project repository or contact the maintainer via the project page (e.g. GitHub).

---

**In short:** VPN CX Net does not collect or sell your data. Settings and proxy state stay on your device; only the actions you choose (server list via Decodo, flag images from the web) may result in requests to external services.
