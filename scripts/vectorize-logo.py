#!/usr/bin/env python3
"""
Vectorize the approved raster master wordmark into clean, lightweight,
production SVGs (espresso, cream, white, outline) + 2400px transparent PNGs.
Uses smooth Gaussian resampling, marching-squares contour extraction,
Ramer-Douglas-Peucker simplification, and quadratic Bezier midpoint curves
with fill-rule="evenodd" so inner counters (e, a) cut out cleanly everywhere.
"""
import argparse
import pathlib
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent


def marching_squares_contours(field: np.ndarray, level: float = 0.5):
    """Extract closed contour loops from a 2D scalar field padded with 0."""
    padded = np.pad(field, 1, mode="constant", constant_values=0.0)
    h, w = padded.shape

    # Edge table: for each 4-bit cell code (tl, tr, br, bl) -> list of edge pairs
    # Edges: 0=top, 1=right, 2=bottom, 3=left
    EDGE_PAIRS = {
        0: [],
        1: [(3, 2)],
        2: [(2, 1)],
        3: [(3, 1)],
        4: [(0, 1)],
        5: [(0, 3), (2, 1)],
        6: [(0, 2)],
        7: [(0, 3)],
        8: [(0, 3)],
        9: [(0, 2)],
        10: [(0, 1), (3, 2)],
        11: [(0, 1)],
        12: [(3, 1)],
        13: [(2, 1)],
        14: [(3, 2)],
        15: [],
    }

    def interp(v1, v2):
        dv = v2 - v1
        if abs(dv) < 1e-9:
            return 0.5
        t = (level - v1) / dv
        return float(np.clip(t, 0.0, 1.0))

    def edge_pt(r, c, e, tl, tr, br, bl):
        if e == 0:
            return (c + interp(tl, tr), float(r))
        if e == 1:
            return (float(c + 1), r + interp(tr, br))
        if e == 2:
            return (c + interp(bl, br), float(r + 1))
        return (float(c), r + interp(tl, bl))

    # Quantize keys to integer 1/10000th grid to connect shared vertices cleanly
    def key(pt):
        return (round(pt[0] * 1000), round(pt[1] * 1000))

    adj = {}
    pts_by_key = {}

    tl_arr = padded[:-1, :-1]
    tr_arr = padded[:-1, 1:]
    br_arr = padded[1:, 1:]
    bl_arr = padded[1:, :-1]

    code_arr = (
        ((tl_arr >= level).astype(np.uint8) << 3)
        | ((tr_arr >= level).astype(np.uint8) << 2)
        | ((br_arr >= level).astype(np.uint8) << 1)
        | (bl_arr >= level).astype(np.uint8)
    )

    active_r, active_c = np.where((code_arr != 0) & (code_arr != 15))
    for r, c in zip(active_r.tolist(), active_c.tolist()):
        tl = float(tl_arr[r, c])
        tr = float(tr_arr[r, c])
        br = float(br_arr[r, c])
        bl = float(bl_arr[r, c])
        code = int(code_arr[r, c])
        pairs = EDGE_PAIRS[code]
        if code in (5, 10):
            center = 0.25 * (tl + tr + br + bl)
            if (code == 5 and center >= level) or (code == 10 and center < level):
                pairs = [(0, 1), (3, 2)] if code == 5 else [(0, 3), (2, 1)]
        for e1, e2 in pairs:
            p1 = edge_pt(r, c, e1, tl, tr, br, bl)
            p2 = edge_pt(r, c, e2, tl, tr, br, bl)
            k1, k2 = key(p1), key(p2)
            if k1 == k2:
                continue
            pts_by_key[k1] = p1
            pts_by_key[k2] = p2
            adj.setdefault(k1, []).append(k2)
            adj.setdefault(k2, []).append(k1)

    visited_edges = set()
    loops = []

    for start_k in list(adj.keys()):
        for nxt in adj[start_k]:
            edge_id = (min(start_k, nxt), max(start_k, nxt))
            if edge_id in visited_edges:
                continue
            loop = [start_k, nxt]
            visited_edges.add(edge_id)
            prev, curr = start_k, nxt
            while True:
                candidates = [nb for nb in adj.get(curr, []) if nb != prev]
                picked = None
                for nb in candidates:
                    eid = (min(curr, nb), max(curr, nb))
                    if eid not in visited_edges:
                        picked = nb
                        visited_edges.add(eid)
                        break
                if picked is None:
                    break
                if picked == start_k:
                    break
                loop.append(picked)
                prev, curr = curr, picked
            if len(loop) >= 6:
                coords = np.array([pts_by_key[k] for k in loop], dtype=np.float64)
                # Shift back -1 for padding
                coords -= 1.0
                loops.append(coords)
    return loops


