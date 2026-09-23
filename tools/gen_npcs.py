"""gen_npcs.py — optional NPC portrait generator.

Writes assets/npc/<id>.png for each NPC in js/data/npcs.js. The game uses a PNG if present,
otherwise its own procedural pixel sprite. One image per NPC, no variants.

Backends:
  openrouter  — illustrated cyberpunk portraits via google/gemini-3-pro-image (default)
  pixellab    — 64x64 pixel-art portraits via api.pixellab.ai

Usage (from the repo root):
  python tools/gen_npcs.py                       # all NPCs, openrouter
  python tools/gen_npcs.py --backend pixellab    # pixel art
  python tools/gen_npcs.py --only root,cider     # a subset
  python tools/gen_npcs.py --dry                 # print prompts only

Keys (edit the paths if yours moved):
  OPENROUTER: C:/Users/Seonso/Desktop/living-trust-property/ltp-secrets/OPENROUTER_KEY.txt
  PIXELLAB:   C:/Users/Seonso/Desktop/seonso_kit/SEONSO_SECRETS/PIXEL_SECRET.txt
"""
import argparse, base64, io, json, os, re, sys, time

OPENROUTER_KEY_PATH = r"C:/Users/Seonso/Desktop/living-trust-property/ltp-secrets/OPENROUTER_KEY.txt"
PIXELLAB_KEY_PATH = r"C:/Users/Seonso/Desktop/seonso_kit/SEONSO_SECRETS/PIXEL_SECRET.txt"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "npc")
MODEL = "google/gemini-3-pro-image"

STYLE = (
    "Single character portrait, head and shoulders, facing the viewer, centred. Cyberpunk night-city "
    "aesthetic: neon cyan and magenta rim light, dark teal background with faint scanlines, subtle chrome "
    "implants. Clean stylised digital illustration, consistent series style, readable at 192 pixels. "
    "No text, no lettering, no logo, no watermark, no frame. Square image. "
)

# id -> subject description. Names are the giveaway; looks echo the system they embody.
SUBJECTS = {
    "dispatch": "a fixer wearing a headset, sharp eyes, magenta earpiece light, neutral face, dark utility jacket.",
    "osi": "a courier guildmaster with a purple bob haircut and round glasses, seven thin glowing stripes on the collar, warm slight smile.",
    "enable": "a bald bouncer with a dark beard and a chrome temple implant, green eyes, black jacket, arms folded, stern.",
    "cider": "a bartender with a copper-red bun, freckles, yellow LED cheek marks, brown apron, a knowing grin.",
    "mac": "a friendly doorman with spiky black hair under a green cap, quick eyes, green jacket, open smile.",
    "veelan": "a district organizer with long black hair and a thin scar over one eyebrow, magenta eyes, deep-plum coat, serious.",
    "root": "an elderly bridge keeper with grey hair and a full grey beard, calm pale-blue eyes, plain dark robe, quietly wise.",
    "nexthop": "a cab driver with a yellow cap and a broad grin, brown skin, yellow high-visibility jacket.",
    "ospef": "a cartographer with wild grey-brown hair and amber-tinted glasses, a small drone hovering by the shoulder, navy coat.",
    "syn": "a courier with a cyan mohawk and cyan cheek LEDs, bright smile, dark blue racing jacket.",
    "sixx": "a tall calm figure with long white hair, pale blue-grey skin tone, violet eyes, a thin light halo, deep navy coat.",
    "denise": "an operator with a black bob and a headset, dark brown skin, warm smile, navy uniform with gold trim.",
    "shell": "a hooded locksmith with a black face mask, only green eyes visible, black hoodie, wary.",
    "nat": "a smooth mask dealer with orange-tinted glasses, chrome jawline implant, purple suit, sly grin.",
    "ace": "a gatekeeper with short dark-red hair and a scar on the cheek, red eyes, dark leather coat, flat unimpressed expression, a small brown guard dog beside her.",
    "beacon": "a pirate-radio DJ with magenta spiky hair, a small antenna headband, yellow cheek LEDs, huge grin, navy bomber jacket.",
    "hypervisor": "a professor with a grey bun and round glasses, white lab coat over a blue shirt, delighted expression, a black cat on the shoulder.",
    "jason": "a neat data broker with short black hair, clear glasses, white shirt and orange tie, polite smile.",
    "ansible": "an orchestrator with a bald head and a green visor across the eyes, dark teal coat, a small drone at the shoulder, calm.",
}


