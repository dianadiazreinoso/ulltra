# SVRN — Site UI kit

A high-fidelity recreation of the SVRN marketing site (the project's `Nueva web glue.html`), rebuilt on the design-system tokens and primitives.

`index.html` is an interactive click-through:

- **Floating header** — SVRN wordmark + magenta dot, mono nav with numerals, a single `volt` CTA. Opens the **index menu** overlay and the **Get started** contact drawer.
- **Hero** — full-bleed dark Renaissance-cyber portrait, giant Archivo wordmark with an Instrument-Serif italic accent, two frosted-glass `InfoCard`s, and a mono scroll cue.
- **Capabilities** — the light "paper" inversion: faint Old-Master ground, centred editorial title, three numbered `CapabilityCard`s.

### Composes
`Button`, `Eyebrow`, `StatusPill`, `InfoCard`, `CapabilityCard` (reimplemented inline so the kit runs standalone via in-browser Babel — the canonical sources live in `components/core/`).

### Fidelity notes
The live site animates the hero as a 20-frame scroll-scrubbed canvas and pins the capabilities deck; this kit uses the first hero frame as a static backdrop and a normal stacked layout so the structure and styling read clearly without the scroll machinery.
