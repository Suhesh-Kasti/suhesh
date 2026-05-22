interface BlogPostingStructuredDataProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
}

export function BlogPostingStructuredData({
  title,
  description,
  date,
  slug,
  tags,
}: BlogPostingStructuredDataProps) {
  const url = `https://suhesh.com.np/braindump/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}/#blogposting`,
    headline: title,
    description,
    datePublished: date,
    author: {
      "@type": "Person",
      "@id": "https://suhesh.com.np/#person",
      name: "Suhesh Kasti",
      url: "https://suhesh.com.np",
    },
    publisher: {
      "@type": "Organization",
      name: "SCHIZO",
      url: "https://suhesh.com.np",
    },
    url,
    keywords: tags.join(", "),
    isPartOf: {
      "@type": "Blog",
      "@id": "https://suhesh.com.np/braindump/#blog",
      name: "SCHIZO Brain Dump",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
