import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "About — Application Security Engineer & Creative Coder",
  description:
    "Suhesh Kasti is an application security engineer and offensive security researcher. Learn about his background, expertise in web security, exploit development, malware analysis, and approach to creative problem-solving.",
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: "About — Application Security Engineer & Creative Coder",
    description:
      "Suhesh Kasti is an application security engineer and offensive security researcher. Learn about his background, expertise in web security, exploit development, malware analysis, and approach to creative problem-solving.",
    url: `${BASE_URL}/about`,
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
    title: "About — Application Security Engineer & Creative Coder",
    description:
      "Suhesh Kasti is an application security engineer and offensive security researcher. Learn about his background, expertise in web security, exploit development, malware analysis, and approach to creative problem-solving.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function AboutPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <AboutSection />
      </main>
    </>
  );
}
