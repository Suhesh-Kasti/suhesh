import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "Contact — Get in Touch with Suhesh Kasti",
  description:
    "Reach out to Suhesh Kasti for cybersecurity consulting, collaboration, speaking engagements, or just to talk security. Available via email, GitHub, Twitter, and LinkedIn.",
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: "Contact — Get in Touch with Suhesh Kasti",
    description:
      "Reach out to Suhesh Kasti for cybersecurity consulting, collaboration, speaking engagements, or just to talk security. Available via email, GitHub, Twitter, and LinkedIn.",
    url: `${BASE_URL}/contact`,
    siteName: "SCHIZO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Get in Touch with Suhesh Kasti",
    description:
      "Reach out to Suhesh Kasti for cybersecurity consulting, collaboration, speaking engagements, or just to talk security. Available via email, GitHub, Twitter, and LinkedIn.",
  },
};

export default function ContactPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <ContactSection />
      </main>
    </>
  );
}
