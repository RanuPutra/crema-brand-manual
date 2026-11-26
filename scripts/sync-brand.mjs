#!/usr/bin/env node
/**
 * Deterministic brand sync script for CREMA Brand Manual.
 * Reads brand.config.json and assets-src/logo/crema-logo-espresso.svg,
 * syncs all copy, inline/data-URI SVG wordmarks, colour tokens, gradients,
 * Resource download links, SEO/OG metadata, strips Framer watermark, injects
 * crema-living.{css,js}, generates crema-design-tokens.zip, and checks syntax.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(
  ROOT,
  "public",
  "assets",
  "framerusercontent.com",
  "sites",
  "3i78dHwmAXK7RabkwILJI7"
);

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "brand.config.json"), "utf8"));
const masterSvgRaw = fs
  .readFileSync(path.join(ROOT, "assets-src", "logo", "crema-logo-espresso.svg"), "utf8")
  .trim();

const pathMatch = masterSvgRaw.match(/<path\s+d="([^"]+)"/i);
if (!pathMatch) {
  throw new Error("Could not extract <path d='...'> from assets-src/logo/crema-logo-espresso.svg");
}
const CREMA_PATH_D = pathMatch[1];

const CREMA_SVG_MJS = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 160 60" overflow="visible"><path d="${CREMA_PATH_D}" fill="rgb(36,17,12)" fill-rule="nonzero"></path></svg>`;
const CREMA_SVG_HTML = `<svg xmlns=%22http://www.w3.org/2000/svg%22 xmlns:xlink=%22http://www.w3.org/1999/xlink%22 viewBox=%220 0 160 60%22 overflow=%22visible%22><path d=%22${CREMA_PATH_D}%22 fill=%22rgb(36,17,12)%22 fill-rule=%22nonzero%22></path></svg>`;
const EMPTY_SVG_MJS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>`;

// Build exact CRC32 table & minimal deflate ZIP writer (zero external dependencies)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const { name, content } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const rawBuf = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const compBuf = zlib.deflateRawSync(rawBuf);
    const crc = crc32(rawBuf);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compBuf.length, 18);
    local.writeUInt32LE(rawBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    locals.push(local, compBuf);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compBuf.length, 20);
    central.writeUInt32LE(rawBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);

    centrals.push(central);
    offset += local.length + compBuf.length;
  }

  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralBuf, eocd]);
}

function writeDesignTokensZip() {
  const swMap = Object.fromEntries(cfg.palette.map((p) => [p.id, p]));
  const grMap = Object.fromEntries(cfg.gradients.map((g) => [g.id, g]));

  const tokensCss = `/* CREMA Design Tokens — Brand System by Proiectum Studio */\n:root {\n  --crema-canvas: ${cfg.tokens.canvas};\n  --crema-ink: ${cfg.tokens.ink};\n  --crema-ink-muted: ${cfg.tokens.inkMuted};\n  --crema-accent-amber: ${cfg.tokens.accentHighlight};\n  --crema-accent-footnote: ${cfg.tokens.accentFootnote};\n\n  /* Brand Swatches */\n  --crema-color-warm-timber: ${swMap["warm-timber"].hex};\n  --crema-color-steamed-milk: ${swMap["steamed-milk"].hex};\n  --crema-color-caramel-crema: ${swMap["caramel-crema"].hex};\n  --crema-color-roasted-espresso: ${swMap["roasted-espresso"].hex};\n\n  /* Atmospheric Gradients */\n  --crema-gradient-amber-dusk: ${grMap["amber-dusk"].css};\n  --crema-gradient-cedar-smoke: ${grMap["cedar-smoke"].css};\n  --crema-gradient-cappuccino-pour: ${grMap["cappuccino-pour"].css};\n  --crema-gradient-velvet-ristretto: ${grMap["velvet-ristretto"].css};\n\n  /* Typography (Original Drip System) */\n  --crema-font-display: "Rubik", sans-serif;\n  --crema-font-body: "Geist", sans-serif;\n  --crema-font-mono: "Geist Mono", monospace;\n}\n`;

  const w3cJson = {
    $schema: "https://tr.designtokens.org/format/",
    brand: cfg.brand.name,
    studio: cfg.brand.studio.name,
    color: {
      canvas: { $value: cfg.tokens.canvas, $type: "color" },
      ink: { $value: cfg.tokens.ink, $type: "color" },
      inkMuted: { $value: cfg.tokens.inkMuted, $type: "color" },
      ...Object.fromEntries(
        cfg.palette.map((sw) => [
          sw.id,
          {
            $value: sw.hex,
            $type: "color",
            $description: `${sw.name} · RGB(${sw.rgb}) · CMYK(${sw.cmyk}) · Pantone ${sw.pantone}`,
          },
        ])
      ),
    },
    gradient: Object.fromEntries(
      cfg.gradients.map((g) => [
        g.id,
        {
          $value: g.css,
          $type: "gradient",
          $description: `${g.name}: RGB(${g.fromRgb}) -> RGB(${g.toRgb})`,
        },
      ])
    ),
    typography: {
      display: { $value: "Rubik", $type: "fontFamily" },
      body: { $value: "Geist", $type: "fontFamily" },
      mono: { $value: "Geist Mono", $type: "fontFamily" },
    },
  };

  const tailwindPreset = `// CREMA Tailwind CSS Preset — Brand System by Proiectum Studio\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        crema: {\n          canvas: "${cfg.tokens.canvas}",\n          ink: "${cfg.tokens.ink}",\n          muted: "${cfg.tokens.inkMuted}",\n          timber: "${swMap["warm-timber"].hex}",\n          milk: "${swMap["steamed-milk"].hex}",\n          amber: "${swMap["caramel-crema"].hex}",\n          espresso: "${swMap["roasted-espresso"].hex}",\n        },\n      },\n      fontFamily: {\n        display: ["Rubik", "sans-serif"],\n        sans: ["Geist", "sans-serif"],\n        mono: ["Geist Mono", "monospace"],\n      },\n    },\n  },\n};\n`;

  const readme = `CREMA — Design Tokens Pack\nBrand System by Proiectum Studio (${cfg.brand.studio.url})\n\nIncluded:\n- tokens.css          CSS custom properties for colours, gradients, and fonts\n- tokens.json         W3C Design Tokens format\n- tailwind.preset.js  Drop-in Tailwind CSS theme preset\n`;

  const zipBuf = buildZip([
    { name: "README.txt", content: readme },
    { name: "tokens.css", content: tokensCss },
    { name: "tokens.json", content: JSON.stringify(w3cJson, null, 2) },
    { name: "tailwind.preset.js", content: tailwindPreset },
  ]);

  const outZip = path.join(ROOT, "public", "downloads", "crema-design-tokens.zip");
  fs.mkdirSync(path.dirname(outZip), { recursive: true });
  fs.writeFileSync(outZip, zipBuf);
  console.log(`Wrote ${outZip} (${zipBuf.length} bytes)`);
}

