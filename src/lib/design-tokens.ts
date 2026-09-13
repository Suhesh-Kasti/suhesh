export const SITE = {
  name: "SCHIZO",
  realName: "Suhesh Kasti",
  role: "Application Security Engineer & Offensive Security",
  description:
    "A creative space where offensive security meets art. Portfolio, brain dump, and playground — all in one canvas.",
  url: "https://suhesh.com.np",
  locale: "en",
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
    "Exploring application security, network infrastructure and application delivery. Here documented are braindumps of all my learnings, exploration and mistakes as well.",
  primaryAction: { label: "Explore Work", href: "/projects" },
  secondaryAction: { label: "Brain Dump", href: "/braindump" },
  tertiaryAction: { label: "Download CV", href: "/CV/Suhesh-Cybersecurity-CV.pdf" },
  cvOptions: [
    {
      label: "Offensive Security",
      href: "/CV/Suhesh-Cybersecurity-CV.pdf",
      color: COLORS.pink,
      description: "Pentesting, OWASP Top 10, vulnerability research, web security",
    },
    {
      label: "IT & Network Admin",
      href: "/CV/Suhesh-Kasti-CV-IT-Network.pdf",
      color: COLORS.blue,
      description: "F5 BIG-IP, WAF tuning, network ops, system admin",
    },
    {
      label: "DevOps & Platform",
      href: "/CV/Suhesh-Kasti-CV-DevOps.pdf",
      color: COLORS.green,
      description: "CI/CD, containers, cloud infrastructure, automation",
    },
  ] as const,
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
  twitter: { label: "Twitter", url: "https://twitter.com/kastisuhesh", handle: "@kastisuhesh" },
  youtube: { label: "YouTube", url: "https://youtube.com/@suheshkasti", handle: "@suheshkasti" },
  telegram: { label: "Telegram", url: "https://t.me/suheshkasti", handle: "@suheshkasti" },
  whatsapp: { label: "WhatsApp", url: "https://wa.me/9779861084025", handle: "+977 9861084025" },
  email: { label: "Email", url: "mailto:kastisuhesh1@gmail.com", handle: "kastisuhesh1@gmail.com" },
  phone: { label: "Phone", url: "tel:+9779861084025", handle: "+977 9861084025" },
} as const;

export const FORMSPREE = {
  formId: "mrgwjvry",
} as const;

export const WORK = {
  projects: [
     {
      title: "Local AI Security Agent",
      category: "AI Security",
      description: "Two local models, a RAG index I keep fed with live CVE data, MCP tools for nmap and search, and a Telegram bot so I can ask it things from my phone. Nothing leaves the GPU.",
      tags: ["Python", "llama.cpp", "Qdrant", "FastAPI", "Docker"],
      color: COLORS.orange,
      url: "/projects/ai-agent",
      image: null,
    },
    {
      title: "Security Writeups",
      category: "Writeups",
      description: "Every lab and box I have worked through, written up the way I wish someone had explained them to me. The payloads, the dead ends, and the parts I got wrong first.",
      tags: ["PortSwigger", "HTB", "CTF", "Walkthrough"],
      color: COLORS.green,
      url: "/braindump",
      image: null,
    },
    {
      title: "RemarkEnks",
      category: "Automation",
      description: "A browser extension that writes TSC remarks for Subisu operators. One click instead of the usual copy-paste routine, and it saved the team a serious number of hours.",
      tags: ["JavaScript", "Chrome", "Firefox", "Automation"],
      color: COLORS.yellow,
      url: "/projects/remarkenks",
      image: null,
    },
    {
      title: "Re-Earth Waste Management",
      category: "Web Design",
      description: "Frontend work on a waste management platform in Nepal. I built the interface while the rest of the team handled the backend.",
      tags: ["HTML", "CSS", "JavaScript", "Collaboration"],
      color: COLORS.teal,
      url: "/projects/re-earth",
      image: null,
    },
    {
      title: "Browser 11",
      category: "Web Experiment",
      description: "A Windows 11 clone that runs in a browser tab. The start menu opens, the notification centre works, and it exists mostly because I wanted to know if I could.",
      tags: ["HTML", "CSS", "JavaScript", "UI/UX"],
      color: COLORS.blue,
      url: "/projects/browser11",
      image: null,
    },
    {
      title: "Subisu TSC Desktop App",
      category: "Desktop App",
      description: "A Tkinter app that trains new Subisu technicians. Lessons with diagrams, a quiz bank, progress tracking, and it works with no internet at all.",
      tags: ["Python", "Tkinter", "Desktop", "Training"],
      color: COLORS.purple,
      url: "/projects/subisu",
      image: null,
    },


  ],
} as const;
