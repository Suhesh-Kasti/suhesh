/**
 * The assistant's model chain, cheapest first.
 *
 * Order: every Gemini key, then DeepSeek. Small models were deliberately dropped — the
 * weak ones were the source of the invented answers.
 * Within a provider, several keys can be supplied, so three free Gemini accounts give three
 * daily allowances before anything paid is touched. A key that comes back rate-limited or
 * rejected is skipped for this request and the next one is tried; if every provider fails
 * the caller falls through to its own paths.
 *
 * Keys arrive as Cloudflare secrets and are read from the Worker env, never from the client,
 * so nothing here is reachable from the browser. DeepSeek is last on purpose: by the time a
 * request reaches it, every free option has already declined, which needs real volume.
 */
type Env = Record<string, unknown> | undefined;

interface Provider {
  name: string;
  keys: string[];
  model: string;
}

// Short answers only now that thinking is off; keeps the paid tier cheap too.
const MAX_TOKENS = 500;
const TEMPERATURE = 0.6;

function read(env: Env, ...names: string[]): string[] {
  for (const name of names) {
    const fromWorker = env?.[name];
    const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
    const raw = (typeof fromWorker === "string" && fromWorker) || fromProcess || "";
    if (raw) {
      return raw
        .split(/[,\s]+/)
        .map((key) => key.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/** Providers in the order they should be tried. Each may hold several keys. */
export function providerChain(env: Env): Provider[] {
  const chain: Provider[] = [];

  const gemini = read(env, "GEMINI_API_KEYS", "GEMINI_API_KEY");
  if (gemini.length) chain.push({ name: "gemini", keys: gemini, model: "gemini-3.8-flash" });


  const deepseek = read(env, "DEEPSEEK_API_KEYS", "DEEPSEEK_API_KEY");
  if (deepseek.length) chain.push({ name: "deepseek", keys: deepseek, model: "deepseek-flash" });

  return chain;
}

export function hasExternalProvider(env: Env): boolean {
  return providerChain(env).length > 0;
}

/** Providers that cost money, listed so the route can log when one is actually used. */
export const PAID_PROVIDERS = new Set(["deepseek"]);

async function askGemini(provider: Provider, key: string, query: string, system: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: query }] }],
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
          temperature: TEMPERATURE,
          // Thinking cost ~190 tokens per call and added nothing for short, factual answers.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`${provider.name} HTTP ${res.status}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("").trim();
}

/** Groq and DeepSeek both speak the OpenAI chat shape. */
async function askOpenAiStyle(
  provider: Provider,
  key: string,
  baseUrl: string,
  query: string,
  system: string
): Promise<string> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: query },
      ],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
    }),
  });
  if (!res.ok) throw new Error(`${provider.name} HTTP ${res.status}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

/**
 * Walks the chain until some provider answers. Returns "" when none can, which lets the
 * caller decide what to do rather than surfacing a provider error to the visitor.
 */
export async function askExternalProviders(
  query: string,
  system: string,
  env: Env,
  options: { includePaid?: boolean } = {}
): Promise<string> {
  const chain = providerChain(env).filter(
    (provider) => options.includePaid === true || !PAID_PROVIDERS.has(provider.name)
  );
  for (const provider of chain) {
    for (const key of provider.keys) {
      try {
        const answer =
          provider.name === "gemini"
            ? await askGemini(provider, key, query, system)
            : await askOpenAiStyle(
                provider,
                key,
                provider.name === "groq"
                  ? "https://api.groq.com/openai/v1/chat/completions"
                  : "https://api.deepseek.com/chat/completions",
                query,
                system
              );
        if (answer) {
          if (PAID_PROVIDERS.has(provider.name)) {
            console.log(`assistant: every free provider declined, using ${provider.name}`);
          }
          return answer;
        }
      } catch (error) {
        console.log(`assistant: ${provider.name} key failed (${error instanceof Error ? error.message : error})`);
      }
    }
  }
  return "";
}
