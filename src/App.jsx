import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Usa variabile ambiente o fallback locale
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socket = io(backendUrl, {
  transports: ["websocket", "polling"]
});

export default function App() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
  const [answers, setAnswers] = useState({ A: 0, B: 0, C: 0, D: 0 });
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Arriva stato iniziale o nuova domanda
    socket.on("question", (data) => {
      console.log("Ricevuta domanda:", data);
      setHasVoted(false); // reset voto
      setQuestion(data?.question || "");
      setOptions(data?.options || { A: "", B: "", C: "", D: "" });
      setAnswers(data?.answers || { A: 0, B: 0, C: 0, D: 0 });
    });

    // Aggiornamento voti
    socket.on("update", (data) => {
      setAnswers(data);
    });

    // Tentativo doppio voto
    socket.on("alreadyVoted", () => {
      alert("Hai già votato per questa domanda!");
    });

    return () => {
      socket.off("question");
      socket.off("update");
      socket.off("alreadyVoted");
    };
  }, []);

  const sendAnswer = (opt) => {
    if (hasVoted) return;
    socket.emit("answer", opt);
    setHasVoted(true);
  };

  const total = Object.values(answers).reduce((a, b) => a + b, 0) || 0;
  const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(0) : 0);

  const COLORS = {
    A: "#3b82f6", // blu
    B: "#10b981", // verde
    C: "#f97316", // arancione
    D: "#8b5cf6"  // viola
  };
  const TEXT_COLOR = { D: "#000" }; // opzionale: testo nero sulla D

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ marginBottom: 24 }}>
        {question || "In attesa di una domanda..."}
      </h1>
      {["A", "B", "C", "D"].map((opt) => (
        <button
          key={opt}
          onClick={() => sendAnswer(opt)}
          disabled={hasVoted}
          style={{
            display: "block",
            width: "100%",
            margin: "8px auto",
            padding: "16px",
            fontSize: "18px",
            color: TEXT_COLOR[opt] || "#fff",
            background: COLORS[opt],
            opacity: hasVoted ? 0.7 : 1,
            border: "none",
            borderRadius: "8px",
            cursor: hasVoted ? "not-allowed" : "pointer",
            textAlign: "left"
          }}
        >
          {opt} – {options[opt] || "(vuota)"} ({pct(answers[opt])}%)
        </button>
      ))}
    </div>
  );
}