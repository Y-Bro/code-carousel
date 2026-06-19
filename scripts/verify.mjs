#!/usr/bin/env node
/* ============================================================
   verify.mjs — application test for a code-carousel deck.
   Usage:  node verify.mjs <path/to/slides.js>

   Checks:
     • slides.js, app.js, themes.js, families.js pass `node --check`
     • STYLE.family is valid (code-ide or a FAMILIES id)
     • STYLE.theme (if set) resolves in THEMES
     • every slide's ROLE has a renderer (family override or GENERIC)
     • every referenced image (images[].src / photos[].src) exists
     • no sticker image is used more than once; warns on unused assets
   Prints a slide x role/image table. Exit 1 on any hard failure.
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
for (const f of ["slides.js", "app.js", "themes.js", "families.js"]) {
  const p = path.join(deckDir, f);
  if (!fs.existsSync(p)) { if (f === "slides.js") fail(`${f} not found`); else warn(`${f} not found (engine file)`); continue; }
  try { execFileSync("node", ["--check", p]); ok(`node --check ${f}`); }
  catch { fail(`syntax error in ${f}`); }
}

/* ---- 2. load THEMES / FAMILIES / GENERIC / STYLE / SLIDES ---- */
let THEMES = {}, FAMILIES = {}, GENERIC = {}, STYLE = null, SLIDES;
try {
  const read = (f) => { const p = path.join(deckDir, f); return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : ""; };
  const src = read("themes.js") + "\n" + read("families.js") + "\n" + fs.readFileSync(path.resolve(slidesPath), "utf8") +
    "\nglobalThis.__cc = {" +
    " THEMES: (typeof THEMES!=='undefined'?THEMES:{})," +
    " FAMILIES: (typeof FAMILIES!=='undefined'?FAMILIES:{})," +
    " GENERIC: (typeof GENERIC!=='undefined'?GENERIC:{})," +
    " STYLE: (typeof STYLE!=='undefined'?STYLE:null)," +
    " SLIDES: (typeof SLIDES!=='undefined'?SLIDES:undefined) };";
  (0, eval)(src);
  ({ THEMES, FAMILIES, GENERIC, STYLE, SLIDES } = globalThis.__cc);
} catch (e) {
  fail("could not evaluate deck data: " + e.message);
}
if (!Array.isArray(SLIDES)) { fail("SLIDES is not an array"); printResult(); }

/* ---- 3. style + theme validation ---- */
const style = STYLE || {};
const familyId = style.family || "code-ide";
const knownFamily = familyId === "code-ide" || !!FAMILIES[familyId];
if (knownFamily) ok(`family "${familyId}" is valid`);
else fail(`unknown family "${familyId}" (expected code-ide or ${Object.keys(FAMILIES).join(", ")})`);
if (style.theme) {
  if (THEMES[style.theme]) ok(`theme "${style.theme}" resolves`);
  else fail(`unknown theme "${style.theme}" (have: ${Object.keys(THEMES).join(", ")})`);
}

/* ---- 4. role coverage ---- */
const LEGACY2ROLE = { cover: "cover", code: "statement", social: "list", origin: "story", gallery: "gallery", achievements: "list", finale: "finale" };
const KNOWN_ROLES = new Set(["cover", "statement", "list", "story", "gallery", "quote", "finale"]);
const fam = FAMILIES[familyId];
const used = new Map();
const addRef = (src) => used.set(src, (used.get(src) || 0) + 1);

console.log(`\nslides: ${SLIDES.length}  ·  family: ${familyId}\n`);
SLIDES.forEach((s, i) => {
  const role = s.role || LEGACY2ROLE[s.type] || "statement";
  const renderable = familyId === "code-ide" || (fam && typeof fam.render === "function") || !!GENERIC[role];
  if (!KNOWN_ROLES.has(role)) warn(`slide ${i}: unusual role "${role}"`);
  if (!renderable) fail(`slide ${i}: no renderer for role "${role}" in family "${familyId}"`);
  (s.images || []).forEach((im) => addRef(im.src));
  (s.photos || []).forEach((p) => addRef(p.src));
  const refs = [...(s.images || []).map((im) => im.src), ...(s.photos || []).map((p) => p.src)].map((p) => path.basename(p));
  console.log(`  ${String(i).padStart(2)} ${role.padEnd(10)} ${s.file || s.label || s.title || ""}`);
  if (refs.length) console.log(`       ${refs.join(", ")}`);
});

/* ---- 5. image existence + duplicates ---- */
console.log("\nimage checks:");
let missing = 0, dupes = 0;
for (const [src, count] of used) {
  if (!fs.existsSync(path.join(deckDir, src))) { fail(`missing: ${src}`); missing++; }
  if (count > 1) { warn(`used ${count}x: ${src}`); dupes++; }
}
if (!used.size) ok("no images referenced");
else { if (!missing) ok("all referenced images exist"); if (!dupes) ok("no sticker reused"); }

/* ---- 6. unused files under assets/ (warning only) ---- */
const assetDirs = ["assets/gophers", "assets/photos"].map((d) => path.join(deckDir, d)).filter((d) => fs.existsSync(d));
const onDisk = assetDirs.flatMap((d) => fs.readdirSync(d).filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f)));
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
