import { NextResponse } from "next/server";
import { supabase, hasDatabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const { data, error } = await supabase!.from("persons").select("id, name").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const { data, error } = await supabase!
    .from("persons")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  if (!hasDatabase()) return NextResponse.json({ error: "No database" }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase!.from("expenses").delete().eq("paid_by", id);
  const { error } = await supabase!.from("persons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
