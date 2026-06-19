/* ============================================================
   families.js — STYLE FAMILY layer for code-carousel.
   Declares two globals consumed by app.js:
     GENERIC  — role -> family-neutral renderer (semantic markup,
                skinned per family by families.css). The fallback.
     FAMILIES — id -> { label, theme, render(role, slide, CC) }.
                A family's render returns HTML for a role, or null
                to fall back to GENERIC[role].
   (The code-ide family is registered by app.js itself, reusing the
   original editor-card renderers so legacy decks render identically.)
   Plain <script> globals — NOT ES modules (must work on file://).
   ============================================================ */

const toArr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const finaleLines = (s) =>
  s.lines ? toArr(s.lines) : s.run ? s.run.map((r) => r.c).filter(Boolean) : toArr(s.body);

function metaTop(s, E) {
  const bits = [];
  if (s.label || s.file) bits.push(`<span class="gx-file">${E(s.label || s.file)}</span>`);
  if (s.section) bits.push(`<span class="gx-section">${s.section.emoji || ""} ${E(s.section.label || "")}</span>`);
  return bits.length ? `<div class="gx-meta">${bits.join("")}</div>` : "";
}
function contribRow(s, CC) {
  if (!s.contributors || !s.contributors.length) return "";
  return `<div class="gx-contrib">${s.contributors.map(CC.chip).join("")}</div>`;
}
function photoFigs(s, E) {
  return (s.photos || []).map((p, i) =>
    `<figure class="gx-photo ${p.cls || ""}" style="--i:${i}"><img src="${E(p.src)}" loading="lazy" decoding="async" alt="${E(p.cap)}"><figcaption>${E(p.cap)}</figcaption></figure>`
  ).join("");
}

