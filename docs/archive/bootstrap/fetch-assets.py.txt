"""Download public-domain museum reproductions and the reference fonts locally."""
import concurrent.futures
import json
import pathlib
import re
import subprocess
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'public/assets'
ASSETS.mkdir(parents=True, exist_ok=True)
IDS = [436535, 436105, 437654, 45434, 544442, 544450, 544227,
       544453, 544184, 9480, 35, 20804, 820892, 1085, 204758,
       204759, 250945, 467642, 544864]


def get(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(request, timeout=60).read()


def museum(object_id):
    info = json.loads(get(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}'))
    if not info['isPublicDomain'] or not info['primaryImageSmall']:
        raise ValueError(f'No public-domain reproduction for {object_id}')
    name = f'work-{object_id}.jpg'
    (ASSETS / name).write_bytes(get(info['primaryImageSmall']))
    return name, {'source': info['objectURL'], 'image': info['primaryImageSmall'],
                  'license': 'CC0 — The Metropolitan Museum of Art Open Access',
                  'title': info['title'], 'artist': info['artistDisplayName'],
                  'date': info['objectDate'], 'medium': info['medium']}


# Extract the actual artwork images, not the header logo/profile in the HTML.
reference = (ROOT / 'stitch_booster_pack_opening_platform/boutique_des_boosters_muse/code.html').read_text()
images = re.findall(r'<img[^>]+src="([^"]+)"', reference)
backgrounds = re.findall(r"background-image: url\('([^']+)'\)", reference)
atelier = (ROOT / 'stitch_booster_pack_opening_platform/l_atelier_d_ouverture_muse/code.html').read_text()
atelier_backgrounds = re.findall(r"background-image: url\('([^']+)'\)", atelier)
reference_assets = {
    'hero-texture': backgrounds[0], 'hero-bust': images[2], 'hero-art': images[3],
    'teaser-portrait': images[4], 'teaser-blue': images[5],
    'renaissance-art': images[6], 'renaissance-texture': backgrounds[1],
    'impasto-art': images[10], 'impasto-texture': backgrounds[2],
    'regards-art': images[14], 'regards-texture': backgrounds[3],
    'gold-art': images[18], 'gold-texture': backgrounds[4],
    'atelier-bg': atelier_backgrounds[0], 'atelier-pack': atelier_backgrounds[1],
}
reference_records = {}
for name, url in reference_assets.items():
    file = ASSETS / f'{name}.jpg'
    file.write_bytes(get(url))
    reference_records[file.name] = {
        'source': url,
        'origin': 'Maquette fournie par l’utilisateur. Visuel illustratif synthétique, pas une reproduction historique.'}

# Remove baked-in navigation from the source presentation imagery.
for name, box in {'hero-texture': (0, 25, 512, 279),
                  'atelier-bg': (73, 16, 440, 279),
                  'atelier-pack': (167, 0, 346, 279)}.items():
    file = ASSETS / f'{name}.jpg'
    reference_records[file.name]['crop'] = list(box)

subprocess.run(['node', str(ROOT / 'scripts/crop-assets.mjs')], cwd=ROOT, check=True)


with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    records = dict(pool.map(museum, IDS))

MONA_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Mona_Lisa.jpg/500px-Mona_Lisa.jpg'
(ASSETS / 'work-mona-lisa.jpg').write_bytes(get(MONA_URL))
records['work-mona-lisa.jpg'] = {
    'source': 'https://commons.wikimedia.org/wiki/File:Mona_Lisa.jpg',
    'image': MONA_URL, 'license': 'Domaine public — Léonard de Vinci', 'title': 'La Joconde'}

for name, family in [('playfair', 'Playfair+Display:wght@400;500;600'),
                     ('inter', 'Inter:wght@400;500;600'),
                     ('space', 'Space+Grotesk:wght@400;500;600')]:
    css = get(f'https://fonts.googleapis.com/css2?family={family}&display=swap').decode()
    urls = list(dict.fromkeys(re.findall(r'url\(([^)]+)\)', css)))
    # This user agent receives one Latin-compatible font per requested weight.
    for i, url in enumerate(urls):
        (ASSETS / f'{name}-{i}.woff2').write_bytes(get(url))
    print(name, len(urls))

for family in ['inter', 'playfairdisplay', 'spacegrotesk']:
    license_url = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt'
    (ASSETS / f'{family}-OFL.txt').write_bytes(get(license_url))

manifest_path = ASSETS / 'provenance.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
manifest.update(reference_records)
manifest.update(records)
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(f'{len(records)} reproductions téléchargées.')
