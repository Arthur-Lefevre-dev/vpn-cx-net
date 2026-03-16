/**
 * i18n for VPN CX NET. Load from popup or options. Default locale: en.
 * Usage: setLocale('en'|'fr'); getMessage('key'); getCountryName('FR');
 */
(function (global) {
  const MESSAGES = {
    en: {
      appName: "VPN CX Net",
      loading: "Loading…",
      proxyActive: "Proxy active",
      proxyDisabled: "Proxy disabled",
      trafficDown: "↓ Download",
      trafficUp: "↑ Upload",
      trafficTotal: "Total",
      country: "Country",
      chooseCountry: "Choose a country",
      chooseCountryPlaceholder: "— Choose a country —",
      enableProxy: "Enable proxy",
      disableProxy: "Disable proxy",
      configureInSettings: "Configure in Settings",
      settings: "Settings",
      error: "Error",
      madeBy: "Made by ",
      supportMessage:
        "Want to support the project and get more features? You can donate:",
      // Options
      settingsTitle: "Settings — VPN CX Net",
      openvpn: "OpenVPN",
      openvpnHelp:
        "Install the native host (see README). Enter the path to your .ovpn file, then start or stop OpenVPN.",
      ovpnPathLabel: "Path to .ovpn file",
      ovpnPathPlaceholder: "C:\\path\\to\\config.ovpn",
      openvpnStart: "Start OpenVPN",
      openvpnStop: "Stop OpenVPN",
      decodoApiKeyLabel: "Decodo API key (optional)",
      decodoApiKeyPlaceholder: "Country list from Decodo API",
      decodoApiKeyHelp:
        "If set, the popup also shows proxy servers from the Decodo API in addition to the default list.",
      decodoAffiliationLink: "Decodo — Create account",
      languageLabel: "Language",
      ovpnPathRequired: "Enter the path to the .ovpn file.",
      openvpnStarting: "Starting…",
      openvpnStarted: "OpenVPN started.",
      openvpnStartFailed:
        "Failed. Make sure the native host is installed (see README).",
      openvpnStopping: "Stopping…",
      openvpnStopped: "OpenVPN stopped.",
      openvpnStopFailed: "Failed or OpenVPN was not running.",
    },
    fr: {
      appName: "VPN CX Net",
      loading: "Chargement…",
      proxyActive: "Proxy actif",
      proxyDisabled: "Proxy désactivé",
      trafficDown: "↓ Descendant",
      trafficUp: "↑ Montant",
      trafficTotal: "Total",
      country: "Pays",
      chooseCountry: "Choisir un pays",
      chooseCountryPlaceholder: "— Choisir un pays —",
      enableProxy: "Activer le proxy",
      disableProxy: "Désactiver le proxy",
      configureInSettings: "Configurer dans Paramètres",
      settings: "Paramètres",
      error: "Erreur",
      madeBy: "Made by ",
      supportMessage:
        "Pour soutenir le projet et avoir plus de fonctionnalités ? Vous pouvez faire un don :",
      // Options
      settingsTitle: "Paramètres — VPN CX Net",
      openvpn: "OpenVPN",
      openvpnHelp:
        "Installez le « host natif » (voir README). Indiquez le chemin vers votre fichier .ovpn, puis démarrez ou arrêtez OpenVPN.",
      ovpnPathLabel: "Chemin du fichier .ovpn",
      ovpnPathPlaceholder: "C:\\chemin\\vers\\config.ovpn",
      openvpnStart: "Démarrer OpenVPN",
      openvpnStop: "Arrêter OpenVPN",
      decodoApiKeyLabel: "Clé API Decodo (optionnel)",
      decodoApiKeyPlaceholder: "Liste des pays depuis l'API Decodo",
      decodoApiKeyHelp:
        "Si renseignée, le popup affiche aussi les serveurs proxy de l'API Decodo en plus de la liste par défaut.",
      decodoAffiliationLink: "Decodo — Créer un compte",
      languageLabel: "Langue",
      ovpnPathRequired: "Indiquez le chemin du fichier .ovpn.",
      openvpnStarting: "Démarrage…",
      openvpnStarted: "OpenVPN démarré.",
      openvpnStartFailed:
        "Échec. Vérifiez que le host natif est installé (voir README).",
      openvpnStopping: "Arrêt…",
      openvpnStopped: "OpenVPN arrêté.",
      openvpnStopFailed: "Échec ou OpenVPN n'était pas démarré.",
    },
  };

  const COUNTRY_NAMES = {
    en: {
      FR: "France",
      US: "United States",
      GB: "United Kingdom",
      DE: "Germany",
      ES: "Spain",
      IT: "Italy",
      NL: "Netherlands",
      BE: "Belgium",
      CA: "Canada",
      AU: "Australia",
      JP: "Japan",
      BR: "Brazil",
      IN: "India",
      MX: "Mexico",
      PL: "Poland",
      SE: "Sweden",
      CH: "Switzerland",
      AT: "Austria",
      PT: "Portugal",
      RU: "Russia",
      KR: "South Korea",
      SG: "Singapore",
      HK: "Hong Kong",
      TR: "Turkey",
    },
    fr: {
      FR: "France",
      US: "États-Unis",
      GB: "Royaume-Uni",
      DE: "Allemagne",
      ES: "Espagne",
      IT: "Italie",
      NL: "Pays-Bas",
      BE: "Belgique",
      CA: "Canada",
      AU: "Australie",
      JP: "Japon",
      BR: "Brésil",
      IN: "Inde",
      MX: "Mexique",
      PL: "Pologne",
      SE: "Suède",
      CH: "Suisse",
      AT: "Autriche",
      PT: "Portugal",
      RU: "Russie",
      KR: "Corée du Sud",
      SG: "Singapour",
      HK: "Hong Kong",
      TR: "Turquie",
    },
  };

  let currentLocale = "en";

  function setLocale(loc) {
    currentLocale = loc === "fr" || loc === "en" ? loc : "en";
  }

  function getMessage(key) {
    return MESSAGES[currentLocale][key] ?? MESSAGES.en[key] ?? key;
  }

  function getCountryName(code) {
    const codeUpper = (code || "XX").toUpperCase();
    return (
      COUNTRY_NAMES[currentLocale][codeUpper] ??
      COUNTRY_NAMES.en[codeUpper] ??
      codeUpper
    );
  }

  global.setLocale = setLocale;
  global.getMessage = getMessage;
  global.getCountryName = getCountryName;
})(typeof window !== "undefined" ? window : this);