/* ---------- GENERIC role renderers (semantic, family-neutral) ---------- */
const GENERIC = {
  cover(s, CC) {
    const E = CC.esc;
    return `<div class="gx gx-cover">
      ${s.eyebrow || s.kicker ? `<p class="gx-kicker">${E(s.eyebrow || s.kicker)}</p>` : ""}
      <h1 class="gx-title">${E(s.title || s.heading || "")}${s.ext ? `<span class="gx-ext">${E(s.ext)}</span>` : ""}</h1>
      ${s.subtitle || s.sub ? `<p class="gx-sub">${E(s.subtitle || s.sub)}</p>` : ""}
      ${s.author ? `<p class="gx-by">by ${E(s.author)}</p>` : ""}
      ${contribRow(s, CC)}
    </div>`;
  },
  statement(s, CC) {
    const E = CC.esc;
    const body = toArr(s.body || s.msg).map((l) => `<p>${E(l)}</p>`).join("");
    return `<div class="gx gx-statement">
      ${metaTop(s, E)}
      ${s.heading || s.lead ? `<h2 class="gx-heading">${E(s.heading || s.lead)}</h2>` : ""}
      <div class="gx-body">${body}</div>
      ${s.footer ? `<p class="gx-foot">${toArr(s.footer).map(E).join(" · ")}</p>` : ""}
      ${contribRow(s, CC)}
    </div>`;
  },
  list(s, CC) {
    const E = CC.esc;
    const items = (s.items || s.memories || []).map((it, i) =>
      `<li style="--i:${i}"><span class="gx-k">${E(it.k)}</span><span class="gx-v">${E(it.v)}</span></li>`).join("");
    return `<div class="gx gx-list">
      ${metaTop(s, E)}
      ${s.heading || s.header ? `<h2 class="gx-heading">${E(s.heading || s.header)}</h2>` : ""}
      ${s.intro ? `<p class="gx-intro">${E(s.intro)}</p>` : ""}
      <ul class="gx-items">${items}</ul>
      ${s.closing ? `<p class="gx-closing">${E(s.closing)}</p>` : ""}
      ${contribRow(s, CC)}
    </div>`;
  },
  story(s, CC) {
    const E = CC.esc;
    const beats = toArr(s.beats).map((b, i) => `<li style="--i:${i}">${E(b)}</li>`).join("");
    return `<div class="gx gx-story">
      ${metaTop(s, E)}
      ${s.heading || s.header ? `<h2 class="gx-heading">${E(s.heading || s.header)}</h2>` : ""}
      ${s.intro ? `<p class="gx-intro">${E(s.intro)}</p>` : ""}
      <ol class="gx-beats">${beats}</ol>
    </div>`;
  },
  gallery(s, CC) {
    const E = CC.esc;
    return `<div class="gx gx-gallery">
      ${s.heading || s.header ? `<h2 class="gx-heading">${E(s.heading || s.header)}</h2>` : ""}
      ${s.intro ? `<p class="gx-intro">${E(s.intro)}</p>` : ""}
      <div class="gx-photos">${photoFigs(s, E)}</div>
    </div>`;
  },
  quote(s, CC) {
    const E = CC.esc;
    return `<div class="gx gx-quote">
      <blockquote>${E(s.text || s.quote || s.heading || "")}</blockquote>
      ${s.attribution || s.author ? `<cite>— ${E(s.attribution || s.author)}</cite>` : ""}
    </div>`;
  },
  diagram(s, CC) {
    const E = CC.esc;
    const canvas = s.svg
      ? `<div class="gx-diagram-canvas">${s.svg}</div>` // raw inline SVG (author-trusted)
      : s.src
        ? `<div class="gx-diagram-canvas"><img src="${E(s.src)}" loading="lazy" decoding="async" alt="${E(s.caption || s.heading || "diagram")}"></div>`
        : s.mermaid
          ? `<pre class="mermaid gx-diagram-canvas">${E(s.mermaid)}</pre>` // rendered if mermaid.js present, else source
          : `<div class="gx-diagram-canvas gx-diagram-empty">no diagram source (set svg, src, or mermaid)</div>`;
    const legend = (s.legend || []).map((l) => `<li>${E(l)}</li>`).join("");
    return `<div class="gx gx-diagram">
      ${s.heading ? `<h2 class="gx-heading">${E(s.heading)}</h2>` : ""}
      ${s.intro ? `<p class="gx-intro">${E(s.intro)}</p>` : ""}
      ${canvas}
      ${s.caption ? `<p class="gx-foot">${E(s.caption)}</p>` : ""}
      ${legend ? `<ul class="gx-legend">${legend}</ul>` : ""}
    </div>`;
  },
  finale(s, CC) {
    const E = CC.esc;
    const lines = finaleLines(s).map((l) => `<p>${E(l)}</p>`).join("");
    return `<div class="gx gx-finale">
      <h2 class="gx-goodbye">${E(s.goodbye || s.heading || "Thank you")}</h2>
      <div class="gx-finale-lines">${lines}</div>
      ${s.signoff ? `<p class="gx-signoff">${E(s.signoff)}</p>` : ""}
    </div>`;
  },
};

/* ---------- TERMINAL family helper ---------- */
function termWindow(title, body, slug) {
  return `<div class="term-card">
    <div class="term-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="term-title">zsh — ${slug} — ${title}</span></div>
    <pre class="term-out">${body}</pre>
  </div>`;
}

