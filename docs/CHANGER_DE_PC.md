# Travailler sur un autre PC et en parallèle

Le dépôt contient le code, les ressources locales, les catalogues, les rapports et les preuves publiques des recherches. **Les connexions et décisions personnelles ne se synchronisent pas par Git.** Les déploiements Firebase sont indépendants d’un commit ou d’un push.

## Installer et reprendre le projet

Installer **Git**, **Git LFS** et **Node.js 24** (npm inclus). Git LFS est nécessaire pour `catalog/enrichment-351/identities.json`, qui dépasse 100 Mio. Ce fichier est versionné dans LFS, pas à transférer à la main. Sous Windows, utiliser l’installateur Git LFS ; sous Ubuntu, le paquet `git-lfs` convient. Initialiser ensuite LFS dans le terminal utilisé pour Git :

```sh
git lfs install
git clone https://github.com/Flooooows/art-museum.git
cd art-museum
git lfs pull
npm ci
npm test
npm run dev -- --host 127.0.0.1
```

Ouvrir le port indiqué par Vite, normalement `http://localhost:5173` : `/` pour le jeu, `/review.html` pour les 1 000 œuvres et `/masterpieces.html` pour les 78 nouvelles candidates. Le premier lot de 25 reste à `/masterpieces.html?lot=initial`. Les scores et reproductions préparés sont déjà dans Git ; aucune nouvelle collecte n’est requise pour consulter ou développer l’interface. Les essais navigateur/captures sous `output/` ne sont pas nécessaires pour lancer le projet.

Si le dépôt existe déjà sur l’autre PC, vérifier ses changements avec `git status`, les committer ou les préserver, puis récupérer les commits sans écrasement :

```sh
git pull --ff-only
git lfs pull
npm ci
```

Si `git pull --ff-only` refuse, les branches ont divergé : ne pas employer `reset --hard` ni `push --force` pour contourner le problème. Examiner et fusionner les changements.

## À transférer séparément : les sauvegardes personnelles

Avant de quitter le premier PC, exporter les JSON depuis **chaque écran et chaque adresse réellement utilisée**. Le stockage de Firebase, localhost et des différents ports est distinct. Il faut jusqu’à quatre exports pour reprendre tous les choix et la collection :

| Contenu                                         | Où exporter puis importer sur le nouveau PC              | Stockage navigateur             |
| ----------------------------------------------- | -------------------------------------------------------- | ------------------------------- |
| Raretés du millier                              | Atelier `/review.html`, « Exporter mes choix »           | `muse:rarity-review:v1`         |
| Premier lot de 25 candidates                    | `/masterpieces.html?lot=initial`, « Exporter mes choix » | `muse:masterpieces-review:v1`   |
| Enrichissement de 78 candidates                 | `/masterpieces.html`, « Exporter mes choix »             | `muse:enrichment-351-review:v1` |
| Collection du jeu, cartes, stock et progression | Jeu, **Profil**, export/import de collection             | `muse-collection-v1`            |

Transférer les fichiers par un canal privé : clé USB, dossier privé synchronisé ou messagerie. Les importer dans le **bon lot**, sans changer les identifiants ou versions du JSON. Les placer hors du dépôt, ou dans `private/`, ignoré par Git. Les noms habituels d’exports sont également ignorés. Ils ne sont pas des clés secrètes au sens d’un mot de passe, mais restent des données personnelles ; ils ne sont pas publiés dans le dépôt.

Les choix plus récents restés dans tes navigateurs ne sont pas accessibles à l’assistant : un push du code ne les sauvegarde pas. Faire un nouvel export sur chaque PC après une session. Les imports des ateliers fusionnent après confirmation ; celui du jeu **remplace** la collection après confirmation. Il n’existe ni synchronisation automatique entre PC ni fusion automatique de deux collections de jeu.

Adresses publiques, qui ne sont pas secrètes :

- Atelier : https://art-museum-8fdd8-atelier.web.app
- Nouvelles candidates : https://art-museum-8fdd8-atelier.web.app/masterpieces.html
- Jeu : https://muse-collection-6f2d.web.app

## Référence humaine originale : seulement pour régénérer les recherches

