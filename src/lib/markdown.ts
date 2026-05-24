function parseSimpleMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-extrabold text-brutal-pink">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic text-fg-muted">$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="font-mono text-sm bg-fg/10 px-1 py-0.5 border border-fg-muted/30">$1</code>')
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, '<span class="block pl-3 border-l-2 border-brutal-yellow my-1"><span class="font-mono text-2xs text-brutal-yellow mr-1">$1.</span>$2</span>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<span class="block pl-3 border-l-2 border-brutal-pink my-1">$1</span>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-bold uppercase text-fg mt-4 mb-2" style="font-family:var(--font-clash-display)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-extrabold uppercase text-fg mt-4 mb-2" style="font-family:var(--font-clash-display)">$1</h2>')
    // Double newlines → paragraph break
    .replace(/\n\n/g, '<div class="my-2"></div>')
    // Single newlines → line break
    .replace(/\n/g, "<br/>");
}

export { parseSimpleMarkdown };
