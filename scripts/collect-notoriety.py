"""Capture public identity/pageview evidence; never write the active catalogue."""

import concurrent.futures
import datetime as dt
import hashlib
import json
import pathlib
import re
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / "catalog/notoriety"
CACHE = DEST / "evidence"
START, END = "2025100100", "2026093000"
USER_AGENT = "MUSE-Catalog-Research/1.0 (editorial noncommercial audit)"
CACHE.mkdir(parents=True, exist_ok=True)
LOCKS = {}
LOCKS_GUARD = threading.Lock()
NETWORK_LOCK = threading.Lock()
LAST_REQUEST = 0.0
BLOCKED_HOSTS = set()


def capture(url):
    with LOCKS_GUARD:
        lock = LOCKS.setdefault(url, threading.Lock())
    with lock:
        return capture_locked(url)


def capture_locked(url):
    global LAST_REQUEST
    name = hashlib.sha256(url.encode()).hexdigest() + ".json"
    path = CACHE / name
    if path.exists():
        try:
            saved = json.loads(path.read_text())
            if saved["status"] == 200:
                return saved, "catalog/notoriety/evidence/" + name
        except (ValueError, KeyError):
            pass  # An interrupted technical cache entry can be captured again.
    with NETWORK_LOCK:
        host = urllib.parse.urlparse(url).netloc
        if host in BLOCKED_HOSTS:
            return {"url": url, "retrievedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
                    "status": 429, "response": {"error": "Collecte différée : fournisseur limité pendant cette exécution."}}, ""
        time.sleep(max(0, 6.0 - (time.monotonic() - LAST_REQUEST)))
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=45) as response:
                body = json.load(response)
                status = response.status
        except (urllib.error.URLError, TimeoutError, ValueError) as error:
            status = getattr(error, "code", None)
            body = {"error": str(error)}
            if status == 429:
                # Respect the provider rather than racing more requests.
                retry_after = error.headers.get("Retry-After", "30")
                time.sleep(min(120, int(retry_after) if retry_after.isdigit() else 30))
                BLOCKED_HOSTS.add(host)
        LAST_REQUEST = time.monotonic()
    saved = {"url": url, "retrievedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
             "status": status, "response": body}
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(saved, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)
    return saved, "catalog/notoriety/evidence/" + name


