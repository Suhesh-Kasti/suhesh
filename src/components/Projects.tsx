"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Link from "next/link";
import { WORK, TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
            const isHovered = hoveredIndex === index;
            const spanClasses =
              project.span.cols === 2
                ? "sm:col-span-2"
                : "sm:col-span-1";
            const rowClasses =
              project.span.rows === 2
                ? "sm:row-span-2"
                : "sm:row-span-1";
            const isMobileHidden = index >= 4;

            return (
              <div
                key={project.title}
                className={`relative ${spanClasses} ${rowClasses} ${isMobileHidden ? "hidden sm:block" : ""}`}
              >
                <motion.div
                  className={`project-card relative border-2 border-fg p-5 md:p-6 cursor-pointer overflow-hidden group h-full`}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    boxShadow: isHovered
                      ? `8px 8px 0px ${project.color}`
                      : `4px 4px 0px ${project.color}`,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  data-cursor-label={project.category}
                  animate={{
                    x: isHovered ? -4 : 0,
                    y: isHovered ? -4 : 0,
                  }}
                  transition={MOTION.snappy}
                >
                  <Link href={project.url} className="absolute inset-0 z-10" aria-label={project.title}>
                    <span className="sr-only">{project.title}</span>
                  </Link>
                {/* Color background accent */}
                <div
                  className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    backgroundColor: project.color,
                    opacity: isHovered ? 0.06 : 0.02,
                  }}
                />

                {/* Top color stripe */}
                <div
                  className="absolute top-0 left-0 w-full transition-all duration-300"
                  style={{
                    backgroundColor: project.color,
                    height: isHovered ? "5px" : "3px",
                  }}
                />

                {/* Left color stripe (subtle) */}
                <div
                  className="absolute top-0 left-0 h-full transition-all duration-300 hidden sm:block"
                  style={{
                    backgroundColor: project.color,
                    width: isHovered ? "4px" : "0px",
                    opacity: 0.7,
                  }}
                />

                <div
                  className="relative z-10 h-full flex flex-col justify-between"
                  style={{
                    paddingLeft: isHovered ? "0.5rem" : "0",
                    transition: "padding-left 0.2s ease",
                  }}
                >
                  <div>
                    {/* Category */}
                    <span
                      className="font-mono text-2xs uppercase tracking-label inline-block px-2 py-0.5 border transition-all duration-300"
                      style={{
                        fontFamily: TYPOGRAPHY.fontMono,
                        letterSpacing: TYPOGRAPHY.tracking.label,
                        color: project.color,
                        borderColor: isHovered ? project.color : "var(--color-fg-muted)",
                      }}
                    >
                      {project.category}
                    </span>

                    {/* Title */}
                    <h3
                      className="mt-3 font-display text-xl md:text-2xl font-bold uppercase text-fg leading-tight transition-colors duration-200"
                      style={{
                        fontFamily: TYPOGRAPHY.fontDisplay,
                        color: isHovered ? project.color : undefined,
                      }}
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

                  {/* Tags + Link */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-2xs uppercase px-2 py-0.5 border border-fg/40 text-fg-muted group-hover:border-fg group-hover:text-fg transition-all"
                          style={{ fontFamily: TYPOGRAPHY.fontMono }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between items-center gap-3">
                      <Link
                        href={project.url}
                        className="font-mono text-xs uppercase text-fg hover:text-brutal-pink transition-colors flex items-center gap-1 whitespace-nowrap"
                        style={{
                          fontFamily: TYPOGRAPHY.fontMono,
                          letterSpacing: TYPOGRAPHY.tracking.mono,
                        }}
                        data-cursor-label="View Project"
                      >
                        Details
                        <motion.span
                          animate={{ x: isHovered ? 3 : 0 }}
                          transition={MOTION.snappy}
                        >
                          →
                        </motion.span>
                      </Link>
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
