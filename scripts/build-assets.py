#!/usr/bin/env python3
"""
CREMA v3 Asset Pipeline — Tactile Espresso Parlour Studio Edition.
Builds all 15 CREMA master artworks & physical composites using Creatoom-style
studio photography, perspective homography, shadow-aware multiply & fabric-weave
ink modulation, and local Drip WOFF2 (Rubik, Geist, Geist Mono) + crema wordmark
vectors; exports all 50 responsive hashed image variants matching public/f2c-sw.js,
favicons & OG cover, packages crema-logo-kit.zip, and renders A4 crema-colour-production-sheet.pdf.
Zero network calls during build.
"""
import base64
import json
import pathlib
import zipfile
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "brand.config.json").read_text(encoding="utf-8"))
SRC_PHOTOS = ROOT / "assets-src" / "photos"
SRC_LOGO = ROOT / "assets-src" / "logo"
FONT_GSTATIC = ROOT / "public" / "assets" / "fonts.gstatic.com" / "s"
MASTERS = ROOT / "assets-src" / "masters"
OUT_IMAGES = ROOT / "public" / "assets" / "framerusercontent.com" / "images"
OUT_ICONS = ROOT / "public" / "assets" / "framerusercontent.com" / "sites" / "icons"
OUT_DOWNLOADS = ROOT / "public" / "downloads"
USER_CAFE_CLEAN = SRC_PHOTOS / "user-cafe-clean.jpg"

MASTERS.mkdir(parents=True, exist_ok=True)
OUT_IMAGES.mkdir(parents=True, exist_ok=True)
OUT_ICONS.mkdir(parents=True, exist_ok=True)
OUT_DOWNLOADS.mkdir(parents=True, exist_ok=True)

# Exact responsive variant sizes matching public/f2c-sw.js & Framer srcset
VARIANT_MAP = {
    "aMwwbjaEy0hJE6x3YqMD0j3mjMM": [
        ("aMwwbjaEy0hJE6x3YqMD0j3mjMM.1xjl77b.jpg", 512, 286),
        ("aMwwbjaEy0hJE6x3YqMD0j3mjMM.0xqejw2.jpg", 1024, 572),
        ("aMwwbjaEy0hJE6x3YqMD0j3mjMM.1fphblp.jpg", 2048, 1143),
        ("aMwwbjaEy0hJE6x3YqMD0j3mjMM.1b879od.jpg", 3072, 1715),
    ],
    "aIEV1hcqxeK04SOq1FTfYwVPIAI": [
        ("aIEV1hcqxeK04SOq1FTfYwVPIAI.199x2d7.jpg", 1024, 1247),
        ("aIEV1hcqxeK04SOq1FTfYwVPIAI.1ivq6o8.jpg", 2048, 2495),
        ("aIEV1hcqxeK04SOq1FTfYwVPIAI.0fa8v0o.jpg", 2030, 2473),
    ],
    "UAKCUif6ofiURPbfmTRNopCAsw": [
        ("UAKCUif6ofiURPbfmTRNopCAsw.1hcd5sz.jpg", 512, 282),
        ("UAKCUif6ofiURPbfmTRNopCAsw.1d4q0la.jpg", 1024, 563),
        ("UAKCUif6ofiURPbfmTRNopCAsw.1v2vpbp.jpg", 2048, 1127),
        ("UAKCUif6ofiURPbfmTRNopCAsw.1oulm0l.jpg", 2177, 1198),
    ],
    "SPaKAVDaIGZLfVjajfL7nirWBM": [
        ("SPaKAVDaIGZLfVjajfL7nirWBM.1wuy6i2.jpg", 512, 256),
        ("SPaKAVDaIGZLfVjajfL7nirWBM.1l8vv77.jpg", 1024, 512),
        ("SPaKAVDaIGZLfVjajfL7nirWBM.1cbyg20.jpg", 2048, 1024),
        ("SPaKAVDaIGZLfVjajfL7nirWBM.103585k.jpg", 2400, 1200),
    ],
    "n8BFAvaVvHXO5KFw2kmw9XTpwk": [
        ("n8BFAvaVvHXO5KFw2kmw9XTpwk.1wuy6i2.jpg", 512, 256),
        ("n8BFAvaVvHXO5KFw2kmw9XTpwk.1l8vv77.jpg", 1024, 512),
        ("n8BFAvaVvHXO5KFw2kmw9XTpwk.1cbyg20.jpg", 2048, 1024),
        ("n8BFAvaVvHXO5KFw2kmw9XTpwk.103585k.jpg", 2400, 1200),
    ],
    "zqNghtROatxZ4uWDLtqYNZViQo": [
        ("zqNghtROatxZ4uWDLtqYNZViQo.03wtapu.jpg", 1024, 1434),
        ("zqNghtROatxZ4uWDLtqYNZViQo.09cgwm5.jpg", 1000, 1400),
    ],
    "tLZ5tJpyNJeqxqwfw6ninoYRdzw": [
        ("tLZ5tJpyNJeqxqwfw6ninoYRdzw.03wtapu.jpg", 1024, 1434),
        ("tLZ5tJpyNJeqxqwfw6ninoYRdzw.09cgwm5.jpg", 1000, 1400),
    ],
    "Fta0F7kQQojEhhqxW8cmD3QbVGM": [
        ("Fta0F7kQQojEhhqxW8cmD3QbVGM.13s4w55.jpg", 1024, 1434),
        ("Fta0F7kQQojEhhqxW8cmD3QbVGM.17xzhru.jpg", 2048, 2867),
        ("Fta0F7kQQojEhhqxW8cmD3QbVGM.121r9mi.jpg", 1912, 2677),
    ],
    "DHCp0FOYIvOB0TjkJIzQjltk": [
        ("DHCp0FOYIvOB0TjkJIzQjltk.13s4w55.jpg", 1024, 1434),
        ("DHCp0FOYIvOB0TjkJIzQjltk.17xzhru.jpg", 2048, 2867),
        ("DHCp0FOYIvOB0TjkJIzQjltk.121r9mi.jpg", 1912, 2677),
    ],
    "blRleJ9mleOaBi90IGdMtWC1p8": [
        ("blRleJ9mleOaBi90IGdMtWC1p8.1ky9u2u.jpg", 1024, 1371),
        ("blRleJ9mleOaBi90IGdMtWC1p8.0bxgct5.jpg", 2048, 2743),
        ("blRleJ9mleOaBi90IGdMtWC1p8.088ivca.jpg", 4096, 5486),
        ("blRleJ9mleOaBi90IGdMtWC1p8.02j9tw9.jpg", 3584, 4800),
    ],
    "3cu9t0vRFTxLWvpYP5xm1pLOFk": [
        ("3cu9t0vRFTxLWvpYP5xm1pLOFk.1pjserz.jpg", 512, 382),
        ("3cu9t0vRFTxLWvpYP5xm1pLOFk.010gin2.jpg", 1024, 764),
        ("3cu9t0vRFTxLWvpYP5xm1pLOFk.18vxl19.jpg", 2004, 1496),
    ],
    "FNZCgNG0CCm25mcKKS9lReqbno": [
        ("FNZCgNG0CCm25mcKKS9lReqbno.0gtlgiv.jpg", 1024, 1371),
        ("FNZCgNG0CCm25mcKKS9lReqbno.03yp4zc.jpg", 2048, 2743),
        ("FNZCgNG0CCm25mcKKS9lReqbno.1jx3j20.jpg", 1968, 2636),
    ],
    "Gk9YTSesMbgmpBazGuUwef9NIuc": [
        ("Gk9YTSesMbgmpBazGuUwef9NIuc.1wuy6i2.jpg", 512, 256),
        ("Gk9YTSesMbgmpBazGuUwef9NIuc.1l8vv77.jpg", 1024, 512),
        ("Gk9YTSesMbgmpBazGuUwef9NIuc.1cbyg20.jpg", 2048, 1024),
        ("Gk9YTSesMbgmpBazGuUwef9NIuc.103585k.jpg", 2400, 1200),
    ],
    "O4qogVdT2z6bDD7hYx2jx0ibJBU": [
        ("O4qogVdT2z6bDD7hYx2jx0ibJBU.1ky9u2u.jpg", 1024, 1371),
        ("O4qogVdT2z6bDD7hYx2jx0ibJBU.0bxgct5.jpg", 2048, 2743),
        ("O4qogVdT2z6bDD7hYx2jx0ibJBU.088ivca.jpg", 4096, 5486),
        ("O4qogVdT2z6bDD7hYx2jx0ibJBU.02j9tw9.jpg", 3584, 4800),
    ],
    "5HPuOSuiD9BOwdr5aTdlopUs1O0": [
        ("5HPuOSuiD9BOwdr5aTdlopUs1O0.1l318tp.png", 512, 496),
        ("5HPuOSuiD9BOwdr5aTdlopUs1O0.0j4e4kk.png", 1024, 993),
        ("5HPuOSuiD9BOwdr5aTdlopUs1O0.0dyxy87.png", 1254, 1216),
    ],
}


