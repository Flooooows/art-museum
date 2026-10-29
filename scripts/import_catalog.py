"""Prepare the explicitly curated catalogue; --apply only after domain validation."""
import argparse
import copy
import json
import subprocess
from catalog_sources import ROOT, STAGING


def load(path):
    return json.loads((ROOT / path).read_text())


def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def prepare():
    data = copy.deepcopy(load("src/catalog/seed.json"))
    editorial = load("catalog/selection-100.json")
    reviews = {r["workId"]: r for r in load("catalog/image-rights-review.json")["images"]}
    if not any(m["id"] == "cma" for m in data["museums"]):
        data["museums"].append({"id": "cma", "name": "The Cleveland Museum of Art", "city": "Cleveland", "country": "États-Unis", "website": "https://www.clevelandart.org/"})
    new_catalogs = [
        {"id": "renaissance-italienne", "title": "Visages de la Renaissance", "subtitle": "Ateliers et regards italiens", "description": "Portraits, récits et panneaux d’or : quinze œuvres pour explorer les ateliers de la Renaissance italienne.", "familyIds": ["beaux-arts"], "frameFamily": "beaux-arts", "color": "#4a0011", "image": "work-cma-127571", "texture": "renaissance-texture", "status": "demo"},
        {"id": "premiers-arts", "title": "Premières traces", "subtitle": "Formes du Néolithique", "description": "Jades, terres peintes et outils : dix objets néolithiques d’Europe et d’Asie, avec leurs datations et leurs incertitudes.", "familyIds": ["archeologie"], "frameFamily": "prehistoire", "color": "#64501c", "image": "work-cma-165426", "texture": "gold-texture", "status": "demo"},
    ]
    for catalog in new_catalogs:
        if not any(c["id"] == catalog["id"] for c in data["catalogs"]):
            data["catalogs"].append(catalog)
    family_for = {"renaissance-italienne": "beaux-arts", "modernes": "beaux-arts", "egypte": "archeologie", "decoratifs": "arts-decoratifs", "mythes": "imaginaire", "premiers-arts": "archeologie"}
    for group, rows in editorial["groups"].items():
        primary = "beaux-arts" if group == "modernes" else group
        for row in rows:
            entry = dict(zip(editorial["columns"], row, strict=True))
            identifier = f"cma-{entry['sourceId']}"
            raw = load(f"catalog/evidence/{identifier}.json")["response"]["data"]
            if raw["id"] != entry["sourceId"] or raw["share_license_status"] != "CC0":
                raise ValueError(f"Notice/CC0 incohérente : {identifier}")
            work = {key: entry[key] for key in ["title", "creatorDisplayName", "displayDate", "medium", "origin", "anecdote", "story"]}
            work.update({"id": identifier, "yearStart": raw["creation_date_earliest"], "yearEnd": raw["creation_date_latest"], "familyId": family_for[group], "primaryCatalogId": primary, "rarityAssessmentId": f"rarity-{identifier}-v1", "museumId": "cma", "status": "demo", "sources": [{"provider": "cma", "recordId": str(raw["id"]), "url": raw["url"]}]})
            existing = next((w for w in data["works"] if w["id"] == identifier), None)
            if existing is not None and existing != work:
                raise ValueError(f"Fiche existante différente, import refusé : {identifier}")
            if existing is None:
                data["works"].append(work)
                data["memberships"].append({"workId": identifier, "catalogId": primary})
                data["rarityAssessments"].append({"id": work["rarityAssessmentId"], "workId": identifier, "version": 1, "level": entry["rarity"], "rubricVersion": "notoriete-v1-proposal", "audience": "Grand public francophone, avec prise en compte du rayonnement international (proposition)", "status": "provisional", "confidence": "unassessed", "assessedAt": None, "scores": {"visualRecognition": None, "popularCulture": None, "educationalReach": None, "geographicReach": None}, "justification": "Proposition de niveau pour la démonstration, non validée. La notice institutionnelle documente l’identité et le contexte, pas un score de reconnaissance du grand public. Une évaluation sourcée selon les seuils 30/50/70/90 reste nécessaire.", "sources": []})
                data["images"].append({"id": f"image-{identifier}", "workId": identifier, "url": reviews[identifier]["local"], "alt": entry["title"], "primary": True, "sourceUrl": raw["url"], "rights": {}})
    if not any(m["workId"] == "mona-lisa" and m["catalogId"] == "renaissance-italienne" for m in data["memberships"]):
        data["memberships"].append({"workId": "mona-lisa", "catalogId": "renaissance-italienne"})
    for image in data["images"]:
        review = reviews[image["workId"]]
        if image["url"] != review["local"]:
            raise ValueError("Fichier image différent de la revue")
        museum = next(m for m in data["works"] if m["id"] == image["workId"])["museumId"]
        statement = {"cma": "CC0 — The Cleveland Museum of Art", "met": "Domaine public — The Metropolitan Museum of Art, Open Access", "louvre": "Domaine public — Léonard de Vinci ; reproduction Wikimedia Commons (PD-Art)"}[museum]
        image["rights"] = {"license": review["license"], "statement": statement, "reviewStatus": "verified", "reviewedAt": review["retrievedAt"][:10], "verification": {key: value for key, value in review.items() if key not in ["workId", "license", "local"]}}
    if len(data["works"]) != 100 or len(reviews) != 100:
        raise ValueError("Cent œuvres et cent revues exigées")
    return data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    data = prepare()
    candidate = STAGING / "seed-100-candidate.json"
    save(candidate, data)
    validation = "import fs from 'node:fs'; import {parseCatalog} from './src/catalog/model'; const d=parseCatalog(JSON.parse(fs.readFileSync(process.argv[1],'utf8'))); console.log(`Candidat valide : ${d.works.length} œuvres, ${d.images.length} images.`);"
    subprocess.run(["npx", "tsx", "-e", validation, str(candidate)], cwd=ROOT, check=True)
    if args.apply:
        plan = load("catalog/initial-collections.json")
        editorial = load("catalog/selection-100.json")
        groups = {"renaissance-italienne": "renaissance-italienne", "du-neoclassicisme-aux-modernes": "modernes", "egypte-ancienne": "egypte", "arts-decoratifs-1900": "decoratifs", "mythes-et-creatures": "mythes", "premiers-arts": "premiers-arts"}
        for collection in plan["collections"]:
            legacy = [identifier for identifier in collection["candidateIds"] if not identifier.startswith("cma-")]
            collection["candidateIds"] = legacy + [f"cma-{row[0]}" for row in editorial["groups"][groups[collection["id"]]]]
            collection["target"] = len(collection["candidateIds"])
        plan["status"] = "selected"
        plan["countingRule"] = "100 œuvres réellement importées : 99 affectations de sélection uniques dans les six ensembles et Hokusai conservé hors de ces ensembles. Les appartenances secondaires et le catalogue historique Beaux-Arts ne gonflent pas le total."
        plan["publicationPolicy"] = "Les 100 images ont des droits revus avec preuves par fichier. Les fiches restent demo et les raretés provisional, sans validation fictive de notoriété."
        assigned = [identifier for c in plan["collections"] for identifier in c["candidateIds"]] + plan["reserveExistingIds"]
        if len(assigned) != 100 or set(assigned) != {w["id"] for w in data["works"]}:
            raise ValueError("Sélection de cent œuvres incohérente")
        save(ROOT / "src/catalog/seed.json", data)
        save(ROOT / "catalog/initial-collections.json", plan)
        provenance = load("public/assets/provenance.json")
        for image in data["images"]:
            proof = image["rights"]["verification"]
            name = image["url"].split("/")[-1]
            existing = provenance.get(name, {})
            provenance[name] = {**existing, "source": image["sourceUrl"], "image": proof["sourceImageUrl"], "license": image["rights"]["statement"], "rightsEvidence": proof["evidenceFile"], "reviewedAt": image["rights"]["reviewedAt"], "sha256": proof["sha256"], "editorialAdaptation": "Notice et texte français adaptés pour MUSE ; aucune approbation du musée n’est impliquée."}
        save(ROOT / "public/assets/provenance.json", provenance)
        print("Import activé : 100 œuvres et preuves de droits ; aucune rareté déclarée validée.")
    else:
        print("Préparation uniquement ; utiliser --apply pour activer le candidat validé.")
