# MUSE Rarity Engine 2.0.0 — simulation

Exécution **02b68c195210ea3536d84c1a**, configuration **2.0.0-draft.1**. Aucune migration, aucun changement de rareté active, prix, inventaire ou taux de pochette.

## Résumé

- Œuvres analysées : **100** ; propositions : **100** ; refus explicites : **0**.
- Classements : **0 confirmed**, **100 provisional**. Confirmed qualifie la robustesse de la simulation, jamais une autorisation de publication.
- Changements proposés par rapport aux niveaux actifs : **47** ; niveaux stables dans les scénarios : **87**.
- Confiance moyenne : **61,2 %**. Faible (<50 %) 14, intermédiaire (50–75 %) 82, élevée (≥75 %) 4. Ce sont des indices heuristiques, pas probabilités d’exactitude.
- Candidatures Pièce maîtresse à relire : **45434, mona-lisa**.

## Répartition et couverture

| Rareté | Active (V1) | Proposition V2 |
|---|---:|---:|
| Esquisse | 43 | 16 |
| Étude | 39 | 62 |
| Composition | 14 | 18 |
| Œuvre | 3 | 2 |
| Pièce maîtresse | 1 | 2 |

| Critère | Observé | Dérivé | Estimé | Part d’entrées observées pondérée dans le critère |
|---|---:|---:|---:|---:|
| P | 0 | 9 | 91 | 10,5 % |
| A | 0 | 43 | 57 | 43,8 % |
| H | 0 | 75 | 25 | 48,7 % |
| M | 0 | 80 | 20 | 89,0 % |
| C | 0 | 1 | 99 | 0,7 % |

Tous les critères ont une proposition, mais cela ne constitue pas 100 % de couverture observée. Les audiences normalisées sont dérivées de compteurs observés ; les appréciations éditoriales et imputations restent estimées.

## Sources réellement exploitées

| Fournisseur | État | Usage / limite |
|---|---|---|
| met | used_archived_api | Identifiants exacts ; captures existantes réutilisées, pas fraîcheur prétendue. |
| cma | used_archived_api | Notices, bibliographies et expositions structurées. |
| wikidata | used_archived_api | Identités exactes et créateurs depuis les preuves existantes. |
| pageviews | used_archived_api | Douze mois complets ou mois partiels explicitement estimés par le moteur. |
| wikipedia | used_verification_api | Vérification des pages de l’objet par wikibase_item ; aucun transfert depuis une série. |
| smithsonian | auth_missing | Connecteur disponible ; aucun objet lié à un identifiant Smithsonian dans ces cent cibles, aucune recherche homonyme adoptée. |
| europeana | auth_missing | Connecteur disponible ; clé et identité précise nécessaires avant exploitation de données. |
| google-trends | not_integrated | Aucune intégration authentifiée et comparable disponible ; aucune donnée supposée. |

Les captures réutilisées gardent leur date originale. Les notices d’institution, identités et mesures mensuelles sont liées à leurs fichiers/empreintes dans les résultats et le manifeste. Les sources répétées ou miroirs d’une institution ne multiplient pas la confiance.

## Méthode et limites

**S = 0,25P + 0,20A + 0,25H + 0,20M + 0,10C** ; seuils 40/60/75/90. Poids, distributions, normalisation et confirmation sont configurables/versionnés. Les poids ne sont jamais renormalisés sur les seules données disponibles.

Courbe exploratoire fixe et graduelle, sans saturation à 1000 vues/jour ni percentile sur les 100 cibles. Échelles par catégorie neutres faute de référentiel indépendant ; le moteur accepte un référentiel figé et contrôlé. Ces points sont une politique provisoire, pas des quantiles mesurés.

Perspectives globales et catégorielles présentes dans chaque résultat. Ici aucun référentiel externe représentatif n’est fourni : les échelles par catégorie sont neutres, donc aucun rang catégoriel empirique n’est prétendu. Une variante de poids patrimoine et deux variantes de courbe testent néanmoins la stabilité.

Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation.

H est un indice documentaire issu des références spécifiques, pas une mesure directe d’influence historique. M combine des familles distinctes de reconnaissance ; une simple notice donne 30, jamais 100. Absence de liste signifie couverture inconnue et intervalle élargi, pas zéro exposition prouvé. C n’est pas déduit d’un nombre de pages ou citations.

Pour les objets sans bibliographie structurée, l’absence d’exposition/publication n’est pas supposée : les composantes imputées de M et leur incertitude sont explicites. Les priors sont des distributions éditoriales initiales non apprises ; ils empêchent un blocage tout en abaissant la confiance. Les comparables viennent de notes non imputées de catégorie/époque proche, sont rétractés vers ces distributions, exposent leurs identifiants et excluent l’objet lui-même. Ils ne constituent pas un référentiel mondial. Les tableaux riches de Cleveland peuvent favoriser leurs indices documentaires : une comparaison inter-institutions exige une revue.

L’indice H documentaire n’est pas une mesure de l’innovation ou de l’influence réelle. Une grande bibliographie ne suffit pas à confirmer un classement. C n’est pas déduit des backlinks ou d’une quantité de pages. L’audience commerciale de maisons créatrices est signalée. A contextualisé n’importe aucune popularité entière d’une civilisation ou d’un sujet représenté. Aucune popularité de série n’est transférée ; seule l’exception de composition identique déjà revue de La Grande Vague est conservée.

Les bornes sont des **plages de plausibilité conditionnelles**, sommées avec les mêmes poids, sans hypothèse d’indépendance ; elles ne sont pas des intervalles de confiance statistiques. La confiance combine couverture, qualité, identité, part observée, largeur des plages et cohérence. Les estimations majoritaires la plafonnent ; une plage qui traverse un seuil ou un classement instable impose provisional.

## Comparaison des cent œuvres

