import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Solo si fallan ambas APIs
const FALLBACK_RATES = { USD: 0.18, ARS: 276 };

const FETCH_OPTS = {
  headers: { Accept: "application/json", "User-Agent": "Brasil2026/1.0" },
  next: { revalidate: 3600 } as const,
};

async function fetchFrankfurter(): Promise<{ USD: number; ARS: number } | null> {
  const res = await fetch(
    "https://api.frankfurter.dev/v1/latest?base=BRL&to=USD,ARS",
    FETCH_OPTS
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { rates?: { USD?: number; ARS?: number } };
  const USD = data.rates?.USD;
  const ARS = data.rates?.ARS;
  if (USD == null || ARS == null) return null;
  return { USD, ARS };
}

async function fetchExchangeRateApi(): Promise<{ USD: number; ARS: number } | null> {
  const res = await fetch("https://open.er-api.com/v6/latest/BRL", FETCH_OPTS);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    result?: string;
    rates?: { USD?: number; ARS?: number };
  };
  if (data.result !== "success") return null;
  const USD = data.rates?.USD;
  const ARS = data.rates?.ARS;
  if (USD == null || ARS == null) return null;
  return { USD, ARS };
}

export async function GET() {
  try {
    const rates =
      (await fetchFrankfurter()) ?? (await fetchExchangeRateApi());
    if (rates) {
      return NextResponse.json({
        USD: rates.USD,
        ARS: rates.ARS,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json({
    ...FALLBACK_RATES,
    updatedAt: new Date().toISOString(),
    fallback: true,
  });
}
