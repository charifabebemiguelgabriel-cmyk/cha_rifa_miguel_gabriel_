
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
export async function POST(req: Request) {
  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const { number, name, whatsapp, paymentType } = await req.json();
  const { data, error } = await supabaseServer.rpc("claim_number", {
    p_event_id: eventId,
    p_number: Number(number),
    p_name: String(name),
    p_whatsapp: String(whatsapp),
    p_payment_type: paymentType || "pix",
  });
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? { ok: false, message: "Erro" });
}
