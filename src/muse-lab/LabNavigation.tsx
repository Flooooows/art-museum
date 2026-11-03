import "./navigation.css";

export default function LabNavigation({
  current,
}: {
  current: "accueil" | "cartes" | "boosters" | "ouverture";
}) {
  return (
    <nav className="muse-lab-nav" aria-label="Navigation du laboratoire">
      <a
        className="muse-lab-nav__brand"
        href="/muse-lab.html"
        aria-current={current === "accueil" ? "page" : undefined}
      >
        MUSE <span>Lab</span>
      </a>
      <div>
        {[
          { id: "cartes", href: "/card-lab.html", title: "Cartes" },
          { id: "boosters", href: "/booster-lab.html", title: "Boosters" },
          { id: "ouverture", href: "/opening-lab.html", title: "Ouverture" },
        ].map((item) => (
          <a
            key={item.id}
            href={item.href}
            aria-current={current === item.id ? "page" : undefined}
          >
            {item.title}
          </a>
        ))}
      </div>
    </nav>
  );
}
