# FirstLight® — Digital Studio Website

**Live:** https://firstlight-dusky.vercel.app — Editorial at `/` · Card at `/board`
**Repo:** https://github.com/AeonMind-hub/First-Light

Static site. No build step. Two editions sharing one brand:
- **`index.html`** — Editorial Edition: the long-scroll flagship site.
- **`board.html`** — Card Edition: the tabbed "studio card" (vCard-style) experience.

Shared: `assets/` · fonts · theme (day/night) with remembering · both cross-link via the ⇄ switch in their headers.

## Run locally
```bash
cd firstlight
python3 -m http.server 8080
# Editorial → http://localhost:8080/
# Card      → http://localhost:8080/board.html
```

## What's inside (v7 — live contact details + detailed pricing)

### Editorial Edition (index.html)
- **Day mode default** with remembered toggle; F-mark swaps variants automatically.
- **Section banding** — paper → amber wash (belief, testimonials) → muted tone (services, process, estimator, contact) → dark ink ribbon (marquee, mega CTA).
- **Fonts** — Space Grotesk display · Inter body · IBM Plex Mono labels · Instrument Serif accents.
- **The work, all of it** — 2 case studies, 12-row index, 13-piece archive + 15-piece Vault strip; lightbox counts 40 pieces automatically.
- **Live price estimator** — type a project description, it detects the ingredients, prices the scope (USD + indicative ₦), and pre-fills the contact brief. Unit prices + FX rate: top of the ESTIMATOR block in `script.js`.
- **Playable amapiano** — footer button live-synthesizes a log-drum groove via Web Audio. No audio file.
- Preloader, scramble nav, ghost numerals, manifesto reveal, magnetic buttons, BA slider, live Ibadan clock.

### Card Edition (board.html)
- **vCard-style tabbed board** — sticky studio sidebar (rotating roles, live WAT clock, contact rows, socials) + 5 tabs: Overview / Process / Work / Journal / Contact.
- **Overview** — animated counters, 6 service cards, testimonial carousel (auto + arrows + dots), clients strip.
- **Process** — dotted timeline to launch + grouped stack/tool chips.
- **Work** — 28 projects with category filters (Sites / Apps / Stores / Studies); cards lift on hover with a "VIEW ↘" overlay; detail modal with tech chips + prev/next.
- **Journal** — 4 studio notes ("The 9-Screen Rule", "Fixed price is a feature", "AI that earns its place", "Design systems cost less than opinions"), each with a full-article modal.
- **Contact** — embedded OpenStreetMap of Ibadan + validated mailto brief form.
- **Studio profile PDF** — the sidebar button downloads a real generated one-pager (`assets/firstlight-profile.pdf`).
- Mobile: fixed bottom tab bar with icons, just like the reference.

## Push changes to the repo
```bash
cd firstlight
git add -A && git commit -m "describe the change"
git push origin main
```

## Deploy
Deployed on **Vercel** (free tier). To redeploy after edits:
```bash
npx vercel deploy --prod --yes --token=<your-vercel-token>
```
To get **automatic deploys on every git push**, connect Git once:
Vercel dashboard → `firstlight` project → Settings → Git → Connect Git Repository
→ pick `AeonMind-hub/First-Light`. After that, pushing to `main` deploys itself.
`vercel.json` enables clean URLs (`/board`) and long caching for `assets/`.

## Detailed pricing (v7)
- **Sprint Site** — from $3,500 (2–3 wks · typical $3.5K–$6K)
- **Signature Website / Store** — from $8,500 (4–6 wks · typical $8.5K–$15K · 60-day support)
- **Product Build** — from $12,500 (6–12 wks · typical $15K–$35K · 60-day warranty)
- **AI Pilot** — from $5,000 (3 wks, credited toward full rollout) — full-width strip under the tier grid
- Fine print: 40/40/20 payments · programmes $40K+ milestone-phased · retainers from $1,800/mo · USD, GBP, EUR or ₦ invoicing
- Floors align with the estimator: websites $3.5K · web apps $11.5K · mobile $13.5K · desktop $9.8K · AI $5K
- Studio profile PDF regenerated with real contacts & pricing — source script: `tools/gen_profile.py` (re-run it after any contact change)

## Conversion route (v7.2)
- Contact forms now submit **in-browser** direct to FormSubmit (→ `zinsunathaniel5@gmail.com`). No mail app, mobile-safe. No server needed.
- FormSubmit needs **one-time activation**: after the first real submission, `FormSubmit` emails `zinsunathaniel5@gmail.com` a confirmation link — click it once and every brief lands in the inbox (auto-reply goes to the sender).
- WhatsApp number is **link-only** ("Chat instantly ↗" → wa.me) — the raw +234 digits never render on screen.

## Global-positioning pass (v7.1)
- All Nigeria/Ibadan/coordinates/WAT references removed — copy is now "remote-first · worldwide" with US & EU overlap messaging (hero, studio facts, FAQ, contact, footer clocks, board sidebar, board map → worldwide coverage card, PDF).
- 6 client voices now (was 3) — Austin, London, Amsterdam, Toronto, Manchester, Barcelona.

## Contact details (live)
Email `zinsunathaniel5@gmail.com` · WhatsApp `+234 901 742 0904` · X `x.com/Dynamic_3dp` · IG `instagram.com/cyber.stencil` · LinkedIn `in/nathaniel-zinsu-9b7ab4424`

## Edit these placeholders (still sample copy)
| What | Where |
|---|---|
| Testimonials | index voices section + board.js (slides in board.html) |
| Journal notes | board.js (NOTES array) |
| Stats (50+ / 20+ / 98% / 24H) | index hero + board counters |
| Availability ("September 2026") | index + board sidebar badge |
| Estimator unit prices & ₦ FX rate | top of the ESTIMATOR block in script.js |
