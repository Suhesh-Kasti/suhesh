import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import AboutSection from "@/components/AboutSection";
import BrainDumpPreview from "@/components/BrainDumpPreview";
import ContactSection from "@/components/ContactSection";

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