| ID | Œuvre | Actif → V2 | Score proposé | Plage | Confiance | Statut | Critères estimés |
|---|---|---|---:|---:|---:|---|---|
| 437654 | Parade de cirque | Esquisse → Composition | 72,6 | 59,6–81,1 | 70,6 % | provisional | H, M, C |
| 436105 | La Mort de Socrate | Étude → Œuvre | 80,2 | 67,2–88,7 | 70,6 % | provisional | H, M, C |
| 436535 | Champ de blé avec cyprès | Composition → Composition | 64,0 | 31,2–89,1 | 55,0 % | provisional | P, H, M, C |
| 45434 | La Grande Vague de Kanagawa | Œuvre → Pièce maîtresse | 95,1 | 80,1–98,7 | 70,6 % | provisional | H, M, C |
| mona-lisa | La Joconde | Pièce maîtresse → Pièce maîtresse | 98,7 | 84,5–100,0 | 71,2 % | provisional | H, M, C |
| 544453 | Tête d’Aménophis Ier | Esquisse → Étude | 48,2 | 15,4–81,5 | 44,9 % | provisional | P, A, H, M, C |
| 544184 | Visage de Sésostris III | Esquisse → Étude | 48,2 | 15,4–81,5 | 44,9 % | provisional | P, A, H, M, C |
| 544450 | Hatchepsout assise | Étude → Étude | 48,2 | 15,4–81,5 | 44,9 % | provisional | P, A, H, M, C |
| 544442 | Sphinx d’Hatchepsout | Composition → Étude | 48,2 | 15,4–81,5 | 44,9 % | provisional | P, A, H, M, C |
| 544227 | L’Hippopotame « William » | Composition → Composition | 62,6 | 40,6–79,0 | 53,4 % | provisional | P, A, H, M, C |
| 820892 | Vase aux motifs naturalistes | Esquisse → Étude | 51,1 | 21,8–80,3 | 54,2 % | provisional | P, H, M, C |
| 20804 | Vase en argent | Étude → Étude | 43,6 | 10,1–76,5 | 43,9 % | provisional | P, A, H, M, C |
| 35 | Le Vase Adams | Étude → Étude | 43,6 | 10,1–76,5 | 43,9 % | provisional | P, A, H, M, C |
| 9480 | Vase en verre Favrile | Composition → Étude | 54,7 | 26,3–81,9 | 55,0 % | provisional | P, H, M, C |
| 1085 | Cabinet aux incrustations | Esquisse → Étude | 43,6 | 10,1–76,5 | 42,9 % | provisional | P, A, H, M, C |
| 544864 | La Déesse hippopotame | Esquisse → Étude | 48,5 | 9,6–86,6 | 42,1 % | provisional | P, A, H, M, C |
| 250945 | Persée et Andromède | Étude → Étude | 53,8 | 15,4–84,8 | 44,4 % | provisional | P, A, H, M, C |
| 204759 | Tête de Méduse | Étude → Étude | 42,6 | 10,1–76,8 | 43,4 % | provisional | P, A, H, M, C |
| 204758 | Persée tenant la tête de Méduse | Composition → Étude | 53,1 | 25,4–80,7 | 55,0 % | provisional | P, H, M, C |
| 467642 | La Licorne captive | Œuvre → Étude | 51,0 | 20,3–81,1 | 55,0 % | provisional | A, H, M, C |
| cma-127571 | Portrait d’un homme, peut-être Girolamo Rosati | Étude → Composition | 63,1 | 40,9–84,4 | 70,1 % | provisional | P, C |
| cma-113202 | La Sainte Famille avec saint Jean-Baptiste et sainte Marguerite | Étude → Composition | 66,0 | 43,6–85,5 | 70,4 % | provisional | P, C |
| cma-127572 | L’Annonciation | Étude → Étude | 55,6 | 27,9–83,8 | 58,6 % | provisional | P, A, C |
| cma-118679 | Lazare et le mauvais riche | Esquisse → Étude | 58,8 | 37,6–79,5 | 70,4 % | provisional | P, C |
| cma-117032 | Le Sacrifice d’Isaac | Étude → Composition | 66,2 | 43,9–85,2 | 70,5 % | provisional | P, C |
| cma-144966 | La Vierge à l’Enfant avec le jeune saint Jean-Baptiste | Composition → Étude | 48,6 | 27,7–69,0 | 73,2 % | provisional | A, C |
| cma-157501 | Garçon buvant | Étude → Étude | 57,8 | 36,5–80,6 | 70,1 % | provisional | P, C |
| cma-132367 | La Vierge à l’Enfant sur un trône | Esquisse → Étude | 42,0 | 20,8–66,0 | 69,9 % | provisional | P, C |
| cma-97165 | La Course du Palio dans les rues de Florence | Esquisse → Étude | 41,4 | 20,2–65,4 | 69,9 % | provisional | P, C |
| cma-97166 | La Vierge à l’Enfant avec des anges | Esquisse → Étude | 55,5 | 26,2–84,9 | 57,8 % | provisional | P, A, C |
| cma-127746 | Le Baptême du Christ | Étude → Étude | 57,0 | 27,7–85,4 | 58,0 % | provisional | P, A, C |
| cma-124076 | Le Couronnement de la Vierge | Étude → Étude | 53,9 | 32,1–76,6 | 70,0 % | provisional | P, C |
| cma-146469 | Portrait d’une femme | Étude → Étude | 48,6 | 27,3–71,4 | 70,0 % | provisional | P, C |
| cma-129219 | Saint Nicolas de Bari | Étude → Étude | 49,7 | 28,4–72,8 | 70,0 % | provisional | P, C |
| cma-136510 | Nymphéas (Agapanthes) | Œuvre → Œuvre | 75,6 | 51,6–93,9 | 70,3 % | provisional | P, C |
| cma-125249 | Les Grands Platanes, cantonniers à Saint-Rémy | Composition → Composition | 72,1 | 57,6–82,7 | 80,0 % | provisional | C |
| cma-122351 | L’Incendie du Parlement de Londres, le 16 octobre 1834 | Composition → Composition | 74,3 | 50,5–92,6 | 70,3 % | provisional | P, C |
| cma-147017 | L’Étang de Branch Hill à Hampstead | Étude → Étude | 53,0 | 31,2–75,8 | 70,0 % | provisional | P, C |
| cma-135185 | La Montagne Sainte-Victoire | Composition → Composition | 74,4 | 50,6–92,8 | 70,3 % | provisional | P, C |
| cma-121188 | Romaine Lacaux | Étude → Composition | 67,5 | 49,7–83,3 | 75,5 % | provisional | P, C |
| cma-149410 | Dans les vagues | Étude → Composition | 62,5 | 40,1–85,2 | 69,9 % | provisional | P, C |
| cma-128392 | Lisière du bois près de l’Hermitage, Pontoise | Étude → Composition | 65,8 | 43,8–86,6 | 70,2 % | provisional | P, C |
| cma-143278 | Composition avec rouge, jaune et bleu | Composition → Composition | 61,6 | 39,4–84,4 | 69,9 % | provisional | P, C |
| cma-135336 | Berthe Morisot au manchon | Étude → Composition | 68,4 | 46,2–88,1 | 70,4 % | provisional | P, C |
| cma-128072 | La Lecture | Étude → Composition | 66,9 | 45,0–86,7 | 70,4 % | provisional | P, C |
| cma-151015 | Intérieur | Esquisse → Étude | 45,5 | 24,2–68,2 | 70,1 % | provisional | P, C |
| cma-149421 | La Ferme à l’entrée du bois | Esquisse → Étude | 53,0 | 31,2–75,8 | 70,0 % | provisional | P, C |
| cma-135517 | Le Cirque | Esquisse → Étude | 45,2 | 18,0–74,6 | 57,7 % | provisional | P, A, C |
| cma-125104 | Frise de danseuses | Composition → Composition | 66,2 | 44,0–87,9 | 70,1 % | provisional | P, C |
| cma-126769 | Combat d’un tigre et d’un buffle | Composition → Étude | 57,8 | 43,3–73,8 | 80,0 % | provisional | C |
| cma-95259 | Cavaliers grecs se reposant dans une forêt | Étude → Étude | 57,7 | 35,5–80,4 | 69,9 % | provisional | P, C |
| cma-136760 | Saint-Mammès, canal du Loing | Étude → Étude | 50,2 | 28,7–72,9 | 70,0 % | provisional | P, C |
| cma-87891 | Strandgade, lumière du soleil | Étude → Étude | 45,6 | 13,8–73,3 | 57,1 % | provisional | P, A, C |
| cma-142792 | Lutteurs dans un cirque | Étude → Composition | 61,2 | 38,3–83,9 | 69,8 % | provisional | P, C |
| cma-169684 | Portrait de Jean-Baptiste Lemoyne le Jeune | Esquisse → Étude | 43,5 | 21,6–66,2 | 70,0 % | provisional | P, C |
| cma-93984 | Cercueil de Bakenmout | Étude → Étude | 59,7 | 29,8–87,8 | 58,5 % | provisional | P, A, C |
| cma-147518 | Amulette de Bastet | Esquisse → Étude | 44,7 | 17,4–74,1 | 57,7 % | provisional | P, A, C |
| cma-151352 | Miroir à manche en forme de jeune femme | Esquisse → Étude | 46,5 | 18,5–75,9 | 58,0 % | provisional | P, A, C |
| cma-149884 | Amulette en forme de grenouille | Esquisse → Esquisse | 39,3 | 12,0–68,7 | 57,7 % | provisional | P, A, C |
| cma-94136 | Boîte à couleurs du vizir Amenemopé | Esquisse → Étude | 47,8 | 20,0–74,7 | 61,8 % | provisional | P, A |
| cma-540823 | Uræus, cobra dressé | Esquisse → Étude | 41,0 | 13,8–70,4 | 57,7 % | provisional | P, A, C |
| cma-144280 | Le Taureau Apis | Étude → Étude | 46,4 | 18,4–75,8 | 58,0 % | provisional | P, A, C |
| cma-155759 | Jeune porteuse de jarre | Esquisse → Esquisse | 39,9 | 12,6–69,3 | 57,7 % | provisional | P, A, C |
| cma-126198 | Statue de Minnefer en marche | Esquisse → Étude | 43,2 | 15,9–72,6 | 57,7 % | provisional | P, A, C |
| cma-96303 | Tête de Sekhmet | Étude → Étude | 44,2 | 16,9–73,6 | 57,7 % | provisional | P, A, C |
| cma-157614 | Pot à cosmétiques en forme de Bès | Esquisse → Étude | 47,4 | 19,1–75,5 | 58,7 % | provisional | P, A, C |
| cma-102377 | Vase canope à tête de chacal | Esquisse → Esquisse | 38,5 | 11,3–67,9 | 57,7 % | provisional | P, A, C |
| cma-148794 | Talatat avec portrait de Néfertiti | Étude → Étude | 46,5 | 18,5–75,9 | 58,0 % | provisional | P, A, C |
| cma-94073 | Appui-tête d’Irout | Esquisse → Esquisse | 39,9 | 12,6–69,3 | 57,7 % | provisional | P, A, C |
| cma-102388 | Livre des morts d’Hori | Étude → Étude | 43,4 | 16,2–72,8 | 57,7 % | provisional | P, A, C |
| cma-142734 | Brin de muguet | Étude → Étude | 50,3 | 26,6–75,1 | 68,5 % | provisional | P, C |
| cma-165186 | Vase Grenouilles et Nénuphars | Étude → Étude | 54,3 | 31,6–77,0 | 69,8 % | provisional | P, C |
| cma-150156 | Service à thé et à café | Esquisse → Étude | 50,9 | 22,6–79,3 | 58,2 % | provisional | P, A, C |
| cma-296869 | Lampadaire aux pivoines, pied bambou | Étude → Étude | 40,2 | 9,4–72,5 | 49,4 % | provisional | P, A, H, C |
| cma-150488 | Peigne au muguet | Esquisse → Étude | 46,9 | 25,7–69,7 | 70,1 % | provisional | P, C |
| cma-152818 | Plat mural aux deux oiseaux | Esquisse → Esquisse | 33,0 | 8,1–59,9 | 55,0 % | provisional | P, H, C |
| cma-160089 | Écran de cheminée | Esquisse → Étude | 50,2 | 21,7–77,3 | 58,9 % | provisional | P, A, C |
| cma-151884 | Cabinet aux incrustations et parchemins peints | Esquisse → Étude | 41,0 | 19,8–64,3 | 70,0 % | provisional | P, C |
| cma-93173 | Encrier aux pavots | Esquisse → Esquisse | 39,3 | 12,0–68,7 | 57,7 % | provisional | P, A, C |
| cma-140001 | Œuf impérial de la Croix-Rouge | Composition → Étude | 47,5 | 29,4–67,2 | 77,9 % | provisional | A, C |
| cma-153683 | Hercule | Étude → Étude | 44,2 | 16,9–73,6 | 57,7 % | provisional | P, A, C |
| cma-399499 | Antéfixe à tête de Gorgone | Esquisse → Étude | 41,0 | 13,8–70,4 | 57,7 % | provisional | P, A, C |
| cma-111811 | Nataraja, Shiva seigneur de la danse | Composition → Composition | 63,8 | 33,9–90,5 | 58,7 % | provisional | P, A, C |
| cma-137128 | Ganesha dansant | Étude → Étude | 44,3 | 16,3–73,7 | 58,0 % | provisional | P, A, C |
| cma-135431 | Dragon | Étude → Étude | 45,8 | 24,5–69,7 | 69,9 % | provisional | P, C |
| cma-137023 | Vishnou sur Garuda | Étude → Étude | 44,2 | 16,9–73,6 | 57,7 % | provisional | P, A, C |
| cma-150996 | Durga terrassant le démon-buffle | Étude → Esquisse | 37,1 | 9,8–66,5 | 57,7 % | provisional | P, A, C |
| cma-169251 | Atlas-Hercule ailé | Esquisse → Esquisse | 37,3 | 10,0–66,7 | 57,7 % | provisional | P, A, C |
| cma-105933 | La Reine Méduse et sa cour | Esquisse → Étude | 49,5 | 20,2–78,9 | 57,8 % | provisional | P, A, C |
| cma-153401 | Jarre au dragon | Étude → Étude | 55,6 | 22,5–86,5 | 57,6 % | provisional | P, A, C |
| cma-130939 | Amulette à figure assise et tête bovine | Esquisse → Étude | 56,8 | 26,9–84,9 | 57,5 % | provisional | P, A, C |
| cma-165426 | Urne en forme d’oiseau | Esquisse → Esquisse | 35,8 | 8,5–65,2 | 57,7 % | provisional | P, A, C |
| cma-161637 | Figurine de Vinča | Esquisse → Esquisse | 38,3 | 8,1–71,3 | 49,8 % | provisional | P, A, H, C |
| cma-163505 | Jarre aux spirales | Esquisse → Esquisse | 39,8 | 12,6–69,2 | 57,7 % | provisional | P, A, C |
| cma-98298 | Disque cérémoniel bi | Esquisse → Étude | 40,6 | 13,3–70,0 | 57,7 % | provisional | P, A, C |
| cma-156131 | Hache-disque cérémonielle yue | Esquisse → Esquisse | 37,1 | 9,8–66,5 | 57,7 % | provisional | P, A, C |
| cma-284749 | Urne aux motifs triangulaires | Esquisse → Esquisse | 38,3 | 8,1–71,3 | 49,8 % | provisional | P, A, H, C |
| cma-151445 | Jarre peinte de Ban Chiang | Esquisse → Esquisse | 37,1 | 9,8–66,5 | 57,7 % | provisional | P, A, C |
| cma-106757 | Hachette en silex | Esquisse → Esquisse | 38,3 | 8,1–71,3 | 49,8 % | provisional | P, A, H, C |
| cma-151450 | Coupe sur pied de Ban Chiang | Esquisse → Esquisse | 37,1 | 9,8–66,5 | 57,7 % | provisional | P, A, C |