Pour démarrer l’application, lancer les tests ou compiler les sites, aucun export humain privé n’est requis. **Pour relancer les audits ou le générateur complet du lot 351**, conserver séparément l’export original de référence : 722 décisions et 278 œuvres non revues, catalogue `review-1000-b069bbaeeecc561d`, SHA-256 :

```text
223cef98656d0cbe94a9bfff575475d4b175efe8b37eb41cb73e84166a8cba28
```

Ce fichier original n’est pas interchangeable avec un export récent ou un export créé par les tests. Le copier **sans le réenregistrer ni en modifier le contenu**. Créer sur le nouveau PC `catalog/masterpieces/manual-reference.local.json` — déjà exclu de Git — avec le chemin absolu local et l’empreinte attendue :

```json
{
  "path": "C:/chemin/prive/export-original.json",
  "sha256": "223cef98656d0cbe94a9bfff575475d4b175efe8b37eb41cb73e84166a8cba28"
}
```

En Linux/WSL, employer un chemin visible par Node sous cet environnement, par exemple `/home/moi/private/export-original.json`. Le chemin de l’ancien PC ne fonctionnera pas forcément ; modifier uniquement ce pointeur local, jamais les empreintes protégées pour faire accepter un autre export. Ne pas relancer les audits historiques simplement pour configurer le chemin : ils peuvent régénérer des preuves figées. Les derniers exports destinés à poursuivre la review doivent être conservés **en plus** de cette référence originale.

## Connexions et éventuelles clés

- **GitHub** : s’authentifier sur le nouveau PC pour pousser, via Git Credential Manager ou `gh auth login`. Ne pas copier un jeton dans un fichier du dépôt. Le dépôt emploie une URL HTTPS, sans jeton dans l’URL.
- **Firebase** : pour développer localement, aucun login ni secret Firebase n’est nécessaire. Pour déployer, refaire `npx --yes --package firebase-tools firebase login` avec le compte autorisé. Ne pas copier les jetons de connexion, le cache de credentials ou des comptes de service dans Git.
- **API de recherche optionnelles** : `SMITHSONIAN_API_KEY` et `EUROPEANA_API_KEY` ne sont utiles que pour les connecteurs correspondants. Les définir dans l’environnement du terminal utilisé pour une collecte live ; elles ne sont pas nécessaires aux captures et catalogues déjà livrés. Les scripts ne chargent pas automatiquement un fichier `.env`.
- **OpenCode ou autre assistant** : ses conversations, sa connexion au fournisseur et ses autorisations locales ne font pas partie du dépôt. Se reconnecter séparément si nécessaire. Les plans et guides présents dans `execplan/` et `docs/` permettent de reprendre le contexte du projet sans transférer l’historique complet.

Les IDs des projets Firebase ne sont pas secrets : atelier **`art-museum-8fdd8`**, site **`art-museum-8fdd8-atelier`** ; jeu **`muse-collection-6f2d`**. Les configurations publiques sont versionnées. Pour l’atelier seulement, après tests :

```sh
npm run build:atelier
npx --yes --package firebase-tools firebase deploy --only hosting --config firebase.json --project art-museum-8fdd8 --non-interactive
```

`npm run deploy:muse` cible le jeu, pas l’atelier. Ne pas lancer un déploiement pour simplement tester sur le nouveau PC.

## Éviter les conflits entre les deux PC

Utiliser une branche différente pour chaque travail parallèle :

```sh
git switch -c travail-pc2
# modifications, vérifications, commit
git push -u origin travail-pc2
```

Rapatrier ensuite les changements avec une pull request ou une fusion explicite. Avant une nouvelle session, récupérer les branches distantes avec `git fetch origin`. Ne pas travailler simultanément sur les mêmes fichiers générés : les catalogues et preuves possèdent des empreintes croisées et doivent être régénérés de manière cohérente. Préférer un seul PC pour les collectes et générations d’un même lot.

Le push demandé inclut aussi les deux images utilisateur `exemplecarte1.png` et `exemplecarte2.png`. Les dépendances `node_modules/`, les builds, caches de déploiement et captures de test restent exclus : ils se reconstruisent. Les preuves publiques de recherche restent, elles, versionnées pour conserver la traçabilité et permettre les tests hors collecte live.
