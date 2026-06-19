#!/usr/bin/env node
/* ============================================================
   code-carousel CLI — zero dependencies.
     install            copy the skill into ~/.claude/skills/code-carousel
     new [dir]          scaffold a runnable deck (default ./my-deck)
     help               show usage
   Run straight from GitHub:
     npx github:Y-Bro/code-carousel install
     npx github:Y-Bro/code-carousel new my-deck
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // package root
const SKILL_ITEMS = ["SKILL.md", "README.md", "USAGE.md", "templates", "references", "scripts", "examples"];
const ENGINE = ["index.html", "styles.css", "families.css", "themes.js", "families.js", "app.js"];

function cp(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) cp(path.join(src, f), path.join(dst, f));
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

function install() {
  const dest = path.join(os.homedir(), ".claude", "skills", "code-carousel");
  let n = 0;
  for (const it of SKILL_ITEMS) {
    const s = path.join(ROOT, it);
    if (fs.existsSync(s)) { cp(s, path.join(dest, it)); n++; }
  }
  console.log(`✓ installed code-carousel (${n} items) -> ${dest}`);
  console.log(`  Restart Claude Code, then ask: "make a code-carousel deck from notes.txt".`);
}

function scaffold(dir) {
  const dest = path.resolve(dir || "my-deck");
  fs.mkdirSync(dest, { recursive: true });
  for (const f of ENGINE) cp(path.join(ROOT, "templates", f), path.join(dest, f));
  cp(path.join(ROOT, "examples", "hello-world.slides.js"), path.join(dest, "slides.js"));
  console.log(`✓ new deck -> ${dest}`);
  console.log(`  cd ${dir || "my-deck"} && open index.html   # then edit slides.js`);
  console.log(`  verify: node ${path.join(ROOT, "scripts", "verify.mjs")} ${path.join(dest, "slides.js")}`);
}

function help() {
  console.log(`code-carousel — themable slide-carousel skill for Claude Code

Usage:
  code-carousel install        Install the skill into ~/.claude/skills/code-carousel
  code-carousel new [dir]      Scaffold a runnable deck (default ./my-deck)
  code-carousel help           Show this help

Via npx (no install needed):
  npx github:Y-Bro/code-carousel install
  npx github:Y-Bro/code-carousel new my-deck`);
}

const cmd = process.argv[2];
if (cmd === "install") install();
else if (cmd === "new") scaffold(process.argv[3]);
else if (cmd === "help" || cmd === "--help" || cmd === "-h" || !cmd) help();
else { console.error(`unknown command: ${cmd}\n`); help(); process.exit(1); }
