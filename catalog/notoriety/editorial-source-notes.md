# Sources éditoriales consultées — 2026-10-29

Ces notes consignent les éléments effectivement visibles dans la recherche ciblée, pas une prétendue lecture intégrale des pages. Les appréciations H/M/C de `editorial-review.json` restent des propositions de l’assistant à relire. Les réponses structurées Wikidata/Pageviews sont, elles, conservées intégralement dans `evidence/`, avec URL et horodatage.

## La Grande Vague

Recherche ciblée `site.metmuseum.org "Great Wave" "icon"` : [The Great Wave: Anatomy of an Icon](https://www.metmuseum.org/essays/hokusai-great-wave) décrit l’image comme « a global icon », synonyme d’art japonais en Orient et en Occident. La [notice du Met](https://www.metmuseum.org/art/collection/search/45434) renvoie à cet essai. La ressource [Smarthistory](https://smarthistory.org/hokusai-under-the-wave-off-kanagawa-the-great-wave/) porte explicitement sur cette composition et cet exemplaire. La recherche identifie aussi [l’hommage de Bösendorfer](https://www.boesendorfer.com/en/pianos/collectors-item/the-great-wave-off-kanagawa), présenté comme « An Icon of Japanese Art meets Austrian Piano Craftsmanship » : un cas de reprise hors de la notice muséale, pas une mesure exhaustive de présence culturelle.

La composition Q252485 possède des liens Wikipédia ; l’exemplaire du Met Q28912605 y est relié dans Wikidata par P361. Ce cas est examiné explicitement, sans appliquer P361 à tous les objets. La série des Trente-six vues du mont Fuji n’est pas la cible d’audience.

## La Joconde

Recherche `site.louvre.fr "Joconde" "célèbre"` : [Salle des États](https://www.louvre.fr/decouvrir/le-palais/de-la-joconde-aux-noces-de-cana) présente « le tableau le plus célèbre du monde ». La [notice des collections](https://collections.louvre.fr/ark:/53355/cl010062370) évoque l’œuvre la plus célèbre au monde et la réception qui suit sa redécouverte en 1913. Le [dossier de l’exposition immersive](https://www.louvre.fr/decouvrir/vie-du-musee/la-joconde-exposition-immersive) traite la construction de cette célébrité. La note maximale proposée H/M/C est un jugement éditorial sur ce faisceau, pas la reprise du score fictif 99 de la référence.

## Parade de cirque

La recherche ciblée sur Seurat et l’exposition de 2017 identifie la [notice du Met](https://www.metmuseum.org/art/collection/search/437654) : première peinture nocturne de Seurat et présentation au Salon des Indépendants en 1888. Une [exposition dédiée](https://www.metmuseum.org/exhibitions/listings/2017/seurat-circus-sideshow) et un [catalogue de recherche](https://www.metmuseum.org/met-publications/seurats-circus-sideshow) étayent M. La [critique du New York Times](https://www.nytimes.com/2017/02/16/arts/design/cirque-du-seurat-at-the-metropolitan-museum-of-art.html) et la [présentation The Art Story](https://www.theartstory.org/artist/seurat-georges/) attestent des publications publiques sur l’œuvre précise. Les notes H=75, M=100, C=50 sont des appréciations proposées sur ces éléments, non des déductions depuis la seule renommée de Seurat.

## La Mort de Socrate

Recherche `site.metmuseum.org "Death of Socrates" "most"` : [New Discoveries](https://www.metmuseum.org/perspectives/the-death-of-socrates-new-discoveries) qualifie la toile de l’une des peintures les plus importantes de la collection du Met. [Prisons Real and Imagined](https://www.metmuseum.org/perspectives/jacques-louis-david-death-of-socrates) est une autre médiation consacrée au tableau. [Khan Academy](https://www.khanacademy.org/humanities/renaissance-reformation/rococo-neoclassicism/neo-classicism/v/jacques-louis-david-the-death-of-socrates) propose une analyse pédagogique. Une [réponse des bibliothèques de Genève](https://www.geneve.ch/themes/culture/bibliotheques/interroge/reponses/socrate-est-il-represente-index-leve-sur-la-tableau-de-jacques-louis-david) porte spécifiquement sur le geste du Socrate de David. Ce sont des éléments de publications publiques au sens de C dans la nouvelle référence : proposition C=50, sans prétendre mesurer la reconnaissance du grand public ou une diffusion hors du domaine éducatif.

## William

Recherche `site.metmuseum.org "William" "mascot" hippopotamus` : le [dossier du centenaire](https://www.metmuseum.org/hubs/william-the-hippo-celebrating-100-years-at-the-met) décrit William comme la mascotte informelle du musée. Le [communiqué de 2017](https://www.metmuseum.org/press-releases/william-100-2017-news) situe l’origine du surnom dans un texte de Punch en 1931. Le [catalogue de produits dérivés](https://store.metmuseum.org/blog/where-the-toys-are-new-william-hippo-and-friends-plushes) fournit un autre exemple d’usage culturel précis. L’auteur demeure inconnu : ce fait n’est pas converti en zéro, même si les critères H/M/C sont renseignés.

## Autres objets et limites

Les cent objets ont une notice institutionnelle identifiée dans `src/catalog/seed.json` et une preuve conservée dans `catalog/evidence/`. Cela fonde seulement le palier commun M=50 de cette simulation. Le nombre de citations ou d’expositions conservé par Cleveland est exposé comme indice, sans en déduire automatiquement importance historique ou diffusion populaire. Les œuvres dépourvues d’article spécifique, auteurs inconnus et critères non examinés gardent leurs inconnues.

Il n’y a pas encore d’enquête représentative du public, d’export Google Trends homogène ou de relecture humaine indépendante. Ne pas qualifier ce lot de classement final validé des cent œuvres.
