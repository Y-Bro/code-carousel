/* ============================================================
   themes.js — THEME TOKEN layer for code-carousel.
   Declares the global `THEMES` registry (named token presets),
   a `VIBE` keyword map (natural-language brief -> tokens), and
   `resolveTheme` / `applyTheme` helpers consumed by app.js.

   A theme is pure DATA: a set of CSS-variable values. Switching
   a theme changes only these tokens — never layout/markup.
   Plain <script> globals — NOT ES modules (must work on file://).
   ============================================================ */

/* Token keys every theme provides (sensible fallbacks in styles.css):
     bg, bg2, surface, line, text, muted, accent, accent2,
     fontDisplay, fontBody, fontMono, radius, shadow, texture
   texture: none | grain | scanlines | paper | glow              */

const THEMES = {
  /* --- code-ide family --- */
  "vscode-dark": {
    label: "VS Code Dark+", bg: "#181818", bg2: "#1e1e1e", surface: "#252526",
    line: "#2b2b2b", text: "#d4d4d4", muted: "#9d9d9d", accent: "#00add8", accent2: "#5dc9e2",
    fontDisplay: '"JetBrains Mono", monospace', fontBody: '"JetBrains Mono", ui-monospace, monospace',
    fontMono: '"JetBrains Mono", ui-monospace, monospace', radius: "12px",
    shadow: "0 30px 80px -20px rgba(0,0,0,0.75)", texture: "none",
  },
  "paper-ide": {
    label: "Light Paper IDE", bg: "#eef1f5", bg2: "#ffffff", surface: "#f6f8fa",
    line: "#d8dee4", text: "#1f2328", muted: "#656d76", accent: "#0969da", accent2: "#218bff",
    fontDisplay: '"JetBrains Mono", monospace', fontBody: '"JetBrains Mono", ui-monospace, monospace',
    fontMono: '"JetBrains Mono", ui-monospace, monospace', radius: "12px",
    shadow: "0 24px 60px -22px rgba(40,60,90,0.35)", texture: "none",
  },

  /* --- terminal family --- */
  "crt-green": {
    label: "CRT Green", bg: "#020806", bg2: "#03110b", surface: "#04170f",
    line: "#0c3b27", text: "#5ef2a3", muted: "#2f9e6b", accent: "#7dffc0", accent2: "#34d399",
    fontDisplay: '"JetBrains Mono", monospace', fontBody: '"JetBrains Mono", monospace',
    fontMono: '"JetBrains Mono", monospace', radius: "6px",
    shadow: "0 0 60px -10px rgba(52,211,153,0.35)", texture: "scanlines",
  },
  "crt-amber": {
    label: "CRT Amber", bg: "#0a0600", bg2: "#140d02", surface: "#1c1304",
    line: "#3d2a08", text: "#ffcf6e", muted: "#b78a37", accent: "#ffd87a", accent2: "#ff9f1c",
    fontDisplay: '"JetBrains Mono", monospace', fontBody: '"JetBrains Mono", monospace',
    fontMono: '"JetBrains Mono", monospace', radius: "6px",
    shadow: "0 0 60px -10px rgba(255,159,28,0.3)", texture: "scanlines",
  },

  /* --- editorial family --- */
  "ink": {
    label: "Editorial Ink", bg: "#f4f1ea", bg2: "#faf8f3", surface: "#ffffff",
    line: "#e4ddcf", text: "#1a1714", muted: "#6b6358", accent: "#b3402e", accent2: "#8a6d3b",
    fontDisplay: '"Playfair Display", Georgia, serif', fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace', radius: "2px",
    shadow: "0 18px 50px -24px rgba(40,30,20,0.45)", texture: "none",
  },

  /* --- scrapbook family --- */
  "paper": {
    label: "Warm Scrapbook", bg: "#e9ddc7", bg2: "#f4ead4", surface: "#fffdf6",
    line: "#e0cda8", text: "#42301c", muted: "#8a6a44", accent: "#d9774b", accent2: "#5aa0a8",
    fontDisplay: '"Caveat", "Inter", cursive', fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace', radius: "10px",
    shadow: "0 20px 50px -18px rgba(90,60,30,0.4)", texture: "paper",
  },

  /* --- keynote family --- */
  "midnight": {
    label: "Midnight Keynote", bg: "#08080c", bg2: "#0d0d14", surface: "#13131c",
    line: "#23232e", text: "#f4f4f8", muted: "#9a9aae", accent: "#7c5cff", accent2: "#22d3ee",
    fontDisplay: '"Inter", system-ui, sans-serif', fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace', radius: "18px",
    shadow: "0 40px 100px -30px rgba(0,0,0,0.8)", texture: "glow",
  },
  "daylight": {
    label: "Daylight Keynote", bg: "#f5f6f8", bg2: "#ffffff", surface: "#ffffff",
    line: "#e6e8ec", text: "#0d1117", muted: "#5b626c", accent: "#2563eb", accent2: "#0ea5e9",
    fontDisplay: '"Inter", system-ui, sans-serif', fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace', radius: "18px",
    shadow: "0 30px 70px -28px rgba(30,40,60,0.28)", texture: "none",
  },

  /* --- chat family --- */
  "messenger": {
    label: "Messenger", bg: "#0b141a", bg2: "#101b22", surface: "#1f2c33",
    line: "#22343d", text: "#e9edef", muted: "#8696a0", accent: "#25d366", accent2: "#34b7f1",
    fontDisplay: '"Inter", system-ui, sans-serif', fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace', radius: "16px",
    shadow: "0 24px 60px -24px rgba(0,0,0,0.6)", texture: "none",
  },

  /* --- vibe presets --- */
  "synthwave": {
    label: "Synthwave", bg: "#0d021a", bg2: "#1a0533", surface: "#23083f",
    line: "#3a1066", text: "#ffe3fb", muted: "#b07ad6", accent: "#ff2e97", accent2: "#22d3ee",
    fontDisplay: '"Inter", system-ui, sans-serif', fontBody: '"Inter", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace', radius: "14px",
    shadow: "0 0 80px -16px rgba(255,46,151,0.45)", texture: "glow",
  },
};

