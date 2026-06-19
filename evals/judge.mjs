#!/usr/bin/env node
/* ============================================================
   evals/judge.mjs — OPTIONAL LLM-as-judge quality eval.
   Zero dependencies (native fetch). Run: node evals/judge.mjs
   (or npm run eval:judge). Requires ANTHROPIC_API_KEY; if unset,
   it skips cleanly (exit 0) so CI without a key still passes.

   For each example deck it extracts the slide text and asks the
   model to score, as JSON:
     coherence (1-5), tone_fit (1-5), invented_red_flags (bool), note
   Fails (exit 1) only if a deck scores < 3 or invented_red_flags.
   Pair with evals/run.mjs (deterministic) for full coverage.
   ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.JUDGE_MODEL || "claude-haiku-4-5";

if (!KEY) {
  console.log("evals/judge.mjs: skipped (set ANTHROPIC_API_KEY to enable the LLM judge).");
  process.exit(0);
}

/* extract human-readable slide text from a deck (no engine eval needed) */
function deckText(file) {
  let SLIDES, STYLE = null;
  const txt = fs.readFileSync(file, "utf8");
  (0, eval)(txt + "\nglobalThis.__j={SLIDES,STYLE:(typeof STYLE!=='undefined'?STYLE:null)};");
  ({ SLIDES, STYLE } = globalThis.__j);
  const pick = (s) => [s.title, s.eyebrow, s.subtitle, s.heading, s.lead, s.intro, s.text, s.caption,
    ...(s.body || []), ...(s.beats || []), ...(s.lines || []), ...(s.items || s.memories || []).map((i) => `${i.k}: ${i.v}`),
    s.goodbye, s.signoff].filter(Boolean).join(" | ");
  return { family: (STYLE && STYLE.family) || "code-ide", text: SLIDES.map((s, i) => `[${i} ${s.role || s.type || "?"}] ${pick(s)}`).join("\n") };
}

async function judge(name, family, text) {
  const prompt = `You are scoring a slide deck (style family: "${family}"). Here are the slides:\n\n${text}\n\n` +
    `Score it as STRICT JSON only, no prose:\n` +
    `{"coherence":1-5,"tone_fit":1-5,"invented_red_flags":true|false,"note":"one short sentence"}\n` +
    `coherence = does it read as one coherent deck; tone_fit = does the content suit the "${family}" style; ` +
    `invented_red_flags = true only if it looks like it fabricated specific names/quotes/numbers that read as real people/facts.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: 256, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const raw = (data.content || []).map((c) => c.text || "").join("");
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("no JSON in response: " + raw.slice(0, 120));
  return JSON.parse(m[0]);
}

const files = fs.readdirSync(path.join(ROOT, "examples")).filter((f) => f.endsWith(".js"));
let fail = false;
console.log(`LLM judge (${MODEL}) — ${files.length} decks\n`);
for (const f of files) {
  try {
    const { family, text } = deckText(path.join(ROOT, "examples", f));
    const v = await judge(f, family, text);
    const bad = v.coherence < 3 || v.tone_fit < 3 || v.invented_red_flags;
    if (bad) fail = true;
    console.log(`  ${bad ? "✗" : "✓"} ${f.padEnd(34)} coherence=${v.coherence} tone=${v.tone_fit} invented=${v.invented_red_flags}`);
    console.log(`      ${v.note}`);
  } catch (e) {
    fail = true;
    console.error(`  ✗ ${f}: ${e.message}`);
  }
}
console.log(`\n${fail ? "RESULT: FAIL" : "RESULT: PASS"}`);
process.exit(fail ? 1 : 0);
