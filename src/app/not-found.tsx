"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

const SILLY_MESSAGES = [
  "this page ran away. probably scared of commitment.",
  "404 — you found the void. congrats?",
  "nothing here but dust and bad decisions.",
  "we looked everywhere. even under the couch. nada.",
  "this is not the page you're looking for. *jedi wave*",
  "the bits got lost in the tubes. sorry.",
  "page.exe has stopped working. would you like to wait or give up?",
  "someone stole this page. the suspect is at large.",
  "digital tumbleweeds. nothing else here.",
  "error 404: your vibe is too powerful for this page.",
  "this page took the red pill. it's gone, neo.",
  "the server understood the request, but refuses to fill it. drama queen.",
  "here be dragons. also, no page.",
  "we asked chatgpt to find this page. it hallucinated instead.",
  "page not found, but at least you're good looking.",
];

const SILLY_FACTS = [
  "this page doesn't exist, but you do. that's something.",
  "schrödinger's page — both here and not here until you looked.",
  "the server didn't crash. the page just ghosted you.",
  "even the pixels are confused right now.",
  "fun fact: the first 404 was spotted in 1992. it's older than tiktok.",
  "error 404 was named after a room where servers went to die.",
  "if a 404 happens in a forest, does anyone see it?",
  "the internet has over 2 billion pages. you found one of the missing ones.",
  "every time a 404 is served, a developer sighs quietly.",
  "you're technically not lost. the page is.",
  "this page was last seen in another dimension.",
  "the url you typed is valid in at least zero universes.",
];

const EASTER_EGG_WORDS: Record<string, { action: string; url: string }> = {
  "schizo": { action: "ACCESS GRANTED", url: "/" },
  "hack": { action: "SYSTEM BREACHED", url: "/tools" },
  "lol": { action: "LOL DETECTED", url: "/braindump" },
  "cool": { action: "COOLNESS ACKNOWLEDGED", url: "/projects" },
  "yeet": { action: "YEETED BACK HOME", url: "/" },
  "404": { action: "RECURSIVE 404 — NICE TRY", url: "/" },
};

const BOOP_EMOJIS = ["💀", "👻", "🤡", "🫠", "💩", "🙃", "👽", "🤖", "🌀", "✨", "🕳️", "🧠"];

