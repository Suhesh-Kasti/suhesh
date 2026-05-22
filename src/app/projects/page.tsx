import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import Link from "next/link";
import { WORK, TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "Projects — Security Tools, Exploits & Experiments",
  description:
    "Explore Suhesh Kasti's cybersecurity projects: local AI security agents, CLI recon frameworks, network intrusion tools, malware analysis labs, and more. Practical offensive security tools and experiments.",
};

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative w-full bg-surface py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold uppercase text-fg mb-12" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>Projects</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WORK.projects.map((p) => (
                <Link key={p.title} href={p.url} className="block border-2 border-fg p-6 bg-surface hover:shadow-brutal-lg transition-all cursor-pointer group">
                  <span className="font-mono text-2xs uppercase tracking-label px-2 py-0.5 border inline-block" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, borderColor: p.color, color: p.color }}>{p.category}</span>
                  <h2 className="mt-3 font-display text-2xl font-bold uppercase text-fg group-hover:text-spider-pink transition-colors" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{p.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => <span key={t} className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted px-2 py-0.5" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{t}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SearchButton />
    </>
  );
}
