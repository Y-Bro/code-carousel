/* ============================================================
   slides.example.js — DATA CONTRACT for code-carousel.
   Copy to `slides.js` and edit. The engine (app.js) reads three
   globals from here: STYLE (optional), SLIDES (required), and
   SLIDE_IMAGES (optional). Plain <script> globals — NOT ES modules.

   ── STYLE: pick a look ──────────────────────────────────────
   family : code-ide | terminal | editorial | scrapbook | keynote | chat
   theme  : any id in themes.js (omit -> the family's default theme)
   brief  : natural-language vibe, mapped to a theme + accent/texture
   tokens : explicit overrides (win over everything) e.g. { accent:"#ff5f7e" }
   deck   : short slug shown in code-ide chrome / terminal title

   ── SLIDES: each entry has a semantic ROLE ──────────────────
   role : cover | statement | list | story | gallery | quote | finale
          (every family knows how to render each role)
   Legacy decks with `type: cover|code|social|origin|gallery|
   achievements|finale` and no STYLE still work — they default to
   the code-ide family and render identically.

   Field map by role (all optional unless noted):
     cover      title, ext?, eyebrow/kicker, subtitle/sub, author, contributors[]
     statement  heading (the human line), body[] lines, footer[], section{emoji,label}
     list       heading, intro, items:[{k,v}], closing
     story      heading, intro, beats:[ "..." ]
     gallery    heading, intro, photos:[{src,cap,cls:"wide"|""}]
     quote      text, attribution
     finale     goodbye, lines[] (or run[] for code-ide terminal), signoff
   Shared: file/label, author, contributors[], section, mood/sticker (code-ide),
   commit{hash,cmd,out[],branch} (code-ide git transition into the slide).
   ============================================================ */

const STYLE = {
  family: "keynote",     // try: code-ide, terminal, editorial, scrapbook, chat
  theme: "midnight",     // try: vscode-dark, crt-green, ink, paper, synthwave, daylight
  // brief: "warm nostalgic, gold accent",
  // tokens: { accent: "#7c5cff" },
  deck: "code-carousel",
};

const SLIDES = [
  /* ---- cover ---- */
  {
    role: "cover",
    eyebrow: "a code carousel",
    title: "hello",
    ext: ".go",
    subtitle: "Press → to run the deck.",
    author: "Your Name",
    contributors: ["Alice", "Bob"],
    // code-ide extras (ignored by other families):
    code: ["package main", "", "func main() {", "    carousel.Run()", "}"],
    sub: "Press → to run the deck. 🐹",
    mood: "mascot",
    commit: { hash: "0000000", cmd: "git init", out: ["Initialized empty repository"], branch: "main" },
  },

  /* ---- statement: a headline human line + supporting body ---- */
  {
    role: "statement",
    label: "why.go",
    section: { emoji: "📦", label: "intro" },
    heading: "Every slide is a source file — or a magazine page, or a chat.",
    body: [
      "The engine is the same for every deck.",
      "You only ever write this SLIDES array; the family + theme decide the look.",
    ],
    footer: ["status: build passed"],
    author: "Alice",
    // code-ide extras:
    top: ["package intro", "", "type Deck struct {", "    Slides []Slide", "}"],
    lead: ["Every slide is a source file."],
    msg: ["You only ever write this data array."],
    bottom: ["func (d Deck) Render() {", "    engine.Run(d.Slides)", "}"],
    mood: "confetti",
    commit: { hash: "1a2b3c4", cmd: 'git commit -m "feat: add deck"', out: ["[main 1a2b3c4] feat"], branch: "main" },
  },

  /* ---- list: key/value memories ---- */
  {
    role: "list",
    heading: "a few favourite moments",
    intro: "The stuff that actually mattered:",
    items: [
      { k: "first PR", v: "merged on a Friday at 5pm, of course" },
      { k: "best bug", v: "the off-by-one that shipped to prod" },
      { k: "team motto", v: "\"it works on my machine\"" },
    ],
    closing: "Thanks for all of it.",
    contributors: ["Bob", "Carol"],
    mood: "coffee",
  },

  /* ---- story: ordered beats ---- */
  {
    role: "story",
    heading: "how it started",
    intro: "A short origin story:",
    beats: [
      "Day one: nobody knew where the coffee was.",
      "Month three: shipped the thing everyone said couldn't ship.",
      "Year two: became the person who knew where everything was.",
    ],
  },

  /* ---- quote ---- */
  {
    role: "quote",
    text: "We didn't build software. We built the team that built the software.",
    attribution: "the whole crew",
  },

  /* ---- finale ---- */
  {
    role: "finale",
    label: "goodbye.go",
    goodbye: "Thanks, friend",
    lines: ["Loading memories... done", "Compiling gratitude... done", "exit code: 0"],
    signoff: "— Alice, Bob & Carol",
    // code-ide extras (terminal animation):
    code: ["package main", "", "func Goodbye() {", '    fmt.Println("Thanks ❤")', "}"],
    run: [
      { t: "$ ", c: "go run goodbye.go", cls: "prompt" },
      { c: "" },
      { c: "Loading memories...", cls: "dim" },
      { c: "Done.", cls: "ok" },
    ],
    commit: { hash: "f1na1e0", cmd: "git push origin main --tags", out: ["remote: 🐹 deployed with love"], branch: "main" },
  },
];

/* ============================================================
   SLIDE_IMAGES (OPTIONAL) — decorative photo/sticker images that
   hover around each card's borders. One inner array per slide,
   index-aligned to SLIDES. Values are basenames in IMG_BASE.
   Distribute images evenly (~2-3/slide), each used once. Use []
   for slides that should carry no stickers. Works in every family.
   (For a `gallery` role, put real photos in photos:[{src,cap}].)
   ============================================================ */
const SLIDE_IMAGES = [[], [], [], [], [], []];

const IMG_EXT  = {}; // per-name extension overrides (default png)
const IMG_BASE = "assets/gophers/";

SLIDES.forEach((slide, i) => {
  slide.images = (SLIDE_IMAGES[i] || []).map((name) => ({
    src: IMG_BASE + name + "." + (IMG_EXT[name] || "png"),
    caption: name.replace(/_/g, " "),
  }));
});
