import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function App() {
  const [name, setName] = useState("ACP");
  const [message, setMessage] = useState("");

  async function greet() {
    const response = await invoke<string>("greet", { name });
    setMessage(response);
  }

  return (
    <main className="shell">
      <section className="panel" aria-labelledby="app-title">
        <p className="eyebrow">Tauri + React + pnpm workspace</p>
        <h1 id="app-title">ACP Minimal App</h1>
        <div className="form-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Name"
          />
          <button type="button" onClick={greet}>
            Greet
          </button>
        </div>
        {message && <p className="result">{message}</p>}
      </section>
    </main>
  );
}
