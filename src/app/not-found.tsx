"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faHouse,
  faTerminal,
  faToolbox,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

const SILLY_MESSAGES = [
  "this page ran away. probably scared of commitment.",
  "404 — you found the void. congrats?",
  "nothing here but dust and bad decisions.",
  "we looked everywhere. even under the couch. nada.",
  "this is not the page you're looking for. *jedi wave*",
  "the bits got lost in the tubes. sorry.",
  "page.exe has stopped working. wait or give up?",
  "someone stole this page. the suspect is at large.",
  "digital tumbleweeds. nothing else here.",
  "error 404: your vibe is too powerful for this page.",
  "this page took the red pill. it's gone, neo.",
  "the server understood the request, but refuses. drama queen.",
  "here be dragons. also, no page.",
  "we asked the AI to find this page. it hallucinated instead.",
  "page not found, but at least you're good looking.",
];

const SILLY_FACTS = [
  "this page doesn't exist, but you do. that's something.",
  "schrodinger's page — both here and not here until you looked.",
  "the server didn't crash. the page just ghosted you.",
  "even the pixels are confused right now.",
  "the first 404 was spotted in 1992. it's older than tiktok.",
  "if a 404 happens in a forest, does anyone see it?",
  "the internet has billions of pages. you found one of the missing ones.",
  "every time a 404 is served, a developer sighs quietly.",
  "you're technically not lost. the page is.",
  "this page was last seen in another dimension.",
  "the url you typed is valid in at least zero universes.",
];

const BOOP_GLYPHS = ["404", "ERR", "0x", "//", "<>", "{}", "!!", "??", "*", "#", "%", "@"];

const DESTINATIONS = [
  { label: "Home", href: "/", icon: faHouse, color: COLORS.pink },
  { label: "Brain Dump", href: "/braindump", icon: faBookOpen, color: COLORS.yellow },
  { label: "Projects", href: "/projects", icon: faToolbox, color: COLORS.blue },
  { label: "Tools", href: "/tools", icon: faTerminal, color: COLORS.green },
];

const NAV_WORDS: Record<string, { action: string; url: string }> = {
  dump: { action: "OPENING BRAIN DUMP", url: "/braindump" },
  projects: { action: "OPENING PROJECTS", url: "/projects" },
  tools: { action: "OPENING TOOLS", url: "/tools" },
};

