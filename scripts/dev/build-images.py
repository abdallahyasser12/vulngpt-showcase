#!/usr/bin/env python3
"""
Build the responsive WebP derivatives of the genuine product captures and the lab scene.

AUTHORING TOOL, not shipped (needs python3 + Pillow with WebP support). The committed
outputs under assets/img/ are what the site serves. Originals in assets/ are never modified.

Rules (integrity): capture pixels are never edited. Derivatives are plain LANCZOS
downscales (no sharpening, no cropping, no colour changes) and are NEVER upscaled: a width
larger than the source is skipped. For sources narrower than the largest target a
native-width WebP (`<slug>-<native>.webp`) is added so full-size viewing stays possible.

Also builds the lab-scene derivatives (portrait 784/640 and a native-resolution wide crop).

Usage: python3 scripts/dev/build-images.py   (from the repo root)
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
OUT = ASSETS / "img"

CAPTURES = {  # slug -> original file (genuine captures)
    "dashboard": "dashboard.png",
    "findings": "findings.png",
    "bola-finding": "bola finding.png",
    "live-vision": "live vision.png",
    "red-team-report": "elte red team report.png",  # sic: the original file name carries the typo
    "landing-page": "landing page.png",
    "site-home": "site-home.png",
    "site-waitlist": "site-waitlist.png",
}
TARGETS = (640, 1000, 1600)
QUALITY, METHOD = 84, 6

# Lab-scene wide crop (x0, y0, x1, y1) in the 784x1168 original; chosen by viewing candidates.
LAB_WIDE_CROP = (0, 308, 784, 831)  # 784x523 (3:2): full antennae, head, torso, hands, bench top; the lamp only fits the portrait


def to_rgb(im):
    if im.mode == "RGBA" and im.getchannel("A").getextrema()[0] == 255:
        return im.convert("RGB")
    return im


def save_webp(im, path):
    im.save(path, "WEBP", quality=QUALITY, method=METHOD)
    return path.stat().st_size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest, originals = {}, {}
    for slug, fname in CAPTURES.items():
        src = ASSETS / fname
        im = to_rgb(Image.open(src))
        w, h = im.size
        originals[fname] = {"width": w, "height": h, "bytes": src.stat().st_size}
        widths = [t for t in TARGETS if t <= w]
        if w < max(TARGETS) and w not in widths and w > TARGETS[1]:
            widths.append(w)  # native-width copy for the lightbox
        for tw in widths:
            th = round(h * tw / w)
            out = im if tw == w else im.resize((tw, th), Image.LANCZOS)
            name = f"{slug}-{tw}.webp"
            manifest[name] = {"width": tw, "height": th, "bytes": save_webp(out, OUT / name)}

    # lab scene
    lab = Image.open(ASSETS / "mascot eating bugs.jpg").convert("RGB")
    originals["mascot eating bugs.jpg"] = {"width": lab.width, "height": lab.height,
                                           "bytes": (ASSETS / "mascot eating bugs.jpg").stat().st_size}
    for name, im in (("lab-scene-784.webp", lab),
                     ("lab-scene-640.webp", lab.resize((640, round(lab.height * 640 / lab.width)), Image.LANCZOS)),
                     ("lab-scene-wide.webp", lab.crop(LAB_WIDE_CROP))):
        manifest[name] = {"width": im.width, "height": im.height, "bytes": save_webp(im, OUT / name)}

    # mascot cutout, when scripts/dev/build-mascot.py produced one
    for name in ("mascot-wave.webp", "mascot-wave.png"):
        p = OUT / name
        if p.exists():
            with Image.open(p) as m:
                manifest[name] = {"width": m.width, "height": m.height, "bytes": p.stat().st_size}

    out = dict(sorted(manifest.items()))
    out["_originals"] = originals  # native sizes of the source captures (informational)
    (OUT / "manifest.json").write_text(json.dumps(out, indent=2) + "\n")
    tot_new = sum(v["bytes"] for k, v in manifest.items() if k.endswith(".webp") and not k.startswith(("lab", "mascot", "_")))
    tot_old = sum(v["bytes"] for k, v in originals.items() if not k.startswith("mascot"))
    print(f"capture webp total {tot_new} bytes (all sizes) vs originals {tot_old} bytes")


if __name__ == "__main__":
    main()
