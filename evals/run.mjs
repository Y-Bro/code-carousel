#!/usr/bin/env node
/* ============================================================
   evals/run.mjs — deterministic eval harness for code-carousel.
   Zero dependencies. Run: node evals/run.mjs  (or npm run eval)

   Suites:
     1. renderer coverage — every family × every role -> non-empty,
        clean HTML (no "undefined" / "[object Object]")
     2. inference mapping — brief -> expected theme/accent
     3. theme resolution — family default / theme / tokens precedence
     4. example decks — family/theme valid, every role renderable
     5. constraints — <800 lines/file, no ES modules or deps in templates
   Exit 1 if any check fails.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = (...p) => path.join(ROOT, "templates", ...p);

let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log("  ✓ " + m); };
const bad = (m) => { fail++; console.error("  ✗ " + m); };
const section = (m) => console.log("\n" + m);

/* ---- load THEMES / FAMILIES / GENERIC + helpers from the engine ---- */
const src = fs.readFileSync(T("themes.js"), "utf8") + "\n" + fs.readFileSync(T("families.js"), "utf8") +
  "\nglobalThis.__e = { THEMES, FAMILIES, GENERIC, resolveTheme, briefToTokens };";
(0, eval)(src);
const { THEMES, FAMILIES, GENERIC, resolveTheme, briefToTokens } = globalThis.__e;

/* stub of the CC helper namespace app.js exposes (no DOM needed) */
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const CC = {
  esc, highlight: (x) => esc(x), gopher: () => "<svg></svg>", chip: (n) => `<span>${esc(n)}</span>`,
  codeBlock: () => "", contributorBar: () => "", sectionBadge: () => "", photoStickers: () => "", deckSlug: "eval",
};

const ROLES = ["cover", "statement", "list", "story", "gallery", "quote", "diagram", "finale"];
const SAMPLE = {
  title: "T", ext: ".go", eyebrow: "kick", subtitle: "sub", sub: "sub", author: "Author",
  contributors: ["Alice", "Bob"], file: "f.go", label: "lbl", section: { emoji: "📦", label: "intro" },
  heading: "Head", lead: "lead", body: ["one", "two"], msg: ["m"], footer: ["fo"],
  intro: "intro", items: [{ k: "a", v: "b" }], memories: [{ k: "a", v: "b" }], closing: "close", header: "hdr",
  beats: ["x", "y"], photos: [{ src: "p.jpg", cap: "c", cls: "wide" }], text: "quoted", quote: "quoted",
  attribution: "someone", svg: "<svg viewBox='0 0 10 10'></svg>", caption: "cap", legend: ["L1"],
  goodbye: "bye", signoff: "sg", lines: ["l1"], run: [{ t: "$ ", c: "go run", cls: "prompt" }],
};

/* ---- 1. renderer coverage (the 5 data-families + GENERIC) ---- */
section("1. renderer coverage (family × role)");
for (const famId of Object.keys(FAMILIES)) {
  const fam = FAMILIES[famId];
  let famOk = true;
  for (const role of ROLES) {
    let html = null;
    try { html = (fam.render && fam.render(role, SAMPLE, CC)); } catch (e) { bad(`${famId}/${role} threw: ${e.message}`); famOk = false; continue; }
    if (html == null) { try { html = GENERIC[role](SAMPLE, CC); } catch (e) { bad(`GENERIC/${role} threw: ${e.message}`); famOk = false; continue; } }
    if (typeof html !== "string" || !html.trim()) { bad(`${famId}/${role} produced empty output`); famOk = false; }
    else if (/undefined|\[object Object\]/.test(html)) { bad(`${famId}/${role} contains "undefined"/[object Object]`); famOk = false; }
  }
  if (famOk) ok(`${famId}: all ${ROLES.length} roles render cleanly`);
}
for (const role of ROLES) {
  const h = GENERIC[role] && GENERIC[role](SAMPLE, CC);
  if (typeof h === "string" && h.trim() && !/undefined|\[object Object\]/.test(h)) ok(`GENERIC.${role} renders`);
  else bad(`GENERIC.${role} missing or dirty`);
}

