import { useRef } from "react";
import {
  ArrowRight,
  Download,
  HardDrive,
  Info,
  Landmark,
  Moon,
  ShieldCheck,
  Sun,
  Upload,
} from "lucide-react";
import { artworks, catalogs } from "./data";
import {
  duplicateCount,
  uniqueCount,
  type CollectionState,
} from "./collection";
import { Button } from "./components";
import { type Theme } from "./theme";
import { CARDS_PER_PACK } from "./packRules";

export default function Profile({
  state,
  persistence,
  theme,
  onToggleTheme,
  onExport,
  onImport,
  importError,
  onMuseum,
}: {
  state: CollectionState;
  persistence: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: (file?: File) => void;
  importError: string;
  onMuseum: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="workspace profile-page">
      <div className="workspace-heading">
        <div>
          <h1>Profil</h1>
          <p>Votre parcours, votre musée, vos préférences.</p>
        </div>
      </div>
      <section className="profile-identity" aria-labelledby="collector-title">
        <img src="/assets/renaissance-art.jpg" alt="" />
        <div>
          <h2 id="collector-title">Collectionneur invité</h2>
          <p>
            <HardDrive size={15} />
            {persistence
              ? "Progression enregistrée dans ce navigateur"
              : "Session en mémoire · sauvegarde nécessaire"}
          </p>
        </div>
      </section>
      <dl className="profile-numbers">
        <div>
          <dt>Œuvres découvertes</dt>
          <dd>
            {uniqueCount(state)} <span>/ {artworks.length}</span>
          </dd>
        </div>
        <div>
          <dt>Pochettes ouvertes</dt>
          <dd>{state.opened}</dd>
        </div>
        <div>
          <dt>Exemplaires en plus</dt>
          <dd>{duplicateCount(state)}</dd>
        </div>
        <div>
          <dt>Œuvres exposées</dt>
          <dd>{state.exhibited.length}</dd>
        </div>
      </dl>
      <section className="profile-section">
        <div>
          <h2>Votre musée personnel</h2>
          <p>
            Une salle à votre image, composée des œuvres que vous choisissez
            d’exposer depuis votre collection.
          </p>
        </div>
        <Button variant="ghost" onClick={onMuseum}>
          <Landmark size={19} />
          Visiter mon musée
          <ArrowRight size={17} />
        </Button>
      </section>
      <section className="profile-section profile-backup">
        <div>
          <h2>Gardez votre collection en lieu sûr</h2>
          <p>
            <ShieldCheck size={19} />
            Votre collection reste sur cet appareil, sans compte. Effacer les
            données du navigateur peut supprimer votre progression. Exportez-la
            pour la conserver ou la transférer.
          </p>
        </div>
        <div className="profile-backup-actions">
          <Button onClick={onExport}>
            <Download size={17} />
            Exporter ma collection
          </Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={17} />
            Importer une sauvegarde
          </Button>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Importer une sauvegarde JSON"
            onChange={(e) => {
              onImport(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {importError && (
          <p className="import-error" role="alert">
            <Info size={17} />
            {importError}
          </p>
        )}
      </section>
      <section className="profile-section">
        <div>
          <h2>À votre lumière</h2>
          <p>
            Thème {theme === "dark" ? "sombre bordeaux" : "clair ivoire"}. Votre
            préférence est conservée sur cet appareil.
          </p>
        </div>
        <Button variant="ghost" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}Passer au
          thème {theme === "dark" ? "clair" : "sombre"}
        </Button>
      </section>
      <details className="profile-about">
        <summary>À propos de cette version</summary>
        <p>
          {artworks.length} œuvres de démonstration, {catalogs.length} univers,{" "}
          {CARDS_PER_PACK} cartes par pochette. Stock maximum : 10 pochettes,
          avec une recharge toutes les 10 minutes. Les raretés et les paramètres
          sont provisoires ; ils ne représentent pas une valeur marchande.
          Comptes, échanges et paiements ne sont pas activés.
        </p>
        <a
          className="source-link"
          href="/assets/provenance.json"
          target="_blank"
          rel="noreferrer"
        >
          Origine des reproductions et des visuels
          <ArrowRight size={15} />
        </a>
      </details>
    </div>
  );
}
