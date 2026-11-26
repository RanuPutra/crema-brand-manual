#!/usr/bin/env python3
"""
1. Downloads clean OFL WOFF2 fonts locally into public/assets/fonts/ (zero external runtime calls):
   - Fraunces (variable opsz/SOFT/WONK/wght, latin)
   - Plus Jakarta Sans (variable wght 400..700, latin)
   - IBM Plex Mono (400, 500, 600, latin)
2. Downloads Fraunces static instanced TTF (opsz=144, SOFT=70, WONK=1, wght=800) into assets-src/fonts/
3. Uses fontTools SVGPathPen + BoundsPen to extract a crisp, optically kerned
   lowercase "crema" vector wordmark inside viewBox="0 0 160 60".
4. Exports all 6 master logo files + transparent 2400w PNGs + 4-swatch preview sheet.
"""
import pathlib
import re
import urllib.request
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT_PUBLIC = ROOT / "public" / "assets" / "fonts"
FONT_SRC = ROOT / "assets-src" / "fonts"
LOGO_DIR = ROOT / "assets-src" / "logo"
PHOTO_DIR = ROOT / "assets-src" / "photos"

for d in (FONT_PUBLIC, FONT_SRC, LOGO_DIR, PHOTO_DIR):
    d.mkdir(parents=True, exist_ok=True)

UA_CHROME = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)
UA_TTF = "Python-urllib/3.11"


def fetch_bytes(url: str, ua: str = UA_CHROME) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def download_fonts():
    # Static pre-instanced Fraunces TTF for crisp mathematical outline extraction
    ttf_css = fetch_bytes(
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,SOFT,WONK,wght@144,70,1,800&display=swap",
        ua=UA_TTF,
    ).decode("utf-8")
    ttf_match = re.search(r"url\((https://[^)]+\.ttf)\)", ttf_css)
    if not ttf_match:
        raise RuntimeError(f"Could not find TTF URL in CSS:\n{ttf_css}")
    ttf_path = FONT_SRC / "fraunces-wordmark.ttf"
    if not ttf_path.exists():
        ttf_path.write_bytes(fetch_bytes(ttf_match.group(1), ua=UA_TTF))
        print(f"Downloaded {ttf_path} ({ttf_path.stat().st_size} bytes)")

    targets = [
        (
            "https://fonts.googleapis.com/css2?family=Fraunces:opsz,SOFT,WONK,wght@9..144,0..100,0..1,400..900&display=swap",
            {None: FONT_PUBLIC / "fraunces-var.woff2"},
        ),
        (
            "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..700&display=swap",
            {None: FONT_PUBLIC / "plus-jakarta-sans-var.woff2"},
        ),
        (
            "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
            {
                "400": FONT_PUBLIC / "ibm-plex-mono-400.woff2",
                "500": FONT_PUBLIC / "ibm-plex-mono-500.woff2",
                "600": FONT_PUBLIC / "ibm-plex-mono-600.woff2",
            },
        ),
    ]

    for css_url, mapping in targets:
        css = fetch_bytes(css_url, ua=UA_CHROME).decode("utf-8")
        blocks = re.findall(r"/\*\s*latin\s*\*/\s*@font-face\s*\{([^}]+)\}", css)
        if not blocks:
            raise RuntimeError(f"No /* latin */ blocks found for {css_url}")
        for blk in blocks:
            w_m = re.search(r"font-weight:\s*([0-9]+)", blk)
            u_m = re.search(r"url\((https://[^)]+\.woff2)\)", blk)
            if not u_m:
                continue
            w = w_m.group(1) if w_m else None
            dest = mapping.get(w) or mapping.get(None)
            if dest and not dest.exists():
                data = fetch_bytes(u_m.group(1), ua=UA_CHROME)
                dest.write_bytes(data)
                print(f"Downloaded {dest.name} ({len(data)} bytes)")

    return ttf_path


