# SVRN — Design System

**SVRN** is a sovereign AI infrastructure brand — *European AI & Data Engineering, established for sovereign systems.* The visual identity is **editorial-cinematic**: a warm near-black stage, cream ink, Renaissance-meets-cyber imagery, a single magenta accent, and heavy Archivo type used at architectural scale. It reads like a luxury product film, not a SaaS site.

This design system was reverse-engineered from the live site (`Nueva web glue.html` in this project) — its `:root` token block, component CSS, fonts and section vocabulary.

> **Sources:** `Nueva web glue.html` (the full marketing site), `assets/hero.js` (React components + copy), `assets/sculpture-section/` (the 3D bust section). All in this project.

---

## Content fundamentals

- **Voice:** assured, sparse, declarative. Short lines. No hype, no exclamation. "It is the operating layer." "Old wisdom, new instruments."
- **Person:** the brand speaks as "we"; addresses the reader as "you" only in CTAs ("Tell us what you're building").
- **Casing:** headlines are sentence case, not Title Case. Mono labels are ALL-CAPS with wide tracking. Numerals lead nav items and sections ("01", "§ 05").
- **Themes:** sovereignty, ownership, European regulation, classical wisdom applied to new instruments, depth over novelty ("a deliberately small set of tools, operated in depth").
- **Emoji:** never. Iconography is minimal — magenta bullet dots, a pulsing status dot, hairline rules.
- **Numbers/units:** stylised with thin spaces — "24 / 7 / 365".

## Visual foundations

- **Palette:** warm black `#0A0807` ground; cream ink `#EDE5CC` stepped down through three mutes. **Magenta `#D95BFF`** is the one true accent (CTA dot, selection, bullets). **Yellow `#E5DC4D`** = operational/live. **Lime `#D2FF00`** appears *only* on the header CTA. Light "paper" sections invert to cream (`#EFE9DB` / `#F2EAD3`) with near-black ink.
- **Type:** **Archivo** is the workhorse — every headline, wordmark, card title, and UI label, run at 700–800 and tracked tight (−0.045em on big wordmarks). **Instrument Serif / Cormorant** italic is the editorial accent for a single emphasised phrase inside a display line. **JetBrains Mono** is the instrument panel — eyebrows, numerals, kickers, status — always uppercase, +0.14em.
- **Imagery:** cinematic AI-generated Old-Master portraiture, warm and low-key on dark sections, drained to a faint ground on paper sections. Always full-bleed with protection gradients, never inside boxes.
- **Backgrounds:** full-bleed images under multi-stop protection gradients (top + bottom + left). The hero is a scroll-scrubbed frame sequence; paper sections lay a ~0.5-opacity painting behind the text.
- **Borders & cards:** hairlines, not boxes — cream at 7–14% alpha on dark, near-black at ~18% on paper. Cards lean on a single top rule + hover lift (−4px) rather than heavy chrome. Frosted glass (`blur(8px) saturate(120%)`) for panels floating over imagery.
- **Radii:** restrained — 6/10/14px, pill for buttons, 16px for large overlays. Sharp editorial edges dominate.
- **Shadow:** reserved for floating overlays only — deep, soft, near-black (`0 30px 80px rgba(0,0,0,.6)`).
- **Motion:** cinematic. Long-tail easing (`cubic-bezier(.19,1,.22,1)`), no bounce. Content fades + rises a few px on entry; hovers are small and slow (−2/−4px). Scroll-driven sequences scrub 1:1. Honours `prefers-reduced-motion`.

## Iconography

There is **no icon set**. The system is deliberately icon-light: magenta bullet dots, a pulsing circular status dot (with a soft color-matched glow), hairline rules, and a `×` glyph for close. The logo is a **text wordmark** — `SVRN` in Archivo 800 with a magenta dot — not an image file (`assets/brand/` holds brand *imagery*, not a logo). If you need UI glyphs, add a thin-stroke line set (e.g. Lucide) and flag it; do not draw bespoke SVGs.

---

## Index / manifest

- **`styles.css`** — global entry point (@import manifest). Consumers link this.
- **`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `motion.css`.
- **`fonts/fonts.css`** — the five families via Google Fonts CDN.
- **`guidelines/`** — foundation specimen cards (colors, type, spacing, radii, motion).
- **`components/core/`** — `Button`, `Eyebrow`, `StatusPill`, `InfoCard`, `CapabilityCard`.
- **`ui_kits/svrn-site/`** — interactive recreation of the site (hero + capabilities, with index menu + contact drawer).
- **`assets/brand/`** — curated brand imagery (hero frame, paper ground, card grounds, footer).

> The full original site lives at `Nueva web glue.html` (project root) — the canonical reference for any section not yet recreated here (Software, the 3D Wisdom bust, Tech & AI Stack, Clients, Footer).

## Caveats

- **Fonts load from the Google Fonts CDN** (all five are genuine Google families). For a fully offline/self-hosted system, swap the `@import` in `fonts/fonts.css` for local `@font-face` rules — the `.woff2` binaries already sit in the project's `assets/`.
- The UI kit reimplements the primitives inline (rather than importing the generated bundle) so it runs standalone; the canonical component sources are in `components/core/`.
- Only the **hero** and **capabilities** sections are recreated as a UI kit so far.
