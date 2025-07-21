import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket", "polling"]
});

export default function App() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
  const [answers, setAnswers] = useState({ A: 0, B: 0, C: 0, D: 0 });

  useEffect(() => {
    socket.on("question", (data) => {
      setQuestion(data?.question || "");
      setOptions(data?.options || { A: "", B: "", C: "", D: "" });
      setAnswers(data?.answers || { A: 0, B: 0, C: 0, D: 0 });
    });

    socket.on("update", (data) => {
      setAnswers(data);
    });

    return () => {
      socket.off("question");
      socket.off("update");
    };
  }, []);

  const sendAnswer = (opt) => socket.emit("answer", opt);

  const total = Object.values(answers).reduce((a, b) => a + b, 0) || 0;
  const pct = (n) => (total > 0 ? ((n / total) * 100).toFixed(0) : 0);

  const COLORS = {
    A: "#3b82f6",
    B: "#10b981",
    C: "#f97316",
    D: "#8b5cf6"
  };
  const TEXT_COLOR = { D: "#000" }; // viola chiaro -> testo scuro

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h1 style={{ marginBottom: 24 }}>
        {question || "In attesa di una domanda..."}
      </h1>
      {["A", "B", "C", "D"].map((opt) => (
        <button
          key={opt}
          onClick={() => sendAnswer(opt)}
          style={{
            display: "block",
            width: "100%",
            margin: "8px auto",
            padding: "16px",
            fontSize: "18px",
            color: TEXT_COLOR[opt] || "#fff",
            background: COLORS[opt],
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            textAlign: "left"
          }}
        >
          {opt} – {options[opt] || "(vuota)"} ({pct(answers[opt])}%)
        </button>
      ))}
    </div>
  );
}