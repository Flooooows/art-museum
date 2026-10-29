import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface Capture {
  url: string;
  provider: string;
  retrievedAt: string;
  httpStatus: number | null;
  status:
    | "available"
    | "offline_missing"
    | "auth_missing"
    | "rate_limited"
    | "http_error"
    | "invalid_json"
    | "network_error";
  payload: unknown;
  payloadSha256: string;
  error?: string;
  retryAt?: string;
}
export interface CaptureStore {
  get(key: string): Promise<Capture | null>;
  put(key: string, value: Capture): Promise<void>;
}
export const sha256 = (bytes: string | Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
export const payloadHash = (value: unknown) => sha256(JSON.stringify(value));

function redact(value: unknown, secret?: string): unknown {
  if (!secret) return value;
  if (typeof value === "string")
    return value
      .replaceAll(secret, "REDACTED")
      .replaceAll(encodeURIComponent(secret), "REDACTED");
  if (Array.isArray(value)) return value.map((item) => redact(item, secret));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /^(api_key|apikey|wskey|token|secret)$/i.test(key)
          ? "REDACTED"
          : redact(item, secret),
      ]),
    );
  return value;
}

export class DiskCaptureStore implements CaptureStore {
  constructor(private directory: string) {}
  async get(key: string) {
    try {
      const record = JSON.parse(
        await readFile(path.join(this.directory, `${key}.json`), "utf8"),
      ) as Capture;
      return record.status === "available" &&
        record.payloadSha256 === payloadHash(record.payload)
        ? record
        : null;
    } catch {
      return null;
    }
  }
  async put(key: string, capture: Capture) {
    if (capture.status !== "available") return;
    await mkdir(this.directory, { recursive: true });
    const file = path.join(this.directory, `${key}.json`);
    await writeFile(`${file}.tmp`, JSON.stringify(capture, null, 2) + "\n");
    await rename(`${file}.tmp`, file);
  }
}

export function publicUrl(url: string): string {
  const value = new URL(url);
  for (const key of [...value.searchParams.keys()])
    if (/api.?key|wskey|token|secret/i.test(key))
      value.searchParams.set(key, "REDACTED");
  value.searchParams.sort();
  return value.toString();
}

export function retryAfterMs(value: string | null, now: number): number {
  if (!value) return 60000;
  if (/^\d+(?:\.\d+)?$/.test(value)) return Math.max(0, Number(value) * 1000);
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - now) : 60000;
}

