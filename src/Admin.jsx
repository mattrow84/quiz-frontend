import React, { useState } from "react";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socket = io(backendUrl, {
  transports: ["websocket", "polling"]
});

export default function Admin() {
  const [questions, setQuestions] = useState([
    { question: "", options: { A: "", B: "", C: "", D: "" } }
  ]);
  const [currentIndex, setCurrentIndex] = useState(null);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: { A: "", B: "", C: "", D: "" } }]);
  };

  const updateQuestion = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const updateOption = (index, opt, value) => {
    const newQuestions = [...questions];
    newQuestions[index].options[opt] = value;
    setQuestions(newQuestions);
  };

  const sendQuestion = (index) => {
    const q = questions[index];
    if (!q.question.trim()) {
      alert("Inserisci la domanda prima di inviare.");
      return;
    }
    socket.emit("newQuestion", q);
    console.log("Domanda inviata:", q);
    setCurrentIndex(index);
  };

  // Funzione per importare file JSON/CSV
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      if (file.name.endsWith(".json")) {
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            setQuestions(data.map(normalizeQ));
            alert("Domande caricate da JSON!");
          } else {
            alert("JSON non valido");
          }
        } catch {
          alert("Errore nel JSON");
        }
      } else {
        // Trattiamo come CSV/TESTO
        const rows = text.split(/\r?\n/).filter(Boolean);
        const data = [];
        for (let i = 0; i < rows.length; i++) {
          const cols = rows[i].split(";");
          if (cols.length < 5) continue;
          data.push({
            question: cols[0],
            options: { A: cols[1], B: cols[2], C: cols[3], D: cols[4] }
          });
        }
        if (data.length) {
          setQuestions(data);
          alert("Domande caricate da CSV!");
        } else {
          alert("File vuoto o formato errato.");
        }
      }
    };
    reader.readAsText(file);
  };

  const normalizeQ = (q) => ({
    question: q.question || "",
    options: {
      A: q.options?.A || "",
      B: q.options?.B || "",
      C: q.options?.C || "",
      D: q.options?.D || ""
    }
  });

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Admin Panel</h1>
      {/* Import file */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Importa domande (JSON o CSV):
          <input
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleImportFile}
            style={{ display: "block", marginTop: "8px" }}
          />
        </label>
      </div>
      {/* Lista domande */}
      {questions.map((q, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            background: currentIndex === i ? "#eef" : "#fff"
          }}
        >
          <input
            value={q.question}
            onChange={(e) => updateQuestion(i, e.target.value)}
            placeholder={`Domanda ${i + 1}`}
            style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
          />
          {["A", "B", "C", "D"].map((opt) => (
            <input
              key={opt}
              value={q.options[opt]}
              onChange={(e) => updateOption(i, opt, e.target.value)}
              placeholder={`Opzione ${opt}`}
              style={{ width: "100%", padding: "6px", marginBottom: "5px" }}
            />
          ))}
          <button
            onClick={() => sendQuestion(i)}
            style={{ padding: "6px 12px", marginTop: "5px" }}
          >
            Invia questa domanda
          </button>
        </div>
      ))}
      <button
        onClick={addQuestion}
        style={{ marginTop: "10px", padding: "8px 16px" }}
      >
        + Aggiungi domanda
      </button>
      <div style={{ marginTop: "20px" }}>
        <strong>Domanda attiva:</strong>{" "}
        {currentIndex === null ? "Nessuna" : currentIndex + 1}
      </div>
    </div>
  );
}