import type { JsonCaptureClient } from "./http";

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function createConnectors(
  client: JsonCaptureClient,
  keys: { smithsonian?: string; europeana?: string } = {},
) {
  const checked = (
    provider: string,
    url: string,
    validate: (payload: unknown) => boolean,
  ) => client.request(provider, url, undefined, validate);
  const integerId = (id: string) => {
    if (!/^\d+$/.test(id))
      throw new Error("Identifiant institutionnel numérique attendu.");
    return id;
  };
  const params = (base: string, values: Record<string, string>) => {
    const url = new URL(base);
    for (const [key, value] of Object.entries(values))
      url.searchParams.set(key, value);
    return url.toString();
  };
  return {
    met: {
      record: (id: string) =>
        checked(
          "met",
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${integerId(id)}`,
          (value) => record(value).objectID === Number(id),
        ),
    },
    cleveland: {
      record: (id: string) =>
        checked(
          "cma",
          `https://openaccess-api.clevelandart.org/api/artworks/${integerId(id)}`,
          (value) => record(record(value).data).id === Number(id),
        ),
    },
    wikidata: {
      entity: (qid: string) => {
        if (!/^Q\d+$/.test(qid))
          throw new Error("Identifiant Wikidata attendu.");
        return checked(
          "wikimedia",
          `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
          (value) => record(record(record(value).entities)[qid]).id === qid,
        );
      },
    },
    wikipedia: {
      pages: (language: string, titles: string[]) => {
        if (
          !["fr", "en"].includes(language) ||
          !titles.length ||
          titles.length > 50
        )
          throw new Error("Lot Wikipédia fr/en de 1 à 50 titres requis.");
        return checked(
          "wikimedia",
          params(`https://${language}.wikipedia.org/w/api.php`, {
            action: "query",
            format: "json",
            formatversion: "2",
            redirects: "1",
            prop: "pageprops|info",
            titles: titles.join("|"),
          }),
          (value) => Array.isArray(record(record(value).query).pages),
        );
      },
    },
    pageviews: {
      monthly: (
        language: string,
        title: string,
        start: string,
        end: string,
      ) => {
        if (
          !["fr", "en"].includes(language) ||
          !/^\d{10}$/.test(start) ||
          !/^\d{10}$/.test(end) ||
          start > end
        )
          throw new Error("Période/langue Pageviews invalide.");
        return checked(
          "wikimedia",
          `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${language}.wikipedia/all-access/user/${encodeURIComponent(title.replaceAll(" ", "_"))}/monthly/${start}/${end}`,
          (value) => Array.isArray(record(value).items),
        );
      },
    },
    smithsonian: {
      record: (id: string) =>
        client.request(
          "smithsonian",
          params(
            `https://api.si.edu/openaccess/api/v1.0/content/${encodeURIComponent(id)}`,
            { api_key: keys.smithsonian ?? "" },
          ),
          { required: true, value: keys.smithsonian },
          (value) =>
            record(value).status === 200 &&
            record(record(value).response).id === id,
        ),
      search: (query: string) =>
        client.request(
          "smithsonian",
          params("https://api.si.edu/openaccess/api/v1.0/search", {
            api_key: keys.smithsonian ?? "",
            q: query,
            rows: "10",
          }),
          { required: true, value: keys.smithsonian },
          (value) =>
            record(value).status === 200 &&
            Array.isArray(record(record(value).response).rows),
        ),
    },
    europeana: {
      record: (id: string) => {
        if (!/^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(id))
          throw new Error("Identifiant Europeana /collection/objet requis.");
        return client.request(
          "europeana",
          params(`https://api.europeana.eu/record/v2${id}.json`, {
            wskey: keys.europeana ?? "",
          }),
          { required: true, value: keys.europeana },
          (value) =>
            record(value).success === true &&
            typeof record(record(value).object).about === "string" &&
            String(record(record(value).object).about).endsWith(id),
        );
      },
      search: (query: string) =>
        client.request(
          "europeana",
          params("https://api.europeana.eu/record/v2/search.json", {
            wskey: keys.europeana ?? "",
            query,
            rows: "10",
            profile: "rich",
          }),
          { required: true, value: keys.europeana },
          (value) =>
            record(value).success === true &&
            Array.isArray(record(value).items),
        ),
    },
  };
}
