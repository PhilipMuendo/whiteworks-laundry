import { NextResponse } from "next/server";

/**
 * Quote intake.
 *
 * Validates the brief server-side, then forwards it. Wire up delivery by
 * setting one of these environment variables:
 *   QUOTE_WEBHOOK_URL   → POSTs the brief as JSON (Zapier, Make, Slack, CRM…)
 * Without it, briefs are logged to the server console (development only).
 */

type Brief = {
  business?: string;
  needs?: string[];
  volume?: string;
  location?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
};

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Brief;
  try {
    body = (await req.json()) as Brief;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // honeypot: bots fill hidden fields. Pretend success.
  if (str(body.website)) return NextResponse.json({ ok: true });

  const brief = {
    business: str(body.business, 60),
    needs: Array.isArray(body.needs) ? body.needs.map((n) => str(n, 60)).filter(Boolean).slice(0, 10) : [],
    volume: str(body.volume, 80),
    location: str(body.location, 120),
    name: str(body.name, 120),
    company: str(body.company, 160),
    email: str(body.email, 200),
    phone: str(body.phone, 40),
    receivedAt: new Date().toISOString(),
  };

  const errors: string[] = [];
  if (!brief.business) errors.push("business");
  if (!brief.needs.length) errors.push("needs");
  if (!brief.location) errors.push("location");
  if (brief.name.length < 2) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(brief.email)) errors.push("email");
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const hook = process.env.QUOTE_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brief) });
      if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
    } catch (e) {
      console.error("[quote] delivery failed", e);
      return NextResponse.json({ ok: false, error: "Delivery failed" }, { status: 502 });
    }
  } else {
    console.info("[quote] new brief (set QUOTE_WEBHOOK_URL to deliver):", brief);
  }

  return NextResponse.json({ ok: true });
}
