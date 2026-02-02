
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("pass") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const { data, error } = await supabaseServer
    .from("numbers")
    .select("*")
    .eq("event_id", eventId)
    .order("number", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
