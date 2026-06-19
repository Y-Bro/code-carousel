---
name: code-carousel
description: Use when the user wants to build, generate, or update a slide deck / PPT-style carousel where each slide looks like a source-code file (e.g. a Go / VS Code themed farewell, roast, toast, or team deck) from a content file plus optional photos, or wants to add a slide or apply a diff to an existing such deck.
---

# code-carousel

## Overview
Generates a self-contained, VS Code / Go-themed slide carousel where every slide is a
fake source file. **Core principle: the deck is data-driven.** The engine (`app.js`,
`styles.css`, `index.html`) is content-agnostic and ships as a template; you only write
`slides.js` (a `SLIDES` data array). Do not re-author the engine per deck.

## When to Use
- "make a PPT-style / code-themed slide deck", "farewell/roast/toast carousel"
- "build a deck from this content file", "turn this into slides where each slide is a .go file"
- "add a photo slide to the deck", "apply this diff to the carousel"

**Not for:** real presentation tools (PowerPoint/Keynote/reveal.js), or generic web pages.

## Quick Reference
File layout (no build step; opens via `file://`):
```
<deck>/ index.html  styles.css  app.js(engine)  slides.js(DATA)  assets/{gophers,photos}/
```
Slide `type`s: `cover` · code (default) · `social`(warm) · `origin`(polaroid) · `gallery`(photos) ·
`achievements`(badges) · `finale`(terminal). Full schema: `templates/slides.example.js`.

## Procedure
1. **Copy templates** → new deck folder: `index.html`, `styles.css`, `app.js`. Replace
   `{{DECK_TITLE}}` / `{{DECK_DESCRIPTION}}` in `index.html`.
2. **Write `slides.js`** from the content file — one `SLIDES` entry per content block; pick a
   `type` per slide. Mirror `templates/slides.example.js`. Keep `slides.js` < 800 lines.
3. **Images (if given):** classify by filename — mascot stickers (emotion-mapped, distributed
   evenly, each used once → `SLIDE_IMAGES`) vs real photos (a `gallery` slide with funny captions).
   Convert HEIC→JPG (`sips`). Copy into `assets/gophers/` or `assets/photos/`.
4. **Verify:** `node scripts/verify.mjs <deck>/slides.js` and fix until `RESULT: PASS`.
5. **Open** `index.html`. If a browser MCP is available, screenshot 2-3 slides; otherwise
   **state it was not visually verified** and list what to eyeball.

**Diff / update branch:** apply the requested edits to the existing `slides.js`, preserve
unrelated content, and when inserting a slide keep `SLIDE_IMAGES` index-aligned (insert a
matching `[]` or array). Re-run step 4.

See `references/reference.md` for the full input/output contract, theme params, image rules,
and how to add a new slide type.

## Constraints
- Plain `<script>` globals — **NOT** ES modules (must work on `file://`).
- No framework / bundler / npm dependency. Each file < 800 lines.
- **Never invent people's names, quotes, or facts** not present in the inputs.
- Do not publish, share, or push the deck.

## Common Mistakes
| Mistake | Fix |
|---|---|
| Editing `app.js` per deck | Only `slides.js` changes; the engine is reused |
| Using `import`/`export` in `slides.js` | Use globals (`const SLIDES`) — ES modules break `file://` |
| Inserting a slide but not `SLIDE_IMAGES` | Insert a matching entry so indices stay aligned |
| Claiming it "works" without checking | Run `verify.mjs`; if no browser MCP, say it's unverified |
| Black-bg sticker images look boxy | The engine uses `mix-blend-mode: lighten` — keep them over the dark stage |
