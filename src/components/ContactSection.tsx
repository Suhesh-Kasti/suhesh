"use client";

import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin, faXTwitter, faYoutube, faTelegram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import Link from "next/link";
import { SOCIAL, FORMSPREE, TYPOGRAPHY, MOTION, SITE } from "@/lib/design-tokens";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const ctx = gsap.context(() => {
      const elements = sectionRef.current?.querySelectorAll(".contact-animate");
      elements?.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: i * 0.08,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top bottom+=80px",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  const socialEntries = Object.entries(SOCIAL);
  const socialIcons: Record<string, typeof faGithub> = {
    GitHub: faGithub,
    LinkedIn: faLinkedin,
    Twitter: faXTwitter,
    YouTube: faYoutube,
    Telegram: faTelegram,
    WhatsApp: faWhatsapp,
    Email: faEnvelope,
    Phone: faPhone,
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full bg-surface py-20 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-4 mb-16">
          <h2
            className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >
            Connect
          </h2>
          <div className="flex-1 h-1 bg-fg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Social grid */}
          <div className="grid grid-cols-2 gap-3">
            {socialEntries.map(([key, social], index) => (
              <motion.a
                key={key}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-animate group border-2 border-fg p-4 hover:shadow-brutal-lg transition-all flex items-center gap-3"
                data-cursor-label={social.label}
                whileHover={{ y: -3 }}
                transition={MOTION.snappy}
              >
                <span className="text-lg"><FontAwesomeIcon icon={socialIcons[social.label] ?? faEnvelope} /></span>
                <div className="min-w-0">
                  <div
                    className="font-mono text-2xs uppercase text-fg-muted tracking-label"
                    style={{
                      fontFamily: TYPOGRAPHY.fontMono,
                      letterSpacing: TYPOGRAPHY.tracking.label,
                    }}
                  >
                    {social.label}
                  </div>
                  <div
                    className="font-mono text-xs text-fg group-hover:text-brutal-pink transition-colors truncate"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    {social.handle}
                  </div>
                </div>
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-fg-muted text-xs">
                  ↗
                </span>
              </motion.a>
            ))}
          </div>

          {/* Contact form */}
          <div className="contact-animate border-2 border-fg p-8">
            <h3
              className="font-display text-xl font-bold uppercase text-fg mb-6"
              style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
            >
              Send a Message
            </h3>
            <form
              action={`https://formspree.io/f/${FORMSPREE.formId}`}
              method="POST"
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block font-mono text-2xs uppercase text-fg-muted tracking-label mb-1"
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    letterSpacing: TYPOGRAPHY.tracking.label,
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full border-2 border-fg bg-surface text-fg font-sans text-sm p-3 focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontSans }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block font-mono text-2xs uppercase text-fg-muted tracking-label mb-1"
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    letterSpacing: TYPOGRAPHY.tracking.label,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border-2 border-fg bg-surface text-fg font-sans text-sm p-3 focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontSans }}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block font-mono text-2xs uppercase text-fg-muted tracking-label mb-1"
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    letterSpacing: TYPOGRAPHY.tracking.label,
                  }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full border-2 border-fg bg-surface text-fg font-sans text-sm p-3 resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontSans }}
                  placeholder="What's on your mind?"
                />
              </div>
              <button
                type="submit"
                className="btn-brutal btn-brutal-accent w-full text-base py-3"
                data-cursor-label="Send Message"
              >
                Send →
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
