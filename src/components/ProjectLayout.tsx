import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY } from "@/lib/design-tokens";

export default function ProjectLayout({
  title,
  category,
  color,
  children,
}: {
  title: string;
  category: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <article className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <span
            className="font-mono text-2xs uppercase tracking-label px-2 py-0.5 border inline-block"
            style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, borderColor: color, color }}
          >
            {category}
          </span>
          <h1
            className="mt-3 font-display text-4xl md:text-5xl font-extrabold uppercase text-fg leading-[1.05]"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >
            {title}
          </h1>
          <hr className="mt-8 mb-8 border-0 h-[2px] bg-fg" />
          <div
            className="font-sans text-base leading-relaxed text-fg space-y-4"
            style={{ fontFamily: TYPOGRAPHY.fontSans, maxWidth: "68ch" }}
          >
            {children}
          </div>
        </article>
      </main>
      <SearchButton />
    </>
  );
}
