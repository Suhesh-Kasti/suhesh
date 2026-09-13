/**
 * Renders the small subset of markdown the assistant actually emits: bullets, bold,
 * inline code, links and line breaks.
 *
 * The text is escaped BEFORE any substitution, so model output can never inject markup.
 * Links are then restricted: same-site paths, mailto addresses, and a short list of real
 * outward hosts. An allowlist rather than a same-origin check is deliberate — contact
 * links legitimately point off-site, and a bare same-origin rule silently flattened every
 * one of them into plain text.
 */
const ALLOWED_HOSTS =
  /^https?:\/\/(?:[a-z0-9-]+\.)*(?:suhesh\.com\.np|x\.com|twitter\.com|youtube\.com|youtu\.be|t\.me|wa\.me|credly\.com|hackviser\.com)(?:\/|$)/i;

function safeUrl(url: string): string {
  if (url.startsWith("/")) return url;
  if (/^mailto:[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(url)) return url;
  return ALLOWED_HOSTS.test(url) ? url : "";
}

function parseSimpleMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return escaped
    .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_whole: string, label: string, url: string) => {
      const href = safeUrl(url);
      return href
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer" class="underline decoration-2 underline-offset-2 hover:text-brutal-pink-text">${label}</a>`
        : label;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.9em] bg-fg/10 px-1">$1</code>')
    .replace(/\n/g, "<br/>");
}

export { parseSimpleMarkdown };