## Changements qui demanderaient une validation explicite

- **Parade de cirque** (437654) : Esquisse → Composition ; provisional, confiance 70,6 %.
- **La Mort de Socrate** (436105) : Étude → Œuvre ; provisional, confiance 70,6 %.
- **La Grande Vague de Kanagawa** (45434) : Œuvre → Pièce maîtresse ; provisional, confiance 70,6 %.
- **Tête d’Aménophis Ier** (544453) : Esquisse → Étude ; provisional, confiance 44,9 %.
- **Visage de Sésostris III** (544184) : Esquisse → Étude ; provisional, confiance 44,9 %.
- **Sphinx d’Hatchepsout** (544442) : Composition → Étude ; provisional, confiance 44,9 %.
- **Vase aux motifs naturalistes** (820892) : Esquisse → Étude ; provisional, confiance 54,2 %.
- **Vase en verre Favrile** (9480) : Composition → Étude ; provisional, confiance 55,0 %.
- **Cabinet aux incrustations** (1085) : Esquisse → Étude ; provisional, confiance 42,9 %.
- **La Déesse hippopotame** (544864) : Esquisse → Étude ; provisional, confiance 42,1 %.
- **Persée tenant la tête de Méduse** (204758) : Composition → Étude ; provisional, confiance 55,0 %.
- **La Licorne captive** (467642) : Œuvre → Étude ; provisional, confiance 55,0 %.
- **Portrait d’un homme, peut-être Girolamo Rosati** (cma-127571) : Étude → Composition ; provisional, confiance 70,1 %.
- **La Sainte Famille avec saint Jean-Baptiste et sainte Marguerite** (cma-113202) : Étude → Composition ; provisional, confiance 70,4 %.
- **Lazare et le mauvais riche** (cma-118679) : Esquisse → Étude ; provisional, confiance 70,4 %.
- **Le Sacrifice d’Isaac** (cma-117032) : Étude → Composition ; provisional, confiance 70,5 %.
- **La Vierge à l’Enfant avec le jeune saint Jean-Baptiste** (cma-144966) : Composition → Étude ; provisional, confiance 73,2 %.
- **La Vierge à l’Enfant sur un trône** (cma-132367) : Esquisse → Étude ; provisional, confiance 69,9 %.
- **La Course du Palio dans les rues de Florence** (cma-97165) : Esquisse → Étude ; provisional, confiance 69,9 %.
- **La Vierge à l’Enfant avec des anges** (cma-97166) : Esquisse → Étude ; provisional, confiance 57,8 %.
- **Romaine Lacaux** (cma-121188) : Étude → Composition ; provisional, confiance 75,5 %.
- **Dans les vagues** (cma-149410) : Étude → Composition ; provisional, confiance 69,9 %.
- **Lisière du bois près de l’Hermitage, Pontoise** (cma-128392) : Étude → Composition ; provisional, confiance 70,2 %.
- **Berthe Morisot au manchon** (cma-135336) : Étude → Composition ; provisional, confiance 70,4 %.
- **La Lecture** (cma-128072) : Étude → Composition ; provisional, confiance 70,4 %.
- **Intérieur** (cma-151015) : Esquisse → Étude ; provisional, confiance 70,1 %.
- **La Ferme à l’entrée du bois** (cma-149421) : Esquisse → Étude ; provisional, confiance 70,0 %.
- **Le Cirque** (cma-135517) : Esquisse → Étude ; provisional, confiance 57,7 %.
- **Combat d’un tigre et d’un buffle** (cma-126769) : Composition → Étude ; provisional, confiance 80,0 %.
- **Lutteurs dans un cirque** (cma-142792) : Étude → Composition ; provisional, confiance 69,8 %.
- **Portrait de Jean-Baptiste Lemoyne le Jeune** (cma-169684) : Esquisse → Étude ; provisional, confiance 70,0 %.
- **Amulette de Bastet** (cma-147518) : Esquisse → Étude ; provisional, confiance 57,7 %.
- **Miroir à manche en forme de jeune femme** (cma-151352) : Esquisse → Étude ; provisional, confiance 58,0 %.
- **Boîte à couleurs du vizir Amenemopé** (cma-94136) : Esquisse → Étude ; provisional, confiance 61,8 %.
- **Uræus, cobra dressé** (cma-540823) : Esquisse → Étude ; provisional, confiance 57,7 %.
- **Statue de Minnefer en marche** (cma-126198) : Esquisse → Étude ; provisional, confiance 57,7 %.
- **Pot à cosmétiques en forme de Bès** (cma-157614) : Esquisse → Étude ; provisional, confiance 58,7 %.
- **Service à thé et à café** (cma-150156) : Esquisse → Étude ; provisional, confiance 58,2 %.
- **Peigne au muguet** (cma-150488) : Esquisse → Étude ; provisional, confiance 70,1 %.
- **Écran de cheminée** (cma-160089) : Esquisse → Étude ; provisional, confiance 58,9 %.
- **Cabinet aux incrustations et parchemins peints** (cma-151884) : Esquisse → Étude ; provisional, confiance 70,0 %.
- **Œuf impérial de la Croix-Rouge** (cma-140001) : Composition → Étude ; provisional, confiance 77,9 %.
- **Antéfixe à tête de Gorgone** (cma-399499) : Esquisse → Étude ; provisional, confiance 57,7 %.
- **Durga terrassant le démon-buffle** (cma-150996) : Étude → Esquisse ; provisional, confiance 57,7 %.
- **La Reine Méduse et sa cour** (cma-105933) : Esquisse → Étude ; provisional, confiance 57,8 %.
- **Amulette à figure assise et tête bovine** (cma-130939) : Esquisse → Étude ; provisional, confiance 57,5 %.
- **Disque cérémoniel bi** (cma-98298) : Esquisse → Étude ; provisional, confiance 57,7 %.