/* Natural-language brief -> theme id (first matching keyword wins).
   app.js uses this when STYLE.brief is set and STYLE.theme is not. */
const VIBE = [
  [/synth|neon|retro\s*wave|vapor|outrun/i, "synthwave"],
  [/crt|terminal|hacker|matrix|amber/i, "crt-amber"],
  [/green\s*screen|phosphor|shell|console/i, "crt-green"],
  [/magazine|editorial|elegant|serif|vogue|print/i, "ink"],
  [/warm|cozy|heartfelt|nostalg|scrapbook|polaroid|memory|memories/i, "paper"],
  [/chat|message|imessage|slack|whatsapp|thread|texts?/i, "messenger"],
  [/light|bright|daylight|clean|airy/i, "daylight"],
  [/dark|midnight|sleek|keynote|product|minimal/i, "midnight"],
];

/* Map a few brief adjectives onto token deltas (accent colours, texture). */
const VIBE_TOKENS = [
  [/pink|magenta|rose/i, { accent: "#ff4d8d" }],
  [/cyan|teal|aqua/i, { accent: "#22d3ee" }],
  [/purple|violet/i, { accent: "#8b5cf6" }],
  [/orange|amber|gold/i, { accent: "#f59e0b" }],
  [/green|emerald/i, { accent: "#22c55e" }],
  [/red|crimson/i, { accent: "#ef4444" }],
  [/blue/i, { accent: "#3b82f6" }],
  [/glow|neon/i, { texture: "glow" }],
  [/grain|film|gritty/i, { texture: "grain" }],
  [/scanlines?|crt/i, { texture: "scanlines" }],
];

function briefToTokens(brief) {
  if (!brief) return { theme: null, tokens: {} };
  let theme = null;
  for (const [re, id] of VIBE) { if (re.test(brief)) { theme = id; break; } }
  const tokens = {};
  for (const [re, t] of VIBE_TOKENS) { if (re.test(brief)) Object.assign(tokens, t); }
  return { theme, tokens };
}

/* Merge: family default theme < STYLE.theme < brief deltas < explicit STYLE.tokens. */
function resolveTheme(style, familyDefaultTheme) {
  style = style || {};
  const brief = briefToTokens(style.brief);
  const baseId = style.theme || brief.theme || familyDefaultTheme || "vscode-dark";
  const base = THEMES[baseId] || THEMES["vscode-dark"];
  return { id: baseId, tokens: Object.assign({}, base, brief.tokens, style.tokens || {}) };
}

const TOKEN_VARS = {
  bg: "--bg", bg2: "--bg2", surface: "--surface", line: "--line", text: "--text",
  muted: "--muted", accent: "--accent", accent2: "--accent2", fontDisplay: "--font-display",
  fontBody: "--font-body", fontMono: "--font-mono", radius: "--radius", shadow: "--shadow",
};

function applyTheme(resolved) {
  const root = document.documentElement;
  const t = resolved.tokens || {};
  for (const k in TOKEN_VARS) if (t[k] != null) root.style.setProperty(TOKEN_VARS[k], t[k]);
  document.body.setAttribute("data-texture", t.texture || "none");
  document.body.setAttribute("data-theme", resolved.id || "");
}