// Ordered exact string replacements across HTML & MJS modules
const TEXT_REPLACEMENTS = [
  // Fix known legacy typos first
  ["photogrpahic expression of oru brand", "photographic expression of our brand"],
  ["photogrpahic", "photographic"],
  ["oru brand", "our brand"],

  // Metadata & titles
  ["Editorial reference system for the DRIP brand: tokens, grid, type, and usage foundations.", cfg.meta.description],
  ["A missing page in the DRIP café brand manual.", cfg.meta.notFoundDescription],
  ["404 — DRIP Brand Manual", cfg.meta.notFoundTitle],
  ["DRIP Brand Manual", cfg.meta.title],
  ["DRIP Manual Shell", "CREMA Manual Shell"],
  ["DRIPManualShell", "CREMAManualShell"],
  ["past-number-134025.framer.app", "crema.proiectum.studio"],

  // Footer & email & 404
  ["brand@drip.example", cfg.brand.email],
  ["© 2026 DRIP. All rights reserved.", cfg.brand.copyright],
  ["This page went cold.", "This shot went cold."],

  // Cover (Section 1)
  ["We're Drip.", "We're Crema."],
  ["We\\u0027re Drip.", "We\\u0027re Crema."],
  [
    "This manual defines the visible language for Drip: a neighbourhood café built around slow mornings, precise coffee, and easy daily rituals.",
    "This manual defines the visible language for Crema: a neighbourhood espresso bar built around slow evenings, bold roasts, and unhurried daily rituals.",
  ],
  [
    "Takeaway cup sleeve: the Drip logo sits large while the colour field wraps cleanly around the object.",
    "Takeaway cup sleeve: the Crema logo sits bold while warm ink and uncoated paper stock carry the craft.",
  ],
  ["June 2026", cfg.brand.lastUpdated],

  // Contents (Section 2)
  [
    "Use this index to move through the assets, rules, and production notes that keep Drip consistent across café, print, packaging, and digital touchpoints.",
    "Use this index to move through the assets, rules, and production notes that keep Crema consistent across café, print, packaging, and digital touchpoints.",
  ],

  // Who we are (Section 3)
  [
    "Drip is a café for coffee, smoothies, and small moments of pause. The brand should feel warm, direct, handmade, and quietly confident.",
    "Crema is an espresso bar for bold coffee, velvety cappuccinos, and slow moments of pause. The brand feels warm, grounded, tactile, and quietly confident.",
  ],
  [
    "Drip serves clear coffee, bright smoothies, and simple food in a space that feels ",
    "Crema serves bold espresso, velvety cappuccinos, and slow-baked pastries in a space that feels ",
  ],
  // Fallback for plain-text searchIndex copy
  [
    "Drip serves clear coffee, bright smoothies, and simple food in a space that feels local¹, sunny², and easy³ to return to.",
    "Crema serves bold espresso, velvety cappuccinos, and slow-baked pastries in a space that feels warm¹, grounded², and easy³ to return to.",
  ],
  ["feels local", "feels warm"],
  [", sunny", ", grounded"],
  ["1 Local: made for repeat visits, regular names, and everyday rituals.", "1 Warm: timber, amber light, and hospitality built for unhurried evenings."],
  ["2 Sunny: colour and copy should bring light without becoming childish.", "2 Grounded: honest roasts, tactile paper, and colour drawn straight from the bar."],
  ["3 Easy: every sign, label, and cup should be easy to read and easy to reproduce.", "3 Easy: every sign, label, and cup stays readable and effortless to reproduce."],

  // Logo (Section 4)
  [
    "The Drip logo is the primary signature. It should feel loose and human, but it must be applied with disciplined spacing, contrast, and scale.",
    "The Crema logo is the primary signature. It should feel organic and hand-brushed, while applied with disciplined spacing, contrast, and scale.",
  ],
  [
    "Primary Drip logo artwork on a soft café-gradient field for window posters, social headers, and seasonal launches.",
    "Primary Crema logo artwork on a steamed-milk paper field for window posters, social headers, and seasonal pours.",
  ],
  [
    "Use the full Drip logo on shopfronts, menus, packaging, and first-contact materials.",
    "Use the full Crema logo on shopfronts, menus, packaging, and first-contact materials.",
  ],
  [
    "Keep the logo white on dark or gradient artwork, and dark maroon or black on pale café materials.",
    "Keep the logo white on dark or gradient artwork, and roasted espresso or ink black on pale café materials.",
  ],
  [
    "Do not redraw the script, add shadows, stretch the letters, or place it inside a new badge.",
    "Do not redraw the script, add drop shadows, stretch the letterforms, or trap it inside a badge.",
  ],

  // Colour (Section 5)
  [
    "The palette carries the café’s atmosphere: milk foam neutrals, powder blue daylight, apricot warmth, and deep espresso-maroon contrast.",
    "The palette carries the café’s twilight warmth: steamed milk neutrals, porcelain daylight, caramel amber glow, and deep roasted-espresso contrast.",
  ],
  [
    "The core palette is drawn from café materials: morning light, milk foam, apricot pastry warmth, and espresso depth. Use exact values for print and digital production.",
    "The core palette is drawn from café materials: porcelain daylight, steamed milk foam, warm amber lamp glow, and dark espresso depth. Use exact values for print and digital production.",
  ],
  ["Porcelain Blue", "Morning Porcelain"],
  ["HEX #9EC3D8", "HEX #96B8CC"],
  ["RGB 158 195 216", "RGB 150 184 204"],
  ["CMYK 27 10 0 15", "CMYK 27 10 0 20"],
  ["HSL 202 43% 73%", "HSL 202 35% 69%"],

  ["Milk Foam", "Steamed Milk"],
  ["HEX #E8E6DC", "HEX #E8E4D8"],
  ["RGB 232 230 220", "RGB 232 228 216"],
  ["CMYK 0 1 5 9", "CMYK 0 2 7 9"],
  ["HSL 50 21% 89%", "HSL 45 24% 88%"],

  ["Strawberry", "Caramel Amber"],
  ["HEX #F3CD86", "HEX #E4A853"],
  ["RGB 243 205 134", "RGB 228 168 83"],
  ["CMYK 0 16 45 5", "CMYK 0 26 64 11"],
  ["HSL 39 82% 74%", "HSL 35 73% 61%"],
  ["Pantone 7403 C", "Pantone 7408 C"],

  // Coffee swatch (avoid changing random English word "coffee" in sentences; match Coffee inside JSX/HTML swatch blocks)
  ["HEX #3D0202", "HEX #2B0D0A"],
  ["RGB 61 2 2", "RGB 43 13 10"],
  ["CMYK 0 97 97 76", "CMYK 0 70 77 83"],
  ["HSL 0 94% 12%", "HSL 5 62% 10%"],
  ["children:`Coffee`", "children:`Roasted Espresso`"],
  [">Coffee<", ">Roasted Espresso<"],
  ["CoffeeHEX #2B0D0A", "Roasted EspressoHEX #2B0D0A"],

  // 5.2 Gradients
  ["Sunrise Wash", "Amber Dusk"],
  ["RGB 232 147 15", "RGB 217 119 25"],
  ["RGB 232 165 146", "RGB 232 165 134"],
  ["Espresso Tonic", "Espresso Mist"],
  ["RGB 50 16 14", "RGB 43 13 10"],
  ["RGB 168 205 227", "RGB 158 194 214"],
  ["Matcha Cream", "Cappuccino Pour"],
  ["RGB 250 241 225", "RGB 245 235 220"],
  ["RGB 98 153 80", "RGB 138 86 48"],
  ["Rose Tonic", "Velvet Roast"],
  ["RGB 55 24 23", "RGB 51 19 17"],
  ["RGB 255 173 173", "RGB 228 152 132"],

  // 5.3 & 5.4
  [
    "Gradients are campaign atmospheres for posters, social stories, menu specials, and seasonal drinks. Keep the logo white and allow generous negative space.",
    "Gradients are campaign atmospheres for posters, social stories, menu specials, and seasonal pours. Keep the logo white and allow generous negative space.",
  ],
  [
    "Window poster: the white Drip logo floats over a dark espresso gradient for strong street visibility.",
    "Window poster: the white Crema logo floats over an amber dusk gradient for warm evening street visibility.",
  ],
  [
    "Takeaway packaging: maroon base, white logo, and one soft accent colour for drink or pastry variants.",
    "Campaign poster: deep roasted espresso fades into cool porcelain light with one crisp drink headline.",
  ],
  [
    "Use warm neutrals as the largest field, brown for contrast and appetite, blue for freshness, and apricot as a soft promotional accent.",
    "Use warm neutrals as the largest field, roasted espresso for contrast and appetite, porcelain blue for clarity, and caramel amber as a warm evening accent.",
  ],

  // Typography (Section 6)
  [
    "Typography balances café friendliness with a clean manual system. Display type creates appetite; mono notes keep production information exact.",
    "Typography balances espresso-bar warmth with a disciplined manual system. Display type brings presence; mono notes keep production information exact.",
  ],
  [
    "Typography should make menus easy to scan, prices easy to compare, and the Drip voice recognisable at counter distance.",
    "Typography should make menus easy to scan, prices easy to compare, and the Crema voice recognisable at counter distance.",
  ],
  [
    "Body copy should sound like a good café host: clear, friendly, specific, and never over-written.",
    "Body copy should sound like a seasoned barista host: warm, clear, specific, and never over-written.",
  ],

  // Photography (Section 7)
  [
    "Close-up texture is our key expression. We shoot drinks near enough to read their surface — crema, foam, ice, the layers where one ingredient meets another — so the photograph does the selling before the logo arrives.",
    "Close-up texture is our key expression. We shoot drinks near enough to read their surface — crema, microfoam, ice, the layers where espresso meets milk — so the photograph sells the craft before the logo arrives.",
  ],
  [
    "Cold brew shot shows layers of coffee and ice.",
    "Iced cold brew shot shows translucent amber layers and crystal ice.",
  ],
  [
    "The drink’s own colour layers do the work",
    "The drink’s own roast layers do the work",
  ],
  [
    "Texture frame — crema and bubble detail are the signature photographic expression of our brand.",
    "Texture frame — golden crema and micro-bubble detail are the signature photographic expression of our brand.",
  ],

  // Brand in Use (Section 8)
  [
    "Applications should look practical and lived-in: menus, takeaway cups, window vinyl, posters, product cards, tote bags, and social announcements.",
    "Applications should look practical and lived-in: menus, takeaway cups, window vinyl, posters, embroidered caps, and evening announcements.",
  ],
  [
    "Embroidered cap — logo at its most reduced, still unmistakably Drip.",
    "Embroidered cap — logo at its most reduced, still unmistakably Crema.",
  ],
  [
    "Exterior poster: the mark stays readable from across the street and calm at close range.",
    "Evening poster: warm timber light and restrained white type invite regulars in after dusk.",
  ],
  [
    "Logo lockup on blue.",
    "Logo lockup on porcelain blue.",
  ],
  [
    "Takeaway cup: logo sits on uncoated stock so the mark reads warm and everyday, not premium.",
    "Takeaway cup: logo sits on uncoated stock so the mark reads warm and everyday, never stiff.",
  ],
  [
    "Window vinyl: logo, hours, and category words applied with restrained contrast so the glass stays calm.",
    "Window vinyl: logo, hours, and menu pillars applied with restrained contrast over warm timber light.",
  ],

  // Resources (Section 9)
  [
    "Final asset packages for café teams, printers, and digital partners.",
    "Production asset packages and living design tokens for café teams, printers, and Proiectum Studio builds.",
  ],
  ["Menu and poster templates", "Design tokens pack"],
  ["drip-logo-master — ZIP / SVG / PNG", "crema-logo-kit.zip — SVG / PNG / Outline"],

  // Alt attributes & standalone swatch labels (catch remaining Drip/Coffee strings)
  ["`Coffee`", "`Roasted Espresso`"],
  [">Coffee<br", ">Roasted Espresso<br"],
  ["Cover artwork for the Drip café brand manual.", "CREMA — Tactile espresso parlour cover with checkered roast box, fluted iced cortado, and brushed brass tray."],
  ["Cover artwork for the Crema espresso bar brand manual.", "CREMA — Tactile espresso parlour cover with checkered roast box, fluted iced cortado, and brushed brass tray."],
  ["Wide Drip café photography crop showing realistic brand use.", "Macro copper-foil embossed cotton label on dark espresso roast tin and amber apothecary cold-brew bottle."],
  ["Close-up Crema takeaway cup showing uncoated paper print and golden crema.", "Macro copper-foil embossed cotton label on dark espresso roast tin and amber apothecary cold-brew bottle."],
  ["Drip logo applied to a branded café asset.", "Crema identity moodboard uniting A-frame cedar interior, foil roast tin, parlour cotton menu, handheld cup, and timber canvas awning."],
  ["Crema identity moodboard showing storefront, cap embroidery, macro drinks, and palette.", "Crema identity moodboard uniting A-frame cedar interior, foil roast tin, parlour cotton menu, handheld cup, and timber canvas awning."],
  ["Drip logo displayed on a soft café gradient artwork.", "Primary Crema wordmark on uncoated steamed-milk cotton paper."],
  ["Primary Crema wordmark on a warm steamed-milk paper field.", "Primary Crema wordmark on uncoated steamed-milk cotton paper."],
  ["Primary Crema Fraunces wordmark on uncoated steamed-milk cotton paper.", "Primary Crema wordmark on uncoated steamed-milk cotton paper."],
  ["Primary Drip logo artwork on café brand imagery.", "Alternative Crema wordmark lockup on roasted espresso bookcloth with burnished copper rule."],
  ["Alternative Crema wordmark lockup on roasted espresso surface.", "Alternative Crema wordmark lockup on roasted espresso bookcloth with burnished copper rule."],
  ["Orange smoothie gradient poster artwork for Drip café.", "Amber Dusk offset poster printed on warm cream stock in afternoon gallery sunlight."],
  ["Orange smoothie gradient poster artwork for Crema espresso bar.", "Amber Dusk offset poster printed on warm cream stock in afternoon gallery sunlight."],
  ["Sunrise gradient artwork used for Drip café campaign applications.", "Amber Dusk gradient poster artwork for Crema evening specials."],
  ["Espresso tonic gradient artwork used for Drip café campaign applications.", "Cedar Smoke gradient poster artwork featuring Caramel Cortado."],
  ["Wide crop of a Crema espresso bar application image used in the brand manual.", "CREMA parlour service: checkered roast gable box, fluted iced cortado, and brushed antique brass tray."],
  ["Crema espresso bar visual asset showing a branded application example.", "Tactile 320gsm cotton evening menu with cedar leather spine, brass corner, espresso demitasse, and debossed pulp coaster."],
  ["Panoramic Crema espresso bar brand application image.", "Tactile Crema roast & pastry box stack with checkered cedar stock and embossed cotton label."],
  ["Drip café", "Crema espresso bar"],
  // v2 Palette, Gradient, Typography & Collateral Updates (idempotent v1->v2 & direct)
  ["organic and hand-brushed", "sculpted soft-serif curves"],
  ["porcelain daylight, caramel amber glow", "warm cedar timber, caramel crema glow"],
  ["porcelain daylight, steamed milk foam, warm amber lamp glow", "warm cedar timber rafters, steamed milk foam, golden caramel crema"],
  ["Morning Porcelain", "Warm Timber"],
  ["Porcelain Blue", "Warm Timber"],
  ["HEX #9EC3D8", "HEX #8C4E29"],
  ["HEX #96B8CC", "HEX #8C4E29"],
  ["RGB 158 195 216", "RGB 140 78 41"],
  ["RGB 150 184 204", "RGB 140 78 41"],
  ["CMYK 27 10 0 15", "CMYK 26 67 84 27"],
  ["CMYK 27 10 0 20", "CMYK 26 67 84 27"],
  ["HSL 202 43% 73%", "HSL 22 55% 35%"],
  ["HSL 202 35% 69%", "HSL 22 55% 35%"],
  ["Pantone 545 C", "Pantone 7575 C"],
  ["HEX #E8E4D8", "HEX #EBE4D7"],
  ["RGB 232 228 216", "RGB 235 228 215"],
  ["CMYK 0 2 7 9", "CMYK 6 7 13 0"],
  ["HSL 45 24% 88%", "HSL 39 32% 88%"],
  ["Caramel Amber", "Caramel Crema"],
  ["HEX #E4A853", "HEX #DDA04B"],
  ["RGB 228 168 83", "RGB 221 160 75"],
  ["CMYK 0 26 64 11", "CMYK 12 39 78 1"],
  ["HSL 35 73% 61%", "HSL 35 68% 58%"],
  ["HEX #2B0D0A", "HEX #24110C"],
  ["RGB 43 13 10", "RGB 36 17 12"],
  ["CMYK 0 70 77 83", "CMYK 50 74 78 82"],
  ["HSL 5 62% 10%", "HSL 12 50% 9%"],
  ["RGB 217 119 25", "RGB 200 106 30"],
  ["RGB 232 165 134", "RGB 228 168 118"],
  ["Espresso Mist", "Cedar Smoke"],
  ["RGB 158 194 214", "RGB 140 78 41"],
  ["RGB 245 235 220", "RGB 239 231 218"],
  ["RGB 138 86 48", "RGB 139 83 43"],
  ["Velvet Roast", "Velvet Ristretto"],
  ["RGB 51 19 17", "RGB 46 18 13"],
  ["RGB 228 152 132", "RGB 201 122 91"],
  ["cool porcelain light", "warm cedar timber"],
  ["porcelain blue for clarity, and caramel amber", "warm timber for architectural depth, and caramel crema"],
  ["Espresso Mist gradient poster artwork featuring Caramel Cortado.", "Cedar Smoke gradient poster artwork featuring Caramel Cortado."],
  ["PRIMARY TYPE / FRAUNCES", "PRIMARY TYPE / RUBIK"],
  ["SECONDARY / IBM PLEX MONO", "SECONDARY / GEIST MONO"],
  [">Fraunces<", ">Rubik<"],
  ["`Fraunces`", "`Rubik`"],
  [">IBM Plex Mono<", ">Geist Mono<"],
  ["`IBM Plex Mono`", "`Geist Mono`"],
  ['"--framer-font-family":`"Fraunces", Georgia, serif`', '"--framer-font-family":`"Rubik", "Rubik Placeholder", sans-serif`'],
  ['"--framer-font-family":`"IBM Plex Mono", monospace`', '"--framer-font-family":`"Geist Mono", monospace`'],
  ['"--framer-font-family":`"Plus Jakarta Sans", sans-serif`', '"--framer-font-family":`"Geist", "Geist Placeholder", sans-serif`'],
  ['--framer-font-family:&quot;Fraunces&quot;, Georgia, serif', '--framer-font-family:&quot;Rubik&quot;, &quot;Rubik Placeholder&quot;, sans-serif'],
  ['--framer-font-family:&quot;IBM Plex Mono&quot;, monospace', '--framer-font-family:&quot;Geist Mono&quot;, monospace'],
  ['--framer-font-family:&quot;Plus Jakarta Sans&quot;, sans-serif', '--framer-font-family:&quot;Geist&quot;, &quot;Geist Placeholder&quot;, sans-serif'],
  ['--framer-font-family:"Fraunces", Georgia, serif', '--framer-font-family:"Rubik", "Rubik Placeholder", sans-serif'],
  ['--framer-font-family:"IBM Plex Mono", monospace', '--framer-font-family:"Geist Mono", monospace'],
  ['--framer-font-family:"Plus Jakarta Sans", sans-serif', '--framer-font-family:"Geist", "Geist Placeholder", sans-serif'],
  ["Embroidered cap — logo at its most reduced, still unmistakably Crema.", "Tactile cotton menu — 320gsm sheet with brass corner clip, ceramic demitasse, kouign-amann, and debossed pulp coaster."],
  ["Tasting menu & coaster set — uncoated cotton stock, Fraunces display headings, and exact mono pricing.", "Tactile cotton menu — 320gsm sheet with brass corner clip, ceramic demitasse, kouign-amann, and debossed pulp coaster."],
  ["Applications should look practical and lived-in: menus, takeaway cups, window vinyl, posters, embroidered caps, and evening announcements.", "Applications should feel physical and tactile: cotton menus, checkered roast boxes, handheld cups, canvas awnings, posters, and dusk interiors."],
  ["Takeaway cup sleeve: the Crema logo sits bold while warm ink and uncoated paper stock carry the craft.", "Reserve roast tin: hot-stamped copper foil sits lightly on fibrous cream cotton stock over warm travertine."],
  ["Window vinyl — name, hours, address applied with restrained contrast.", "Parlour service — checkered roast gable box, fluted glass, and brass tray in dusk light."],
  ["Logo lockup on porcelain blue.", "Roast & pastry boxes — Warm Timber checkerboard stock and debossed cotton labels."],
  ["Logo lockup on warm cedar timber.", "Roast & pastry boxes — Warm Timber checkerboard stock and debossed cotton labels."],
  ["Takeaway cup: logo sits on uncoated stock so the mark reads warm and everyday, never stiff.", "Handheld takeaway cup: sculpted crema wordmark wraps warm Steamed Milk stock against sunlit ceramic tiles."],
  ["Handheld takeaway cup: sculpted Fraunces wordmark wraps warm Steamed Milk stock against sunlit ceramic tiles.", "Handheld takeaway cup: sculpted crema wordmark wraps warm Steamed Milk stock against sunlit ceramic tiles."],
  ["Window vinyl: logo, hours, and menu pillars applied with restrained contrast over warm timber light.", "Storefront signage: woven Warm Timber canvas awning and hanging blade banner over fluted dusk glass."],
  ["Brand in use — cap, cup, window, poster", "Brand in use — parlour, cup, boxes, awning"],
  ["Brand in use — collateral, cup, doors, poster", "Brand in use — parlour, cup, boxes, awning"],
  ["Drip", "Crema"],
  ["DRIP", "CREMA"],
];

