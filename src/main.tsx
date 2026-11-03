import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./appearance.css";
import "./navigation.css";
import "./frames.css";
import "./game-presentation/cards/styles.css";
import "./game-presentation/boosters/styles.css";
import "./game-presentation/integration.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
