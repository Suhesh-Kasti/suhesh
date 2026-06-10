import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import AboutSection from "@/components/AboutSection";
import BrainDumpPreview from "@/components/BrainDumpPreview";
import ContactSection from "@/components/ContactSection";
import SearchButton from "@/components/SearchButton";
import ScrollSnapHandler from "@/components/ScrollSnapHandler";

export default function Home() {
  return (
    <ScrollSnapHandler>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <BrainDumpPreview />
        <Projects />
        <ContactSection />
      </main>
      <SearchButton />
    </ScrollSnapHandler>
  );
}
