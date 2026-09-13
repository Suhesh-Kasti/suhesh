"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCircle, faGraduationCap, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { SITE, TYPOGRAPHY, MOTION, COLORS, HERO } from "@/lib/design-tokens";
import CVDropdown from "./CVDropdown";

gsap.registerPlugin(ScrollTrigger);

const EXPERIENCE = [
  { year: "2024–Present", role: "Application Security Engineer", org: "Digital Network Solutions", details: "Protect client web applications against layer 7 attacks using WAF. Strengthen security posture through vulnerability assessments, configuration audits, and WAF tuning.", responsibilities: ["Protect client's web applications against various layer 7 attacks", "Help clients strengthen their security posture", "Configure and maintain Web Application Firewalls"] },
  { year: "2023–2024", role: "Associate Security Research Analyst", org: "SecurityPal Inc.", details: "Enhanced clients' digital security through handling security questionnaires and knowledge base enrichment. Analyzed compliance requirements.", responsibilities: ["Enhance the client's knowledge repository", "Respond to prospect's security questionnaires", "Analyze and document security compliance requirements"] },
  { year: "2022–2023", role: "Technical Support Representative", org: "Subisu Cablenet Ltd.", details: "Transformed digital challenges into seamless connectivity. Managed network setup, remote diagnostics, and customer technical support at a major ISP.", responsibilities: ["Assist with network setup and configuration", "Conduct remote diagnostics, support, and configurations", "Manage end-user connectivity and technical issues"] },
];

const PHOTOS = [
  "/images/admin/AMULUMULULULU.webp",
  "/images/admin/BUAHAHAHA.webp",
  "/images/admin/CHISSSCHISSFUSSFUSS.webp",
  "/images/admin/DHISSSS.webp",
  "/images/admin/LOLWAHAHA.webp",
  "/images/admin/OIUIIIU.webp",
  "/images/admin/ULUBULULULU.webp",
];

const CERTS: { name: string; issuer: string; color: string; fullName: string; image: string; verify?: string }[] = [
  { name: "CAPT", issuer: "Hackviser", color: COLORS.green, fullName: "Certified Associate Penetration Tester", image: "/images/certificates/0xCAPT.webp", verify: "https://hackviser.com/verify?id=HV-CAPT-LJ2W1FQ8" },
  { name: "CWSE", issuer: "Hackviser", color: COLORS.purple, fullName: "Certified Web Security Expert", image: "/images/certificates/0xCWSE.webp", verify: "https://hackviser.com/verify?id=HV-CWSE-2U5CIN2G" },
  { name: "F5 CTS", issuer: "F5 Networks", color: COLORS.red, fullName: "F5 Certified Technology Specialist", image: "/images/certificates/0xF5CTS.webp", verify: "https://www.credly.com/badges/09a33e80-8708-460b-8d57-911317aa9d4b/public_url" },
  { name: "F5 CA", issuer: "F5 Networks", color: COLORS.pink, fullName: "F5 Certified BIG-IP Administrator", image: "/images/certificates/0xF5CA.webp", verify: "https://www.credly.com/badges/66d58a6c-b052-4eba-b8bf-f77864684db6/public_url" },
  { name: "Cybersecurity Certificate", issuer: "Google", color: COLORS.yellow, fullName: "Google Cybersecurity Certificate", image: "/images/certificates/0x000G.webp" },
];

const QUALIFICATIONS = [
  { name: "Bachelors", details: "Computer Science & Information Technology — Nepalaya College", color: COLORS.pink },
  { name: "Higher Education", details: "Gyankunj HSS & College", color: COLORS.purple },
];