export class JsonCaptureClient {
  private nextAllowed = new Map<string, number>();
  private queues = new Map<string, Promise<unknown>>();
  constructor(
    private options: {
      store: CaptureStore;
      offline: boolean;
      minimumIntervalMs: number;
      timeoutMs: number;
      maximumRetryAfterMs: number;
      userAgent: string;
      fetch?: typeof fetch;
      now?: () => number;
      sleep?: (ms: number) => Promise<void>;
    },
  ) {}
  private now() {
    return (this.options.now ?? Date.now)();
  }
  private empty(
    provider: string,
    url: string,
    status: Capture["status"],
    error: string,
    httpStatus: number | null = null,
  ): Capture {
    return {
      provider,
      url: publicUrl(url),
      status,
      error,
      retrievedAt: new Date(this.now()).toISOString(),
      httpStatus,
      payload: null,
      payloadSha256: payloadHash(null),
    };
  }
  async importCapture(
    provider: string,
    url: string,
    retrievedAt: string,
    payload: unknown,
  ) {
    const capture: Capture = {
      provider,
      url: publicUrl(url),
      retrievedAt,
      payload,
      httpStatus: 200,
      status: "available",
      payloadSha256: payloadHash(payload),
    };
    await this.options.store.put(sha256(capture.url), capture);
    return capture;
  }
  async request(
    provider: string,
    url: string,
    authentication?: { required: boolean; value?: string },
    validate?: (payload: unknown) => boolean,
  ): Promise<Capture> {
    const safe = publicUrl(url);
    const cached = await this.options.store.get(sha256(safe));
    if (cached && (!validate || validate(cached.payload))) return cached;
    if (cached && this.options.offline)
      return {
        ...cached,
        status: "invalid_json",
        error: "Capture incompatible avec le schéma ou l’identité fournisseur.",
      };
    if (this.options.offline)
      return this.empty(
        provider,
        safe,
        "offline_missing",
        "Capture absente ; aucune requête en mode hors réseau.",
      );
    if (authentication?.required && !authentication.value)
      return this.empty(
        provider,
        safe,
        "auth_missing",
        "Clé fournisseur absente ; aucune requête effectuée.",
      );
    const previous = this.queues.get(provider) ?? Promise.resolve();
    const run = previous
      .catch(() => undefined)
      .then(async () => {
        const stored = await this.options.store.get(sha256(safe));
        return stored && (!validate || validate(stored.payload))
          ? stored
          : this.fetchCapture(provider, url, authentication?.value, validate);
      });
    this.queues.set(provider, run);
    return run;
  }
  private async fetchCapture(
    provider: string,
    url: string,
    secret?: string,
    validate?: (payload: unknown) => boolean,
  ): Promise<Capture> {
    const wait = Math.max(
      0,
      (this.nextAllowed.get(provider) ?? 0) - this.now(),
    );
    if (wait > this.options.maximumRetryAfterMs)
      return {
        ...this.empty(
          provider,
          url,
          "rate_limited",
          "Retry-After supérieur à la fenêtre d’exécution ; collecte différée.",
        ),
        retryAt: new Date(this.now() + wait).toISOString(),
      };
    if (wait)
      await (
        this.options.sleep ??
        ((ms) => new Promise((resolve) => setTimeout(resolve, ms)))
      )(wait);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs);
    try {
      const response = await (this.options.fetch ?? fetch)(url, {
        headers: {
          "User-Agent": this.options.userAgent,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      this.nextAllowed.set(
        provider,
        this.now() + this.options.minimumIntervalMs,
      );
      if (response.status === 429 || response.status === 503) {
        const retry = retryAfterMs(
          response.headers.get("Retry-After"),
          this.now(),
        );
        this.nextAllowed.set(
          provider,
          this.now() + Math.max(retry, this.options.minimumIntervalMs),
        );
        return {
          ...this.empty(
            provider,
            url,
            "rate_limited",
            "Limitation fournisseur ; aucun zéro imputé.",
            response.status,
          ),
          retryAt: new Date(this.now() + retry).toISOString(),
        };
      }
      if (!response.ok)
        return this.empty(
          provider,
          url,
          "http_error",
          `HTTP ${response.status}`,
          response.status,
        );
      const text = await response.text();
      if (text.length > 15_000_000)
        return this.empty(
          provider,
          url,
          "invalid_json",
          "Réponse trop volumineuse.",
          response.status,
        );
      let payload: unknown;
      try {
        payload = redact(JSON.parse(text), secret);
      } catch {
        return this.empty(
          provider,
          url,
          "invalid_json",
          "JSON fournisseur invalide.",
          response.status,
        );
      }
      if (validate && !validate(payload))
        return this.empty(
          provider,
          url,
          "invalid_json",
          "Réponse structurée incompatible avec le schéma ou l’identifiant fournisseur.",
          response.status,
        );
      const capture: Capture = {
        provider,
        url: publicUrl(url),
        retrievedAt: new Date(this.now()).toISOString(),
        httpStatus: response.status,
        status: "available",
        payload,
        payloadSha256: payloadHash(payload),
      };
      await this.options.store.put(sha256(capture.url), capture);
      return capture;
    } catch {
      this.nextAllowed.set(
        provider,
        this.now() + this.options.minimumIntervalMs,
      );
      return this.empty(
        provider,
        url,
        "network_error",
        controller.signal.aborted
          ? "Délai fournisseur dépassé."
          : "Erreur réseau ; aucune valeur supposée.",
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
