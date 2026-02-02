
"use client";
import { useEffect, useState } from "react";
type Num = { number: number; status: string };
export default function Home() {
  const [numbers, setNumbers] = useState<Num[] | null>(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  async function load() {
    const r = await fetch("/api/numbers");
    const j = await r.json();
    setNumbers(j.numbers || []);
  }
  useEffect(() => { load(); }, []);
  async function claim() {
    if (!selected) return;
    setLoading(true); setMsg("");
    const r = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: selected, name, whatsapp, paymentType: "pix" })
    });
    const j = await r.json();
    setLoading(false);
    if (j?.ok) { setMsg("Número reservado!"); setSelected(null); setName(""); setWhatsapp(""); load(); }
    else setMsg(j?.message || "Erro");
  }
  if (!numbers) return <div style={{ padding: 20 }}>Carregando…</div>;
  return (
    <div style={{ padding: 20 }}>
      <h1>Chá Rifa do Bebê Miguel Gabriel</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
        {numbers.map(n => (
          <button key={n.number} disabled={n.status !== "available"}
            onClick={() => setSelected(n.number)}
            style={{ padding: 8, borderRadius: 6, border: "none",
              background: selected===n.number? "#4ade80": n.status==="available"?"#e5e7eb": n.status==="paid"?"#22c55e":"#f59e0b" }}>
            {n.number}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <input placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="WhatsApp" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{ marginLeft: 8 }} />
        <button onClick={claim} disabled={loading || !selected} style={{ marginLeft: 8 }}>
          {loading ? "Enviando..." : "Confirmar"}
        </button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  );
}
