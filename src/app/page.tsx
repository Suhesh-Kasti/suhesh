import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import AboutSection from "@/components/AboutSection";
import BrainDumpPreview from "@/components/BrainDumpPreview";
import ContactSection from "@/components/ContactSection";

const BASE_URL = "https://suhesh.com.np";
const HOME_DESCRIPTION =
  "Suhesh Kasti — application security engineer and offensive security researcher. Penetration testing, exploit development, malware analysis and CTF writeups, plus a brain dump of practical web security guides and free browser-based security tools.";

export const metadata: Metadata = {
  description: HOME_DESCRIPTION,
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "Suhesh Kasti — Application Security & Offensive Security",
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Suhesh Kasti — Application Security & Offensive Security",
    description: HOME_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <AboutSection featuredCerts={["CAPT", "CWSE", "F5 CTS", "F5 CA"]} />
        <BrainDumpPreview />
        <Projects />
        <ContactSection />
      </main>
    </>
  );
}
