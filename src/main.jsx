import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Admin from "./Admin";

// Semplice routing manuale: /admin -> Admin, altro -> App
const path = window.location.pathname;
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {path === "/admin" ? <Admin /> : <App />}
  </React.StrictMode>
);