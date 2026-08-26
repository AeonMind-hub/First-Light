/* ============================================================
   FIRSTLIGHT® — STUDIO CARD interactions
   ============================================================ */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  /* ================= THEME (board defaults to night) ================= */
  const root = document.documentElement, themeBtn = $("#themeBtn");
  const applyTheme = t => {
    root.dataset.theme = t;
    themeBtn.textContent = t === "night" ? "DAY" : "NIGHT";
    themeBtn.setAttribute("aria-label", t === "night" ? "Switch to day mode" : "Switch to night mode");
    const mark = t === "night" ? "assets/mark.png" : "assets/mark-dark.png";
    $$(".theme-img").forEach(img => img.src = mark);
  };
  applyTheme(store.get("fl-theme") === "day" ? "day" : "night");
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "night" ? "day" : "night";
    applyTheme(next); store.set("fl-theme", next);
  });

  /* ================= LIVE CLOCK ================= */
  const sideClock = $("#sideClock");
  if (sideClock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => sideClock.textContent = `${fmt.format(new Date())} WAT`;
    tick(); setInterval(tick, 1000);
  }

  /* ================= ROLE ROTATOR ================= */
  const roleEl = $("#roleRot");
  if (roleEl && !reduced) {
    const roles = ["Digital Studio", "Websites · Apps · AI", "Design & Engineering", "Ibadan → Worldwide"];
    let ri = 0, ci = roles[0].length, del = true;
    (function type() {
      const word = roles[ri];
      if (del) {
        ci--;
        if (ci <= 0) { del = false; ri = (ri + 1) % roles.length; return setTimeout(type, 350); }
        roleEl.textContent = word.slice(0, ci);
        return setTimeout(type, 34);
      }
      const next = roles[ri]; ci++;
      roleEl.textContent = next.slice(0, ci);
      if (ci >= next.length) { del = true; return setTimeout(type, 2100); }
      setTimeout(type, 62);
    })();
  }

  /* ================= TABS ================= */
  const tabs = $$(".tab"), mbs = $$(".mb"), panels = $$(".panel");
  const activate = key => {
    tabs.forEach(t => { const on = t.dataset.tab === key; t.classList.toggle("on", on); t.setAttribute("aria-pressed", on); });
    mbs.forEach(t => { const on = t.dataset.tab === key; t.classList.toggle("on", on); t.setAttribute("aria-pressed", on); });
    panels.forEach(p => p.classList.toggle("on", p.id === "p-" + key));
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    if (key === "overview") runCounters();
    store.set("fl-tab", key);
  };
  tabs.forEach(t => t.addEventListener("click", () => activate(t.dataset.tab)));
  mbs.forEach(t => t.addEventListener("click", () => activate(t.dataset.tab)));
  const savedTab = store.get("fl-tab");
  if (savedTab && $("#p-" + savedTab)) activate(savedTab);

  /* ================= COUNTERS ================= */
  let counted = false;
  function runCounters() {
    if (counted) return; counted = true;
    $$(".count").forEach(el => {
      const target = +el.dataset.count, t0 = performance.now(), dur = reduced ? 1 : 1300;
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  if ($("#p-overview").classList.contains("on")) {
    new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { runCounters(); io.disconnect(); } }), { threshold: .3 }).observe($(".stats"));
  }

  /* ================= TESTIMONIALS ================= */
  const track = $("#tstTrack"), dotsWrap = $("#tstDots");
  if (track) {
    const slides = $$(".tst-slide", track); let ti = 0, timer;
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.setAttribute("aria-label", "Testimonial " + (i + 1));
      d.addEventListener("click", () => go(i));
      dotsWrap.appendChild(d);
    });
    const dots = $$("button", dotsWrap);
    const go = i => {
      ti = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${ti * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle("on", k === ti));
      restart();
    };
    const restart = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(ti + 1), 6500); };
    $("#tstPrev").addEventListener("click", () => go(ti - 1));
    $("#tstNext").addEventListener("click", () => go(ti + 1));
    go(0);
  }

  /* ================= WORK ================= */
  const W = [
    { t: "ECO+ Yachts", c: "sites", k: "TRAVEL — WEBSITE & BOOKING", img: "assets/work/eco-yachts.jpg", d: "Destination-led booking experience for an eco-luxury yacht charter. Editorial storytelling up front, availability underneath.", tech: ["Next.js", "CMS", "Booking flow"] },
    { t: "Universe", c: "apps", k: "CREATOR ECONOMY — MOBILE APP", img: "assets/work/universe-app.webp", d: "Live audio, video rooms, wallet and payouts — unified by one dual-theme design system across 40+ screens.", tech: ["React Native", "Design system", "Payments"] },
    { t: "Bonatica", c: "stores", k: "BEAUTY — E-COMMERCE", img: "assets/work/bonatica.jpg", d: "Skincare storefront with soft clinical elegance and a reviews engine built for trust.", tech: ["Storefront", "Reviews", "Subscriptions"] },
    { t: "LaunchFast", c: "sites", k: "SAAS — MARKETING SITE", img: "assets/work/launchfast.jpg", d: "Conversion-led site for a rapid MVP studio — the offer engineered to close founders.", tech: ["Next.js", "Motion", "A/B-ready"] },
    { t: "Lumen", c: "apps", k: "WELLNESS — MOBILE APP", img: "assets/work/lumen-app.webp", d: "Meditation and audiobooks with session tracking and a cinematic identity.", tech: ["Flutter", "Audio", "Streaks"] },
    { t: "Anti Hotels", c: "sites", k: "HOSPITALITY — WEBSITE", img: "assets/work/anti-hotels.jpg", d: "Boutique hotel experience — availability, rooms, offers and gallery storytelling.", tech: ["Next.js", "CMS", "Booking"] },
    { t: "Pulse", c: "apps", k: "PRODUCTIVITY — MOBILE APP", img: "assets/work/pulse-app.webp", d: "Monochrome task & project manager — timeline, calendar, team tasks.", tech: ["React Native", "Offline", "Sync"] },
    { t: "Auréa", c: "stores", k: "BEAUTY — BRAND & STORE", img: "assets/work/aurea.jpg", d: "Botanical skincare brand world — photography, benefits architecture, subscription-ready.", tech: ["Branding", "Storefront", "Subscriptions"] },
    { t: "Fishbowl", c: "apps", k: "B2B SAAS — MOBILE APP", img: "assets/work/fishbowl-app.webp", d: "Sales companion: leads pipeline, automation builder and executive digests.", tech: ["React Native", "Automations", "Digest"] },
    { t: "Vero Wood Studio", c: "sites", k: "CRAFT & TRADE — WEBSITE", img: "assets/work/vero-wood.jpg", d: "Warm editorial presence for a bespoke carpentry studio — portfolio, services, quote capture.", tech: ["Next.js", "CMS", "Quotes"] },
    { t: "Roofinger", c: "sites", k: "HOME SERVICES — LEAD-GEN", img: "assets/work/roofinger.webp", d: "Lead-generation powerhouse — services, projects, FAQs and free-estimate conversion flow.", tech: ["Next.js", "Lead capture", "SEO"] },
    { t: "Brilliant", c: "apps", k: "LUXURY — COMMERCE APP", img: "assets/work/brilliant-app.webp", d: "Jewellery commerce with shared-prong product detail.", tech: ["Commerce", "3D-ready", "Wishlists"] },
    { t: "TNG", c: "sites", k: "B2B — GROWTH AGENCY SITE", img: "assets/work/tng.jpg", d: "Dark editorial site for a Nordic expansion agency.", tech: ["Editorial", "Case system"] },
    { t: "Connect", c: "apps", k: "SOCIAL — MOBILE APP UI", img: "assets/work/social-connect.webp", d: "Profile-first social discovery concept.", tech: ["UI system", "Onboarding"] },
    { t: "Adverse", c: "apps", k: "LIVE STREAMING — MOBILE APP", img: "assets/work/adverse-app.webp", d: "Creator live-streaming with stories and profile cards.", tech: ["Streaming", "Creator tools"] },
    { t: "Kinex", c: "sites", k: "WEARABLES — PRODUCT SITE", img: "assets/work/kinex.jpg", d: "Product storytelling for a fitness smartwatch.", tech: ["Product page", "Specs UX"] },
    { t: "Autocheck", c: "apps", k: "AUTOMOTIVE — INSPECTION APP", img: "assets/work/porsche-app.webp", d: "Purchase-inspection flow for high-value vehicles.", tech: ["Flow design", "Reports"] },
    { t: "PURE", c: "sites", k: "MOBILITY — PRODUCT SITE", img: "assets/work/pure-ev.jpg", d: "Electric scooter launch site with spec-led persuasion.", tech: ["Launch site", "Configurator"] },
    { t: "Vitera", c: "stores", k: "WELLNESS — E-COMMERCE", img: "assets/work/vitera.jpg", d: "Supplements storefront with FAQ-driven conversion.", tech: ["Storefront", "FAQ engine"] },
    { t: "Holbeache Travel", c: "sites", k: "TRAVEL — WEBSITE", img: "assets/work/holbeache.jpg", d: "Full-service travel agency — forty years of trust made digital.", tech: ["Next.js", "CMS"] },
    { t: "Invites", c: "apps", k: "EVENTS — MOBILE APP", img: "assets/work/invites-app.webp", d: "Event invites with card-stack browsing.", tech: ["Gestures", "RSVP flow"] },
    { t: "StructuraPro", c: "sites", k: "ENGINEERING — WEBSITE", img: "assets/work/structurapro.jpg", d: "Precision-led site for a structural engineering partner.", tech: ["Corporate", "Certs"] },
    { t: "Builderss", c: "sites", k: "CONSTRUCTION — CORPORATE SITE", img: "assets/work/builderss.webp", d: "Corporate construction site with featured projects and team.", tech: ["Corporate", "Projects"] },
    { t: "Settings, reconsidered", c: "studies", k: "FINTECH — UI REDESIGN STUDY", img: "assets/work/settings-redesign.jpg", d: "Before/after: a settings screen rebuilt for clarity — grouped by intent, security surfaced.", tech: ["UX audit", "Hierarchy"] },
    { t: "Vero Wood — Dark", c: "studies", k: "CRAFT — ALTERNATE DIRECTION", img: "assets/work/vero-wood-dark.jpg", d: "Alternate hero: sawdust-and-steel photography, full bleed.", tech: ["Art direction"] },
    { t: "LaunchFast — MVP", c: "studies", k: "SAAS — ALTERNATE DIRECTION", img: "assets/work/launchfast-mvp.jpg", d: "Purple-grade hero for 'Production-Ready MVPs'.", tech: ["Art direction"] },
    { t: "CASE Construction", c: "studies", k: "CONSTRUCTION — DESIGN STUDY", img: "assets/work/case-construction.webp", d: "Two competing design directions for a construction brand.", tech: ["Direction A/B"] },
    { t: "Studio One-Pager", c: "studies", k: "CONCEPT — SELF-PROMO", img: "assets/work/studio-onepager.jpg", d: "Dark 'I design & build websites' one-pager concept.", tech: ["Concept"] }
  ];
  const grid = $("#workGrid");
  if (grid) {
    grid.innerHTML = W.map((w, i) => `
      <article class="wcard" data-i="${i}" data-c="${w.c}" tabindex="0" role="button" aria-label="Open ${w.t}">
        <span class="wcard-view" aria-hidden="true"><span>VIEW ↗</span></span>
        <div class="wcard-media"><img src="${w.img}" alt="${w.t}" loading="lazy"></div>
        <div class="wcard-info"><h4>${w.t}</h4><span>${w.k.toLowerCase()}</span></div>
      </article>`).join("");

    const cards = $$(".wcard", grid);
    /* filters */
    $$(".flt").forEach(f => f.addEventListener("click", () => {
      $$(".flt").forEach(x => { x.classList.toggle("on", x === f); x.setAttribute("aria-pressed", x === f); });
      const key = f.dataset.f;
      let list = [];
      cards.forEach(c => {
        const show = key === "all" || c.dataset.c === key;
        c.classList.toggle("hide", !show);
        if (show) list.push(+c.dataset.i);
      });
      visible = list;
    }));

    /* modal */
    let visible = W.map((_, i) => i), wi = 0;
    const mob = $("#wModal"), wImg = $("#wmImg"), wKind = $("#wmKind"), wTitle = $("#wmTitle"), wDesc = $("#wmDesc"), wTech = $("#wmTech");
    const renderW = () => {
      const w = W[wi];
      wImg.src = w.img; wImg.alt = w.t;
      wKind.textContent = w.k; wTitle.textContent = w.t; wDesc.textContent = w.d;
      wTech.innerHTML = w.tech.map(t => `<span>${t}</span>`).join("");
    };
    const openW = i => {
      wi = i; /* global index into W; stepW walks the filtered list */
      renderW();
      mob.classList.add("open"); mob.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const stepW = dir => {
      let pos = visible.indexOf(wi);
      pos = (pos + dir + visible.length) % visible.length;
      wi = visible[pos]; renderW();
    };
    cards.forEach(c => {
      c.addEventListener("click", () => openW(+c.dataset.i));
      c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openW(+c.dataset.i); } });
    });
    $("#wmClose").addEventListener("click", closeAll);
    $("#wmPrev").addEventListener("click", () => stepW(-1));
    $("#wmNext").addEventListener("click", () => stepW(1));
  }

  /* ================= JOURNAL ================= */
  const NOTES = [
    { meta: "AUG 2026 · UI/UX", title: "The 9-Screen Rule", body: [
      "Every product has nine screens that decide whether it lives or dies: the entry point, the moment of value, the moment of trust, the money screen, the failure state, the empty state, settings, and the two flows your users hit daily. The rest of the app is scaffolding.",
      "Before we design anything decorative, we design those nine on real content and pressure-test them in a clickable prototype with the client's team. If a screen can't survive nine strangers using it cold, it gets rebuilt — while rebuilding is still cheap.",
      "<strong>The rule:</strong> no build starts until all nine are approved by someone who will actually use the product. It has killed more bad ideas in week one than any process we know — and saved every client the invoice attached to them."
    ]},
    { meta: "JUL 2026 · PRICING", title: "Fixed price is a feature", body: [
      "Hourly billing has a quiet flaw: it rewards being slow. Every inefficiency in the studio becomes revenue. The client's risk grows exactly as their trust shrinks.",
      "So we price the outcome. Before kickoff you hold a document that says what ships, when, and what it costs — and if we've underestimated, that cost is ours. It forces the honest conversations into week one, where they belong: scope, priorities, what 'done' actually means.",
      "<strong>The discipline it buys:</strong> we can't pad timelines, so we don't. You can't get surprise invoices, so budgets stop being a source of anxiety. The relationship gets to be about the work."
    ]},
    { meta: "JUL 2026 · AI", title: "AI that earns its place", body: [
      "Most AI features are added because a competitor added one. They demos well in the board meeting and quietly cost you latency, complexity and user trust in production.",
      "Our model is a two-week pilot: one measurable use-case — support drafting, document Q&A, a workflow automation — built behind a feature flag and benchmarked against your current path. Time saved, error rate, cost per action. Real numbers, no vibes.",
      "<strong>If the numbers hold,</strong> we roll it out properly and keep the evals running. If they don't, we say so plainly and you keep the pilot code either way. AI should be a line item with a return, not a press release."
    ]},
    { meta: "JUN 2026 · DESIGN", title: "Design systems cost less than opinions", body: [
      "In a project without a system, every screen is a fresh negotiation. Should this button be 44 or 48 pixels? Is this grey or that grey? Multiply by sixty screens and the debates become the project.",
      "A small, honest system — spacing scale, type ramp, color tokens, twelve core components — ends most of those debates before they start. Decisions that took meetings take minutes, and the build inherits the consistency for free.",
      "<strong>The unexpected saving</strong> shows up months later: the second designer, the new engineer, the agency after us. They don't inherit a pile of opinions. They inherit instructions."
    ]}
  ];
  const jm = $("#jModal"), jmMeta = $("#jmMeta"), jmTitle = $("#jmTitle"), jmBody = $("#jmBody");
  let ji = 0;
  const renderJ = () => {
    const n = NOTES[ji];
    jmMeta.textContent = n.meta; jmTitle.textContent = n.title;
    jmBody.innerHTML = n.body.map(p => `<p>${p}</p>`).join("");
  };
  $$(".jn").forEach(card => {
    const open = () => {
      ji = +card.dataset.jn; renderJ();
      jm.classList.add("open"); jm.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  $("#jmClose").addEventListener("click", closeAll);
  $("#jmPrev").addEventListener("click", () => { ji = (ji - 1 + NOTES.length) % NOTES.length; renderJ(); });
  $("#jmNext").addEventListener("click", () => { ji = (ji + 1) % NOTES.length; renderJ(); });

  /* ================= MODAL PLUMBING ================= */
  function closeAll() {
    $$(".modal").forEach(m => { m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); });
    document.body.style.overflow = "";
  }
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m) closeAll(); }));
  addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  /* ================= BRIEF FORM ================= */
  const bf = $("#boardBrief"), bNote = $("#boardNote");
  if (bf) {
    const n = $("#b-name"), e = $("#b-email"), m = $("#b-msg");
    bf.addEventListener("submit", ev => {
      ev.preventDefault();
      let ok = true;
      [[n, n.value.trim()], [m, m.value.trim()]].forEach(([f, v]) => { f.classList.toggle("err", !v); if (!v) ok = false; });
      const evv = e.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(evv)) { e.classList.add("err"); ok = false; }
      if (!ok) { bNote.textContent = "PLEASE ADD YOUR NAME, A VALID EMAIL AND A FEW WORDS."; bNote.classList.remove("ok"); return; }
      const body = `Name: ${n.value.trim()}\nEmail: ${evv}\n\nAbout the project:\n${m.value.trim()}\n`;
      try {
        location.href = "mailto:zinsunathaniel5@gmail.com"
          + "?subject=" + encodeURIComponent("Project brief — studio card")
          + "&body=" + encodeURIComponent(body);
      } catch {}
      bNote.classList.add("ok");
      bNote.textContent = "OPENING YOUR MAIL APP… OR WRITE TO ZINSUNATHANIEL5@GMAIL.COM DIRECTLY.";
    });
    bf.addEventListener("input", ev => ev.target.classList.remove("err"));
  }
})();
