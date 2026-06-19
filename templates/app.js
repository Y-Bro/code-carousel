/* ============================================================
   Code Carousel — engine (v3, themable + multi-family)
   - resolves STYLE { family, theme, brief, tokens } and applies theme tokens
   - dispatches each slide by its semantic ROLE to the active style family
   - code-ide family renderers are preserved verbatim (legacy decks render
     identically); other families live in families.js, generic fallbacks too
   - minimal Go syntax highlighter + gopher SVG factory (code-ide helpers)
   ============================================================ */

(() => {
  "use strict";

  const track    = document.getElementById("track");
  const stage    = document.getElementById("stage");
  const dotsWrap = document.getElementById("dots");
  const floaters = document.getElementById("floaters");
  const overlay  = document.getElementById("transition");
  const overBody = document.getElementById("transition-body");
  const sbFile   = document.getElementById("sb-file");
  const sbCount  = document.getElementById("sb-count");
  const sbCommit = document.getElementById("sb-commit");
  const sbPos    = document.getElementById("sb-pos");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Style / theme resolution ---------- */
  const cfg = (typeof STYLE !== "undefined" && STYLE) ? STYLE : {};
  const familyId = cfg.family || "code-ide";
  const fam = (typeof FAMILIES !== "undefined" && FAMILIES[familyId]) ? FAMILIES[familyId] : null;
  const famDefaultTheme = fam ? fam.theme : "vscode-dark";
  applyTheme(resolveTheme(cfg, famDefaultTheme));
  const deckSlug = cfg.slug || cfg.deck || "code-carousel";
  document.body.className = `fam-${familyId}`;

  /* ---------- Go syntax highlighter (code-ide) ---------- */
  const KEYWORDS = new Set([
    "package", "import", "func", "type", "struct", "interface",
    "var", "const", "return", "go", "chan", "map", "defer", "select",
    "true", "false", "nil", "string", "int", "bool", "error", "byte", "float64",
  ]);
  const CONTROL = new Set(["if", "else", "for", "range", "switch", "case", "break", "continue", "panic"]);

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function highlight(line) {
    const escaped = esc(line);
    if (/^\s*\/\//.test(line)) return `<span class="t-comment">${escaped}</span>`;
    const re = /(&quot;(?:[^&]|&(?!quot;))*&quot;)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|\b([A-Za-z_]\w*)\b/g;
    return escaped.replace(re, (m, str, num, fn, word) => {
      if (str) return `<span class="t-string">${str}</span>`;
      if (num) return `<span class="t-number">${num}</span>`;
      if (fn) {
        if (KEYWORDS.has(fn)) return `<span class="t-keyword">${fn}</span>`;
        if (CONTROL.has(fn))  return `<span class="t-control">${fn}</span>`;
        return `<span class="t-func">${fn}</span>`;
      }
      if (word) {
        if (KEYWORDS.has(word)) return `<span class="t-keyword">${word}</span>`;
        if (CONTROL.has(word))  return `<span class="t-control">${word}</span>`;
        if (/^[A-Z]/.test(word)) return `<span class="t-type">${word}</span>`;
        return word;
      }
      return m;
    });
  }

  /* ---------- Gopher SVG (mood-aware) ---------- */
  function gopherBody() {
    return `
  <ellipse cx="60" cy="132" rx="34" ry="6" fill="rgba(0,0,0,0.25)"/>
  <ellipse cx="34" cy="20" rx="9" ry="13" fill="#69d0e5"/>
  <ellipse cx="86" cy="20" rx="9" ry="13" fill="#69d0e5"/>
  <ellipse cx="34" cy="21" rx="4.5" ry="7" fill="#3a99b5"/>
  <ellipse cx="86" cy="21" rx="4.5" ry="7" fill="#3a99b5"/>
  <rect x="22" y="24" width="76" height="92" rx="38" fill="#7ad3e8"/>
  <rect x="22" y="24" width="76" height="92" rx="38" fill="url(#gbody)" opacity="0.25"/>
  <ellipse cx="60" cy="84" rx="26" ry="30" fill="#cdeef6"/>`;
  }
  function gopherFace(mood) {
    const brow = mood === "confused" ? `<path d="M38 32 l16 -4" stroke="#2a2a2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : "";
    const glasses = (mood === "mascot" || mood === "debuggod")
      ? `<g fill="none" stroke="#1b1b1b" stroke-width="2"><circle cx="46" cy="46" r="13"/><circle cx="74" cy="46" r="13"/><line x1="59" y1="46" x2="61" y2="46"/></g>` : "";
    return `
  <circle cx="46" cy="46" r="17" fill="#fff"/>
  <circle cx="74" cy="46" r="17" fill="#fff"/>
  <circle cx="50" cy="48" r="6.5" fill="#1b1b1b"/>
  <circle cx="70" cy="48" r="6.5" fill="#1b1b1b"/>
  <circle cx="52" cy="46" r="2" fill="#fff"/>
  <circle cx="72" cy="46" r="2" fill="#fff"/>
  ${brow}
  <ellipse cx="60" cy="60" rx="4.5" ry="3.4" fill="#2a2a2a"/>
  <rect x="55" y="63" width="10" height="9" rx="2" fill="#fff" stroke="#cfcfcf" stroke-width="0.8"/>
  <line x1="60" y1="63" x2="60" y2="72" stroke="#cfcfcf" stroke-width="0.8"/>
  ${glasses}`;
  }
  function gopherLimbs() {
    return `
  <ellipse cx="20" cy="80" rx="7" ry="13" fill="#7ad3e8" transform="rotate(18 20 80)"/>
  <ellipse cx="100" cy="80" rx="7" ry="13" fill="#7ad3e8" transform="rotate(-18 100 80)"/>
  <ellipse cx="46" cy="120" rx="11" ry="7" fill="#e8b96b"/>
  <ellipse cx="74" cy="120" rx="11" ry="7" fill="#e8b96b"/>`;
  }
  function gopherProp(mood) {
    switch (mood) {
      case "teacher":
        return `<g><polygon points="60,2 90,12 60,22 30,12" fill="#222"/><rect x="52" y="12" width="16" height="7" fill="#333"/><line x1="90" y1="12" x2="92" y2="26" stroke="#f4c430" stroke-width="2"/><circle cx="92" cy="27" r="2.5" fill="#f4c430"/></g>`;
      case "detective":
        return `<g transform="translate(96 92) rotate(20)"><circle r="11" fill="none" stroke="#9b6a3c" stroke-width="4"/><circle r="9" fill="rgba(140,210,230,0.35)"/><rect x="7" y="7" width="5" height="16" rx="2" fill="#6b4322" transform="rotate(45 9 9)"/></g>`;
      case "prompt":
        return `<g><rect x="40" y="74" width="40" height="44" rx="3" fill="#f3efe2" stroke="#c9c2ab" stroke-width="1.5"/><line x1="46" y1="84" x2="74" y2="84" stroke="#b9b29a" stroke-width="2"/><line x1="46" y1="92" x2="74" y2="92" stroke="#b9b29a" stroke-width="2"/><line x1="46" y1="100" x2="68" y2="100" stroke="#b9b29a" stroke-width="2"/><line x1="46" y1="108" x2="72" y2="108" stroke="#b9b29a" stroke-width="2"/></g>`;
      case "rocket":
        return `<g><path d="M48 124 q-6 14 12 22 q18 -8 12 -22 q-6 8 -12 4 q-6 4 -12 -4z" fill="#ff8a3d"/><path d="M52 126 q-3 9 8 14 q11 -5 8 -14 q-4 5 -8 2 q-4 3 -8 -2z" fill="#ffd23d"/></g>`;
      case "confused":
        return `<g><text x="92" y="30" font-family="JetBrains Mono, monospace" font-size="30" font-weight="700" fill="#f4c430">?</text></g>`;
      case "award":
        return `<g transform="translate(94 86)"><path d="M-7 -8 h14 v5 a7 7 0 0 1 -14 0 z" fill="#f4c430"/><path d="M-9 -8 a4 4 0 0 0 4 4" fill="none" stroke="#f4c430" stroke-width="2"/><path d="M9 -8 a4 4 0 0 1 -4 4" fill="none" stroke="#f4c430" stroke-width="2"/><rect x="-2" y="-1" width="4" height="6" fill="#d9a400"/><rect x="-6" y="5" width="12" height="3" rx="1" fill="#d9a400"/></g>`;
      case "debuggod":
        return `<g><ellipse cx="60" cy="6" rx="22" ry="6" fill="none" stroke="#ffe27a" stroke-width="3" opacity="0.9"/><g transform="translate(98 64)"><ellipse rx="5" ry="6" fill="#e0533d"/><circle cy="-7" r="3" fill="#e0533d"/><line x1="-7" y1="-3" x2="-2" y2="0" stroke="#e0533d" stroke-width="1.6"/><line x1="7" y1="-3" x2="2" y2="0" stroke="#e0533d" stroke-width="1.6"/></g></g>`;
      case "confetti":
        return `<g><polygon points="60,-2 50,20 70,20" fill="#ff5f7e"/><polygon points="60,-2 60,20 70,20" fill="#ffb13d"/><circle cx="60" cy="-3" r="3" fill="#7ad3e8"/><circle cx="22" cy="40" r="3" fill="#ff5f7e"/><circle cx="98" cy="36" r="3" fill="#5dd47a"/><rect x="16" y="64" width="5" height="5" fill="#f4c430" transform="rotate(20 18 66)"/><rect x="100" y="58" width="5" height="5" fill="#7a8cff" transform="rotate(40 102 60)"/></g>`;
      case "coffee":
        return `<g transform="translate(93 92)"><rect x="-9" y="-7" width="16" height="14" rx="2" fill="#fff" stroke="#a9763f" stroke-width="1.5"/><path d="M-9 -3 h16 v8 a3 3 0 0 1 -3 3 h-10 a3 3 0 0 1 -3 -3 z" fill="#6f4a2a"/><path d="M7 -4 a5 5 0 0 1 0 8" fill="none" stroke="#a9763f" stroke-width="1.5"/><path d="M-3 -12 q3 -3 0 -6 M2 -12 q3 -3 0 -6" stroke="#d8c4b0" stroke-width="1.4" fill="none"/></g>`;
      case "locked":
        return `<g transform="translate(60 92)"><rect x="-16" y="-10" width="32" height="24" rx="2" fill="#3b2f6b"/><rect x="-16" y="-10" width="32" height="24" rx="2" fill="none" stroke="#6c5bb0" stroke-width="1.5"/><text x="0" y="5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#cfc4ff">&bull;&bull;&bull;</text><g transform="translate(12 -12)"><rect x="-5" y="0" width="10" height="8" rx="1.5" fill="#f4c430"/><path d="M-3 0 v-3 a3 3 0 0 1 6 0 v3" fill="none" stroke="#f4c430" stroke-width="1.6"/></g></g>`;
      case "photo":
        return `<g transform="translate(92 94) rotate(-8)"><rect x="-12" y="-12" width="24" height="28" rx="1.5" fill="#fff" stroke="#d8cfc0" stroke-width="1.2"/><rect x="-9" y="-9" width="18" height="15" fill="#9ed0dc"/><circle cx="0" cy="-2" r="4" fill="#f4c430"/></g>`;
      case "mascot":
        return `<g><rect x="40" y="100" width="40" height="12" rx="3" fill="#0d3b46"/><text x="60" y="109" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" font-weight="700" fill="#7ad3e8">Gopher</text></g>`;
      case "wave":
        return `<g><ellipse cx="104" cy="46" rx="7" ry="13" fill="#7ad3e8" transform="rotate(28 104 46)"/><circle cx="110" cy="34" r="7" fill="#e8b96b"/></g>`;
      default:
        return "";
    }
  }
  function gopher(mood) {
    return `
<svg class="gopher" viewBox="-6 -10 132 156" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Go gopher (${mood || "happy"})">
  <defs><linearGradient id="gbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff0fb"/><stop offset="1" stop-color="#2c9cba"/></linearGradient></defs>
  ${gopherBody()}${gopherLimbs()}${gopherFace(mood)}${gopherProp(mood)}
</svg>`;
  }
  function stickerEl(slide) {
    const s = slide.sticker;
    if (!s) return "";
    const cap = s.cap ? `<span class="cap">${esc(s.cap)}</span>` : "";
    return `<div class="sticker">${gopher(slide.mood)}${cap}</div>`;
  }

  /* ---------- Contributor chips ---------- */
  const CHIP_TONES = ["#00add8", "#c586c0", "#dcdcaa", "#5dd47a", "#ff8a8a", "#7a8cff", "#f4a13d"];
  function initials(name) {
    const parts = String(name).trim().split(/\s+/);
    if (/anonymous/i.test(name)) return "?";
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }
  function chip(name, i) {
    const tone = CHIP_TONES[i % CHIP_TONES.length];
    return `<span class="chip"><span class="chip-av" style="background:${tone}">${esc(initials(name))}</span>${esc(name)}</span>`;
  }
  function contributorBar(slide) {
    if (!slide.contributors || !slide.contributors.length) return "";
    const chips = slide.contributors.map(chip).join("");
    return `<div class="contrib-bar"><span class="contrib-label">// contributed by:</span>${chips}</div>`;
  }

  /* ---------- code-ide building blocks ---------- */
  function codeBlock(rows, startLine) {
    let gutter = "", code = "";
    rows.forEach((r, i) => {
      gutter += `<span>${(startLine || 1) + i}</span>`;
      code += `<span class="ln" style="--i:${i}">${r || "&nbsp;"}</span>`;
    });
    return `<div class="editor-body"><div class="gutter">${gutter}</div><div class="code">${code}</div></div>`;
  }
  function mascotConsole(slide) {
    if (!slide.mascot || !slide.mascot.length) return "";
    const lines = slide.mascot.map((l) => `<span class="m-line">${esc(l)}</span>`).join("");
    return `
      <div class="mascot-console">
        <span class="m-av">${gopher("mascot")}</span>
        <div class="m-out"><span class="m-tag">Gopher &gt;</span>${lines}</div>
      </div>`;
  }
  function sectionBadge(slide) {
    if (!slide.section) return "";
    return `<span class="section-badge"><span class="se">${slide.section.emoji}</span>${esc(slide.section.label)}</span>`;
  }
  function headerComments(slide) {
    if (slide.author) return [`<span class="t-comment">// file: ${esc(slide.file)}</span>`, `<span class="t-comment author">// author: ${esc(slide.author)}</span>`];
    return [`<span class="t-comment">// file: ${esc(slide.file)}</span>`];
  }
  function editorChrome(slide, bodyHtml, opts) {
    opts = opts || {};
    return `
      <div class="editor ${opts.cls || ""}">
        <div class="titlebar">
          <span class="lights"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></span>
          <span class="crumb">${esc(deckSlug)} › <b>${esc(slide.file)}</b></span>
        </div>
        <div class="tabbar">
          <span class="tab active"><span class="modi"></span><span class="go-file">${esc(slide.file)}</span></span>
          ${sectionBadge(slide)}
        </div>
        ${contributorBar(slide)}
        ${bodyHtml}
      </div>`;
  }

  /* ---------- code-ide renderers (preserved) ---------- */
  function renderSlide(slide) {
    const rows = [];
    const push = (h) => rows.push(h);
    headerComments(slide).forEach(push);
    push("");
    (slide.top || []).forEach((l) => push(highlight(l)));
    push("");
    const leads = slide.lead || [], msgs = slide.msg || [];
    const leadArr = Array.isArray(leads) ? leads : [leads];
    const msgArr = Array.isArray(msgs) ? msgs : [msgs];
    if (leadArr.length || msgArr.length) {
      push(`<span class="divider">// ────────────────────────────────</span>`);
      leadArr.forEach((l) => push(`<span class="msg-line lead">// ${esc(l)}</span>`));
      msgArr.forEach((l) => push(`<span class="msg-line">// ${esc(l)}</span>`));
      push(`<span class="divider">// ────────────────────────────────</span>`);
      push("");
    }
    (slide.bottom || []).forEach((l) => push(highlight(l)));
    if (slide.easter) { push(""); push(`<span class="easter">${esc(slide.easter)}</span>`); }
    if (slide.footer) { push(""); slide.footer.forEach((l) => push(`<span class="footer-line">${esc(l)}</span>`)); }
    const el = document.createElement("section");
    el.className = "slide";
    el.innerHTML = editorChrome(slide, codeBlock(rows) + mascotConsole(slide)) + stickerEl(slide);
    return el;
  }
  function renderCover(slide) {
    const code = (slide.code || []).map(highlight).map((l, i) => `<div class="ln" style="--i:${i}">${l || "&nbsp;"}</div>`).join("");
    const el = document.createElement("section");
    el.className = "slide";
    el.innerHTML = `
      <div class="cover">
        <div class="eyebrow">${esc(slide.eyebrow)}</div>
        <h1>${esc(slide.title)}<span class="ext">${esc(slide.ext)}</span></h1>
        <div class="runbox">${code}</div>
        <div class="sub">${esc(slide.sub)}</div>
        <div class="runhint">press <kbd>→</kbd> to <span style="color:var(--go-cyan)">go run</span> the deck${slide.author ? " · authored by " + esc(slide.author) : ""}</div>
      </div>
      <div class="sticker cover-l">${gopher("detective")}</div>
      <div class="sticker cover-r">${gopher("mascot")}</div>`;
    return el;
  }
  function renderSocial(slide) {
    const mem = (slide.memories || []).map((m, i) =>
      `<li style="--i:${i}"><span class="m-k">${esc(m.k)}</span><span class="m-v">${esc(m.v)}</span></li>`).join("");
    const el = document.createElement("section");
    el.className = "slide";
    el.innerHTML = `
      <div class="warm-card social-card">
        <div class="warm-bar">
          <span class="warm-file">${esc(slide.file)}</span>
          ${slide.section ? `<span class="warm-tag">${slide.section.emoji} ${esc(slide.section.label)}</span>` : ""}
        </div>
        ${contributorBar(slide)}
        <div class="warm-body">
          <p class="warm-header">${esc(slide.header)}</p>
          <p class="warm-intro">${esc(slide.intro)}</p>
          <ul class="memory-list">${mem}</ul>
          <p class="warm-closing">${esc(slide.closing)}</p>
          <p class="warm-footer">${(slide.footer || []).map(esc).join("<br>")}</p>
        </div>
        <span class="stain s1"></span><span class="stain s2"></span>
      </div>
      ${stickerEl(slide)}`;
    return el;
  }
  function renderOrigin(slide) {
    const beats = (slide.beats || []).map((b, i) =>
      `<li style="--i:${i}"><span class="beat-dot"></span>${esc(b)}</li>`).join("");
    const code = (slide.struct || []).map(highlight).join("\n");
    const el = document.createElement("section");
    el.className = "slide";
    el.innerHTML = `
      <div class="warm-card origin-card">
        <div class="warm-bar paper">
          <span class="warm-file">${esc(slide.file)}</span>
          ${slide.section ? `<span class="warm-tag">${slide.section.emoji} ${esc(slide.section.label)}${slide.author ? " · author: " + esc(slide.author) : ""}</span>` : ""}
        </div>
        ${contributorBar(slide)}
        <div class="origin-grid">
          <div class="polaroid"><div class="photo">${gopher("photo")}</div><span class="cap">${esc(slide.photoCap || "day one")}</span></div>
          <div class="origin-body">
            <p class="warm-header note">${esc(slide.header)}</p>
            <p class="warm-intro">${esc(slide.intro)}</p>
            <ul class="beats">${beats}</ul>
            ${code ? `<pre class="mini-code">${code}</pre>` : ""}
            <p class="warm-footer">${(slide.footer || []).map(esc).join("<br>")}</p>
          </div>
        </div>
      </div>
      ${stickerEl(slide)}`;
    return el;
  }
  function emblem(kind) {
    switch (kind) {
      case "go":  return `<text x="32" y="40" text-anchor="middle" font-family="JetBrains Mono" font-size="22" font-weight="700" fill="#fff">Go</text>`;
      case "cup": return `<g transform="translate(32 32)" fill="none" stroke="#fff" stroke-width="3"><rect x="-11" y="-9" width="20" height="17" rx="3"/><path d="M9 -5 a6 6 0 0 1 0 11"/></g>`;
      case "star":return `<polygon points="32,16 37,28 50,28 39,36 43,49 32,41 21,49 25,36 14,28 27,28" fill="#fff"/>`;
      case "shield": return `<path d="M32 15 l16 6 v10 c0 11 -8 16 -16 19 c-8 -3 -16 -8 -16 -19 v-10z" fill="none" stroke="#fff" stroke-width="3"/>`;
      default: return "";
    }
  }
  function renderAchievements(slide) {
    const code = (slide.code || []).map(highlight).map((l, i) => `<span class="ln" style="--i:${i}">${l || "&nbsp;"}</span>`).join("");
    const gutter = (slide.code || []).map((_, i) => `<span>${i + 1}</span>`).join("");
    const badges = (slide.badges || []).map((b, i) => `
      <div class="ach-badge tone-${b.tone}" style="--i:${i}">
        <span class="ach-medal"><svg viewBox="0 0 64 64">${emblem(b.emblem)}</svg></span>
        <span class="ach-name">${esc(b.name)}</span>
        <span class="ach-level">${esc(b.level)}</span>
      </div>`).join("");
    const el = document.createElement("section");
    el.className = "slide";
    const body = `
      <div class="contrib-bar">${(slide.contributors || []).map(chip).join("")}</div>
      <div class="ach-wrap">
        <div class="editor-body"><div class="gutter">${gutter}</div><div class="code">${code}</div></div>
        <div class="ach-grid">${badges}</div>
        <div class="ach-foot">${(slide.footer || []).map(esc).join("  ")}</div>
      </div>`;
    el.innerHTML = `
      <div class="editor">
        <div class="titlebar">
          <span class="lights"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></span>
          <span class="crumb">${esc(deckSlug)} › <b>${esc(slide.file)}</b></span>
        </div>
        <div class="tabbar"><span class="tab active"><span class="modi"></span><span class="go-file">${esc(slide.file)}</span></span>${sectionBadge(slide)}</div>
        ${body}
      </div>
      ${stickerEl(slide)}`;
    return el;
  }
  function renderGallery(slide) {
    const cells = (slide.photos || []).map((p, i) => `
      <figure class="gphoto ${p.cls || ""}" style="--i:${i}">
        <img src="${esc(p.src)}" loading="lazy" decoding="async" alt="${esc(p.cap)}">
        <figcaption><span class="tape"></span>${esc(p.cap)}</figcaption>
      </figure>`).join("");
    const body = `
      <div class="gallery-body">
        <p class="gallery-header">${esc(slide.header)}</p>
        <p class="gallery-intro">${esc(slide.intro)}</p>
        <div class="gallery-grid">${cells}</div>
        <p class="gallery-foot">${(slide.footer || []).map(esc).join("&nbsp;&nbsp;")}</p>
      </div>`;
    const el = document.createElement("section");
    el.className = "slide";
    el.innerHTML = editorChrome(slide, body, { cls: "gallery-card" });
    return el;
  }
  function renderFinale(slide) {
    const code = (slide.code || []).map(highlight).map((l) => `<span class="ln">${l || "&nbsp;"}</span>`).join("");
    const gutter = (slide.code || []).map((_, i) => `<span>${i + 1}</span>`).join("");
    const waveRow = [..."01234"].map((_, i) => `<div class="wave-g" style="--w:${i}">${gopher(i === 2 ? "mascot" : "wave")}</div>`).join("");
    const el = document.createElement("section");
    el.className = "slide";
    el.dataset.finale = "1";
    el.innerHTML = `
      <div class="finale">
        <div class="editor">
          <div class="titlebar">
            <span class="lights"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></span>
            <span class="crumb">${esc(deckSlug)} › <b>${esc(slide.file)}</b></span>
          </div>
          <div class="tabbar"><span class="tab active"><span class="modi"></span><span class="go-file">${esc(slide.file)}</span></span></div>
          <div class="editor-body"><div class="gutter">${gutter}</div><div class="code">${code}</div></div>
        </div>
        <div class="term-window">
          <div class="term-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="term-title">zsh — ${esc(deckSlug)}</span></div>
          <pre class="term-body" id="finale-term"></pre>
        </div>
        <div class="goodbye" id="finale-goodbye">${esc(slide.goodbye)} <span class="heart">❤</span><span class="signoff">${esc(slide.signoff || "")}</span></div>
        <div class="wave-row" id="wave-row">${waveRow}</div>
      </div>`;
    return el;
  }
  function diagramCanvas(slide, E) {
    if (slide.svg)     return `<div class="gx-diagram-canvas">${slide.svg}</div>`; // raw inline SVG (author-trusted)
    if (slide.src)     return `<div class="gx-diagram-canvas"><img src="${E(slide.src)}" loading="lazy" decoding="async" alt="${E(slide.caption || slide.heading || "diagram")}"></div>`;
    if (slide.mermaid) return `<pre class="mermaid gx-diagram-canvas">${E(slide.mermaid)}</pre>`; // rendered if mermaid.js is present, else shown as source
    return `<div class="gx-diagram-canvas gx-diagram-empty">no diagram source (set svg, src, or mermaid)</div>`;
  }
  function renderDiagram(slide) {
    const legend = (slide.legend || []).map((l) => `<li>${esc(l)}</li>`).join("");
    const body = `
      <div class="diagram-body">
        ${slide.intro ? `<p class="gallery-intro">${esc(slide.intro)}</p>` : ""}
        ${diagramCanvas(slide, esc)}
        ${slide.caption ? `<p class="gallery-foot">${esc(slide.caption)}</p>` : ""}
        ${legend ? `<ul class="gx-legend">${legend}</ul>` : ""}
      </div>`;
    const el = document.createElement("section");
    el.className = "slide";
    el.innerHTML = editorChrome(slide, body, { cls: "gallery-card" }) + stickerEl(slide);
    return el;
  }
  const RENDERERS = { cover: renderCover, code: renderSlide, social: renderSocial, origin: renderOrigin, gallery: renderGallery, achievements: renderAchievements, diagram: renderDiagram, finale: renderFinale };

  /* ---------- Photo gophers (hovering prints, all families) ---------- */
  const PHOTO_SLOTS = ["tl", "tr", "bl", "ml", "mr"];
  function photoStickers(slide) {
    if (!slide.images || !slide.images.length) return "";
    const figs = slide.images.map((img, i) => {
      const slot = PHOTO_SLOTS[i % PHOTO_SLOTS.length];
      return `<figure class="photo-sticker ps-${slot}" style="--i:${i}"><img src="${esc(img.src)}" loading="lazy" decoding="async" alt="${esc(img.caption || "")}"></figure>`;
    }).join("");
    return `<div class="photo-stickers" aria-hidden="true">${figs}</div>`;
  }

  /* ---------- Role normalization + CC helper namespace ---------- */
  const LEGACY2ROLE = { cover: "cover", code: "statement", social: "list", origin: "story", gallery: "gallery", achievements: "list", finale: "finale" };
  const ROLE2TYPE   = { cover: "cover", statement: "code", story: "origin", list: "social", gallery: "gallery", quote: "code", diagram: "diagram", finale: "finale" };
  function normRole(slide) {
    return slide.role || LEGACY2ROLE[slide.type] || "statement";
  }
  const CC = { esc, highlight, gopher, chip, codeBlock, contributorBar, sectionBadge, photoStickers, deckSlug };

  /* ---------- Build one slide (dispatch by family) ---------- */
  function buildOne(slide) {
    if (familyId === "code-ide") {
      const type = slide.type || ROLE2TYPE[normRole(slide)] || "code";
      const r = RENDERERS[type] || renderSlide;
      const el = r(slide);
      el.insertAdjacentHTML("afterbegin", photoStickers(slide));
      return el;
    }
    const role = normRole(slide);
    const generic = (typeof GENERIC !== "undefined") ? GENERIC : {};
    let html = null;
    if (fam && typeof fam.render === "function") html = fam.render(role, slide, CC);
    if (html == null) html = (generic[role] || generic.statement)(slide, CC);
    const sec = document.createElement("section");
    sec.className = "slide";
    if (role === "finale") sec.dataset.finale = "1";
    sec.innerHTML = html;
    sec.insertAdjacentHTML("afterbegin", photoStickers(slide));
    return sec;
  }

  /* ---------- Build all slides ---------- */
  SLIDES.forEach((slide) => track.appendChild(buildOne(slide)));
  const slideEls = [...track.children];

  /* ---------- Dots ---------- */
  SLIDES.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dotnav";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
  });

  /* ---------- Navigation ---------- */
  let current = 0, busy = false;
  function paint() {
    track.style.transform = `translateX(-${current * 100}%)`;
    slideEls.forEach((el, i) => el.classList.toggle("active", i === current));
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle("active", i === current));
    const s = SLIDES[current];
    if (sbFile)  sbFile.textContent = s.file || s.label || s.title || "";
    if (sbCount) sbCount.textContent = `${current + 1} / ${SLIDES.length}`;
    if (sbCommit && s.commit) sbCommit.textContent = `${s.commit.branch || "main"} · ${s.commit.hash}`;
    if (sbPos)   sbPos.textContent = `Ln ${current + 1}, Col 1`;
  }
  function go(target) {
    if (busy) return;
    target = Math.max(0, Math.min(SLIDES.length - 1, target));
    if (target === current) return;
    const forward = target > current;
    const slide = SLIDES[target];
    if (forward && familyId === "code-ide" && slide.commit && !prefersReduced) {
      busy = true;
      playCommit(slide.commit, () => { current = target; paint(); afterArrive(); busy = false; });
    } else {
      current = target; paint(); afterArrive();
    }
  }
  const next = () => go(current + 1);
  const prev = () => go(current - 1);
  function afterArrive() {
    floaters.innerHTML = "";
    const s = SLIDES[current];
    if (familyId === "code-ide" && (s.type === "finale" || normRole(s) === "finale")) runFinale();
  }

  /* ---------- Commit (git history) transition — code-ide only ---------- */
  let skipCommit = null;
  function playCommit(commit, done) {
    overlay.classList.remove("hidden");
    const branch = commit.branch || "main";
    const head = `<span class="dim">~/${esc(deckSlug)}</span> <span class="prompt">(${esc(branch)})</span>\n<span class="prompt">$ </span>`;
    let typed = "", i = 0, finished = false;
    const cmd = commit.cmd;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      const outHtml = (commit.out || []).map((l) => `<span class="ok">${esc(l)}</span>`).join("\n");
      overBody.innerHTML = `${head}${esc(cmd)}\n\n${outHtml}`;
      setTimeout(() => { overlay.classList.add("hidden"); skipCommit = null; done(); }, prefersReduced ? 0 : 650);
    };
    skipCommit = finish;
    overBody.innerHTML = `${head}<span class="cursor"></span>`;
    const timer = setInterval(() => {
      if (i >= cmd.length) { clearInterval(timer); setTimeout(finish, 280); return; }
      typed += cmd[i++];
      overBody.innerHTML = `${head}${esc(typed)}<span class="cursor"></span>`;
    }, 24);
  }

  /* ---------- Finale terminal animation (code-ide) ---------- */
  function runFinale() {
    const slide = SLIDES[current];
    const termEl = document.getElementById("finale-term");
    const goodbyeEl = document.getElementById("finale-goodbye");
    if (!termEl || !slide.run) return;
    termEl.innerHTML = "";
    if (goodbyeEl) goodbyeEl.classList.remove("show");
    if (prefersReduced) {
      termEl.innerHTML = slide.run.map(renderRunLine).join("\n");
      if (goodbyeEl) goodbyeEl.classList.add("show");
      spawnGophers(); return;
    }
    let idx = 0;
    const lines = slide.run;
    function step() {
      if (idx >= lines.length) { if (goodbyeEl) goodbyeEl.classList.add("show"); spawnGophers(); return; }
      const ln = lines[idx++];
      termEl.innerHTML = lines.slice(0, idx).map(renderRunLine).join("\n");
      termEl.scrollTop = termEl.scrollHeight;
      const delay = ln.c === "" ? 90 : (ln.cls === "prompt" ? 360 : ln.cls === "feat" ? 150 : 220);
      setTimeout(step, delay);
    }
    setTimeout(step, 220);
  }
  function renderRunLine(ln) {
    const prefix = ln.t ? `<span class="prompt">${esc(ln.t)}</span>` : "";
    const cls = ln.cls && ln.cls !== "prompt" ? ln.cls : "";
    const body = ln.t ? `<span class="${ln.cls === "prompt" ? "cmd" : cls}">${esc(ln.c)}</span>` : `<span class="${cls}">${esc(ln.c)}</span>`;
    return prefix + body;
  }
  function spawnGophers() {
    if (prefersReduced) return;
    floaters.innerHTML = "";
    const moods = ["confetti", "rocket", "award", "teacher", "coffee", "mascot", "wave"];
    for (let k = 0; k < 14; k++) {
      const g = document.createElement("div");
      const size = 22 + (k % 5) * 9, left = (k * 67 + 13) % 96, dur = 6 + (k % 6), delay = (k % 7) * 0.5;
      g.style.cssText = `position:absolute;left:${left}%;bottom:-60px;width:${size}px;opacity:.9;animation:rise ${dur}s linear ${delay}s infinite;`;
      g.innerHTML = gopher(moods[k % moods.length]);
      floaters.appendChild(g);
    }
    if (!document.getElementById("rise-kf")) {
      const st = document.createElement("style");
      st.id = "rise-kf";
      st.textContent = "@keyframes rise{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.95}100%{transform:translateY(-115vh) rotate(360deg);opacity:0}}";
      document.head.appendChild(st);
    }
  }

  /* ---------- Input ---------- */
  document.addEventListener("keydown", (e) => {
    if (overlay && !overlay.classList.contains("hidden")) {
      if (["ArrowRight", "Enter", " ", "Escape"].includes(e.key) && skipCommit) { e.preventDefault(); skipCommit(); }
      return;
    }
    switch (e.key) {
      case "ArrowRight": case "PageDown": case " ": e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp": e.preventDefault(); prev(); break;
      case "Home": go(0); break;
      case "End": go(SLIDES.length - 1); break;
      case "f": case "F": toggleFullscreen(); break;
    }
  });
  stage.addEventListener("click", (e) => {
    if (overlay && !overlay.classList.contains("hidden")) { if (skipCommit) skipCommit(); return; }
    const x = e.clientX / window.innerWidth;
    if (x > 0.66) next(); else if (x < 0.2) prev();
  });
  let tx = 0;
  stage.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  }, { passive: true });
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  /* ---------- Optional Mermaid rendering (diagram role) ----------
     If mermaid.js is loaded (vendor it next to the deck and add a
     <script>), render any .mermaid blocks; otherwise they show as source. */
  if (window.mermaid) {
    try {
      window.mermaid.initialize && window.mermaid.initialize({ startOnLoad: false });
      if (window.mermaid.run) window.mermaid.run({ querySelector: ".mermaid" });
      else if (window.mermaid.init) window.mermaid.init(undefined, ".mermaid");
    } catch (e) { /* leave source visible */ }
  }

  /* ---------- Init ---------- */
  paint();
  afterArrive();
  stage.focus();
})();
