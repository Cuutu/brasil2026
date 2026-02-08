import { NextResponse } from "next/server";
import { supabase, hasDatabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const { data, error } = await supabase!
    .from("important_items")
    .select("id, link, information, amount_brl, added_by, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = (data ?? []).map((r) => ({
    id: r.id,
    link: r.link ?? "",
    information: r.information,
    amountBRL: r.amount_brl != null ? Number(r.amount_brl) : null,
    addedBy: r.added_by ?? "",
    createdAt: r.created_at,
  }));
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = await request.json();
  const link = typeof body?.link === "string" ? body.link.trim() : "";
  const information = typeof body?.information === "string" ? body.information.trim() : "";
  const amountBRL = body?.amountBRL != null ? Number(body.amountBRL) : null;
  const addedBy = body?.addedBy ?? "";
  if (!information)
    return NextResponse.json({ error: "information required" }, { status: 400 });
  const { data, error } = await supabase!
    .from("important_items")
    .insert({
      link,
      information,
      amount_brl: amountBRL,
      added_by: addedBy || null,
    })
    .select("id, link, information, amount_brl, added_by, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    id: data.id,
    link: data.link ?? "",
    information: data.information,
    amountBRL: data.amount_brl != null ? Number(data.amount_brl) : null,
    addedBy: data.added_by ?? "",
    createdAt: data.created_at,
  });
}

export async function DELETE(request: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabase!.from("important_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
