import { jsonLdScript } from "@/lib/json-ld";
import { getToolMeta } from "@/lib/tool-metadata";

const BASE_URL = "https://suhesh.com.np";

/**
 * Describes a browser tool as a free web application, plus its breadcrumb trail, so search
 * engines and assistants can tell what the page actually does and where it sits in the site.
 */
export function ToolStructuredData({ slug }: { slug: string }) {
  const tool = getToolMeta(slug);
  if (!tool) return null;

  const url = `${BASE_URL}/tools/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#app`,
        name: tool.name,
        url,
        description: tool.description,
        applicationCategory: "SecurityApplication",
        applicationSubCategory: "Cybersecurity tool",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser with JavaScript enabled",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: { "@id": `${BASE_URL}/#person` },
        publisher: { "@id": `${BASE_URL}/#organization` },
        isPartOf: { "@id": `${BASE_URL}/tools/#collection` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${BASE_URL}/tools` },
          { "@type": "ListItem", position: 3, name: tool.name, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
    />
  );
}
