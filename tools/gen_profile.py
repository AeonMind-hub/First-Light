#!/usr/bin/env python3
"""Regenerate assets/firstlight-profile.pdf - the studio one-pager.
Brand: dark ink, dawn amber accent, editorial mono/grotesk feel."""
from fpdf import FPDF

AMBER = (232, 176, 107)
INK = (18, 14, 9)
PAPER = (242, 238, 230)
MID = (196, 188, 172)
DIM = (150, 142, 126)

W, H = 210, 297

class Profile(FPDF):
    pass

pdf = Profile("P", "mm", "A4")
pdf.set_auto_page_break(False)
pdf.add_page()
pdf.set_fill_color(*INK)
pdf.rect(0, 0, W, H, "F")

x0 = 18
pdf.set_margins(x0, x0, x0)

def label(y, txt):
    pdf.set_xy(x0, y)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(*AMBER)
    pdf.cell(0, 4, txt, new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*AMBER)
    pdf.line(x0, y + 6.5, W - x0, y + 6.5)

def body(txt, size=9.5, color=PAPER, lh=4.6, style=""):
    pdf.set_font("Helvetica", style, size)
    pdf.set_text_color(*color)
    pdf.set_x(x0)
    pdf.multi_cell(W - 2 * x0, lh, txt)

# ---------- header ----------
try:
    pdf.image("/home/user/firstlight/assets/mark-dark.png", x=x0, y=14, w=13)
except Exception:
    pass
pdf.set_xy(x0 + 17, 15)
pdf.set_font("Helvetica", "B", 21)
pdf.set_text_color(*PAPER)
pdf.cell(0, 8, "FIRSTLIGHT (R)")
pdf.set_xy(x0 + 17, 23)
pdf.set_font("Helvetica", "", 8.5)
pdf.set_text_color(*MID)
pdf.cell(0, 5, "DIGITAL STUDIO - DESIGN & ENGINEERING - EST. 2026 - REMOTE-FIRST, WORLDWIDE")

# ---------- the studio ----------
label(36, "THE STUDIO")
pdf.set_y(41)
body("FirstLight is a remote-first design & engineering studio, working worldwide. Two projects at a time, "
     "senior hands only, fixed price in writing before kickoff. The people on your first call ship your product.")

# ---------- services ----------
label(62, "SERVICES - AND WHERE THEY START")
pdf.set_y(67)
services = [
    ("BRAND & MARKETING WEBSITES", "Flagship sites & storefronts - from $3,500"),
    ("PRODUCT DESIGN & UX", "Research, flows, design systems, prototypes"),
    ("CUSTOM WEB APPLICATIONS", "SaaS, dashboards, portals - from $11,500"),
    ("IOS & ANDROID APPS", "Native-feel, offline-capable, store-ready - from $13,500"),
    ("DESKTOP APPLICATIONS", "Signed, auto-updating, macOS/Windows/Linux - from $9,800"),
    ("AI INTEGRATION & AUTOMATION", "Copilots, RAG, agents - pilots from $5,000"),
]
for name, desc in services:
    pdf.set_x(x0)
    pdf.set_font("Helvetica", "B", 8.5); pdf.set_text_color(*PAPER)
    pdf.cell(8, 5.4, "")
    pdf.cell(58, 5.4, name)
    pdf.set_font("Helvetica", "", 8.5); pdf.set_text_color(*MID)
    pdf.multi_cell(0, 5.4, desc)

# ---------- pricing ----------
label(112, "WAYS TO ENGAGE")
pdf.set_y(117)
tiers = [
    ("SPRINT SITE", "from $3,500", "1-5 pages, launch-ready in 2-3 weeks"),
    ("SIGNATURE WEBSITE / STORE", "from $8,500", "full site or store, design system, 4-6 weeks"),
    ("PRODUCT BUILD", "from $12,500", "apps & platforms, typical $15K-$35K, 6-12 weeks"),
    ("AI PILOT", "from $5,000", "one measured use-case in 3 weeks, credited toward rollout"),
]
for name, price, note in tiers:
    pdf.set_x(x0)
    pdf.set_font("Helvetica", "B", 8.5); pdf.set_text_color(*AMBER)
    pdf.cell(10, 5.6, "")
    pdf.set_text_color(*PAPER)
    pdf.cell(52, 5.6, name)
    pdf.set_font("Helvetica", "", 8.5); pdf.set_text_color(*AMBER)
    pdf.cell(30, 5.6, price)
    pdf.set_text_color(*MID)
    pdf.multi_cell(0, 5.6, note)

# ---------- how we work ----------
label(158, "HOW WE WORK")
pdf.set_y(163)
body("Discover (wk 1) -> Design (wk 1-3) -> Build (wk 2-8, Friday demos on a live staging link) -> Launch "
     "(72h on the dashboards) -> 60-day warranty. Payment: 40% kickoff / 40% midpoint demo / 20% launch. "
     "Programmes $40K+ phased by milestone. Post-launch retainers from $1,800/mo. Full ownership of repo, "
     "Figma and IP on final payment.", color=MID)

# ---------- contact ----------
label(196, "CONTACT")
pdf.set_y(201)
contact = [
    ("EMAIL", "zinsunathaniel5@gmail.com"),
    ("WHATSAPP", "Chat instantly - tap to open WhatsApp"),
    ("X / TWITTER", "x.com/Dynamic_3dp"),
    ("INSTAGRAM", "instagram.com/cyber.stencil"),
    ("LINKEDIN", "linkedin.com/in/nathaniel-zinsu-9b7ab4424"),
    ("COVERAGE", "Full EU overlap - 4h+ US East Coast (UTC+1)"),
    ("AVAILABILITY", "Booking September 2026 - two slots"),
    ("RESPONSE", "Under 24 hours, always a senior"),
]
for k, v in contact:
    pdf.set_x(x0)
    pdf.set_font("Helvetica", "B", 8); pdf.set_text_color(*DIM)
    pdf.cell(30, 5, k)
    pdf.set_font("Helvetica", "", 8.5); pdf.set_text_color(*PAPER)
    if k == "WHATSAPP":
        pdf.cell(0, 5, v, link="https://wa.me/2349017420904", new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.multi_cell(0, 5, v)

# ---------- footer ----------
pdf.set_draw_color(*(60, 52, 40))
pdf.line(x0, 262, W - x0, 262)
pdf.set_xy(x0, 268)
pdf.set_font("Helvetica", "I", 9.5)
pdf.set_text_color(*AMBER)
pdf.multi_cell(W - 2 * x0, 5, "Every great product begins in the dark. We build toward the light.")
pdf.set_xy(x0, 280)
pdf.set_font("Helvetica", "", 8)
pdf.set_text_color(*DIM)
pdf.cell(0, 5, "FIRSTLIGHT DIGITAL STUDIO - WWW.FIRSTLIGHTSTUDIO.CO - REMOTE-FIRST WORLDWIDE")

pdf.output("/home/user/firstlight/assets/firstlight-profile.pdf")
print("PDF regenerated ✔")