const TOOL_EGGS: Record<string, { title: string; lines: string[] }> = {
  nmap: {
    title: "nmap -sV this-page",
    lines: [
      "Starting Nmap 7.95 ( https://nmap.org )",
      "Nmap scan report for this-page (127.0.0.1)",
      "PORT     STATE  SERVICE   VERSION",
      "22/tcp   open   ssh       OpenSSH 9.6",
      "80/tcp   open   http      nginx 1.27",
      "443/tcp  open   ssl/https nginx 1.27",
      "404/tcp  closed nowhere   no such page",
      "Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds",
    ],
  },
  msf: {
    title: "msfconsole",
    lines: [
      "msf6 > search page not found",
      "Matching Modules",
      "   #  Name                        Rank    Description",
      "   0  exploit/lost/nonexistent    normal  renders a 404",
      "msf6 > use exploit/lost/nonexistent",
      "[*] No payload configured, defaulting to none",
      "[*] Exploit completed, but no session was created",
    ],
  },
  metasploit: {
    title: "msfconsole",
    lines: [
      "msf6 > db_nmap -sS this-page",
      "[*] Nmap: 0 hosts up",
      "msf6 > exploit",
      "[-] Exploit failed: target has no attack surface",
      "[*] Auxiliary module execution completed",
    ],
  },
  hydra: {
    title: "hydra -l admin",
    lines: [
      "Hydra v9.5 starting",
      "[DATA] 16 tasks, 1 server, 1 login try",
      "[ATTEMPT] target this-page - login \"admin\" - pass \"404\"",
      "[STATUS] attack finished - 0 valid passwords found",
      "the page simply does not exist. brute force cannot help.",
    ],
  },
  sqlmap: {
    title: "sqlmap -u this-page",
    lines: [
      "[INFO] testing connection to the target URL",
      "[CRITICAL] page not found (404)",
      "[WARNING] unable to retrieve page content",
      "[INFO] fetched data logged to /dev/null",
      "[INFO] shutting down",
    ],
  },
  burp: {
    title: "Burp Suite",
    lines: [
      "Proxy intercept is ON",
      "GET /this-page HTTP/1.1  ->  404 Not Found",
      "Server: nginx",
      "No matching issues for this response.",
    ],
  },
  wireshark: {
    title: "tshark -i eth0",
    lines: [
      "1  0.000000  you -> server  HTTP  GET /this-page  ->  404",
      "2  0.014213  server -> you  TCP   [ACK]",
      "3  0.014300  you -> server  TCP   Connection closed",
      "3 packets captured",
    ],
  },
  whoami: {
    title: "whoami",
    lines: ["root", "well, root of nothing. this page is empty."],
  },
  sudo: {
    title: "sudo",
    lines: ["[sudo] password for visitor:", "permission denied. nice try."],
  },
  exploit: {
    title: "exploit",
    lines: [
      "[*] Sending stage (0 bytes) to this-page",
      "[*] Session 1 opened",
      "[*] Just kidding. There is nothing here to exploit.",
    ],
  },
  cve: {
    title: "cve lookup",
    lines: [
      "Searching for CVE-404-0000 ...",
      "CVE-404-0000: Page Not Found",
      "CVSS: 0.0 (None) — no impact, the page simply does not exist.",
    ],
  },
};

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState(SILLY_MESSAGES[0]);
  const [fact, setFact] = useState(SILLY_FACTS[0]);
  const [showFact, setShowFact] = useState(false);
  const [keystrokes, setKeystrokes] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverText, setGameOverText] = useState("ACCESS GRANTED");
  const [boops, setBoops] = useState<{ id: number; x: number; y: number; glyph: string }[]>([]);
  const [toolRun, setToolRun] = useState<{ title: string; lines: string[] } | null>(null);

  const boopId = useRef(0);
  const clickCount = useRef(0);
  const toolTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    return () => {
      if (toolTimer.current) clearTimeout(toolTimer.current);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = parallaxRef.current;
        if (!el) return;
        el.style.setProperty("--px", String(event.clientX / window.innerWidth - 0.5));
        el.style.setProperty("--py", String(event.clientY / window.innerHeight - 0.5));
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleNavigation = useCallback(
    (target: string, flashText: string) => {
      setGameOverText(flashText);
      setGameOver(true);
      setTimeout(() => {
        router.push(target);
      }, 800);
    },
    [router]
  );

  const runTool = useCallback((title: string, lines: string[]) => {
    setToolRun({ title, lines });
    if (toolTimer.current) clearTimeout(toolTimer.current);
    toolTimer.current = setTimeout(() => setToolRun(null), 6000);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.length === 1) {
        setKeystrokes((prev) => [...prev.slice(-29), event.key]);
      }
      const recent = keystrokes.join("");

      for (const [word, egg] of Object.entries(TOOL_EGGS)) {
        if (recent.endsWith(word)) {
          runTool(egg.title, egg.lines);
          setKeystrokes([]);
          return;
        }
      }
      for (const [word, { action, url }] of Object.entries(NAV_WORDS)) {
        if (recent.endsWith(word)) {
          handleNavigation(url, action);
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keystrokes, handleNavigation, runTool]);

  const addBoop = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const boop = {
      id: boopId.current++,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      glyph: BOOP_GLYPHS[Math.floor(Math.random() * BOOP_GLYPHS.length)],
    };
    setBoops((prev) => [...prev.slice(-10), boop]);
    setTimeout(() => {
      setBoops((prev) => prev.filter((item) => item.id !== boop.id));
    }, 1500);

    clickCount.current++;
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      setMessage("ok ok stop clicking. we get it. you're persistent.");
      setTimeout(() => {
        setMessage(SILLY_MESSAGES[Math.floor(Math.random() * SILLY_MESSAGES.length)]);
      }, 2500);
    }
  };

  return (
    <div ref={parallaxRef} className="relative min-h-screen overflow-hidden bg-surface" onClick={addBoop}>
      {boops.map((boop) => (
        <motion.span
          key={boop.id}
          className="fixed z-50 select-none font-mono text-xl font-bold"
          style={{ left: boop.x, top: boop.y, color: COLORS.pink }}
          initial={{ opacity: 1, y: 0, scale: 0.3 }}
          animate={{ opacity: 0, y: -80, scale: 1.2, rotate: 25 }}
          transition={{ duration: 1.3 }}
        >
          {boop.glyph}
        </motion.span>
      ))}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ top: "14%", left: "9%", transform: "translate3d(calc(var(--px, 0) * 26px), calc(var(--py, 0) * 26px), 0)" }}>
          <motion.div
            className="h-24 w-24 border-4 border-brutal-pink opacity-20"
            animate={{ rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
        </div>
        <div className="absolute" style={{ bottom: "18%", right: "11%", transform: "translate3d(calc(var(--px, 0) * -34px), calc(var(--py, 0) * -34px), 0)" }}>
          <motion.div
            className="h-16 w-16 bg-brutal-yellow opacity-20"
            animate={{ rotate: [0, -45, 0], scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
        </div>
        <div className="absolute" style={{ top: "58%", left: "68%", transform: "translate3d(calc(var(--px, 0) * 46px), calc(var(--py, 0) * 46px), 0)" }}>
          <motion.div
            className="h-20 w-20 rounded-full border-4 border-brutal-blue opacity-20"
            animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ backgroundColor: "var(--fg-muted)" }} />
          <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.32em", color: "var(--fg-muted)" }}>
            Signal lost
          </span>
          <span className="h-px w-8" style={{ backgroundColor: "var(--fg-muted)" }} />
        </div>

        <h1
          data-text="404"
          className="glitch-title select-none font-display text-7xl font-extrabold uppercase leading-none md:text-9xl"
          style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: COLORS.pink, textShadow: "6px 6px 0px var(--fg)" }}
        >
          404
        </h1>

        <div className="signal-static mt-4 h-[6px] w-40 opacity-60" aria-hidden />

        <div className="mt-8 w-full max-w-lg border-2 border-fg text-left" style={{ backgroundColor: "var(--surf)" }}>
          <div className="flex items-center gap-2 border-b-2 border-fg bg-fg px-3 py-1.5 text-surface">
            <FontAwesomeIcon icon={faTerminal} className="text-[10px]" />
            <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.12em" }}>
              lookup.log
            </span>
          </div>
          <div className="space-y-1 px-3 py-3 font-mono text-xs leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            <p className="break-all">
              <span style={{ color: COLORS.green }}>$</span> GET {pathname || "/unknown"} <span style={{ color: COLORS.red }}>&rarr; 404</span>
            </p>
            <p>
              <span style={{ color: COLORS.green }}>$</span> traceroute /lost <span style={{ color: "var(--fg-muted)" }}>&rarr; destination unreachable</span>
            </p>
            <p>
              <span style={{ color: COLORS.green }}>$</span> find / -name &quot;this-page&quot; <span style={{ color: "var(--fg-muted)" }}>&rarr; 0 results</span>
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-8 font-mono text-base text-fg md:text-lg"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            {message}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.p
            key={fact}
            initial={{ opacity: 0, y: 8 }}
            animate={showFact ? { opacity: 1, y: 0 } : { opacity: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-sm italic text-fg-muted"
            style={{ fontFamily: TYPOGRAPHY.fontSans }}
          >
            {fact}
          </motion.p>
        </AnimatePresence>

        <div className="mt-10 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {DESTINATIONS.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              className="flex items-center justify-center gap-2 border-2 border-fg px-3 py-3 font-mono text-2xs uppercase transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.1em", boxShadow: `4px 4px 0px ${destination.color}` }}
              data-cursor-label={destination.label}
            >
              <FontAwesomeIcon icon={destination.icon} className="text-xs" style={{ color: destination.color }} />
              <span className="text-fg">{destination.label}</span>
            </Link>
          ))}
        </div>

        <p className="mt-8 font-mono text-2xs text-fg-muted/70" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          type a tool name on your keyboard:{" "}
          {["nmap", "msf", "hydra", "sqlmap", "burp", "wireshark", "whoami", "sudo", "cve"].map((word, index) => (
            <span key={word}>
              {index > 0 && " · "}
              <span style={{ color: COLORS.pink }}>{word}</span>
            </span>
          ))}
        </p>
      </div>

      {/* Fake tool run overlay */}
      <AnimatePresence>
        {toolRun && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-2xl px-4 pb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="overflow-hidden border-2" style={{ borderColor: COLORS.green, backgroundColor: "#0b0b0f" }}>
              <div className="flex items-center gap-2 px-3 py-1.5" style={{ backgroundColor: "#14141b" }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.red }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.yellow }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS.green }} />
                <span className="ml-2 font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.green, letterSpacing: "0.12em" }}>
                  {toolRun.title}
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => setToolRun(null)}
                  aria-label="Close"
                  className="cursor-pointer text-xs text-white/60 transition-colors hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <pre className="max-h-52 overflow-auto px-3 py-3 font-mono text-xs leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "#c8ffd4" }}>
                {toolRun.lines.join("\n")}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <p className="font-display text-4xl font-extrabold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: COLORS.black }}>
              {gameOverText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
