# Atelier MUSE — 1 000 œuvres à examiner

Page indépendante : **`/review.html`**. Elle affiche pour chaque œuvre une reproduction entière, son score V2, sa rareté conseillée et cinq choix exclusifs pour la décision humaine. Aucun choix n’est précoché. Une décision se modifie ou s’annule individuellement.

## Utiliser l’atelier

Depuis la racine du projet :

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Ouvrir `http://localhost:5173/review.html` (ou le port indiqué par Vite). Le build `npm run build` produit les deux entrées indépendantes `dist/index.html` et `dist/review.html`. Aucun backend n’est nécessaire. Une mise en ligne demande de servir l’intégralité de `dist`, y compris `review-data/catalog.json`.

Rechercher par titre, artiste, contexte, date ou identifiant ; filtrer par famille, proposition ou état de revue. Le tri permet de commencer par les meilleurs scores ou les confiances les plus faibles. La pagination affiche 24 cartes à la fois : les mille images ne sont pas chargées simultanément. Les reproductions des 100 œuvres actuelles sont locales ; celles des 900 nouvelles viennent du CDN institutionnel et nécessitent Internet. Une erreur d’image conserve la fiche et un lien vers la notice.

Les boutons radio servent de cases à choix exclusif : une œuvre ne peut pas avoir deux raretés finales. Une carte cochée ne disparaît pas sous le pointeur si un filtre de revue est actif : « Actualiser la liste » réévalue ce filtre. Les familles de cet atelier ne deviennent pas des pochettes du jeu.

## Sauvegarder et transporter les décisions

Les décisions sont enregistrées dans la clé **`muse:rarity-review:v1`**, distincte des acquisitions du jeu. Le compteur représente les œuvres pour lesquelles une rareté a été choisie. **La décision humaine ne change jamais la proposition algorithmique** et ne signifie pas que l’algorithme a confirmé son résultat.

« Exporter mes choix » télécharge un JSON versionné réimportable. « Exporter les 1 000 fiches en CSV » contient toutes les œuvres, les propositions et les choix humains éventuels ; une cellule finale vide signifie qu’aucune décision n’a été prise. Le niveau zéro Esquisse reste une vraie décision, jamais une absence.

L’import JSON vérifie le format, la version du catalogue et de l’algorithme, les identifiants uniques, les dates et les niveaux. Un fichier malformé ou incompatible est refusé intégralement sans modifier les choix. Une confirmation indique le nombre de conflits ; la fusion conserve les décisions absentes du fichier. Le CSV est destiné à l’analyse, pas à l’import des décisions.

Un stockage corrompu ou incompatible n’est pas écrasé : il peut être récupéré tel quel, les choix restent utilisables en session et exportables, puis une confirmation permet de rétablir la sauvegarde locale. Si un autre onglet modifie le stockage, les écritures de la session sont bloquées jusqu’à récupération ou confirmation. Exporter régulièrement : il n’y a ni compte, ni synchronisation, ni sauvegarde serveur. Un autre navigateur, une autre origine/port ou un autre appareil a un stockage distinct.

## Provenance du lot

**100 œuvres historiques** sont conservées avec leurs identifiants, métadonnées et scores de l’exécution V2 `02b68c195210ea3536d84c1a`. Elles ne sont pas recalculées au gré du nouvel échantillon. **900 notices supplémentaires** proviennent de Cleveland Open Access, avec identifiant institutionnel exact, date/période, titre, contexte ou créateur, image web et statut **CC0** dans la réponse source.

Sélection par type d’objet : 180 peintures, 120 sculptures, 150 estampes, 100 dessins, 90 photographies, 90 textiles, 90 céramiques et 80 objets d’arts du métal. Les 100 historiques conservent leurs quatre familles, soit **12 familles de revue** au total. Les nombres portent sur la diversité du lot, pas sur les raretés : aucun quota de rareté n’est imposé.

Les réponses paginées complètes sont conservées dans `catalog/review-1000/cache/`, avec URL, date de collecte et empreinte. `selection.json` identifie précisément les 900 objets retenus et leurs captures. Le collecteur exclut les identifiants déjà présents ; il ne dédoublonne pas des œuvres distinctes sur un simple titre identique. Les titres et crédits des nouvelles notices restent dans la langue de l’institution plutôt qu’être traduits arbitrairement.

