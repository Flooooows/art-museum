"""Read-only museum collection queries with a local, dated response cache."""
import argparse
import concurrent.futures
import datetime
import json
from pathlib import Path
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
STAGING = ROOT / "output/catalog-import"
EVIDENCE = ROOT / "catalog/evidence"


def download(url):
    request = urllib.request.Request(url, headers={"User-Agent": "MUSE-catalog-research/1.0 (educational collection; source verification)"})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def cached_json(url, path):
    if path.exists():
        return json.loads(path.read_text())
    body = download(url)
    data = json.loads(body)
    envelope = {"sourceUrl": url, "retrievedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "response": data}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2) + "\n")
    return envelope


def record(provider, identifier):
    if provider == "cma":
        url = f"https://openaccess-api.clevelandart.org/api/artworks/{identifier}"
    elif provider == "met":
        url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{identifier}"
    elif provider == "commons":
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": "File:Mona_Lisa.jpg", "prop": "imageinfo", "iiprop": "url|extmetadata", "format": "json"})
    else:
        raise ValueError("Unknown provider")
    return cached_json(url, EVIDENCE / f"{provider}-{identifier}.json")


SEARCHES = {
    "renaissance": {"culture": "Italy", "created_after": 1400, "created_before": 1600, "type": "Painting", "limit": 60},
    "modernes": {"department": "European Painting and Sculpture", "created_after": 1770, "created_before": 1930, "type": "Painting", "limit": 110},
    "modernes19": {"department": "Modern European Painting and Sculpture", "type": "Painting", "limit": 120},
    "egypte": {"culture": "Egypt", "created_before": 1, "limit": 60},
    "decoratifs": {"department": "Decorative Art and Design", "created_after": 1850, "created_before": 1915, "limit": 60},
    "premiers-arts": {"q": "Neolithic", "created_before": -1500, "limit": 45},
    **{f"mythes-{q.lower()}": {"q": q, "limit": 5} for q in ["Hercules", "Medusa", "Shiva", "Ganesha", "Dragon", "Vishnu", "Durga"]},
}

SELECTED = {
    "renaissance-italienne": [127571, 113202, 127572, 118679, 117032, 144966, 157501, 132367, 97165, 97166, 127746, 124076, 146469, 129219],
    "modernes": [136510, 125249, 122351, 147017, 135185, 121188, 149410, 128392, 143278, 135336, 128072, 151015, 149421, 135517, 125104, 126769, 95259, 136760, 87891, 142792, 169684],
    "egypte": [93984, 147518, 151352, 149884, 94136, 540823, 144280, 155759, 126198, 96303, 157614, 102377, 148794, 94073, 102388],
    "decoratifs": [142734, 165186, 150156, 296869, 150488, 152818, 160089, 151884, 93173, 140001],
    "mythes": [153683, 399499, 111811, 137128, 135431, 137023, 150996, 169251, 105933, 153401],
    "premiers-arts": [130939, 165426, 161637, 163505, 98298, 156131, 284749, 151445, 106757, 151450],
}


def search(name):
    params = {"cc0": 1, "has_image": 1, **SEARCHES[name]}
    url = "https://openaccess-api.clevelandart.org/api/artworks/?" + urllib.parse.urlencode(params)
    envelope = cached_json(url, STAGING / f"search-{name}.json")
    lines = [f"\n{name} ({envelope['response']['info']['total']} results)"]
    for row in envelope["response"]["data"]:
        creators = "; ".join(c["description"] for c in row.get("creators", []))
        lines.append(f"{row['id']} | {row['title']} | {row.get('creation_date')} | {creators or ', '.join(row.get('culture', []))} | {row.get('technique')} | {row['share_license_status']}")
    return "\n".join(lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("names", nargs="*", choices=list(SEARCHES))
    parser.add_argument("--selected", action="store_true", help="Collect the individually selected 80 CMA records and 20 legacy image records")
    args = parser.parse_args()
    if args.selected:
        seed = json.loads((ROOT / "src/catalog/seed.json").read_text())
        STAGING.mkdir(parents=True, exist_ok=True)
        backup = STAGING / "seed-before-100.json"
        if not backup.exists():
            backup.write_text(json.dumps(seed, ensure_ascii=False, indent=2) + "\n")
        jobs = [("cma", str(identifier)) for ids in SELECTED.values() for identifier in ids]
        jobs += [("met", work["id"]) if work["id"] != "mona-lisa" else ("commons", "mona-lisa") for work in seed["works"] if not work["id"].startswith("cma-")]
        def collect(job):
            provider, identifier = job
            try:
                result = record(provider, identifier)
                data = result["response"]
                if provider == "cma":
                    data = data["data"]
                    return f"cma-{identifier}: {data['title']} — {data['share_license_status']}"
                if provider == "met":
                    return f"met-{identifier}: {data['title']} — isPublicDomain={data['isPublicDomain']}"
                return "commons-mona-lisa: metadata retrieved"
            except Exception as error:
                return f"ERROR {provider}-{identifier}: {error}"
        failed = False
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            for line in pool.map(collect, jobs):
                print(line)
                failed = failed or line.startswith("ERROR ")
        raise SystemExit(1 if failed else 0)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(search, args.names or SEARCHES):
            print(result)