## Cas étudiés

### La Joconde

Pièce maîtresse → **Pièce maîtresse**, score proposé 98,7, plage 84,5–100,0, confiance 71,2 %, **provisional**. Ancien essai : 100,0.

Identité : Identité éditoriale explicite Louvre/La Joconde et correspondance Wikidata conservée. Auteur/contexte : identified — Italie.

- **P 96,9 · derived** — normalized-human-pageviews. Vues humaines des pages précisément identifiées, pas nombre de personnes reconnaissant l’œuvre. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q12418.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/La_Joconde/monthly/2025100100/2026093000> ; <https://fr.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CLa+Mort+de+Socrate+%28David%29%7CLa+Grande+Vague+de+Kanagawa%7CLa+Joconde%7CWilliam+l%27hippopotame+en+fa%C3%AFence%7CLa+Vierge+et+l%27Enfant+avec+le+petit+saint+Jean-Baptiste%7CRomaine+Lacaux%7CCombat+de+tigre+et+de+buffle> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Mona_Lisa/monthly/2025100100/2026093000> ; <https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CThe+Death+of+Socrates%7CThe+Great+Wave+off+Kanagawa%7CMona+Lisa%7CWilliam+%28hippopotamus+figurine%29%7CThe+Unicorn+in+Captivity%7CVirgin+and+Child+with+the+Infant+John+the+Baptist+%28Botticelli%2C+Cleveland%29%7CThe+Large+Plane+Trees%7CRed+Cross+with+Triptych+%28Faberg%C3%A9+egg%29>.
- **A 97,5 · derived** — identified-creator-audience-mean. Audience du créateur, distincte de celle de l’objet ; aucune transmission à P sans atténuation explicite. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q762.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/L%C3%A9onard_de_Vinci/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Leonardo_da_Vinci/monthly/2025100100/2026093000>.
- **H 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Œuvre de référence de Léonard, place historique et réception exceptionnelle documentées par le Louvre ; appréciation éditoriale maximale, non mesure d’audience. Sources : <https://collections.louvre.fr/ark:/53355/cl010062370>.
- **M 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Présentation centrale au Louvre et médiation spécifiquement consacrée à l’œuvre ; le musée la décrit comme le tableau le plus célèbre du monde. Sources : <https://www.louvre.fr/decouvrir/le-palais/de-la-joconde-aux-noces-de-cana>.
- **C 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Le Louvre documente une célébrité mondiale et une réception faite de copies, détournements et appropriations ; palier éditorial exceptionnel. Sources : <https://collections.louvre.fr/ark:/53355/cl010062370> ; <https://www.louvre.fr/decouvrir/vie-du-musee/la-joconde-exposition-immersive>.

