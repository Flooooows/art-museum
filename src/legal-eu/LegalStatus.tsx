import { useEffect, useState } from "react";
import {
  LEGAL_STATUSES,
  type LegalDecision,
  type LegalStatus,
  type LegalInput,
} from "./model";
import {
  assertLegalBindings,
  matchingLegalDataset,
  parseLegalReport,
} from "./report";

type Entry = { input: LegalInput; decision: LegalDecision };
export const LEGAL_LABELS: Record<LegalStatus, string> = {
  AUTO_APPROVED_EU: "Admissible UE · automatique",
  REVIEW_REQUIRED: "Droits UE · vérification complémentaire",
  BLOCKED: "Bloqué · ne pas publier",
};
export function useLegalEU(
  catalog: Parameters<typeof assertLegalBindings>[1] & { version: string },
  datasetKey: string,
) {
  const [state, setState] = useState<{
    entries: Map<string, Entry>;
    message: string;
  }>({ entries: new Map(), message: "Chargement des dossiers juridiques UE…" });
  useEffect(() => {
    const controller = new AbortController();
    setState({
      entries: new Map(),
      message: "Chargement des dossiers juridiques UE…",
    });
    void (async () => {
      try {
        const response = await fetch("/legal-eu/report.json", {
          signal: controller.signal,
          cache: "no-cache",
        });
        if (!response.ok)
          throw Error(
            "Rapport juridique indisponible : aucun feu vert automatique affiché.",
          );
        const report = parseLegalReport(await response.json());
        const hash = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(JSON.stringify(catalog)),
        );
        const digest = Array.from(new Uint8Array(hash), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        const dataset = matchingLegalDataset(
          report,
          datasetKey,
          catalog.version,
          digest,
          new Date().toISOString().slice(0, 10),
        );
        assertLegalBindings(dataset, catalog);
        if (!controller.signal.aborted)
          setState({
            entries: new Map(
              dataset.entries.map((e) => [e.input.artworkId, e]),
            ),
            message: `Dossiers UE vérifiés le ${report.verifiedAt}. Les approbations automatiques ne demandent aucun choix juridique manuel.`,
          });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            entries: new Map(),
            message:
              error instanceof Error
                ? error.message
                : "Dossiers juridiques indisponibles : contrôle complémentaire nécessaire.",
          });
      }
    })();
    return () => controller.abort();
  }, [catalog, datasetKey]);
  return state;
}
export function LegalOverview({
  entries,
  message,
  filter,
  onFilter,
}: {
  entries: Map<string, Entry>;
  message: string;
  filter: string;
  onFilter: (s: string) => void;
}) {
  return (
    <section
      className="legal-overview"
      aria-label="Admissibilité juridique Union européenne"
    >
      <h2>Droits · Union européenne</h2>
      <p role="status">{message}</p>
      <p>
        Indépendant de ta sélection et de la rareté. Aucun ajout automatique au
        jeu. Les droits moraux et les crédits restent à respecter.
      </p>
      <p>
        Les compteurs incluent les notices de recherche non illustrées,
        lorsqu’il y en a.
      </p>
      <div className="legal-counts">
        {LEGAL_STATUSES.map((s) => (
          <span key={s}>
            <strong>
              {
                [...entries.values()].filter((e) => e.decision.status === s)
                  .length
              }
            </strong>{" "}
            {LEGAL_LABELS[s]}
          </span>
        ))}
      </div>
      <label>
        Statut juridique UE{" "}
        <select
          aria-label="Statut juridique UE"
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
        >
          <option value="all">Tous les statuts juridiques</option>
          {LEGAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEGAL_LABELS[s]}
            </option>
          ))}
        </select>
      </label>{" "}
      <a href="/legal-eu/report.json" download>
        Télécharger les dossiers juridiques et leurs sources
      </a>
    </section>
  );
}
export function LegalStatusPanel({ entry }: { entry?: Entry }) {
  const status = entry?.decision.status ?? "REVIEW_REQUIRED";
  const d = entry?.decision;
  const sources = entry
    ? [entry.input.identity, ...Object.values(entry.input.checks)]
        .flatMap((c) => c.sources)
        .concat(
          entry.input.authors.flatMap((a) =>
            a.deathEvidence.map((e) => e.source),
          ),
          entry.input.image.evidence,
        )
    : [];
  const unique = [
    ...new Map(sources.map((s) => [`${s.url} ${s.locator}`, s])).values(),
  ];
  return (
    <section
      className={`legal-status legal-${status}`}
      data-legal-status={status}
      aria-label="Statut juridique de l’œuvre"
    >
      <strong>{LEGAL_LABELS[status]}</strong>
      <code>{status}</code>
      {d ? (
        <details>
          <summary>Justification juridique et sources</summary>
          <p>
            Territoire : Union européenne · vérifié le{" "}
            <time>{d.verifiedAt}</time> · {d.engineVersion}.
          </p>
          <p>
            Entrée selon la règle générale de 70 ans :{" "}
            {d.generalPublicDomainDate ?? "non établie"}. Les contrôles
            nationaux et du fichier sont distincts.
          </p>
          {entry.input.authors.map((a) => (
            <p key={a.id}>
              {a.name} · décès :{" "}
              {[...new Set(a.deathEvidence.map((e) => e.year))].join(" / ") ||
                "non établi"}
              .
            </p>
          ))}
          <ul>
            {d.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p>
            Fichier :{" "}
            {entry.input.image.sourceUrl ? (
              <a
                href={entry.input.image.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                source exacte
              </a>
            ) : (
              "non établi"
            )}{" "}
            · {entry.input.image.basis} ·{" "}
            {entry.input.image.kind === "faithful_non_original"
              ? "reproduction fidèle non originale"
              : entry.input.image.kind === "original_photograph"
                ? "photographie originale"
                : entry.input.image.basis === "CC0" ||
                    entry.input.image.basis.startsWith("CC-BY")
                  ? "originalité non qualifiée (réutilisation traitée par la licence du fichier)"
                  : "originalité à établir"}
            .
          </p>
          <p>{d.attribution || "Crédit à établir."}</p>
          <ul>
            {d.obligations.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <dl>
            {Object.entries(entry.input.checks).map(([key, c]) => (
              <div key={key}>
                <dt>
                  {
                    (
                      {
                        nationalTerms: "Délais nationaux",
                        publication: "Publication / posthume",
                        creativeContributions: "Contributions créatives",
                        contracts: "Conditions d’accès",
                        otherRights: "Autres droits",
                      } as Record<string, string>
                    )[key]
                  }
                </dt>
                <dd>{c.explanation}</dd>
              </div>
            ))}
          </dl>
          <ul>
            {d.rules.map((r) => (
              <li key={r.id}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  {r.id}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            {unique.map((s) => (
              <li key={`${s.url} ${s.locator}`}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label}
                </a>{" "}
                — {s.locator}
              </li>
            ))}
          </ul>
          <p>
            Cette admissibilité ne publie pas l’œuvre et ne modifie aucune
            décision artistique.
          </p>
        </details>
      ) : (
        <p>
          Dossier UE absent, en chargement ou incompatible. Aucun feu vert
          automatique ; les choix artistiques restent disponibles.
        </p>
      )}
    </section>
  );
}
