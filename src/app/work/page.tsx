import type { Metadata } from "next";
import Projects from "@/components/Projects";

export const metadata: Metadata = {
  title: "Featured Work — Cybersecurity Projects & Research",
  description:
    "Showcase of Suhesh Kasti's offensive security projects: AI-powered security agents, CLI recon frameworks, network intrusion detection, malware analysis labs, and vulnerability research tools.",
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
