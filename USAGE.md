# code-carousel — Usage Guide

A complete walkthrough: the two ways to use it, a runnable sample, the slide-type
cheat sheet, how to add photos, and how to verify before you ship.

> **Mental model:** the deck is **data-driven**. `index.html`, `styles.css`, and `app.js`
> are a content-agnostic *engine* you copy once and never edit. The *only* file you write
> per deck is **`slides.js`** — a `SLIDES` array. One array entry = one slide.

---

## Path A — via Claude Code (the skill)

If you installed this as a skill (`~/.claude/skills/code-carousel`), just describe the deck
in natural language and let Claude assemble it:

```
Make a code-carousel farewell deck for Priya from notes.txt.
Use a cover, a few code slides, a memories slide, and a finale.
```

Helpful things to give Claude:

- **A content file** (plain text / markdown) — one block per slide. Claude maps each block
  to a slide (`file`, code lines, the human message, footer, author). It will **never invent
  names, quotes, or facts** that aren't in your notes.
- **Optional photos/stickers** — drop them in a folder and mention it. Mascot-style images get
  scattered around card borders; real photos become a `gallery` slide with captions.
- **Optional diff** — "add a slide that…", "change the finale to…". Claude edits `slides.js`
  in place and keeps everything else intact.

Claude finishes by running `scripts/verify.mjs` and (if a browser tool is available)
screenshotting a couple of slides.

---

## Path B — by hand (5 minutes)

### 1. Create a deck folder from the templates + sample

```bash
# from anywhere; adjust the path to wherever you cloned this repo
REPO=~/.claude/skills/code-carousel        # or your clone location

mkdir my-deck && cd my-deck
cp "$REPO/templates/index.html" .
cp "$REPO/templates/styles.css" .
cp "$REPO/templates/app.js" .
cp "$REPO/examples/hello-world.slides.js" slides.js
```

### 2. Open it

```bash
open index.html        # macOS
# xdg-open index.html  # Linux
# start index.html     # Windows
```

You now have a working 4-slide deck (cover → code → memories → finale). Navigate with
`←` / `→` / `space`, `Home` / `End`, and `F` for fullscreen.

### 3. Make it yours

- In `index.html`, replace `{{DECK_TITLE}}` and `{{DECK_DESCRIPTION}}` (the `<title>`/meta tags).
- Edit `slides.js` — change the text, add/remove entries in the `SLIDES` array.
- **Never edit `app.js` / `styles.css`** for content. They're the reusable engine. (Only touch
  them to change the theme — see [reference.md](references/reference.md#3-customization).)

### 4. Verify before sharing

```bash
node "$REPO/scripts/verify.mjs" slides.js
```

It checks that `slides.js` and `app.js` parse, that every referenced image exists and is used
exactly once, and prints a slide × image table. You want `RESULT: PASS`.

---

## The sample deck

[`examples/hello-world.slides.js`](examples/hello-world.slides.js) is a complete, image-free
deck you can copy and run as-is. It demonstrates four of the slide types and the data shape for
each. Read it top-to-bottom — it's the fastest way to learn the contract.

---

## Slide types

Set `type` on a slide to pick a renderer. Default (no `type`) is a code slide.

| `type`         | Looks like                                   | Key fields |
|----------------|----------------------------------------------|------------|
| `cover`        | Hero title + run-box                          | `title`, `ext`, `code[]`, `sub`, `eyebrow` |
| *(none)*/`code`| An editor file with a glowing `//` message    | `top[]`, `lead[]`, `msg[]`, `bottom[]`, `footer[]` |
| `social`       | Warm "coffee-stained" memories card           | `header`, `intro`, `memories[{k,v}]`, `closing` |
| `origin`       | Polaroid + story beats                        | `header`, `intro`, `beats[]`, `struct[]` |
| `gallery`      | Grid of real photos with meme captions        | `header`, `intro`, `photos[{src,cap,cls}]` |
| `achievements` | Badge grid                                    | `code[]`, `badges[{name,level,emblem,tone}]` |
| `finale`       | Two-stage terminal + waving gophers           | `code[]`, `run[{t,c,cls}]`, `goodbye`, `signoff` |

**Shared optional fields:** `file` (the tab/filename, required), `author`, `contributors[]`
(GitHub-style chips), `section {emoji,label}` (package badge), `mood` (gopher pose),
`sticker {cap}`, and `commit {hash,cmd,out[],branch}` (a git-style transition *into* the slide).

**Gopher moods:** `teacher detective prompt rocket confused award debuggod confetti coffee
locked photo mascot wave`.

Full field reference: [`templates/slides.example.js`](templates/slides.example.js) and
[`references/reference.md`](references/reference.md).

---

## Adding photos / stickers

1. Put images in `assets/gophers/` (mascot-style stickers) or `assets/photos/` (real photos).
   Convert HEIC first: `sips -s format jpeg in.HEIC --out out.jpg`.
2. **Stickers** → list basenames in `SLIDE_IMAGES`, an array index-aligned to `SLIDES`
   (one inner array per slide). Distribute them evenly, each used once; use `[]` for slides
   with no stickers:

   ```js
   const SLIDE_IMAGES = [
     ["mascot_happy", "mascot_heart"], // slide 0
     ["mascot_party"],                 // slide 1
     [],                               // slide 2 (none)
     ["mascot_waving"],                // slide 3
   ];
   ```

3. **Real photos** → a `gallery` slide:

   ```js
   { type: "gallery", file: "team.go", header: "// the crew",
     intro: "Exhibit A:",
     photos: [
       { src: "assets/photos/offsite.jpg", cap: "the offsite nobody remembers", cls: "wide" },
       { src: "assets/photos/launch.jpg",  cap: "5 minutes before the demo broke", cls: "" },
     ] }
   ```

Re-run `verify.mjs` after any image change — it catches missing files, duplicates, and unused assets.

---

## Constraints (so it always works)

- Plain `<script>` globals — **not** ES modules (so it runs from `file://`, no server).
- No framework, bundler, or npm dependency. Each file stays under 800 lines.
- The engine (`app.js`, `styles.css`, `index.html`) is reused unchanged across decks.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page | Open the browser console. Usually a syntax error in `slides.js` — run `node --check slides.js`. |
| `verify.mjs` says *missing* | A `src` path in `slides.js` doesn't match a file under `assets/`. |
| Stickers look like black boxes | Keep them over the dark stage — the engine uses `mix-blend-mode: lighten`. |
| Images out of sync after inserting a slide | Insert a matching entry in `SLIDE_IMAGES` so indices stay aligned. |
