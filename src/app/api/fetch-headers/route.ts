import { assertSafeUrl, clientKey, isSameOrigin, rateLimit } from "@/lib/api-guard";

export const dynamic = "force-dynamic";

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8000;
const MAX_HEADERS = 120;
const MAX_VALUE_LENGTH = 2000;
const REDIRECT_CODES = [301, 302, 303, 307, 308];

function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function GET(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return reply({ error: "This endpoint only answers requests from the site itself." }, 403);
  }
  if (!rateLimit(clientKey(request, "fetch-headers"), 20, 60_000)) {
    return reply({ error: "Rate limit reached. Try again in a minute." }, 429);
  }

  const target = new URL(request.url).searchParams.get("url");
  if (!target) return reply({ error: "Add a ?url= parameter." }, 400);

  let current = target;
  let redirects = 0;

  try {
    for (;;) {
      const safe = await assertSafeUrl(current);
      if (!safe.url) return reply({ error: safe.error }, 400);

      const init: RequestInit = {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: "*/*", "user-agent": "header-analyzer/1.0 (+site tool)" },
      };

      let response = await fetch(safe.url, { ...init, method: "HEAD" });
      if (response.status === 403 || response.status === 405 || response.status === 501) {
        response = await fetch(safe.url, { ...init, method: "GET" });
      }
      await response.body?.cancel();

      if (REDIRECT_CODES.includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) return reply({ error: "The host redirected without a location." }, 400);
        if (redirects >= MAX_REDIRECTS) return reply({ error: "Too many redirects." }, 400);
        current = new URL(location, safe.url).toString();
        redirects += 1;
        continue;
      }

      const headers: { name: string; value: string }[] = [];
      response.headers.forEach((value, name) => {
        if (headers.length < MAX_HEADERS) headers.push({ name, value: value.slice(0, MAX_VALUE_LENGTH) });
      });

      return reply({
        url: safe.url.toString(),
        status: response.status,
        statusText: response.statusText,
        redirects,
        headers,
      });
    }
  } catch (reason) {
    const timedOut = reason instanceof Error && (reason.name === "TimeoutError" || reason.name === "AbortError");
    return reply({ error: timedOut ? "The target did not respond in time." : "Could not reach that host." }, 502);
  }
}