Sensibilité : audience-scale-0.5 100,0 (Pièce maîtresse) ; audience-scale-1 98,7 (Pièce maîtresse) ; audience-scale-2 96,7 (Pièce maîtresse) ; weights-internet 98,5 (Pièce maîtresse) ; weights-heritage 99,0 (Pièce maîtresse).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; intervalle traversant plusieurs raretés ; désaccord entre indices à relire ; candidature Pièce maîtresse : validation humaine requise

### La Grande Vague de Kanagawa

Œuvre → **Pièce maîtresse**, score proposé 95,1, plage 80,1–98,7, confiance 70,6 %, **provisional**. Ancien essai : 100,0.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Exception d’estampe revue : impression du Met Q28912605 et composition identique Q252485, pas audience d’une série. Auteur/contexte : identified — Japan ; Edo period (1615–1868).

- **P 91,3 · derived** — normalized-human-pageviews. Vues humaines des pages précisément identifiées, pas nombre de personnes reconnaissant l’œuvre. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q252485.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/La_Grande_Vague_de_Kanagawa/monthly/2025100100/2026093000> ; <https://fr.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CLa+Mort+de+Socrate+%28David%29%7CLa+Grande+Vague+de+Kanagawa%7CLa+Joconde%7CWilliam+l%27hippopotame+en+fa%C3%AFence%7CLa+Vierge+et+l%27Enfant+avec+le+petit+saint+Jean-Baptiste%7CRomaine+Lacaux%7CCombat+de+tigre+et+de+buffle> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/The_Great_Wave_off_Kanagawa/monthly/2025100100/2026093000> ; <https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CThe+Death+of+Socrates%7CThe+Great+Wave+off+Kanagawa%7CMona+Lisa%7CWilliam+%28hippopotamus+figurine%29%7CThe+Unicorn+in+Captivity%7CVirgin+and+Child+with+the+Infant+John+the+Baptist+%28Botticelli%2C+Cleveland%29%7CThe+Large+Plane+Trees%7CRed+Cross+with+Triptych+%28Faberg%C3%A9+egg%29>.
- **A 86,2 · derived** — identified-creator-audience-mean. Audience du créateur, distincte de celle de l’objet ; aucune transmission à P sans atténuation explicite. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q5586.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Hokusai/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Hokusai/monthly/2025100100/2026093000>.
- **H 100,0 · estimated** — sourced-unvalidated-editorial-assessment. L’essai du Met décrit une icône mondiale de l’art japonais et son histoire matérielle ; la note porte sur la composition gravée, pas la rareté d’un tirage physique. Sources : <https://www.metmuseum.org/essays/hokusai-great-wave> ; <https://www.metmuseum.org/art/collection/search/45434>.
- **M 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Essai de recherche dédié au Met et ressource pédagogique Smarthistory consacrée à la même composition, conservée et étudiée dans plusieurs institutions. Sources : <https://www.metmuseum.org/essays/hokusai-great-wave> ; <https://smarthistory.org/hokusai-under-the-wave-off-kanagawa-the-great-wave/>.
- **C 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Le Met documente son statut d’icône en Orient comme en Occident ; un exemple indépendant de reprise commerciale est l’hommage explicite de Bösendorfer. Palier exceptionnel proposé, non compteur exhaustif de références. Sources : <https://www.metmuseum.org/essays/hokusai-great-wave> ; <https://www.boesendorfer.com/en/pianos/collectors-item/the-great-wave-off-kanagawa>.

Sensibilité : audience-scale-0.5 97,1 (Pièce maîtresse) ; audience-scale-1 95,1 (Pièce maîtresse) ; audience-scale-2 92,6 (Pièce maîtresse) ; weights-internet 93,9 (Pièce maîtresse) ; weights-heritage 96,2 (Pièce maîtresse).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; intervalle traversant plusieurs raretés ; désaccord entre indices à relire ; candidature Pièce maîtresse : validation humaine requise

### La Mort de Socrate

Étude → **Œuvre**, score proposé 80,2, plage 67,2–88,7, confiance 70,6 %, **provisional**. Ancien essai : 86,9.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : identified — France.

