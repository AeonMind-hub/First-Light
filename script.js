/* ============================================================
   FIRSTLIGHT® — interactions (v3)
   ============================================================ */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* safe storage (sandboxed iframes can throw) */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    session(k, v) {
      try {
        if (v === undefined) return sessionStorage.getItem(k);
        sessionStorage.setItem(k, v);
      } catch { return null; }
    }
  };

  /* ============================================================
     THEME — night / day
     ============================================================ */
  const root = document.documentElement;
  const themeBtn = $("#themeBtn");
  const applyTheme = (t) => {
    root.dataset.theme = t;
    themeBtn.textContent = t === "day" ? "NIGHT" : "DAY";
    themeBtn.setAttribute("aria-label", t === "day" ? "Switch to night mode" : "Switch to day mode");
    const mark = t === "day" ? "assets/mark-dark.png" : "assets/mark.png";
    $$(".theme-img").forEach(img => { img.src = mark; });
  };
  /* day is the default; night returns for visitors who chose it */
  applyTheme(store.get("fl-theme") === "night" ? "night" : "day");
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "day" ? "night" : "day";
    applyTheme(next);
    store.set("fl-theme", next);
  });

  /* ============================================================
     PRELOADER
     ============================================================ */
  const pre = $("#preloader");
  if (pre) {
    if (reduced || store.session("fl_seen")) {
      pre.remove();
    } else {
      document.body.style.overflow = "hidden";
      const num = $("#preNum"), bar = $("#preBar");
      const t0 = performance.now(), dur = 1150;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        num.textContent = String(Math.round(e * 100)).padStart(3, "0");
        bar.style.transform = `scaleX(${e})`;
        if (p < 1) { requestAnimationFrame(tick); return; }
        store.session("fl_seen", "1");
        document.body.style.overflow = "";
        pre.classList.add("done");
        setTimeout(() => pre.remove(), 900);
      })(t0);
    }
  }

  /* -------- assign reveal delays -------- */
  $$("[data-delay]").forEach(el => el.style.setProperty("--dd", el.dataset.delay + "s"));

  /* -------- split masked-line headlines -------- */
  $$("[data-lines]").forEach(h => {
    const chunks = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = chunks
      .map((c, i) => `<span class="m-line"><span class="m-inner" style="--dd:${(i * 0.09).toFixed(2)}s">${c}</span></span>`)
      .join("");
  });
  const lo = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("lines-in"); lo.unobserve(en.target); }
  }), { threshold: 0.2 });
  $$("[data-lines]").forEach(h => lo.observe(h));

  /* -------- generic reveals -------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  $$("[data-reveal]").forEach(el => io.observe(el));

  /* -------- case image settle-in -------- */
  const cio2 = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); cio2.unobserve(en.target); }
  }), { threshold: 0.25 });
  $$(".case-media").forEach(el => cio2.observe(el));

  /* -------- belief: word-by-word reveal -------- */
  const belief = $("#belief");
  if (belief) {
    let wi = 0;
    $$(".wchunk", belief).forEach(chunk => {
      chunk.innerHTML = chunk.textContent.trim().split(/\s+/)
        .map(w => { const s = `<span class="w" style="--wd:${(wi++ * 0.045).toFixed(2)}s">${w}</span>`; return s; })
        .join(" ");
    });
    const bio = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { belief.classList.add("in"); bio.unobserve(belief); }
    }), { threshold: 0.4 });
    bio.observe(belief);
  }

  /* -------- starfield -------- */
  const canvas = $("#stars");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W, H, stars, t = 0;
    const size = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      stars = Array.from({ length: Math.max(24, Math.round(W * H / 26000)) }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.8,
        r: 0.35 + Math.random() * 0.95, a: 0.05 + Math.random() * 0.3,
        sp: 0.3 + Math.random() * 0.9, ph: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.2
      }));
    };
    size(); addEventListener("resize", size);
    (function frame() {
      t += 0.016;
      if (root.dataset.theme !== "day" && stars) {
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
          const tw = s.a * (0.6 + 0.4 * Math.sin(t * s.sp + s.ph));
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.warm ? `rgba(240,205,160,${tw})` : `rgba(210,220,240,${tw})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    })();
  }

  /* -------- hero dawn follows the cursor, gently -------- */
  const dawnFx = $("#dawnFx");
  if (dawnFx && finePointer && !reduced) {
    const hero = dawnFx.closest(".hero");
    let tx = 0, cx = 0;
    hero.addEventListener("mousemove", e => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 70;
    });
    hero.addEventListener("mouseleave", () => tx = 0);
    (function drift() {
      cx += (tx - cx) * 0.05;
      dawnFx.style.transform = `translateX(calc(-50% + ${cx.toFixed(1)}px))`;
      requestAnimationFrame(drift);
    })();
  }

  /* -------- cursor ring -------- */
  const cursor = $("#cursor");
  if (finePointer && cursor && !reduced) {
    let mx = -100, my = -100, cx = -100, cy = -100;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const hot = "a,button,summary,.p-row,.astrip figure,.case-media,.ba-hit";
    document.addEventListener("mouseover", e => { if (e.target.closest(hot)) cursor.classList.add("big"); });
    document.addEventListener("mouseout", e => { if (e.target.closest(hot)) cursor.classList.remove("big"); });
  }

  /* -------- magnetic buttons -------- */
  if (finePointer && !reduced) {
    $$("[data-magnet]").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px,${(e.clientY - r.top - r.height / 2) * 0.24}px)`;
      });
      el.addEventListener("mouseleave", () => el.style.transform = "");
    });
  }

  /* -------- scramble nav links -------- */
  if (!reduced) {
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ·—/";
    $$("[data-scramble]").forEach(link => {
      const original = link.textContent;
      let busy = false;
      link.addEventListener("mouseenter", () => {
        if (busy) return; busy = true;
        let frame = 0;
        const total = original.length * 2 + 8;
        const iv = setInterval(() => {
          frame++;
          link.textContent = original.split("").map((ch, i) => {
            if (ch === " ") return " ";
            return frame / 2 > i ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }).join("");
          if (frame >= total) { clearInterval(iv); link.textContent = original; busy = false; }
        }, 26);
      });
    });
  }

  /* -------- header + progress -------- */
  const head = $("#siteHead"), prog = $("#progress");
  const onScroll = () => {
    head.classList.toggle("scrolled", scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const burger = $("#burger"), mnav = $("#mnav");
  burger.addEventListener("click", () => {
    const open = !mnav.classList.contains("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    mnav.classList.toggle("open", open);
    mnav.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#mnav a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open"); burger.setAttribute("aria-expanded", "false");
    mnav.classList.remove("open"); mnav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }));

  /* -------- counters -------- */
  const cio = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, target = +el.dataset.count, suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1500;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* -------- nav spy -------- */
  const links = $$(".nav-link");
  const map = new Map(links.map(l => [l.getAttribute("href").slice(1), l]));
  const sio = new IntersectionObserver(es => es.forEach(en => {
    const l = map.get(en.target.id);
    if (l && en.isIntersecting) { links.forEach(x => x.classList.remove("active")); l.classList.add("active"); }
  }), { rootMargin: "-35% 0px -58% 0px" });
  ["work", "services", "studio", "process", "pricing"].forEach(id => {
    const s = document.getElementById(id); if (s) sio.observe(s);
  });

  /* -------- case parallax -------- */
  const pxEls = $$("[data-parallax] img");
  if (pxEls.length && !reduced) {
    let pxT = 0;
    const upd = () => {
      pxEls.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const off = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.marginTop = (off * 30).toFixed(1) + "px";
      });
    };
    addEventListener("scroll", () => {
      if (!pxT) pxT = requestAnimationFrame(() => { pxT = 0; upd(); });
    }, { passive: true });
    upd();
  }

  /* -------- archive strip velocity skew -------- */
  const strips = $$(".astrip");
  if (strips.length && finePointer && !reduced) {
    let lastY = scrollY, vel = 0;
    (function skewLoop() {
      const dy = scrollY - lastY; lastY = scrollY;
      vel += (dy - vel) * 0.09;
      const sk = Math.max(-3.2, Math.min(3.2, vel * 0.11));
      const t = Math.abs(sk) > 0.02 ? `skewY(${sk.toFixed(2)}deg)` : "";
      strips.forEach(s => s.style.transform = t);
      requestAnimationFrame(skewLoop);
    })();
  }

  /* -------- project index floating preview -------- */
  const pIndex = $("#pIndex"), prev = $("#pPreview");
  if (pIndex && prev && finePointer && !reduced) {
    let tx = 0, ty = 0, cxp = 0, cyp = 0, on = false;
    $$(".p-row", pIndex).forEach(r => r.addEventListener("mouseenter", () => {
      prev.src = r.dataset.img;
      prev.classList.add("on"); on = true;
    }));
    pIndex.addEventListener("mousemove", e => { tx = e.clientX + 28; ty = e.clientY - 170; });
    pIndex.addEventListener("mouseleave", () => { prev.classList.remove("on"); on = false; });
    (function follow() {
      cxp += (tx - cxp) * 0.13; cyp += (ty - cyp) * 0.13;
      const pw = prev.offsetWidth || 300;
      prev.style.left = Math.max(8, Math.min(cxp, innerWidth - pw - 16)) + "px";
      prev.style.top = Math.min(Math.max(80, cyp), innerHeight - 200) + "px";
      requestAnimationFrame(follow);
    })();
  }

  /* ============================================================
     BEFORE / AFTER slider
     ============================================================ */
  const ba = $("#ba"), baRange = $("#baRange"), baHit = $("#baHit");
  if (ba && baRange && baHit) {
    const setSplit = v => {
      v = Math.max(4, Math.min(96, +v));
      ba.style.setProperty("--split", v + "%");
      baRange.value = String(Math.round(v));
    };
    baRange.addEventListener("input", () => setSplit(+baRange.value));
    const fromEvent = e => {
      const r = ba.getBoundingClientRect();
      setSplit(((e.clientX - r.left) / r.width) * 100);
    };
    let dragging = false;
    baHit.addEventListener("pointerdown", e => {
      dragging = true; baHit.setPointerCapture(e.pointerId); fromEvent(e);
    });
    baHit.addEventListener("pointermove", e => { if (dragging) fromEvent(e); });
    ["pointerup", "pointercancel"].forEach(ev => baHit.addEventListener(ev, () => dragging = false));
    setSplit(58);
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  const lbItems = [
    ...$$(".p-row").map(r => ({ src: r.dataset.img, name: r.dataset.name, meta: r.dataset.meta, desc: r.dataset.desc })),
    ...$$(".astrip .js-lb").map(f => ({ src: $("img", f).getAttribute("src"), name: f.dataset.name, meta: f.dataset.meta, desc: f.dataset.desc }))
  ];
  const lb = $("#lb"), lbImg = $("#lbImg"), lbTitle = $("#lbTitle"),
        lbKind = $("#lbKind"), lbDesc = $("#lbDesc"), lbMedia = $("#lbMedia"), lbCount = $("#lbCount");
  let idx = 0;
  const pad = n => String(n + 1).padStart(2, "0");
  const render = () => {
    const it = lbItems[idx]; if (!it) return;
    lbImg.src = it.src; lbImg.alt = it.name;
    lbTitle.textContent = it.name;
    lbKind.innerHTML = it.meta;
    lbDesc.textContent = it.desc;
    lbCount.textContent = `${pad(idx)} / ${lbItems.length}`;
    lbMedia.scrollTop = 0;
  };
  const open = i => {
    idx = (i + lbItems.length) % lbItems.length;
    render();
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  const bySrc = src => {
    const file = src.split("/").pop();
    const i = lbItems.findIndex(it => it.src.split("/").pop() === file);
    if (i > -1) open(i);
  };
  $$(".p-row").forEach((r, i) => r.addEventListener("click", () => open(i)));
  $$(".astrip .js-lb").forEach(f => f.addEventListener("click", () => bySrc($("img", f).getAttribute("src"))));
  $$(".case-media").forEach(m => {
    const go = () => bySrc(m.dataset.lbSrc || "");
    m.addEventListener("click", go);
    m.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  $$(".js-jump").forEach(a => a.addEventListener("click", e => { e.preventDefault(); open(+a.dataset.target); }));
  $("#lbClose").addEventListener("click", close);
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  $("#lbPrev").addEventListener("click", () => open(idx - 1));
  $("#lbNext").addEventListener("click", () => open(idx + 1));
  addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") open(idx - 1);
    if (e.key === "ArrowRight") open(idx + 1);
  });

  /* -------- smooth FAQ -------- */
  $$(".faq").forEach(d => {
    const summary = $("summary", d), panel = $(".faq-a", d);
    summary.addEventListener("click", e => {
      e.preventDefault();
      if (d.open) {
        const h = panel.offsetHeight;
        const a = panel.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 300, easing: "ease" });
        a.onfinish = () => d.open = false;
      } else {
        d.open = true;
        const h = panel.offsetHeight;
        panel.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
      }
    });
  });

  /* -------- brief form -> mailto -------- */
  const form = $("#brief"), note = $("#formNote");
  const F = {
    name: $("#f-name"), email: $("#f-email"), company: $("#f-company"),
    type: $("#f-type"), budget: $("#f-budget"), message: $("#f-msg")
  };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = F.name.value.trim(), email = F.email.value.trim(), msg = F.message.value.trim();
    let ok = true;
    [[F.name, name], [F.email, email], [F.message, msg]].forEach(([field, v]) => {
      field.classList.toggle("err", !v); if (!v) ok = false;
    });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { F.email.classList.add("err"); ok = false; }
    if (!ok) { note.textContent = "PLEASE ADD YOUR NAME, A VALID EMAIL AND A FEW WORDS ABOUT THE PROJECT."; note.classList.remove("ok"); return; }
    const body = `Name: ${name}\nEmail: ${email}\nCompany: ${F.company.value.trim() || "—"}\nI need: ${F.type.value}\nBudget: ${F.budget.value}\n\nAbout the project:\n${msg}\n`;
    try {
      location.href = "mailto:zinsunathaniel5@gmail.com"
        + "?subject=" + encodeURIComponent(`Project brief — ${F.type.value} (${F.budget.value})`)
        + "&body=" + encodeURIComponent(body);
    } catch {}
    note.classList.add("ok");
    note.textContent = "OPENING YOUR MAIL APP… OR WRITE TO ZINSUNATHANIEL5@GMAIL.COM DIRECTLY.";
  });
  form.addEventListener("input", e => e.target.classList.remove("err"));

  /* ============================================================
     ESTIMATOR — public pricing logic
     ============================================================ */
  const est = $("#estimate");
  if (est) {
    const TYPES = {
      website: { label: "WEBSITE",        base: 3600,  incl: 5,  unit: 240, weeks: 3 },
      webapp:  { label: "WEB APP / SAAS", base: 11500, incl: 12, unit: 340, weeks: 8 },
      mobile:  { label: "MOBILE APP",     base: 13500, incl: 12, unit: 380, weeks: 9 },
      desktop: { label: "DESKTOP APP",    base: 9800,  incl: 10, unit: 420, weeks: 8 },
      ai:      { label: "AI FEATURES",    base: 5400,  incl: 0,  unit: 0,   weeks: 4 }
    };
    const CAPS = {
      auth:     { label: "ACCOUNTS & AUTH",  cost: 2100, w: 1   },
      pay:      { label: "PAYMENTS",         cost: 2600, w: 1   },
      cms:      { label: "CMS / BLOG",       cost: 1600, w: 0.5 },
      shop:     { label: "E-COMMERCE",       cost: 4200, w: 2   },
      realtime: { label: "REAL-TIME / CHAT", cost: 4800, w: 2   },
      api:      { label: "API INTEGRATIONS", cost: 1900, w: 1   },
      offline:  { label: "OFFLINE MODE",     cost: 2600, w: 1   }
    };
    const FX = 1550; // indicative ₦/$ — re-confirmed on the written quote
    const DETECT = [
      ["website",  /websites?|landing(\s?page)?|web\s?page|company\s+site|portfolio/i],
      ["webapp",   /saas|platform|dashboard|portal|\bcrm\b|\berp\b|marketplace|admin\s+panel|web\s?apps?|booking\s+system/i],
      ["mobile",   /mobile|\bios\b|android|app\s+store|play\s+store|(?<!web\s)\bapps?\b/i],
      ["desktop",  /desktop|windows\s+app|macos|linux\s+app|electron/i],
      ["ai",       /\bai\b|artificial\s+intelligence|chat\s?bots?|gpt|claude|llm|openai|anthropic|gemini|automati(on|ze)|rag\b|machine\s+learning|\bml\b|assistant/i],
      ["auth",     /log\s?ins?|sign\s?ups?|user\s+accounts?|user\s+profiles?|memberships?/i],
      ["pay",      /payments?|stripe|paystack|flutterwave|checkouts?|subscriptions?/i],
      ["cms",      /blogs?|cms\b|articles?|news\s+feed|content\s+manag/i],
      ["shop",     /shops?|storefronts?|e-?commerce|cart|sell(ing)?\s+products?/i],
      ["realtime", /real.?time|live\s+chat|messag(ing|es)|live\s+updates?/i],
      ["api",      /apis\b|integrations?|third.?party|whatsapp/i],
      ["offline",  /offline/i]
    ];
    const TYPEMAP = {
      website: "A brand / marketing website", webapp: "A custom web application",
      mobile: "An iOS / Android app", desktop: "A desktop application", ai: "AI integration / automation"
    };

    const brief = $("#estBrief"), scale = $("#estScale"), scaleVal = $("#estScaleVal"),
          linesEl = $("#estLines"), lowEl = $("#estLow"), highEl = $("#estHigh"),
          weeksEl = $("#estWeeks"), ngnEl = $("#estNgn"),
          sendBtn = $("#estSend"), copyBtn = $("#estCopy");
    const money = n => "$" + Math.round(n).toLocaleString("en-US");
    const round100 = n => Math.round(n / 100) * 100;
    const pillsIn = sel => $$(".est-pill", est.querySelector(sel));
    const activeIn = sel => pillsIn(sel).filter(p => p.classList.contains("on")).map(p => p.dataset.k);

    let state = { types: ["website"], caps: [], scale: 12, design: "clean", time: "std", low: 0, high: 0, weeks: 0, sub: 0 };

    function recalc(flash) {
      const types = state.types.length ? state.types : ["website"];
      const incl = Math.max(0, ...types.map(t => TYPES[t].incl));
      const unit = Math.max(0, ...types.map(t => TYPES[t].unit));
      const extraScreens = Math.max(0, state.scale - incl);
      const base = types.reduce((s, t) => s + TYPES[t].base, 0);
      const extra = extraScreens * unit;
      const caps = state.caps.reduce((s, c) => s + CAPS[c].cost, 0);
      const desMult = state.design === "award" ? 1.3 : 1;
      const timeMult = state.time === "rush" ? 1.2 : 1;
      const sub = (base + extra + caps) * desMult * timeMult;
      state.low = round100(sub * 0.85);
      state.high = round100(sub * 1.15);
      state.sub = sub;
      let w = Math.max(...types.map(t => TYPES[t].weeks))
            + state.caps.reduce((s, c) => s + CAPS[c].w, 0)
            + extraScreens / 14;
      if (state.time === "rush") w *= 0.75;
      state.weeks = Math.max(2, Math.round(w));

      /* render */
      lowEl.textContent = money(state.low);
      highEl.textContent = money(state.high);
      weeksEl.textContent = `${state.weeks}–${state.weeks + 2} WEEKS · FULL SENIOR TEAM`;
      ngnEl.textContent = `≈ ₦${(state.low * FX / 1e6).toFixed(1)}M – ₦${(state.high * FX / 1e6).toFixed(1)}M (INDICATIVE @ ₦${FX.toLocaleString()}/$)`;

      const rows = types.map(t => [TYPES[t].label + (t === "ai" ? " — COPILOT / RAG / AGENT" : ` — INCL. ${TYPES[t].incl} ${t === "website" ? "PAGES" : "SCREENS"}`), money(TYPES[t].base)]);
      if (extraScreens > 0 && unit > 0) rows.push([`SCALE — +${extraScreens} MORE @ ${money(unit)}`, money(extra)]);
      state.caps.forEach(c => rows.push([CAPS[c].label, money(CAPS[c].cost)]));
      const core = base + extra + caps;
      if (desMult > 1) rows.push(["AWARD-CLASS DESIGN ×1.3", "+" + money(core * 0.3 * timeMult)]);
      if (timeMult > 1) rows.push(["RUSH DELIVERY ×1.2", "+" + money(core * desMult * 0.2)]);
      rows.push(["MID ESTIMATE", money(sub)]);
      linesEl.innerHTML = rows.map(([l, v], i) =>
        `<li class="${i === rows.length - 1 ? "total" : ""}"><span>${l}</span><b>${v}</b></li>`).join("");

      if (flash && !reduced) {
        [lowEl, highEl].forEach(el => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
      }
    }

    /* pill toggles */
    const bindPills = (sel, onChange) => {
      est.querySelector(sel).addEventListener("click", e => {
        const p = e.target.closest(".est-pill");
        if (!p) return;
        const wrap = p.parentElement;
        if (wrap.dataset.single) {
          if (p.classList.contains("on")) return;
          $$(".est-pill", wrap).forEach(x => { x.classList.remove("on"); x.classList.remove("found"); x.setAttribute("aria-pressed", "false"); });
          p.classList.add("on"); p.setAttribute("aria-pressed", "true");
        } else {
          const on = p.classList.toggle("on");
          p.setAttribute("aria-pressed", String(on));
          if (!on) p.classList.remove("found");
          /* a project must be something — keep at least one type on */
          if (wrap.id === "estTypes" && !wrap.querySelector(".est-pill.on")) {
            p.classList.add("on"); p.setAttribute("aria-pressed", "true");
          }
        }
        onChange();
        recalc(true);
      });
    };
    bindPills("#estTypes", () => state.types = activeIn("#estTypes"));
    bindPills("#estCaps", () => state.caps = activeIn("#estCaps"));
    bindPills('[data-single="design"]', () => state.design = est.querySelector('[data-single="design"] .est-pill.on').dataset.k === "des-award" ? "award" : "clean");
    bindPills('[data-single="time"]', () => state.time = est.querySelector('[data-single="time"] .est-pill.on').dataset.k === "time-rush" ? "rush" : "std");

    /* scale slider */
    scale.addEventListener("input", () => {
      state.scale = +scale.value;
      scaleVal.textContent = scale.value;
      recalc(true);
    });

    /* keyword detection from the description */
    let scanT;
    brief.addEventListener("input", () => {
      clearTimeout(scanT);
      scanT = setTimeout(() => {
        const text = brief.value;
        if (!text.trim()) return;
        let hit = false;
        DETECT.forEach(([key, rx]) => {
          if (!rx.test(text)) return;
          const inTypes = !!est.querySelector(`#estTypes [data-k="${key}"]`);
          const sel = inTypes ? "#estTypes" : "#estCaps";
          if (inTypes && !state.types.includes(key)) state.types.push(key);
          if (!inTypes && !state.caps.includes(key)) state.caps.push(key);
          const pill = est.querySelector(`${sel} [data-k="${key}"]`);
          if (pill && !pill.classList.contains("on")) {
            pill.classList.add("on", "found");
            pill.setAttribute("aria-pressed", "true");
            hit = true;
          }
        });
        if (hit) recalc(true);
      }, 280);
    });

    /* build the brief text */
    const briefText = () => {
      const t = (state.types.length ? state.types : ["website"]).map(k => TYPES[k].label).join(" + ");
      const caps = state.caps.map(k => CAPS[k].label).join(", ") || "—";
      const des = state.design === "award" ? "Award-class" : "Clean & custom";
      const tl = state.time === "rush" ? "Rush" : "Standard";
      return [
        `PROJECT: ${t}`,
        `SCALE: ~${state.scale} pages/screens · DESIGN: ${des} · TIMELINE: ${tl}`,
        `CAPABILITIES: ${caps}`,
        `INDICATIVE RANGE: ${money(state.low)} – ${money(state.high)} · ~${state.weeks}–${state.weeks + 2} weeks`,
        ``,
        `WHAT I WANT TO BUILD:`,
        brief.value.trim() || "—"
      ].join("\n");
    };

    sendBtn.addEventListener("click", () => {
      /* the form's "I need" picks the most significant selected type */
      const lead = ["ai", "mobile", "webapp", "desktop", "website"].find(t => state.types.includes(t));
      F.type.value = TYPEMAP[lead] || "Not sure — advise me";
      const h = state.high;
      F.budget.value = h <= 8000 ? "$3k – $8k" : h <= 15000 ? "$8k – $15k" : h <= 50000 ? "$15k – $50k" : "$50k+";
      F.message.value = briefText();
      note.classList.add("ok");
      note.textContent = "PRE-FILLED FROM YOUR ESTIMATE — ADD YOUR NAME AND WE’LL TAKE IT FROM THERE.";
      $("#contact").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      setTimeout(() => { try { F.name.focus({ preventScroll: true }); } catch {} }, reduced ? 60 : 750);
    });

    copyBtn.addEventListener("click", async () => {
      const txt = `FirstLight — indicative estimate\n${briefText()}\n\nFixed written quote comes after a free scoping call: zinsunathaniel5@gmail.com`;
      let ok = false;
      try { await navigator.clipboard.writeText(txt); ok = true; }
      catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          ok = document.execCommand("copy"); ta.remove();
        } catch {}
      }
      const span = copyBtn.querySelector("span");
      span.textContent = ok ? "Copied ✓" : "Select & copy manually";
      copyBtn.disabled = true;
      setTimeout(() => { span.textContent = "Copy the estimate"; copyBtn.disabled = false; }, 1600);
    });

    /* default state: website on, then first pass */
    const first = est.querySelector('#estTypes [data-k="website"]');
    first.classList.add("on"); first.setAttribute("aria-pressed", "true");
    recalc(false);
  }

  /* ============================================================
     AMAPIANO GROOVE — live-synthesized log drum loop (WebAudio)
     no audio file; the site composes it in your browser
     ============================================================ */
  const grooveBtn = $("#grooveBtn");
  if (grooveBtn) {
    const BPM = 112, STEPS = 32;               /* two bars of sixteenths */
    const STEP = 60 / BPM / 4;
    /* D minor pentatonic log-drum line: [step, noteHz, gain] */
    const D2 = 73.42, F2 = 87.31, G2 = 98.0, A2 = 110.0, C3 = 130.81, D3 = 146.83;
    const BASS = [
      [0, D2, 1], [3, D2, .8], [7, F2, .9], [10, A2, 1], [13, G2, .85],
      [16, C3, 1], [19, A2, .8], [23, F2, .9], [26, G2, .95], [30, D3, 1]
    ];
    const CHORDS = [ /* Dm9, Bbmaj7 — one per bar */
      [146.83, 174.61, 220.0, 329.63],
      [116.54, 146.83, 174.61, 220.0]
    ];
    let ctx = null, master, noiseBuf, padOscs = [], timer = null, step = 0, nextT = 0, playing = false;

    function build() {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain(); master.gain.value = 0;
      master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      /* continuous pad: 4 oscillators retuned per chord */
      CHORDS[0].forEach(f => {
        const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
        const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 620; lp.Q.value = 0.4;
        const g = ctx.createGain(); g.gain.value = 0.016;
        o.connect(lp); lp.connect(g); g.connect(master); o.start();
        padOscs.push(o);
      });
    }
    function logDrum(t, f, v) {
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(f * 2.6, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.9 * v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      /* the "log" knock — third harmonic so it reads on small speakers */
      const o2 = ctx.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 3;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.16 * v, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g); g.connect(master);
      o2.connect(g2); g2.connect(master);
      o.start(t); o.stop(t + 0.5); o2.start(t); o2.stop(t + 0.15);
    }
    function shaker(t, v) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 5600; bp.Q.value = 0.9;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14 * v, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      s.connect(bp); bp.connect(g); g.connect(master);
      s.start(t); s.stop(t + 0.08);
    }
    function rim(t) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      s.connect(hp); hp.connect(g); g.connect(master);
      s.start(t); s.stop(t + 0.05);
    }
    function schedule() {
      while (nextT < ctx.currentTime + 0.14) {
        const s16 = step % 16, bar = (step % 32) < 16 ? 0 : 1;
        /* swing the shakers a touch — amapiano rolls, it doesn't march */
        const swing = (s16 % 2 === 1) ? STEP * 0.14 : 0;
        const t = nextT;
        BASS.forEach(([st, f, v]) => { if (st === step % 32) logDrum(t, f, v); });
        shaker(t + swing, [1, .45, .62, .45][s16 % 4]);
        if (s16 === 4 || s16 === 12) rim(t);
        if (s16 === 0) {
          CHORDS[bar].forEach((f, i) => padOscs[i].frequency.setTargetAtTime(f, t, 0.04));
        }
        nextT += STEP; step++;
      }
    }
    const cue = grooveBtn.querySelector(".np-cue");
    grooveBtn.addEventListener("click", async () => {
      try {
        if (!ctx) build();
        await ctx.resume();
        playing = !playing;
        if (playing) {
          step = 0; nextT = ctx.currentTime + 0.08;
          master.gain.setTargetAtTime(0.5, ctx.currentTime, 0.06);
          timer = setInterval(schedule, 40);
          cue.textContent = "PAUSE ◼";
        } else {
          master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
          clearInterval(timer); timer = null;
          cue.textContent = "PLAY ▸";
        }
        grooveBtn.classList.toggle("playing", playing);
        grooveBtn.setAttribute("aria-pressed", String(playing));
      } catch {}
    });
  }

  /* -------- footer clock (Africa/Lagos) + year -------- */
  const clock = $("#clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tickClock = () => clock.textContent = `IBADAN · ${fmt.format(new Date())} WAT`;
    tickClock(); setInterval(tickClock, 1000);
  }
  $("#year").textContent = new Date().getFullYear();
})();
