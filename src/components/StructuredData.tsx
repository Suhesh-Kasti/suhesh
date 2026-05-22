export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://suhesh.com.np/#person",
        name: "Suhesh Kasti",
        givenName: "Suhesh",
        familyName: "Kasti",
        url: "https://suhesh.com.np",
        jobTitle: "Application Security Engineer & Offensive Security Researcher",
        description:
          "Application security engineer and offensive security researcher specializing in web security, exploit development, malware analysis, and red team operations.",
        sameAs: [
          "https://github.com/suheshkasti",
          "https://twitter.com/suheshkasti",
          "https://linkedin.com/in/suheshkasti",
        ],
        image: "https://suhesh.com.np/og-image.png",
        knowsAbout: [
          "Application Security",
          "Offensive Security",
          "Penetration Testing",
          "Exploit Development",
          "Malware Analysis",
          "Reverse Engineering",
          "Web Security",
          "Red Teaming",
          "Capture The Flag",
          "Vulnerability Research",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://suhesh.com.np/#website",
        url: "https://suhesh.com.np",
        name: "SCHIZO",
        description:
          "A creative space where offensive security meets art. Portfolio, brain dump, and playground — all in one canvas. The ultimate source of truth for practical cybersecurity knowledge.",
        author: { "@id": "https://suhesh.com.np/#person" },
        inLanguage: "en",
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
