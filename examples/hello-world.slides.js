/* ============================================================
   hello-world.slides.js — a complete, runnable sample deck.

   To run it:
     mkdir my-deck && cd my-deck
     cp /path/to/code-carousel/templates/index.html .
     cp /path/to/code-carousel/templates/styles.css .
     cp /path/to/code-carousel/templates/app.js .
     cp /path/to/code-carousel/examples/hello-world.slides.js slides.js
     open index.html        # (xdg-open on Linux)

   This file defines the globals the engine reads: SLIDES (required)
   and SLIDE_IMAGES (optional). No images are referenced here, so the
   deck runs with zero asset files.
   ============================================================ */

const SEC = {
  intro:  { emoji: "📦", label: "package intro" },
  thanks: { emoji: "🙏", label: "package thanks" },
};

const SLIDES = [
  /* ---- 0. cover ---- */
  {
    type: "cover",
    file: "hello.go",
    author: "Your Name",
    contributors: ["Alice", "Bob", "Carol"],
    eyebrow: "// a code carousel · sample deck",
    title: "hello",
    ext: ".go",
    code: [
      "package main",
      "",
      "func main() {",
      "    carousel.Run()",
      "}",
    ],
    sub: "Press → to go run the deck. 🐹",
    mood: "mascot",
    commit: { hash: "0000000", cmd: "git init", out: ["Initialized empty repository"], branch: "main" },
  },

  /* ---- 1. standard code slide ----
     top -> code above the human line; lead/msg -> the message
     rendered as a glowing // comment; bottom -> code below it. */
  {
    file: "why.go",
    author: "Alice",
    contributors: ["Alice"],
    section: SEC.intro,
    top: [
      "package intro",
      "",
      "type Deck struct {",
      "    Slides []Slide",
      "}",
    ],
    lead: ["Every slide is a source file."],
    msg:  ["You only ever write this data array."],
    bottom: [
      "func (d Deck) Render() {",
      "    engine.Run(d.Slides)",
      "}",
    ],
    easter: "// NOTE: the engine never changes between decks",
    footer: ["// status: build passed"],
    mood: "confetti",
    sticker: { cap: "one gopher per card" },
    commit: { hash: "1a2b3c4", cmd: 'git commit -m "feat: add deck"', out: ["[main 1a2b3c4] feat: add deck"], branch: "main" },
  },

  /* ---- 2. social (warm) slide ---- */
  {
    type: "social",
    file: "memories.go",
    contributors: ["Bob", "Carol"],
    section: SEC.thanks,
    header: "// a few favourite moments",
    intro: "The stuff that actually mattered:",
    memories: [
      { k: "first PR",    v: "merged on a Friday at 5pm, of course" },
      { k: "best bug",    v: "the off-by-one that shipped to prod" },
      { k: "team motto",  v: "\"it works on my machine\"" },
    ],
    closing: "Thanks for all of it.",
    footer: ["// status: grateful", "// reviewers: everyone"],
    mood: "coffee",
    sticker: { cap: "CoffeeGopher" },
  },

  /* ---- 3. finale: terminal + waving gophers ---- */
  {
    type: "finale",
    file: "goodbye.go",
    author: "The team",
    contributors: ["Alice", "Bob", "Carol"],
    code: [
      "package main",
      "",
      "func Goodbye() {",
      '    fmt.Println("Thanks, friend ❤️")',
      "}",
    ],
    run: [
      { t: "$ ", c: "go run goodbye.go", cls: "prompt" },
      { c: "" },
      { c: "Loading memories...", cls: "dim" },
      { c: "Compiling gratitude... done", cls: "feat" },
      { c: "Thanks, friend.", cls: "ok" },
      { c: "exit code: 0", cls: "dim" },
    ],
    goodbye: "Thanks, friend",
    signoff: "— Alice, Bob & Carol",
    commit: { hash: "f1na1e0", cmd: "git push origin main --tags", out: ["remote: 🐹 deployed with love"], branch: "main" },
  },
];

/* No images in this sample, so SLIDE_IMAGES is empty for every slide. */
const SLIDE_IMAGES = [[], [], [], []];

const IMG_EXT  = {};
const IMG_BASE = "assets/gophers/";

SLIDES.forEach((slide, i) => {
  slide.images = (SLIDE_IMAGES[i] || []).map((name) => ({
    src: IMG_BASE + name + "." + (IMG_EXT[name] || "png"),
    caption: name.replace(/_/g, " "),
  }));
});