def rdp_closed(pts: np.ndarray, eps: float) -> np.ndarray:
    """Ramer-Douglas-Peucker simplification for a closed polygon."""
    n = len(pts)
    if n < 8:
        return pts
    # Split at farthest pair of opposite points
    mid = n // 2
    d1 = np.linalg.norm(pts - pts[0], axis=1)
    i1 = int(np.argmax(d1))
    d2 = np.linalg.norm(pts - pts[i1], axis=1)
    i2 = int(np.argmax(d2))
    if i1 > i2:
        i1, i2 = i2, i1

    def rdp_open(seg):
        if len(seg) <= 2:
            return seg
        a, b = seg[0], seg[-1]
        ab = b - a
        ab_len = np.linalg.norm(ab)
        if ab_len < 1e-9:
            dists = np.linalg.norm(seg - a, axis=1)
        else:
            dists = np.abs(ab[0] * (a[1] - seg[:, 1]) - (a[0] - seg[:, 0]) * ab[1]) / ab_len
        idx = int(np.argmax(dists))
        if dists[idx] > eps:
            left = rdp_open(seg[: idx + 1])
            right = rdp_open(seg[idx:])
            return np.vstack([left[:-1], right])
        return np.vstack([a, b])

    arc1 = np.vstack([pts[i1 : i2 + 1]])
    arc2 = np.vstack([pts[i2:], pts[: i1 + 1]])
    s1 = rdp_open(arc1)
    s2 = rdp_open(arc2)
    res = np.vstack([s1[:-1], s2[:-1]])
    return res if len(res) >= 4 else pts


def loop_to_quad_bezier_path(pts: np.ndarray) -> str:
    """Convert closed polygon vertices to smooth closed SVG quadratic Bezier path."""
    n = len(pts)
    mids = 0.5 * (pts + np.roll(pts, -1, axis=0))
    parts = [f"M {mids[-1][0]:.2f} {mids[-1][1]:.2f}"]
    for i in range(n):
        c = pts[i]
        m = mids[i]
        parts.append(f"Q {c[0]:.2f} {c[1]:.2f} {m[0]:.2f} {m[1]:.2f}")
    parts.append("Z")
    return " ".join(parts)


def build_svg_path_data(img_path: pathlib.Path, vw: float = 160.0, vh: float = 60.0, pad_x: float = 2.0, pad_y: float = 3.0, y_boost: float = 1.12):
    im = Image.open(img_path).convert("L")
    arr = np.array(im, dtype=np.float64)
    # Foreground ink is dark (< 140) on light cream (~230)
    bg = float(np.percentile(arr, 90))
    fg = float(np.percentile(arr, 2))
    norm = np.clip((bg - arr) / max(bg - fg, 20.0), 0.0, 1.0)

    # Crop tightly around foreground before upscaling for sharp precision
    ys, xs = np.where(norm > 0.3)
    margin = 20
    y0 = max(0, int(ys.min()) - margin)
    y1 = min(arr.shape[0], int(ys.max()) + margin)
    x0 = max(0, int(xs.min()) - margin)
    x1 = min(arr.shape[1], int(xs.max()) + margin)
    crop = norm[y0:y1, x0:x1]

    # 2x smooth zoom + gentle organic smoothing
    up = zoom(crop, 2.0, order=3)
    up = gaussian_filter(up, sigma=1.15)

    loops = marching_squares_contours(up, level=0.5)
    # Filter tiny dust specks (< 180 sq px in upscaled space)
    clean_loops = []
    for lp in loops:
        area = 0.5 * abs(np.sum(lp[:, 0] * np.roll(lp[:, 1], -1) - np.roll(lp[:, 0], -1) * lp[:, 1]))
        if area > 180.0:
            clean_loops.append(lp)

    all_pts = np.vstack(clean_loops)
    min_x, min_y = all_pts.min(axis=0)
    max_x, max_y = all_pts.max(axis=0)
    bw = max_x - min_x
    bh = (max_y - min_y) * y_boost

    avail_w = vw - 2 * pad_x
    avail_h = vh - 2 * pad_y
    scale = min(avail_w / bw, avail_h / bh)
    scale_x = scale
    scale_y = scale * y_boost
    drawn_w = bw * scale_x
    drawn_h = (max_y - min_y) * scale_y
    off_x = (vw - drawn_w) * 0.5 - min_x * scale_x
    off_y = (vh - drawn_h) * 0.5 - min_y * scale_y

    path_segments = []
    for lp in clean_loops:
        simp = rdp_closed(lp, eps=1.25)
        scaled = np.column_stack([simp[:, 0] * scale_x + off_x, simp[:, 1] * scale_y + off_y])
        path_segments.append(loop_to_quad_bezier_path(scaled))

    return " ".join(path_segments), drawn_w, drawn_h, len(clean_loops)


