import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import ImageGallery from "@/components/ImageGallery";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "Local AI Security Agent — Offline LLM-powered Security Research",
  description:
    "A completely offline AI agent stack for authorized security research. Dual LLMs, RAG with live CVE data, MCP tool integrations, and Telegram bot control — all running locally on a single GPU.",
};

function ProjectLayout({ title, category, color, children }: { title: string; category: string; color: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <article className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <span className="font-mono text-2xs uppercase tracking-label px-2 py-0.5 border inline-block" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, borderColor: color, color }}>{category}</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold uppercase text-fg leading-[1.05]" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{title}</h1>
          <hr className="mt-8 border-0 h-[2px] bg-fg mb-8" />
          <div className="font-sans text-base leading-relaxed text-fg space-y-4" style={{ fontFamily: TYPOGRAPHY.fontSans, maxWidth: "68ch" }}>
            {children}
          </div>
        </article>
      </main>
      <SearchButton />
    </>
  );
}

export default function AIAgent() {
  return (
    <ProjectLayout title="Local AI Security Agent" category="AI Security" color={COLORS.orange}>
      <p>A completely offline AI agent stack for authorized security research. Two local LLMs (9B fast, 27B thorough), a RAG knowledge base with live CVE data, MCP tool integrations, and Telegram bot control — all on a single NVIDIA L4 GPU. No cloud APIs, no data leaving the machine.</p>

      <h2 className="font-display text-2xl font-bold uppercase text-fg mt-8 mb-4" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>Architecture</h2>
      <ul className="space-y-2 list-none">
        {["Dual-model routing: 9B Gemma for fast responses, 27B Qwen for deep analysis", "Qdrant RAG pipeline with daily CVE ingestion from NVD, CISA KEV, MITRE ATT&CK", "MCP server integrations: qdrant-search, nmap, web-search, file-system", "Telegram bot interface with per-user session management", "Tool orchestration engine with parallel subagent spawning", "Session memory with SQLite — remembers findings between conversations"].map((item) => (
          <li key={item} className="flex items-start gap-2" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            <span className="text-spider-orange font-mono font-bold mt-[2px] shrink-0">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 p-4 border-2 border-spider-orange bg-spider-orange/5">
        <span className="font-mono text-2xs uppercase text-spider-orange" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Tech Stack</span>
        <p className="mt-1 font-mono text-sm" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Python · llama.cpp · Qdrant · sentence-transformers · FastAPI · Telegram API · Docker</p>
      </div>

      <ImageGallery
        images={[
          { src: "/images/projects/local-ai.png", alt: "Local AI Security Agent — architecture diagram" },
        ]}
        color={COLORS.orange}
      />
    </ProjectLayout>
  );
}