def extract_wordmark_svg_path(ttf_path: pathlib.Path) -> str:
    font = TTFont(str(ttf_path))
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()
    hmtx = font["hmtx"]
    upm = font["head"].unitsPerEm  # typically 1000

    word = "crema"
    # Optical letter-by-letter pair adjustments (in UPM units) for tight bespoke wordmark lockup
    pair_kern = {
        ("c", "r"): -22,
        ("r", "e"): -38,
        ("e", "m"): -18,
        ("m", "a"): -20,
    }
    base_track = -28

    raw_positions = []
    cursor_x = 0.0
    for idx, ch in enumerate(word):
        gname = cmap[ord(ch)]
        if idx > 0:
            cursor_x += base_track + pair_kern.get((word[idx - 1], ch), 0)
        raw_positions.append((ch, gname, cursor_x))
        adv, _ = hmtx[gname]
        cursor_x += adv

    # Compute exact ink bounding box across all placed glyphs
    min_x, min_y, max_x, max_y = 1e9, 1e9, -1e9, -1e9
    for _ch, gname, x_off in raw_positions:
        bp = BoundsPen(glyph_set)
        glyph_set[gname].draw(bp)
        if bp.bounds:
            gx0, gy0, gx1, gy1 = bp.bounds
            min_x = min(min_x, x_off + gx0)
            max_x = max(max_x, x_off + gx1)
            min_y = min(min_y, gy0)
            max_y = max(max_y, gy1)

    ink_w = max_x - min_x
    ink_h = max_y - min_y

    # Fit cleanly inside viewBox="0 0 160 60" with balanced padding
    target_w = 148.0
    target_h = 46.0
    scale = min(target_w / ink_w, target_h / ink_h)

    scaled_w = ink_w * scale
    scaled_h = ink_h * scale
    offset_x = (160.0 - scaled_w) * 0.5 - min_x * scale
    # Flip Y: font max_y maps to top = (60 - scaled_h) * 0.5
    top_y = (60.0 - scaled_h) * 0.5
    offset_y = top_y + max_y * scale

    parts = []
    for _ch, gname, x_off in raw_positions:
        pen = SVGPathPen(glyph_set)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, offset_x + x_off * scale, offset_y))
        glyph_set[gname].draw(tpen)
        cmd = pen.getCommands()
        if cmd:
            parts.append(cmd)

    d = " ".join(parts)
    # Collapse decimal precision cleanly to 2 decimal places
    d = re.sub(r"-?\d+\.\d+", lambda m: f"{float(m.group(0)):.2f}", d)
    print(f"Extracted Fraunces wordmark path (upm={upm}, ink={ink_w:.0f}x{ink_h:.0f}, len={len(d)} chars)")
    return d


def write_logos_and_preview(d: str):
    svgs = {
        "crema-logo-espresso.svg": (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible">'
            f'<path d="{d}" fill="#24110C" fill-rule="nonzero"/></svg>'
        ),
        "crema-logo-cream.svg": (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible">'
            f'<path d="{d}" fill="#F4EFE6" fill-rule="nonzero"/></svg>'
        ),
        "crema-logo-white.svg": (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible">'
            f'<path d="{d}" fill="#FFFFFF" fill-rule="nonzero"/></svg>'
        ),
        "crema-logo-outline.svg": (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" overflow="visible">'
            f'<path d="{d}" fill="none" stroke="#FFFFFF" stroke-width="1.35" stroke-linejoin="round"/></svg>'
        ),
    }
    for fname, content in svgs.items():
        (LOGO_DIR / fname).write_text(content, encoding="utf-8")
        print(f"Wrote {fname} ({len(content)} bytes)")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Transparent 2400x900 PNGs for compositing & icon generation
        for key, out_png in [
            ("crema-logo-espresso.svg", "crema-logo-espresso-2400w.png"),
            ("crema-logo-white.svg", "crema-logo-white-2400w.png"),
            ("crema-logo-cream.svg", "crema-logo-cream-2400w.png"),
        ]:
            svg_markup = svgs[key].replace("<svg ", '<svg style="width:100%;height:100%;display:block;" ')
            page = browser.new_page(viewport={"width": 2400, "height": 900}, device_scale_factor=1)
            page.set_content(
                f'<!doctype html><html><body style="margin:0;width:2400px;height:900px;background:transparent;">{svg_markup}</body></html>',
                wait_until="load",
            )
            page.screenshot(path=str(LOGO_DIR / out_png), omit_background=True)
            page.close()
            print(f"Rendered {out_png}")

        # 4-swatch preview sheet for visual inspection
        esp_svg = svgs["crema-logo-espresso.svg"].replace("<svg ", '<svg style="width:420px;height:158px;" ')
        crm_svg = svgs["crema-logo-cream.svg"].replace("<svg ", '<svg style="width:420px;height:158px;" ')
        wht_svg = svgs["crema-logo-white.svg"].replace("<svg ", '<svg style="width:420px;height:158px;" ')
        preview_html = f"""<!doctype html><html><body style="margin:0;width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;font-family:monospace;">
          <div style="background:#EBE4D7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#24110C;">
            {esp_svg}<span>ON STEAMED MILK #EBE4D7 (ESPRESSO #24110C)</span>
          </div>
          <div style="background:#24110C;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#F4EFE6;">
            {crm_svg}<span>ON ROASTED ESPRESSO #24110C (CREAM #F4EFE6)</span>
          </div>
          <div style="background:#8C4E29;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#FFFFFF;">
            {wht_svg}<span>ON WARM TIMBER #8C4E29 (WHITE #FFFFFF)</span>
          </div>
          <div style="background:#DDA04B;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#24110C;">
            {esp_svg}<span>ON CARAMEL CREMA #DDA04B (ESPRESSO #24110C)</span>
          </div>
        </body></html>"""
        page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
        page.set_content(preview_html, wait_until="load")
        page.screenshot(path=str(LOGO_DIR / "crema-logo-preview.png"))
        page.close()
        browser.close()
        print("Rendered crema-logo-preview.png")


if __name__ == "__main__":
    ttf = download_fonts()
    d = extract_wordmark_svg_path(ttf)
    write_logos_and_preview(d)
