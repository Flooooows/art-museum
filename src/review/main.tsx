import React from "react";
import { createRoot } from "react-dom/client";
import ReviewApp from "./ReviewApp";
import "./review.css";

createRoot(document.getElementById("review-root")!).render(
  <React.StrictMode>
    <ReviewApp />
  </React.StrictMode>,
);
