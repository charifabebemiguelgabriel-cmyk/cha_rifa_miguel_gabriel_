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

function statusLabel(status: string) {
  if (status === "available") return "Disponível";
  if (status === "paid") return "Pago ✅";
  return "Reservado ⏳";
}

export default function Home() {
  const [numbers, setNumbers] = useState<Num[] | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<"pix" | "fralda">("pix");

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Telefones (com DDI +55, sem espaços)
  const MOM = "5517988017726";
  const DAD = "5517988163227";

  const selectedSize = useMemo(() => (selected ? diaperSize(selected) : null), [selected]);

  async function load() {
    try {
      const r = await fetch("/api/numbers", { cache: "no-store" });
      const j = await r.json();
      setNumbers(j.numbers || []);
    } catch {
      setNumbers([]);
      setMsg("Erro ao carregar os números. Tente atualizar a página.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function claim() {
    if (!selected) return;

    if (!name.trim() || !whatsapp.trim()) {
      setMsg("Preencha Nome e WhatsApp.");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const r = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: selected,
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          paymentType, // "pix" ou "fralda"
        }),
      });

      const j = await r.json();

      if (j?.ok) {
        setMsg("Número reservado com sucesso! ✅");
        await load();
      } else {
        setMsg(j?.message || "Não foi possível reservar. Tente outro número.");
      }
    } catch {
      setMsg("Falha na reserva. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function buildWhatsMessage() {
    const n = selected ?? "";
    const size = selected ? diaperSize(selected) : "";
    const option = paymentType === "pix" ? "Pix (R$45)" : `Fralda ${size}`;
    const text =
      `Olá! Reservei o número ${n} no Chá Rifa do bebê Miguel Gabriel. ✅\n` +
      `Nome: ${name}\n` +
      `WhatsApp: ${whatsapp}\n` +
      `Opção: ${option}\n` +
      `Por favor, confirme pra mim. Obrigado(a)!`;

    return encodeURIComponent(text);
  }

  function openWhats(to: "mom" | "dad") {
    const phone = to === "mom" ? MOM : DAD;
    const text = buildWhatsMessage();
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  if (!numbers) {
    return (
      <div style={{ padding: 20, background: safari.bg, minHeight: "100vh", color: safari.text }}>
        Carregando…
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: safari.bg, minHeight: "100vh", color: safari.text }}>
      {/* CAPA SAFARI */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: `2px solid ${safari.accent}`,
          background: safari.card,
          marginBottom: 16,
        }}
      >
        <img
          src="/capa-safari.png"
          alt="Capa safari"
          style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
        />
      </div>

      {/* TÍTULO */}
      <h1 style={{ marginBottom: 6, color: safari.green }}>🦒 Chá Rifa do Bebê Miguel Gabriel 🦁</h1>
      <p style={{ color: safari.muted, marginTop: 0, marginBottom: 14 }}>
        Escolha seu número e participe com <strong>Pix</strong> ou <strong>fralda</strong> 💚
      </p>

      {/* COMO FUNCIONA */}
      <div
        style={{
          padding: 16,
          borderRadius: 14,
          background: safari.card,
          marginBottom: 18,
          border: `2px solid ${safari.accent}`,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 900, color: safari.brown, marginBottom: 8 }}>Como funciona</div>

        <div>• Contribuição: <strong>R$ 45</strong></div>
        <div>
          • Você pode optar por: <strong>Pix</strong> ou <strong>1 pacote de fralda</strong> (conforme tabela)
        </div>

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${safari.greenLight}` }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Tabela de Fraldas</div>
          <div>• 1 a 30 → Fralda <strong>P</strong></div>
          <div>• 31 a 70 → Fralda <strong>M</strong></div>
          <div>• 71 a 100 → Fralda <strong>G</strong></div>
        </div>

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${safari.greenLight}` }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Legenda</div>
          <div>• Verde claro: disponível</div>
          <div>• Bege: reservado</div>
          <div>• Verde: pago</div>
        </div>
      </div>

      {/* GRADE DE NÚMEROS */}
      <div style={{ marginBottom: 10, fontWeight: 800 }}>Selecione um número:</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
        {numbers.map((n) => {
          const isAvailable = n.status === "available";
          const isPaid = n.status === "paid";

          const bg =
            selected === n.number
              ? safari.green
              : isAvailable
              ? safari.greenLight
              : isPaid
              ? safari.paid
              : safari.accent;

          const color = selected === n.number ? "white" : safari.text;

          return (
            <button
              key={n.number}
              disabled={!isAvailable}
              onClick={() => {
                setSelected(n.number);
                setPaymentType("pix");
                setMsg("");
              }}
              title={
                isAvailable
                  ? `Disponível • Fralda ${diaperSize(n.number)}`
                  : `${statusLabel(n.status)}`
              }
              style={{
                padding: 10,
                border: `1px solid rgba(0,0,0,0.08)`,
                borderRadius: 10,
                cursor: isAvailable ? "pointer" : "not-allowed",
                background: bg,
                color,
                fontWeight: selected === n.number ? 900 : 700,
              }}
            >
              {n.number}
            </button>
          );
        })}
      </div>

      {/* CARTÃO DE RESERVA */}
      <div
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: 14,
          background: safari.card,
          border: `2px dashed ${safari.green}`,
        }}
      >
        {!selected ? (
          <div style={{ color: safari.muted }}>
            Clique em um número disponível para ver o tamanho da fralda e reservar.
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              Você escolheu o número <strong>{selected}</strong>
            </div>

            <div style={{ marginBottom: 12 }}>
              📦 Tamanho da fralda: <strong>{selectedSize}</strong>{" "}
              <span style={{ color: safari.muted }}>(ou Pix R$ 45)</span>
            </div>

            {/* Pix ou Fralda */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6, color: safari.brown }}>
                Como você vai contribuir?
              </div>

              <label style={{ marginRight: 14 }}>
                <input
                  type="radio"
                  name="paytype"
                  value="pix"
                  checked={paymentType === "pix"}
                  onChange={() => setPaymentType("pix")}
                />{" "}
                Pix (R$ 45)
              </label>

              <label>
                <input
                  type="radio"
                  name="paytype"
                  value="fralda"
                  checked={paymentType === "fralda"}
                  onChange={() => setPaymentType("fralda")}
                />{" "}
                Fralda (tamanho {selectedSize})
              </label>
            </div>

            {/* Dados + Botões */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  minWidth: 220,
                }}
              />

              <input
                placeholder="WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  minWidth: 220,
                }}
              />

              <button
                onClick={claim}
                disabled={loading || !name.trim() || !whatsapp.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: loading ? "#9ca3af" : safari.green,
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 900,
                }}
              >
                {loading ? "Enviando..." : "Confirmar reserva"}
              </button>

              <button
                onClick={() => {
                  setSelected(null);
                  setMsg("");
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid #d1d5db`,
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Cancelar
              </button>
            </div>

            {/* BOTÕES WHATSAPP (para confirmar com mamãe/papai) */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => openWhats("mom")}
                disabled={!name.trim() || !whatsapp.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#25D366",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Confirmar com a Mamãe 💬
              </button>

              <button
                onClick={() => openWhats("dad")}
                disabled={!name.trim() || !whatsapp.trim()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#128C7E",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                Confirmar com o Papai 💬
              </button>
            </div>
          </>
        )}

        {msg && (
          <p style={{ marginTop: 12, marginBottom: 0, fontWeight: 900, color: safari.brown }}>
            {msg}
          </p>
        )}
      </div>

      <p style={{ marginTop: 16, color: safari.muted, fontSize: 13 }}>
        Dica: depois de reservar, clique em “Confirmar com a Mamãe/Papai” para enviar a mensagem no WhatsApp 😉
      </p>
    </div>
  );
}