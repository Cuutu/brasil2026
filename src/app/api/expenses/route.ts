import { NextResponse } from "next/server";
import { supabase, hasDatabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const { data, error } = await supabase!
    .from("expenses")
    .select("id, description, amount_brl, paid_by, category, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = (data ?? []).map((r) => ({
    id: r.id,
    description: r.description,
    amountBRL: Number(r.amount_brl),
    paidBy: r.paid_by,
    category: r.category,
    createdAt: r.created_at,
  }));
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = await request.json();
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const amountBRL = Number(body?.amountBRL);
  const paidBy = body?.paidBy;
  const category = body?.category ?? "general";
  if (!description || !Number.isFinite(amountBRL) || amountBRL <= 0 || !paidBy)
    return NextResponse.json({ error: "description, amountBRL, paidBy required" }, { status: 400 });
  const { data, error } = await supabase!
    .from("expenses")
    .insert({
      description,
      amount_brl: amountBRL,
      paid_by: paidBy,
      category,
    })
    .select("id, description, amount_brl, paid_by, category, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    id: data.id,
    description: data.description,
    amountBRL: Number(data.amount_brl),
    paidBy: data.paid_by,
    category: data.category,
    createdAt: data.created_at,
  });
}

export async function DELETE(request: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase!.from("expenses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
