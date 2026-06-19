# code-carousel — Reference

Full input/output contract and customization notes. The concrete data shape lives
in `templates/slides.example.js` (the canonical example). This file explains the
rules around it.

---

## 1. Inputs

### 1a. Content file (REQUIRED)
Plain text / markdown describing the deck, one block per slide. Each block may provide:

| Field | Maps to slide field | Notes |
|---|---|---|
| section / category | `section {emoji,label}` | becomes the `package X` badge |
| file name | `file` | card title, e.g. `prompting.go` |
| package + pre-filler code | `top[]` | code shown above the message |
| main content (the human message) | `lead[]` + `msg[]` | rendered as a glowing `//` comment |
| post-filler code | `bottom[]` | code shown below the message |
| sticker idea | `sticker.cap` / `mood` | mascot pose + caption |
| footer comment | `footer[]` | end with a `// status:` line |
| author | `author` | one `// author:` line (avoid duplicating elsewhere) |

Missing fields: infer sensibly from context. **Never invent people's names, quotes, or facts.**

### 1b. Theme params (OPTIONAL, with defaults)
`subject` (who the deck is about) · `author` + `contributors[]` · `accent` (default Go cyan
`#00ADD8`, the `--go-cyan` CSS token) · language/editor theme (default **Go + VS Code Dark+**).

### 1c. Images folder (OPTIONAL)
Classify by file NAME, two kinds:
- **Mascot/sticker images** → `SLIDE_IMAGES`, scattered around card borders. Choose per slide by
  the EMOTION implied in the filename (e.g. `*_facepalm` → roast, `*_coffee*` → social). Distribute
  **all** images **evenly** (~2-3/slide) and use each **exactly once**.
- **Real photos** → a dedicated `gallery` slide with funny caption overlays.
Convert unsupported formats (HEIC→JPG via `sips -s format jpeg in.HEIC --out out.jpg`). Copy into
`assets/gophers/` (stickers) or `assets/photos/` (gallery). Black-background stickers use
`mix-blend-mode: lighten` in the engine, so they float on the dark stage without processing.

### 1d. Diff spec (OPTIONAL)
An "additional content" file describing edits to an existing deck (new sections, mascot lines,
contributor chips, finale redesign, a new slide). Applying a diff MUST preserve unrelated content
and keep `SLIDE_IMAGES` index-aligned when slides are inserted (insert a matching `[]` or array).

---

## 2. Required output style

**File layout** (no build step; runs from `file://`):
```
<deck>/
  index.html      styles.css
  slides.js       (DATA: SLIDES + optional SLIDE_IMAGES — the ONLY per-deck file)
  app.js          (ENGINE — copied from templates, rarely edited)
  assets/gophers/ assets/photos/
```
- Plain `<script>` globals, **NOT** ES modules (file:// compatibility).
- Each file **< 800 lines**; split if a file approaches the limit.
- Aesthetic: VS Code Dark+ editor cards (traffic lights, tab = filename, line-number gutter);
  hand-written syntax highlighter (no CDN); mascot SVG + framed/blended photo stickers;
  git-commit-message transitions between sections; terminal-output finale; contributor chips;
  section/package badges.
- Behavior: keyboard (←/→/space/Home/End/F), click zones, swipe, progress dots, status bar,
  line-by-line entry animation, `prefers-reduced-motion` fallback, responsive (375/768/1024/1440).

**Self-verification before declaring done:**
1. `node --check` every JS file.
2. `node scripts/verify.mjs <deck>/slides.js` — asserts each referenced image exists, mapped
   exactly once, none unused/missing; prints the slide×image table.
3. Open `index.html`. If a browser MCP/extension is available, screenshot 2-3 slides; otherwise
   **explicitly state it was not visually verified** and list what the user should eyeball.

**Scope boundaries (do NOT):** add a framework/bundler/npm dep; invent names/quotes/facts;
publish/share/push; exceed 800 lines/file.

---

## 3. Customization

- **Accent color:** change `--go-cyan` in `styles.css` `:root` (also `--go-cyan-2`).
- **Theme:** Go + VS Code Dark+ is the default. Other languages work via the highlighter's
  keyword sets in `app.js` (`KEYWORDS`, `CONTROL`); the gopher mascot is the Go default — swap the
  `gopher()` SVG factory for a different mascot if theming away from Go.
- **Add a slide type:** write a `renderX(slide)` function in `app.js` returning a `<section
  class="slide">`, then register it in the `RENDERERS` map. Add matching CSS in `styles.css`.
- **Slide types shipped:** `cover`, code (default), `social` (warm), `origin` (polaroid),
  `gallery` (photos), `achievements` (badge grid), `finale` (terminal).
- **Gopher moods:** `teacher detective prompt rocket confused award debuggod confetti coffee
  locked photo mascot wave` (see `gopherProp()` in `app.js`).
