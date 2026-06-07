"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCircle, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { SITE, TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

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

const CERTS = [
  { name: "CAPT", issuer: "Hackviser", color: COLORS.green, fullName: "Certified Associate Penetration Tester", image: "/images/certificates/0xCAPT.png" },
  { name: "CWSE", issuer: "Hackviser", color: COLORS.purple, fullName: "Certified Web Security Expert", image: "/images/certificates/0xCWSE.png" },
  { name: "F5 CA", issuer: "F5 Networks", color: COLORS.red, fullName: "F5 Certified BIG-IP Administrator", image: "/images/certificates/0x00F5.png" },
  { name: "Cybersecurity Certificate", issuer: "Google", color: COLORS.yellow, fullName: "Google Cybersecurity Certificate", image: "/images/certificates/0x000G.jpg" },
];

const QUALIFICATIONS = [
  { name: "Bachelors", details: "Computer Science & Information Technology — Nepalaya College", color: COLORS.pink },
  { name: "Higher Education", details: "Gyankunj HSS & College", color: COLORS.purple },
];

const SKILLS = [
  { name: "Web Security", level: 75, color: COLORS.pink },
  { name: "Network Pentesting", level: 70, color: COLORS.green },
  { name: "Binary Exploitation", level: 10, color: COLORS.blue },
  { name: "Cryptography", level: 70, color: COLORS.teal },
  { name: "Reverse Engineering", level: 35, color: COLORS.orange },
  { name: "Malware Analysis", level: 25, color: COLORS.purple },
  { name: "Cloud Security", level: 50, color: COLORS.yellow },
  { name: "Incident Response", level: 55, color: COLORS.red },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [animatedSkills, setAnimatedSkills] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [zoomedCert, setZoomedCert] = useState<typeof CERTS[number] | null>(null);

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
      ScrollTrigger.create({ trigger: sectionRef.current, start: "top 60%", onEnter: () => setAnimatedSkills(true), once: true });
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
                {isClient && PHOTOS.map((src, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: i === photoIndex ? 1 : 0, scale: i === photoIndex ? 1 : 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
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
              <a
                href="/Suhesh-Cybersecurity-CV.pdf"
                download
                className="about-animate mt-6 inline-flex items-center gap-2 px-6 py-3 border-2 border-fg font-display font-bold uppercase text-sm text-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                style={{ fontFamily: TYPOGRAPHY.fontDisplay, letterSpacing: TYPOGRAPHY.tracking.wide }}
                data-cursor-label="Download CV"
              >
                Download CV [PDF]
              </a>
            </div>

            <div className="about-animate mt-8">
              <h4 className="font-mono text-xs uppercase text-spider-blue tracking-label mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Certifications</h4>
              <div className="grid grid-cols-2 gap-3">
                {CERTS.map((cert) => (
                  <CertCard key={cert.name} cert={cert} onView={setZoomedCert} />
                ))}
              </div>
            </div>
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
            <div className="about-animate space-y-4">
              <h4 className="font-mono text-xs uppercase text-spider-purple tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Skills</h4>
              {SKILLS.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-xs uppercase text-fg tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>{skill.name}</span>
                    <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{skill.level}%</span>
                  </div>
                  <div className="h-3 border-2 border-fg bg-surface">
                    <motion.div className="h-full" style={{ backgroundColor: skill.color }} initial={{ width: 0 }} animate={animatedSkills ? { width: `${skill.level}%` } : { width: 0 }} transition={{ duration: 1, delay: SKILLS.indexOf(skill) * 0.06, ease: [0.215, 0.61, 0.355, 1] }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="about-animate grid grid-cols-3 gap-2 sm:gap-3">
              {[{ value: "2+", label: "Years in Security" }, { value: "3+", label: "Cyber Certs" }, { value: "∞", label: "Curiosity" }].map((stat) => (
                <motion.div key={stat.label} className="border-2 border-fg p-2 sm:p-3 text-center panel-comic" whileHover={{ y: -4 }} transition={MOTION.snappy}>
                  <div className="font-display text-xl sm:text-2xl font-extrabold text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{stat.value}</div>
                  <div className="font-mono text-2xs uppercase text-fg-muted mt-1 tracking-label leading-tight" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
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
        <p className="font-mono text-2xs text-fg-muted mt-1 leading-tight" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{cert.issuer}</p>
      </div>
    </motion.div>
  );
}
