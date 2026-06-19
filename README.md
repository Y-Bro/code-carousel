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

## Use it directly (without the skill)

1. Copy `templates/index.html`, `templates/styles.css`, and `templates/app.js` into a new folder.
2. Replace `{{DECK_TITLE}}` / `{{DECK_DESCRIPTION}}` in `index.html`.
3. Copy `templates/slides.example.js` to `slides.js` and fill in your `SLIDES` array.
4. Verify: `node scripts/verify.mjs slides.js`
5. Open `index.html`.

## Layout

```
code-carousel/
  SKILL.md                  # the skill definition Claude Code reads
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
