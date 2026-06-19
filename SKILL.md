---
name: code-carousel
description: Use when the user wants to build, generate, or update a self-contained slide deck / PPT-style carousel (farewell, roast, toast, team deck, launch, story) from a content file plus optional photos. The look is content-aware and themable — code-as-source-file is one of several style families (also terminal, editorial/magazine, scrapbook, keynote, chat). Also for "add a slide", "restyle the deck", or applying a diff to an existing deck.
---

# code-carousel

## Overview
Generates a self-contained, **themable** slide carousel. **Two core principles:**
1. **Data-driven** — the engine (`app.js`, `themes.js`, `families.js`, `styles.css`,
   `families.css`, `index.html`) is content-agnostic and ships as a template. You only
   write `slides.js` (a `STYLE` config + a `SLIDES` data array). Never re-author the engine.
2. **Content-aware look** — the design is **not** fixed to VS Code editor cards. Infer a
   fitting **style family** + **theme** from the content, then confirm with the user.

## When to Use
- "make a PPT-style / themed slide deck", "farewell/roast/toast/launch carousel"
- "build a deck from this content file", "turn these notes into slides"
- "use a magazine / terminal / scrapbook / minimal / chat look", "restyle the deck"
- "add a slide", "apply this diff to the carousel"

**Not for:** real presentation tools (PowerPoint/Keynote/reveal.js) or generic web pages.

## Style families (pick one per deck)
| family | feel | good for |
|---|---|---|
| `code-ide` | VS Code editor cards, Go gopher, git transitions | engineering farewells, dev decks (the default) |
| `terminal` | CRT shell session, scanlines, typewriter | hacker/retro, ops, roasts |
| `editorial` | magazine: serif display, drop caps, pull quotes | elegant tributes, stories, “features” |
| `scrapbook` | warm paper, polaroids, handwriting | heartfelt, photo-heavy, personal send-offs |
| `keynote` | minimal: huge type, whitespace, fades | product/launch, talks, clean decks |
| `chat` | messenger thread, bubbles, reactions | playful, group send-offs, banter |

Themes (token presets) live in `themes.js` (e.g. `vscode-dark`, `crt-green`, `ink`, `paper`,
`midnight`, `daylight`, `synthwave`). Each family has a sensible default theme.

## Slide roles (metaphor-agnostic)
`cover` · `statement` · `list` · `story` · `gallery` · `quote` · `finale`.
Every family renders every role. Full schema: `templates/slides.example.js`.
Legacy decks using `type: cover|code|social|origin|gallery|achievements|finale` with no
`STYLE` still work — they default to `code-ide` and render identically.

## Procedure
1. **Infer the look, then CONFIRM.** Read the content file. Infer tone (farewell / roast /
   celebration / technical / personal), audience (engineers vs general), and whether it has
   code snippets or photos. Pick a best-fit **family + theme** and present it to the user with
   a one-line reason + **2 alternatives**, and offer **"describe your own"** (a natural-language
   vibe like "dark synthwave, neon pink") **or** explicit token overrides (accent, fonts).
   Wait for the choice. (e.g. technical eng farewell → `code-ide`; heartfelt + photos →
   `scrapbook`; launch → `keynote`; roast → `chat`/`terminal`; elegant story → `editorial`.)
2. **Copy templates** → new deck folder: `index.html`, `styles.css`, `families.css`,
   `themes.js`, `families.js`, `app.js`. Replace `{{DECK_TITLE}}` / `{{DECK_DESCRIPTION}}`.
3. **Write `slides.js`** from the content: set `STYLE = { family, theme, brief?, tokens?, deck }`
   then one `SLIDES` entry per content block, choosing a `role`. Mirror `slides.example.js`.
   Keep `slides.js` < 800 lines.
4. **Images (if given):** classify by filename — mascot/sticker images (emotion-mapped, even,
   each used once → `SLIDE_IMAGES`) vs real photos (a `gallery` role with captions). Convert
   HEIC→JPG (`sips`). Copy into `assets/gophers/` or `assets/photos/`.
5. **Verify:** `node scripts/verify.mjs <deck>/slides.js` → fix until `RESULT: PASS`.
6. **Open** `index.html`. If a browser MCP is available, screenshot 2-3 slides; otherwise
   **state it was not visually verified** and list what to eyeball.

**Diff / update branch:** apply requested edits to `slides.js` (incl. changing `STYLE`),
preserve unrelated content, keep `SLIDE_IMAGES` index-aligned when inserting a slide. Re-run step 5.

See `references/reference.md` for the full STYLE/theme/role contract, the inference mapping,
custom-style handling, and how to add a new family or theme. Runnable examples in `examples/`.

## Constraints
- Plain `<script>` globals — **NOT** ES modules (must work on `file://`).
- No framework / bundler / npm dependency. Each file < 800 lines.
- **Never invent people's names, quotes, or facts** not present in the inputs.
- `code-ide` + `vscode-dark` must keep rendering legacy decks identically — don't break it.
- Do not publish, share, or push the deck.

## Common Mistakes
| Mistake | Fix |
|---|---|
| Hardcoding the VS Code look | Pick a family that fits the content; it's one of six |
| Skipping the confirm step | Always recommend + offer alternatives/custom before building |
| Editing `app.js`/`families.js` per deck | Only `slides.js` changes; the engine is reused |
| Using `import`/`export` in `slides.js` | Use globals — ES modules break `file://` |
| Inventing a theme/family name | Use ids from `themes.js` / `families.js`; verify.mjs checks them |
| Claiming it "works" without checking | Run `verify.mjs`; if no browser MCP, say it's unverified |
