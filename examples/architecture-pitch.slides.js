/* ============================================================
   architecture-pitch.slides.js — a runnable pitch deck that shows
   an ARCHITECTURE DIAGRAM via the `diagram` role (inline SVG).
   Family: keynote (clean pitch look). No images/deps required.

   The diagram role accepts ONE of:
     svg:     "<svg>…</svg>"   inline SVG (recommended — crisp, zero-dep)
     src:     "assets/photos/arch.svg"   an exported image (PNG/SVG)
     mermaid: "graph LR; A-->B"   rendered only if mermaid.js is loaded
   ============================================================ */

const STYLE = { family: "keynote", theme: "daylight", deck: "pitch" };

const ARCH_SVG = `
<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" font-family="Inter, sans-serif">
  <defs><marker id="arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
    <path d="M0,0 L7,3 L0,6 Z" fill="#2563eb"/></marker></defs>
  <g fill="#eef2ff" stroke="#2563eb" stroke-width="2">
    <rect x="20"  y="120" width="120" height="56" rx="10"/>
    <rect x="300" y="120" width="120" height="56" rx="10"/>
    <rect x="560" y="40"  width="140" height="56" rx="10"/>
    <rect x="560" y="200" width="140" height="56" rx="10"/>
  </g>
  <g fill="#0d1117" font-size="15" text-anchor="middle">
    <text x="80"  y="153">Client</text>
    <text x="360" y="153">API Gateway</text>
    <text x="630" y="73">Ingest svc</text>
    <text x="630" y="233">Query svc</text>
  </g>
  <g stroke="#2563eb" stroke-width="2" fill="none" marker-end="url(#arr)">
    <path d="M140,148 H296"/>
    <path d="M420,140 C500,140 500,68 556,68"/>
    <path d="M420,156 C500,156 500,228 556,228"/>
  </g>
  <rect x="560" y="120" width="140" height="56" rx="10" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2"/>
  <text x="630" y="153" font-size="15" text-anchor="middle" fill="#0d1117">Event bus</text>
  <g stroke="#0ea5e9" stroke-width="2" fill="none" marker-end="url(#arr)">
    <path d="M630,96 V118"/><path d="M630,198 V178"/>
  </g>
</svg>`;

const SLIDES = [
  {
    role: "cover",
    eyebrow: "architecture review",
    title: "v2 platform",
    subtitle: "Event-driven, three services behind one gateway.",
    author: "Platform team",
  },
  {
    role: "statement",
    heading: "The problem",
    body: [
      "The monolith couldn't scale ingestion independently from queries.",
      "One bad batch job took the read path down with it.",
    ],
  },
  {
    role: "diagram",
    file: "architecture.svg",
    heading: "Proposed architecture",
    intro: "Reads and writes scale independently; the bus decouples them.",
    svg: ARCH_SVG,
    caption: "Client → gateway → ingest/query services, decoupled by an event bus.",
    legend: ["■ services (blue)", "■ event bus (cyan)", "→ request / event flow"],
  },
  {
    role: "list",
    heading: "Why this wins",
    items: [
      { k: "scale", v: "ingest and query scale on their own curves" },
      { k: "blast radius", v: "a bad job no longer takes down reads" },
      { k: "cost", v: "spiky ingest no longer over-provisions the read tier" },
    ],
  },
  {
    role: "finale",
    goodbye: "Ship phase 1?",
    lines: ["Extract the query service first (lowest coupling).", "One PR per service, verify between."],
    signoff: "— Platform team",
  },
];

const SLIDE_IMAGES = [[], [], [], [], []];
SLIDES.forEach((s) => { s.images = []; });
