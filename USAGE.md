# code-carousel — Usage Guide

How to build a themable deck: the two ways to use it, choosing a style, the runnable samples,
the slide-role cheat sheet, adding photos, and verifying.

> **Mental model:** the deck is **data-driven**. The engine files (`index.html`, `styles.css`,
> `families.css`, `themes.js`, `families.js`, `app.js`) are copied once and never edited. The
> *only* file you write per deck is **`slides.js`** — a `STYLE` config + a `SLIDES` array.

---

## Path A — via Claude Code (the skill)

Describe the deck; Claude infers a fitting look and confirms before building:

```
Make a code-carousel farewell deck for Priya from notes.txt.
```

Claude will:
1. Read `notes.txt`, infer tone/audience/media, and **recommend a style family + theme** with a
   one-line reason — plus 2 alternatives and a "describe your own" option.
2. Wait for your pick (or your own vibe: *"make it warm and handwritten"*, or explicit colors).
3. Build `slides.js`, run `verify.mjs`, and (if a browser is available) screenshot a few slides.

Give it a **content file** (one block per slide) and optionally a **photos folder** (mascot
stickers get scattered; real photos become a `gallery` slide). Claude never invents names/quotes.

---

## Path B — by hand (5 minutes)

Fastest — scaffold a deck with the CLI (no clone needed):

```bash
npx github:Y-Bro/code-carousel new my-deck
cd my-deck && open index.html
```

Or copy the engine files manually:

```bash
REPO=~/.claude/skills/code-carousel        # or your clone location
mkdir my-deck && cd my-deck
cp "$REPO"/templates/{index.html,styles.css,families.css,themes.js,families.js,app.js} .
cp "$REPO"/examples/hello-world.slides.js slides.js
open index.html        # macOS · xdg-open (Linux) · start (Windows)
```

Then edit `slides.js`, replace `{{DECK_TITLE}}`/`{{DECK_DESCRIPTION}}` in `index.html`, and
verify: `node "$REPO/scripts/verify.mjs" slides.js` → `RESULT: PASS`.
**Never edit the engine files for content** — only `slides.js`.

---

## Choosing a style — the `STYLE` config

```js
const STYLE = {
  family: "editorial",   // code-ide | terminal | editorial | scrapbook | keynote | chat
  theme: "ink",          // omit -> the family's default theme
  // brief: "warm, gold accent",      // natural-language vibe (maps to a theme + accent/texture)
  // tokens: { accent: "#b3402e" },   // explicit overrides — win over everything
  deck: "priya-farewell",            // short slug shown in code-ide chrome / terminal title
};
```

### Families

| family | feel | good for |
|---|---|---|
| `code-ide` | VS Code editor cards, gopher, git transitions | engineering decks (default) |
| `terminal` | CRT shell, scanlines | hacker/retro, roasts |
| `editorial` | magazine serif, drop caps | elegant tributes, stories |
| `scrapbook` | paper, polaroids, handwriting | heartfelt, photo-heavy |
| `keynote` | minimal big type | launches, talks |
| `chat` | messenger bubbles | playful banter |

### Themes (presets in `themes.js`)
`vscode-dark` · `paper-ide` · `crt-green` · `crt-amber` · `ink` · `paper` · `midnight` ·
`daylight` · `messenger` · `synthwave`. Resolution: family default → `theme` → `brief` → `tokens`.

### Bring your own style
- **Vibe:** `brief: "dark synthwave, neon pink, mono"` → picks `synthwave`, pink accent, glow.
- **Exact tokens:** `tokens: { accent: "#ff4d8d", fontDisplay: '"Space Grotesk", sans-serif' }`.

---

## Slide roles

Every family renders every role. Set `role` per slide (legacy `type` decks still work as code-ide).

| role | what it is | key fields |
|---|---|---|
| `cover` | title slide | `title`, `ext?`, `eyebrow`, `subtitle`, `author` |
| `statement` | a headline + supporting lines | `heading`, `body[]`, `footer[]` |
| `list` | key/value items | `heading`, `intro`, `items:[{k,v}]`, `closing` |
| `story` | ordered beats | `heading`, `intro`, `beats[]` |
| `gallery` | real photos | `heading`, `photos:[{src,cap,cls}]` |
| `quote` | a big quote | `text`, `attribution` |
| `diagram` | architecture/flow diagram | `heading`, ONE of `svg`/`src`/`mermaid`, `caption`, `legend[]` |
| `finale` | the send-off | `goodbye`, `lines[]`, `signoff` |

**Diagrams:** the `diagram` role takes inline `svg` (export from Excalidraw/Mermaid/draw.io →
SVG — crisp, zero-dep), an image `src` (PNG/SVG), or `mermaid` text (rendered if you vendor
`mermaid.min.js` and add a `<script>` to `index.html`; otherwise shown as source). Great for
architecture/technical pitches — pair with `family: "keynote"`. See
`examples/architecture-pitch.slides.js`.

Full reference: [`templates/slides.example.js`](templates/slides.example.js) and
[`references/reference.md`](references/reference.md).

---

## Adding photos / stickers

1. Put images in `assets/gophers/` (stickers) or `assets/photos/` (real photos). Convert HEIC:
   `sips -s format jpeg in.HEIC --out out.jpg`.
2. **Stickers** → `SLIDE_IMAGES`, index-aligned to `SLIDES` (one inner array per slide), each
   used once; `[]` for none. Works in every family.
3. **Real photos** → a `gallery` slide: `photos: [{ src:"assets/photos/x.jpg", cap:"…", cls:"wide" }]`.

Re-run `verify.mjs` after image changes — it catches missing files, duplicates, and unused assets.

---

## Verify & troubleshoot

`node "$REPO/scripts/verify.mjs" slides.js` checks: every JS file parses, `STYLE.family`/`theme`
are valid, every slide role has a renderer, and every image resolves once.

| Symptom | Fix |
|---|---|
| Blank page | Open the console — usually a `slides.js` syntax error (`node --check slides.js`). |
| `unknown family/theme` | Use an id from `families.js` / `themes.js`. |
| `verify.mjs` says *missing* | A `src` doesn't match a file under `assets/`. |
| Wrong look | Check `STYLE.family` and that you copied `families.css` + `themes.js` + `families.js`. |
| Images out of sync after inserting a slide | Add a matching `SLIDE_IMAGES` entry to keep indices aligned. |

## Constraints
- Plain `<script>` globals — **not** ES modules (runs from `file://`, no server).
- No framework, bundler, or npm dependency. Each file under 800 lines.
- The engine is reused unchanged across decks; `code-ide` + `vscode-dark` is fully backward-compatible.
