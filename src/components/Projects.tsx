"use client";

import { useRef, useEffect, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Link from "next/link";
import { WORK, TYPOGRAPHY } from "@/lib/design-tokens";

gsap.registerPlugin(ScrollTrigger);

interface ProjectCardData {
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  url: string;
  span: { cols: number; rows: number };
}

const BENTO_CARDS: ProjectCardData[] = WORK.projects.map((p, i) => ({
  title: p.title,
  category: p.category,
  description: p.description,
  tags: [...p.tags] as string[],
  color: p.color,
  url: p.url,
  span: i === 0 || i === 5 ? { cols: 2, rows: 1 } : i === 2 ? { cols: 1, rows: 2 } : { cols: 1, rows: 1 },
}));

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax header
      const header = sectionRef.current?.querySelector(".section-header");
      if (header) {
        gsap.fromTo(header, { y: 0 }, {
          y: -20, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.5 },
        });
      }

      const cards = gridRef.current?.querySelectorAll(".project-card") ?? [];
      if (cards.length === 0) return;

      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative w-full bg-surface py-20 md:py-32 section-divider"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-16">
          <h2
            className="section-header font-display text-3xl md:text-5xl font-extrabold uppercase text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >
            Featured Work
          </h2>
          <div className="flex-1 h-1 bg-fg" />
          <span
            className="font-mono text-xs uppercase text-fg-muted tracking-label hidden sm:inline"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
          >
            {BENTO_CARDS.length} Projects
          </span>
        </div>

        {/* Bento Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)] gap-4 md:gap-5"
        >
          {BENTO_CARDS.map((project, index) => {
            const spanClasses = project.span.cols === 2 ? "sm:col-span-2" : "sm:col-span-1";
            const rowClasses = project.span.rows === 2 ? "sm:row-span-2" : "sm:row-span-1";
            const isMobileHidden = index >= 4;

            return (
              <div
                key={project.title}
                className={`relative ${spanClasses} ${rowClasses} ${isMobileHidden ? "hidden sm:block" : ""}`}
              >
                {/* The hover state is pure CSS (group-hover / group-focus-within) so it stays on
                    the compositor instead of re-rendering React on every mouse move, and it works
                    the same when the card is reached by keyboard. */}
                <motion.div
                  className="project-card group relative h-full cursor-pointer overflow-hidden border-2 border-fg p-5 md:p-6
                    shadow-[4px_4px_0px_var(--accent)] hover:shadow-[8px_8px_0px_var(--accent)] focus-within:shadow-[8px_8px_0px_var(--accent)]
                    transition-[transform,box-shadow] duration-300 ease-out
                    hover:-translate-x-1 hover:-translate-y-1 focus-within:-translate-x-1 focus-within:-translate-y-1"
                  style={{ backgroundColor: "var(--color-surface)", "--accent": project.color } as CSSProperties}
                  data-cursor-label={project.category}
                >
                  <Link
                    href={project.url}
                    className="absolute inset-0 z-20 outline-none"
                    aria-label={`${project.title} — ${project.category}`}
                  >
                    <span className="sr-only">{project.title}</span>
                  </Link>

                  {/* Colour wash */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.02] transition-opacity duration-300 group-hover:opacity-[0.06] group-focus-within:opacity-[0.06]"
                    style={{ backgroundColor: project.color }}
                  />

                  {/* Top colour stripe */}
                  <div
                    className="pointer-events-none absolute left-0 top-0 h-[3px] w-full transition-[height] duration-300 group-hover:h-[5px] group-focus-within:h-[5px]"
                    style={{ backgroundColor: project.color }}
                  />

                  {/* Left colour stripe */}
                  <div
                    className="pointer-events-none absolute left-0 top-0 hidden h-full w-0 transition-[width] duration-300 group-hover:w-[4px] group-focus-within:w-[4px] sm:block"
                    style={{ backgroundColor: project.color, opacity: 0.7 }}
                  />

                  <div className="pointer-events-none relative flex h-full flex-col justify-between">
                    <div>
                      {/* Category */}
                      <span
                        className="inline-block border border-fg-muted px-2 py-0.5 font-mono text-2xs uppercase tracking-label transition-colors duration-300 group-hover:border-[var(--accent)] group-focus-within:border-[var(--accent)]"
                        style={{
                          fontFamily: TYPOGRAPHY.fontMono,
                          letterSpacing: TYPOGRAPHY.tracking.label,
                          color: project.color,
                        }}
                      >
                        {project.category}
                      </span>

                      {/* Title */}
                      <h3
                        className="mt-3 font-display text-xl md:text-2xl font-bold uppercase text-fg leading-tight transition-colors duration-200 group-hover:text-[var(--accent)] group-focus-within:text-[var(--accent)]"
                        style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
                      >
                        {project.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="mt-2 text-sm leading-relaxed text-fg-muted line-clamp-3"
                        style={{ fontFamily: TYPOGRAPHY.fontSans }}
                      >
                        {project.description}
                      </p>
                    </div>

                    {/* Tags + link */}
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-2xs uppercase px-2 py-0.5 border border-fg/40 text-fg-muted transition-colors duration-300 group-hover:border-fg/70 group-focus-within:border-fg/70"
                            style={{ fontFamily: TYPOGRAPHY.fontMono }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between items-center gap-3">
                        <span
                          className="flex items-center gap-1 whitespace-nowrap font-mono text-xs uppercase text-fg transition-colors duration-300 group-hover:text-[var(--accent)] group-focus-within:text-[var(--accent)]"
                          style={{
                            fontFamily: TYPOGRAPHY.fontMono,
                            letterSpacing: TYPOGRAPHY.tracking.mono,
                          }}
                        >
                          Details
                          <span className="transition-transform duration-300 group-hover:translate-x-1 group-focus-within:translate-x-1">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Mobile-only "View All Projects" CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/projects"
            className="inline-block font-mono text-sm uppercase border-2 border-fg px-8 py-4 text-fg hover:bg-fg hover:text-surface transition-all shadow-brutal-sm"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.mono,
            }}
            data-cursor-label="View All Projects"
          >
            View All Projects →
          </Link>
        </div>
      </div>
    </section>
  );
}
