# Utiliser l’atelier des raretés MUSE

L’atelier permet de consulter **1 000 œuvres**, de comparer la proposition de l’algorithme et de choisir vous-même une rareté finale. Il est indépendant du jeu : vos choix ne modifient ni les pochettes, ni vos cartes, ni les prix.

## 1. Ouvrir l’atelier

### Utiliser le site partagé (sans installation)

Ouvrez **https://art-museum-8fdd8-atelier.web.app** et transmettez ce même lien à votre amie. L’atelier est hébergé sur un site Firebase Hosting dédié, distinct du site principal. Il est public, sans inscription et sans base de données de décisions partagée.

Chacune travaille dans son propre navigateur. Votre amie choisit ses raretés, clique sur **« Exporter mes choix »**, puis vous envoie le JSON téléchargé (par courriel ou messagerie, par exemple). Aucun envoi n’est automatique. Elle peut exporter plusieurs fois et reprendre plus tard à la même adresse.

**Avant d’importer son fichier dans votre navigateur, exportez vos propres choix.** L’import peut remplacer vos décisions en conflit après confirmation. Pour conserver les deux revues séparées, consultez celle de votre amie dans un autre profil de navigateur, ou comparez leurs exports CSV.

Si vous avez commencé sur `localhost`, exportez d’abord le JSON local puis importez-le sur cette adresse : les deux adresses ne partagent pas la même sauvegarde. Ce site ne nécessite pas les étapes d’installation ci-dessous.

### Si le projet est déjà lancé

Ouvrez **http://localhost:5173/review.html**. Si le terminal indique un autre port, remplacez `5173` par celui-ci. La page `/` est le jeu ; `/review.html` est l’atelier.

### Installer le projet depuis GitHub

Il faut Git, Node.js (version 22.12 ou plus récente ; Node 24 convient) et npm. Dans un terminal :

```sh
git clone https://github.com/Flooooows/art-museum.git
cd art-museum
npm ci
npm run dev -- --host 0.0.0.0
```

Gardez ce terminal ouvert pendant l’utilisation. Pour arrêter le serveur, utilisez `Ctrl+C`. Pour revenir plus tard, relancez simplement la dernière commande depuis le dossier du projet : inutile de réinstaller ou de recalculer les scores.

**GitHub héberge le code, pas automatiquement un site consultable.** Faire un push ne déploie pas l’application. N’ouvrez pas `review.html` directement depuis l’explorateur de fichiers : utilisez l’adresse du serveur.

## 2. Lire une carte

Chaque carte présente la reproduction, le titre, l’artiste ou le contexte et la date, puis :

- **Score de l’algo** : une note sur 100 ;
- **Placement conseillé** : la rareté proposée par V2 ;
- la confiance et le nombre de critères estimés ;
- **Ma rareté finale** : votre propre choix, vide au départ.

Ouvrez **« Données & sources »** pour consulter les cinq critères, la plage d’incertitude et les liens institutionnels. **« Comment lire les scores ? »** explique la méthode générale.

Les 1 000 propositions sont **provisoires**. Une note élevée ne garantit pas un classement juste, et la confiance n’est pas une probabilité de justesse. Plusieurs scores reposent largement sur des estimations : vous pouvez ne pas suivre la proposition.

## 3. Choisir la rareté finale

1. Examinez l’œuvre et, si nécessaire, ses sources.
2. Cochez l’un des cinq choix : **Esquisse, Étude, Composition, Œuvre ou Pièce maîtresse**.
3. Le choix est enregistré automatiquement dans votre navigateur, sans bouton de validation supplémentaire. En fonctionnement normal, le message **« Choix enregistré dans ce navigateur. »** confirme la sauvegarde.
4. Pour corriger une décision, cochez une autre rareté : elle remplace la précédente.
5. Pour revenir à une carte sans décision, cliquez sur **« Annuler mon choix »**.

Une seule rareté peut être sélectionnée par œuvre. Le compteur **« œuvres examinées »** compte les cartes pour lesquelles vous avez choisi une rareté, pas celles que vous avez seulement regardées. Votre décision ne change pas le score ou le conseil de l’algorithme.

## 4. Retrouver les œuvres et avancer

- **Recherche** : titre, artiste, contexte, date ou identifiant ; les accents ne sont pas obligatoires.
- **Famille** : restreint la liste à l’une des 12 familles.
- **Proposition de l’algo** : filtre les conseils de l’algorithme, **pas vos raretés finales**.
- **Trier par** : score croissant/décroissant, titre ou confiance la plus faible.
- **Toutes** : l’ensemble correspondant aux filtres.
- **À examiner** : les cartes sans décision.
- **Décidées** : les cartes avec une décision.
- **Écarts avec l’algo** : vos choix différents de la rareté conseillée.

La liste affiche **24 cartes par page**. Utilisez les flèches ou le sélecteur de page en bas. Après un changement de page au clavier, le focus revient vers les nouveaux résultats.

Avec un filtre de revue actif, une carte cochée reste en place pour éviter qu’elle disparaisse sous votre pointeur. Cliquez sur **« Actualiser la liste »** pour réévaluer ce filtre. Si une recherche ne donne rien, **« Afficher les 1 000 œuvres »** retire les filtres et la recherche.

## 5. Comprendre la sauvegarde automatique

