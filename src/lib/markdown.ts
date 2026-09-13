/**
 * Renders the small subset of markdown the assistant actually emits: bold, inline code,
 * links and line breaks. The text is escaped BEFORE the substitutions, so model output
 * can never inject markup, and links are restricted to this site — the answer is
 * untrusted text that arrives over the network.
 */
function parseSimpleMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return escaped
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_whole, label, url) => {
      const safe = /^https?:\/\/suhesh\.com\.np\//.test(url) || url.startsWith("/") ? url : "";
      return safe
        ? `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="underline decoration-2 underline-offset-2 hover:text-brutal-pink-text">${label}</a>`
        : label;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.9em] bg-fg/10 px-1">$1</code>')
    .replace(/\n/g, "<br/>");
}

export { parseSimpleMarkdown };
