const BASE_URL = "https://suhesh.com.np";

interface BlogPostingStructuredDataProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  section?: string;
  image?: string;
}

/**
 * Article-level structured data. The Person, Organization and Blog nodes are declared once
 * site-wide (see StructuredData.tsx) and referenced here by @id, so the graph stays consistent.
 */
export function BlogPostingStructuredData({
  title,
  description,
  date,
  slug,
  tags,
  section,
  image,
}: BlogPostingStructuredDataProps) {
  const url = `${BASE_URL}/braindump/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}/#blogposting`,
        headline: title,
        description,
        datePublished: date,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: [image ? `${BASE_URL}${image}` : `${BASE_URL}/opengraph-image`],
        author: { "@id": `${BASE_URL}/#person` },
        publisher: { "@id": `${BASE_URL}/#organization` },
        keywords: tags.join(", "),
        ...(section ? { articleSection: section } : {}),
        isPartOf: { "@id": `${BASE_URL}/braindump/#blog` },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Brain Dump", item: `${BASE_URL}/braindump` },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
