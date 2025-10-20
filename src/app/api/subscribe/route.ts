import { NextResponse } from "next/server";

type SubscribeBody = {
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscribeBody;
    const email = (body?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const webhookUrl = process.env.APPS_SCRIPT_SUBSCRIBE_URL="https://script.google.com/macros/s/AKfycbyvTcuC3W2z9eMH8ZAkJLEV9_9FPogZUX8M7aKAbnBu4hc2WI_3N9ioEgdnovYgdHEL8Q/exec";
    if (!webhookUrl) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Forward to Google Apps Script (doPost) endpoint
    const userAgent = request.headers.get("user-agent") || undefined;
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const ip = (forwardedFor.split(",")[0] || request.headers.get("x-real-ip") || undefined) as string | undefined;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "website", userAgent, ip }),
      // Apps Script often requires CORS enabled on its side; we just forward server-side
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ error: "Upstream error", details: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


