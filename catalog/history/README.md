# Archives de code et chemins historiques

Les catalogues, scores, preuves et versions publiques ne sont pas régénérés par le tri du 30 octobre 2026.

`layout-2026-10-30.json` associe les anciens chemins des rapports et entrées à leur emplacement rangé. Les fichiers déplacés restent identiques octet pour octet. Les clés des anciens manifestes restent donc inchangées : elles sont des références historiques, pas des chemins à remplacer dans toutes les preuves.

`pre-cleanup/` conserve les dix fichiers source qui ont dû être adaptés ou retirés pendant ce rangement, dans leur état exact au commit indiqué. Ce répertoire est une archive, **pas un deuxième jeu de scripts à exécuter**. Les trois anciennes entrées de validation y restent uniquement pour vérifier leurs empreintes ; les entrées actives sont à la racine et dans `src/`.

`scripts/project-files.ts` résout les déplacements pour les outils maintenus. `readHistoricalFile` exige l'empreinte originale : il vérifie le fichier courant ou une source explicitement archivée. Une donnée ou une archive altérée reste refusée ; aucune empreinte attendue n'est recalculée pour faire passer le nettoyage.

Ne pas ajouter une archive de remplacement pour masquer un résultat éditorial modifié. Une nouvelle collecte, un nouveau calcul ou une correction métier doit être versionné séparément. Les sources actives sont contrôlées par les tests fonctionnels et le typage ; les anciennes sources servent à vérifier l'histoire du calcul, pas à interdire toute maintenance du code.

## Publication explicitement autorisée ensuite

`game-publication-2026-10-30.json` et `pre-game-publication/` conservent les sources historiques de `src/data.ts` et du contrôle V2 avant la migration demandée vers les cartes et raretés humaines. Le socle, les probabilités et les anciens résultats ne sont pas remplacés. Le contrôle des preuves accepte uniquement ces archives explicitement déclarées et leurs empreintes originales ; la livraison active possède son propre audit métier et juridique. Voir [la publication des cartes](../../docs/PUBLICATION_CARTES_2026-10-30.md).
