"use client";

import { useEffect, useRef } from "react";

const TITLES = [
  "You look beautiful today ;-)",
  "Let me hack your heart ❤️",
  "GET /YOUR_MONEY HTTP/1.1",
  "POST /malware.exe",
  "rm -rf /your-inhibitions",
  "sudo make me a sandwich",
  "chmod 777 your-heart",
  "DROP TABLE relationships;",
  "curl -X POST /love",
  ":(){ :|:& };:",
  "cat /proc/your-mind",
  "apt-get install happiness",
  "grep -r 'meaning' /dev/life",
  "Your vibe has been pwned",
  "Access granted. Probably.",
  "Port scanning your soul...",
  "127.0.0.1 — there's no place like home",
  "I'm not a robot. I'm a hacker.",
  "Exploiting since 2023",
  "Your password is: hunter2",
];

function pickRandom(arr: string[], exclude: string): string {
  const pool = arr.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function TitleCycler() {
  const prevRef = useRef(TITLES[0]);

  useEffect(() => {
    const prev = prevRef.current;
    const next = pickRandom(TITLES, prev);
    prevRef.current = next;
    document.title = next;

    const interval = setInterval(() => {
      const prev = prevRef.current;
      const next = pickRandom(TITLES, prev);
      prevRef.current = next;
      document.title = next;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