/* ---------- FAMILIES registry ---------- */
const FAMILIES = {
  terminal: {
    label: "Terminal / CRT",
    theme: "crt-green",
    render(role, s, CC) {
      const E = CC.esc, slug = CC.deckSlug;
      const P = (cmd) => `<span class="t-prompt">$ </span><span class="t-cmd">${E(cmd)}</span>`;
      if (role === "cover") {
        const sub = s.subtitle || s.sub ? `\n<span class="t-dim"># ${E(s.subtitle || s.sub)}</span>` : "";
        const body = `${P("./" + (s.title || "deck") + (s.ext || ".sh"))}\n\n<span class="t-ok">>> ${E(s.title || s.heading || "")}</span>${sub}\n<span class="t-dim">press → to continue</span>`;
        return termWindow("login", body, slug);
      }
      if (role === "statement") {
        const out = toArr(s.body || s.msg).map((l) => `<span class="t-line">${E(l)}</span>`).join("\n");
        const head = s.heading || s.lead || "";
        return termWindow("run", `${P('echo "' + head + '"')}\n\n<span class="t-ok">${E(head)}</span>\n${out}`, slug);
      }
      if (role === "list") {
        const items = (s.items || s.memories || []).map((it) => `<span class="t-line"><span class="t-key">${E(it.k)}</span>  ${E(it.v)}</span>`).join("\n");
        return termWindow("ls", `${P("ls -la " + (s.heading || "memories") + "/")}\n\n${items}`, slug);
      }
      if (role === "story") {
        const beats = toArr(s.beats).map((b, i) => `<span class="t-line"><span class="t-key">${("000" + (i + 1)).slice(-4)}</span>  ${E(b)}</span>`).join("\n");
        return termWindow("log", `${P("git log --oneline " + (s.heading || ""))}\n\n${beats}`, slug);
      }
      if (role === "finale") {
        const lines = finaleLines(s).map((l) => `<span class="t-ok">${E(l)}</span>`).join("\n");
        return termWindow("exit", `${P("./goodbye")}\n\n${lines}\n<span class="t-line">${E(s.goodbye || "Thanks, friend")} ❤</span>\n${s.signoff ? `<span class="t-dim">${E(s.signoff)}</span>\n` : ""}<span class="t-prompt">$ </span><span class="t-cursor"></span>`, slug);
      }
      return null;
    },
  },

  editorial: {
    label: "Editorial / Magazine",
    theme: "ink",
    render(role, s, CC) {
      const E = CC.esc;
      if (role === "cover") {
        return `<div class="ed-cover">
          ${s.eyebrow || s.kicker ? `<p class="ed-kicker">${E(s.eyebrow || s.kicker)}</p>` : ""}
          <h1 class="ed-headline">${E(s.title || s.heading || "")}</h1>
          ${s.subtitle || s.sub ? `<p class="ed-standfirst">${E(s.subtitle || s.sub)}</p>` : ""}
          ${s.author ? `<p class="ed-byline">Words by ${E(s.author)}</p>` : ""}
        </div>`;
      }
      if (role === "statement") {
        const paras = toArr(s.body || s.msg);
        const first = paras.length ? `<p class="ed-drop">${E(paras[0])}</p>` : "";
        const rest = paras.slice(1).map((p) => `<p>${E(p)}</p>`).join("");
        const pull = s.heading || s.lead ? `<aside class="ed-pull">${E(s.heading || s.lead)}</aside>` : "";
        return `<article class="ed-article">${metaTop(s, E)}${pull}<div class="ed-cols">${first}${rest}</div>${contribRow(s, CC)}</article>`;
      }
      if (role === "quote") {
        return `<div class="ed-quote"><blockquote>“${E(s.text || s.quote || s.heading || "")}”</blockquote>${s.attribution || s.author ? `<cite>— ${E(s.attribution || s.author)}</cite>` : ""}</div>`;
      }
      if (role === "finale") {
        const lines = finaleLines(s).map((l) => `<p>${E(l)}</p>`).join("");
        return `<div class="ed-finale"><h2 class="ed-headline">${E(s.goodbye || s.heading || "Fin.")}</h2><div class="ed-cols">${lines}</div>${s.signoff ? `<p class="ed-byline">${E(s.signoff)}</p>` : ""}</div>`;
      }
      return null;
    },
  },

  scrapbook: {
    label: "Scrapbook / Polaroid",
    theme: "paper",
    render(role, s, CC) {
      const E = CC.esc;
      if (role === "cover") {
        return `<div class="sb-cover">
          <div class="sb-polaroid sb-tilt"><div class="sb-photo">${CC.gopher("photo")}</div><span class="sb-cap">${E(s.subtitle || s.sub || "the beginning")}</span></div>
          <div class="sb-title-wrap"><h1 class="sb-title">${E(s.title || s.heading || "")}</h1>${s.author ? `<p class="sb-by">— ${E(s.author)}</p>` : ""}</div>
        </div>`;
      }
      if (role === "story") {
        const beats = toArr(s.beats).map((b, i) => `<li style="--i:${i}"><span class="sb-pin"></span>${E(b)}</li>`).join("");
        return `<div class="sb-card sb-paper">${s.heading || s.header ? `<h2 class="sb-h">${E(s.heading || s.header)}</h2>` : ""}${s.intro ? `<p class="sb-intro">${E(s.intro)}</p>` : ""}<ul class="sb-beats">${beats}</ul></div>`;
      }
      if (role === "finale") {
        const lines = finaleLines(s).map((l) => `<p>${E(l)}</p>`).join("");
        return `<div class="sb-card sb-note sb-tilt-2"><h2 class="sb-title">${E(s.goodbye || s.heading || "with love")}</h2><div class="sb-note-body">${lines}</div>${s.signoff ? `<p class="sb-sign">${E(s.signoff)}</p>` : ""}</div>`;
      }
      return null; /* list, gallery, statement, quote -> generic, skinned by .fam-scrapbook */
    },
  },

  keynote: {
    label: "Keynote / Minimal",
    theme: "midnight",
    render(role, s, CC) {
      const E = CC.esc;
      if (role === "cover") {
        return `<div class="kn-cover">
          ${s.eyebrow || s.kicker ? `<p class="kn-kicker">${E(s.eyebrow || s.kicker)}</p>` : ""}
          <h1 class="kn-title">${E(s.title || s.heading || "")}</h1>
          ${s.subtitle || s.sub ? `<p class="kn-sub">${E(s.subtitle || s.sub)}</p>` : ""}
        </div>`;
      }
      if (role === "statement") {
        const body = toArr(s.body || s.msg).map((l) => `<p class="kn-body">${E(l)}</p>`).join("");
        return `<div class="kn-statement"><h2 class="kn-big">${E(s.heading || s.lead || "")}</h2>${body}</div>`;
      }
      if (role === "finale") {
        return `<div class="kn-cover"><h1 class="kn-title">${E(s.goodbye || s.heading || "Thank you")}</h1>${s.signoff ? `<p class="kn-sub">${E(s.signoff)}</p>` : ""}</div>`;
      }
      return null; /* list/quote/story/gallery -> generic, skinned by .fam-keynote */
    },
  },

  chat: {
    label: "Chat / Thread",
    theme: "messenger",
    render(role, s, CC) {
      const E = CC.esc;
      const inB = (who, txt, react) =>
        `<div class="ch-row in"><div class="ch-bubble in">${who ? `<span class="ch-who">${E(who)}</span>` : ""}${E(txt)}${react ? `<span class="ch-react">${E(react)}</span>` : ""}</div></div>`;
      const outB = (txt) => `<div class="ch-row out"><div class="ch-bubble out">${E(txt)}</div></div>`;
      const wrap = (title, rows) => `<div class="ch-card"><div class="ch-head"><span class="ch-avatar"></span><span class="ch-name">${E(title)}</span><span class="ch-status">online</span></div><div class="ch-thread">${rows}</div></div>`;
      if (role === "cover") {
        const rows = inB("", s.title || s.heading || "") + (s.subtitle || s.sub ? outB(s.subtitle || s.sub) : "");
        return wrap(s.eyebrow || s.kicker || s.deck || "group chat", rows);
      }
      if (role === "statement") {
        const rows = inB(s.author || "", s.heading || s.lead || "", s.react) + toArr(s.body || s.msg).map((l) => outB(l)).join("");
        return wrap(s.label || s.file || "thread", rows);
      }
      if (role === "list") {
        const rows = (s.items || s.memories || []).map((it) => inB(it.k, it.v)).join("");
        return wrap(s.heading || s.header || "thread", rows);
      }
      if (role === "story") {
        const rows = toArr(s.beats).map((b, i) => (i % 2 ? outB(b) : inB("", b))).join("");
        return wrap(s.heading || s.header || "thread", rows);
      }
      if (role === "quote") {
        return wrap(s.attribution || s.author || "quote", inB(s.attribution || s.author || "", s.text || s.quote || ""));
      }
      if (role === "finale") {
        const rows = finaleLines(s).map((l) => inB("", l)).join("") +
          `<div class="ch-row in"><div class="ch-bubble in ch-typing"><span></span><span></span><span></span></div></div>` +
          outB((s.goodbye || "Thanks, friend") + " ❤") + (s.signoff ? `<div class="ch-sign">${E(s.signoff)}</div>` : "");
        return wrap(s.label || "goodbye", rows);
      }
      return null; /* gallery -> generic */
    },
  },
};
