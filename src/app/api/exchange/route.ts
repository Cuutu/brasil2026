import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/latest?from=BRL&to=USD,ARS",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Failed to fetch rates");
    const data = await res.json();
    return NextResponse.json({
      USD: data.rates?.USD ?? 0,
      ARS: data.rates?.ARS ?? 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudieron cargar las tasas" },
      { status: 502 }
    );
  }
}
