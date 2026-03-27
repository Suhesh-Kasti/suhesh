---
title: Nmap
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/nmap.svg"
description: is a powerful network discovery and security auditing tool used to discover hosts, map networks, and enumerate services and vulnerabilities.
cheatsheet_categories: ["Reconnaissance"]
cheatsheet_tags: ["nmap", "cpts", "htb", "red-team"]
folder: "enumeration"
---

# 1. Host Discovery
{{< accordion "nmap -sn: Ping Scan (Disable Port Scan)" >}}

Discover active hosts on a network without scanning their ports. 
It uses ICMP, TCP SYN/ACK, and ARP depending on your privileges and network location.
```bash
nmap -sn 10.129.2.0/24
```

{{< /accordion >}}

{{< accordion "nmap -Pn: Treat All Hosts as Online" >}}

Skip the initial ping discovery phase. Essential when a target firewall is blocking ICMP echo requests, forcing Nmap to scan the ports anyway.
```bash
nmap -Pn 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -PE: ICMP Echo Ping (Layer 3 Routing)" >}}

Force an ICMP Echo request to see if the host responds. Adding `--disable-arp-ping` forces Nmap to use Layer 3 routing even on a local network, and `--packet-trace` lets you see exactly what is sent and received.
```bash
nmap -10.129.2.47 -sn -PE --disable-arp-ping --packet-trace
```

{{< /accordion >}}

# 2. Scan Techniques (TCP & UDP)
{{< accordion "nmap -sS: TCP SYN Scan (Stealth Scan)" >}}

**The default scan if running as root.** 

It performs a "half-open" connection by sending a SYN packet and waiting for a SYN-ACK. It never completes the 3-way handshake, making it faster and slightly stealthier.
```bash
sudo nmap -sS 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -sT: TCP Connect Scan" >}}

**The default scan if not running as root.** 

Completes the full 3-way TCP handshake. It is highly accurate but very noisy and easily logged by target systems.
```bash
nmap -sT 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -sU: UDP Scan" >}}

Scans for open UDP services (like DNS, SNMP, DHCP). UDP is connectionless; if a port is closed, it replies with an ICMP Port Unreachable. If it gets no response, it marks it `open|filtered`.
```bash
sudo nmap -sU 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -sA: TCP ACK Scan (Firewall Mapping)" >}}

Does not find open ports. Instead, it maps firewall rule sets. It sends ACK packets to determine if a port is `unfiltered` (allowed through the firewall) or `filtered` (blocked or dropped).
```bash
sudo nmap -sA 10.129.2.47
```

{{< /accordion >}}

# 3. Port Specifications
{{< accordion "nmap -p: Scan Specific Ports" >}}

Define exactly which ports to scan. Can be a single port, a comma-separated list, or a range.
```bash
nmap -p 22,80,443,8000-8080 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -p-: Scan All 65,535 Ports" >}}

Scans every possible TCP or UDP port. Crucial for finding hidden services running on non-standard, high-numbered ports.
```bash
nmap -p- 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -F: Fast Scan (Top 100 Ports)" >}}

Scans only the 100 most common ports instead of the default 1000. Great for a quick initial reconnaissance phase.
```bash
nmap -F 10.129.2.47
```

{{< /accordion >}}

# 4. Service & OS Detection
{{< accordion "nmap -sV: Service Version Detection" >}}

Interrogates open ports with specific probes to determine the exact service and version number running (e.g., Apache 2.4.41 instead of just "http").
```bash
nmap -sV 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -O: Operating System Detection" >}}

Analyzes TCP/IP stack fingerprints to guess the target operating system. Works best when the target has at least one open and one closed port. Use `--osscan-guess` to force a guess if unsure.
```bash
sudo nmap -O --osscan-guess 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -A: Aggressive Scan" >}}

**The "all-in-one" flag.** Enables OS detection (`-O`), version detection (`-sV`), script scanning (`-sC`), and traceroute (`--traceroute`). 
```bash
nmap -A 10.129.2.47
```

{{< /accordion >}}

