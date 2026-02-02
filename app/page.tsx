"use client";
import { useEffect, useMemo, useState } from "react";

type Num = { number: number; status: string };

function diaperSize(n: number) {
  if (n >= 1 && n <= 30) return "P";
  if (n >= 31 && n <= 70) return "M";
  if (n >= 71 && n <= 100) return "G";
  return "-";
}

export default function Home() {
  const [numbers, setNumbers] = useState<Num[] | null>(null);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedSize = useMemo(() => {
    return selected ? diaperSize(selected) : null;
  }, [selected]);

  async function load() {
    const r = await fetch("/api/numbers");
    const j = await r.json();
    setNumbers(j.numbers || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function claim() {
    if (!selected) return;
    setLoading(true);
    setMsg("");

    const r = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: selected,
        name,
        whatsapp,
        paymentType: "pix", // pode continuar pix (a pessoa pode optar por fralda ou pix)
      }),
    });

    const j = await r.json();
    setLoading(false);

    if (j?.ok) {
      setMsg("Número reservado! ✅");
      setSelected(null);
      setName("");
      setWhatsapp("");
      load();
    } else {
      setMsg(j?.message || "Erro ao reservar.");
    }
  }

  if (!numbers) return <div style={{ padding: 20 }}>Carregando…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 6 }}>Chá Rifa do Bebê Miguel Gabriel</h1>

      <div
        style={{
          padding: 12,
          borderRadius: 10,
          background: "#f3f4f6",
          marginBottom: 14,
          lineHeight: 1.4,
        }}
      >
        <strong>Como funciona</strong>
        <div>• Escolha um número e reserve online.</div>
        <div>• Contribuição: <strong>R$ 45</strong>.</div>
        <div>• Você pode optar por: <strong>1 pacote de fralda</strong> (conforme tabela) <strong>ou Pix</strong> no mesmo valor.</div>

        <div style={{ marginTop: 10 }}>
          <strong>Tabela de Fraldas</strong>
          <div>• 1 a 30 → Fralda <strong>P</strong></div>
          <div>• 31 a 70 → Fralda <strong>M</strong></div>
          <div>• 71 a 100 → Fralda <strong>G</strong></div>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>Selecione um número abaixo:</strong>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
        {numbers.map((n) => {
          const isAvailable = n.status === "available";
          const isPaid = n.status === "paid";

          return (
            <button
              key={n.number}
              disabled={!isAvailable}
              onClick={() => setSelected(n.number)}
              style={{
                padding: 8,
                border: "none",
                borderRadius: 6,
                cursor: isAvailable ? "pointer" : "not-allowed",
                background:
                  selected === n.number
                    ? "#4ade80"
                    : isAvailable
                    ? "#e5e7eb"
                    : isPaid
                    ? "#22c55e"
                    : "#f59e0b",
                fontWeight: selected === n.number ? 700 : 500,
              }}
              title={
                isAvailable
                  ? `Disponível • Fralda ${diaperSize(n.number)}`
                  : isPaid
                  ? "Pago ✅"
                  : "Reservado ⏳"
              }
            >
              {n.number}
            </button>
          );
        })}
      </div>

      {/* Área do número selecionado */}
      <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#fff7ed" }}>
        {selected ? (
          <>
            <div style={{ marginBottom: 6 }}>
              Você escolheu o número <strong>{selected}</strong>
            </div>
            <div style={{ marginBottom: 10 }}>
              📦 Tamanho da fralda: <strong>{selectedSize}</strong>{" "}
              <span style={{ opacity: 0.8 }}>(ou Pix R$ 45)</span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
              />
              <input
                placeholder="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
              />
              <button
                onClick={claim}
                disabled={loading || !selected || !name.trim() || !whatsapp.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: loading ? "#9ca3af" : "#111827",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {loading ? "Enviando..." : "Confirmar reserva"}
              </button>

              <button
                onClick={() => setSelected(null)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <div>Selecione um número para ver o tamanho da fralda e reservar.</div>
        )}

        {msg && <p style={{ marginTop: 10, marginBottom: 0 }}>{msg}</p>}
      </div>
    </div>
  );
}
