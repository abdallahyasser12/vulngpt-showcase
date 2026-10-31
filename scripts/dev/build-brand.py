#!/usr/bin/env python3
"""
Rebuild the VulnGPT brand mark as clean vector SVGs.

AUTHORING TOOL, not shipped: the repo itself stays dependency-free and the committed
outputs under assets/brand/ are what the site serves. Requires python3 with numpy.

Source: assets/vulngpt logo.png (4096x4096, hard-thresholded white-on-black trace of a
pixel-art bug inside a magnifying-glass ring; unusable directly). Method:

  1. Ink mask = opaque white pixels of the source.
  2. Lens ring: rays from a rough centre find the outer / inner ink edge per angle; a
     least-squares (Kasa) circle fit on each edge, iterated; the ring is emitted as a
     true circle stroke (centre + mid radius + stroke width from the fits).
  3. Handle: ink outside the ring; PCA gives the axis, the perpendicular spread gives the
     width; emitted as a straight bar with a true semicircular end cap (the end next to the
     ring is hidden under the ring stroke).
  4. Bug: ink inside the lens. The source art is NOT on a uniform pixel grid (edge-position
     histograms and a grid-fit search show no single cell size; reconstruction error stays
     at 15-20% of ink for every candidate grid between 60 and 120 px). The dominant
     periodicity of every edge is a lattice of ~23.5 px (4096 space), so the bug is
     majority-sampled on that lattice (best phase search, ~6% reconstruction error =
     source wobble), tiny speckle removed, and the boundary traced into orthogonal
     polygons (no rectangle seams, a few hundred bytes of path data).
  5. Output SVGs use a 512 viewBox, mark centred, shape-rendering:crispEdges on the pixels.

Usage: python3 scripts/dev/build-brand.py   (run from the repo root)
Then:  node scripts/dev/render-brand.mjs     (rasterises PNG/ICO from the SVGs)
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "vulngpt logo.png"
OUT = ROOT / "assets" / "brand"

# Brand
GRADIENT = [("0", "#aab4ff"), ("0.5", "#e1a6f4"), ("1", "#7fd3ff")]
NIGHT = "#0A0B10"

LATTICE = 23.5          # px in source space (see header)
# Favicon only: a hand-set 9x9 pixel bug with the same silhouette ideas as the full mark (two
# antennae, head, thorax, abdomen, three legs per side) and no interior detail, so it stays a
# bug at 16px where the traced 80-cell-wide original turns to mush.
FAV_BUG = [
    ".X.....X.",
    "..X...X..",
    "...XXX...",
    "X.XXXXX.X",
    ".XXXXXXX.",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "X.XXXXX.X",
    "..XXXXX..",
]


# ---------------------------------------------------------------------------------------
def load_ink():
    a = np.array(Image.open(SRC).convert("RGBA"))
    return (a[..., 3] > 127) & (a[..., 0] > 127)


def kasa(pts):
    x, y = pts[:, 0], pts[:, 1]
    A = np.c_[2 * x, 2 * y, np.ones(len(x))]
    b = x * x + y * y
    c = np.linalg.lstsq(A, b, rcond=None)[0]
    cx, cy = c[0], c[1]
    return cx, cy, float(np.sqrt(c[2] + cx * cx + cy * cy))


def fit_ring(ink):
    H, W = ink.shape
    cx, cy, R = 2260.0, 1840.0, 1330.0  # rough start, refined below
    for _ in range(4):
        outer, inner = [], []
        for th in np.arange(0, 360, 0.5):
            if 105 < th < 165:  # handle wedge (image coords, y down)
                continue
            t = np.deg2rad(th)
            rs = np.arange(R * 0.80, R * 1.12, 0.5)
            xs = (cx + rs * np.cos(t)).round().astype(int)
            ys = (cy + rs * np.sin(t)).round().astype(int)
            ok = (xs >= 0) & (xs < W) & (ys >= 0) & (ys < H)
            v, r = ink[ys[ok], xs[ok]], rs[ok]
            idx = np.nonzero(v)[0]
            if len(idx) == 0:
                continue
            last = idx[-1]
            k = last
            while k > 0 and v[k - 1]:
                k -= 1
            outer.append((cx + r[last] * np.cos(t), cy + r[last] * np.sin(t)))
            inner.append((cx + r[k] * np.cos(t), cy + r[k] * np.sin(t)))
        co, ci = kasa(np.array(outer)), kasa(np.array(inner))
        cx, cy = (co[0] + ci[0]) / 2, (co[1] + ci[1]) / 2
        R = (co[2] + ci[2]) / 2
    return cx, cy, (co[2] + ci[2]) / 2, co[2] - ci[2], co[2]  # centre, mid radius, stroke, outer R


def fit_handle(ink, cx, cy, r_out):
    yy, xx = np.nonzero(ink)
    r = np.hypot(xx - cx, yy - cy)
    sel = r > r_out + 60
    P = np.c_[xx[sel], yy[sel]].astype(float)
    m = P.mean(0)
    _, _, vt = np.linalg.svd(P - m, full_matrices=False)
    d, n = vt[0], vt[1]
    if d[0] > 0:
        d = -d
    t, q = (P - m) @ d, (P - m) @ n
    mid = t > t.min() + 250
    width = np.percentile(q[mid], 99.5) - np.percentile(q[mid], 0.5)
    far = float((m + d * t.max() - np.array([cx, cy])) @ d)  # extreme point, along-axis from ring centre
    return m, d, width, far


def lattice_quantise(B, p, ox, oy):
    h, w = B.shape
    I = np.pad(B.astype(np.int64).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    nx, ny = int(np.ceil((w + ox) / p)), int(np.ceil((h + oy) / p))
    Q = np.zeros((ny, nx), bool)
    for j in range(ny):
        for i in range(nx):
            xa, xb = int(max(0, round(i * p - ox))), int(min(w, round((i + 1) * p - ox)))
            ya, yb = int(max(0, round(j * p - oy))), int(min(h, round((j + 1) * p - oy)))
            if xb <= xa or yb <= ya:
                continue
            s = I[yb, xb] - I[ya, xb] - I[yb, xa] + I[ya, xa]
            Q[j, i] = s > 0.5 * (xb - xa) * (yb - ya)
    return Q


def recon_err(Q, B, p, ox, oy):
    h, w = B.shape
    R = np.zeros_like(B, bool)
    for j, i in zip(*np.nonzero(Q)):
        xa, xb = int(max(0, round(i * p - ox))), int(min(w, round((i + 1) * p - ox)))
        ya, yb = int(max(0, round(j * p - oy))), int(min(h, round((j + 1) * p - oy)))
        R[ya:yb, xa:xb] = True
    return (R ^ B).sum() / B.sum()


def best_lattice(B, p):
    best = None
    step = max(2.0, p / 8)
    for ox in np.arange(0, p, step):
        for oy in np.arange(0, p, step):
            Q = lattice_quantise(B, p, ox, oy)
            e = recon_err(Q, B, p, ox, oy)
            if best is None or e < best[0]:
                best = (e, ox, oy, Q)
    return best


def components(M, val):
    H, W = M.shape
    seen = np.zeros_like(M, bool)
    out = []
    for j in range(H):
        for i in range(W):
            if M[j, i] == val and not seen[j, i]:
                st, cs = [(j, i)], []
                seen[j, i] = True
                while st:
                    a, b = st.pop()
                    cs.append((a, b))
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        c, d = a + da, b + db
                        if 0 <= c < H and 0 <= d < W and not seen[c, d] and M[c, d] == val:
                            seen[c, d] = True
                            st.append((c, d))
                out.append(cs)
    return out


def smooth(Q, passes=2):
    """Remove 1-cell spurs and fill 1-cell dents (real features are >= 3 cells wide at this lattice)."""
    Q = Q.copy()
    for _ in range(passes):
        P = np.pad(Q, 1)
        nb = P[:-2, 1:-1].astype(int) + P[2:, 1:-1] + P[1:-1, :-2] + P[1:-1, 2:]
        spur = Q & (nb <= 1)
        dent = (~Q) & (nb >= 3)
        Q = (Q & ~spur) | dent
    return Q


def clean(Q, min_ink=3, keep_hole_min=9, smooth_passes=2):
    """Drop ink specks and thin spurs; drop interior holes that are not 'eye-sized' (speckle / slits)."""
    Q = smooth(Q, smooth_passes)
    for cs in components(Q, True):
        if len(cs) < min_ink:
            for a, b in cs:
                Q[a, b] = False
    P = np.pad(Q, 2)
    for cs in components(P, False):
        n = len(cs)
        touches = any(a == 0 or b == 0 or a == P.shape[0] - 1 or b == P.shape[1] - 1 for a, b in cs)
        if touches:
            continue  # the background
        # a real eye is a compact blob of >= keep_hole_min cells; a thin slit or a lone dot is source noise
        ys = [a for a, _ in cs]
        xs = [b for _, b in cs]
        bw, bh = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1
        compact = n >= keep_hole_min and min(bw, bh) >= 3
        if not compact:
            for a, b in cs:
                P[a, b] = True
    return P[2:-2, 2:-2]


def trace(Q):
    """Orthogonal polygon loops (list of [(x,y)...] in cell units) bounding the True cells."""
    H, W = Q.shape
    nxt = {}
    P = np.pad(Q, 1)
    for j in range(H):
        for i in range(W):
            if not Q[j, i]:
                continue
            # directed edges keep the ink on the right-hand side (clockwise in y-down coords)
            if not P[j, i + 1]:  # top neighbour empty
                nxt.setdefault((i, j), []).append((i + 1, j))
            if not P[j + 2, i + 1]:  # bottom neighbour empty
                nxt.setdefault((i + 1, j + 1), []).append((i, j + 1))
            if not P[j + 1, i]:  # left neighbour empty
                nxt.setdefault((i, j + 1), []).append((i, j))
            if not P[j + 1, i + 2]:  # right neighbour empty
                nxt.setdefault((i + 1, j), []).append((i + 1, j + 1))
    loops = []
    while nxt:
        start = next(iter(nxt))
        cur, loop, prev = start, [start], None
        while True:
            cands = nxt[cur]
            if len(cands) > 1 and prev is not None:
                # at a pinch vertex prefer the right turn to keep loops simple
                dx, dy = cur[0] - prev[0], cur[1] - prev[1]
                right = (cur[0] - dy, cur[1] + dx)
                nx_ = next((c for c in cands if c == right), cands[0])
            else:
                nx_ = cands[0]
            cands.remove(nx_)
            if not cands:
                del nxt[cur]
            prev, cur = cur, nx_
            if cur == start:
                break
            loop.append(cur)
        loops.append(loop)
    # drop collinear points
    out = []
    for lp in loops:
        n = len(lp)
        keep = []
        for k in range(n):
            a, b, c = lp[k - 1], lp[k], lp[(k + 1) % n]
            if (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) != 0:
                keep.append(b)
        out.append(keep)
    return out


def fmt(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def loops_to_path(loops, tf):
    d = []
    for lp in loops:
        pts = [tf(x, y) for x, y in lp]
        d.append("M" + " ".join(f"{fmt(x)} {fmt(y)}" for x, y in pts) + "Z")
    return "".join(d)


# ---------------------------------------------------------------------------------------
def analyse():
    ink = load_ink()
    cx, cy, rmid, stroke, rout = fit_ring(ink)
    print(f"ring centre=({cx:.1f},{cy:.1f}) mid_r={rmid:.1f} stroke={stroke:.1f} outer_r={rout:.1f}")
    hm, hd, hwidth, far = fit_handle(ink, cx, cy, rout)
    ang = np.degrees(np.arctan2(hd[1], hd[0]))
    print(f"handle angle={ang:.2f}deg (emitted snapped to the 135deg diagonal through the ring centre) width={hwidth:.1f} extreme={far:.1f}px from ring centre")

    # bug mask inside the lens (a margin inside the ring's inner edge)
    H, W = ink.shape
    yy, xx = np.mgrid[0:H, 0:W]
    inside = np.hypot(xx - cx, yy - cy) < (rmid - stroke / 2 - 35)
    Bfull = ink & inside
    ys, xs = np.nonzero(Bfull)
    X0, Y0 = xs.min() - 20, ys.min() - 20
    B = Bfull[Y0 : ys.max() + 21, X0 : xs.max() + 21]
    e, ox, oy, Q = best_lattice(B, LATTICE)
    Q = clean(Q)
    loops = trace(Q)
    print(f"bug lattice={LATTICE}px phase=({ox:.1f},{oy:.1f}) reconstruction error={e*100:.1f}% cells={int(Q.sum())} loops={len(loops)}")
    return dict(cx=cx, cy=cy, rmid=rmid, stroke=stroke, rout=rout, hwidth=hwidth, far=far,
                loops=loops, X0=X0, Y0=Y0, ox=ox, oy=oy)


D = (-np.sqrt(0.5), np.sqrt(0.5))  # handle direction: bottom-left diagonal (y down)
N = (-D[1], D[0])


def handle_path(centre, start, cap, width):
    """Bar from `start` (distance along D from the ring centre, hidden under the ring) to a round cap."""
    hw = width / 2
    cx, cy = centre
    s = (cx + D[0] * start, cy + D[1] * start)
    e = (cx + D[0] * cap, cy + D[1] * cap)
    a = (s[0] + N[0] * hw, s[1] + N[1] * hw)
    b = (e[0] + N[0] * hw, e[1] + N[1] * hw)
    c = (e[0] - N[0] * hw, e[1] - N[1] * hw)
    d = (s[0] - N[0] * hw, s[1] - N[1] * hw)
    return (f"M{fmt(a[0])} {fmt(a[1])}L{fmt(b[0])} {fmt(b[1])}A{fmt(hw)} {fmt(hw)} 0 0 0 "
            f"{fmt(c[0])} {fmt(c[1])}L{fmt(d[0])} {fmt(d[1])}Z")


def full_geometry(g):
    """Full-detail mark: source geometry mapped into a 512 box, centred, 480 units across."""
    cx, cy, rmid, stroke, rout, hw_, far = g["cx"], g["cy"], g["rmid"], g["stroke"], g["rout"], g["hwidth"], g["far"]
    cap = far - hw_ / 2
    ex, ey = cx + D[0] * cap, cy + D[1] * cap
    x0, x1 = min(cx - rout, ex - hw_ / 2), max(cx + rout, ex + hw_ / 2)
    y0, y1 = min(cy - rout, ey - hw_ / 2), max(cy + rout, ey + hw_ / 2)
    scale = 480.0 / max(x1 - x0, y1 - y0)
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    tf = lambda x, y: ((x - mx) * scale + 256, (y - my) * scale + 256)
    rc = tf(cx, cy)
    p = LATTICE
    bug = loops_to_path(g["loops"], lambda i, j: tf(g["X0"] + i * p - g["ox"], g["Y0"] + j * p - g["oy"]))
    r = rmid * scale
    sw = stroke * scale
    hwid = hw_ * scale
    start = float(np.sqrt((r - sw / 2 + 12 * scale) ** 2 - (hwid / 2) ** 2))
    handle = handle_path(rc, start, cap * scale, hwid)
    return rc, r, sw, handle, bug


def fav_geometry():
    """Favicon: heavier strokes, shorter handle, hand-set 9x9 bug; designed to read at 16px."""
    rout, sw, hwid, ext, cell = 197.0, 42.0, 58.0, 319.0, 22.0
    r = rout - sw / 2
    cap = ext - hwid / 2
    off = (cap * np.sqrt(0.5) + hwid / 2 - rout) / 2  # centre the (ring + handle) bbox in the tile
    cx, cy = 256 + off, 256 - off
    handle = handle_path((cx, cy), float(np.sqrt((r - sw / 2 + 8) ** 2 - (hwid / 2) ** 2)), cap, hwid)
    n = len(FAV_BUG)
    bx0, by0 = round(cx - n * cell / 2), round(cy - n * cell / 2)
    cells = np.array([[ch == "X" for ch in row] for row in FAV_BUG])
    # row-run rectangles on integer coordinates (diagonal-only contacts stay as separate squares)
    d = []
    for j, row in enumerate(cells):
        i = 0
        while i < n:
            if row[i]:
                k = i
                while k < n and row[k]:
                    k += 1
                d.append(f"M{fmt(bx0 + i * cell)} {fmt(by0 + j * cell)}h{fmt((k - i) * cell)}v{fmt(cell)}h{fmt(-(k - i) * cell)}Z")
                i = k
            else:
                i += 1
    bug = "".join(d)
    return (cx, cy), r, sw, handle, bug


def svg_doc(rc, r, sw, handle, bug, paint, defs="", title="VulnGPT by NovaSecLabs mark", tile=None):
    out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
           f"<title>{title}</title>"]
    if defs:
        out.append(defs)
    if tile:
        out.append(tile)
    out.append(f'<g fill="{paint}">')
    out.append(f'<circle cx="{fmt(rc[0])}" cy="{fmt(rc[1])}" r="{fmt(r)}" fill="none" stroke="{paint}" stroke-width="{fmt(sw)}"/>')
    out.append(f'<path d="{handle}"/>')
    out.append(f'<path d="{bug}" fill-rule="evenodd" shape-rendering="crispEdges"/>')
    out.append("</g></svg>")
    return "\n".join(out) + "\n"


def main():
    g = analyse()
    OUT.mkdir(parents=True, exist_ok=True)
    stops = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in GRADIENT)
    grad = f'<defs><linearGradient id="vg" gradientUnits="userSpaceOnUse" x1="40" y1="40" x2="472" y2="472">{stops}</linearGradient></defs>'

    rc, r, sw, handle, bug = full_geometry(g)
    (OUT / "vulngpt-mark.svg").write_text(svg_doc(rc, r, sw, handle, bug, "currentColor"))
    (OUT / "vulngpt-mark-gradient.svg").write_text(svg_doc(rc, r, sw, handle, bug, "url(#vg)", grad))

    frc, fr, fsw, fhandle, fbug = fav_geometry()
    tile = f'<rect width="512" height="512" rx="112" fill="{NIGHT}"/>'
    (OUT / "favicon.svg").write_text(svg_doc(frc, fr, fsw, fhandle, fbug, "url(#vg)", grad, "VulnGPT", tile))
    print("wrote", [p.name for p in sorted(OUT.glob("*.svg"))])


if __name__ == "__main__":
    main()
