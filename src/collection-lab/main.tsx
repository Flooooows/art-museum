import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import CollectionLab from "./CollectionLab";
import "./styles.css";

class CollectionBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="collection-lab cl-fatal" role="alert">
          <p className="cl-eyebrow">MUSE Lab</p>
          <h1>La galerie n’a pas pu s’afficher.</h1>
          <p>Vos données de jeu ne sont pas concernées.</p>
          <button
            className="cl-button"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
          <a href="/muse-lab.html">Retour au Lab</a>
        </main>
      );
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <CollectionBoundary>
    <CollectionLab />
  </CollectionBoundary>,
);