- **P 77,3 · derived** — normalized-human-pageviews. Vues humaines des pages précisément identifiées, pas nombre de personnes reconnaissant l’œuvre. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q1752990.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/La_Mort_de_Socrate_%28David%29/monthly/2025100100/2026093000> ; <https://fr.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CLa+Mort+de+Socrate+%28David%29%7CLa+Grande+Vague+de+Kanagawa%7CLa+Joconde%7CWilliam+l%27hippopotame+en+fa%C3%AFence%7CLa+Vierge+et+l%27Enfant+avec+le+petit+saint+Jean-Baptiste%7CRomaine+Lacaux%7CCombat+de+tigre+et+de+buffle> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/The_Death_of_Socrates/monthly/2025100100/2026093000> ; <https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CThe+Death+of+Socrates%7CThe+Great+Wave+off+Kanagawa%7CMona+Lisa%7CWilliam+%28hippopotamus+figurine%29%7CThe+Unicorn+in+Captivity%7CVirgin+and+Child+with+the+Infant+John+the+Baptist+%28Botticelli%2C+Cleveland%29%7CThe+Large+Plane+Trees%7CRed+Cross+with+Triptych+%28Faberg%C3%A9+egg%29>.
- **A 85,7 · derived** — identified-creator-audience-mean. Audience du créateur, distincte de celle de l’objet ; aucune transmission à P sans atténuation explicite. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q83155.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Jacques-Louis_David/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Jacques-Louis_David/monthly/2025100100/2026093000>.
- **H 75,0 · estimated** — sourced-unvalidated-editorial-assessment. Composition néoclassique majeure : le Met la qualifie de l’une des peintures les plus importantes de sa collection et lui consacre une étude des découvertes de conservation. Sources : <https://www.metmuseum.org/perspectives/the-death-of-socrates-new-discoveries>.
- **M 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Plusieurs médiations dédiées du Met et une ressource Khan Academy portent sur ce tableau précis. Palier supérieur proposé pour cette reconnaissance institutionnelle et pédagogique documentée. Sources : <https://www.metmuseum.org/perspectives/the-death-of-socrates-new-discoveries> ; <https://www.metmuseum.org/perspectives/jacques-louis-david-death-of-socrates> ; <https://www.khanacademy.org/humanities/renaissance-reformation/rococo-neoclassicism/neo-classicism/v/jacques-louis-david-the-death-of-socrates>.
- **C 50,0 · estimated** — sourced-unvalidated-editorial-assessment. Diffusion éducative publique attestée par Khan Academy et par une réponse des bibliothèques de Genève consacrée au geste du Socrate de David. Le palier établi reste une appréciation de publications accessibles, pas une mesure de reconnaissance populaire ni une note maximale. Sources : <https://www.khanacademy.org/humanities/renaissance-reformation/rococo-neoclassicism/neo-classicism/v/jacques-louis-david-the-death-of-socrates> ; <https://www.geneve.ch/themes/culture/bibliotheques/interroge/reponses/socrate-est-il-represente-index-leve-sur-la-tableau-de-jacques-louis-david>.

Sensibilité : audience-scale-0.5 83,0 (Œuvre) ; audience-scale-1 80,2 (Œuvre) ; audience-scale-2 76,9 (Œuvre) ; weights-internet 79,6 (Œuvre) ; weights-heritage 80,8 (Œuvre).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; intervalle traversant plusieurs raretés ; désaccord entre indices à relire

### Parade de cirque

Esquisse → **Composition**, score proposé 72,6, plage 59,6–81,1, confiance 70,6 %, **provisional**. Ancien essai : 75,1.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : identified — France.

- **P 49,6 · derived** — normalized-human-pageviews. Vues humaines des pages précisément identifiées, pas nombre de personnes reconnaissant l’œuvre. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q3823444.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Parade_de_cirque/monthly/2025100100/2026093000> ; <https://fr.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CLa+Mort+de+Socrate+%28David%29%7CLa+Grande+Vague+de+Kanagawa%7CLa+Joconde%7CWilliam+l%27hippopotame+en+fa%C3%AFence%7CLa+Vierge+et+l%27Enfant+avec+le+petit+saint+Jean-Baptiste%7CRomaine+Lacaux%7CCombat+de+tigre+et+de+buffle> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Parade_de_cirque/monthly/2025100100/2026093000> ; <https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CThe+Death+of+Socrates%7CThe+Great+Wave+off+Kanagawa%7CMona+Lisa%7CWilliam+%28hippopotamus+figurine%29%7CThe+Unicorn+in+Captivity%7CVirgin+and+Child+with+the+Infant+John+the+Baptist+%28Botticelli%2C+Cleveland%29%7CThe+Large+Plane+Trees%7CRed+Cross+with+Triptych+%28Faberg%C3%A9+egg%29>.
- **A 82,3 · derived** — identified-creator-audience-mean. Audience du créateur, distincte de celle de l’objet ; aucune transmission à P sans atténuation explicite. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q34013.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Georges_Seurat/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Georges_Seurat/monthly/2025100100/2026093000>.
- **H 75,0 · estimated** — sourced-unvalidated-editorial-assessment. L’une des grandes compositions de figures de Seurat, sa première scène nocturne et une démonstration de sa technique au Salon de 1888 ; importance proposée dans l’histoire du néo-impressionnisme, pas renommée universelle supposée. Sources : <https://www.metmuseum.org/art/collection/search/437654> ; <https://www.theartstory.org/artist/seurat-georges/>.
- **M 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Le tableau précis est le centre d’une exposition thématique du Met en 2017 et d’un catalogue de recherche dédié. Sources : <https://www.metmuseum.org/exhibitions/listings/2017/seurat-circus-sideshow> ; <https://www.metmuseum.org/met-publications/seurats-circus-sideshow>.
- **C 50,0 · estimated** — sourced-unvalidated-editorial-assessment. Diffusion publique attestée par une critique du New York Times consacrée à cette exposition et par une présentation généraliste The Art Story. Palier établi proposé pour publications et mentions ; pas une preuve de reconnaissance universelle. Sources : <https://www.nytimes.com/2017/02/16/arts/design/cirque-du-seurat-at-the-metropolitan-museum-of-art.html> ; <https://www.theartstory.org/artist/seurat-georges/>.

Sensibilité : audience-scale-0.5 75,6 (Œuvre) ; audience-scale-1 72,6 (Composition) ; audience-scale-2 69,2 (Composition) ; weights-internet 70,5 (Composition) ; weights-heritage 74,8 (Composition).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; classement sensible à la calibration ; intervalle traversant plusieurs raretés ; proximité d’un seuil ; désaccord entre indices à relire

### L’Hippopotame « William »

Composition → **Composition**, score proposé 62,6, plage 40,6–79,0, confiance 53,4 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : anonymous — Middle Kingdom ; Dynasty 12.

- **P 48,8 · estimated** — partial-months-median-estimate. Vues humaines des pages précisément identifiées, pas nombre de personnes reconnaissant l’œuvre. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q137836.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/William_l%27hippopotame_en_fa%C3%AFence/monthly/2025100100/2026093000> ; <https://fr.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CLa+Mort+de+Socrate+%28David%29%7CLa+Grande+Vague+de+Kanagawa%7CLa+Joconde%7CWilliam+l%27hippopotame+en+fa%C3%AFence%7CLa+Vierge+et+l%27Enfant+avec+le+petit+saint+Jean-Baptiste%7CRomaine+Lacaux%7CCombat+de+tigre+et+de+buffle> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/William_%28hippopotamus_figurine%29/monthly/2025100100/2026093000> ; <https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageprops%7Cinfo&redirects=1&titles=Parade+de+cirque%7CThe+Death+of+Socrates%7CThe+Great+Wave+off+Kanagawa%7CMona+Lisa%7CWilliam+%28hippopotamus+figurine%29%7CThe+Unicorn+in+Captivity%7CVirgin+and+Child+with+the+Infant+John+the+Baptist+%28Botticelli%2C+Cleveland%29%7CThe+Large+Plane+Trees%7CRed+Cross+with+Triptych+%28Faberg%C3%A9+egg%29>.
- **A 52,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://collectionapi.metmuseum.org/public/collection/v1/objects/544227>.
- **H 50,0 · estimated** — sourced-unvalidated-editorial-assessment. Exemple marquant de faïence funéraire du Moyen Empire ; le rôle de mascotte ne suffit pas à prouver une influence artistique historique exceptionnelle. Sources : <https://www.metmuseum.org/art/collection/search/544227>.
- **M 100,0 · estimated** — sourced-unvalidated-editorial-assessment. Mascotte du Met, dossier et présentation du centenaire dédiés à l’objet exact. Sources : <https://www.metmuseum.org/hubs/william-the-hippo-celebrating-100-years-at-the-met>.
- **C 75,0 · estimated** — sourced-unvalidated-editorial-assessment. Le Met documente l’origine du surnom dans Punch en 1931 ; des produits dérivés actuels reprennent explicitement la figurine. Diffusion attestée mais pas assimilée à celle d’une icône universelle. Sources : <https://www.metmuseum.org/press-releases/william-100-2017-news> ; <https://store.metmuseum.org/blog/where-the-toys-are-new-william-hippo-and-friends-plushes>.

