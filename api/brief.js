// api/brief.js — serverless relay: browser → Vercel function → FormSubmit → studio inbox.
// Static site + this one function = a real in-browser contact form, no mail app needed.
module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "method" }); return; }
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const name    = String(b.name || "").trim().slice(0, 120);
    const email   = String(b.email || "").trim().slice(0, 200);
    const company = String(b.company || "").trim().slice(0, 160);
    const type    = String(b.type || "").trim().slice(0, 120);
    const budget  = String(b.budget || "").trim().slice(0, 60);
    const message = String(b.message || "").trim().slice(0, 5000);
    const honey   = String(b.honey || "");

    if (honey) { res.status(200).json({ ok: true }); return; } // bot — drop silently

    const valid = name.length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && message.length > 3;
    if (!valid) { res.status(400).json({ ok: false, error: "invalid" }); return; }

    const r = await fetch("https://formsubmit.co/ajax/zinsunathaniel5@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        _subject: `Project brief — ${type || "General"} (${budget || "n/a"}) — ${name}`,
        _template: "table",
        _captcha: "false",
        _replyto: email,
        _autoresponse: `Hi ${name}, thanks for your brief — it just landed with a senior at FirstLight. Expect a reply within 24 hours. — FirstLight Digital Studio`,
        "Name": name,
        "Email": email,
        "Company": company || "—",
        "Project type": type || "—",
        "Budget": budget || "—",
        "Brief": message
      })
    });
    const j = await r.json().catch(() => ({}));
    const msg = String(j.message || "");
    const failed = !r.ok || (String(j.success) === "false" && !/activat/i.test(msg));
    if (failed) { res.status(502).json({ ok: false }); return; }
    res.status(200).json({ ok: true, activationPending: /activat/i.test(msg) });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
};
