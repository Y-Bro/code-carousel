/* ============================================================
   hello-world.slides.js — a complete, runnable code-ide deck.

   Run it:
     mkdir my-deck && cd my-deck
     cp /path/to/code-carousel/templates/index.html .
     cp /path/to/code-carousel/templates/styles.css .
     cp /path/to/code-carousel/templates/families.css .
     cp /path/to/code-carousel/templates/themes.js .
     cp /path/to/code-carousel/templates/families.js .
     cp /path/to/code-carousel/templates/app.js .
     cp /path/to/code-carousel/examples/hello-world.slides.js slides.js
     open index.html        # xdg-open on Linux

   No images are referenced, so it runs with zero asset files.
   ============================================================ */

const STYLE = { family: "code-ide", theme: "vscode-dark", deck: "hello-world" };

const SLIDES = [
  {
    role: "cover", file: "hello.go",
    eyebrow: "// a code carousel · sample",
    title: "hello", ext: ".go",
    sub: "Press → to go run the deck. 🐹",
    author: "Your Name", contributors: ["Alice", "Bob"],
    code: ["package main", "", "func main() {", "    carousel.Run()", "}"],
    mood: "mascot",
    commit: { hash: "0000000", cmd: "git init", out: ["Initialized empty repository"], branch: "main" },
  },
  {
    role: "statement", file: "why.go", section: { emoji: "📦", label: "intro" }, author: "Alice",
    top: ["package intro", "", "type Deck struct {", "    Slides []Slide", "}"],
    lead: ["Every slide is a source file."],
    msg: ["You only ever write this data array."],
    bottom: ["func (d Deck) Render() {", "    engine.Run(d.Slides)", "}"],
    footer: ["// status: build passed"], mood: "confetti",
    sticker: { cap: "one gopher per card" },
    commit: { hash: "1a2b3c4", cmd: 'git commit -m "feat: add deck"', out: ["[main 1a2b3c4] feat: add deck"], branch: "main" },
  },
  {
    role: "list", type: "social", file: "memories.go",
    section: { emoji: "🙏", label: "thanks" }, contributors: ["Bob", "Carol"],
    header: "// a few favourite moments", intro: "The stuff that actually mattered:",
    memories: [
      { k: "first PR", v: "merged on a Friday at 5pm, of course" },
      { k: "best bug", v: "the off-by-one that shipped to prod" },
      { k: "team motto", v: "\"it works on my machine\"" },
    ],
    closing: "Thanks for all of it.", footer: ["// status: grateful"], mood: "coffee",
    sticker: { cap: "CoffeeGopher" },
  },
  {
    role: "finale", file: "goodbye.go", author: "The team", contributors: ["Alice", "Bob", "Carol"],
    code: ["package main", "", "func Goodbye() {", '    fmt.Println("Thanks ❤️")', "}"],
    run: [
      { t: "$ ", c: "go run goodbye.go", cls: "prompt" },
      { c: "" },
      { c: "Loading memories...", cls: "dim" },
      { c: "Compiling gratitude... done", cls: "feat" },
      { c: "Thanks, friend.", cls: "ok" },
      { c: "exit code: 0", cls: "dim" },
    ],
    goodbye: "Thanks, friend", signoff: "— Alice, Bob & Carol",
    commit: { hash: "f1na1e0", cmd: "git push origin main --tags", out: ["remote: 🐹 deployed with love"], branch: "main" },
  },
];

const SLIDE_IMAGES = [[], [], [], []];
const IMG_BASE = "assets/gophers/";
SLIDES.forEach((slide, i) => {
  slide.images = (SLIDE_IMAGES[i] || []).map((name) => ({ src: IMG_BASE + name + ".png", caption: name.replace(/_/g, " ") }));
});
