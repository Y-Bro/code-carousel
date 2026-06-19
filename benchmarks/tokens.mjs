#!/usr/bin/env node
/* ============================================================
   benchmarks/tokens.mjs — token-footprint analyzer.
   Zero dependencies. Run: node benchmarks/tokens.mjs (npm run tokens)

   The token cost of USING this skill splits in two:
     • READ footprint  — what Claude must ingest to drive the skill:
       SKILL.md + references/reference.md + templates/slides.example.js
       (kept small on purpose). This is the number to optimize.
     • COPY footprint  — the engine files. These are COPIED verbatim
       into a deck, never read into context — so they cost ~0 tokens
       if you follow the skill's "copy, don't read" rule.

   ~tokens estimated at chars/4 (good enough for budgeting).
   Exit 1 if the read footprint exceeds the budget.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const toks = (s) => Math.ceil(s.length / 4);
const fmt = (n) => n.toLocaleString("en-US");
const read = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), "utf8"); } catch { return ""; } };

const READ = ["SKILL.md", "references/reference.md", "templates/slides.example.js"];
const COPY = ["templates/index.html", "templates/styles.css", "templates/families.css",
  "templates/themes.js", "templates/families.js", "templates/app.js"];
const READ_BUDGET = 8000; // ~tokens Claude should need to operate the skill

function report(label, files) {
  let total = 0;
  console.log(`\n${label}:`);
  for (const f of files) {
    const t = toks(read(f));
    total += t;
    console.log(`  ${f.padEnd(34)} ~${fmt(t).padStart(6)} tok`);
  }
  console.log(`  ${"SUBTOTAL".padEnd(34)} ~${fmt(total).padStart(6)} tok`);
  return total;
}

const readTotal = report("READ footprint  (ingested every time the skill is used)", READ);
const copyTotal = report("COPY footprint  (copied verbatim — ~0 tokens if not read)", COPY);

console.log(`\noptimization notes:`);
console.log(`  • Engine = ~${fmt(copyTotal)} tok IF read. Don't — copy it. SKILL.md enforces this.`);
console.log(`  • Operating the skill costs ~${fmt(readTotal)} tok (the READ footprint), not ~${fmt(readTotal + copyTotal)}.`);

const okk = readTotal <= READ_BUDGET;
console.log(`\n  ${okk ? "✓" : "✗"} read footprint ~${fmt(readTotal)} / ${fmt(READ_BUDGET)} budget`);
console.log(`\n${okk ? "RESULT: PASS" : "RESULT: FAIL (read footprint over budget — trim SKILL.md / reference.md)"}`);
process.exit(okk ? 0 : 1);
