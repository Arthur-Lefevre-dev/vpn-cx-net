/**
 * i18n for VPN CX NET. Load from popup or options. Default locale: en.
 * Usage: setLocale('en'|'fr'|'de'|'ja'|'zh'); getMessage('key'); getCountryName('FR');
 */
(function (global) {
  const MESSAGES = {
    en: {
      appName: "VPN CX Net",
      loading: "Loading…",
      proxyActive: "Proxy active",
      proxyDisabled: "Proxy disabled",
      privateBrowsingRequired:
        "Firefox: enable Private Browsing access for this extension.",
      privateBrowsingOpenOptions: "Open options",
      privateBrowsingStepsTitle: "Enable Private Browsing (Firefox)",
      privateBrowsingStep1:
        'Open <a href="about:addons" target="_blank" rel="noopener noreferrer">about:addons</a>',
      privateBrowsingStep2: "Find “VPN CX NET” in Extensions",
      privateBrowsingStep3:
        "Turn on “Run in Private Windows” → set it to “Allow”",
      privateBrowsingVideoCaption:
        "Video guide: allow this add-on in private windows (Firefox).",
      privateBrowsingWatchOnYoutube: "Watch on YouTube",
      privateBrowsingVideoThumbAlt:
        "Video thumbnail — Firefox private windows guide for VPN CX Net",
      aboutAddonsCopied: "about:addons copied",
      aboutAddonsCopyFailed: "Copy failed",
      trafficDown: "↓ Download",
      trafficUp: "↑ Upload",
      trafficTotal: "Total",
      country: "Country",
      randomServer: "Random",
      decodoSectionTitle: "Decodo API",
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
      termsTitle: "Terms of use",
      termsLead:
        "Please read the following before using VPN CX Net for the first time.",
      termsP1:
        "VPN CX Net is a browser extension that configures HTTP or SOCKS proxy settings. Proxy and/or VPN access may be provided by the service operator together with this extension, in addition to any endpoints, lists, or third-party APIs you configure yourself.",
      termsP2:
        "You must not use the service for unlawful, fraudulent, or abusive purposes (including but not limited to malware, unauthorized access, rights infringement, or evasion of law enforcement where prohibited). You are solely responsible for compliance with applicable laws and network policies. The service operator may suspend or terminate access for violations and disclaims liability for your conduct; you agree not to hold the operator liable for claims arising from your misuse of proxies or VPN access.",
      termsP3:
        "When you use proxy or VPN infrastructure operated by the service, visited URLs may be retained for up to thirty (30) days in an anonymized form designed so that browsing cannot be traced back to you as an identifiable individual. This processing supports abuse prevention and service integrity and is not used for advertising profiling.",
      termsP4:
        "OpenVPN-related features depend on a separately installed native host and your own configuration files where applicable. The developers disclaim liability for loss of data, service interruption, or issues with third-party software or networks.",
      termsP5:
        'The extension and associated services are provided "as is", without warranties. Use at your own risk.',
      termsP6:
        "By continuing, you confirm that you have read these terms and that you meet the age or consent requirements for binding agreements in your jurisdiction.",
      termsCheckboxLabel: "I have read and accept the terms of use.",
      termsAcceptBtn: "Continue",
    },
    de: {
      appName: "VPN CX Net",
      loading: "Wird geladen…",
      proxyActive: "Proxy aktiv",
      proxyDisabled: "Proxy aus",
      privateBrowsingRequired:
        "Firefox: Erlauben Sie dieser Erweiterung den Zugriff im privaten Modus.",
      privateBrowsingOpenOptions: "Einstellungen öffnen",
      privateBrowsingStepsTitle: "Privaten Modus aktivieren (Firefox)",
      privateBrowsingStep1:
        'Öffnen Sie <a href="about:addons" target="_blank" rel="noopener noreferrer">about:addons</a>',
      privateBrowsingStep2: "Suchen Sie „VPN CX NET“ unter Erweiterungen",
      privateBrowsingStep3:
        "„In privaten Fenstern ausführen“ einschalten → auf „Erlauben“ stellen",
      privateBrowsingVideoCaption:
        "Video-Anleitung: Erweiterung im privaten Modus erlauben (Firefox).",
      privateBrowsingWatchOnYoutube: "Auf YouTube ansehen",
      privateBrowsingVideoThumbAlt:
        "Vorschaubild — Anleitung privates Fenster für VPN CX Net in Firefox",
      aboutAddonsCopied: "about:addons kopiert",
      aboutAddonsCopyFailed: "Kopieren fehlgeschlagen",
      trafficDown: "↓ Download",
      trafficUp: "↑ Upload",
      trafficTotal: "Gesamt",
      country: "Land",
      randomServer: "Zufällig",
      decodoSectionTitle: "Decodo-API",
      chooseCountry: "Land wählen",
      chooseCountryPlaceholder: "— Land wählen —",
      enableProxy: "Proxy aktivieren",
      disableProxy: "Proxy deaktivieren",
      configureInSettings: "In den Einstellungen konfigurieren",
      settings: "Einstellungen",
      error: "Fehler",
      madeBy: "Made by ",
      supportMessage:
        "Das Projekt unterstützen und mehr Funktionen? Sie können spenden:",
      settingsTitle: "Einstellungen — VPN CX Net",
      openvpn: "OpenVPN",
      openvpnHelp:
        "Installieren Sie den nativen Host (siehe README). Geben Sie den Pfad zur .ovpn-Datei ein und starten oder stoppen Sie OpenVPN.",
      ovpnPathLabel: "Pfad zur .ovpn-Datei",
      ovpnPathPlaceholder: "C:\\Pfad\\zu\\config.ovpn",
      openvpnStart: "OpenVPN starten",
      openvpnStop: "OpenVPN stoppen",
      decodoApiKeyLabel: "Decodo-API-Schlüssel (optional)",
      decodoApiKeyPlaceholder: "Länderliste von der Decodo-API",
      decodoApiKeyHelp:
        "Wenn gesetzt, zeigt das Popup zusätzlich Proxy-Server von der Decodo-API neben der Standardliste.",
      decodoAffiliationLink: "Decodo — Konto erstellen",
      languageLabel: "Sprache",
      ovpnPathRequired: "Geben Sie den Pfad zur .ovpn-Datei ein.",
      openvpnStarting: "Wird gestartet…",
      openvpnStarted: "OpenVPN gestartet.",
      openvpnStartFailed:
        "Fehler. Stellen Sie sicher, dass der native Host installiert ist (siehe README).",
      openvpnStopping: "Wird beendet…",
      openvpnStopped: "OpenVPN beendet.",
      openvpnStopFailed: "Fehler oder OpenVPN lief nicht.",
      termsTitle: "Nutzungsbedingungen",
      termsLead:
        "Bitte lesen Sie Folgendes, bevor Sie VPN CX Net zum ersten Mal nutzen.",
      termsP1:
        "VPN CX Net ist eine Browser-Erweiterung zur Konfiguration von HTTP- oder SOCKS-Proxyeinstellungen. Proxy- und/oder VPN-Zugang kann vom Dienstanbieter zusammen mit dieser Erweiterung bereitgestellt werden, zusätzlich zu von Ihnen konfigurierten Endpunkten, Listen oder APIs Dritter.",
      termsP2:
        "Sie dürfen den Dienst nicht für rechtswidrige, betrügerische oder missbräuchliche Zwecke nutzen (einschließlich Schadsoftware, unbefugtem Zugriff, Rechtsverletzungen oder unzulässiger Umgehung von Behörden). Sie sind allein verantwortlich für die Einhaltung geltender Gesetze und Netzwerkrichtlinien. Der Betreiber kann bei Verstößen den Zugang sperren oder beenden und haftet nicht für Ihr Verhalten; Sie stellen den Betreiber von Ansprüchen frei, die aus Missbrauch von Proxy oder VPN entstehen.",
      termsP3:
        "Wenn Sie die Proxy- oder VPN-Infrastruktur des Dienstes nutzen, können besuchte URLs bis zu dreißig (30) Tage in anonymisierter Form gespeichert werden, sodass Ihr Surfverhalten nicht einer identifizierbaren Person zugeordnet werden kann. Dies dient Missbrauchsprävention und Betriebssicherheit und erfolgt nicht zu Werbeprofilierung.",
      termsP4:
        "OpenVPN-bezogene Funktionen setzen einen separat installierten nativen Host und ggf. Ihre eigenen Konfigurationsdateien voraus. Die Entwickler haften nicht für Datenverlust, Dienstunterbrechungen oder Probleme mit Drittsoftware oder -netzen.",
      termsP5:
        'Erweiterung und zugehörige Dienste werden "wie besehen" ohne Gewährleistung bereitgestellt. Nutzung auf eigenes Risiko.',
      termsP6:
        "Mit Fortfahren bestätigen Sie, dass Sie diese Bedingungen gelesen haben und das erforderliche Alter bzw. die Einwilligung in Ihrer Rechtsordnung erfüllen.",
      termsCheckboxLabel: "Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie.",
      termsAcceptBtn: "Weiter",
    },
    ja: {
      appName: "VPN CX Net",
      loading: "読み込み中…",
      proxyActive: "プロキシ有効",
      proxyDisabled: "プロキシ無効",
      privateBrowsingRequired:
        "Firefox：この拡張機能にプライベートブラウジングへのアクセスを許可してください。",
      privateBrowsingOpenOptions: "設定を開く",
      privateBrowsingStepsTitle: "プライベートブラウジングを有効にする（Firefox）",
      privateBrowsingStep1:
        '<a href="about:addons" target="_blank" rel="noopener noreferrer">about:addons</a> を開く',
      privateBrowsingStep2: "拡張機能の一覧で「VPN CX NET」を探す",
      privateBrowsingStep3:
        "「プライベートウィンドウで実行」をオンにし、「許可」に設定する",
      privateBrowsingVideoCaption:
        "動画ガイド：Firefox でプライベートウィンドウでこの拡張機能を許可する方法。",
      privateBrowsingWatchOnYoutube: "YouTube で見る",
      privateBrowsingVideoThumbAlt:
        "動画サムネイル — Firefox プライベートウィンドウの手順（VPN CX Net）",
      aboutAddonsCopied: "about:addons をコピーしました",
      aboutAddonsCopyFailed: "コピーに失敗しました",
      trafficDown: "↓ ダウンロード",
      trafficUp: "↑ アップロード",
      trafficTotal: "合計",
      country: "国",
      randomServer: "ランダム",
      decodoSectionTitle: "Decodo API",
      chooseCountry: "国を選択",
      chooseCountryPlaceholder: "— 国を選択 —",
      enableProxy: "プロキシを有効にする",
      disableProxy: "プロキシを無効にする",
      configureInSettings: "設定で構成",
      settings: "設定",
      error: "エラー",
      madeBy: "Made by ",
      supportMessage:
        "プロジェクトを支援して、さらに機能が欲しいですか？寄付できます：",
      settingsTitle: "設定 — VPN CX Net",
      openvpn: "OpenVPN",
      openvpnHelp:
        "ネイティブホストをインストールしてください（README 参照）。.ovpn ファイルのパスを入力し、OpenVPN を開始または停止します。",
      ovpnPathLabel: ".ovpn ファイルのパス",
      ovpnPathPlaceholder: "C:\\path\\to\\config.ovpn",
      openvpnStart: "OpenVPN を開始",
      openvpnStop: "OpenVPN を停止",
      decodoApiKeyLabel: "Decodo API キー（任意）",
      decodoApiKeyPlaceholder: "Decodo API の国リスト",
      decodoApiKeyHelp:
        "設定すると、デフォルトのリストに加えて Decodo API のプロキシサーバーもポップアップに表示されます。",
      decodoAffiliationLink: "Decodo — アカウント作成",
      languageLabel: "言語",
      ovpnPathRequired: ".ovpn ファイルのパスを入力してください。",
      openvpnStarting: "開始中…",
      openvpnStarted: "OpenVPN を開始しました。",
      openvpnStartFailed:
        "失敗しました。ネイティブホストがインストールされているか確認してください（README 参照）。",
      openvpnStopping: "停止中…",
      openvpnStopped: "OpenVPN を停止しました。",
      openvpnStopFailed: "失敗したか、OpenVPN は起動していませんでした。",
      termsTitle: "利用規約",
      termsLead:
        "初めて VPN CX Net をご利用になる前に、以下をお読みください。",
      termsP1:
        "VPN CX Net は、ブラウザーで HTTP または SOCKS プロキシを設定する拡張機能です。プロキシおよび／または VPN へのアクセスは、本拡張機能とあわせてサービス運営者が提供する場合があり、ユーザーが独自に設定するエンドポイント、リスト、第三者 API に加えて利用できます。",
      termsP2:
        "違法、詐欺、悪用目的（マルウェア、不正アクセス、権利侵害、法令に反する捜査回避など）での利用は禁止です。適用法とネットワーク方針の遵守はユーザーの責任です。違反があれば運営者は利用を停止・終了できるものとし、ユーザーの行為について運営者は責任を負いません。プロキシや VPN の不正利用に起因する請求から運営者を免責することに同意します。",
      termsP3:
        "運営者が提供するプロキシ／VPN インフラを利用する場合、閲覧した URL は最大三十（30）日間、個人を特定できないよう匿名化された形で保存されることがあります。不正利用の防止とサービスの健全性のためであり、広告プロファイル作成には使用しません。",
      termsP4:
        "OpenVPN 関連機能は、別途インストールするネイティブホストおよび該当する場合はユーザー自身の設定ファイルに依存します。データ損失、サービス中断、第三者ソフトウェアやネットワークに関する問題について開発者は責任を負いません。",
      termsP5:
        "本拡張機能および関連サービスは現状有姿で提供され、保証はありません。ご利用は自己責任でお願いします。",
      termsP6:
        "続行することで、本規約を読んだこと、およびお住まいの法域で契約に必要な年齢または同意要件を満たすことを確認したものとみなします。",
      termsCheckboxLabel: "利用規約を読み、同意します。",
      termsAcceptBtn: "続行",
    },
    fr: {
      appName: "VPN CX Net",
      loading: "Chargement…",
      proxyActive: "Proxy actif",
      proxyDisabled: "Proxy désactivé",
      privateBrowsingRequired:
        "Firefox : autorisez l’accès en navigation privée pour cette extension.",
      privateBrowsingOpenOptions: "Ouvrir les paramètres",
      privateBrowsingStepsTitle: "Activer la navigation privée (Firefox)",
      privateBrowsingStep1:
        'Ouvrez <a href="about:addons" target="_blank" rel="noopener noreferrer">about:addons</a>',
      privateBrowsingStep2: "Trouvez “VPN CX NET” dans les extensions",
      privateBrowsingStep3:
        "Activez “Run in Private Windows” → mettez sur “Allow”",
      privateBrowsingVideoCaption:
        "Vidéo : autoriser cette extension en navigation privée (Firefox).",
      privateBrowsingWatchOnYoutube: "Voir sur YouTube",
      privateBrowsingVideoThumbAlt:
        "Miniature vidéo — guide navigation privée Firefox pour VPN CX Net",
      aboutAddonsCopied: "about:addons copié",
      aboutAddonsCopyFailed: "Copie impossible",
      trafficDown: "↓ Descendant",
      trafficUp: "↑ Montant",
      trafficTotal: "Total",
      country: "Pays",
      randomServer: "Aléatoire",
      decodoSectionTitle: "API Decodo",
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
      termsTitle: "Conditions d’utilisation",
      termsLead:
        "Veuillez lire ce qui suit avant d’utiliser VPN CX Net pour la première fois.",
      termsP1:
        "VPN CX Net est une extension qui configure un proxy HTTP ou SOCKS dans le navigateur. Un accès proxy et/ou VPN peut être fourni par l’exploitant du service avec cette extension, en complément des points de terminaison, listes ou API tierces que vous configurez vous-même.",
      termsP2:
        "Il est interdit d’utiliser le service à des fins illégales, frauduleuses ou abusives (y compris malware, accès non autorisé, atteinte aux droits, contournement illicite des autorités). Vous restez seul responsable du respect des lois et des politiques réseau. L’exploitant peut suspendre ou résilier l’accès en cas de violation et décline toute responsabilité quant à votre comportement ; vous acceptez de ne pas tenir l’exploitant responsable des réclamations liées à une utilisation abusive des proxys ou du VPN.",
      termsP3:
        "Lorsque vous utilisez l’infrastructure proxy ou VPN exploitée par le service, les URL visitées peuvent être conservées jusqu’à trente (30) jours sous une forme anonymisée ne permettant pas de vous retracer en tant que personne identifiable. Ce traitement vise la prévention des abus et l’intégrité du service ; il n’est pas utilisé pour du profilage publicitaire.",
      termsP4:
        "Les fonctions liées à OpenVPN dépendent d’un hôte natif installé séparément et, le cas échéant, de vos propres fichiers de configuration. Les développeurs déclinent toute responsabilité en cas de perte de données, d’interruption de service ou de problèmes liés à des logiciels ou réseaux tiers.",
      termsP5:
        "L’extension et les services associés sont fournis « en l’état », sans garantie. Utilisation à vos risques.",
      termsP6:
        "En continuant, vous confirmez avoir lu ces conditions et remplir l’âge ou les conditions de consentement requis dans votre juridiction.",
      termsCheckboxLabel: "J’ai lu et j’accepte les conditions d’utilisation.",
      termsAcceptBtn: "Continuer",
    },
    zh: {
      appName: "VPN CX Net",
      loading: "加载中…",
      proxyActive: "代理已启用",
      proxyDisabled: "代理已关闭",
      privateBrowsingRequired:
        "Firefox：请允许本扩展在隐私浏览窗口中运行。",
      privateBrowsingOpenOptions: "打开设置",
      privateBrowsingStepsTitle: "启用隐私浏览访问（Firefox）",
      privateBrowsingStep1:
        '打开 <a href="about:addons" target="_blank" rel="noopener noreferrer">about:addons</a>',
      privateBrowsingStep2: "在扩展列表中找到 “VPN CX NET”",
      privateBrowsingStep3:
        "开启 “在隐私窗口中运行” → 设为 “允许”",
      privateBrowsingVideoCaption:
        "视频指南：在 Firefox 隐私窗口中允许本扩展。",
      privateBrowsingWatchOnYoutube: "在 YouTube 上观看",
      privateBrowsingVideoThumbAlt:
        "视频缩略图 — Firefox 隐私窗口设置指南（VPN CX Net）",
      aboutAddonsCopied: "已复制 about:addons",
      aboutAddonsCopyFailed: "复制失败",
      trafficDown: "↓ 下载",
      trafficUp: "↑ 上传",
      trafficTotal: "总计",
      country: "国家/地区",
      randomServer: "随机",
      decodoSectionTitle: "Decodo API",
      chooseCountry: "选择国家/地区",
      chooseCountryPlaceholder: "— 请选择国家/地区 —",
      enableProxy: "启用代理",
      disableProxy: "关闭代理",
      configureInSettings: "在设置中配置",
      settings: "设置",
      error: "错误",
      madeBy: "作者 ",
      supportMessage:
        "想支持项目并获得更多功能？欢迎捐助：",
      settingsTitle: "设置 — VPN CX Net",
      openvpn: "OpenVPN",
      openvpnHelp:
        "请安装本机通信组件（见 README）。输入 .ovpn 文件路径后启动或停止 OpenVPN。",
      ovpnPathLabel: ".ovpn 文件路径",
      ovpnPathPlaceholder: "C:\\path\\to\\config.ovpn",
      openvpnStart: "启动 OpenVPN",
      openvpnStop: "停止 OpenVPN",
      decodoApiKeyLabel: "Decodo API 密钥（可选）",
      decodoApiKeyPlaceholder: "来自 Decodo API 的国家列表",
      decodoApiKeyHelp:
        "若填写，弹出窗口除默认列表外还会显示 Decodo API 返回的代理服务器。",
      decodoAffiliationLink: "Decodo — 注册账户",
      languageLabel: "语言",
      ovpnPathRequired: "请输入 .ovpn 文件路径。",
      openvpnStarting: "正在启动…",
      openvpnStarted: "OpenVPN 已启动。",
      openvpnStartFailed:
        "失败。请确认已安装本机组件（见 README）。",
      openvpnStopping: "正在停止…",
      openvpnStopped: "OpenVPN 已停止。",
      openvpnStopFailed: "失败或 OpenVPN 未在运行。",
      termsTitle: "使用条款",
      termsLead: "首次使用 VPN CX Net 前，请阅读以下内容。",
      termsP1:
        "VPN CX Net 是在浏览器中配置 HTTP 或 SOCKS 代理的扩展。除您自行配置的端点、列表或第三方 API 外，服务运营者还可通过本扩展向您提供代理和/或 VPN 访问。",
      termsP2:
        "禁止将本服务用于违法、欺诈或滥用目的（包括但不限于恶意软件、未经授权的访问、权利侵害或非法规避执法）。您须自行遵守适用法律与网络政策。若违反，运营者可暂停或终止访问；运营者不对您的行为承担责任；您同意不就您对代理或 VPN 的滥用向运营者主张索赔。",
      termsP3:
        "当您使用由服务运营的代理或 VPN 基础设施时，所访问的 URL 可能以匿名化形式保留最长三十（30）天，该形式旨在无法将浏览活动追溯至可识别的个人。此处理用于防范滥用与保障服务完整性，不用于广告画像。",
      termsP4:
        "OpenVPN 相关功能依赖另行安装的本机宿主程序及（如适用）您自己的配置文件。开发者不对数据丢失、服务中断或第三方软件/网络问题承担责任。",
      termsP5: "本扩展及相关服务按“现状”提供，不作任何担保。使用风险由您自行承担。",
      termsP6:
        "点击继续即表示您已阅读本条款，并确认在您所在司法辖区已达到订立协议的法定年龄或已取得必要同意。",
      termsCheckboxLabel: "我已阅读并同意使用条款。",
      termsAcceptBtn: "继续",
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
    de: {
      FR: "Frankreich",
      US: "Vereinigte Staaten",
      GB: "Vereinigtes Königreich",
      DE: "Deutschland",
      ES: "Spanien",
      IT: "Italien",
      NL: "Niederlande",
      BE: "Belgien",
      CA: "Kanada",
      AU: "Australien",
      JP: "Japan",
      BR: "Brasilien",
      IN: "Indien",
      MX: "Mexiko",
      PL: "Polen",
      SE: "Schweden",
      CH: "Schweiz",
      AT: "Österreich",
      PT: "Portugal",
      RU: "Russland",
      KR: "Südkorea",
      SG: "Singapur",
      HK: "Hongkong",
      TR: "Türkei",
    },
    ja: {
      FR: "フランス",
      US: "アメリカ合衆国",
      GB: "イギリス",
      DE: "ドイツ",
      ES: "スペイン",
      IT: "イタリア",
      NL: "オランダ",
      BE: "ベルギー",
      CA: "カナダ",
      AU: "オーストラリア",
      JP: "日本",
      BR: "ブラジル",
      IN: "インド",
      MX: "メキシコ",
      PL: "ポーランド",
      SE: "スウェーデン",
      CH: "スイス",
      AT: "オーストリア",
      PT: "ポルトガル",
      RU: "ロシア",
      KR: "韓国",
      SG: "シンガポール",
      HK: "香港",
      TR: "トルコ",
    },
    zh: {
      FR: "法国",
      US: "美国",
      GB: "英国",
      DE: "德国",
      ES: "西班牙",
      IT: "意大利",
      NL: "荷兰",
      BE: "比利时",
      CA: "加拿大",
      AU: "澳大利亚",
      JP: "日本",
      BR: "巴西",
      IN: "印度",
      MX: "墨西哥",
      PL: "波兰",
      SE: "瑞典",
      CH: "瑞士",
      AT: "奥地利",
      PT: "葡萄牙",
      RU: "俄罗斯",
      KR: "韩国",
      SG: "新加坡",
      HK: "香港",
      TR: "土耳其",
    },
  };

  const SUPPORTED_LOCALES = ["en", "fr", "de", "ja", "zh"];

  let currentLocale = "en";

  function setLocale(loc) {
    currentLocale = SUPPORTED_LOCALES.includes(loc) ? loc : "en";
  }

  function getMessage(key) {
    const pack = MESSAGES[currentLocale] || MESSAGES.en;
    return pack[key] ?? MESSAGES.en[key] ?? key;
  }

  function getCountryName(code) {
    const codeUpper = (code || "XX").toUpperCase();
    const names = COUNTRY_NAMES[currentLocale] || COUNTRY_NAMES.en;
    return (
      names[codeUpper] ??
      COUNTRY_NAMES.en[codeUpper] ??
      codeUpper
    );
  }

  function getCurrentLocale() {
    return currentLocale;
  }

  global.setLocale = setLocale;
  global.getMessage = getMessage;
  global.getCountryName = getCountryName;
  global.getCurrentLocale = getCurrentLocale;
  /** Bump when terms text changes materially (user must re-accept). */
  global.TERMS_OF_USE_VERSION = "2";
})(typeof window !== "undefined" ? window : this);
