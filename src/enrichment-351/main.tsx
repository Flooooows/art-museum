import React from "react";
import { createRoot } from "react-dom/client";
import CandidateApp from "../masterpieces/CandidateApp";
import "../review/review.css";
import "../masterpieces/masterpieces.css";

export const ENRICHMENT_STORAGE_KEY = "muse:enrichment-351-review:v1";
createRoot(document.getElementById("enrichment-root")!).render(
  <React.StrictMode>
    <CandidateApp
      catalogUrl="/enrichment-351-data/catalog.json"
      storageKey={ENRICHMENT_STORAGE_KEY}
      label="Lot 351 · Préparation locale"
      imageDirectory="/enrichment-351-images"
      introduction="Œuvres documentées pour les territoires indiqués ; ni activation dans le jeu ni publication automatique. Les choix du millier et du lot précédent restent séparés."
    />
  </React.StrictMode>,
);