const COLOR_REPLACEMENTS = [
  // Accent tokens & dark mode background lock
  ["--token-6b2a6b11-cfdb-4067-9c85-d868e49e3ce9:#f2f2f2", "--token-6b2a6b11-cfdb-4067-9c85-d868e49e3ce9:#f4efe6"],
  ["--token-6b2a6b11-cfdb-4067-9c85-d868e49e3ce9:#f4f1e8", "--token-6b2a6b11-cfdb-4067-9c85-d868e49e3ce9:#f4efe6"],
  ["--token-83a55112-4eb6-4e3f-a708-4b3aecb74ccd:#11110f", "--token-83a55112-4eb6-4e3f-a708-4b3aecb74ccd:#1b120e"],
  ["--token-80abdd37-0e11-49b1-b4d0-47ad9b6259de:#4a4740", "--token-80abdd37-0e11-49b1-b4d0-47ad9b6259de:#594a42"],
  ["--token-b18d81e5-0208-4604-937d-c74381294431:#d7ff2f", `--token-b18d81e5-0208-4604-937d-c74381294431:${cfg.tokens.accentHighlight}`],
  ["--token-b18d81e5-0208-4604-937d-c74381294431:#cae0e3", `--token-b18d81e5-0208-4604-937d-c74381294431:${cfg.tokens.accentHighlight}`],
  ["--token-b18d81e5-0208-4604-937d-c74381294431:#e4a853", `--token-b18d81e5-0208-4604-937d-c74381294431:${cfg.tokens.accentHighlight}`],
  ["--token-0cf0999d-50c4-4680-af21-71e43a706c94:#eeff9a", `--token-0cf0999d-50c4-4680-af21-71e43a706c94:${cfg.tokens.accentHighlightSoft}`],
  ["--token-0cf0999d-50c4-4680-af21-71e43a706c94:#e1faf9", `--token-0cf0999d-50c4-4680-af21-71e43a706c94:${cfg.tokens.accentHighlightSoft}`],
  ["--token-0cf0999d-50c4-4680-af21-71e43a706c94:#f6dfb8", `--token-0cf0999d-50c4-4680-af21-71e43a706c94:${cfg.tokens.accentHighlightSoft}`],
  ["--token-76898514-ef07-4021-8d24-5e7ad9e42826:#9bcb00", `--token-76898514-ef07-4021-8d24-5e7ad9e42826:${cfg.tokens.accentFootnote}`],
  ["--token-76898514-ef07-4021-8d24-5e7ad9e42826:#7da5a8", `--token-76898514-ef07-4021-8d24-5e7ad9e42826:${cfg.tokens.accentFootnote}`],
  ["--token-76898514-ef07-4021-8d24-5e7ad9e42826:#c9731a", `--token-76898514-ef07-4021-8d24-5e7ad9e42826:${cfg.tokens.accentFootnote}`],
  ["rgb(155, 203, 0)", "rgb(184, 98, 32)"],
  ["rgb(201, 115, 26)", "rgb(184, 98, 32)"],

  // 4 Gradient CSS definitions FIRST (before single-hex replacements rewrite start stops)
  ["linear-gradient(180deg, #D97719 0%, rgb(232, 165, 134) 100%)", "linear-gradient(180deg, #C86A1E 0%, rgb(228, 168, 118) 100%)"],
  ["linear-gradient(180deg, #e8930f 0%, rgb(232, 165, 146) 100%)", "linear-gradient(180deg, #C86A1E 0%, rgb(228, 168, 118) 100%)"],
  ["linear-gradient(180deg, #2B0D0A 0%, rgb(158, 194, 214) 100%)", "linear-gradient(180deg, #24110C 0%, rgb(140, 78, 41) 100%)"],
  ["linear-gradient(180deg, #24110C 0%, rgb(158, 194, 214) 100%)", "linear-gradient(180deg, #24110C 0%, rgb(140, 78, 41) 100%)"],
  ["linear-gradient(180deg, #32100e 0%, rgb(168, 205, 227) 100%)", "linear-gradient(180deg, #24110C 0%, rgb(140, 78, 41) 100%)"],
  ["linear-gradient(180deg, #F5EBDC 0%, rgb(138, 86, 48) 100%)", "linear-gradient(180deg, #EFE7DA 0%, rgb(139, 83, 43) 100%)"],
  ["linear-gradient(180deg, #faf1e1 0%, rgb(98, 153, 80) 100%)", "linear-gradient(180deg, #EFE7DA 0%, rgb(139, 83, 43) 100%)"],
  ["linear-gradient(180deg, #331311 0%, rgb(228, 152, 132) 100%)", "linear-gradient(180deg, #2E120D 0%, rgb(201, 122, 91) 100%)"],
  ["linear-gradient(180deg, #371817 0%, rgb(255, 173, 173) 100%)", "linear-gradient(180deg, #2E120D 0%, rgb(201, 122, 91) 100%)"],

  ["linear-gradient(#D97719 0%,#E8A586 100%)", "linear-gradient(#C86A1E 0%,#E4A876 100%)"],
  ["linear-gradient(#e8930f 0%,#e8a592 100%)", "linear-gradient(#C86A1E 0%,#E4A876 100%)"],
  ["linear-gradient(#2B0D0A 0%,#9EC2D6 100%)", "linear-gradient(#24110C 0%,#8C4E29 100%)"],
  ["linear-gradient(#24110C 0%,#9EC2D6 100%)", "linear-gradient(#24110C 0%,#8C4E29 100%)"],
  ["linear-gradient(#32100e 0%,#a8cde3 100%)", "linear-gradient(#24110C 0%,#8C4E29 100%)"],
  ["linear-gradient(#F5EBDC 0%,#8A5630 100%)", "linear-gradient(#EFE7DA 0%,#8B532B 100%)"],
  ["linear-gradient(#faf1e1 0%,#629950 100%)", "linear-gradient(#EFE7DA 0%,#8B532B 100%)"],
  ["linear-gradient(#331311 0%,#E49884 100%)", "linear-gradient(#2E120D 0%,#C97A5B 100%)"],
  ["linear-gradient(#371817 0%,#ffadad 100%)", "linear-gradient(#2E120D 0%,#C97A5B 100%)"],

  // Core palette hex replacements (v1->v2 & Drip->v2)
  ["#f4f1e8", "#f4efe6"],
  ["#F4F1E8", "#F4EFE6"],
  ["#96b8cc", "#8c4e29"],
  ["#96B8CC", "#8C4E29"],
  ["#9ec3d8", "#8c4e29"],
  ["#9EC3D8", "#8C4E29"],
  ["#9fc3d8", "#8c4e29"],
  ["#9ec2d6", "#8c4e29"],
  ["#9EC2D6", "#8C4E29"],
  ["#e8e4d8", "#ebe4d7"],
  ["#E8E4D8", "#EBE4D7"],
  ["#e8e6dc", "#ebe4d7"],
  ["#E8E6DC", "#EBE4D7"],
  ["#e4a853", "#dda04b"],
  ["#E4A853", "#DDA04B"],
  ["#fcbdbd", "#dda04b"],
  ["#FCBDBD", "#DDA04B"],
  ["#f3cd86", "#dda04b"],
  ["#F3CD86", "#DDA04B"],
  ["#2b0d0a", "#24110c"],
  ["#2B0D0A", "#24110C"],
  ["#260202", "#24110c"],
  ["#3d0202", "#24110c"],
  ["#3D0202", "#24110C"],
  ["rgb(43,13,10)", "rgb(36,17,12)"],
  ["rgb(43, 13, 10)", "rgb(36, 17, 12)"],
  ["rgb(38,2,2)", "rgb(36,17,12)"],
  ["rgb(38, 2, 2)", "rgb(36, 17, 12)"],
  ["rgb(158, 194, 214)", "rgb(140, 78, 41)"],
  ["rgb(158,194,214)", "rgb(140,78,41)"],

  ["Sunrise Wash", "Amber Dusk"],
  ["Matcha Cream", "Cappuccino Pour"],
  ["Cherry Shadow", "Velvet Ristretto"],
  ["Velvet Roast", "Velvet Ristretto"],
];