Ce lot n’est **pas représentatif de l’art mondial** : Cleveland fournit toutes les nouvelles notices, les droits ouverts privilégient certains objets et l’ordre des réponses de l’institution influence la sélection. CC0 est une déclaration institutionnelle conservée dans les captures, pas une garantie juridique universelle indépendante. Aucune œuvre n’est publiée dans le catalogue actif du jeu.

## Calcul des propositions

Le code réutilise les fonctions pures V2 dans `src/rarity-engine/`, sans modifier le moteur ni ses rapports historiques. Formule : **25 % P + 20 % A + 25 % H + 20 % M + 10 % C**, seuils **40 / 60 / 75 / 90**. Les noms restent Esquisse, Étude, Composition, Œuvre et Pièce maîtresse.

Pour les 900 nouvelles entrées, les indices directement disponibles viennent des notices : collection, mise en avant, expositions, bibliographie et ressources pédagogiques éventuelles. **Aucune nouvelle audience Wikipédia ou Google Trends n’a été collectée pour ces entrées**. Un nom d’artiste connu n’est pas transformé arbitrairement en score mesuré. Les données manquantes sont explicitement estimées par V2, depuis des distributions contextuelles ou les comparables historiques **non imputés** des cent œuvres déjà auditées. Les 900 nouvelles cibles ne sont pas ajoutées à ce groupe fixe de comparables ; ce lot n’est pas un catalogue de normalisation.

Les mêmes scénarios de courbe et de poids testent la stabilité des nouveaux résultats. Les plages et la confiance sont visibles dans les détails. La bibliographie alimente souvent H comme **proxy documentaire**, pas mesure directe d’innovation historique ; C et les audiences sont fréquemment estimés. Les anonymes utilisent un contexte précis et borné, jamais toute la notoriété de leur civilisation.

### Résultats initiaux

Toutes les **1 000 propositions restent provisoires**, avec une confiance moyenne de **56,6 %** (indice heuristique, pas probabilité d’exactitude). Répartition : **161 Esquisse, 741 Étude, 94 Composition, 2 Œuvre, 2 Pièce maîtresse**. Ces chiffres ne constituent pas une cible et n’impliquent aucune activation. Des œuvres peuvent avoir le même score faute d’indicateurs discriminants : la revue humaine est précisément nécessaire pour étudier ces limites.

## Reproduire

```sh
# Reconstituer la sélection depuis les captures existantes, sans réseau
npm run review:collect

# Collecte autorisée avec cache et délais ; ne change pas les captures réussies
npm run review:collect -- --live

# Recalculer le catalogue de consultation hors réseau
npm run review:build

# Tests du projet et vérification de l’ancienne simulation
npm test
npm run rarity:v2:verify
npm run build
```

`manifest.json` contient version du lot, méthode, empreintes de sélection/configuration/résultats historiques, preuves et fichiers d’implémentation, puis empreinte du JSON public. Le calcul est déterministe sur les captures figées. `runs/<version>/catalog.json` et `manifest.json` conservent les versions produites sans écrasement divergent ; `public/review-data/catalog.json` est la copie courante. Une version différente exige une sauvegarde compatible : ne pas réécrire un export pour contourner ce contrôle.

## Fichiers

Entrée et rendu : `review.html`, `src/review/main.tsx`, `ReviewApp.tsx`, `review.css`. Contrats et logique : `src/review/types.ts`, `model.ts`. Tests : `src/review.test.ts`. Collecte, adaptation et calcul : `scripts/review/collect.ts`, `records.ts`, `build.ts`. Sources et résultats : `catalog/review-1000/`, `public/review-data/catalog.json`. Configuration de build : `vite.config.ts` ; commandes : `package.json`. Contrat de surface : `.impeccable/review-workspace.md` ; plan : `execplan/atelier-mille-oeuvres.md`.

Le moteur V2, ses archives, les 100 données actives, les tirages, acquisitions et le marché restent protégés. **Aucun outil de migration n’est fourni.**
