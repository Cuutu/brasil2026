import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK_RATES = { USD: 0.17, ARS: 170 };

export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=BRL&to=USD,ARS",
      {
        headers: { Accept: "application/json", "User-Agent": "Brasil2026/1.0" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("Frankfurter API error:", res.status, text);
      return NextResponse.json({
        ...FALLBACK_RATES,
        updatedAt: new Date().toISOString(),
        fallback: true,
      });
    }
    const data = (await res.json()) as { rates?: { USD?: number; ARS?: number } };
    const USD = data.rates?.USD ?? FALLBACK_RATES.USD;
    const ARS = data.rates?.ARS ?? FALLBACK_RATES.ARS;
    return NextResponse.json({
      USD,
      ARS,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      ...FALLBACK_RATES,
      updatedAt: new Date().toISOString(),
      fallback: true,
    });
  }
}