// Load exact Framer CDN -> local asset mapping from public/f2c-sw.js so runtime
// JS modules load from /assets/... immediately on cold load without waiting for SW claim.
const FRAMER_URL_REPLACEMENTS = (() => {
  const swSrc = fs.readFileSync(path.join(ROOT, "public", "f2c-sw.js"), "utf8");
  const mMatch = swSrc.match(/const M=(\{[\s\S]*?\});/);
  if (!mMatch) {
    throw new Error("Could not extract const M={...} from public/f2c-sw.js");
  }
  const mapObj = JSON.parse(mMatch[1]);
  const pairs = [];
  const baseImageFallback = new Map();

  for (const [k, v] of Object.entries(mapObj)) {
    pairs.push([`https://framerusercontent.com${k}`, `/${v}`]);
    const baseImg = k.match(/^(\/images\/[^?]+)(?:\?(.*))?$/);
    if (baseImg) {
      const bareKey = `https://framerusercontent.com${baseImg[1]}`;
      const query = baseImg[2] || "";
      // Prefer unscaled full image (no scale-down-to) as fallback
      if (!query.includes("scale-down-to=") || !baseImageFallback.has(bareKey)) {
        baseImageFallback.set(bareKey, `/${v}`);
      }
    }
  }
  // Longest keys first so queried image URLs match before bare image fallback
  pairs.sort((a, b) => b[0].length - a[0].length);
  for (const [bareKey, target] of baseImageFallback.entries()) {
    pairs.push([bareKey, target]);
  }
  return pairs;
})();