def write_svg_variants(path_d: str, out_dir: pathlib.Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    variants = {
        "crema-logo-espresso.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible"><path d="{d}" fill="#2B0D0A" fill-rule="evenodd"/></svg>',
        "crema-logo-cream.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible"><path d="{d}" fill="#F4F1E8" fill-rule="evenodd"/></svg>',
        "crema-logo-white.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible"><path d="{d}" fill="#FFFFFF" fill-rule="evenodd"/></svg>',
        "crema-logo-outline.svg": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible"><path d="{d}" fill="none" stroke="#FFFFFF" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    }
    for fname, tpl in variants.items():
        (out_dir / fname).write_text(tpl.format(d=path_d), encoding="utf-8")


def render_pngs_and_preview(out_dir: pathlib.Path):
    espresso_svg = (out_dir / "crema-logo-espresso.svg").read_text(encoding="utf-8")
    white_svg = (out_dir / "crema-logo-white.svg").read_text(encoding="utf-8")
    outline_svg = (out_dir / "crema-logo-outline.svg").read_text(encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        # High-res transparent PNGs (2400x900 matching 160:60)
        for name, svg_markup in [
            ("crema-logo-espresso-2400w.png", espresso_svg),
            ("crema-logo-white-2400w.png", white_svg),
            ("crema-logo-outline-2400w.png", outline_svg),
        ]:
            page = browser.new_page(viewport={"width": 2400, "height": 900}, device_scale_factor=1)
            page.set_content(f'<html><body style="margin:0;background:transparent;width:2400px;height:900px;display:flex;align-items:center;justify-content:center;">{svg_markup.replace("viewBox=", "style=\"width:2400px;height:900px;display:block\" viewBox=")}</body></html>')
            page.screenshot(path=str(out_dir / name), omit_background=True)
            page.close()

        # Preview inspection sheet
        page = browser.new_page(viewport={"width": 1100, "height": 820}, device_scale_factor=1)
        html = f"""
        <html><body style="margin:0;padding:32px;background:#F4F1E8;font-family:monospace;color:#2B0D0A;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
          <div style="background:#E8E4D8;padding:28px;border:1px solid #2B0D0A22;">
            <div style="margin-bottom:10px;font-size:11px;">ESPRESSO ON MILK (160px / 247px / 98px)</div>
            <div style="display:flex;flex-direction:column;gap:18px;align-items:flex-start;">
              <div style="width:247px;height:93px;border:1px dashed #2B0D0A33;">{espresso_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
              <div style="width:160px;height:60px;border:1px dashed #2B0D0A33;">{espresso_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
              <div style="width:98px;height:37px;border:1px dashed #2B0D0A33;">{espresso_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
            </div>
          </div>
          <div style="background:#2B0D0A;color:#F4F1E8;padding:28px;">
            <div style="margin-bottom:10px;font-size:11px;">WHITE & OUTLINE ON ESPRESSO</div>
            <div style="display:flex;flex-direction:column;gap:22px;">
              <div style="width:320px;height:120px;">{white_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
              <div style="width:320px;height:120px;">{outline_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
            </div>
          </div>
          <div style="background:#96B8CC;padding:28px;grid-column:span 2;display:flex;align-items:center;justify-content:center;">
            <div style="width:680px;height:255px;">{espresso_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
          </div>
        </body></html>
        """
        page.set_content(html)
        page.screenshot(path=str(out_dir / "crema-logo-preview.png"))
        page.close()
        browser.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_image", help="Path to raster master wordmark")
    args = parser.parse_args()
    img_path = pathlib.Path(args.input_image)
    out_dir = ROOT / "assets-src" / "logo"
    path_d, dw, dh, n_loops = build_svg_path_data(img_path)
    write_svg_variants(path_d, out_dir)
    render_pngs_and_preview(out_dir)
    print(f"Vectorized {img_path.name}: {n_loops} loops, fitted={dw:.1f}x{dh:.1f} inside 160x60, path_len={len(path_d)} chars")


if __name__ == "__main__":
    main()
