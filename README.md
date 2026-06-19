# code-carousel

A [Claude Code](https://claude.com/claude-code) **skill** that generates a self-contained,
VS Code / Go-themed slide carousel where **every slide looks like a source file** — perfect
for farewell decks, team roasts, toasts, or any "code-as-slides" presentation.

The engine is **data-driven**: `app.js`, `styles.css`, and `index.html` ship as a content-agnostic
template. To make a deck you only write `slides.js` (a `SLIDES` data array). No build step, no
framework, no npm install — it runs straight from `file://`.

![type: skill](https://img.shields.io/badge/Claude%20Code-skill-00ADD8)

## What you get

- VS Code Dark+ editor cards (traffic lights, filename tabs, line-number gutter)
- A hand-written syntax highlighter (no CDN)
- A mood-aware gopher mascot + framed/blended photo stickers
- Git-commit-message transitions between sections and a terminal-output finale
- Slide types: `cover` · code (default) · `social` · `origin` · `gallery` · `achievements` · `finale`
- Keyboard / click / swipe navigation, progress dots, and a `prefers-reduced-motion` fallback

## Install

Clone into your Claude Code skills directory:

```bash
git clone https://github.com/Y-Bro/code-carousel.git ~/.claude/skills/code-carousel
```

Claude Code auto-discovers it. Then just ask:

> "Make a code-carousel farewell deck from this content file."

## Usage

See **[USAGE.md](USAGE.md)** for the full guide — the skill workflow, a by-hand walkthrough,
the slide-type cheat sheet, adding photos, and verification.

### Quick start by hand

```bash
REPO=~/.claude/skills/code-carousel    # or wherever you cloned this repo
mkdir my-deck && cd my-deck
cp "$REPO"/templates/{index.html,styles.css,app.js} .
cp "$REPO"/examples/hello-world.slides.js slides.js
open index.html                        # xdg-open on Linux / start on Windows
```

That runs a complete 4-slide sample deck. Then edit only `slides.js` (the `SLIDES` array),
replace `{{DECK_TITLE}}` / `{{DECK_DESCRIPTION}}` in `index.html`, and verify with
`node "$REPO/scripts/verify.mjs" slides.js` (you want `RESULT: PASS`).

A complete, runnable, image-free deck lives in
[`examples/hello-world.slides.js`](examples/hello-world.slides.js).

## Layout

```
code-carousel/
  SKILL.md                  # the skill definition Claude Code reads
  USAGE.md                   # step-by-step usage guide
  examples/                  # runnable sample deck (hello-world.slides.js)
  references/reference.md    # full input/output contract + customization notes
  scripts/verify.mjs         # deck self-test (JS syntax + image mapping)
  templates/
    index.html               # engine shell ({{DECK_TITLE}} placeholders)
    styles.css               # VS Code Dark+ theme (engine — reused as-is)
    app.js                   # carousel engine (reused as-is)
    slides.example.js        # the DATA CONTRACT — copy to slides.js and edit
```

See [`references/reference.md`](references/reference.md) for the full contract, theme params,
image rules, and how to add a new slide type.

## License

[MIT](LICENSE)
