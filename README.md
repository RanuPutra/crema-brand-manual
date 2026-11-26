# CREMA — Living Editorial Brand Manual

A living editorial brand manual and design system case study for **CREMA**, crafted by [Proiectum Studio](https://proiectum.studio).

## Getting Started

```bash
npm install
npm run sync
npm run dev
```

## Architecture

- `brand.config.json` — Single source of truth for copy, palette swatches, gradients, metadata, and downloadable kits.
- `scripts/sync-brand.mjs` — Deterministic sync script updating static markup, Framer runtime bundles, SVG wordmarks, colour tokens, and `public/downloads/crema-design-tokens.zip`.
- `scripts/build-assets.py` — Composites all 15 master artwork/photography slots, generates responsive variants, brand favicons, `crema-logo-kit.zip`, and `crema-colour-production-sheet.pdf`.
- `public/crema-living.css` & `public/crema-living.js` — Non-intrusive interactive enhancements (active scrollspy, click-to-copy swatches with WCAG contrast badges, interactive logo clearspace/surface sandbox, live editable type specimens, working asset downloads, `⌘K` index palette, and `@media print` A4 formatting).
