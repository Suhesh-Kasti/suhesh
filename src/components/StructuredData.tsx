import { jsonLdScript } from "@/lib/json-ld";
import { SOCIAL } from "@/lib/design-tokens";

const BASE_URL = "https://suhesh.com.np";

/**
 * Site-wide entity graph. Declaring the Organization and Blog nodes here means the
 * BlogPosting records on every article can reference them by @id instead of repeating
 * (and disagreeing about) the same facts.
 */
export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${BASE_URL}/#person`,
        name: "Suhesh Kasti",
        givenName: "Suhesh",
        familyName: "Kasti",
        url: BASE_URL,
        jobTitle: "Application Security Engineer",
        description:
          "Application security engineer working with F5 BIG-IP (LTM, DNS/GTM, ASM/Advanced WAF) for application delivery and protection, with a background in penetration testing, networking and Linux systems administration.",
        sameAs: [SOCIAL.github.url, SOCIAL.twitter.url, SOCIAL.linkedin.url, SOCIAL.youtube.url],
        image: `${BASE_URL}/opengraph-image`,
        worksFor: { "@id": `${BASE_URL}/#organization` },
        knowsAbout: [
          "Application Security",
          "F5 BIG-IP",
          "Web Application Firewall",
          "Application Delivery",
          "Load Balancing",
          "Network Security",
          "Penetration Testing",
          "Web Security",
          "DNS",
          "Linux Administration",
          "Docker",
          "SIEM",
        ],
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "SCHIZO",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/logo-dark.png`,
        },
        founder: { "@id": `${BASE_URL}/#person` },
        sameAs: [SOCIAL.github.url, SOCIAL.twitter.url, SOCIAL.linkedin.url],
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "SCHIZO",
        description:
          "A creative space where offensive security meets art. Portfolio, brain dump, and playground — all in one canvas. Practical cybersecurity knowledge, written up properly.",
        publisher: { "@id": `${BASE_URL}/#organization` },
        author: { "@id": `${BASE_URL}/#person` },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/braindump?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Blog",
        "@id": `${BASE_URL}/braindump/#blog`,
        name: "SCHIZO Brain Dump",
        description:
          "Long-form security writing: web exploitation, penetration testing, DNS and Linux administration, CTF walkthroughs, cheatsheets and structured learning roadmaps.",
        url: `${BASE_URL}/braindump`,
        inLanguage: "en",
        publisher: { "@id": `${BASE_URL}/#organization` },
        author: { "@id": `${BASE_URL}/#person` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}/tools/#collection`,
        name: "Security Tools",
        description:
          "Free, browser-based security utilities: payload references, JWT and certificate inspectors, header analyzers, hash identification and reconnaissance helpers.",
        url: `${BASE_URL}/tools`,
        isPartOf: { "@id": `${BASE_URL}/#website` },
        about: { "@id": `${BASE_URL}/#person` },
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
