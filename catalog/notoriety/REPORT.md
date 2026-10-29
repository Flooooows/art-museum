# Recalcul exploratoire des 100 œuvres MUSE

## Résultat

100 œuvres examinées ; **4 scores exploratoires complets**, **96 incomplets**. Le catalogue actif reste inchangé. Une fourchette n’est ni une note attribuée ni un intervalle statistique de confiance.

Répartition active : Esquisse 43 · Étude 39 · Composition 14 · Œuvre 3 · Pièce maîtresse 1. La répartition du seul sous-ensemble complet ne doit pas être présentée comme celle des cent œuvres.

Couverture : P 9/100 · A 43/100 · H 5/100 · M 100/100 · C 5/100.

- **La Mort de Socrate** : 86.93/100 → Œuvre (actif : Étude).
- **La Grande Vague de Kanagawa** : 100.00/100 → Pièce maîtresse (actif : Œuvre).
- **La Joconde** : 100.00/100 → Pièce maîtresse (actif : Pièce maîtresse).
- **L’Hippopotame « William »** : score incomplet, bornes 32.50–87.50 ; manque P, A (actif : Composition).
- **Nymphéas (Agapanthes)** : score incomplet, bornes 32.50–92.50 ; manque P, H, C (actif : Œuvre).

## Méthode appliquée

Référence : [MUSE_systeme_rarete.md](../../MUSE_systeme_rarete.md). Formule **S = 0,30P + 0,25A + 0,20H + 0,15M + 0,10C**. Entrées sur 100 ; seuils de simulation **40/60/75/90** ; noms MUSE conservés. L’ancienne grille active 30/50/70/90 n’est pas migrée.

Mesures : consultations Wikipédia humaines, fr/en, all-access, du **2025-10-01 au 2026-09-30**, douze mois complets. Les identités viennent des notices muséales et de Wikidata ; La Joconde Q12418 est une correspondance explicitement identifiée. La Grande Vague utilise Q252485 (composition) à partir de l’impression du Met Q28912605 : même image gravée, pas toute la série des Trente-six vues. Aucun autre lien de série n’est utilisé pour hériter d’une audience.

Normalisation : min(100, 100 × ln(1 + vues humaines fr/en cumulées / 365) / ln(1001)) ; pour A moyenne des notes des créateurs identifiés. Ancre exploratoire fixe de 1000 vues/jour ; pas un percentile du catalogue.

**P est ici une variante Wikimedia seule**, Google Trends n’étant pas disponible sous forme d’un export comparable ; ne pas présenter cette simulation comme la méthode Internet complète. Une page absente n’a pas un compteur de zéro. Les réponses HTTP indisponibles sont distinctes des vraies audiences nulles. Si une page existante n’a pas ses douze mois, le critère reste inconnu.

H/M/C sont appréciés dans [editorial-review.json](editorial-review.json), avec raisons et sources. Pour M, le palier exploratoire commun de 50 correspond exclusivement à la présence de cet objet dans l’une des trois grandes collections et à sa notice publique ; des notes supérieures nécessitent une revue explicite. La présence au musée n’entraîne aucune note H ou C. Pour les autres H/C non revus, la valeur reste inconnue, sans estimation inventée.

Les bornes sont la somme pondérée connue, puis cette somme augmentée du poids maximal des critères absents ; les poids ne sont jamais renormalisés. Une borne basse n’est pas un score « pessimiste » à activer. La sensibilité à trois ancres d’audience (100/1000/10000 par jour) figure dans results.json. Aucun classement ne doit être validé sur la seule précision arithmétique du résultat.

## Sensibilité de la calibration

L’ancre indique l’audience quotidienne donnant 100 à P/A. Les autres appréciations restent identiques. Ces variantes ne sont pas trois mesures différentes : elles montrent la dépendance du classement à un choix encore à valider.

| Œuvre | Ancre 100 vues/j | Ancre 1000 vues/j (simulation principale) | Ancre 10000 vues/j |
|---|---|---|---|
| Parade de cirque | 83.99 · Œuvre | 75.13 · Œuvre | 65.10 · Composition |
| La Mort de Socrate | 90.00 · Pièce maîtresse | 86.93 · Œuvre | 74.25 · Composition |
| La Grande Vague de Kanagawa | 100.00 · Pièce maîtresse | 100.00 · Pièce maîtresse | 89.90 · Œuvre |
| La Joconde | 100.00 · Pièce maîtresse | 100.00 · Pièce maîtresse | 97.42 · Pièce maîtresse |