const ASSET_VER = "5";

function copyVendorAssets() {
  const srcLenis = path.join(ROOT, "node_modules", "lenis", "dist", "lenis.min.js");
  if (!fs.existsSync(srcLenis)) {
    throw new Error(`Missing Lenis vendor bundle at ${srcLenis}. Run npm install lenis first.`);
  }
  const destLenis = path.join(ROOT, "public", "assets", "vendor", "lenis.min.js");
  fs.mkdirSync(path.dirname(destLenis), { recursive: true });
  fs.copyFileSync(srcLenis, destLenis);
  console.log(`Copied ${destLenis} (${fs.statSync(destLenis).size} bytes)`);
}

function bumpAssetUrls(text) {
  return text.replace(
    /assets\/framerusercontent\.com\/images\/([A-Za-z0-9._-]+\.(?:jpg|png))(?:\?v=\d+)?/g,
    `assets/framerusercontent.com/images/$1?v=${ASSET_VER}`
  );
}

function localizeFramerUrls(text) {
  return bumpAssetUrls(applyReplacements(text, FRAMER_URL_REPLACEMENTS));
}

function applyReplacements(text, list) {
  let out = text;
  for (const [from, to] of list) {
    if (from && out.includes(from)) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

function replaceMjsSvgs(text) {
  let out = text;
  // Replace main logo SVGs (handles both original Drip and earlier CREMA 160x60 viewBoxes)
  out = out.replace(
    /<svg[^>]*viewBox="0 0 (?:160 60|159\.512 60\.01|159\.5 60|247 93\.016|98 37\.006)"[^>]*>[\s\S]*?<\/svg>/g,
    CREMA_SVG_MJS
  );
  // Replace legacy companion cutout/dot sub-SVGs with empty 1x1 SVG so no phantom DRIP shapes remain
  out = out.replace(
    /<svg[^>]*viewBox="0 0 (?:13\.574 10\.721|7\.339 3\.426|7\.829 4\.913|21\.019 16\.618|11\.364 5\.311|12\.123 7\.615|8\.34 6\.612|4\.509 2\.113|4\.81 3\.03)"[^>]*>[\s\S]*?<\/svg>/g,
    EMPTY_SVG_MJS
  );
  return out;
}

function replaceHtmlSvgs(html) {
  let out = html;
  out = out.replace(
    /<svg[^>]*viewBox=%220 0 (?:160 60|159\.512 60\.01|159\.5 60|247 93\.016|98 37\.006)%22[^>]*>[\s\S]*?<\/svg>/g,
    CREMA_SVG_HTML
  );
  out = out.replace(
    /<svg[^>]*viewBox=%220 0 (?:13\.574 10\.721|7\.339 3\.426|7\.829 4\.913|21\.019 16\.618|11\.364 5\.311|12\.123 7\.615|8\.34 6\.612|4\.509 2\.113|4\.81 3\.03)%22[^>]*>[\s\S]*?<\/svg>/g,
    `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22></svg>`
  );
  return out;
}

function patchHomeBundle() {
  const filePath = path.join(SITE_DIR, "Uqb7-KDgUqX1PZftTSBf0mgko2BF5ArEp5b_3vYskqk.D-BUtF34.mjs");
  let txt = fs.readFileSync(filePath, "utf8");
  txt = localizeFramerUrls(txt);
  txt = replaceMjsSvgs(txt);
  txt = applyReplacements(txt, COLOR_REPLACEMENTS);
  txt = applyReplacements(txt, TEXT_REPLACEMENTS);

  // Wire DownloadAssetBlock dynamic file subtitle & download attribute cleanly
  txt = txt.replace(
    'children:`drip-logo-master — ZIP / SVG / PNG`})}),className:`framer-l2zl8g`',
    'children:v===`Design tokens pack`?`crema-design-tokens.zip — CSS / JSON / Tailwind`:v===`Print production colour sheet`?`crema-colour-production-sheet.pdf — A4 Print Spec`:`crema-logo-kit.zip — SVG / PNG / Outline`})}),className:`framer-l2zl8g`'
  );
  // Idempotent guard if run twice
  txt = txt.replace("drip-logo-master — ZIP / SVG / PNG", "crema-logo-kit.zip — SVG / PNG / Outline");

  // Add download attribute & fallback href resolution on Download Button anchor inside Ze
  txt = txt.replace(
    's(k,{href:b,motionChild:!0,nodeId:`H2QG4pnMB`,scopeId:`PSwAMQ71P`,children:/*#__PURE__*/ s(d.a,{className:`framer-p5f75y framer-19kjqqu`,"data-framer-name":`Download Button`',
    's(k,{href:b||(v===`Design tokens pack`?`/downloads/crema-design-tokens.zip`:v===`Print production colour sheet`?`/downloads/crema-colour-production-sheet.pdf`:`/downloads/crema-logo-kit.zip`),motionChild:!0,nodeId:`H2QG4pnMB`,openInNewTab:!1,scopeId:`PSwAMQ71P`,children:/*#__PURE__*/ s(d.a,{className:`framer-p5f75y framer-19kjqqu`,"data-framer-name":`Download Button`,download:!0'
  );

  // Wire explicit c9tZMSLhI on the 3 Resource card instances (idempotent)
  if (!txt.includes("c9tZMSLhI:`/downloads/crema-logo-kit.zip`")) {
    txt = txt.replace(
      'z8CjbpeZB:`Download ZIP`,ZDCKtynom:`Logo package`',
      'c9tZMSLhI:`/downloads/crema-logo-kit.zip`,z8CjbpeZB:`Download ZIP`,ZDCKtynom:`Logo package`'
    );
  }
  if (!txt.includes("c9tZMSLhI:`/downloads/crema-design-tokens.zip`")) {
    txt = txt.replace(
      'z8CjbpeZB:`Download ZIP`,ZDCKtynom:`Design tokens pack`',
      'c9tZMSLhI:`/downloads/crema-design-tokens.zip`,z8CjbpeZB:`Download ZIP`,ZDCKtynom:`Design tokens pack`'
    );
  }
  if (!txt.includes("c9tZMSLhI:`/downloads/crema-colour-production-sheet.pdf`")) {
    txt = txt.replace(
      'z8CjbpeZB:`Download PDF`,ZDCKtynom:`Print production colour sheet`',
      'c9tZMSLhI:`/downloads/crema-colour-production-sheet.pdf`,z8CjbpeZB:`Download PDF`,ZDCKtynom:`Print production colour sheet`'
    );
  }

  fs.writeFileSync(filePath, txt, "utf8");
  console.log("Synced Uqb7 Home bundle");
}

function patchToplevelBundle() {
  const filePath = path.join(SITE_DIR, "toplevel-deps.e4y__Jkd.mjs");
  let txt = fs.readFileSync(filePath, "utf8");
  txt = localizeFramerUrls(txt);
  txt = replaceMjsSvgs(txt);
  txt = applyReplacements(txt, COLOR_REPLACEMENTS);
  txt = applyReplacements(txt, TEXT_REPLACEMENTS);
  fs.writeFileSync(filePath, txt, "utf8");
  console.log("Synced toplevel-deps bundle");
}

function patchBadgeBundle() {
  const filePath = path.join(SITE_DIR, "PX9hIOIVM.B_JGNVOX.mjs");
  let txt = fs.readFileSync(filePath, "utf8");
  txt = localizeFramerUrls(txt);
  // Short-circuit Q (Badge component) to render null cleanly while preserving exports & metadata
  txt = txt.replace(
    /Q=x\(\/\* @__PURE__ \*\/ d\(function\(e,t\)\{[\s\S]*?\}\),\[\`/,
    'Q=x(/* @__PURE__ */ d(function(e,t){return null;}),[`'
  );
  txt = txt
    .replace(/https:\/\/www\.framer\.com[^\s`'"]*/g, cfg.brand.studio.url)
    .replace(/Create a free website with Framer, the website builder loved by startups, designers and agencies\./g, cfg.brand.copyright);
  fs.writeFileSync(filePath, txt, "utf8");
  console.log("Patched PX9hIOIVM badge bundle to null");
}

function patchSupportingSiteFiles() {
  for (const fname of [
    "shared-lib.CDk4JY0F.mjs",
    "RPUJI2ZZQzflcQ719FTZE3Cngeon7aJqAJ6qggw1jeM.DN3VAEAt.mjs",
    "script_main.Bn60abjW.mjs",
  ]) {
    const fp = path.join(SITE_DIR, fname);
    let txt = fs.readFileSync(fp, "utf8");
    txt = localizeFramerUrls(txt);
    txt = applyReplacements(txt, COLOR_REPLACEMENTS);
    txt = applyReplacements(txt, TEXT_REPLACEMENTS);
    if (fname === "script_main.Bn60abjW.mjs") {
      // Strip the 5-nested badge portal IIFE cleanly (5 closing parens before })})())
      txt = txt.replace(
        /\(function\(\)\{X&&i\(\(\)=>\{v\(document\.getElementById\(`__framer-badge-container`\),f\(m,\{\},f\(p\(\)=>import\(`\.\/PX9hIOIVM\.B_JGNVOX\.mjs`\)\)\)\)\}\)\}\)\(\)/g,
        "void 0"
      );
      if (txt.includes("__framer-badge-container")) {
        txt = txt.replace(
          /\(function\(\)\{X&&i\(\(\)=>\{v\(document\.getElementById\(`__framer-badge-container`\)[\s\S]*?PX9hIOIVM\.B_JGNVOX\.mjs`?\){4,6}\}\)\}\)\(\)/g,
          "void 0"
        );
      }
      if (txt.includes("__framer-badge-container")) {
        throw new Error("Failed to strip __framer-badge-container portal from script_main");
      }

      // Disable Framer On-Page EditorBar dynamic import (prevents /assets/framer.com/edit 404 and external chunk)
      txt = txt.replace(
        /EditorBar:s===void 0\?void 0:\(\(\)=>\{[\s\S]*?assets\/framer\.com\/edit\/init\.mjs[\s\S]*?\}\)\(\)/g,
        "EditorBar:void 0"
      );
      if (txt.includes("assets/framer.com/edit/init.mjs")) {
        throw new Error("Failed to strip EditorBar import from script_main");
      }
    }
    fs.writeFileSync(fp, txt, "utf8");
    console.log(`Synced ${fname}`);
  }

  // Patch searchIndex JSON
  const idxPath = path.join(SITE_DIR, "searchIndex-JOAAfGK8hGpQ.json");
  let idxTxt = fs.readFileSync(idxPath, "utf8");
  idxTxt = applyReplacements(idxTxt, TEXT_REPLACEMENTS);
  idxTxt = idxTxt.replaceAll(
    "Create a free website with Framer, the website builder loved by startups, designers and agencies.",
    cfg.brand.copyright
  );
  fs.writeFileSync(idxPath, idxTxt, "utf8");
  console.log("Synced searchIndex JSON");

  // Patch service worker allowed hostnames
  const swPath = path.join(ROOT, "public", "f2c-sw.js");
  let swTxt = fs.readFileSync(swPath, "utf8");
  swTxt = swTxt.replace("past-number-134025.framer.app", "crema.proiectum.studio");
  fs.writeFileSync(swPath, swTxt, "utf8");
  console.log("Synced f2c-sw.js");
}

