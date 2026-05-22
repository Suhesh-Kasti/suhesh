import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import ImageGallery from "@/components/ImageGallery";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "remarkEnks — Browser Extension for Automated ISP Remarking",
  description:
    "Chrome/Firefox extension that automated remark writing for Subisu TSC department. One click to generate standardized remarks from contact numbers, problem descriptions, and resolution steps.",
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

export default function RemarkEnks() {
  return (
    <ProjectLayout title="remarkEnks" category="Automation" color={COLORS.yellow}>
      <p>A Chrome/Firefox browser extension that automated remark writing for Subisu TSC department. What used to be manual typing or copy-pasting became a single click. Operators could input contact numbers, describe problems, and document resolution measures — all standardized.</p>

      <h2 className="font-display text-2xl font-bold uppercase text-fg mt-8 mb-4" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>Impact</h2>
      <ul className="space-y-2 list-none">
        {["Eliminated manual remark typing — saved thousands of operator hours across the TSC department", "Standardized remark format across all operators for consistent customer communication", "Integrated contact number autofill from CRM lookup", "Template system for common issue types with dynamic field injection", "Deployed to 200+ workstations across Subisu branches"].map((item) => (
          <li key={item} className="flex items-start gap-2" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            <span className="text-spider-yellow font-mono font-bold mt-[2px] shrink-0">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 p-4 border-2 border-spider-yellow bg-spider-yellow/5">
        <span className="font-mono text-2xs uppercase text-spider-yellow" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Tech Stack</span>
        <p className="mt-1 font-mono text-sm" style={{ fontFamily: TYPOGRAPHY.fontMono }}>JavaScript · Chrome Extensions API · Firefox Add-ons API · Subisu CRM Integration</p>
      </div>

      <ImageGallery
        images={[
          { src: "/images/projects/remarkEnks.jpg", alt: "remarkEnks browser extension UI" },
        ]}
        color={COLORS.yellow}
      />
    </ProjectLayout>
  );
}
