"""Download selected open images without overwriting existing artwork files."""
import concurrent.futures
import hashlib
import json
import subprocess
from pathlib import Path
from catalog_sources import ROOT, STAGING, SELECTED, record, download


def prepare(provider, identifier):
    envelope = record(provider, identifier)
    raw = envelope["response"]
    if provider == "cma":
        raw = raw["data"]
        if raw["share_license_status"] != "CC0" or not raw.get("images", {}).get("web"):
            raise ValueError(f"Image CC0 manquante : {identifier}")
        url = raw["images"]["web"]["url"]
        local = f"work-cma-{identifier}.jpg"
        license_name = "CC0"
        policy = "https://www.clevelandart.org/open-access"
        note = "share_license_status=CC0 ; image web explicitement fournie par la notice du musée."
    elif provider == "met":
        if raw["isPublicDomain"] is not True or not raw["primaryImageSmall"] or raw["rightsAndReproduction"]:
            raise ValueError(f"Domaine public non confirmé : {identifier}")
        url = raw["primaryImageSmall"]
        local = f"work-{identifier}.jpg"
        license_name = "public-domain"
        policy = "https://metmuseum.github.io/"
        note = "isPublicDomain=true, rightsAndReproduction vide ; image Open Access fournie par la notice du Met."
    else:
        page = next(iter(raw["query"]["pages"].values()))
        info = page["imageinfo"][0]
        metadata = info["extmetadata"]
        if metadata["License"]["value"] != "pd" or metadata["Copyrighted"]["value"] != "False":
            raise ValueError("Domaine public de La Joconde non confirmé")
        provenance = json.loads((ROOT / "public/assets/provenance.json").read_text())
        url = provenance["work-mona-lisa.jpg"]["image"]
        local = "work-mona-lisa.jpg"
        license_name = "public-domain"
        policy = "https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs"
        note = "Commons déclare License=pd et Copyrighted=False pour File:Mona Lisa.jpg ; reproduction fidèle 2D. La notice avertit de possibles différences de droit selon les juridictions."
    destination = ROOT / "public/assets" / local
    cache = STAGING / "downloads" / local
    cache.parent.mkdir(parents=True, exist_ok=True)
    if not cache.exists():
        cache.write_bytes(download(url))
    body = cache.read_bytes()
    if body[:3] != b"\xff\xd8\xff":
        raise ValueError(f"JPEG attendu : {local}")
    source_sha256 = hashlib.sha256(body).hexdigest()
    decoded_sha256 = None
    if destination.exists() and destination.read_bytes() != body:
        # Existing JPEGs contain provenance metadata; require pixel identity,
        # not byte identity, before associating the refreshed rights evidence.
        program = """
import sharp from 'sharp'; import {createHash} from 'node:crypto';
const [a,b]=await Promise.all(process.argv.slice(1).map(p=>sharp(p).raw().toBuffer({resolveWithObject:true})));
if(JSON.stringify(a.info)!==JSON.stringify(b.info)||!a.data.equals(b.data))process.exit(1);
console.log(createHash('sha256').update(a.data).digest('hex'));
"""
        comparison = subprocess.run(["node", "--input-type=module", "-e", program, str(destination), str(cache)], cwd=ROOT, capture_output=True, text=True)
        if comparison.returncode:
            raise ValueError(f"Pixels de l’original différents, non écrasé : {local}")
        decoded_sha256 = comparison.stdout.strip()
        note += " JPEG local conservé : métadonnées différentes, pixels décodés strictement identiques au téléchargement contrôlé."
    if not destination.exists():
        destination.write_bytes(body)
    return {"workId": f"cma-{identifier}" if provider == "cma" else identifier,
            "provider": provider, "license": license_name, "local": f"/assets/{local}",
            "recordUrl": envelope["sourceUrl"], "policyUrl": policy,
            "sourceImageUrl": url, "retrievedAt": envelope["retrievedAt"],
            "evidenceFile": f"catalog/evidence/{provider}-{identifier}.json",
            "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
            "sourceSha256": source_sha256, "decodedPixelsSha256": decoded_sha256,
            "note": note}


if __name__ == "__main__":
    jobs = [("cma", str(identifier)) for ids in SELECTED.values() for identifier in ids]
    before_path = STAGING / "seed-before-100.json"
    before = json.loads((before_path if before_path.exists() else ROOT / "src/catalog/seed.json").read_text())
    jobs += [("met", w["id"]) if w["id"] != "mona-lisa" else ("commons", w["id"]) for w in before["works"] if not w["id"].startswith("cma-")]
    results, errors = [], []
    def run(job):
        try:
            return prepare(*job)
        except Exception as error:
            return {"error": str(error), "job": job}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(run, jobs):
            if "error" in result:
                errors.append(result)
                print("ERROR", result)
            else:
                results.append(result)
    path = ROOT / "catalog/image-rights-review.json"
    if not errors:
        path.write_text(json.dumps({"reviewMethod": "Vérification des déclarations institutionnelles par image, téléchargement et comparaison des fichiers existants ; ne constitue pas un avis juridique universel.", "images": results}, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(results)} images vérifiées et présentes ; {len(errors)} erreurs. Originaux existants conservés.")
    if errors:
        raise SystemExit(1)