# 5. Timing & Performance
{{< accordion "nmap -T: Timing Templates" >}}

Sets the scanning speed from 0 (paranoid/slowest) to 5 (insane/fastest). `-T4` is the recommended balance of speed and reliability for standard CTF/Exam networks.
```bash
nmap -T4 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap --min-rate: Force Packet Rate" >}}

Forces Nmap to send packets at or above a specific rate per second. Excellent for speeding up all-port scans on reliable networks.
```bash
nmap -p- --min-rate 5000 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap --max-retries & --scan-delay: UDP/ICMP Evasion" >}}

Prevents Nmap from assuming ports are `open|filtered` when hitting a rate-limited target. `--max-retries 1` limits retransmissions, and `--scan-delay` slows the scan enough to allow the server to send ICMP rejection messages.
```bash
nmap -sU -p 53,161 --max-retries 1 --scan-delay 20ms 10.129.2.47
```

{{< /accordion >}}

# 6. Firewall & IDS/IPS Evasion
{{< accordion "nmap --source-port: Impersonate Trusted Traffic" >}}

Forces your scan traffic to originate from a specific port (like 53 for DNS or 80 for HTTP). Highly effective against poorly configured stateless firewalls that blindly trust return traffic from these ports.
```bash
sudo nmap -sS -p 50000 --source-port 53 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -D: Decoy Scans" >}}

Cloaks your real IP address by injecting fake IP addresses into the scan traffic. The target's IDS will see multiple IPs scanning them simultaneously, making it difficult to pinpoint the real attacker. `RND:10` generates 10 random decoy IPs.
```bash
sudo nmap -D RND:10 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap -f: Packet Fragmentation" >}}

Splits the TCP headers over several smaller packets (8 bytes by default). This can bypass older packet filters or IDS systems that do not properly reassemble fragments before inspecting them.
```bash
sudo nmap -f 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap --data-length: Add Random Data to Packets" >}}

Nmap normally sends empty packets for port scanning. Intrusion Detection Systems (IDS) flag empty packets as suspicious. This flag pads the packets with random bytes to simulate legitimate application traffic.
```bash
nmap --data-length 25 10.129.2.47
```

{{< /accordion >}}

# 7. Nmap Scripting Engine (NSE)
{{< accordion "nmap -sC: Default Scripts" >}}

Runs a suite of default, mostly non-intrusive scripts designed to gather basic information (like pulling default web pages, checking FTP anonymous login, or grabbing SSH hostkeys).
```bash
nmap -sC 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap --script: Run Specific Scripts" >}}

Run specific scripts by name, category (safe, vuln, discovery), or wildcard.

`--script "*"` --doing this uses all the script available and
`--script "http*"` --doing this uses all the script that start with http

*Note: Avoid running 'safe' or 'all' in labs as it loads hundreds of scripts and can cause Nmap to crash (Segfault).*
```bash
nmap -sV -p 80 --script "http-title,http-enum,vuln" 10.129.2.47
```

{{< /accordion >}}

{{< accordion "nmap --script-args: Pass Arguments to Scripts" >}}

Provide necessary parameters to scripts, such as setting a user-agent, providing a username/password, or supplying an API key.
```bash
nmap -p 80 --script http-put --script-args "http-put.url='/uploads/shell.php',http-put.file='./shell.php'" 10.129.2.47
```

{{< /accordion >}}

# 8. Output Formats
{{< accordion "nmap -oA: Output All Formats" >}}

Saves the scan results in all three major formats (Normal `.nmap`, Grepable `.gnmap`, and XML `.xml`) simultaneously. Always do this for record-keeping on engagements.
```bash
nmap -p 22,80 10.129.2.47 -oA nmap_initial_scan
```

{{< /accordion >}}

{{< accordion "nmap -oG: Grepable Output" >}}

Saves the output in a format specifically designed for parsing with tools like `grep`, `awk`, or `sed`. Useful for piping directly into terminal extraction scripts.
```bash
nmap -p- 10.129.2.47 -oG grepable_output.txt
```

{{< /accordion >}}