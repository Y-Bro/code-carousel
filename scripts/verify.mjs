#!/usr/bin/env node
/* ============================================================
   verify.mjs — application test for a code-carousel deck.
   Usage:  node verify.mjs <path/to/slides.js>

   Checks:
     • slides.js + app.js pass `node --check`
     • every image referenced by a slide (images[].src / photos[].src)
       exists on disk
     • no referenced image is used more than once (stickers)
     • no image file under assets/ is left unused (warning)
   Prints a slide x image table. Exit code 1 on any hard failure.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const slidesPath = process.argv[2];
if (!slidesPath) {
  console.error("usage: node verify.mjs <path/to/slides.js>");
  process.exit(2);
}
const deckDir = path.dirname(path.resolve(slidesPath));

let hardFail = false;
const fail = (m) => { console.error("  ✗ " + m); hardFail = true; };
const warn = (m) => console.warn("  ! " + m);
const ok   = (m) => console.log("  ✓ " + m);

/* ---- 1. node --check on the deck's JS ---- */
for (const f of ["slides.js", "app.js"]) {
  const p = path.join(deckDir, f);
  if (!fs.existsSync(p)) { if (f === "slides.js") fail(`${f} not found`); continue; }
  try { execFileSync("node", ["--check", p]); ok(`node --check ${f}`); }
  catch { fail(`syntax error in ${f}`); }
}

/* ---- 2. load SLIDES from slides.js ---- */
let SLIDES;
try {
  const src = fs.readFileSync(path.resolve(slidesPath), "utf8");
  // slides.js declares `const SLIDES` (+ optional SLIDE_IMAGES post-process).
  (0, eval)(src + "\nglobalThis.__SLIDES = SLIDES;");
  SLIDES = globalThis.__SLIDES;
} catch (e) {
  fail("could not evaluate slides.js: " + e.message);
}
if (!Array.isArray(SLIDES)) { fail("SLIDES is not an array"); printResult(); }

/* ---- 3. collect referenced images + map them ---- */
const used = new Map(); // src -> count
const addRef = (src) => used.set(src, (used.get(src) || 0) + 1);

console.log(`\nslides: ${SLIDES.length}\n`);
SLIDES.forEach((s, i) => {
  const stickers = (s.images || []).map((im) => im.src);
  const photos   = (s.photos || []).map((p) => p.src);
  [...stickers, ...photos].forEach(addRef);
  const label = (s.type || "code").padEnd(12);
  const refs  = [...stickers, ...photos].map((p) => path.basename(p));
  console.log(`  ${String(i).padStart(2)} ${label} ${s.file || ""}`);
  if (refs.length) console.log(`       ${refs.join(", ")}`);
});

/* ---- 4. existence + duplicate checks ---- */
console.log("\nimage checks:");
let missing = 0, dupes = 0;
for (const [src, count] of used) {
  if (!fs.existsSync(path.join(deckDir, src))) { fail(`missing: ${src}`); missing++; }
  if (count > 1) { warn(`used ${count}x: ${src}`); dupes++; }
}
if (!missing) ok("all referenced images exist");
if (!dupes)   ok("no sticker reused");

/* ---- 5. unused files under assets/ (warning only) ---- */
const assetDirs = ["assets/gophers", "assets/photos"]
  .map((d) => path.join(deckDir, d))
  .filter((d) => fs.existsSync(d));
const onDisk = assetDirs.flatMap((d) =>
  fs.readdirSync(d).filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f)));
const usedNames = new Set([...used.keys()].map((p) => path.basename(p)));
const unused = onDisk.filter((f) => !usedNames.has(f));
if (onDisk.length) {
  if (unused.length) warn(`unused asset files (${unused.length}): ${unused.join(", ")}`);
  else ok(`all ${onDisk.length} asset files used`);
}

printResult();

function printResult() {
  console.log("\n" + (hardFail ? "RESULT: FAIL" : "RESULT: PASS"));
  process.exit(hardFail ? 1 : 0);
}
