#!/usr/bin/env python3
"""
Cut the waving mascot out of `assets/no background mascot waving.jpg`.

AUTHORING TOOL, not shipped (python3 + numpy + Pillow). Output: assets/img/mascot-wave.png
and mascot-wave.webp (transparent, cropped to the figure). The original is never modified
and no mascot pixel is repainted: only the background is removed, edge pixels are
re-coloured from the figure interior (de-fringe) and the alpha edge is feathered ~1px.

Why this is not a plain colour key: the source has a *fake* transparency checkerboard baked
into the pixels (light 255 / dark ~217 tiles, ~11.9px, irregular grid, JPEG ringing, faint
white haze streaks), and the figure's body is white on a white tile. The method:

  1. Background-like pixels = neutral, flat 3x3 neighbourhoods at the two checker levels,
     plus tile-edge transition pixels; dark-tile pixels near strongly purple pixels use a
     looser neutrality (chroma bleed) while light ones never do (that is what protects the
     white head/body from being eaten). Bridge 1-2px gaps by a morphological close.
  2. Flood fill from the image border over that set = background. Everything else is
     foreground (figure + haze + leftover tile-edge mesh).
  3. Open (square SE) and keep the large component to drop the mesh and haze; peel
     "fringe" pixels (bright, neutral/bluish) inward from the boundary; remove the enclosed
     checker between the legs (large bridged-candidate component inside the figure).
  4. Remove light low-chroma specks not connected to a large white face, fill holes,
     keep components >= 1500px, erode 1px, feather (gaussian 0.7), de-fringe colours.

Validate by compositing over paper / night / purple (see the report); body must stay solid.
Usage: python3 scripts/dev/build-mascot.py   (from the repo root)
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "no background mascot waving.jpg"
OUT = ROOT / "assets" / "img"

im = Image.open(SRC).convert("RGB")
a = np.array(im).astype(int)
H, W, _ = a.shape
g = a.mean(2)
sat = a.max(2) - a.min(2)
BR = a[..., 2] - a[..., 0]


def shift(m, dy, dx):
    out = np.zeros_like(m)
    ys = slice(max(dy, 0), H + min(dy, 0)); yd = slice(max(-dy, 0), H + min(-dy, 0))
    xs = slice(max(dx, 0), W + min(dx, 0)); xd = slice(max(-dx, 0), W + min(-dx, 0))
    out[ys, xs] = m[yd, xd]
    return out


def dil(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= shift(m, dy, dx)
    return out


def ero(m, r):
    return ~dil(~m, r)


def cross(m):
    return shift(m, 1, 0) | shift(m, -1, 0) | shift(m, 0, 1) | shift(m, 0, -1)


def label(m):
    lab = np.zeros((H, W), int)
    n = 0
    sizes = [0]
    for y0 in range(H):
        for x0 in np.nonzero(m[y0] & (lab[y0] == 0))[0]:
            if lab[y0, x0]:
                continue
            n += 1
            lab[y0, x0] = n
            q = deque([(y0, x0)])
            c = 0
            while q:
                y, x = q.popleft()
                c += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and m[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        q.append((yy, xx))
            sizes.append(c)
    return lab, sizes


def flood(cand):
    seen = np.zeros((H, W), bool)
    q = deque()
    for x in range(W):
        for y in (0, H - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(H):
        for x in (0, W - 1):
            if cand[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and cand[yy, xx] and not seen[yy, xx]:
                seen[yy, xx] = True
                q.append((yy, xx))
    return seen


def keep_large(m, min_size, open_r=2, recover=2):
    op = dil(ero(m, open_r), open_r)
    lab, sizes = label(op)
    keep = np.zeros_like(m)
    for i, sz in enumerate(sizes):
        if i and sz >= min_size:
            keep |= lab == i
    for _ in range(recover):
        keep = dil(keep, 1) & m
    return keep


# 1-2. background candidates + flood from the border --------------------------------------
neutral_strict = (np.abs(a[..., 0] - a[..., 1]) <= 2) & (np.abs(a[..., 1] - a[..., 2]) <= 2) & (np.abs(a[..., 0] - a[..., 2]) <= 2)
neutral_loose = (np.abs(a[..., 0] - a[..., 1]) <= 4) & (np.abs(a[..., 1] - a[..., 2]) <= 4) & (np.abs(a[..., 0] - a[..., 2]) <= 5)
near_purple = dil(sat >= 35, 12)
light = neutral_strict & (g >= 252)
dark = (neutral_strict | (neutral_loose & near_purple)) & (g >= 213) & (g <= 222)
flatL, flatD = ero(light, 1), ero(dark, 1)
core = flatL | flatD
trans = neutral_strict & (g > 222) & (g < 252) & dil(flatL, 2) & dil(flatD, 2)
cand = core | trans | (dil(core, 1) & neutral_strict & (g >= 213))
cand2 = ero(dil(cand, 2), 2)  # bridge tile-edge lines
bg = flood(cand2)
fg0 = ~bg

# 3. mesh/haze removal, enclosed checker between the legs, fringe peel -------------------------
fg = keep_large(fg0, 1)  # largest-ish structures only (opening drops the mesh)
lab, sizes = label(dil(ero(fg0, 2), 2))
fg = lab == (int(np.argmax(sizes[1:])) + 1)
for _ in range(3):
    fg = dil(fg, 1) & fg0
fg = ~flood(~fg)  # fill enclosed holes

lab, sizes = label(cand2 & fg)
gap = np.zeros_like(fg)
for i, sz in enumerate(sizes):
    if i and sz >= 1500:
        gap |= lab == i
cur = fg & ~dil(gap, 1)

fringe = (np.abs(BR) <= 1) & (np.abs(a[..., 1] - a[..., 0]) <= 1) & (sat <= 2) & (g >= 208)
for _ in range(22):
    rm = cur & cross(~cur) & fringe
    if not rm.any():
        break
    cur &= ~rm
cur = keep_large(cur, 100000, open_r=2, recover=2)
cur = ~flood(~cur)
cur &= ~gap

fringe2 = (g >= 205) & (BR >= -1)
for _ in range(9):
    rm = cur & cross(~cur) & fringe2
    if not rm.any():
        break
    cur &= ~rm
cl = ero(dil(cur, 2), 2)
cur = keep_large(cl, 100000, open_r=2, recover=0)
cur = ~flood(~cur)
cur &= ~gap

# 4. specks, holes, final components ------------------------------------------------------------
Wl = cur & (g >= 198) & (sat < 30)
recW = dil(ero(Wl, 4), 4)
for _ in range(7):
    recW = dil(recW, 1) & Wl
cur &= ~(Wl & ~recW)
cur = ~flood(~cur)
cur &= ~gap
cur = keep_large(ero(dil(cur, 1), 1), 1500, open_r=2, recover=2)

# alpha + de-fringe -------------------------------------------------------------------------------------
hard = ero(cur, 1)
known = ero(cur, 3)
col = a.astype(float).copy()
for _ in range(4):
    unknown = cur & ~known
    nbr = dil(known, 1)
    upd = unknown & nbr
    if not upd.any():
        break
    acc = np.zeros_like(col)
    cnt = np.zeros((H, W))
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
        k = shift(known, dy, dx)
        acc += np.roll(np.roll(col, dy, 0), dx, 1) * k[..., None]
        cnt += k
    m = upd & (cnt > 0)
    col[m] = acc[m] / cnt[m][..., None]
    known |= m
alpha = np.array(Image.fromarray((hard * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)))
rgba = np.dstack([np.clip(col, 0, 255).astype(np.uint8), alpha])
img = Image.fromarray(rgba, "RGBA")
ys, xs = np.nonzero(alpha > 0)
pad = 6
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, W), min(ys.max() + pad + 1, H))
img = img.crop(box)
OUT.mkdir(parents=True, exist_ok=True)
img.save(OUT / "mascot-wave.png", optimize=True)
img.save(OUT / "mascot-wave.webp", "WEBP", lossless=True, method=6)
print("crop box", box, "size", img.size)
