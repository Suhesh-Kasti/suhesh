import { jsonLdScript } from "@/lib/json-ld";

const BASE_URL = "https://suhesh.com.np";

interface ItemListStructuredDataProps {
  name: string;
  description: string;
  path: string;
  items: { name: string; url: string }[];
}

/**
 * Describes a collection page (the article archive, the tool directory) as an ordered
 * ItemList so search engines and assistants can enumerate everything it links to.
 */
export function ItemListStructuredData({ name, description, path, items }: ItemListStructuredDataProps) {
  const url = `${BASE_URL}${path}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}/#itemlist`,
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
    />
  );
}
