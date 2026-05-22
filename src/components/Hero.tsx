"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Link from "next/link";
import { HERO, TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

gsap.registerPlugin(ScrollTrigger);

function GlitchText({ text }: { text: string }) {
  const [glitching, setGlitching] = useState(false);
  const [off, setOff] = useState({ x: 0, y: 0 });

  const triggerGlitch = () => {
    if (glitching) return;
    setGlitching(true);
    setOff({ x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 6 });
    setTimeout(() => setGlitching(false), 150);
  };

  return (
    <span
      className="relative inline-block cursor-pointer select-none"
      onMouseEnter={triggerGlitch}
      onClick={triggerGlitch}
      data-cursor-label="GLITCH"
    >
      <span
        className="relative z-10 inline-block"
        style={{
          transform: glitching ? `translate(${off.x}px, ${off.y}px)` : "none",
          transition: "transform 0.06s ease",
          fontFamily: glitching ? "var(--font-press-start)" : "var(--font-clash-display)",
          fontSize: glitching ? "clamp(1.8rem, 7vw, 6rem)" : undefined,
          letterSpacing: glitching ? "0.05em" : undefined,
        }}
      >
        {text}
      </span>
      {glitching && (
        <>
          <span className="absolute inset-0 z-0 text-spider-pink select-none" style={{ clipPath: "inset(25% 0 55% 0)", transform: `translate(${-off.x * 2}px, ${off.y}px)`, fontFamily: "var(--font-press-start)" }} aria-hidden="true">{text}</span>
          <span className="absolute inset-0 z-0 text-spider-blue select-none" style={{ clipPath: "inset(55% 0 20% 0)", transform: `translate(${off.x * 2}px, ${-off.y}px)`, fontFamily: "var(--font-press-start)" }} aria-hidden="true">{text}</span>
        </>
      )}
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!isClient) return;
    const ctx = gsap.context(() => {
      const title = titleRef.current;
      if (!title) return;
      gsap.fromTo(title, { scale: 1, opacity: 1, fontWeight: 800 }, {
        scale: 0.3, opacity: 0.1, fontWeight: 200,
        transformOrigin: "center center", ease: "none",
        scrollTrigger: { trigger: containerRef.current, start: "top top", end: "bottom 1000px", scrub: 1.5 },
      });
      if (descRef.current) {
        gsap.fromTo(descRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: containerRef.current, start: "top 70%", toggleActions: "play none none reverse" } });
      }
      if (actionsRef.current) {
        const btns = actionsRef.current.querySelectorAll(".hero-action");
        gsap.fromTo(btns, { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: "back.out(1.4)", scrollTrigger: { trigger: containerRef.current, start: "top 65%", toggleActions: "play none none reverse" } });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [isClient]);

  const { title, description, primaryAction, secondaryAction, tertiaryAction } = HERO;

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full flex flex-col items-center justify-center bg-surface overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none benday-dots opacity-[0.03] dark:opacity-[0.06]" />
      <div className="absolute inset-0 -z-10 pointer-events-none halftone" />
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.012] dark:opacity-[0.025]"
        style={{ background: "repeating-linear-gradient(-3deg, var(--fg) 0px, var(--fg) 1px, transparent 1px, transparent 10px)" }} />

      <div ref={containerRef} className="w-full px-6 md:px-12 lg:px-20 flex flex-col items-center text-center pt-16 md:pt-20 z-10">
        <h1
          ref={titleRef}
          className="font-display font-extrabold uppercase leading-[0.85] text-fg text-balance will-change-transform select-none"
          style={{ fontFamily: TYPOGRAPHY.fontDisplay, letterSpacing: TYPOGRAPHY.tracking.tight, fontSize: "clamp(3.5rem, 12vw, 11rem)" }}
        >
          {isClient ? <GlitchText text={title} /> : title}
        </h1>

        <p ref={descRef} className="mt-6 max-w-xl text-base md:text-lg text-fg-muted opacity-0 leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontSans, maxWidth: TYPOGRAPHY.measure.wide }}>{description}</p>

        <div ref={actionsRef} className="mt-10 flex flex-col sm:flex-row gap-4 flex-wrap justify-center">
          <Link href={primaryAction.href} className="hero-action btn-brutal btn-brutal-accent text-lg px-8 py-4" data-cursor-label={primaryAction.label} style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{primaryAction.label}</Link>
          <Link href={secondaryAction.href} className="hero-action btn-brutal btn-brutal-invert text-lg px-8 py-4" data-cursor-label={secondaryAction.label} style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{secondaryAction.label}</Link>
          <a
            href="/Suhesh-Cybersecurity-CV.pdf"
            download
            className="hero-action btn-brutal text-lg px-8 py-4"
            data-cursor-label="Download CV"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >{tertiaryAction.label}</a>
        </div>
      </div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 0.8 }}>
        <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Scroll</span>
        <motion.div className="w-5 h-5 border-r-2 border-b-2 border-fg rotate-45" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }} />
      </motion.div>
    </section>
  );
}