function patchIndexHtml() {
  const htmlPath = path.join(ROOT, "public", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  // 1. Strip Framer HTML comments and generator meta
  html = html.replace(/<!-- Made in Framer[\s\S]*?-->\s*/g, "");
  html = html.replace(/<!-- Published [\s\S]*?-->\s*/g, "");
  html = html.replace(/<meta name="generator"[^>]*>\s*/gi, "");

  // 2. Localize external CDN URLs, replace SVGs, colors, and all text strings
  html = localizeFramerUrls(html);
  html = replaceHtmlSvgs(html);
  html = applyReplacements(html, COLOR_REPLACEMENTS);
  html = applyReplacements(html, TEXT_REPLACEMENTS);

  // 3. Remove the entire Framer badge SSR container cleanly
  html = html.replace(
    /<div id="__framer-badge-container">[\s\S]*?<\/a>(?:<!--\/\$-->)*<\/div>/g,
    ""
  );

  // 4. Fix the 3 SSR Resource cards (distinct file labels + real href & download attributes)
  let fileIdx = 0;
  html = html.replace(
    /(data-framer-name="File"[^>]*><p[^>]*>)([^<]*)(<\/p>)/g,
    (full, pre, _old, post) => {
      const res = cfg.resources[fileIdx] || cfg.resources[0];
      fileIdx++;
      return `${pre}${res.file}${post}`;
    }
  );
  let btnIdx = 0;
  html = html.replace(
    /<a\b[^>]*\bdata-framer-name="Download Button"/g,
    () => {
      const res = cfg.resources[btnIdx] || cfg.resources[0];
      btnIdx++;
      return `<a href="${res.href}" download="${res.filename}" class="framer-p5f75y framer-19kjqqu" data-framer-name="Download Button"`;
    }
  );

  // 5. Update metadata / SEO / OG / favicons cleanly
  html = html.replace(/<meta property="og:url" content="[^"]*">/g, `<meta property="og:url" content="${cfg.meta.canonicalUrl}">`);
  html = html.replace(/<meta property="og:image" content="[^"]*">/g, `<meta property="og:image" content="${cfg.meta.ogImage}">`);
  if (!html.includes('property="og:image"')) {
    html = html.replace(
      '<meta property="og:description"',
      `<meta property="og:image" content="${cfg.meta.ogImage}">\n    <meta property="og:description"`
    );
  }
  if (!html.includes('name="twitter:image"')) {
    html = html.replace(
      '<meta name="twitter:description"',
      `<meta name="twitter:image" content="${cfg.meta.ogImage}">\n    <meta name="twitter:description"`
    );
  } else {
    html = html.replace(/<meta name="twitter:image" content="[^"]*">/g, `<meta name="twitter:image" content="${cfg.meta.ogImage}">`);
  }
  html = html.replace(
    /<link href="assets\/framerusercontent\.com\/sites\/icons\/default-favicon-light\.v1\.png"[^>]*>/,
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n    <link href="assets/framerusercontent.com/sites/icons/default-favicon-light.v1.png" rel="icon" media="(prefers-color-scheme: light)">`
  );
  html = html.replace(
    /<link rel="apple-touch-icon" href="[^"]*">/,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
  );

  // 6. Bypass Framer inline reload script on internal sidebar/contents links
  html = html.replace(
    "if(u.pathname===location.pathname&&u.hash)return;",
    'if(u.pathname===location.pathname&&(u.hash||a.getAttribute("href")==="./"||a.hasAttribute("data-crema-target")||a.closest(\'[data-framer-name="Section Index"],#contents,[data-framer-name*="Index"]\')))return;'
  );

  // 7. Inject local Lenis vendor bundle, /crema-living.css & /crema-living.js idempotently with v5 cache buster
  html = html.replace(/\/crema-living\.css(?:\?v=\d+)?/g, `/crema-living.css?v=${ASSET_VER}`);
  html = html.replace(/\/assets\/vendor\/lenis\.min\.js(?:\?v=\d+)?/g, `/assets/vendor/lenis.min.js?v=${ASSET_VER}`);
  html = html.replace(/\/crema-living\.js(?:\?v=\d+)?/g, `/crema-living.js?v=${ASSET_VER}`);
  if (!html.includes("/crema-living.css")) {
    html = html.replace(
      "</head>",
      `    <link rel="stylesheet" href="/crema-living.css?v=${ASSET_VER}">\n</head>`
    );
  }
  if (!html.includes("/assets/vendor/lenis.min.js")) {
    html = html.replace(
      `<script defer src="/crema-living.js?v=${ASSET_VER}"></script>`,
      `<script defer src="/assets/vendor/lenis.min.js?v=${ASSET_VER}"></script>\n    <script defer src="/crema-living.js?v=${ASSET_VER}"></script>`
    );
  }
  if (!html.includes("/crema-living.js")) {
    html = html.replace(
      "</body>",
      `    <script defer src="/assets/vendor/lenis.min.js?v=${ASSET_VER}"></script>\n    <script defer src="/crema-living.js?v=${ASSET_VER}"></script>\n</body>`
    );
  }

  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(`Synced public/index.html (resource files=${fileIdx}, buttons=${btnIdx})`);
}

function syntaxCheckSiteModules() {
  const mjsFiles = fs.readdirSync(SITE_DIR).filter((f) => f.endsWith(".mjs"));
  for (const f of mjsFiles) {
    execFileSync(process.execPath, ["--check", path.join(SITE_DIR, f)], { stdio: "inherit" });
  }
  console.log(`Syntax check passed on ${mjsFiles.length} .mjs site modules.`);
}

copyVendorAssets();
writeDesignTokensZip();
patchHomeBundle();
patchToplevelBundle();
patchBadgeBundle();
patchSupportingSiteFiles();
patchIndexHtml();
syntaxCheckSiteModules();
console.log("Brand sync complete!");
