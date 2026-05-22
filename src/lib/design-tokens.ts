import { CSSProperties } from "react";

export const SITE = {
  name: "SCHIZO",
  realName: "Suhesh Kasti",
  role: "Application Security Engineer & Offensive Security",
  description:
    "A creative space where offensive security meets art. Portfolio, brain dump, and playground — all in one canvas.",
  url: "https://suhesh.com.np",
  locale: "en",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const COLORS = {
  black: "#0a0a0a",
  white: "#fafaf5",
  yellow: "#ffdd00",
  pink: "#ff2d95",
  blue: "#0055ff",
  orange: "#ff5500",
  green: "#00dd44",
  purple: "#8800ff",
  teal: "#00e5ff",
  red: "#ff1144",
  darkBg: "#111118",
  darkFg: "#f0f0f8",
} as const;

export const TYPOGRAPHY = {
  fontDisplay: "var(--font-clash-display)",
  fontSans: "var(--font-syne)",
  fontMono: "var(--font-space-mono)",

  scale: {
    "2xs": { size: "0.625rem", lineHeight: "1" },
    xs: { size: "0.75rem", lineHeight: "1.2" },
    sm: { size: "0.875rem", lineHeight: "1.3" },
    base: { size: "1.125rem", lineHeight: "1.6" },
    lg: { size: "1.375rem", lineHeight: "1.4" },
    xl: { size: "1.75rem", lineHeight: "1.3" },
    "2xl": { size: "2.25rem", lineHeight: "1.15" },
    "3xl": { size: "3rem", lineHeight: "1.1" },
    "4xl": { size: "4rem", lineHeight: "1.05" },
    "5xl": { size: "5.5rem", lineHeight: "0.95" },
    "6xl": { size: "7rem", lineHeight: "0.9" },
    "7xl": { size: "9rem", lineHeight: "0.85" },
  } as Record<string, { size: string; lineHeight: string }>,

  responsiveScale: {
    base: { sm: "1rem", md: "1.0625rem", lg: "1.125rem" },
    h1: { sm: "2.25rem", md: "3rem", lg: "4rem", xl: "5.5rem" },
    h2: { sm: "1.75rem", md: "2.25rem", lg: "3rem", xl: "4rem" },
    h3: { sm: "1.375rem", md: "1.75rem", lg: "2.25rem" },
    h4: { sm: "1.125rem", md: "1.375rem", lg: "1.75rem" },
    hero: { sm: "3rem", md: "5rem", lg: "8rem", xl: "11rem" },
  },

  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  measure: {
    narrow: "48ch",
    body: "68ch",
    wide: "76ch",
  },

  tracking: {
    tight: "-0.04em",
    heading: "-0.02em",
    normal: "0em",
    wide: "0.02em",
    mono: "0.05em",
    label: "0.12em",
  },
} as const;

export const SHADOWS = {
  sm: "2px 2px 0px #0a0a0a",
  md: "4px 4px 0px #0a0a0a",
  lg: "8px 8px 0px #0a0a0a",
  xl: "12px 12px 0px #0a0a0a",
  colored: `6px 6px 0px ${COLORS.pink}`,
  blue: `6px 6px 0px ${COLORS.blue}`,
  yellow: `6px 6px 0px ${COLORS.yellow}`,
  orange: `6px 6px 0px ${COLORS.orange}`,
  green: `6px 6px 0px ${COLORS.green}`,
  purple: `6px 6px 0px ${COLORS.purple}`,
} as const;

export const BORDERS = {
  width: "2px",
  color: COLORS.black,
  style: "solid",
} as const;

export const SPACING = {
  unit: 4,
  micro: "0.5rem",
  inline: "1rem",
  card: "1.5rem",
  section: "2.5rem",
  macro: "5rem",
} as const;

export const MOTION = {
  spring: {
    type: "spring" as const,
    stiffness: 170,
    damping: 26,
    mass: 0.6,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 320,
    damping: 34,
    mass: 0.3,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 200,
    damping: 15,
    mass: 1,
  },
  gentle: {
    type: "spring" as const,
    stiffness: 80,
    damping: 16,
    mass: 1.2,
  },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  slowTransition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  stagger: (delay: number = 0.05) => ({
    staggerChildren: delay,
    delayChildren: 0.1,
  }),
} as const;

export const NAVIGATION = {
  links: [
    { label: "WORK", href: "/projects" },
    { label: "ABOUT", href: "/about" },
    { label: "BRAIN DUMP", href: "/braindump" },
    { label: "TOOLS", href: "/tools" },
    { label: "CONTACT", href: "/contact" },
  ],
  logoText: "SCHIZO",
} as const;

export const HERO = {
  title: "Suhesh Kasti",
  description:
    "Exploring application security, software secuity and . Exploring the intersection of security, design, and raw expression.",
  primaryAction: { label: "Explore Work", href: "/projects" },
  secondaryAction: { label: "Brain Dump", href: "/braindump" },
  tertiaryAction: { label: "Download CV", href: "/Suhesh-Cybersecurity-CV.pdf" },
  scrollTrigger: {
    start: "top top",
    end: "bottom 200px",
    scrub: 1.5,
  },
  animation: {
    scaleEnd: 0.6,
    opacityEnd: 0.3,
    fontWeightStart: 800,
    fontWeightEnd: 300,
  },
} as const;

export const SOCIAL = {
  github: { label: "GitHub", url: "https://github.com/Suhesh-Kasti", handle: "@Suhesh-Kasti" },
  linkedin: { label: "LinkedIn", url: "https://linkedin.com/in/suheshkasti", handle: "suheshkasti" },
  twitter: { label: "Twitter", url: "https://twitter.com/suheshkasti", handle: "@suheshkasti" },
  youtube: { label: "YouTube", url: "https://www.youtube.com/@schizo...", handle: "@schizo..." },
  telegram: { label: "Telegram", url: "https://t.me/suheshkasti", handle: "@suheshkasti" },
  whatsapp: { label: "WhatsApp", url: "https://wa.me/9779861084025", handle: "+977 9861084025" },
  email: { label: "Email", url: "mailto:kastisuhesh1@gmail.com", handle: "kastisuhesh1@gmail.com" },
  phone: { label: "Phone", url: "tel:+9779861084025", handle: "+977 9861084025" },
} as const;

export const FORMSPREE = {
  formId: "mrgwjvry",
} as const;

export const CURSOR = {
  size: 24,
  outlineSize: 48,
  color: COLORS.pink,
  blendMode: "exclusion" as CSSProperties["mixBlendMode"],
  hoverScale: 2.5,
} as const;

export const SEARCH = {
  placeholder: "Ask me anything — CV, contact, WhatsApp, projects, skills...",
  noResults: "Nothing found. Try asking about my skills, contact info, or projects.",
  loadingText: "Thinking...",
} as const;

export const WORK = {
  projects: [
    {
      title: "Hack The Box",
      category: "Capture The Flag",
      description: "Hack The Box boxes solved by me and provided walkthrough for you and for future myself",
      tags: ["Hack The Box", "Capture The Flag", "Hacking", "Pentesting", "Practise"],
      color: COLORS.green,
      url: "/braindump",
      image: null,
    },   
    {
      title: "Local AI Security Agent",
      category: "AI Security",
      description: "Fully private local AI agent stack — dual LLM routing, RAG knowledge base, MCP tools, Telegram control.",
      tags: ["Python", "llama.cpp", "Qdrant", "FastAPI", "Docker"],
      color: COLORS.orange,
      url: "/projects/ai-agent",
      image: null,
    },
    {
      title: "RemarkEnks",
      category: "Automation",
      description: "Chrome/Firefox extension automating TSC remark writing for Subisu — saved thousands of operator hours.",
      tags: ["JavaScript", "Chrome", "Firefox", "Automation"],
      color: COLORS.yellow,
      url: "/projects/remarkenks",
      image: null,
    },
    {
      title: "Re-Earth Waste Management",
      category: "Web Design",
      description: "Frontend contribution to Re-Earth, a waste management system based in Nepal.",
      tags: ["HTML", "CSS", "JavaScript", "Collaboration"],
      color: COLORS.teal,
      url: "/projects/re-earth",
      image: null,
    },
    {
      title: "Browser 11",
      category: "Web Experiment",
      description: "Windows 11 replica in a web browser — interactive start button, notification center.",
      tags: ["HTML", "CSS", "JavaScript", "UI/UX"],
      color: COLORS.blue,
      url: "/projects/browser11",
      image: null,
    }, 
    {
      title: "Subisu TSC Desktop App",
      category: "Desktop App",
      description: "Python GUI training application built for Subisu recruits — self-paced learning platform.",
      tags: ["Python", "Tkinter", "Desktop", "Training"],
      color: COLORS.purple,
      url: "/projects/subisu",
      image: null,
    },
  ],
} as const;
