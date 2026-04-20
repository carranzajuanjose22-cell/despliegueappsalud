import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App"; // Le saqué el .tsx para que Vite lo resuelva solo
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);