def b64_file(path: pathlib.Path, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode('ascii')}"


def font_css() -> str:
    rubik = b64_file(FONT_GSTATIC / "rubik" / "v31" / "iJWKBXyIfDnIV7nBrXw.woff2", "font/woff2")
    g400 = b64_file(FONT_GSTATIC / "geist" / "v5" / "gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4mJPby1QNtA.woff2", "font/woff2")
    g500 = b64_file(FONT_GSTATIC / "geist" / "v5" / "gyBhhwUxId8gMGYQMKR3pzfaWI_RruM4mJPby1QNtA.woff2", "font/woff2")
    g600 = b64_file(FONT_GSTATIC / "geist" / "v5" / "gyBhhwUxId8gMGYQMKR3pzfaWI_RQuQ4mJPby1QNtA.woff2", "font/woff2")
    g700 = b64_file(FONT_GSTATIC / "geist" / "v5" / "gyBhhwUxId8gMGYQMKR3pzfaWI_Re-Q4mJPby1QNtA.woff2", "font/woff2")
    gi400 = b64_file(FONT_GSTATIC / "geist" / "v5" / "gyBjhwUxId8gMEwZAluvzlxA9ojEVKDQ3pna6VEdtKCL.woff2", "font/woff2")
    gm400 = b64_file(FONT_GSTATIC / "geistmono" / "v6" / "or3yQ6H-1_WfwkMZI_qYPLs1a-t7PU0AbeE9KJ5W7ihaO_CS.woff2", "font/woff2")
    gm500 = b64_file(FONT_GSTATIC / "geistmono" / "v6" / "or3yQ6H-1_WfwkMZI_qYPLs1a-t7PU0AbeEPKJ5W7ihaO_CS.woff2", "font/woff2")
    gm_var = b64_file(FONT_GSTATIC / "geistmono" / "v6" / "or3nQ6H-1_WfwkMZI_qYFrcdmg.woff2", "font/woff2")
    gm700 = b64_file(FONT_GSTATIC / "geistmono" / "v6" / "or3yQ6H-1_WfwkMZI_qYPLs1a-t7PU0AbeHaL55W7ihaO_CS.woff2", "font/woff2")
    return f"""
    @font-face {{ font-family: 'Rubik'; font-weight: 400 700; font-style: normal; src: url('{rubik}') format('woff2'); }}
    @font-face {{ font-family: 'Geist'; font-weight: 400; font-style: normal; src: url('{g400}') format('woff2'); }}
    @font-face {{ font-family: 'Geist'; font-weight: 500; font-style: normal; src: url('{g500}') format('woff2'); }}
    @font-face {{ font-family: 'Geist'; font-weight: 600; font-style: normal; src: url('{g600}') format('woff2'); }}
    @font-face {{ font-family: 'Geist'; font-weight: 700; font-style: normal; src: url('{g700}') format('woff2'); }}
    @font-face {{ font-family: 'Geist'; font-weight: 400; font-style: italic; src: url('{gi400}') format('woff2'); }}
    @font-face {{ font-family: 'Geist Mono'; font-weight: 400; font-style: normal; src: url('{gm400}') format('woff2'); }}
    @font-face {{ font-family: 'Geist Mono'; font-weight: 500; font-style: normal; src: url('{gm500}') format('woff2'); }}
    @font-face {{ font-family: 'Geist Mono'; font-weight: 600; font-style: normal; src: url('{gm_var}') format('woff2'); }}
    @font-face {{ font-family: 'Geist Mono'; font-weight: 700; font-style: normal; src: url('{gm700}') format('woff2'); }}
    """


