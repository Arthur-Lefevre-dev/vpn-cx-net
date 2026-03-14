# VPN CX Net

Extension navigateur **Chrome** et **Firefox** pour configurer et activer/désactiver un proxy (HTTP, SOCKS4, SOCKS5). Idéal pour rediriger tout le trafic du navigateur via un serveur VPN ou proxy.

## Fonctionnalités

- **Activation/désactivation** du proxy en un clic depuis la barre d’outils
- **Paramètres** : uniquement **OpenVPN** (chemin .ovpn, démarrer/arrêter) + optionnellement **Clé API Decodo** pour charger la liste des pays depuis l’API.
- **Liste des pays** : par défaut depuis `data/data.csv` ; si une clé API Decodo est renseignée dans Paramètres, la liste est récupérée via l’[API Decodo](https://help.decodo.com/reference).
- **Popup** : sélecteur **Pays** avec icônes drapeaux (`icons/flags/XX.png`, ex. FR.png, BE.png). Par défaut aucun pays n’est sélectionné.
- **Persistance** : la configuration et l’état (on/off) sont conservés
- **Compatibilité** : Chrome (Manifest V3) et Firefox 109+

## Installation

### Chrome

1. Ouvrir `chrome://extensions/`
2. Activer **Mode développeur**
3. Cliquer sur **Charger l’extension non empaquetée**
4. Sélectionner le dossier du projet (`vpn-cx-net`)

### Firefox

1. Ouvrir `about:debugging#/runtime/this-firefox`
2. Cliquer sur **Charger un module complémentaire temporaire**
3. Choisir le fichier `manifest.json` à la racine du projet

Pour une installation permanente, il faut [signer l’extension](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/) avec un compte Mozilla.

## Utilisation

1. Cliquer sur l’icône de l’extension.
2. Choisir un **pays** dans le menu (drapeaux depuis `icons/flags/XX.png`). Par défaut « — Choisir un pays — » est affiché ; aucun pays n’est présélectionné.
3. Le proxy s’active avec le serveur du pays choisi. Utiliser **Désactiver le proxy** pour couper.

Le trafic du navigateur passera par le serveur configuré. Les identifiants Decodo sont fournis automatiquement (Chrome).

### Liste des pays : data.csv ou API Decodo

Sans clé API, le fichier **`data/data.csv`** définit la liste des serveurs (menu Pays).

**Format Decodo (recommandé) — une ligne par serveur :**

```
host:port:username:password
```

Le pays est déduit du username (ex. `user-xxx-country-be` → Belgique). Exemple :

```
isp.decodo.com:10001:user-sp1rg83e7n-country-be:laZqb7S~4bo8yJp6Eq
isp.decodo.com:10002:user-sp1rg83e7n-country-es:laZqb7S~4bo8yJp6Eq
isp.decodo.com:10003:user-sp1rg83e7n-country-fr:laZqb7S~4bo8yJp6Eq
```

**Format CSV avec en-tête** (virgule ou `|`) : `ip,location,asn` ou `countryCode,host,port,username,password`.

**Authentification proxy (Chrome)** : lorsque vous choisissez un pays dont le serveur a des identifiants dans le CSV (format Decodo), l’extension remplit automatiquement la demande « Se connecter » du proxy (nom d’utilisateur et mot de passe). Aucune saisie manuelle. Sur Firefox, la boîte de dialogue peut encore apparaître selon la version.

**Icônes drapeaux** : placez des images par code pays dans `icons/flags/` (ex. `FR.png`, `BE.png`, `ES.png`). Sinon un emoji drapeau est affiché.

**API Decodo** : dans Paramètres, champ optionnel « Clé API Decodo ». Si renseigné, la liste des pays est chargée depuis l’API Decodo au lieu de `data/data.csv`.

### Utiliser OpenVPN

- **Sans host natif** : choisir le type **OpenVPN (proxy local)** dans Paramètres, puis indiquer l’adresse et le port du proxy local (souvent `127.0.0.1` et `1080`) exposé par votre client OpenVPN ou un service SOCKS. Enregistrer et activer le proxy dans le popup.
- **Avec host natif (démarrage depuis l’extension)** :
  1. Installer [OpenVPN](https://openvpn.net/community-resources/downloads/) et [Node.js](https://nodejs.org/).
  2. Depuis la racine du projet : `node scripts/install-native-host.js`. Cela crée un manifeste dans `%LOCALAPPDATA%\vpn-cx-proxy\` (Windows) ou `~/.config/vpn-cx-proxy/` (Linux).
  3. Remplacer dans ce manifeste `REPLACE_WITH_CHROME_EXTENSION_ID` et `REPLACE_WITH_FIREFOX_EXTENSION_ID` par l’ID de votre extension (Chrome : `chrome://extensions` ; Firefox : `about:debugging`).
  4. Copier (ou créer un lien symbolique) du fichier manifeste vers le dossier des hosts natifs :
     - **Chrome** : `%LOCALAPPDATA%\Google\Chrome\User Data\NativeMessagingHosts\`
     - **Firefox** : `%APPDATA%\Mozilla\NativeMessagingHosts\` (Windows) ou `~/.mozilla/native-messaging-hosts/` (Linux).
  5. Dans Paramètres de l’extension, section « Démarrer OpenVPN depuis l’extension », indiquer le chemin complet vers votre fichier `.ovpn`, puis utiliser **Démarrer OpenVPN** / **Arrêter OpenVPN**.

## Build (Chrome & Firefox)

Pour générer les paquets prêts à être déposés sur les stores :

```bash
npm install
npm run build
```

Les archives sont créées dans `dist/` :

- **dist/vpn-cx-proxy-chrome.zip** — à envoyer sur le [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
- **dist/vpn-cx-proxy-firefox.zip** — à envoyer sur [addons.mozilla.org](https://addons.mozilla.org/developers/) (Firefox accepte le .zip ; il sera signé et diffusé en .xpi)

Le contenu est identique pour les deux (manifeste compatible Chrome et Firefox). Le dossier `native/` n’est pas inclus dans le zip : l’hôte natif OpenVPN s’installe séparément sur la machine de l’utilisateur (voir section OpenVPN ci-dessus).

## Structure du projet

```
vpn-cx-net/
├── manifest.json       # Manifeste commun Chrome / Firefox
├── background/         # Service worker (proxy on/off, OpenVPN native)
├── popup/              # Popup (état + bouton on/off + lien options)
├── options/            # Page de paramètres (host, port, type, OpenVPN)
├── data/               # data.csv (liste des serveurs par défaut)
├── icons/              # Icônes et drapeaux (optionnel)
├── native/             # Host natif pour démarrer/arrêter OpenVPN (install séparée)
├── scripts/            # Scripts (build, icônes, install host natif)
├── dist/               # Généré par npm run build (zips Chrome / Firefox)
└── README.md
```

## Icônes (optionnel)

L’extension fonctionne sans icônes personnalisées. Pour en ajouter :

1. Créer le dossier `icons/` à la racine.
2. Générer les PNG avec le script fourni :
   ```bash
   npm install pngjs
   node scripts/generate-icons.js
   ```
3. Ajouter dans `manifest.json` sous `action` et à la racine :
   - `"default_icon": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png" }`
   - `"icons": { "16": "icons/icon16.png", "32": "icons/icon32.png", "48": "icons/icon48.png" }`

## Permissions

- **proxy** : pour appliquer les paramètres proxy du navigateur
- **storage** : pour enregistrer la configuration et l’état
- **nativeMessaging** : pour démarrer/arrêter OpenVPN via le host natif (optionnel)
- **&lt;all_urls&gt;** : requis par l’API proxy pour pouvoir rediriger tout le trafic

## Limites

- **Authentification proxy** : les APIs natives ne gèrent pas toujours l’authentification (login/mot de passe) de façon simple. Pour un proxy authentifié, il peut être nécessaire d’utiliser une URL du type `http://user:pass@host:port` côté serveur ou un tunnel local.
- **Firefox mode privé** : sous Firefox, la modification du proxy peut nécessiter l’autorisation d’accès aux fenêtres de navigation privée (paramètres de l’extension).

## Licence

MIT (ou à préciser selon votre projet).

---

**Made by [Arthur Lefevre](https://github.com/Arthur-Lefevre-dev)**