Sensibilité : audience-scale-0.5 64,5 (Composition) ; audience-scale-1 62,6 (Composition) ; audience-scale-2 60,7 (Composition) ; weights-internet 60,1 (Composition) ; weights-heritage 65,1 (Composition).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; intervalle traversant plusieurs raretés ; désaccord entre indices à relire

### Nymphéas (Agapanthes)

Œuvre → **Œuvre**, score proposé 75,6, plage 51,6–93,9, confiance 70,3 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : identified — France, late 19th century-early 20th century.

- **P 51,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/136510> ; <https://www.wikidata.org/wiki/Special:EntityData/Q296.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Claude_Monet/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Claude_Monet/monthly/2025100100/2026093000>.
- **A 91,6 · derived** — identified-creator-audience-mean. Audience du créateur, distincte de celle de l’objet ; aucune transmission à P sans atténuation explicite. Sources : <https://www.wikidata.org/wiki/Special:EntityData/Q296.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Claude_Monet/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Claude_Monet/monthly/2025100100/2026093000>.
- **H 90,0 · derived** — specific-scholarly-documentation-proxy. Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence. Sources : <https://openaccess-api.clevelandart.org/api/artworks/136510>.
- **M 95,0 · derived** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://openaccess-api.clevelandart.org/api/artworks/136510>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/136510>.

Sensibilité : audience-scale-0.5 76,5 (Œuvre) ; audience-scale-1 75,6 (Œuvre) ; audience-scale-2 74,5 (Composition) ; weights-internet 73,5 (Composition) ; weights-heritage 77,7 (Œuvre).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; classement sensible à la calibration ; intervalle traversant plusieurs raretés ; proximité d’un seuil

### Tête d’Aménophis Ier

Esquisse → **Étude**, score proposé 48,2, plage 15,4–81,5, confiance 44,9 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : anonymous — New Kingdom ; Dynasty 18.

- **P 41,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://collectionapi.metmuseum.org/public/collection/v1/objects/544453>.
- **A 52,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://collectionapi.metmuseum.org/public/collection/v1/objects/544453>.
- **H 43,6 · estimated** — comparable-median-shrunk-to-declared-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://collectionapi.metmuseum.org/public/collection/v1/objects/544453> ; <https://openaccess-api.clevelandart.org/api/artworks/102377> ; <https://openaccess-api.clevelandart.org/api/artworks/102388> ; <https://openaccess-api.clevelandart.org/api/artworks/126198> ; <https://openaccess-api.clevelandart.org/api/artworks/130939> ; <https://openaccess-api.clevelandart.org/api/artworks/144280> ; <https://openaccess-api.clevelandart.org/api/artworks/147518> ; <https://openaccess-api.clevelandart.org/api/artworks/148794> ; <https://openaccess-api.clevelandart.org/api/artworks/149884> ; <https://openaccess-api.clevelandart.org/api/artworks/151352> ; <https://openaccess-api.clevelandart.org/api/artworks/151445> ; <https://openaccess-api.clevelandart.org/api/artworks/151450> ; <https://openaccess-api.clevelandart.org/api/artworks/155759> ; <https://openaccess-api.clevelandart.org/api/artworks/156131> ; <https://openaccess-api.clevelandart.org/api/artworks/157614> ; <https://openaccess-api.clevelandart.org/api/artworks/163505> ; <https://openaccess-api.clevelandart.org/api/artworks/165426> ; <https://openaccess-api.clevelandart.org/api/artworks/540823> ; <https://openaccess-api.clevelandart.org/api/artworks/93984> ; <https://openaccess-api.clevelandart.org/api/artworks/94073> ; <https://openaccess-api.clevelandart.org/api/artworks/94136> ; <https://openaccess-api.clevelandart.org/api/artworks/96303> ; <https://openaccess-api.clevelandart.org/api/artworks/98298>.
- **M 68,0 · estimated** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://collectionapi.metmuseum.org/public/collection/v1/objects/544453>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://collectionapi.metmuseum.org/public/collection/v1/objects/544453>.

Sensibilité : audience-scale-0.5 48,2 (Étude) ; audience-scale-1 48,2 (Étude) ; audience-scale-2 48,2 (Étude) ; weights-internet 47,2 (Étude) ; weights-heritage 49,1 (Étude).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; sources indépendantes insuffisantes ; intervalle traversant plusieurs raretés

### Cercueil de Bakenmout

Étude → **Étude**, score proposé 59,7, plage 29,8–87,8, confiance 58,5 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : anonymous — Egypt, Thebes, Third Intermediate (1069–715 BCE), Dynasties 21–22.

- **P 41,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/93984>.
- **A 60,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/93984>.
- **H 70,0 · derived** — specific-scholarly-documentation-proxy. Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence. Sources : <https://openaccess-api.clevelandart.org/api/artworks/93984>.
- **M 84,5 · derived** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://openaccess-api.clevelandart.org/api/artworks/93984>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/93984>.

Sensibilité : audience-scale-0.5 59,7 (Étude) ; audience-scale-1 59,7 (Étude) ; audience-scale-2 59,7 (Étude) ; weights-internet 57,0 (Étude) ; weights-heritage 62,3 (Composition).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; sources indépendantes insuffisantes ; classement sensible à la calibration ; intervalle traversant plusieurs raretés ; proximité d’un seuil

### Amulette de Bastet

Esquisse → **Étude**, score proposé 44,7, plage 17,4–74,1, confiance 57,7 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : anonymous — Egypt, Third Intermediate (1069–715 BCE).

- **P 35,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/147518>.
- **A 48,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/147518>.
- **H 49,5 · derived** — specific-scholarly-documentation-proxy. Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence. Sources : <https://openaccess-api.clevelandart.org/api/artworks/147518>.
- **M 54,8 · derived** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://openaccess-api.clevelandart.org/api/artworks/147518>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/147518>.

Sensibilité : audience-scale-0.5 44,7 (Étude) ; audience-scale-1 44,7 (Étude) ; audience-scale-2 44,7 (Étude) ; weights-internet 43,6 (Étude) ; weights-heritage 45,7 (Étude).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; sources indépendantes insuffisantes ; intervalle traversant plusieurs raretés

### Amulette à figure assise et tête bovine