def fit_cover(im: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src_ratio = im.width / im.height
    dst_ratio = target_w / target_h
    if src_ratio > dst_ratio:
        new_w = round(im.height * dst_ratio)
        left = (im.width - new_w) // 2
        im = im.crop((left, 0, left + new_w, im.height))
    elif src_ratio < dst_ratio:
        new_h = round(im.width / dst_ratio)
        top = (im.height - new_h) // 2
        im = im.crop((0, top, im.width, top + new_h))
    return im.resize((target_w, target_h), Image.Resampling.LANCZOS)


def solve_perspective_coeffs(dst_pts, src_pts):
    """Solve 8-coefficient projective homography mapping dst (x, y) -> src (X, Y) for PIL."""
    matrix = []
    for p_dst, p_src in zip(dst_pts, src_pts):
        x, y = p_dst
        X, Y = p_src
        matrix.append([x, y, 1, 0, 0, 0, -X * x, -X * y])
        matrix.append([0, 0, 0, x, y, 1, -Y * x, -Y * y])
    A = np.array(matrix, dtype=np.float64)
    B = np.array([c for pt in src_pts for c in pt], dtype=np.float64)
    res = np.linalg.solve(A, B)
    return tuple(res.tolist())


def warp_rgba_to_quad(overlay_rgba: Image.Image, canvas_w: int, canvas_h: int, norm_quad) -> Image.Image:
    """Warp an RGBA overlay cleanly into normalized quad [TL, TR, BR, BL] on (canvas_w, canvas_h)."""
    ow, oh = overlay_rgba.size
    dst_pts = [(nx * canvas_w, ny * canvas_h) for nx, ny in norm_quad]
    src_pts = [(0.0, 0.0), (float(ow), 0.0), (float(ow), float(oh)), (0.0, float(oh))]
    coeffs = solve_perspective_coeffs(dst_pts, src_pts)
    return overlay_rgba.transform((canvas_w, canvas_h), Image.Transform.PERSPECTIVE, coeffs, resample=Image.Resampling.BICUBIC)


def blend_multiply_ink(base_rgb: Image.Image, warped_rgba: Image.Image, ink_strength: float = 0.94, soften_px: float = 0.45) -> Image.Image:
    """Shadow-aware multiply blend so physical sunlight shadows & paper tooth pass over dark ink."""
    if soften_px > 0:
        r, g, b, a = warped_rgba.split()
        a = a.filter(ImageFilter.GaussianBlur(radius=soften_px))
        warped_rgba = Image.merge("RGBA", (r, g, b, a))

    base_np = np.array(base_rgb, dtype=np.float32) / 255.0
    ov_np = np.array(warped_rgba, dtype=np.float32) / 255.0
    ink_rgb = ov_np[:, :, :3]
    alpha = ov_np[:, :, 3:4] * ink_strength

    # Multiply so highlights, raking shadows, and paper grain modulate the printed ink natively
    multiplied = base_np * np.clip(ink_rgb * 0.90 + 0.03, 0.0, 1.0)
    out = base_np * (1.0 - alpha) + multiplied * alpha
    return Image.fromarray(np.clip(out * 255.0, 0, 255).astype(np.uint8), mode="RGB")


def blend_weave_pigment(base_rgb: Image.Image, warped_rgba: Image.Image, strength: float = 0.90, soften_px: float = 0.5) -> Image.Image:
    """Modulate light/cream silkscreen pigment by underlying fabric weave & surface shadow variation."""
    if soften_px > 0:
        r, g, b, a = warped_rgba.split()
        a = a.filter(ImageFilter.GaussianBlur(radius=soften_px))
        warped_rgba = Image.merge("RGBA", (r, g, b, a))

    base_np = np.array(base_rgb, dtype=np.float32) / 255.0
    ov_np = np.array(warped_rgba, dtype=np.float32) / 255.0
    pigment = ov_np[:, :, :3]
    alpha = ov_np[:, :, 3:4] * strength

    luma = (base_np[:, :, 0:1] * 0.299 + base_np[:, :, 1:2] * 0.587 + base_np[:, :, 2:3] * 0.114)
    mask = alpha[:, :, 0] > 0.02
    med = float(np.median(luma[mask])) if np.any(mask) else 0.35
    med = max(med, 0.08)
    rel_weave = np.clip(0.84 + 0.24 * (luma / med - 1.0), 0.68, 1.12)
    textured_pigment = np.clip(pigment * rel_weave, 0.0, 1.0)

    out = base_np * (1.0 - alpha) + textured_pigment * alpha
    return Image.fromarray(np.clip(out * 255.0, 0, 255).astype(np.uint8), mode="RGB")


def render_html_rgba(browser, html_body: str, width: int, height: int) -> Image.Image:
    """Render HTML fragment to transparent RGBA Pillow image with embedded local fonts."""
    eff_scale = 2.0 if max(width, height) > 1600 else 1.0
    vw = max(1, round(width / eff_scale))
    vh = max(1, round(height / eff_scale))
    page = browser.new_page(viewport={"width": vw, "height": vh}, device_scale_factor=eff_scale)
    full_html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
      {font_css()}
      * {{ box-sizing: border-box; margin: 0; padding: 0; }}
      html, body {{ width: {vw}px; height: {vh}px; overflow: hidden; background: transparent; -webkit-font-smoothing: antialiased; }}
      .crema-canvas-root {{ width: {width}px; height: {height}px; overflow: hidden; transform-origin: 0 0; transform: scale({eff_scale ** -1:.8f}); }}
    </style></head><body><div class="crema-canvas-root">{html_body}</div></body></html>"""
    page.set_content(full_html, wait_until="load")
    page.evaluate("document.fonts.ready")
    tmp = MASTERS / "_render_tmp.png"
    page.screenshot(path=str(tmp), type="png", omit_background=True)
    page.close()
    im = Image.open(tmp).convert("RGBA")
    tmp.unlink(missing_ok=True)
    if im.size != (width, height):
        im = im.resize((width, height), Image.Resampling.LANCZOS)
    return im


def save_master_jpg(im: Image.Image, filename: str, quality: int = 94):
    im.convert("RGB").save(MASTERS / filename, format="JPEG", quality=quality, optimize=True)


def render_html_image(browser, html_body: str, width: int, height: int, out_path: pathlib.Path):
    im = render_html_rgba(browser, html_body, width, height)
    if out_path.suffix.lower() in (".jpg", ".jpeg"):
        im.convert("RGB").save(out_path, format="JPEG", quality=93, optimize=True)
    else:
        im.convert("RGBA").save(out_path, format="PNG", optimize=True)


def prepare_handheld_cup_master():
    """Composite #24110C sculpted crema wordmark cleanly onto sunlit v3-handheld-cup.jpg."""
    cup = Image.open(SRC_PHOTOS / "v3-handheld-cup.jpg").convert("RGBA")
    cup = fit_cover(cup, 3584, 4800)

    logo = Image.open(SRC_LOGO / "crema-logo-espresso-2400w.png").convert("RGBA")
    lw = 840
    lh = round(logo.height * (lw / logo.width))
    logo = logo.resize((lw, lh), Image.Resampling.LANCZOS)

    # Gentle cylindrical cup taper curvature clear of left index/middle fingers & right thumb
    logo_arr = np.array(logo, dtype=np.float32)
    out_arr = np.zeros_like(logo_arr)
    xs = np.linspace(-1.0, 1.0, lw)
    sag_px = 18.0 * (1.0 - xs ** 2)
    for c in range(lw):
        shift = sag_px[c]
        y_src = np.arange(lh, dtype=np.float32) - shift
        y0 = np.floor(y_src).astype(int)
        y1 = y0 + 1
        wy = y_src - y0
        valid0 = (y0 >= 0) & (y0 < lh)
        valid1 = (y1 >= 0) & (y1 < lh)
        col = np.zeros((lh, 4), dtype=np.float32)
        col[valid0] += logo_arr[y0[valid0], c] * (1.0 - wy[valid0, None])
        col[valid1] += logo_arr[y1[valid1], c] * wy[valid1, None]
        out_arr[:, c] = col

    warped_logo = Image.fromarray(np.clip(out_arr, 0, 255).astype(np.uint8), mode="RGBA")
    r, g, b, a = warped_logo.split()
    a = a.filter(ImageFilter.GaussianBlur(radius=0.55))
    warped_logo = Image.merge("RGBA", (r, g, b, a))

    # Measured clear sunlit upper belly center: x=0.496W, y=0.476H
    cx = int(cup.width * 0.496) - lw // 2
    cy = int(cup.height * 0.476) - lh // 2

    cup_np = np.array(cup, dtype=np.float32) / 255.0
    patch = cup_np[cy : cy + lh, cx : cx + lw, :3]
    lg_np = np.array(warped_logo, dtype=np.float32) / 255.0
    ink_rgb = lg_np[:, :, :3]
    alpha = lg_np[:, :, 3:4] * 0.92

    multiplied = patch * (ink_rgb * 0.85 + 0.03)
    blended = patch * (1.0 - alpha) + multiplied * alpha
    cup_np[cy : cy + lh, cx : cx + lw, :3] = np.clip(blended, 0.0, 1.0)

    finished_cup = Image.fromarray((cup_np * 255).astype(np.uint8), mode="RGBA").convert("RGB")
    save_master_jpg(finished_cup, "O4qogVdT2z6bDD7hYx2jx0ibJBU.jpg", quality=94)
    print("Built v3 handheld cup O4qogVdT2z6bDD7hYx2jx0ibJBU.jpg")


def prepare_photo_bases():
    """Prepare macro-foil inset, nitro-crema glass, cold brew, velvet pour, & upright cafe evening poster."""
    # 1. aIEV1hcqxeK04SOq1FTfYwVPIAI (2030x2473) - Copper Foil Macro Tin & Apothecary Bottle
    foil = Image.open(SRC_PHOTOS / "v3-foil-macro.jpg").convert("RGB")
    foil = fit_cover(foil, 2030, 2473)
    foil = ImageEnhance.Contrast(foil).enhance(1.04)
    foil = ImageEnhance.Color(foil).enhance(1.05)
    save_master_jpg(foil, "aIEV1hcqxeK04SOq1FTfYwVPIAI.jpg", quality=94)

    # 2. blRleJ9mleOaBi90IGdMtWC1p8 (3584x4800): Nitro crema glass
    crema_src = Image.open(SRC_PHOTOS / "macro-crema-src.jpg").convert("RGB")
    w, h = crema_src.size
    studio_crema = fit_cover(crema_src.crop((int(w * 0.12), int(h * 0.14), int(w * 0.88), int(h * 0.99))), 3584, 4800)
    save_master_jpg(studio_crema, "blRleJ9mleOaBi90IGdMtWC1p8.jpg", quality=94)

    # 3. Cold brew clean crop
    cb_src = Image.open(SRC_PHOTOS / "macro-coldbrew-src.jpg").convert("RGB")
    cw, ch = cb_src.size
    cb_crop = fit_cover(cb_src.crop((int(cw * 0.08), int(ch * 0.08), int(cw * 0.92), int(ch * 0.96))), 1912, 2677)
    cb_crop.save(SRC_PHOTOS / "macro-coldbrew-clean.jpg", format="JPEG", quality=95)

    # 4. Velvet Pour macro clean base
    swirl = crema_src.crop((int(w * 0.21), int(h * 0.37), int(w * 0.79), int(h * 0.96))).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    swirl = fit_cover(swirl, 1912, 2677)
    swirl = ImageEnhance.Contrast(swirl).enhance(1.12)
    swirl = ImageEnhance.Color(swirl).enhance(1.18)
    sw_np = np.array(swirl, dtype=np.float32)
    grad = np.linspace(0.0, 1.0, swirl.height)[:, None, None]
    shade = np.clip((grad - 0.58) / 0.42, 0.0, 1.0) ** 1.3
    sw_np = sw_np * (1.0 - 0.62 * shade)
    Image.fromarray(np.clip(sw_np, 0, 255).astype(np.uint8)).save(SRC_PHOTOS / "macro-velvet-clean.jpg", format="JPEG", quality=95)

    # 5. User's cleaned upright interior photo (user-cafe-clean.jpg, ZERO white car)
    cafe = Image.open(USER_CAFE_CLEAN).convert("RGB")
    ucw, uch = cafe.size
    poster_base = fit_cover(cafe.crop((int(ucw * 0.01), int(uch * 0.00), int(ucw * 0.99), int(uch * 0.98))), 1968, 2636)
    poster_base = ImageEnhance.Contrast(poster_base).enhance(1.12)
    poster_base = ImageEnhance.Color(poster_base).enhance(1.08)
    pb_np = np.array(poster_base, dtype=np.float32)
    y_norm = np.linspace(0.0, 1.0, poster_base.height)[:, None, None]
    bot_band = np.clip((y_norm - 0.70) / 0.30, 0.0, 1.0) ** 1.4
    pb_np = pb_np * (1.0 - 0.44 * bot_band)
    Image.fromarray(np.clip(pb_np, 0, 255).astype(np.uint8)).save(SRC_PHOTOS / "cafe-evening-clean.jpg", format="JPEG", quality=95)
    print("Built v3 photographic bases.")


def composite_physical_hero(browser, logo_espresso: str):
    """aMwwbjaEy0hJE6x3YqMD0j3mjMM (3072x1715): Hero parlour table + warped crema gable box label."""
    hero = fit_cover(Image.open(SRC_PHOTOS / "v3-hero-parlour.jpg").convert("RGB"), 3072, 1715)
    label_art = render_html_rgba(
        browser,
        f"""
        <div style="width:680px;height:680px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:42px;color:#24110C;">
          <div style="font-family:'Geist Mono',monospace;font-size:22px;font-weight:600;letter-spacing:0.16em;color:#8C4E29;">ROASTERY · LOT 04</div>
          <div style="width:520px;height:195px;">
            {logo_espresso.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="width:240px;height:2px;background:rgba(140,78,41,0.55);"></div>
          <div style="font-family:'Geist Mono',monospace;font-size:22px;font-weight:500;letter-spacing:0.14em;color:#594A42;">JAKARTA · 07–23</div>
        </div>
        """,
        680,
        680,
    )
    quad = [(0.525, 0.415), (0.624, 0.425), (0.624, 0.580), (0.525, 0.569)]
    warped = warp_rgba_to_quad(label_art, hero.width, hero.height, quad)
    out = blend_multiply_ink(hero, warped, ink_strength=0.95, soften_px=0.5)
    save_master_jpg(out, "aMwwbjaEy0hJE6x3YqMD0j3mjMM.jpg", quality=94)
    print("Built v3 hero parlour cover aMwwbjaEy0hJE6x3YqMD0j3mjMM.jpg")


def composite_physical_menu_flatlay(browser, logo_espresso: str, logo_cream: str):
    """3cu9t0vRFTxLWvpYP5xm1pLOFk (2004x1496): Cotton sheet menu + brass corner + debossed pulp coaster."""
    flatlay = fit_cover(Image.open(SRC_PHOTOS / "v3-parlour-menu-flatlay.jpg").convert("RGB"), 2004, 1496)

    menu_art = render_html_rgba(
        browser,
        f"""
        <div style="width:940px;height:1320px;padding:96px 86px 76px;display:flex;flex-direction:column;justify-content:space-between;color:#24110C;">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid rgba(140,78,41,0.8);padding-bottom:30px;margin-bottom:44px;padding-right:42px;">
              <div style="width:320px;height:120px;margin-left:-4px;">
                {logo_espresso.replace('<svg ', '<svg style="width:100%;height:100%" ')}
              </div>
              <div style="font-family:'Geist Mono',monospace;font-size:18px;letter-spacing:0.11em;color:#594A42;text-align:right;line-height:1.5;">
                EVENING MENU · NO. 04<br>KEMANG SELATAN 18
              </div>
            </div>

            <div style="font-family:'Geist Mono',monospace;font-size:19px;font-weight:600;letter-spacing:0.14em;color:#8C4E29;margin-bottom:28px;">
              ESPRESSO &amp; MILK BAR
            </div>

            <div style="display:flex;flex-direction:column;gap:26px;font-family:'Geist',sans-serif;font-size:28px;font-weight:500;">
              <div style="display:flex;justify-content:space-between;border-bottom:1.5px dashed rgba(36,17,12,0.28);padding-bottom:16px;">
                <span>Single / Double Espresso</span><span style="font-family:'Geist Mono',monospace;font-size:25px;">28 / 34</span>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1.5px dashed rgba(36,17,12,0.28);padding-bottom:16px;">
                <span>House Velvet Cappuccino</span><span style="font-family:'Geist Mono',monospace;font-size:25px;">42</span>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1.5px dashed rgba(36,17,12,0.28);padding-bottom:16px;">
                <span>Caramel Cortado</span><span style="font-family:'Geist Mono',monospace;font-size:25px;">48</span>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1.5px dashed rgba(36,17,12,0.28);padding-bottom:16px;">
                <span>Cedar-Rested Cold Brew</span><span style="font-family:'Geist Mono',monospace;font-size:25px;">44</span>
              </div>
              <div style="display:flex;justify-content:space-between;border-bottom:1.5px dashed rgba(36,17,12,0.28);padding-bottom:16px;">
                <span>Filter Pour Over · Lot 04</span><span style="font-family:'Geist Mono',monospace;font-size:25px;">52</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:6px;">
                <span>Warm Almond Kouign-Amann</span><span style="font-family:'Geist Mono',monospace;font-size:25px;">42</span>
              </div>
            </div>
          </div>

          <div>
            <div style="font-family:'Geist',sans-serif;font-size:30px;font-style:italic;font-weight:500;color:#8C4E29;margin-bottom:26px;">
              Roasted daily over warm cedar rafters.
            </div>
            <div style="display:flex;justify-content:space-between;font-family:'Geist Mono',monospace;font-size:18px;letter-spacing:0.09em;color:#594A42;border-top:1.5px solid rgba(36,17,12,0.28);padding-top:22px;">
              <span>UNCOATED COTTON · 320 GSM</span>
              <span>07:00 — 23:00</span>
            </div>
          </div>
        </div>
        """,
        940,
        1320,
    )
    menu_quad = [(0.184, 0.148), (0.556, 0.145), (0.568, 0.866), (0.188, 0.870)]
    warped_menu = warp_rgba_to_quad(menu_art, flatlay.width, flatlay.height, menu_quad)
    out = blend_multiply_ink(flatlay, warped_menu, ink_strength=0.93, soften_px=0.45)

    # Debossed cream/amber ring seal on dark espresso pulp coaster (center 0.699, 0.648)
    coaster_art = render_html_rgba(
        browser,
        f"""
        <div style="width:520px;height:520px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;position:relative;">
          <div style="position:absolute;inset:24px;border-radius:50%;border:3px solid rgba(235,228,215,0.72);"></div>
          <div style="width:300px;height:112px;">
            {logo_cream.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="font-family:'Geist Mono',monospace;font-size:19px;font-weight:600;letter-spacing:0.14em;color:#DDA04B;">
            SLOW EVENINGS
          </div>
        </div>
        """,
        520,
        520,
    )
    coaster_quad = [(0.625, 0.542), (0.773, 0.542), (0.773, 0.742), (0.625, 0.742)]
    warped_coaster = warp_rgba_to_quad(coaster_art, out.width, out.height, coaster_quad)
    out = blend_weave_pigment(out, warped_coaster, strength=0.80, soften_px=0.5)

    save_master_jpg(out, "3cu9t0vRFTxLWvpYP5xm1pLOFk.jpg", quality=94)
    print("Built v3 menu flatlay 3cu9t0vRFTxLWvpYP5xm1pLOFk.jpg")


def composite_physical_packaging_boxes(browser, logo_espresso: str):
    """Gk9YTSesMbgmpBazGuUwef9NIuc (2400x1200): Checkered roast/pastry box stack + hand."""
    # Composite onto 2x source aspect (2752x1536) first so grid coordinates align 1:1, then fit_cover to 2400x1200
    raw = Image.open(SRC_PHOTOS / "v3-packaging-boxes.jpg").convert("RGB").resize((2752, 1536), Image.Resampling.LANCZOS)

    front_label = render_html_rgba(
        browser,
        f"""
        <div style="width:760px;height:520px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:48px 54px;color:#24110C;">
          <div style="font-family:'Geist Mono',monospace;font-size:24px;font-weight:600;letter-spacing:0.15em;color:#8C4E29;">ROASTERY &amp; PASTRY</div>
          <div style="width:520px;height:195px;">
            {logo_espresso.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="width:100%;border-top:2px solid rgba(140,78,41,0.5);padding-top:16px;display:flex;justify-content:space-between;font-family:'Geist Mono',monospace;font-size:21px;font-weight:500;letter-spacing:0.11em;color:#594A42;">
            <span>SINGLE ORIGIN</span>
            <span>EST. 2026</span>
          </div>
        </div>
        """,
        760,
        520,
    )
    front_quad = [(0.440, 0.625), (0.602, 0.637), (0.600, 0.830), (0.440, 0.816)]
    warped_front = warp_rgba_to_quad(front_label, raw.width, raw.height, front_quad)
    out = blend_multiply_ink(raw, warped_front, ink_strength=0.94, soften_px=0.55)

    back_label = render_html_rgba(
        browser,
        f"""
        <div style="width:480px;height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#24110C;">
          <div style="width:360px;height:135px;">
            {logo_espresso.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="font-family:'Geist Mono',monospace;font-size:22px;font-weight:600;letter-spacing:0.16em;color:#8C4E29;">BATCH 04 · JAKARTA</div>
        </div>
        """,
        480,
        280,
    )
    back_quad = [(0.320, 0.376), (0.415, 0.369), (0.415, 0.474), (0.320, 0.480)]
    warped_back = warp_rgba_to_quad(back_label, out.width, out.height, back_quad)
    out = blend_multiply_ink(out, warped_back, ink_strength=0.88, soften_px=0.7)

    out_cropped = fit_cover(out, 2400, 1200)
    save_master_jpg(out_cropped, "Gk9YTSesMbgmpBazGuUwef9NIuc.jpg", quality=94)
    print("Built v3 packaging stack Gk9YTSesMbgmpBazGuUwef9NIuc.jpg")


def composite_architectural_signage(browser, logo_cream: str):
    """5HPuOSuiD9BOwdr5aTdlopUs1O0 (1254x1216 PNG): Woven Warm Timber awning + hanging blade banner."""
    base = fit_cover(Image.open(SRC_PHOTOS / "v3-architectural-signage.jpg").convert("RGB"), 1254, 1216)

    banner_art = render_html_rgba(
        browser,
        f"""
        <div style="width:680px;height:780px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:74px 52px 66px;color:#F4EFE6;">
          <div style="font-family:'Geist Mono',monospace;font-size:28px;font-weight:500;letter-spacing:0.15em;opacity:0.9;">ESPRESSO BAR</div>
          <div style="width:540px;height:202px;">
            {logo_cream.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="width:100%;border-top:2px solid rgba(244,239,230,0.45);padding-top:22px;display:flex;justify-content:space-between;font-family:'Geist Mono',monospace;font-size:24px;font-weight:500;letter-spacing:0.11em;opacity:0.9;">
            <span>ROASTERY</span>
            <span>07—23</span>
          </div>
        </div>
        """,
        680,
        780,
    )
    banner_quad = [(0.494, 0.388), (0.668, 0.425), (0.668, 0.642), (0.494, 0.614)]
    warped_banner = warp_rgba_to_quad(banner_art, base.width, base.height, banner_quad)
    out = blend_weave_pigment(base, warped_banner, strength=0.92, soften_px=0.55)

    awning_art = render_html_rgba(
        browser,
        f"""
        <div style="width:920px;height:220px;display:flex;align-items:center;justify-content:space-between;padding:0 36px;color:#F4EFE6;">
          <div style="width:340px;height:128px;">
            {logo_cream.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="font-family:'Geist Mono',monospace;font-size:28px;font-weight:500;letter-spacing:0.14em;opacity:0.88;">JAKARTA · EST. 2026</div>
        </div>
        """,
        920,
        220,
    )
    awning_quad = [(0.025, 0.512), (0.302, 0.488), (0.302, 0.546), (0.025, 0.572)]
    warped_awning = warp_rgba_to_quad(awning_art, out.width, out.height, awning_quad)
    out = blend_weave_pigment(out, warped_awning, strength=0.88, soften_px=0.6)

    out.convert("RGBA").save(MASTERS / "5HPuOSuiD9BOwdr5aTdlopUs1O0.png", format="PNG", optimize=True)
    print("Built v3 architectural signage 5HPuOSuiD9BOwdr5aTdlopUs1O0.png")


def composite_sunlit_posters(browser, logo_white: str):
    """zqNght... & tLZ5tJ... (1000x1400): Framed physical gradient posters under sunlit plaster/palm shadows."""
    wall_raw = fit_cover(Image.open(SRC_PHOTOS / "v3-poster-wall-backdrop.jpg").convert("RGB"), 1000, 1400)
    wall_np = np.array(wall_raw, dtype=np.float32) / 255.0
    wall_luma = wall_np[:, :, 0:1] * 0.299 + wall_np[:, :, 1:2] * 0.587 + wall_np[:, :, 2:3] * 0.114
    wall_b64 = b64_file(SRC_PHOTOS / "v3-poster-wall-backdrop.jpg", "image/jpeg")

    # Fine uncoated cotton paper noise
    rng = np.random.default_rng(42)
    grain = rng.normal(0.0, 0.015, (1400, 1000, 1)).astype(np.float32)

    posters_spec = [
        (
            "zqNghtROatxZ4uWDLtqYNZViQo.jpg",
            f"""
            <div style="width:1000px;height:1400px;position:relative;overflow:hidden;">
              <img src="{wall_b64}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.98) contrast(1.03);" />
              <div style="position:absolute;left:138px;top:98px;width:790px;height:1145px;background:linear-gradient(180deg,#C86A1E 0%,rgb(228,168,118) 100%);box-shadow:-18px 26px 48px rgba(24,12,8,0.34), 0 4px 12px rgba(24,12,8,0.18), inset 0 0 0 1px rgba(255,255,255,0.22);position:absolute;color:#FFFFFF;padding:54px 52px;display:flex;flex-direction:column;justify-content:space-between;">
                <div style="width:686px;height:256px;">
                  {logo_white.replace('<svg ', '<svg style="width:100%;height:100%" ')}
                </div>
                <div style="font-family:'Rubik',sans-serif;font-size:66px;font-weight:700;line-height:1.08;letter-spacing:-0.02em;margin-top:40px;">
                  Slow Pour<br>&amp; Cappuccino
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,0.38);padding-top:22px;font-family:'Geist Mono',monospace;font-size:24px;font-weight:500;line-height:1.4;letter-spacing:0.07em;opacity:0.95;">
                  <span>KEMANG SELATAN 18<br>SOUTH JAKARTA</span>
                  <span>07—23</span>
                </div>
              </div>
            </div>
            """,
        ),
        (
            "tLZ5tJpyNJeqxqwfw6ninoYRdzw.jpg",
            f"""
            <div style="width:1000px;height:1400px;position:relative;overflow:hidden;">
              <img src="{wall_b64}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.96) contrast(1.04);" />
              <div style="position:absolute;left:138px;top:98px;width:790px;height:1145px;background:linear-gradient(180deg,#24110C 0%,rgb(140,78,41) 100%);box-shadow:-18px 26px 48px rgba(24,12,8,0.38), 0 4px 12px rgba(24,12,8,0.22), inset 0 0 0 1px rgba(244,239,230,0.16);color:#F4EFE6;padding:58px 54px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="font-family:'Geist Mono',monospace;font-size:23px;font-weight:600;letter-spacing:0.13em;color:#DDA04B;margin-bottom:26px;">HOUSE FEATURE</div>
                  <div style="font-family:'Rubik',sans-serif;font-size:78px;font-weight:700;line-height:1.03;letter-spacing:-0.025em;margin-bottom:26px;">
                    Caramel<br>Cortado
                  </div>
                  <div style="font-family:'Geist Mono',monospace;font-size:24px;font-weight:500;letter-spacing:0.08em;color:#F4EFE6;opacity:0.9;">SINGLE ORIGIN · 48K IDR</div>
                </div>
                <div style="width:682px;height:255px;">
                  {logo_white.replace('<svg ', '<svg style="width:100%;height:100%" ')}
                </div>
              </div>
            </div>
            """,
        ),
    ]

    for fname, html_body in posters_spec:
        im = render_html_rgba(browser, html_body, 1000, 1400).convert("RGB")
        im_np = np.array(im, dtype=np.float32) / 255.0
        # Cast soft diagonal raking wall sunlight/palm shadows (~24%) + cotton paper grain onto the hanging sheet
        shadow_factor = np.clip(0.86 + 0.24 * wall_luma, 0.72, 1.06)
        blended = im_np * shadow_factor + grain
        out = Image.fromarray(np.clip(blended * 255.0, 0, 255).astype(np.uint8), mode="RGB")
        save_master_jpg(out, fname, quality=94)
        print(f"Built sunlit physical poster {fname}")


def render_playwright_masters(browser):
    logo_espresso = (SRC_LOGO / "crema-logo-espresso.svg").read_text(encoding="utf-8")
    logo_cream = (SRC_LOGO / "crema-logo-cream.svg").read_text(encoding="utf-8")
    logo_white = (SRC_LOGO / "crema-logo-white.svg").read_text(encoding="utf-8")
    logo_outline = (SRC_LOGO / "crema-logo-outline.svg").read_text(encoding="utf-8")

    # 1. SPaKAVDaIGZLfVjajfL7nirWBM (2400x1200) - Tactile Steamed Milk Cotton Stock Plate
    sp_im = render_html_rgba(
        browser,
        f"""
        <div style="width:2400px;height:1200px;background:radial-gradient(ellipse at 24% 20%, #F2ECE1 0%, #EBE4D7 58%, #E1D8C8 100%);display:flex;align-items:center;justify-content:center;position:relative;">
          <div style="width:1760px;height:660px;">{logo_espresso.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
        </div>
        """,
        2400, 1200,
    ).convert("RGB")
    rng = np.random.default_rng(7)
    paper_tooth = rng.normal(0.0, 0.012, (1200, 2400, 1)).astype(np.float32)
    sp_np = np.clip(np.array(sp_im, dtype=np.float32) / 255.0 + paper_tooth, 0.0, 1.0)
    save_master_jpg(Image.fromarray((sp_np * 255).astype(np.uint8)), "SPaKAVDaIGZLfVjajfL7nirWBM.jpg", quality=93)

    # 2. n8BFAvaVvHXO5KFw2kmw9XTpwk (2400x1200) - Tactile Espresso Bookcloth & Copper Folio Plate
    n8_im = render_html_rgba(
        browser,
        f"""
        <div style="width:2400px;height:1200px;background:radial-gradient(ellipse at 72% 28%, #2E1711 0%, #24110C 62%, #190B07 100%);position:relative;font-family:'Geist Mono',monospace;color:#F4EFE6;">
          <div style="position:absolute;inset:48px;border:1px solid rgba(221,160,75,0.22);pointer-events:none;"></div>
          <div style="position:absolute;left:185px;top:215px;font-size:46px;font-weight:500;letter-spacing:0.12em;">ESPRESSO</div>
          <div style="position:absolute;right:185px;top:215px;font-size:46px;font-weight:500;letter-spacing:0.12em;">ROASTERY</div>
          <div style="position:absolute;left:240px;top:255px;width:1920px;height:720px;">
            {logo_cream.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
          <div style="position:absolute;left:185px;right:185px;bottom:195px;border-top:2px solid rgba(244,239,230,0.22);padding-top:36px;display:flex;justify-content:space-between;font-size:40px;letter-spacing:0.1em;color:#DDA04B;">
            <span>CAPPUCCINO BAR</span>
            <span>SLOW EVENINGS · 07–23</span>
          </div>
        </div>
        """,
        2400, 1200,
    ).convert("RGB")
    cloth_tooth = rng.normal(0.0, 0.011, (1200, 2400, 1)).astype(np.float32)
    n8_np = np.clip(np.array(n8_im, dtype=np.float32) / 255.0 + cloth_tooth, 0.0, 1.0)
    save_master_jpg(Image.fromarray((n8_np * 255).astype(np.uint8)), "n8BFAvaVvHXO5KFw2kmw9XTpwk.jpg", quality=93)

    # 3. Tactile Parlour Composite Masters (Hero, Menu, Boxes, Signage, Posters)
    composite_physical_hero(browser, logo_espresso)
    composite_physical_menu_flatlay(browser, logo_espresso, logo_cream)
    composite_physical_packaging_boxes(browser, logo_espresso)
    composite_architectural_signage(browser, logo_cream)
    composite_sunlit_posters(browser, logo_white)

    # 4. Fta0F7kQQojEhhqxW8cmD3QbVGM (1912x2677) - Cold brew macro poster
    cb_data = b64_file(SRC_PHOTOS / "macro-coldbrew-clean.jpg", "image/jpeg")
    render_html_image(
        browser,
        f"""
        <div style="width:1912px;height:2677px;position:relative;color:#FFFFFF;">
          <img src="{cb_data}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;left:156px;top:1740px;font-family:'Geist Mono',monospace;font-size:56px;font-weight:500;line-height:1.18;letter-spacing:0.06em;">
            DUSK<br>MENU
          </div>
          <div style="position:absolute;left:735px;top:1740px;font-family:'Geist Mono',monospace;font-size:56px;font-weight:500;line-height:1.18;letter-spacing:0.06em;">
            NOW<br>AT
          </div>
          <div style="position:absolute;left:1140px;top:1695px;width:630px;height:236px;">
            {logo_white.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
        </div>
        """,
        1912, 2677, MASTERS / "Fta0F7kQQojEhhqxW8cmD3QbVGM.jpg",
    )

    # 5. DHCp0FOYIvOB0TjkJIzQjltk (1912x2677) - Velvet Pour macro poster
    vp_data = b64_file(SRC_PHOTOS / "macro-velvet-clean.jpg", "image/jpeg")
    render_html_image(
        browser,
        f"""
        <div style="width:1912px;height:2677px;position:relative;color:#FFFFFF;">
          <img src="{vp_data}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;left:156px;top:2165px;font-family:'Geist Mono',monospace;font-size:54px;font-weight:500;line-height:1.18;letter-spacing:0.06em;">
            VELVET<br>POUR
          </div>
          <div style="position:absolute;left:735px;top:2165px;font-family:'Geist Mono',monospace;font-size:54px;font-weight:500;line-height:1.18;letter-spacing:0.06em;">
            NOW<br>AT
          </div>
          <div style="position:absolute;left:1140px;top:2125px;width:630px;height:236px;">
            {logo_white.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
        </div>
        """,
        1912, 2677, MASTERS / "DHCp0FOYIvOB0TjkJIzQjltk.jpg",
    )

    # 6. FNZCgNG0CCm25mcKKS9lReqbno (1968x2636) - User's cleaned upright interior photo (ZERO white car)
    cafe_data = b64_file(SRC_PHOTOS / "cafe-evening-clean.jpg", "image/jpeg")
    render_html_image(
        browser,
        f"""
        <div style="width:1968px;height:2636px;position:relative;color:#FFFFFF;">
          <img src="{cafe_data}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;left:130px;right:130px;bottom:145px;display:flex;justify-content:space-between;align-items:flex-end;filter:drop-shadow(0 3px 16px rgba(14,8,6,0.55));">
            <div style="display:flex;gap:120px;font-family:'Geist Mono',monospace;font-size:52px;font-weight:500;line-height:1.18;letter-spacing:0.06em;">
              <div>SLOW<br>EVENINGS</div>
              <div>OPEN<br>UNTIL 23</div>
            </div>
            <div style="width:650px;height:244px;">
              {logo_white.replace('<svg ', '<svg style="width:100%;height:100%" ')}
            </div>
          </div>
        </div>
        """,
        1968, 2636, MASTERS / "FNZCgNG0CCm25mcKKS9lReqbno.jpg",
    )

    # 7. UAKCUif6ofiURPbfmTRNopCAsw (2177x1198) - Dark #0E0907 Tactile Parlour & A-Frame Editorial Moodboard
    hero_thumb = b64_file(MASTERS / "aMwwbjaEy0hJE6x3YqMD0j3mjMM.jpg", "image/jpeg")
    flatlay_thumb = b64_file(MASTERS / "3cu9t0vRFTxLWvpYP5xm1pLOFk.jpg", "image/jpeg")
    foil_thumb = b64_file(MASTERS / "aIEV1hcqxeK04SOq1FTfYwVPIAI.jpg", "image/jpeg")
    sign_thumb = b64_file(MASTERS / "5HPuOSuiD9BOwdr5aTdlopUs1O0.png", "image/png")
    cup_thumb = b64_file(MASTERS / "O4qogVdT2z6bDD7hYx2jx0ibJBU.jpg", "image/jpeg")
    cafe_thumb = b64_file(SRC_PHOTOS / "cafe-evening-clean.jpg", "image/jpeg")

    render_html_image(
        browser,
        f"""
        <div style="width:2177px;height:1198px;background:#0E0907;position:relative;overflow:hidden;">
          <!-- Left user A-frame interior vertical frame -->
          <img src="{cafe_thumb}" style="position:absolute;left:0px;top:92px;width:480px;height:660px;object-fit:cover;object-position:center 35%;" />
          <!-- Upper-mid Copper Foil Macro frame -->
          <img src="{foil_thumb}" style="position:absolute;left:515px;top:-20px;width:390px;height:470px;object-fit:cover;object-position:center;" />
          <!-- Bottom-left Handheld Cup crop -->
          <img src="{cup_thumb}" style="position:absolute;left:430px;top:735px;width:420px;height:470px;object-fit:cover;object-position:center 46%;" />
          <!-- Center Studio Flatlay Menu & Brass Demitasse -->
          <img src="{flatlay_thumb}" style="position:absolute;left:935px;top:78px;width:935px;height:698px;object-fit:cover;opacity:0.98;" />
          <!-- Small Hero Parlour Table Inset -->
          <img src="{hero_thumb}" style="position:absolute;left:1415px;top:562px;width:340px;height:190px;object-fit:cover;box-shadow:0 12px 32px rgba(0,0,0,0.68);border:1px solid rgba(244,239,230,0.22);" />
          <!-- Bottom center Cedar Smoke architectural signage inset -->
          <img src="{sign_thumb}" style="position:absolute;left:990px;top:815px;width:365px;height:383px;object-fit:cover;" />
          <!-- Right top Warm Timber Amber Dusk tile -->
          <div style="position:absolute;right:0;top:0;width:458px;height:668px;background:linear-gradient(180deg,#C86A1E 0%,rgb(228,168,118) 100%);padding:48px 42px;">
            <div style="color:#24110C;font-family:'Geist Mono',monospace;font-size:26px;font-weight:600;letter-spacing:0.08em;white-space:nowrap;">ESPRESSO &amp; PASTRY</div>
          </div>
          <!-- Giant white outline crema wordmark overlay at bottom right -->
          <div style="position:absolute;left:1100px;bottom:-18px;width:1050px;height:394px;opacity:0.84;">
            {logo_outline.replace('<svg ', '<svg style="width:100%;height:100%" ')}
          </div>
        </div>
        """,
        2177, 1198, MASTERS / "UAKCUif6ofiURPbfmTRNopCAsw.jpg",
    )


def export_all_hashed_variants():
    count = 0
    for base_id, variants in VARIANT_MAP.items():
        master_jpg = MASTERS / f"{base_id}.jpg"
        master_png = MASTERS / f"{base_id}.png"
        src = master_png if master_png.exists() else master_jpg
        if not src.exists():
            raise FileNotFoundError(f"Missing master for {base_id}")
        im = Image.open(src)
        for fname, tw, th in variants:
            out = OUT_IMAGES / fname
            resized = fit_cover(im, tw, th)
            if out.suffix.lower() == ".png":
                resized.convert("RGBA").save(out, format="PNG", optimize=True)
            else:
                resized.convert("RGB").save(out, format="JPEG", quality=92, optimize=True)
            count += 1
    print(f"Exported {count} hashed image variants to {OUT_IMAGES}")


def build_icons_and_og():
    favicon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#24110C"/>
  <path d="M40.5 24.5C38.4 21.8 35.1 20.4 31.4 20.4C24.2 20.4 19 25.5 19 32.1C19 38.7 24.2 43.8 31.4 43.8C35.3 43.8 38.6 42.3 40.7 39.4L36.1 35.9C34.9 37.5 33.3 38.4 31.4 38.4C27.8 38.4 25.3 35.8 25.3 32.1C25.3 28.4 27.8 25.8 31.4 25.8C33.3 25.8 34.8 26.6 35.9 28.1L40.5 24.5Z" fill="#F4EFE6"/>
  <circle cx="43.5" cy="39.5" r="3.4" fill="#DDA04B"/>
</svg>"""
    (ROOT / "public" / "favicon.svg").write_text(favicon_svg, encoding="utf-8")

    logo_white = Image.open(SRC_LOGO / "crema-logo-white-2400w.png").convert("RGBA")
    logo_esp = Image.open(SRC_LOGO / "crema-logo-espresso-2400w.png").convert("RGBA")

    def make_square_icon(size: int, bg_rgb: tuple, use_white: bool, out_file: pathlib.Path):
        canvas = Image.new("RGBA", (size, size), bg_rgb + (255,))
        lg = logo_white if use_white else logo_esp
        pad = int(size * 0.14)
        tw = size - 2 * pad
        th = round(lg.height * (tw / lg.width))
        lg_r = lg.resize((tw, th), Image.Resampling.LANCZOS)
        canvas.alpha_composite(lg_r, (pad, (size - th) // 2))
        canvas.save(out_file, format="PNG", optimize=True)

    make_square_icon(180, (36, 17, 12), True, ROOT / "public" / "apple-touch-icon.png")
    make_square_icon(180, (36, 17, 12), True, OUT_ICONS / "default-touch-icon.v3.png")
    make_square_icon(64, (244, 239, 230), False, OUT_ICONS / "default-favicon-light.v1.png")
    make_square_icon(64, (36, 17, 12), True, OUT_ICONS / "default-favicon-dark.v1.png")

    sf = Image.open(MASTERS / "aMwwbjaEy0hJE6x3YqMD0j3mjMM.jpg").convert("RGB")
    og = fit_cover(sf, 1200, 630)
    og.save(ROOT / "public" / "og-cover.jpg", format="JPEG", quality=92, optimize=True)
    print("Generated favicon.svg, apple-touch-icon.png, og-cover.jpg, and site icons.")


def build_logo_kit_zip():
    zip_path = OUT_DOWNLOADS / "crema-logo-kit.zip"
    readme = """CREMA — Master Logo Package
Brand System by Proiectum Studio (https://proiectum.studio)

Contents:
- crema-logo-espresso.svg       Primary dark Roasted Espresso (#24110C) vector
- crema-logo-cream.svg          Steamed Linen (#F4EFE6) reversed vector
- crema-logo-white.svg          Pure White (#FFFFFF) vector for dark & gradient posters
- crema-logo-outline.svg        White outline stroke vector for glass & editorial overlays
- crema-logo-espresso-2400w.png Transparent 2400px PNG (dark)
- crema-logo-white-2400w.png    Transparent 2400px PNG (white)

Usage Rules:
1. Maintain minimum 1x cap-height clearspace around the wordmark.
2. Never distort, apply heavy drop shadows, or enclose inside unapproved badges.
3. Use #24110C on pale cafe surfaces and #FFFFFF / #F4EFE6 on Warm Timber, Espresso, or gradients.
"""
    files = [
        "crema-logo-espresso.svg",
        "crema-logo-cream.svg",
        "crema-logo-white.svg",
        "crema-logo-outline.svg",
        "crema-logo-espresso-2400w.png",
        "crema-logo-white-2400w.png",
    ]
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("README.txt", readme)
        for fn in files:
            zf.write(SRC_LOGO / fn, arcname=fn)
    print(f"Built {zip_path} ({zip_path.stat().st_size} bytes)")


def build_production_pdf(browser):
    pdf_path = OUT_DOWNLOADS / "crema-colour-production-sheet.pdf"
    logo_svg = (SRC_LOGO / "crema-logo-espresso.svg").read_text(encoding="utf-8")

    swatch_cards = ""
    for sw in CFG["palette"]:
        fg = "#FFFFFF" if sw["textOnDark"] else "#1B120E"
        border = "none" if sw["textOnDark"] else "1px solid rgba(27,18,14,0.14)"
        swatch_cards += f"""
        <div style="background:{sw['hex']};color:{fg};border:{border};padding:18px;height:185px;display:flex;flex-direction:column;justify-content:space-between;">
          <div style="font-size:13px;font-weight:700;font-family:'Geist',sans-serif;">{sw['name']}</div>
          <div style="font-family:'Geist Mono',monospace;font-size:9.5px;line-height:1.55;">
            HEX {sw['hex']}<br>
            RGB {sw['rgb']}<br>
            CMYK {sw['cmyk']}<br>
            HSL {sw['hsl']}<br>
            Pantone {sw['pantone']}
          </div>
        </div>
        """

    grad_cards = ""
    for gr in CFG["gradients"]:
        fg = "#FFFFFF" if gr["textOnDark"] else "#1B120E"
        grad_cards += f"""
        <div style="background:{gr['css']};color:{fg};padding:18px;height:165px;display:flex;flex-direction:column;justify-content:space-between;">
          <div style="font-size:13px;font-weight:700;font-family:'Geist',sans-serif;">{gr['name']}</div>
          <div style="font-family:'Geist Mono',monospace;font-size:9.5px;line-height:1.5;">
            RGB {gr['fromRgb']}<br>
            &rarr; RGB {gr['toRgb']}
          </div>
        </div>
        """

    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
      {font_css()}
      @page {{ size: A4 portrait; margin: 0; }}
      * {{ box-sizing: border-box; margin: 0; padding: 0; }}
      body {{
        width: 210mm; min-height: 297mm; padding: 18mm 18mm 16mm;
        background: #F4EFE6; color: #1B120E;
        font-family: 'Geist', sans-serif;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }}
      .mono {{ font-family: 'Geist Mono', monospace; }}
    </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:14px;border-bottom:1px solid rgba(27,18,14,0.22);margin-bottom:22px;">
        <div>
          <div style="width:128px;height:48px;margin-bottom:8px;">{logo_svg.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
          <div class="mono" style="font-size:9.5px;letter-spacing:0.06em;color:#594A42;">PRINT &amp; DIGITAL COLOUR PRODUCTION SHEET · REV 2026.11</div>
        </div>
        <div class="mono" style="text-align:right;font-size:9.5px;line-height:1.5;color:#594A42;">
          CREMA ESPRESSO BAR<br>
          {CFG['brand']['location']}<br>
          {CFG['brand']['email']}
        </div>
      </div>

      <h1 style="font-family:'Rubik',sans-serif;font-size:34px;font-weight:700;letter-spacing:-0.025em;margin-bottom:8px;">Core Brand Palette</h1>
      <p style="font-size:12px;line-height:1.55;color:#594A42;max-width:520px;margin-bottom:18px;">
        Drawn directly from espresso bar materials: warm cedar timber rafters, steamed milk foam, golden caramel crema, and deep roasted-espresso contrast. Proof CMYK and Pantone targets on uncoated stock prior to press release.
      </p>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:26px;">
        {swatch_cards}
      </div>

      <h2 style="font-family:'Rubik',sans-serif;font-size:21px;font-weight:700;letter-spacing:-0.02em;margin-bottom:12px;">Atmospheric Gradients</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:26px;">
        {grad_cards}
      </div>

      <div style="border-top:1px solid rgba(27,18,14,0.2);padding-top:16px;margin-bottom:24px;">
        <div class="mono" style="font-size:9.5px;letter-spacing:0.06em;color:#594A42;margin-bottom:8px;">USAGE PROPORTION (BASE &rarr; ACCENTS)</div>
        <div style="display:flex;height:28px;width:100%;border:1px solid rgba(27,18,14,0.2);">
          <div style="flex:4;background:#24110C;"></div>
          <div style="flex:2;background:#8C4E29;"></div>
          <div style="flex:1;background:#EBE4D7;"></div>
          <div style="flex:1;background:#DDA04B;"></div>
        </div>
        <p style="font-size:11px;line-height:1.5;color:#594A42;margin-top:10px;">
          Use Steamed Milk &amp; Warm Linen as breathable structural fields, Roasted Espresso for high-contrast anchors, Warm Timber for architectural depth, and Caramel Crema sparingly as an evening highlight.
        </p>
      </div>

      <div style="background:#EBE4D7;padding:14px 16px;border:1px solid rgba(27,18,14,0.14);margin-bottom:26px;">
        <div class="mono" style="font-size:9.5px;font-weight:600;margin-bottom:4px;">TYPOGRAPHY &amp; CLEARSPACE NOTES</div>
        <p style="font-size:11px;line-height:1.5;color:#594A42;">
          1. Primary Display: Rubik · UI &amp; Body: Geist · Secondary &amp; Spec: Geist Mono.<br>
          2. Keep the CREMA wordmark white (#FFFFFF) or Linen (#F4EFE6) on Warm Timber, Roasted Espresso, or gradients, and #24110C on uncoated milk/crema stock.<br>
          3. Minimum wordmark width: 28 mm for sleeves and coasters; 98 px for digital headers.
        </p>
      </div>

      <div class="mono" style="display:flex;justify-content:space-between;font-size:9px;color:#594A42;border-top:1px solid rgba(27,18,14,0.2);padding-top:12px;">
        <span>{CFG['brand']['copyright']}</span>
        <span>proiectum.studio</span>
      </div>
    </body></html>"""

    page = browser.new_page()
    page.set_content(html, wait_until="load")
    page.evaluate("document.fonts.ready")
    page.pdf(path=str(pdf_path), format="A4", print_background=True)
    page.close()
    print(f"Built {pdf_path} ({pdf_path.stat().st_size} bytes)")


def main():
    prepare_handheld_cup_master()
    prepare_photo_bases()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--disable-gpu", "--disable-dev-shm-usage"])
        render_playwright_masters(browser)
        build_production_pdf(browser)
        browser.close()
    export_all_hashed_variants()
    build_icons_and_og()
    build_logo_kit_zip()
    print("ALL 15 V3 TACTILE MASTERS + 50 VARIANTS + KIT + PDF COMPLETE.")


if __name__ == "__main__":
    main()
