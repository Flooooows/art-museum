import React from "react";
import { createRoot } from "react-dom/client";
import CandidateApp from "./CandidateApp";
import { candidateBatch, ENRICHMENT_STORAGE_KEY } from "./batches";
import "../review/review.css";
import "./masterpieces.css";

const batch = candidateBatch(window.location.search);
createRoot(document.getElementById("masterpieces-root")!).render(
  <React.StrictMode>
    <CandidateApp
      {...(batch.initial
        ? {}
        : {
            catalogUrl: "/enrichment-351-data/catalog.json",
            storageKey: ENRICHMENT_STORAGE_KEY,
            imageDirectory: "/enrichment-351-images" as const,
            label: "Enrichissement · 78 œuvres",
            introduction:
              "Nouveau lot issu des 351 entrées examinées. Les choix du millier et du premier lot restent séparés. Droits documentés pour les territoires indiqués, sans activation dans le jeu.",
          })}
      batchLinks={batch.links}
    />
  </React.StrictMode>,
);