Les décisions sont conservées dans le stockage local du navigateur (`localStorage`), sous une clé indépendante du jeu : `muse:rarity-review:v1`.

Vous pouvez fermer la page et reprendre plus tard **avec le même navigateur, le même profil et la même adresse complète du site**. Par exemple, `localhost:5173`, `127.0.0.1:5173` et `localhost:4173` ont des sauvegardes distinctes. Une future adresse hébergée aura également son propre stockage.

**Cette sauvegarde n’est pas un compte en ligne :**

- aucun choix n’est envoyé automatiquement à GitHub ou à l’assistant ;
- un autre ordinateur ou navigateur ne récupère pas vos choix tout seul ;
- effacer les données du site peut supprimer les décisions ;
- une session de navigation privée peut perdre ses données à sa fermeture.

**Exportez régulièrement le JSON**, notamment avant de changer d’adresse, de navigateur ou d’ordinateur.

## 6. Exporter une sauvegarde JSON

Cliquez sur **« Exporter mes choix »** dans l’en-tête. Le bouton devient disponible après votre première décision.

Le navigateur télécharge un fichier `muse-decisions-review-1000-….json` contenant les décisions, leurs dates et les versions nécessaires pour les réimporter. Conservez-le dans un dossier de sauvegarde ; faire plusieurs exports ne supprime pas les choix du site.

Ce JSON est le fichier à transmettre à l’assistant lorsque vous voulez faire analyser vos décisions. **Un push GitHub ne remplace pas cet export.** Il n’est pas nécessaire de publier vos décisions dans le dépôt public.

## 7. Importer ou reprendre sur un autre appareil

1. Transférez votre sauvegarde JSON sur l’appareil cible.
2. Ouvrez l’atelier avec une version compatible du catalogue.
3. Cliquez sur **« Importer »** et sélectionnez le JSON exporté par l’atelier.
4. Lisez le résumé : le dialogue annonce les choix qui remplaceraient une rareté différente déjà enregistrée.
5. Cliquez sur **« Confirmer l’import »**, ou sur **« Annuler »** pour ne rien changer.

L’import **fusionne** les décisions : celles qui ne figurent pas dans le fichier restent présentes. Un conflit est remplacé seulement après confirmation. Un fichier invalide, des identifiants inconnus ou une version de catalogue différente sont refusés sans modifier les choix. La limite d’import est de **2 Mo**.

Si le catalogue a changé, ne modifiez pas artificiellement les versions dans le JSON pour forcer l’import. Conservez votre sauvegarde et demandez une vérification de compatibilité.

## 8. Exporter un tableau CSV

En bas de page, cliquez sur **« Exporter les 1 000 fiches en CSV »**. Le tableau contient toutes les œuvres, le score, la proposition et votre rareté finale éventuelle.

- Une rareté finale vide signifie **aucune décision**.
- **Esquisse** est une vraie décision, même si elle correspond au niveau numérique zéro.
- Ouvrez le fichier avec Excel, LibreOffice ou un autre tableur. Si les colonnes ne sont pas séparées, choisissez un import **UTF-8, séparateur virgule**.

Le CSV sert à lire et comparer les résultats. **Il ne se réimporte pas dans l’atelier** : gardez le JSON pour sauvegarder et restaurer votre progression.

## 9. En cas de problème

| Situation | Que faire ? |
|---|---|
| Mes choix semblent avoir disparu | Vérifiez l’adresse, le port, le navigateur et le profil utilisés. Importez votre dernier JSON si nécessaire. |
| Le stockage est indisponible | Les nouveaux choix restent dans la session, mais ne sont pas garantis après fermeture. Exportez le JSON avant de quitter. |
| Une ancienne sauvegarde est incompatible ou illisible | Ne l’effacez pas. Utilisez « Récupérer l’ancienne sauvegarde » si proposé et exportez aussi les choix de la session. Ne confirmez son remplacement qu’après avoir conservé les fichiers utiles. |
| La sauvegarde a changé dans un autre onglet | Exportez les choix de cet onglet avant de recharger. Travaillez de préférence dans un seul onglet ; une reprise d’écriture demande confirmation. |
| Le catalogue ne se charge pas | Vérifiez que le serveur est lancé et l’adresse correcte, puis cliquez sur « Réessayer ». Si les fichiers manquent, consultez le guide technique ci-dessous. |
| Une reproduction manque | Vérifiez la connexion Internet ou ouvrez la notice du musée depuis la fiche. Le score et les choix restent disponibles. |
| L’import est refusé | Utilisez un JSON exporté par cet atelier, de version compatible, sans l’éditer manuellement. Un CSV ou une sauvegarde du jeu n’est pas compatible. |

## 10. Lorsque la revue est terminée

Exportez une dernière fois le **JSON** et, si utile, le **CSV**. Vous pouvez transmettre ces fichiers pour comparer vos décisions à l’algorithme et préparer une éventuelle évolution du catalogue.

**Même avec 1 000 décisions, aucune migration n’est déclenchée.** L’intégration de vos raretés dans le jeu reste une opération séparée nécessitant votre validation explicite.

Pour les sources, les limites du lot et les commandes de collecte/calcul, consultez le [guide technique de l’atelier](../catalog/review-1000/README.md). Les 900 nouvelles images sont servies par Cleveland et nécessitent Internet ; il n’est pas nécessaire de relancer une collecte pour utiliser les données déjà fournies.
