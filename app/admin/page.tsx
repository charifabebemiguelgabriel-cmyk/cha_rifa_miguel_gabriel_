
"use client";
import { useState } from "react";
export default function Admin() {
  const [pass, setPass] = useState("");
  const [items, setItems] = useState<any[]>([]);
  async function load() {
    const r = await fetch(`/api/admin/list?pass=${encodeURIComponent(pass)}`);
    const j = await r.json();
    setItems(j.items || []);
  }
  async function confirm(number: number) {
    await fetch("/api/admin/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass, number })
    });
    load();
  }
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin</h1>
      <input placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} />
      <button onClick={load} style={{ marginLeft: 8 }}>Carregar</button>
      <ul>
        {items.map(i => (
          <li key={i.number}>
            #{i.number} - {i.status}
            {i.status !== "paid" && <button onClick={()=>confirm(i.number)} style={{ marginLeft: 8 }}>Marcar pago</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
