import { REVIEW_RARITIES, type ReviewDecisions } from "./types";
import {
  personalRarityCounts,
  type PersonalRarityFilter,
} from "./personalRarity";

export function PersonalRaritySummary({
  works,
  decisions,
  filter,
  onFilter,
}: {
  works: readonly { id: string }[];
  decisions: ReviewDecisions;
  filter: PersonalRarityFilter;
  onFilter: (filter: PersonalRarityFilter) => void;
}) {
  const counts = personalRarityCounts(works, decisions);
  return (
    <section
      className="personal-rarity-summary"
      aria-label="Mes raretés finales"
    >
      <h2>Mes raretés finales</h2>
      <p>
        Tes choix uniquement, pas les propositions de l’algo. Compteurs du lot
        entier, toutes pages et tous filtres confondus, indépendamment de la
        sélection artistique.
      </p>
      <p className="personal-rarity-total" role="status">
        {counts.assigned} carte{counts.assigned > 1 ? "s" : ""} avec une rareté
        finale · {counts.unassigned} sans rareté finale.
      </p>
      <div
        className="personal-rarity-levels"
        role="group"
        aria-label="Filtrer par ma rareté finale"
      >
        {REVIEW_RARITIES.map((label, level) => (
          <button
            type="button"
            key={label}
            aria-pressed={filter === String(level)}
            aria-label={`Mes choix : ${label} (${counts.byLevel[level]})`}
            onClick={() =>
              onFilter(
                filter === String(level)
                  ? "assigned"
                  : (String(level) as PersonalRarityFilter),
              )
            }
          >
            <span>{label}</span>
            <strong data-personal-rarity={level}>
              {counts.byLevel[level]}
            </strong>
          </button>
        ))}
      </div>
      <div
        className="personal-rarity-scope"
        role="group"
        aria-label="Cartes avec ou sans rareté finale"
      >
        {(
          [
            ["all", `Toutes les cartes (${counts.total})`],
            ["assigned", `Cartes examinées (${counts.assigned})`],
            ["unassigned", `Sans rareté finale (${counts.unassigned})`],
          ] as const
        ).map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => onFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="personal-rarity-hint">
        Clique sur une rareté pour afficher tes cartes de ce niveau. Les autres
        filtres restent actifs.
      </p>
    </section>
  );
}
