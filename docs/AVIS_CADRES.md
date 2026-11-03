# Avis sur les cadres du laboratoire

Dans `card-lab.html`, le nuancier propose un formulaire pour chaque famille :

- avis sur le **style général** de la catégorie ;
- avis séparé pour les cinq **finitions de rareté** ;
- trois états exclusifs : sans avis, approuvé, à revoir ;
- **un seul commentaire global par catégorie**, couvrant le style et toutes ses finitions. Il n’y a plus de champ de commentaire par rareté.

Les anciens commentaires par finition sont regroupés dans le commentaire global, avec leur rareté d’origine. Aucun texte n’est perdu et les votes existants restent conservés. Cette migration fonctionne aussi pour les anciens exports JSON et ne duplique pas les textes au rechargement.

Le bouton « Donner mon avis sur ce cadre » sous une carte choisit la famille correspondante et conduit au formulaire. Le sélecteur de famille du nuancier permet d’annoter toutes les autres catégories, y compris le décor archivé.

## Conservation et transmission

Les avis sont automatiquement enregistrés sous la clé locale `muse-card-lab-frame-feedback-v1`, indépendamment des données du jeu. Ils restent dans **ce navigateur et sur cette origine** : le site public et un serveur local ne partagent pas ces avis. Aucun envoi automatique ni base de données n’est ajouté.

Cliquer **Exporter tous mes avis**, puis joindre le fichier JSON à la conversation pour que l’agent puisse les exploiter lors d’une amélioration des cadres. L’agent n’a pas accès spontanément aux données du navigateur.

**Importer des avis** permet de retrouver les avis exportés sur un autre navigateur. L’import complète les avis manquants et conserve les avis locaux en cas de conflit. Un fichier invalide est refusé intégralement. En cas d’échec de lecture ou d’écriture du stockage, un avertissement demande un export ; une ancienne sauvegarde invalide n’est pas écrasée.

Chaque avis conserve sa date et l’empreinte du master (style) ou du rendu (finition) évalué. Si le cadre change, les anciens avis sont signalés dans le formulaire ; ils ne sont pas automatiquement considérés comme une validation du nouveau rendu.

Ces avis ne changent **ni les raretés des œuvres, ni les cadres du jeu**. La modification et la publication des cadres restent des étapes séparées.
