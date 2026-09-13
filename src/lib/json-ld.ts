/**
 * Serialises structured data for embedding in a <script type="application/ld+json"> tag.
 *
 * JSON.stringify alone is not enough: a title containing "</script>" would close the tag early
 * and let the rest be parsed as markup. Escaping "<" as \u003c is valid JSON, so crawlers read
 * exactly the same values.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