// Four groups, in the order I want them read: offensive first, then the day job, then the
// foundations. Deliberately no percentages — "85% web exploitation" reads as "better than 85%
// of people" and says nothing. Time spent and what the skill actually covers say something.
// Every line is supported by a CV, a cert (CAPT, CWSE, F5 CA, F5 CTS) or a writeup here.
const SKILL_GROUPS = [
  {
    label: "Offensive Security",
    accent: COLORS.pink,
    items: [
      { name: "Web Exploitation", detail: "labs + CAPT / CWSE" },
      { name: "Burp Suite", detail: "my main testing tool" },
      { name: "API Security", detail: "REST, auth, Postman" },
      { name: "PortSwigger Academy", detail: "95 written up, more pending" },
      { name: "Network Testing", detail: "nmap, metasploit, labs" },
      { name: "Recon & OSINT", detail: "tooling I built myself" },
      { name: "Security Research", detail: "3 months · SecurityPal" },
      { name: "HTB CPTS", detail: "studying now" },
      { name: "Mobile Pentesting", detail: "learning on the side" },
    ],
  },
  {
    label: "BIG-IP & Delivery",
    accent: COLORS.orange,
    items: [
      { name: "F5 ASM / AWAF", detail: "2.5 yrs · production" },
      { name: "WAF Policy Tuning", detail: "daily, false positives included" },
      { name: "LTM Load Balancing", detail: "pools and virtual servers" },
      { name: "F5 DNS / GTM", detail: "working knowledge" },
      { name: "SSL/TLS", detail: "offload, profiles, certs" },
      { name: "Traffic Analysis", detail: "logs, tcpdump, Wireshark" },
      { name: "Health Monitors", detail: "tuning, not just adding" },
      { name: "Troubleshooting", detail: "SSL, DNS, routing, pressure" },
      { name: "Log Analysis", detail: "from noise to root cause" },
    ],
  },
  {
    label: "IT & Network Admin",
    accent: COLORS.blue,
    items: [
      { name: "Linux", detail: "3 yrs · RHEL, Debian, Arch" },
      { name: "Networking", detail: "TCP/IP, NAT, VLANs" },
      { name: "DNS & BIND", detail: "zones, records, DNSSEC" },
      { name: "Windows / WSL", detail: "daily at work" },
      { name: "Packet Capture", detail: "Wireshark, tcpdump" },
      { name: "Remote Diagnostics", detail: "customer CPE and routers" },
      { name: "Hardware", detail: "modems, switches, cabling" },
      { name: "Connectivity", detail: "line faults and link issues" },
      { name: "VPNs", detail: "remote access and tunnels" },
    ],
  },
  {
    label: "DevOps & Automation",
    accent: COLORS.green,
    items: [
      { name: "Docker", detail: "daily · comfortable, not an expert" },
      { name: "Git & GitHub", detail: "daily" },
      { name: "Bash", detail: "daily shell work" },
      { name: "Python", detail: "scripts and automation" },
      { name: "REST APIs", detail: "curl, Postman, JSON" },
      { name: "Virtualization", detail: "VMware, KVM, Proxmox" },
      { name: "NGINX", detail: "config and troubleshooting" },
      { name: "ELK Stack", detail: "deployed it for logs" },
      { name: "Deployment", detail: "built and shipped this site" },
    ],
  },
  {
    // Kept as its own group rather than buried in IT: three years of customer and client work
    // is the part of the CV that most security engineers cannot claim.
    label: "Clients & Communication",
    accent: COLORS.teal,
    items: [
      { name: "Customer Support", detail: "3+ yrs · ISP to enterprise" },
      { name: "De-escalation", detail: "annoyed callers, kept calm" },
      { name: "Ticket Triage", detail: "SLAs, priorities, escalations" },
      { name: "Plain-English Security", detail: "explaining a blocked request" },
      { name: "Cross-Team Work", detail: "app teams and clients" },
      { name: "Documentation", detail: "runbooks and clean notes" },
      { name: "Remote Sessions", detail: "talking people through fixes" },
      { name: "Training", detail: "built an app to train recruits" },
      { name: "Questionnaires", detail: "vendor and compliance work" },
    ],
  },
];

/** Headline numbers. Short, checkable, and one of them is a link to the evidence. */
const STATS = [
  { value: "3+ yrs", label: "Customer-facing" },
  { value: "2.5 yrs", label: "Production WAF" },
  { value: "5", label: "Certifications" },
  { value: "95+", label: "Lab writeups", href: "/braindump" },
];