def load_ids():
    src = open(os.path.join(ROOT, "js", "data", "npcs.js"), encoding="utf-8").read()
    return re.findall(r"^\s{2}(\w+): \{ name:", src, re.M)


def read_key(path):
    try:
        return open(path, encoding="utf-8").read().strip()
    except FileNotFoundError:
        sys.exit(f"key file not found: {path}  (edit the path at the top of this script)")


def gen_openrouter(key, npc, prompt):
    import requests
    payload = {"model": MODEL, "modalities": ["image", "text"], "messages": [{"role": "user", "content": prompt}], "image_config": {"aspect_ratio": "1:1"}}
    for attempt in range(3):
        r = requests.post("https://openrouter.ai/api/v1/chat/completions", headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, json=payload, timeout=300)
        if r.status_code != 200:
            print(f"[{npc}] HTTP {r.status_code}: {r.text[:200]}"); time.sleep(5 * (attempt + 1)); continue
        d = r.json(); imgs = d["choices"][0]["message"].get("images") or []
        if not imgs:
            print(f"[{npc}] no image: {json.dumps(d)[:200]}"); time.sleep(5); continue
        return base64.b64decode(imgs[0]["image_url"]["url"].split(",", 1)[1])
    return None


def gen_pixellab(key, npc, prompt):
    import requests
    payload = {"description": prompt, "image_size": {"width": 64, "height": 64}, "no_background": True, "text_guidance_scale": 8, "outline": "single color black outline", "shading": "basic shading", "detail": "medium detail", "view": "low top-down", "direction": "south"}
    r = requests.post("https://api.pixellab.ai/v1/generate-image-pixflux", headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, json=payload, timeout=300)
    if r.status_code != 200:
        print(f"[{npc}] HTTP {r.status_code}: {r.text[:200]}"); return None
    return base64.b64decode(r.json()["image"]["base64"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=["openrouter", "pixellab"], default="openrouter")
    ap.add_argument("--only", default="")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--force", action="store_true", help="overwrite existing PNGs")
    a = ap.parse_args()
    ids = load_ids(); only = [x for x in a.only.split(",") if x]
    os.makedirs(OUT, exist_ok=True)
    key = None if a.dry else read_key(OPENROUTER_KEY_PATH if a.backend == "openrouter" else PIXELLAB_KEY_PATH)
    for npc in ids:
        if only and npc not in only: continue
        path = os.path.join(OUT, npc + ".png")
        if os.path.exists(path) and not a.force: print(f"[{npc}] exists, skip"); continue
        subject = SUBJECTS.get(npc, "a cyberpunk netrunner NPC.")
        prompt = (STYLE + "The subject is " + subject) if a.backend == "openrouter" else ("pixel art portrait, cyberpunk, " + subject)
        if a.dry: print(f"[{npc}] {prompt}\n"); continue
        raw = gen_openrouter(key, npc, prompt) if a.backend == "openrouter" else gen_pixellab(key, npc, prompt)
        if not raw: print(f"[{npc}] FAILED"); continue
        from PIL import Image
        im = Image.open(io.BytesIO(raw)).convert("RGBA")
        if a.backend == "openrouter": im = im.resize((384, 384), Image.LANCZOS)
        im.save(path); print(f"[{npc}] saved {path} {im.size}")
    print("done")


if __name__ == "__main__":
    main()
