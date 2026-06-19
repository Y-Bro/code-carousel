/* ============================================================
   slides.example.js — DATA CONTRACT for code-carousel
   ------------------------------------------------------------
   Copy to `slides.js` and edit. The engine (app.js) reads the
   globals `SLIDES` and (optionally) `SLIDE_IMAGES` from here.
   Plain <script> globals — NOT ES modules (must work on file://).

   A slide's `type` selects the renderer in app.js:
     (none)/"code" | "cover" | "social" | "origin"
     | "gallery" | "achievements" | "finale"

   Shared fields (all optional unless noted):
     file        (req) card title / filename, e.g. "intro.go"
     author              -> renders a `// author:` comment line
     contributors[]      -> GitHub-style chips ("// contributed by:")
     section {emoji,label}-> package badge in the tab bar
     mood                -> gopher sticker pose (see GOPHER MOODS)
     commit {hash,cmd,out[],branch} -> git transition INTO this slide
   ============================================================ */

const SEC = {
  intro:  { emoji: "📦", label: "package intro" },
  story:  { emoji: "🔧", label: "package story" },
};

const SLIDES = [
  /* ---- cover ---- */
  {
    type: "cover",
    file: "hello.go",
    author: "Your Name",
    contributors: ["Alice", "Bob", "Anonymous Teammate"],
    eyebrow: "// a code carousel",
    title: "hello",          // big hero word
    ext: ".go",              // accent-coloured extension
    code: [                  // shown in the hero run-box (highlighted)
      "package main",
      "",
      "func main() {",
      "    carousel.Run()",
      "}",
    ],
    sub: "Subtitle line under the hero. 🐹",
    mood: "mascot",
    commit: { hash: "0000000", cmd: "git init", out: ["Initialized empty repository"], branch: "main" },
  },

  /* ---- standard code card ----
     top -> code above the message; lead/msg -> the human line(s)
     rendered as a glowing // comment; bottom -> post-filler code. */
  {
    file: "highlight.go",
    author: "Your Name",
    contributors: ["Alice"],
    section: SEC.intro,
    top: [
      "package intro",
      "",
      "type Thing struct {",
      "    Energy int",
      "}",
    ],
    lead: ["The headline human sentence goes here,"],
    msg:  ["and a supporting second line."],
    bottom: [
      "func (t Thing) Do() {",
      "    team.Morale += 100",
      "}",
    ],
    easter: "// NOTE: a tiny decorative comment",
    footer: ["// status: build passed"],
    mood: "confetti",
    sticker: { cap: "ConfettiGopher — caption under the sticker" },
    commit: { hash: "1a2b3c4", cmd: 'git commit -m "feat: add a thing"', out: ["[main 1a2b3c4] feat: add a thing"], branch: "main" },
  },

  /* ---- finale: two-stage terminal + waving gophers ----
     run[] lines: { t?:"$ ", c:"text", cls?:"prompt|feat|ok|dim|mascot" } */
  {
    type: "finale",
    file: "hello.go",
    author: "Your Name & the team",
    contributors: ["Alice", "Bob"],
    code: [
      "package main",
      "",
      "func Goodbye() {",
      '    fmt.Println("Thanks, friend ❤️")',
      "}",
    ],
    run: [
      { t: "$ ", c: "go run hello.go", cls: "prompt" },
      { c: "" },
      { c: "Loading memories...", cls: "dim" },
      { c: "Done.", cls: "ok" },
      { c: "exit code: 0", cls: "dim" },
    ],
    goodbye: "Thanks, friend",
    signoff: "— Alice, Bob & the team",
    commit: { hash: "f1na1e0", cmd: "git push origin main --tags", out: ["remote: 🐹 deployed with love"], branch: "main" },
  },
];

/* ============================================================
   OTHER SLIDE TYPES (field reference — see app.js renderers)
   ------------------------------------------------------------
   social:       { type:"social", file, contributors[], section,
                   header, intro, memories:[{k,v}], closing, footer[] }
   origin:       { type:"origin", file, author, section, header, intro,
                   beats:[ "..." ], struct:[ "go code lines" ], footer[] }
   gallery:      { type:"gallery", file, contributors[], section, header,
                   intro, photos:[{src,cap,cls:"wide"|"tall"|""}], footer[] }
   achievements: { type:"achievements", file, section, code:[...],
                   badges:[{name,level,emblem:"go|cup|star|shield",
                            tone:"cyan|amber|violet|green"}], footer[] }

   GOPHER MOODS (mood / sticker poses drawn in app.js):
     teacher detective prompt rocket confused award debuggod confetti
     coffee locked photo mascot wave
   ============================================================ */

/* ============================================================
   SLIDE_IMAGES (OPTIONAL) — decorative photo/sticker images that
   hover around each card's borders. One inner array per slide,
   index-aligned to SLIDES. Values are basenames in IMG_BASE.
   The engine maps emotion by file NAME; distribute all images
   evenly (~2-3/slide), each used once. Use [] for slides that
   should carry no stickers (e.g. a photo "gallery" slide).
   ============================================================ */
const SLIDE_IMAGES = [
  ["mascot_happy", "mascot_heart"],   // 0 cover
  ["mascot_party"],                   // 1 code card
  ["mascot_waving"],                  // 2 finale
];

const IMG_EXT  = { mascot_logo: "svg" }; // per-name extension overrides (default png)
const IMG_BASE = "assets/gophers/";

SLIDES.forEach((slide, i) => {
  slide.images = (SLIDE_IMAGES[i] || []).map((name) => ({
    src: IMG_BASE + name + "." + (IMG_EXT[name] || "png"),
    caption: name.replace(/_/g, " "),
  }));
});