export default function NotFound() {
  const router = useRouter();
  const [message, setMessage] = useState(SILLY_MESSAGES[0]);
  const [fact, setFact] = useState(SILLY_FACTS[0]);
  const [showFact, setShowFact] = useState(false);
  const [keystrokes, setKeystrokes] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverText, setGameOverText] = useState("ACCESS GRANTED");
  const [boops, setBoops] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [titleWobble, setTitleWobble] = useState(false);
  const [konami, setKonami] = useState(false);
  const boopId = useRef(0);
  const clickCount = useRef(0);
  const konamiBuffer = useRef<string[]>([]);
  const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight"];

  useEffect(() => {
    setMessage(SILLY_MESSAGES[Math.floor(Math.random() * SILLY_MESSAGES.length)]);
    setFact(SILLY_FACTS[Math.floor(Math.random() * SILLY_FACTS.length)]);
    setShowFact(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowFact(false);
      setTimeout(() => {
        setFact(SILLY_FACTS[Math.floor(Math.random() * SILLY_FACTS.length)]);
        setShowFact(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = useCallback((target: string, flashText: string) => {
    setGameOverText(flashText);
    setGameOver(true);
    setTimeout(() => { router.push(target); }, 800);
  }, [router]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1) {
        setKeystrokes((prev) => [...prev.slice(-29), e.key]);
      }

      konamiBuffer.current = [...konamiBuffer.current.slice(-9), e.key];
      const buf = konamiBuffer.current.slice(-KONAMI_CODE.length);
      if (buf.length === KONAMI_CODE.length && buf.every((k, i) => k === KONAMI_CODE[i])) {
        konamiBuffer.current = [];
        setKonami(true);
        setTimeout(() => setKonami(false), 3000);
        return;
      }

      const recent = keystrokes.join("");
      if (recent.endsWith("home")) {
        handleNavigation("/", "ACCESS GRANTED");
      } else if (recent.endsWith("dump")) {
        handleNavigation("/braindump", "ACCESS GRANTED");
      }
      for (const [word, { action, url }] of Object.entries(EASTER_EGG_WORDS)) {
        if (recent.endsWith(word)) {
          handleNavigation(url, action);
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keystrokes, handleNavigation]);

  const addBoop = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const b = {
      id: boopId.current++,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      emoji: BOOP_EMOJIS[Math.floor(Math.random() * BOOP_EMOJIS.length)],
    };
    setBoops((prev) => [...prev.slice(-10), b]);
    setTimeout(() => {
      setBoops((prev) => prev.filter((bp) => bp.id !== b.id));
    }, 1500);

    clickCount.current++;
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      setTitleWobble(true);
      setMessage("ok ok stop clicking. we get it. you're persistent.");
      setTimeout(() => {
        setTitleWobble(false);
        setMessage(SILLY_MESSAGES[Math.floor(Math.random() * SILLY_MESSAGES.length)]);
      }, 2500);
    }
  };

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-surface"
      onClick={addBoop}
    >
      {/* Floating boop emojis */}
      {boops.map((b) => (
        <motion.span
          key={b.id}
          className="fixed pointer-events-none z-50 text-3xl select-none"
          style={{ left: b.x, top: b.y }}
          initial={{ opacity: 1, y: 0, scale: 0.3 }}
          animate={{ opacity: 0, y: -80, scale: 1.2, rotate: 25 }}
          transition={{ duration: 1.3 }}
        >
          {b.emoji}
        </motion.span>
      ))}

      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-24 h-24 border-4 border-brutal-pink opacity-10"
          style={{ top: "15%", left: "10%" }}
          animate={{ rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />
        <motion.div
          className="absolute w-16 h-16 bg-brutal-yellow opacity-10"
          style={{ bottom: "20%", right: "12%" }}
          animate={{ rotate: [0, -45, 0], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        />
        <motion.div
          className="absolute w-20 h-20 border-4 border-brutal-blue opacity-10 rounded-full"
          style={{ top: "60%", left: "70%" }}
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
      </div>

      {/* Konami code celebration */}
      <AnimatePresence>
        {konami && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.p
                className="font-display text-5xl md:text-7xl font-extrabold uppercase"
                style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: COLORS.pink }}
                animate={{ scale: [1, 1.2, 1], rotate: [-3, 3, -3, 0] }}
                transition={{ repeat: 3, duration: 0.5 }}
              >
                KONAMI!
              </motion.p>
              <motion.p
                className="mt-4 font-mono text-sm"
                style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.yellow }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                you have 30 lives. or do you?
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-xl mx-6 text-center">
        {/* Big 404 with wobble */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: titleWobble ? [0, -5, 5, -3, 3, 0] : 0,
          }}
          transition={{
            opacity: { duration: 0.6 },
            y: { duration: 0.6 },
            rotate: { duration: 0.5 },
          }}
        >
          <h1
            className="font-display text-7xl md:text-9xl font-extrabold uppercase leading-none select-none"
            style={{
              fontFamily: TYPOGRAPHY.fontDisplay,
              color: COLORS.pink,
              textShadow: `6px 6px 0px var(--fg)`,
            }}
          >
            404
          </h1>
        </motion.div>

        {/* Silly message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-6 font-mono text-base md:text-lg text-fg-muted"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            {message}
          </motion.p>
        </AnimatePresence>

        {/* Rotating fact */}
        <AnimatePresence mode="wait">
          <motion.p
            key={fact}
            initial={{ opacity: 0, y: 8 }}
            animate={showFact ? { opacity: 1, y: 0 } : { opacity: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-sm text-fg-muted italic"
            style={{ fontFamily: TYPOGRAPHY.fontSans }}
          >
            {fact}
          </motion.p>
        </AnimatePresence>

        {/* Navigation links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-3 justify-center"
        >
          <Link
            href="/"
            className="font-mono text-xs uppercase border-2 border-fg px-5 py-3 text-fg hover:bg-fg hover:text-surface transition-all shadow-brutal-sm"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.mono,
            }}
            data-cursor-label="Go Home"
          >
            home
          </Link>
          <Link
            href="/braindump"
            className="font-mono text-xs uppercase border-2 border-fg px-5 py-3 text-fg hover:bg-fg hover:text-surface transition-all shadow-brutal-sm"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.mono,
            }}
            data-cursor-label="Brain Dump"
          >
            brain dump
          </Link>
          <Link
            href="/projects"
            className="font-mono text-xs uppercase border-2 border-brutal-pink px-5 py-3 text-brutal-pink hover:bg-brutal-pink hover:text-surface transition-all shadow-brutal-sm"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.mono,
              boxShadow: `4px 4px 0px ${COLORS.pink}`,
            }}
            data-cursor-label="Projects"
          >
            projects
          </Link>
          <Link
            href="/tools"
            className="font-mono text-xs uppercase border-2 border-fg px-5 py-3 text-fg hover:bg-fg hover:text-surface transition-all shadow-brutal-sm"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.mono,
            }}
            data-cursor-label="Tools"
          >
            tools
          </Link>
        </motion.div>

        {/* Subtle command hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 font-mono text-2xs text-fg-muted/50"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
        >
          psst... type{" "}
          <span style={{ color: COLORS.pink }}>home</span>
          ,{" "}
          <span style={{ color: COLORS.pink }}>dump</span>
          ,{" "}
          <span style={{ color: COLORS.pink }}>schizo</span>
          ,{" "}
          <span style={{ color: COLORS.pink }}>yeet</span>
          , or the{" "}
          <span style={{ color: COLORS.yellow }}>konami code</span>{" "}
          on your keyboard
        </motion.p>
      </div>

      {/* Game over flash */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: COLORS.pink }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="font-display text-4xl font-extrabold uppercase"
              style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: COLORS.black }}
            >
              {gameOverText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