/* ---- 2. inference mapping ---- */
section("2. inference mapping (brief -> theme/accent)");
const briefCases = [
  ["dark synthwave, neon pink", "synthwave", "#ff4d8d"],
  ["warm nostalgic scrapbook", "paper", null],
  ["terminal hacker amber", "crt-amber", null],
  ["elegant magazine serif", "ink", null],
  ["clean minimal keynote", "daylight", null],
  ["sleek dark keynote", "midnight", null],
];
for (const [brief, theme, accent] of briefCases) {
  const r = briefToTokens(brief);
  if (r.theme === theme && (!accent || r.tokens.accent === accent)) ok(`"${brief}" -> ${theme}${accent ? " + " + accent : ""}`);
  else bad(`"${brief}" -> got ${r.theme}/${r.tokens.accent}, want ${theme}/${accent}`);
}
if (briefToTokens("").theme === null) ok("empty brief -> no theme"); else bad("empty brief should map to no theme");

/* ---- 3. theme resolution precedence ---- */
section("3. theme resolution precedence");
const r1 = resolveTheme({}, "ink");
r1.id === "ink" ? ok("family default applies when no theme") : bad(`default theme: got ${r1.id}`);
const r2 = resolveTheme({ theme: "midnight" }, "paper");
r2.id === "midnight" ? ok("explicit theme overrides family default") : bad(`explicit theme: got ${r2.id}`);
const r3 = resolveTheme({ tokens: { accent: "#abcdef" } }, "ink");
r3.tokens.accent === "#abcdef" ? ok("tokens override wins") : bad(`tokens override: got ${r3.tokens.accent}`);

/* ---- 4. example decks ---- */
section("4. example decks");
const LEGACY2ROLE = { cover: "cover", code: "statement", social: "list", origin: "story", gallery: "gallery", achievements: "list", finale: "finale" };
for (const f of fs.readdirSync(path.join(ROOT, "examples")).filter((f) => f.endsWith(".js"))) {
  const txt = fs.readFileSync(path.join(ROOT, "examples", f), "utf8");
  let STYLE = null, SLIDES;
  try { (0, eval)(txt + "\nglobalThis.__d={STYLE:(typeof STYLE!=='undefined'?STYLE:null),SLIDES};"); ({ STYLE, SLIDES } = globalThis.__d); }
  catch (e) { bad(`${f}: eval failed: ${e.message}`); continue; }
  const fam = (STYLE && STYLE.family) || "code-ide";
  const famOk = fam === "code-ide" || !!FAMILIES[fam];
  const themeOk = !(STYLE && STYLE.theme) || !!THEMES[STYLE.theme];
  const rolesOk = Array.isArray(SLIDES) && SLIDES.every((s) => {
    const role = s.role || LEGACY2ROLE[s.type] || "statement";
    return fam === "code-ide" || (FAMILIES[fam] && FAMILIES[fam].render) || !!GENERIC[role];
  });
  if (famOk && themeOk && rolesOk) ok(`${f} (${fam}, ${SLIDES.length} slides)`);
  else bad(`${f}: family=${famOk} theme=${themeOk} roles=${rolesOk}`);
}

/* ---- 5. constraints ---- */
section("5. constraints");
const codeFiles = [
  ...fs.readdirSync(path.join(ROOT, "templates")).map((f) => ["templates", f]),
  ...fs.readdirSync(path.join(ROOT, "examples")).map((f) => ["examples", f]),
];
let over = [], modules = [], deps = [];
for (const [d, f] of codeFiles) {
  const txt = fs.readFileSync(path.join(ROOT, d, f), "utf8");
  if (txt.split("\n").length > 800) over.push(`${d}/${f}`);
  if (/\.(js)$/.test(f) && /^\s*(import|export)\s/m.test(txt)) modules.push(`${d}/${f}`);
  if (/require\(|from\s+['"]https?:|cdn\.|unpkg|jsdelivr/.test(txt)) deps.push(`${d}/${f}`);
}
over.length ? bad(`files over 800 lines: ${over.join(", ")}`) : ok("all template/example files < 800 lines");
modules.length ? bad(`ES modules in deck files (break file://): ${modules.join(", ")}`) : ok("no ES modules in template/example JS");
deps.length ? bad(`external deps/CDN refs: ${deps.join(", ")}`) : ok("no external deps / CDN references");

/* ---- result ---- */
console.log(`\n${fail ? "RESULT: FAIL" : "RESULT: PASS"}  (${pass} passed, ${fail} failed)`);
process.exit(fail ? 1 : 0);
