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

## What's inside (v6)

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

## Edit these placeholders
| What | Where |
|---|---|
| Email `hello@firstlightstudio.co` | index.html + board.html + script.js + board.js (mailto) |
| WhatsApp `+234 000 000 0000` | index.html + board.html contact rows + assets/firstlight-profile.pdf (regenerate) |
| Social links (`#`) | index footer + board sidebar |
| Pricing anchors ($2,900 / $7,500 / $25,000) | index pricing section |
| Estimator unit prices & ₦ FX rate | top of the ESTIMATOR block in script.js |
| Testimonials | index voices section + board.js (slides in board.html) |
| Journal notes | board.js (NOTES array) |
| Stats (25+ / 10 / 98%) | index hero + board counters |
| Availability ("September 2026") | index + board sidebar badge |
