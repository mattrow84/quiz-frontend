import React, { useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket", "polling"]
});

export default function Admin() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });

  const sendQuestion = () => {
    if (!question.trim()) return;
    socket.emit("newQuestion", { question, options });
    setQuestion("");
    setOptions({ A: "", B: "", C: "", D: "" });
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>Admin Panel</h1>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Inserisci la domanda"
        style={{ padding: "8px", fontSize: "16px", width: "100%", marginBottom: "10px" }}
      />
      {["A", "B", "C", "D"].map((opt) => (
        <input
          key={opt}
          value={options[opt]}
          onChange={(e) => setOptions({ ...options, [opt]: e.target.value })}
          placeholder={`Opzione ${opt}`}
          style={{ display: "block", padding: "8px", marginTop: "5px", width: "100%" }}
        />
      ))}
      <button
        onClick={sendQuestion}
        style={{ marginTop: "16px", padding: "10px 20px", fontSize: "16px" }}
      >
        Invia Domanda
      </button>
    </div>
  );
}