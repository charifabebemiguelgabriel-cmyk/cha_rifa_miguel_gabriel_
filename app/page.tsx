"use client";
import { useEffect, useMemo, useState } from "react";

type Num = { number: number; status: string };

const safari = {
  bg: "#F5F1E8",
  card: "#FFFFFF",
  green: "#4F6F52",
  greenLight: "#E6EFE7",
  brown: "#8B5E3C",
  accent: "#DDB892",
  text: "#111827",
  muted: "#6B7280",
  paid: "#22C55E",
};

function diaperSize(n: number) {
  if (n >= 1 && n <= 30) return "P";
  if (n >= 31 && n <= 70) return "M";
  if (n >= 71 && n <= 100) return "G";
  return "-";
}

export default function Home() {
  const [numbers, setNumbers] = useState<Num[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<"pix" | "fralda">("pix");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const MOM = "5517988017726";
  const DAD = "5517988163227";

  const selectedSize = useMemo(
    () => (selected ? diaperSize(selected) : null),
    [selected]
  );

  async function load() {
    const r = await fetch("/api/numbers", { cache: "no-store" });
    const j = await r.json();
    setNumbers(j.numbers || []);
  }

  useEffect(() => {
    load();
    const t = setInterval(() => load(), 5000);
    return () => clearInterval(t);
  }, []);

  async function claim() {
    if (!selected || !name.trim() || !whatsapp.trim()) {
      setMsg("Preencha nome e WhatsApp.");
      return;
    }

    setLoading(true);
    setMsg("");

    const r = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: selected,
        name,
        whatsapp,
        paymentType,
      }),
    });

    const j = await r.json();
    setLoading(false);

    if (j?.ok) {
      setMsg("Número reservado com sucesso! ✅");
      setSelected(null);
      setName("");
      setWhatsapp("");
      setPaymentType("pix");
      load();
    } else {
      setMsg(j?.message || "Erro ao reservar.");
    }
  }

  function openWhats(phone: string) {
    const size = selected ? diaperSize(selected) : "";
    const option =
      paymentType === "pix" ? "Pix (R$45)" : `Fralda ${size}`;

    const text = encodeURIComponent(
      `Olá! Reservei um número no Chá Rifa do bebê Miguel Gabriel.\n\n` +
      `Número: ${selected}\n` +
      `Nome: ${name}\n` +
      `WhatsApp: ${whatsapp}\n` +
      `Opção: ${option}`
    );

    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  return (
    <div style={{ padding: 20, background: safari.bg, minHeight: "100vh" }}>
      <img
        src="/capa-safari.png"
        style={{
          width: "100%",
          height: 220,
          objectFit: "cover",
          borderRadius: 16,
          marginBottom: 16,
        }}
      />

      <h1 style={{ color: safari.green }}>
        🦒 Chá Rifa do Bebê Miguel Gabriel 🦁
      </h1>

      <p style={{ color: safari.muted }}>
        Escolha um número e contribua com <strong>Pix</strong> ou{" "}
        <strong>Fralda</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 6 }}>
        {numbers.map((n) => {
          const isAvailable = n.status === "available";
          const isPaid = n.status === "paid";

          return (
            <button
              key={n.number}
              disabled={!isAvailable}
              onClick={() => {
                setSelected(n.number);
                setMsg("");
              }}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "none",
                cursor: isAvailable ? "pointer" : "not-allowed",
                background: isPaid
                  ? safari.paid
                  : isAvailable
                  ? safari.greenLight
                  : safari.accent,
                color: isPaid ? "white" : safari.text,
                fontWeight: 800,
              }}
            >
              {n.number}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 14,
            background: safari.card,
            border: `2px dashed ${safari.green}`,
          }}
        >
          <p>
            Número escolhido: <strong>{selected}</strong>
          </p>
          <p>
            Fralda: <strong>{selectedSize}</strong> ou Pix R$45
          </p>

          <label>
            <input
              type="radio"
              checked={paymentType === "pix"}
              onChange={() => setPaymentType("pix")}
            />{" "}
            Pix
          </label>{" "}
          <label>
            <input
              type="radio"
              checked={paymentType === "fralda"}
              onChange={() => setPaymentType("fralda")}
            />{" "}
            Fralda
          </label>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: 8, marginRight: 6 }}
            />
            <input
              placeholder="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              style={{ padding: 8 }}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={claim} disabled={loading}>
              Confirmar reserva
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => openWhats(MOM)}>Confirmar com a Mamãe</button>{" "}
            <button onClick={() => openWhats(DAD)}>Confirmar com o Papai</button>
          </div>

          {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
        </div>
      )}
    </div>
  );
}