Un résultat 100 signifie ici saturation du barème, pas reconnaissance par 100 % du public. Une bascule de niveau entre variantes impose une revue de calibration avant activation.

## Les cent résultats

« — » signifie inconnu ; toutes les notes numériques de H/M/C sont éditoriales. Les colonnes sont arrondies pour lecture seulement ; classement depuis les valeurs non arrondies.

| Identifiant | Œuvre | Actif | P | A | H | M | C | Score ou bornes /100 | Résultat de simulation |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| 437654 | Parade de cirque | Esquisse | 53.43 | 96.42 | 75.00 | 100.00 | 50.00 | 75.13 | Œuvre |
| 436105 | La Mort de Socrate | Étude | 89.77 | 100.00 | 75.00 | 100.00 | 50.00 | 86.93 | Œuvre |
| 436535 | Champ de blé avec cyprès | Composition | — | 100.00 | — | 50.00 | — | 32.50–92.50 | Indéterminée (P, H, C) |
| 45434 | La Grande Vague de Kanagawa | Œuvre | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | Pièce maîtresse |
| mona-lisa | La Joconde | Pièce maîtresse | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 | Pièce maîtresse |
| 544453 | Tête d’Aménophis Ier | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 544184 | Visage de Sésostris III | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 544450 | Hatchepsout assise | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 544442 | Sphinx d’Hatchepsout | Composition | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 544227 | L’Hippopotame « William » | Composition | — | — | 50.00 | 100.00 | 75.00 | 32.50–87.50 | Indéterminée (P, A) |
| 820892 | Vase aux motifs naturalistes | Esquisse | — | 93.99 | — | 50.00 | — | 31.00–91.00 | Indéterminée (P, H, C) |
| 20804 | Vase en argent | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 35 | Le Vase Adams | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 9480 | Vase en verre Favrile | Composition | — | 84.05 | — | 50.00 | — | 28.51–88.51 | Indéterminée (P, H, C) |
| 1085 | Cabinet aux incrustations | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 544864 | La Déesse hippopotame | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 250945 | Persée et Andromède | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 204759 | Tête de Méduse | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| 204758 | Persée tenant la tête de Méduse | Composition | — | 77.53 | — | 50.00 | — | 26.88–86.88 | Indéterminée (P, H, C) |
| 467642 | La Licorne captive | Œuvre | 55.00 | — | — | 50.00 | — | 24.00–79.00 | Indéterminée (A, H, C) |
| cma-127571 | Portrait d’un homme, peut-être Girolamo Rosati | Étude | — | 58.76 | — | 50.00 | — | 22.19–82.19 | Indéterminée (P, H, C) |
| cma-113202 | La Sainte Famille avec saint Jean-Baptiste et sainte Marguerite | Étude | — | 63.53 | — | 50.00 | — | 23.38–83.38 | Indéterminée (P, H, C) |
| cma-127572 | L’Annonciation | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-118679 | Lazare et le mauvais riche | Esquisse | — | 52.78 | — | 50.00 | — | 20.69–80.69 | Indéterminée (P, H, C) |
| cma-117032 | Le Sacrifice d’Isaac | Étude | — | 62.13 | — | 50.00 | — | 23.03–83.03 | Indéterminée (P, H, C) |
| cma-144966 | La Vierge à l’Enfant avec le jeune saint Jean-Baptiste | Composition | 12.62 | — | — | 50.00 | — | 11.29–66.29 | Indéterminée (A, H, C) |
| cma-157501 | Garçon buvant | Étude | — | 71.52 | — | 50.00 | — | 25.38–85.38 | Indéterminée (P, H, C) |
| cma-132367 | La Vierge à l’Enfant sur un trône | Esquisse | — | 13.33 | — | 50.00 | — | 10.83–70.83 | Indéterminée (P, H, C) |
| cma-97165 | La Course du Palio dans les rues de Florence | Esquisse | — | 13.27 | — | 50.00 | — | 10.82–70.82 | Indéterminée (P, H, C) |
| cma-97166 | La Vierge à l’Enfant avec des anges | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-127746 | Le Baptême du Christ | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-124076 | Le Couronnement de la Vierge | Étude | — | 86.64 | — | 50.00 | — | 29.16–89.16 | Indéterminée (P, H, C) |
| cma-146469 | Portrait d’une femme | Étude | — | 70.07 | — | 50.00 | — | 25.02–85.02 | Indéterminée (P, H, C) |
| cma-129219 | Saint Nicolas de Bari | Étude | — | 62.30 | — | 50.00 | — | 23.07–83.07 | Indéterminée (P, H, C) |
| cma-136510 | Nymphéas (Agapanthes) | Œuvre | — | 100.00 | — | 50.00 | — | 32.50–92.50 | Indéterminée (P, H, C) |
| cma-125249 | Les Grands Platanes, cantonniers à Saint-Rémy | Composition | 31.76 | 100.00 | — | 50.00 | — | 42.03–72.03 | Indéterminée (H, C) |
| cma-122351 | L’Incendie du Parlement de Londres, le 16 octobre 1834 | Composition | — | 100.00 | — | 50.00 | — | 32.50–92.50 | Indéterminée (P, H, C) |
| cma-147017 | L’Étang de Branch Hill à Hampstead | Étude | — | 88.12 | — | 50.00 | — | 29.53–89.53 | Indéterminée (P, H, C) |
| cma-135185 | La Montagne Sainte-Victoire | Composition | — | 100.00 | — | 50.00 | — | 32.50–92.50 | Indéterminée (P, H, C) |
| cma-121188 | Romaine Lacaux | Étude | — | 100.00 | — | 50.00 | — | 32.50–92.50 | Indéterminée (P, H, C) |
| cma-149410 | Dans les vagues | Étude | — | 100.00 | — | 50.00 | — | 32.50–92.50 | Indéterminée (P, H, C) |
| cma-128392 | Lisière du bois près de l’Hermitage, Pontoise | Étude | — | 93.41 | — | 50.00 | — | 30.85–90.85 | Indéterminée (P, H, C) |
| cma-143278 | Composition avec rouge, jaune et bleu | Composition | — | 99.64 | — | 50.00 | — | 32.41–92.41 | Indéterminée (P, H, C) |
| cma-135336 | Berthe Morisot au manchon | Étude | — | 99.36 | — | 50.00 | — | 32.34–92.34 | Indéterminée (P, H, C) |
| cma-128072 | La Lecture | Étude | — | 91.66 | — | 50.00 | — | 30.41–90.41 | Indéterminée (P, H, C) |
| cma-151015 | Intérieur | Esquisse | — | 74.60 | — | 50.00 | — | 26.15–86.15 | Indéterminée (P, H, C) |
| cma-149421 | La Ferme à l’entrée du bois | Esquisse | — | 88.93 | — | 50.00 | — | 29.73–89.73 | Indéterminée (P, H, C) |
| cma-135517 | Le Cirque | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-125104 | Frise de danseuses | Composition | — | 98.37 | — | 50.00 | — | 32.09–92.09 | Indéterminée (P, H, C) |
| cma-126769 | Combat d’un tigre et d’un buffle | Composition | 25.61 | 92.61 | — | 50.00 | — | 38.34–68.34 | Indéterminée (H, C) |
| cma-95259 | Cavaliers grecs se reposant dans une forêt | Étude | — | 97.01 | — | 50.00 | — | 31.75–91.75 | Indéterminée (P, H, C) |
| cma-136760 | Saint-Mammès, canal du Loing | Étude | — | 78.62 | — | 50.00 | — | 27.15–87.15 | Indéterminée (P, H, C) |
| cma-87891 | Strandgade, lumière du soleil | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-142792 | Lutteurs dans un cirque | Étude | — | 77.11 | — | 50.00 | — | 26.78–86.78 | Indéterminée (P, H, C) |
| cma-169684 | Portrait de Jean-Baptiste Lemoyne le Jeune | Esquisse | — | 89.51 | — | 50.00 | — | 29.88–89.88 | Indéterminée (P, H, C) |
| cma-93984 | Cercueil de Bakenmout | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-147518 | Amulette de Bastet | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-151352 | Miroir à manche en forme de jeune femme | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-149884 | Amulette en forme de grenouille | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-94136 | Boîte à couleurs du vizir Amenemopé | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-540823 | Uræus, cobra dressé | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-144280 | Le Taureau Apis | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-155759 | Jeune porteuse de jarre | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-126198 | Statue de Minnefer en marche | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-96303 | Tête de Sekhmet | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-157614 | Pot à cosmétiques en forme de Bès | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-102377 | Vase canope à tête de chacal | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-148794 | Talatat avec portrait de Néfertiti | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-94073 | Appui-tête d’Irout | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-102388 | Livre des morts d’Hori | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-142734 | Brin de muguet | Étude | — | 85.66 | — | 50.00 | — | 28.92–88.92 | Indéterminée (P, H, C) |
| cma-165186 | Vase Grenouilles et Nénuphars | Étude | — | 71.69 | — | 50.00 | — | 25.42–85.42 | Indéterminée (P, H, C) |
| cma-150156 | Service à thé et à café | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-296869 | Lampadaire aux pivoines, pied bambou | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-150488 | Peigne au muguet | Esquisse | — | 71.69 | — | 50.00 | — | 25.42–85.42 | Indéterminée (P, H, C) |
| cma-152818 | Plat mural aux deux oiseaux | Esquisse | — | 14.04 | — | 50.00 | — | 11.01–71.01 | Indéterminée (P, H, C) |
| cma-160089 | Écran de cheminée | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-151884 | Cabinet aux incrustations et parchemins peints | Esquisse | — | 58.20 | — | 50.00 | — | 22.05–82.05 | Indéterminée (P, H, C) |
| cma-93173 | Encrier aux pavots | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-140001 | Œuf impérial de la Croix-Rouge | Composition | 32.14 | — | — | 50.00 | — | 17.14–72.14 | Indéterminée (A, H, C) |
| cma-153683 | Hercule | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-399499 | Antéfixe à tête de Gorgone | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-111811 | Nataraja, Shiva seigneur de la danse | Composition | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-137128 | Ganesha dansant | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-135431 | Dragon | Étude | — | 41.98 | — | 50.00 | — | 18.00–78.00 | Indéterminée (P, H, C) |
| cma-137023 | Vishnou sur Garuda | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-150996 | Durga terrassant le démon-buffle | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-169251 | Atlas-Hercule ailé | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-105933 | La Reine Méduse et sa cour | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-153401 | Jarre au dragon | Étude | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-130939 | Amulette à figure assise et tête bovine | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-165426 | Urne en forme d’oiseau | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-161637 | Figurine de Vinča | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-163505 | Jarre aux spirales | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-98298 | Disque cérémoniel bi | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-156131 | Hache-disque cérémonielle yue | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-284749 | Urne aux motifs triangulaires | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-151445 | Jarre peinte de Ban Chiang | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-106757 | Hachette en silex | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |
| cma-151450 | Coupe sur pied de Ban Chiang | Esquisse | — | — | — | 50.00 | — | 7.50–92.50 | Indéterminée (P, A, H, C) |

