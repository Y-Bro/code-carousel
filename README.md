# code-carousel

A [Claude Code](https://claude.com/claude-code) **skill** that generates a self-contained,
**themable** slide carousel from a content file — a farewell, roast, toast, launch, or story
where the look is **chosen to fit the content**, not hardcoded.

The engine is **data-driven**: `app.js`, `themes.js`, `families.js`, `styles.css`,
`families.css`, and `index.html` ship as a content-agnostic template. To make a deck you only
write `slides.js` — a small `STYLE` config plus a `SLIDES` data array. No build step, no
framework, no npm install — it runs straight from `file://`.

![type: skill](https://img.shields.io/badge/Claude%20Code-skill-7c5cff)

## Six style families, one engine

| family | look | best for |
|---|---|---|
| **code-ide** | VS Code editor cards, Go gopher, git transitions | engineering farewells, dev decks |
| **terminal** | CRT shell session, scanlines, typewriter | hacker/retro, ops, roasts |
| **editorial** | magazine: serif display, drop caps, pull quotes | elegant tributes, stories |
| **scrapbook** | warm paper, polaroids, handwriting | heartfelt, photo-heavy send-offs |
| **keynote** | minimal: huge type, whitespace, fades | product/launch, talks |
| **chat** | messenger thread, bubbles, reactions | playful, group send-offs |

Pick a family + a **theme** (token preset like `vscode-dark`, `crt-green`, `ink`, `paper`,
`midnight`, `synthwave`…), or describe your own vibe (`brief: "dark synthwave, neon pink"`) or
set explicit `tokens` (accent, fonts). When run via Claude Code, the skill **infers a best-fit
style from your content and confirms with you** before building.

## Install

```bash
git clone https://github.com/Y-Bro/code-carousel.git ~/.claude/skills/code-carousel
```

Claude Code auto-discovers it. Then just ask:

> "Make a code-carousel farewell deck for Sam from notes.txt."

Claude reads the notes, recommends a style (with alternatives), and builds the deck.

## Usage

See **[USAGE.md](USAGE.md)** for the full guide. Quick start by hand:

```bash
REPO=~/.claude/skills/code-carousel   # or wherever you cloned this
mkdir my-deck && cd my-deck
cp "$REPO"/templates/{index.html,styles.css,families.css,themes.js,families.js,app.js} .
cp "$REPO"/examples/hello-world.slides.js slides.js   # or scrapbook-tribute.slides.js
open index.html                                        # xdg-open on Linux / start on Windows
```

Edit only `slides.js` — set `STYLE` (family + theme) and the `SLIDES` array. Verify with
`node "$REPO/scripts/verify.mjs" slides.js` (you want `RESULT: PASS`).

Runnable examples: [`examples/hello-world.slides.js`](examples/hello-world.slides.js) (code-ide)
and [`examples/scrapbook-tribute.slides.js`](examples/scrapbook-tribute.slides.js) (a non-code look).

## Layout

```
code-carousel/
  SKILL.md                   # the skill definition Claude Code reads
  USAGE.md                    # step-by-step guide
  examples/                   # runnable sample decks (code-ide + scrapbook)
  references/reference.md     # full STYLE/theme/role contract + how to add a family/theme
  scripts/verify.mjs          # deck self-test (JS + style + role + image checks)
  templates/
    index.html  styles.css  families.css     # shell + base + family skins
    themes.js   families.js  app.js          # token presets, family renderers, engine
    slides.example.js                        # the DATA CONTRACT — copy to slides.js and edit
```

The engine files are reused unchanged across decks; only `slides.js` differs.

## License

[MIT](LICENSE)
