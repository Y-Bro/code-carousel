/* ============================================================
   scrapbook-tribute.slides.js — a complete, runnable NON-CODE deck.
   Demonstrates a fully different look (warm scrapbook, no editor cards)
   from the same engine — proof the carousel isn't tied to code.

   Run it: copy the six engine files from templates/ into a folder,
   then `cp examples/scrapbook-tribute.slides.js slides.js` and open
   index.html. No images referenced -> runs with zero asset files.
   ============================================================ */

const STYLE = {
  family: "scrapbook",
  // theme omitted -> scrapbook default ("paper"); try brief/tokens to customise:
  // brief: "warm, gold accent",
  // tokens: { accent: "#c2683a" },
  deck: "tribute",
};

const SLIDES = [
  {
    role: "cover",
    title: "for Sam",
    subtitle: "five years, one scrapbook",
    author: "the whole team",
  },
  {
    role: "story",
    heading: "how it went",
    intro: "A few pages from the album:",
    beats: [
      "Joined as the person who asked the best questions.",
      "Became the person who answered them.",
      "Left a doc for everything — even the coffee machine.",
    ],
  },
  {
    role: "list",
    heading: "things we'll miss",
    intro: "In no particular order:",
    items: [
      { k: "the laugh", v: "audible three desks away" },
      { k: "the reviews", v: "kind, thorough, occasionally brutal" },
      { k: "the snacks", v: "always shared, never labelled" },
    ],
    closing: "Take the snacks. Leave the laugh.",
  },
  {
    role: "quote",
    text: "You don't replace people like this. You just hope some of it rubbed off.",
    attribution: "everyone, at the leaving lunch",
  },
  {
    role: "finale",
    goodbye: "go well, Sam",
    lines: ["the door's always open", "(and the wifi password hasn't changed)"],
    signoff: "— with love, the team",
  },
];

const SLIDE_IMAGES = [[], [], [], [], []];
const IMG_BASE = "assets/photos/";
SLIDES.forEach((slide, i) => {
  slide.images = (SLIDE_IMAGES[i] || []).map((name) => ({ src: IMG_BASE + name + ".jpg", caption: name.replace(/_/g, " ") }));
});
