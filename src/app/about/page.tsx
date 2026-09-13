import type { Metadata } from "next";
import AboutSection from "@/components/AboutSection";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "About — Application Security Engineer & Creative Coder",
  description:
    "Suhesh Kasti is an application security engineer working with F5 BIG-IP application delivery and web application firewalls. Learn about his background, the path from ISP support into security engineering, and his approach to creative problem-solving.",
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: "About — Application Security Engineer & Creative Coder",
    description:
      "Suhesh Kasti is an application security engineer working with F5 BIG-IP application delivery and web application firewalls. Learn about his background, the path from ISP support into security engineering, and his approach to creative problem-solving.",
    url: `${BASE_URL}/about`,
    siteName: "SCHIZO",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Application Security Engineer & Creative Coder",
    description:
      "Suhesh Kasti is an application security engineer working with F5 BIG-IP application delivery and web application firewalls. Learn about his background, the path from ISP support into security engineering, and his approach to creative problem-solving.",
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