export default function About({ featuredCerts }: { featuredCerts?: string[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [skillSet, setSkillSet] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [zoomedCert, setZoomedCert] = useState<typeof CERTS[number] | null>(null);
  const activeSkillGroup = SKILL_GROUPS[skillSet];
  const nextSkillGroup = SKILL_GROUPS[(skillSet + 1) % SKILL_GROUPS.length];

  // The stats row renders in two shapes: tucked into the skills column on the home section,
  // and as a full-width row on the about page where the columns are taller.
  const statsRow = (variant: "column" | "wide") => (
    <div className={`about-animate grid grid-cols-2 gap-2 ${variant === "wide" ? "mt-14 gap-3 sm:grid-cols-4 sm:gap-4" : "sm:grid-cols-2"}`}>
      {STATS.map((stat) => {
        const tile = (
          <motion.div
            className={`flex h-full flex-col justify-center border-2 border-fg text-center panel-comic ${variant === "wide" ? "p-4 sm:p-5" : "p-2 sm:p-3"}`}
            whileHover={{ y: -4 }}
            transition={MOTION.snappy}
          >
            <div
              className={`font-display font-extrabold text-fg whitespace-nowrap ${variant === "wide" ? "text-3xl sm:text-4xl" : "text-base sm:text-xl"}`}
              style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
            >
              {stat.value}
            </div>
            <div
              className="mt-1 font-mono text-2xs uppercase text-fg-muted tracking-label leading-tight"
              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
            >
              {stat.label}
            </div>
          </motion.div>
        );

        return stat.href ? (
          <Link key={stat.label} href={stat.href} aria-label={`${stat.value} ${stat.label}`} className="block h-full">
            {tile}
          </Link>
        ) : (
          <div key={stat.label} className="h-full">{tile}</div>
        );
      })}
    </div>
  );

  useEffect(() => { setIsClient(true); }, []);
  
  useEffect(() => {
    if (!isClient || PHOTOS.length < 2) return;
    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % PHOTOS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isClient]);
  
  useEffect(() => {
    if (!isClient) return;
    const ctx = gsap.context(() => {
      const els = sectionRef.current?.querySelectorAll(".about-animate");
      els?.forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" } });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [isClient]);

  return (
    <section ref={sectionRef} id="about" className="relative w-full bg-surface section-divider py-20 md:py-32 halftone">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>About Me</h2>
          <div className="flex-1 h-1 bg-fg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Bio */}
          <div className="lg:col-span-2">
            <motion.div className="about-animate border-2 border-fg p-1 panel-comic relative overflow-hidden" whileHover={{ boxShadow: "8px 8px 0px var(--color-spider-pink), 12px 12px 0px var(--color-spider-blue)" }} transition={MOTION.snappy}>
              <div className="aspect-square bg-fg/5 dark:bg-fg/10 flex items-center justify-center overflow-hidden relative">
                {/* The primary photo renders on the server as a real <img> so it is
                    indexable and has alt text; the rotation is a client-side flourish. */}
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: !isClient || photoIndex === 0 ? 1 : 0,
                    transition: "opacity 0.8s ease-in-out",
                  }}
                >
                  <Image
                    src={PHOTOS[0]}
                    alt="Suhesh Kasti — application security engineer working with F5 BIG-IP and web application firewalls"
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover object-center"
                  />
                </div>

                {isClient && PHOTOS.slice(1).map((src, index) => (
                  <motion.div
                    key={src}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: photoIndex === index + 1 ? 1 : 0,
                      scale: photoIndex === index + 1 ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <Image
                      src={src}
                      alt={`Suhesh Kasti — portrait ${index + 2}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 480px"
                      className="object-cover object-center"
                    />
                  </motion.div>
                ))}
                <div className="relative z-10 text-fg-muted font-mono text-sm text-center">
                  {PHOTOS.length === 0 && (
                    <>
                      <div className="text-7xl mb-4 font-display text-fg">SK</div>
                      <div className="uppercase tracking-label">Photo Here</div>
                    </>
                  )}
                </div>
                {/* Photo dots */}
                {PHOTOS.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {PHOTOS.map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 border border-fg cursor-pointer"
                        animate={{ backgroundColor: i === photoIndex ? "var(--fg)" : "var(--surf)" }}
                        onClick={() => setPhotoIndex(i)}
                        data-cursor-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            <div className="about-animate mt-6">
              <h3 className="font-display text-2xl font-bold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{SITE.realName}</h3>
              <p className="mt-2 font-mono text-sm uppercase text-spider-pink tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>{SITE.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans, maxWidth: TYPOGRAPHY.measure.narrow }}>I&apos;m an application security engineer. I secure applications from notorious hacker people. Right now, I&apos;m learning offensive security and pentesting. You either die a defender or live long enough to become an attacker.</p>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans, maxWidth: TYPOGRAPHY.measure.narrow }}>This site is my brain dump — raw, unfiltered research notes, project writeups, and weird experiments.</p>
              <CVDropdown
                variant="about"
                label="Download CV [PDF]"
                options={HERO.cvOptions}
              />
            </div>

            {featuredCerts ? (
              <div className="about-animate mt-8">
                <h4 className="font-mono text-xs uppercase text-spider-blue tracking-label mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Certifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  {CERTS.filter((c) => featuredCerts.includes(c.name)).map((cert) => (
                    <CertCard key={cert.name} cert={cert} onView={setZoomedCert} />
                  ))}
                </div>
                <a
                  href="/about"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 border-2 border-fg font-mono text-xs uppercase text-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                  style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
                >
                  View All Certifications →
                </a>
              </div>
            ) : (
              <div className="about-animate mt-8">
                <h4 className="font-mono text-xs uppercase text-spider-teal tracking-label mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Contact & Links</h4>
                <div className="space-y-2">
                  {[
                    { label: "Email", value: "kastisuhesh1@gmail.com", href: "mailto:kastisuhesh1@gmail.com", icon: faEnvelope },
                    { label: "GitHub", value: "@Suhesh-Kasti", href: "https://github.com/Suhesh-Kasti", icon: faGithub },
                    { label: "LinkedIn", value: "suheshkasti", href: "https://linkedin.com/in/suheshkasti", icon: faLinkedin },
                    { label: "Telegram", value: "@suheshkasti", href: "https://t.me/suheshkasti", icon: faTelegram },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-2 border-fg p-3 flex items-center gap-3 hover:bg-fg hover:text-surface transition-all cursor-pointer group"
                    >
                      <FontAwesomeIcon icon={link.icon} className="text-base group-hover:text-surface" />
                      <div>
                        <p className="font-mono text-2xs uppercase text-fg-muted tracking-label group-hover:text-surface" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>{link.label}</p>
                        <p className="font-mono text-xs text-fg group-hover:text-surface mt-0.5" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{link.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: qualifications, certs, experience */}
          <div className="lg:col-span-3 space-y-10">
            {/* Qualifications */}
            <div className="about-animate">
              <h4 className="font-mono text-xs uppercase text-spider-pink tracking-label mb-4 flex items-center gap-2" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
              <FontAwesomeIcon icon={faGraduationCap} /> Education & Qualifications</h4>
              <div className="space-y-3">
                {QUALIFICATIONS.map((q) => (
                  <div key={q.name} className="border-2 border-fg p-4 flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 shrink-0" style={{ backgroundColor: q.color }} />
                    <div>
                      <h5 className="font-display text-sm font-bold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{q.name}</h5>
                      <p className="text-xs text-fg-muted mt-0.5" style={{ fontFamily: TYPOGRAPHY.fontSans }}>{q.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="about-animate">
              <h4 className="font-mono text-xs uppercase text-spider-orange tracking-label mb-4" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Experience Timeline</h4>
              <div className="space-y-0">
                {EXPERIENCE.map((exp, i) => (
                  <div key={exp.year} className="relative pl-8 pb-6 border-l-2 border-fg-muted/30 last:pb-0 last:border-l-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 border-2 border-fg bg-surface" style={{ borderColor: COLORS.orange }} />
                    {i < EXPERIENCE.length - 1 && <div className="absolute left-0 top-3 -translate-x-1/2 w-0.5 h-full bg-fg-muted/30" />}
                    <div className="font-mono text-2xs uppercase text-fg-muted tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>{exp.year}</div>
                    <h5 className="mt-1 font-display text-sm font-bold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{exp.role}</h5>
                    <p className="text-xs text-spider-yellow uppercase tracking-label mt-0.5" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>{exp.org}</p>
                    <p className="text-xs text-fg-muted mt-1" style={{ fontFamily: TYPOGRAPHY.fontSans }}>{exp.details}</p>
                    <ul className="mt-2 space-y-0.5">
                      {exp.responsibilities.map((r, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-2xs text-fg-muted">
                          <span className="mt-0.5 w-1 h-1 shrink-0" style={{ backgroundColor: "var(--color-spider-orange)" }} />
                          <span style={{ fontFamily: TYPOGRAPHY.fontSans }}>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="about-animate">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h4 className="font-mono text-xs uppercase text-spider-purple tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Skills</h4>

                {/* Label is the group on screen; the hint under it says what clicking switches to. */}
                <div className="group relative">
                  <button
                    type="button"
                    onClick={() => setSkillSet((current) => (current + 1) % SKILL_GROUPS.length)}
                    aria-label={`Show the next group of skills (now showing ${activeSkillGroup.label})`}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:text-fg"
                    style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
                  >
                    <span style={{ color: activeSkillGroup.accent }}>{activeSkillGroup.label}</span>
                    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">›</span>
                  </button>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap border border-fg-muted/30 bg-surface px-2 py-1 font-mono text-2xs uppercase text-fg-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
                  >
                    next: {nextSkillGroup.label}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={activeSkillGroup.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="space-y-3 sm:space-y-4"
                >
                  {activeSkillGroup.items.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
                      className="flex items-baseline justify-between gap-3 sm:gap-2"
                    >
                      <span
                        className="font-mono text-2xs uppercase text-fg sm:text-xs"
                        style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
                      >
                        {item.name}
                      </span>
                      <span aria-hidden="true" className="hidden flex-1 border-b border-dotted border-fg-muted/50 sm:block" />
                      <span className="text-right font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                        {item.detail}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatePresence>

              {/*
                The switcher only mounts the group on screen, so the other four would be
                invisible to crawlers. They stay in the DOM here, hidden visually but
                readable by search engines and screen readers.
              */}
              <div className="sr-only">
                {SKILL_GROUPS.map((group, index) =>
                  index === skillSet ? null : (
                    <div key={group.label}>
                      <h5>{group.label}</h5>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.name}>
                            {item.name} — {item.detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Stats sit under the skills on the home section, where the column is narrow. */}
            {featuredCerts && statsRow("column")}
          </div>
        </div>

        {/* On the about page the columns are taller, so the stats get their own full-width row. */}
        {!featuredCerts && statsRow("wide")}

        {/* Full cert section — about page only */}
        {!featuredCerts && (
          <div className="about-animate mt-20">
            <div className="flex items-center gap-4 mb-10">
              <h3 className="font-display text-2xl md:text-4xl font-extrabold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>Certifications</h3>
              <div className="flex-1 h-1 bg-fg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {CERTS.map((cert) => (
                <CertCard key={cert.name} cert={cert} onView={setZoomedCert} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cert fullscreen overlay — simple lightbox style */}
      <AnimatePresence>
        {zoomedCert && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[200000]"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={() => setZoomedCert(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="relative bg-white p-3 max-w-[80vw] max-h-[85vh] border-4 overflow-auto flex flex-col items-center"
              style={{ borderColor: zoomedCert.color }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              <img src={zoomedCert.image} alt={zoomedCert.fullName} className="max-w-full max-h-[70vh] object-contain" />
              <div className="mt-3 text-center border-t-2 pt-3 w-full" style={{ borderColor: zoomedCert.color }}>
                <p className="font-display text-lg font-extrabold uppercase text-black" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{zoomedCert.name}</p>
                <p className="font-mono text-xs text-gray-500 mt-0.5" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{zoomedCert.fullName}</p>
              </div>
            </motion.div>
            <button
              onClick={() => setZoomedCert(null)}
              className="absolute top-4 right-4 font-mono text-sm uppercase text-white border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors cursor-pointer z-10 flex items-center gap-2"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              <FontAwesomeIcon icon={faXmark} shake /> CLOSE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Simple cert card — delegates fullscreen to parent
function CertCard({ cert, onView }: { cert: typeof CERTS[number]; onView: (c: typeof CERTS[number]) => void }) {
  return (
    <motion.div
      onClick={() => onView(cert)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="border-2 cursor-pointer group relative overflow-hidden"
      style={{ borderColor: cert.color, backgroundColor: "var(--surf)" }}
      data-cursor-label="View Certificate"
    >
      <div className="h-32 flex items-center justify-center p-2 bg-[#fafaf5]">
        <img src={cert.image} alt={cert.fullName} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="border-t-2 px-3 py-2.5" style={{ borderColor: cert.color }}>
        <p className="font-display text-xs font-bold uppercase leading-tight" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: cert.color }}>{cert.name}</p>
        {cert.verify ? (
          <a
            href={cert.verify}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="font-mono text-2xs text-fg-muted mt-1 leading-tight inline-flex items-center gap-1 underline decoration-dotted underline-offset-2 hover:text-fg transition-colors"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
            title={`Verify this ${cert.name} credential`}
          >
            {cert.issuer}
            <span aria-hidden="true">↗</span>
            <span className="sr-only">— verify this certification</span>
          </a>
        ) : (
          <p className="font-mono text-2xs text-fg-muted mt-1 leading-tight" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{cert.issuer}</p>
        )}
      </div>
    </motion.div>
  );
}