def entity(qid):
    saved, evidence = capture(f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json")
    return saved["response"].get("entities", {}).get(qid, {}), evidence


def pageviews(language, title):
    # Wikidata's current sitelink supplies the canonical title. Historic page
    # moves are not aggregated: that limitation remains explicit in the report.
    canonical = title
    article = urllib.parse.quote(canonical.replace(" ", "_"), safe="")
    url = f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/{language}.wikipedia/all-access/user/{article}/monthly/{START}/{END}"
    saved, evidence = capture(url)
    items = saved["response"].get("items", [])
    expected = [f"2025{m:02}0100" for m in range(10, 13)] + [f"2026{m:02}0100" for m in range(1, 10)]
    complete = (saved["status"] == 200 and sorted(i.get("timestamp", "") for i in items) == expected
                and all(isinstance(i.get("views"), int) and i["views"] >= 0 for i in items))
    return {"language": language, "title": canonical,
            "url": f"https://{language}.wikipedia.org/wiki/{article}",
            "status": "measured" if complete else "unavailable_or_incomplete",
            "views": sum(i["views"] for i in items) if complete else None,
            "months": len(items), "evidence": [evidence]}


def audience(qid):
    data, evidence = entity(qid)
    pages = []
    for language in ["fr", "en"]:
        link = data.get("sitelinks", {}).get(language + "wiki")
        if link:
            pages.append(pageviews(language, link["title"]))
    return {"qid": qid, "label": data.get("labels", {}).get("en", {}).get("value"),
            "identityEvidence": evidence, "identityAvailable": bool(data), "pages": pages}


def institution(work):
    identifier = work["id"]
    key = identifier if identifier.startswith("cma-") else "commons-mona-lisa" if identifier == "mona-lisa" else "met-" + identifier
    path = ROOT / "catalog/evidence" / (key + ".json")
    record = json.loads(path.read_text())
    raw = record["response"]
    data = raw["data"] if identifier.startswith("cma-") else raw
    if identifier.startswith("cma-"):
        links = (data.get("external_resources") or {}).get("wikidata", [])
    elif identifier == "mona-lisa":
        links = ["https://www.wikidata.org/wiki/Q12418"]
    else:
        links = [data.get("objectWikidata_URL") or ""]
    qids = [re.search(r"Q\d+$", link).group() for link in links if re.search(r"Q\d+$", link)]
    return qids[0] if len(qids) == 1 else None, str(path.relative_to(ROOT)), data


def collect(work):
    qid, source_evidence, raw = institution(work)
    # The Met impression belongs to this identical print composition. This is a
    # reviewed exception, NOT a general traversal to the parent series (P361).
    scope = "composition" if work["id"] == "45434" else "exact_object"
    audience_id = "Q252485" if work["id"] == "45434" else qid
    work_audience = audience(audience_id) if audience_id else None
    data, identity_evidence = entity(qid) if qid else ({}, None)
    creators = []
    attribution = bool(re.search(r"Atelier|atelier|Attribué|Suiveur|Entourage|Probablement|Culture|culture|Fabrication", work["creatorDisplayName"]))
    unresolved_creator = attribution
    for claim in data.get("claims", {}).get("P170", []):
        if claim.get("rank") == "deprecated":
            continue
        value = claim["mainsnak"].get("datavalue", {}).get("value", {})
        if not isinstance(value, dict) or not value.get("id") or claim.get("qualifiers", {}).get("P1480"):
            unresolved_creator = True
            continue
        if value["id"] not in creators:
            creators.append(value["id"])
    if not creators:
        unresolved_creator = True
    artists = [audience(artist) for artist in creators] if not unresolved_creator else []
    citations = len(raw.get("citations") or []) if work["id"].startswith("cma-") else None
    exhibitions = len((raw.get("exhibitions") or {}).get("current", [])) if work["id"].startswith("cma-") else None
    return {"id": work["id"], "title": work["title"], "creator": work["creatorDisplayName"],
            "sourceUrl": work["sources"][0]["url"], "institutionEvidence": source_evidence,
            "objectQid": qid, "objectIdentityEvidence": identity_evidence,
            "audienceScope": scope, "workAudience": work_audience,
            "creatorStatus": "unresolved_or_uncertain" if unresolved_creator else "identified",
            "artistAudiences": artists,
            "institutionSignals": {"citations": citations, "exhibitions": exhibitions,
                                   "highlight": raw.get("is_highlight", raw.get("isHighlight"))}}


def main():
    seed_bytes = (ROOT / "src/catalog/seed.json").read_bytes()
    dataset = json.loads(seed_bytes)
    print("Collecte des identités et audiences de 100 œuvres (cache réutilisé).", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        records = list(pool.map(collect, dataset["works"]))
    result = {"schemaVersion": 1, "period": {"start": "2025-10-01", "end": "2026-09-30", "days": 365},
              "languages": ["fr", "en"], "access": "all-access", "agent": "user",
              "trends": {"status": "not_collected", "reason": "Pas d’export Google Trends comparable ; aucune valeur supposée."},
              "seedSha256": hashlib.sha256(seed_bytes).hexdigest(),
              "works": records}
    temporary = DEST / "observations.tmp"
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(DEST / "observations.json")
    print(f"{len(records)} œuvres examinées ; {sum(bool(r['objectQid']) for r in records)} identités Wikidata liées aux notices.")
    print(f"{sum(bool(r['workAudience'] and r['workAudience']['pages']) for r in records)} œuvres avec une page fr/en ; aucune rareté active modifiée.")


if __name__ == "__main__":
    main()
