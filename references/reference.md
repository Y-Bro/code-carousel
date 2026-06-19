# code-carousel — Reference

Full input/output contract and customization. The concrete data shape lives in
`templates/slides.example.js` (canonical example). Runnable decks in `examples/`.

---

## 1. Inputs

### 1a. Content file (REQUIRED)
Plain text / markdown, one block per slide. Each block may provide a heading/human line,
supporting lines, a list of key→value items, story beats, a quote, an author, a section label.
Missing fields: infer sensibly. **Never invent people's names, quotes, or facts.**

### 1b. Style (OPTIONAL — inferred, then confirmed)
The deck's look is chosen by inference + user confirmation, then stored in `STYLE` (see §2).
Provide any of: a family, a theme, a natural-language `brief`, explicit `tokens`.

### 1c. Images folder (OPTIONAL)
Classify by file NAME:
- **Mascot/sticker images** → `SLIDE_IMAGES`, scattered around card borders. Pick per slide by
  the EMOTION in the filename; distribute **evenly** (~2-3/slide), each used **once**.
- **Real photos** → a `gallery` role with caption overlays.
Convert HEIC: `sips -s format jpeg in.HEIC --out out.jpg`. Copy into `assets/gophers/` (stickers)
or `assets/photos/` (photos). Stickers use `mix-blend-mode: lighten` so black backgrounds vanish.

### 1d. Diff spec (OPTIONAL)
Edits to an existing deck (new slides, restyle, mascot lines). Preserve unrelated content; keep
`SLIDE_IMAGES` index-aligned when inserting slides.

---

## 2. STYLE — choosing the look

`slides.js` may declare a `STYLE` global (omit → `code-ide` + `vscode-dark`, full back-compat):

```js
const STYLE = {
  family: "editorial",   // code-ide | terminal | editorial | scrapbook | keynote | chat
  theme: "ink",          // any id in themes.js; omit -> the family's default theme
  brief: "warm, gold",   // OPTIONAL natural-language vibe -> theme + accent/texture
  tokens: { accent: "#b3402e" }, // OPTIONAL explicit overrides (win over everything)
  deck: "ada-farewell",  // short slug shown in code-ide chrome / terminal title
};
```

Resolution order (later wins): **family default theme → `theme` → `brief` deltas → `tokens`**.

### Families (`families.js`) — layout + metaphor
`code-ide` (editor cards, gopher, git transitions, the default) · `terminal` (CRT shell) ·
`editorial` (magazine) · `scrapbook` (polaroid/paper) · `keynote` (minimal big-type) ·
`chat` (messenger thread). Each maps every ROLE to its own renderer; roles a family doesn't
specialize fall back to a neutral renderer skinned by that family's CSS.

### Themes (`themes.js`) — token presets
`vscode-dark`, `paper-ide`, `crt-green`, `crt-amber`, `ink`, `paper`, `midnight`, `daylight`,
`messenger`, `synthwave`. A theme is pure data: `bg bg2 surface line text muted accent accent2
fontDisplay fontBody fontMono radius shadow texture` (`texture`: none|grain|scanlines|paper|glow).

### Custom style input (both accepted)
- **`brief`** (natural language) → `briefToTokens` in `themes.js` maps keywords to a theme id
  + accent/texture deltas (e.g. "synthwave neon pink" → `synthwave` + pink accent + glow).
- **`tokens`** (explicit) → merged last, overriding everything (e.g. `{ accent, fontDisplay }`).

---

## 3. Inference mapping (infer → recommend → confirm)

From the content, infer signals and map to a recommended family + theme. Always present the
recommendation + 2 alternatives + a "describe your own" option, and wait for the user.

| Content signal | Recommend | Alternatives |
|---|---|---|
| technical / engineering / dev in-jokes, code snippets | `code-ide` / `vscode-dark` | `terminal`, `keynote` |
| hacker, ops, retro, roast | `terminal` / `crt-green` | `chat`, `code-ide` |
| heartfelt, personal, photo-heavy, nostalgic | `scrapbook` / `paper` | `editorial`, `keynote` |
| elegant tribute, long-form story, quotes | `editorial` / `ink` | `keynote`, `scrapbook` |
| product, launch, talk, "clean/minimal" | `keynote` / `midnight` or `daylight` | `editorial`, `code-ide` |
| playful banter, group send-off | `chat` / `messenger` | `terminal`, `scrapbook` |

---

## 4. Slide roles + field map

`role`: `cover | statement | list | story | gallery | quote | finale` (every family renders each).

| role | fields |
|---|---|
| cover | `title`, `ext?`, `eyebrow`/`kicker`, `subtitle`/`sub`, `author`, `contributors[]` |
| statement | `heading` (the human line), `body[]`, `footer[]`, `section{emoji,label}` |
| list | `heading`, `intro`, `items:[{k,v}]`, `closing` |
| story | `heading`, `intro`, `beats:[ "..." ]` |
| gallery | `heading`, `intro`, `photos:[{src,cap,cls:"wide"|""}]` |
| quote | `text`, `attribution` |
| finale | `goodbye`, `lines[]` (or `run[]` for code-ide terminal), `signoff` |

Shared: `file`/`label`, `author`, `contributors[]`, `section`. **code-ide extras** (ignored by
other families): `top/lead/msg/bottom`, `code`, `run`, `memories`, `beats`/`struct`, `badges`,
`mood`/`sticker`, `commit{hash,cmd,out[],branch}` (git transition into the slide).

**Legacy compatibility:** `type: cover|code|social|origin|gallery|achievements|finale` with no
`STYLE` renders via `code-ide` exactly as before.

---

## 5. Required output style
**File layout** (no build step; runs from `file://`):
```
<deck>/
  index.html  styles.css  families.css
  themes.js   families.js  app.js        (ENGINE — copied from templates, not edited)
  slides.js   (DATA: STYLE + SLIDES + optional SLIDE_IMAGES — the ONLY per-deck file)
  assets/gophers/  assets/photos/
```
- Plain `<script>` globals, **NOT** ES modules. Each file **< 800 lines**.
- Keyboard (←/→/space/Home/End/F), click zones, swipe, dots, `prefers-reduced-motion`, responsive.

**Self-verification before declaring done:**
1. `node --check` every JS file.
2. `node scripts/verify.mjs <deck>/slides.js` — asserts JS parses, `STYLE.family`/`theme` valid,
   every role has a renderer, every referenced image exists once. Prints the slide×role table.
3. Open `index.html`; screenshot 2-3 slides if a browser MCP exists, else say it's unverified.

**Scope boundaries (do NOT):** add a framework/bundler/npm dep; invent names/quotes/facts;
break `code-ide`/`vscode-dark` back-compat; publish/share/push; exceed 800 lines/file.

---

## 6. Customization
- **New theme:** add an entry to `THEMES` in `themes.js` (a token object). Done — selectable via
  `STYLE.theme`.
- **New accent/vibe word:** add a rule to `VIBE` / `VIBE_TOKENS` in `themes.js`.
- **New family:** add an entry to `FAMILIES` in `families.js` with `{ label, theme, render(role,
  slide, CC) }` returning HTML per role (return `null` to fall back to `GENERIC`). Add matching
  CSS under `.fam-<id>` in `families.css`. Register a default theme.
- **New role:** add `GENERIC.<role>` in `families.js` and (optionally) per-family overrides.
- **code-ide internals:** the original editor-card renderers + Go highlighter + gopher SVG live
  in `app.js` and are registered as the `code-ide` family; leave them intact for back-compat.
