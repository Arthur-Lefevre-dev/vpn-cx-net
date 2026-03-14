# Politique de confidentialité — VPN CX Net

**Dernière mise à jour :** mars 2025

VPN CX Net (« l’extension ») respecte votre vie privée. Ce document décrit les données utilisées par l’extension et la façon dont elles sont traitées.

## Résumé

- **Aucune donnée personnelle n’est collectée ni transmise** à nos serveurs ou à des tiers à des fins d’analyse ou de commercialisation.
- Les réglages et préférences sont **stockés localement** dans votre navigateur (API de stockage de l’extension).
- Les statistiques de trafic (volume descendant/montant) sont **calculées et affichées localement** ; elles ne sont pas envoyées à un serveur.

## Données stockées localement

L’extension utilise le stockage local du navigateur (Chrome `chrome.storage.local` / équivalent Firefox) uniquement pour :

- **État du proxy** : activé ou désactivé, adresse et port du serveur, type de proxy (HTTP, SOCKS, etc.).
- **Préférences** : langue de l’interface (anglais/français).
- **Option OpenVPN** : chemin du fichier `.ovpn` et statut, si vous utilisez la fonction « Démarrer / Arrêter OpenVPN » dans les paramètres.
- **Option Decodo** : si vous renseignez une clé API Decodo dans les paramètres, celle-ci est conservée localement pour récupérer la liste des serveurs depuis l’API Decodo.

Ces données **restent sur votre appareil** et ne sont pas envoyées à nos serveurs (nous n’exploitons aucun serveur pour cette extension).

## Statistiques de trafic

L’extension affiche des statistiques de volume (données descendantes et montantes) dans le popup. Ces valeurs sont **calculées localement** à partir des en-têtes des réponses (par ex. `Content-Length`). Elles ne sont **ni enregistrées de façon persistante ni transmises** à un tiers.

## Données transmises à des tiers (à votre initiative)

- **API Decodo** : si vous avez saisi une clé API Decodo dans les paramètres, l’extension envoie des requêtes à l’API Decodo pour récupérer la liste des serveurs. Les conditions d’utilisation et la politique de confidentialité de Decodo s’appliquent à ces échanges.
- **Affichage des drapeaux** : en l’absence d’icônes locales, l’extension peut charger des images de drapeaux depuis un CDN (par ex. flagcdn.com) pour l’affichage dans l’interface. Aucun code exécutable n’est chargé depuis des serveurs externes.

## Authentification proxy

Lorsque vous utilisez un serveur proxy qui demande un identifiant et un mot de passe, l’extension peut fournir automatiquement ces identifiants au navigateur (via l’API d’authentification proxy). Ces identifiants sont **conservés localement** et utilisés uniquement pour répondre aux demandes d’authentification du proxy ; ils ne sont pas envoyés à d’autres serveurs que celui du proxy que vous avez choisi.

## Programme natif OpenVPN (optionnel)

Si vous installez le « host natif » et utilisez les boutons « Démarrer OpenVPN » / « Arrêter OpenVPN » dans les paramètres, l’extension communique avec un programme installé sur votre machine pour lancer ou arrêter le processus OpenVPN. **Aucune donnée n’est envoyée sur internet** dans le cadre de cette communication ; elle reste entre l’extension et le programme local.

## Modifications

Toute modification importante de cette politique sera reflétée dans ce document avec une mise à jour de la date en tête de page. Nous vous encourageons à consulter cette page périodiquement.

## Contact

Pour toute question relative à cette politique de confidentialité ou à l’extension VPN CX Net, vous pouvez ouvrir une issue sur le dépôt du projet ou contacter le mainteneur via la page du projet (par ex. GitHub).

---

**En résumé :** VPN CX Net ne collecte ni ne vend vos données. Les réglages et l’état du proxy restent sur votre appareil ; seules les actions que vous choisissez (liste des serveurs via Decodo, images de drapeaux) peuvent donner lieu à des requêtes vers des services externes.