Esquisse → **Étude**, score proposé 56,8, plage 26,9–84,9, confiance 57,5 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : uncertain — Northeast China, Neolithic period, probably Hongshan culture (4700–2920 BCE).

- **P 41,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/130939>.
- **A 60,0 · estimated** — attenuated-indirect-context-estimate. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/130939>.
- **H 58,5 · derived** — specific-scholarly-documentation-proxy. Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence. Sources : <https://openaccess-api.clevelandart.org/api/artworks/130939>.
- **M 84,6 · derived** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://openaccess-api.clevelandart.org/api/artworks/130939>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/130939>.

Sensibilité : audience-scale-0.5 56,8 (Étude) ; audience-scale-1 56,8 (Étude) ; audience-scale-2 56,8 (Étude) ; weights-internet 54,7 (Étude) ; weights-heritage 58,9 (Étude).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; sources indépendantes insuffisantes ; intervalle traversant plusieurs raretés

### Service à thé et à café

Esquisse → **Étude**, score proposé 50,9, plage 22,6–79,3, confiance 58,2 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : identified — France, Paris.

- **P 35,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/150156>.
- **A 53,3 · estimated** — comparable-median-shrunk-to-declared-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/150156> ; <https://www.wikidata.org/wiki/Special:EntityData/Q1066858.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Tiffany_%26_Co./monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Tiffany_%26_Co./monthly/2025100100/2026093000> ; <https://www.wikidata.org/wiki/Special:EntityData/Q312950.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Louis_Comfort_Tiffany/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Louis_Comfort_Tiffany/monthly/2025100100/2026093000> ; <https://www.wikidata.org/wiki/Special:EntityData/Q189762.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Pierre-Karl_Faberg%C3%A9/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Peter_Carl_Faberg%C3%A9/monthly/2025100100/2026093000> ; <https://www.wikidata.org/wiki/Special:EntityData/Q451400.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Ren%C3%A9_Lalique/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Ren%C3%A9_Lalique/monthly/2025100100/2026093000> ; <https://www.wikidata.org/wiki/Special:EntityData/Q4759893.json> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/Fernand_Thesmar/monthly/2025100100/2026093000> ; <https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Andr%C3%A9_Fernand_Thesmar/monthly/2025100100/2026093000>.
- **H 60,0 · derived** — specific-scholarly-documentation-proxy. Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence. Sources : <https://openaccess-api.clevelandart.org/api/artworks/150156>.
- **M 67,6 · derived** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://openaccess-api.clevelandart.org/api/artworks/150156>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/150156>.

Sensibilité : audience-scale-0.5 51,6 (Étude) ; audience-scale-1 50,9 (Étude) ; audience-scale-2 50,3 (Étude) ; weights-internet 49,0 (Étude) ; weights-heritage 52,9 (Étude).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; sources indépendantes insuffisantes ; intervalle traversant plusieurs raretés

### Encrier aux pavots

Esquisse → **Esquisse**, score proposé 39,3, plage 12,0–68,7, confiance 57,7 %, **provisional**. Ancien essai : incomplet.

Identité : Identifiant exact concordant avec la notice institutionnelle conservée. Auteur/contexte : uncertain — America, New York.

- **P 35,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/93173>.
- **A 48,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/93173>.
- **H 33,8 · derived** — specific-scholarly-documentation-proxy. Indice de documentation historique spécifique, non mesure directe de l’influence ou de l’innovation. Plage large pour cette différence. Sources : <https://openaccess-api.clevelandart.org/api/artworks/93173>.
- **M 47,4 · derived** — deduplicated-institution-signals. La seule collection et sa notice valent les composantes configurées, pas une reconnaissance maximale. Sources : <https://openaccess-api.clevelandart.org/api/artworks/93173>.
- **C 30,0 · estimated** — declared-contextual-prior. Distributions éditoriales initiales de plausibilité, non ajustées statistiquement. Sans preuves de différences entre genres, modes neutres entre catégories et distincts entre critères, avec plages larges ; ni inconnue=0 ni remplacement uniforme par 50. Les médianes de comparables non imputés sont rétractées vers ces distributions quand au moins cinq voisins sont disponibles ; aucune estimation n’alimente une autre estimation. Un contexte précis et des indices patrimoniaux observés peuvent relever A de façon bornée, sans transmettre la célébrité d’une civilisation. Sources : <urn:muse:rarity:2.0.0-draft.1> ; <https://openaccess-api.clevelandart.org/api/artworks/93173>.

Sensibilité : audience-scale-0.5 39,3 (Esquisse) ; audience-scale-1 39,3 (Esquisse) ; audience-scale-2 39,3 (Esquisse) ; weights-internet 39,4 (Esquisse) ; weights-heritage 39,2 (Esquisse).

Revue : confiance insuffisante ; couverture observée insuffisante ; part estimée trop élevée pour confirmation ; sources indépendantes insuffisantes ; intervalle traversant plusieurs raretés ; proximité d’un seuil


## Incertitudes fortes et refus

Incertitude particulièrement élevée : 436535, 544453, 544184, 544450, 544442, 820892, 20804, 35, 9480, 1085, 544864, 250945, 204759, 204758, 467642, cma-127571, cma-113202, cma-127572, cma-118679, cma-117032, cma-144966, cma-157501, cma-132367, cma-97165, cma-97166, cma-127746, cma-124076, cma-146469, cma-129219, cma-136510, cma-122351, cma-147017, cma-135185, cma-149410, cma-128392, cma-143278, cma-135336, cma-128072, cma-151015, cma-149421, cma-135517, cma-125104, cma-95259, cma-136760, cma-87891, cma-142792, cma-169684, cma-93984, cma-147518, cma-151352, cma-149884, cma-94136, cma-540823, cma-144280, cma-155759, cma-126198, cma-96303, cma-157614, cma-102377, cma-148794, cma-94073, cma-102388, cma-142734, cma-165186, cma-150156, cma-296869, cma-150488, cma-152818, cma-160089, cma-151884, cma-93173, cma-153683, cma-399499, cma-111811, cma-137128, cma-135431, cma-137023, cma-150996, cma-169251, cma-105933, cma-153401, cma-130939, cma-165426, cma-161637, cma-163505, cma-98298, cma-156131, cma-284749, cma-151445, cma-106757, cma-151450.

Aucun refus d’identité dans les cent œuvres disposant déjà de notices précises. Une entrée ambiguë ou sans métadonnées minimales est refusée par le moteur, pas remplie arbitrairement.

## Reproduire

Collecte avec cache : `npm run rarity:v2:collect` ; complément autorisé : `npm run rarity:v2:collect -- --live`. Calcul sans réseau : `npm run rarity:v2`. Configuration alternative : `npm run rarity:v2 -- --config chemin.json`. Vérification : `npm run rarity:v2:verify`.

Les résultats détaillés JSON/CSV et le manifeste sont dans le même dossier d’exécution ; inputs.json et config.json permettent l’inspection. L’identifiant dépend des entrées, preuves, configuration et code. Les exécutions figées ne sont jamais écrasées avec un contenu différent. Les résultats actifs et l’ancien essai à quatre scores complets restent intégralement conservés.
