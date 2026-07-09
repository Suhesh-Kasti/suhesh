import type { Metadata } from "next";
import Projects from "@/components/Projects";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "Featured Work — Cybersecurity Projects & Research",
  description:
    "Showcase of Suhesh Kasti's offensive security projects: AI-powered security agents, CLI recon frameworks, network intrusion detection, malware analysis labs, and vulnerability research tools.",
  alternates: { canonical: `${BASE_URL}/work` },
  openGraph: {
    title: "Featured Work — Cybersecurity Projects & Research",
    description:
      "Showcase of Suhesh Kasti's offensive security projects: AI-powered security agents, CLI recon frameworks, network intrusion detection, malware analysis labs, and vulnerability research tools.",
    url: `${BASE_URL}/work`,
    siteName: "SCHIZO",
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SCHIZO — Suhesh Kasti's cybersecurity portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Work — Cybersecurity Projects & Research",
    description:
      "Showcase of Suhesh Kasti's offensive security projects: AI-powered security agents, CLI recon frameworks, network intrusion detection, malware analysis labs, and vulnerability research tools.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function WorkPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <Projects />
      </main>
    </>
  );
}