## Limites et suite

- Google Trends non collecté ; P est un proxy Wikipédia, pas le P Internet complet de la référence.
- H/M/C sont des appréciations éditoriales, pas des mesures automatisées ni un panel représentatif.
- Ancre de 1000 vues/jour conventionnelle ; sensibilité 100/1000/10000 fournie, sans ajustement pour atteindre un quota.
- Pas d’agrégation des anciens titres Wikipédia ; les changements de page et langues absentes peuvent sous-estimer les consultations.
- Un auteur anonyme reste inconnu : la formule nécessite une décision éditoriale sur les objets sans auteur, pas une pénalité silencieuse.
- L’audience d’une maison ou firme (par exemple Tiffany & Co.) peut venir de ses activités commerciales, pas seulement de sa création artistique ; ce proxy A exige une revue avant activation.
- Les compteurs de citations et expositions sont des indices à examiner, pas des scores H/C automatiques.

Compléter les preuves H/C des œuvres non revues, résoudre les cas d’auteurs anonymes ou d’attribution, définir puis comparer un export Google Trends homogène et faire relire les cas proches des seuils. Ensuite seulement proposer une activation versionnée. Aucun quota de rareté n’est imposé. Les droits des images, sauvegardes, cadres et taux 56,1/25,5/15/3/0,4 restent inchangés.

## Reproduire

Collecte réseau : `python3 scripts/collect-notoriety.py` (cache réutilisé, interruptions/limitations conservées). Calcul sans réseau : `npm run catalog:notoriety`. Résultats détaillés : [JSON](results.json), [CSV](results.csv), [observations](observations.json) ; chaque mesure pointe vers une réponse brute datée dans evidence/. Relancer le calcul n’actualise pas les audiences et n’écrit jamais dans seed.json.
