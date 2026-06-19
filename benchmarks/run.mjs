#!/usr/bin/env node
/* ============================================================
   benchmarks/run.mjs — size + performance budget for a deck.
   Zero dependencies. Run: node benchmarks/run.mjs (npm run bench)

   Measures the shipped engine (what every deck loads):
     • raw + gzipped bytes per file
     • JS total vs 80 KB gzip budget, CSS total vs 15 KB gzip budget
       (microsite budgets from the project web-performance rules)
     • render micro-bench: build all slides of an example N times
   Exit 1 if over budget.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const T = (...p) => path.join(ROOT, "templates", ...p);
const KB = (n) => (n / 1024).toFixed(1) + " KB";
const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;

const ENGINE = ["index.html", "styles.css", "families.css", "themes.js", "families.js", "app.js"];
const JS_BUDGET = 80 * 1024, CSS_BUDGET = 15 * 1024;

let jsRaw = 0, jsGz = 0, cssRaw = 0, cssGz = 0, fail = false;
console.log("engine file sizes (raw / gzip):");
for (const f of ENGINE) {
  const buf = fs.readFileSync(T(f));
  const g = gz(buf);
  console.log(`  ${f.padEnd(14)} ${KB(buf.length).padStart(9)} / ${KB(g).padStart(8)}`);
  if (/\.js$/.test(f)) { jsRaw += buf.length; jsGz += g; }
  else if (/\.css$/.test(f)) { cssRaw += buf.length; cssGz += g; }
}

console.log("\nbudgets (gzipped):");
const line = (label, gzv, budget) => {
  const okk = gzv <= budget;
  if (!okk) fail = true;
  console.log(`  ${okk ? "✓" : "✗"} ${label.padEnd(12)} ${KB(gzv).padStart(8)} / ${KB(budget)} ${okk ? "" : "OVER BUDGET"}`);
};
line("JS", jsGz, JS_BUDGET);
line("CSS", cssGz, CSS_BUDGET);
console.log(`  total shipped: ${KB(jsRaw + cssRaw)} raw, ${KB(jsGz + cssGz)} gzip`);

/* ---- render micro-bench (no DOM: family + generic renderers) ---- */
const src = fs.readFileSync(T("themes.js"), "utf8") + "\n" + fs.readFileSync(T("families.js"), "utf8") +
  "\nglobalThis.__b = { FAMILIES, GENERIC };";
(0, eval)(src);
const { FAMILIES, GENERIC } = globalThis.__b;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const CC = { esc, highlight: esc, gopher: () => "<svg></svg>", chip: (n) => `<span>${esc(n)}</span>`, codeBlock: () => "", contributorBar: () => "", sectionBadge: () => "", photoStickers: () => "", deckSlug: "bench" };
const ROLES = ["cover", "statement", "list", "story", "gallery", "quote", "diagram", "finale"];
const S = { title: "T", heading: "H", body: ["a", "b"], items: [{ k: "a", v: "b" }], beats: ["x"], photos: [{ src: "p", cap: "c" }], text: "q", attribution: "w", svg: "<svg/>", lines: ["l"], goodbye: "bye", subtitle: "s", contributors: ["A"] };

console.log("\nrender micro-bench:");
const N = 5000;
for (const famId of Object.keys(FAMILIES)) {
  const fam = FAMILIES[famId];
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < N; i++) for (const role of ROLES) { const h = fam.render(role, S, CC); if (h == null) GENERIC[role](S, CC); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log(`  ${famId.padEnd(10)} ${(ms / N).toFixed(3)} ms / full deck (${ROLES.length} slides), ${N} runs`);
}

console.log(`\n${fail ? "RESULT: FAIL (over budget)" : "RESULT: PASS"}`);
process.exit(fail ? 1 : 0);
