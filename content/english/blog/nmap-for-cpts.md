---
title: "CPTS: Network Enumeration with Nmap"
meta_title: "HTB CPTS - Nmap Mastery & Evasion Walkthrough"
description: "Comprehensive guide to mastering Nmap for Hack The Box CPTS. Covers Host Discovery, UDP scanning headaches, NSE scripting, Firewall/IDS evasion, and custom ZSH automation for extracting ports."
date: 2026-03-15T12:00:00
image: /images/blog/nmap/nmap-cover.png
categories:
  -  HTB CPTS
  - Network Enumeration
author: Suhesh Kasti
tags:
  - Red Team
  - Hack The Box
  - Nmap
  - Evasion
  - CPTS
buttons:
  - label: CPTS Module
    url: https://academy.hackthebox.com/app/module/19
quiz:
  code: nmap-for-cpts
wordfill:
  code: nmap-for-cpts
---

## 1. The Philosophy of Enumeration

Scanning is the process of sending a specific probe (a packet with certain flags) and observing the response. The "State" Nmap reports is simply an interpretation of that response based on RFC standards. If a firewall sits in the middle, it "lies" or "silences" the conversation, which is why Nmap has complex states like `open|filtered`.

---

## 2. Host Discovery: The "Is Anyone Home?" Phase

Before scanning 65,535 ports, Nmap tries to see if the target is alive. This is the **Host Discovery** phase.

- **Layer 2 (Local Network):** Nmap uses **ARP requests**. If you are on the same subnet, Nmap doesn't care about your flags; if the MAC address responds, the host is up.
    
- **Layer 3 (Remote Network):** Nmap uses a combination of:
    
    1. **ICMP Echo Request** (`-PE`)
        
    2. **TCP SYN** to port 443 (`-PS443`)
        
    3. **TCP ACK** to port 80 (`-PA80`)
        
    4. **ICMP Timestamp Request** (`-PP`)
        

*Note: In pentesting, we almost always use `-Pn`. This tells Nmap: "Assume the host is alive. Do not ping it. Just start scanning ports." Many modern firewalls block ICMP (Ping), so Nmap would skip a perfectly valid target if you didn't use this flag.*

---

## 3. The Mechanics of TCP Scanning

TCP is a connection-oriented protocol. Nmap exploits the Three-Way Handshake (**SYN** &rarr; **SYN/ACK** &rarr; **ACK**).

### TCP SYN Scan (-sS)

Known as the "Half-Open" scan.

1. Nmap sends $SYN$.
    
2. Target sends $SYN/ACK$ (Port is **Open**).
    
3. Nmap sends $RST$ (Reset) immediately.
    
    **Why?** The connection is never fully established, so the application (like a web server) often doesn't log the connection, making it stealthier than a full connect scan.
    

### TCP Connect Scan (-sT)

1. Nmap sends $SYN$.
    
2. Target sends $SYN/ACK$.
    
3. Nmap sends $ACK$ (Connection established).
    
    **Why?** Used when the user doesn't have raw packet privileges (non-root) or when scanning through certain proxies. It is loud and appears in application logs.
    

---

## 4. The UDP Mystery: Scanning the Stateless

UDP is connectionless. There is no handshake. This makes UDP scanning notoriously slow and inaccurate.

- **How Nmap finds an Open UDP Port:** Nmap sends a UDP packet. If the port is open, the service often **says nothing** (unless Nmap sends a specific payload it understands).
    
- **How Nmap finds a Closed UDP Port:** If the port is closed, the Target OS (not the service) sends back an **ICMP Port Unreachable (Type 3, Code 3)** message.
    

**The "Silence" Problem:**

If Nmap sends a UDP packet and gets **nothing** back, it cannot tell if:

1. The port is open and just not responding to an empty packet.
    
2. A firewall dropped the packet.
    
    This results in the `open|filtered` state. To resolve this, you **must** use Version Detection (`-sV`), which sends actual data (like a DNS query) to force a response.
    

---

## 5. The Port State Matrix

Nmap interprets the combination of TCP flags and ICMP error codes to generate these states.

|**State**|**What Nmap "Saw"**|**Interpretation**|
|---|---|---|
|**Open**|$SYN/ACK$ (TCP) or Data response (UDP)|An application is actively accepting connections.|
|**Closed**|$RST$ (TCP)|No application is listening, but the host is reachable.|
|**Filtered**|No response or ICMP Error (Type 3, Code 1, 2, 9, 10, or 13)|A firewall, filter, or network obstacle is blocking the probe.|
|**Unfiltered**|$RST$ (Only seen in ACK scans `-sA`)|The ports are reachable, but Nmap cannot determine if they are open or closed.|
|**Open\|Filtered**|No response at all|The port is either open or blocked by a "silent" firewall. Common in UDP or FIN/NULL scans.|
|**Closed\|Filtered**|ICMP Port Unreachable (Type 3, Code 3)|Only seen in IP ID Idle scans.|

---

## 6. Service and Version Detection (-sV)

Once ports are found, Nmap tries to determine what is actually running. It uses the `nmap-services-probes` database.

1. **Banner Grabbing:** It connects and waits for the service to say "Hello" (e.g., `220 SSH-2.0-OpenSSH_8.2`).
    
2. **Probing:** If the service is silent, Nmap sends "Probes" (complex strings) and compares the response against thousands of signatures.
    
3. **Intensity (`--version-intensity [0-9]`):** Higher numbers try more probes but take much longer. Level 7 is usually sufficient for obscure services.
    

---

## 7. The Nmap Scripting Engine (NSE)

NSE scripts are written in Lua. They extend Nmap from a scanner to a vulnerability tool.

### Script Categories

- **default (`-sC`):** Essential, safe scripts.
    
- **discovery:** Tries to map the network (e.g., finding SMB shares or SNMP info).
    
- **vuln:** Checks for specific known vulnerabilities (e.g., MS17-010).
    
- **exploit:** Tries to actively exploit a vulnerability.
    
- **auth:** Tries to bypass or test authentication.
    
- **brute:** Performs brute-force against services.
    

**Documentation Link:**

The definitive source for all scripts and their arguments is the [Nmap Script Database](https://nmap.org/nsedoc/).

**Usage Tip:**

To find scripts on your local Linux machine:

`ls /usr/share/nmap/scripts/ | grep <service>`

---

## 8. Performance and Optimization

Scanning is a balance between accuracy and speed.

- **Timing (`-T0` to `-T5`):**
    
    - `T3` is default.
        
    - `T4` is recommended for most CTFs/Labs.
        
    - `T5` is aggressive and may crash fragile services or drop packets.
        
- **Rate Limiting (`--min-rate`):**
    
    If you know the network is stable, use `--min-rate 1000` to ensure Nmap never sends fewer than 1000 packets/sec. This is often faster than timing templates.
    
- **Parallelism:**
    
    `--min-parallelism` and `--max-parallelism` control how many "probes" are in flight at once.
    

---

## 9. Advanced: Bypassing Firewalls

If a firewall is blocking you (Filtered state), use these techniques:

1. **Fragmentation (`-f`):** Splits the TCP header into small pieces to hide it from simple packet filters.
    
2. **Decoys (`-D`):** Mixes your IP with random IPs so the admin cannot tell who is the real scanner.
    
3. **Source Port Spoofing (`--source-port 53`):** Forces Nmap to send traffic from port 53. Many firewalls allow all incoming traffic from port 53 assuming it is a DNS response.
    
4. **Data Length (`--data-length`):** Appends random data to the packet. Firewalls often ignore packets that look like empty "scan" packets but allow packets that have a data payload.
    

---

## 10. Thinking in Nmap: The Summary Loop

1. **Discovery:** Find the target (`-sn` or `-Pn`).
    
2. **Surface Mapping:** Find all TCP ports (`-p-`).
    
3. **Service Interrogation:** What are those ports? (`-sV -sC`).
    
4. **Specific Probing:** Use NSE scripts for the services found (e.g., `--script http-enum`).
    
5. **UDP Check:** Do not forget the top 100 UDP ports (`-sU --top-ports 100`).
    
## The Seven States of Nmap

Nmap doesn't guess; it interprets the RFC (Request for Comments) behavior of the target's operating system. When a packet is sent, the response (or lack thereof) determines the state.

|**State**|**Nmap's Logic**|**Technical Meaning**|
|---|---|---|
|**Open**|Received $SYN/ACK$ (TCP) or a valid UDP response.|An application is actively listening and accepting connections.|
|**Closed**|Received $RST$ (Reset).|The host is reachable, but no application is listening on that port.|
|**Filtered**|No response at all OR an ICMP error (Type 3, Code 1, 2, 9, 10, 13).|A firewall, filter, or network obstacle is dropping the packets.|
|**Unfiltered**|Received $RST$ during an ACK scan (`-sA`).|The port is reachable, but Nmap cannot tell if it is open or closed.|
|**Open\|Filtered**|No response received.|Common in UDP or FIN scans. Nmap cannot distinguish between an open port and a firewall drop.|
|**Closed\|Filtered**|Received ICMP Port Unreachable (Type 3, Code 3).|Primarily seen in IP ID Idle scans; indicates the port is either closed or filtered.|

---

## Diagnostic Flags: Seeing Through the Matrix

When a scan gives you weird results, you need to "see" the packets. These flags turn Nmap from a scanner into a debugger.

### 1. The Why: `--reason`

By default, Nmap tells you a port is `Closed`. Using `--reason` tells you **why** it thinks that (e.g., "Received RST"). This is vital for identifying if a firewall is "faking" responses.

- **Usage:** `sudo nmap -p80 --reason 10.129.2.49`
    

### 2. The How: `--packet-trace`

This shows every single packet Nmap sends and receives in real-time. If you suspect your VPN is dropping packets or a rate-limiter is killing your scan, this flag reveals the truth.

- **Usage:** `sudo nmap -p22 --packet-trace 10.129.2.49`
    

---

## The Efficiency Stack: Professional Optimization

In the field, time is a vulnerability. You want the most data with the least "dead air."

- **`-n` (Disable DNS Resolution):** Nmap spends a lot of time trying to resolve IP addresses to hostnames. In a lab (HTB/CPTS), this is useless. Use `-n` to save significant time.
    
- **`--min-rate <number>`:** Do not rely on `-T4` if the network is stable. Set a minimum packet rate.
    
    > _Warning:_ Setting this too high on a slow VPN will cause you to miss ports. Start at `500` and move to `1000` if results remain consistent.
    
- **`-Pn` (No Ping):** Always use this in labs. Modern firewalls block ICMP, and Nmap will assume the host is down if you don't skip the ping check.
    

---

## Ncat: The Swiss Army Knife

It is important to know that "Netcat" is actually three different tools depending on your Linux distro. Nmap’s version (`ncat`) is the modern gold standard.

|**Feature**|**Ncat (Nmap Version)**|**netcat-traditional (GNU)**|**netcat-openbsd (BSD)**|
|---|---|---|---|
|**SSL/TLS Support**|Yes (`--ssl`)|No|No|
|**Access Control**|Yes (`--allow`, `--deny`)|No|No|
|**Port Forwarding**|Built-in|Requires pipes (`\|`)|Requires pipes (`\|`)|
|**IPv6 Support**|Native|Limited|Native|
|**The `-e` Flag**|Securely handled|Present (Insecure)|Usually removed|

[Image comparing Ncat vs Netcat features]

> **Why use Ncat?** Because it supports SSL. If you find a service running on HTTPS or a custom encrypted port, standard Netcat will fail. `ncat --ssl <IP> <PORT>` will let you talk to it in plaintext while handling the encryption in the background.

---

## NSE (Nmap Scripting Engine) Mastery

Don't just run `-sC`. You need to understand the **Categories** of scripts to be surgical.

### 1. Default (`-sC`)

The "safe" collection. It grabs banners, checks for anonymous FTP, and identifies basic web titles.

### 2. Discovery (`--script discovery`)

Used to find hidden information. It will try to map SMB shares, SNMP strings, and directory structures.

### 3. Vulnerability (`--script vuln`)

Checks for the "Big Hits" (EternalBlue, Heartbleed, etc.).

- **Workflow Tip:** Never run this on all 65,535 ports. Run it only on specific services you've identified (e.g., `-p 445 --script vuln`).
    

### 4. Intrusive/Brute (`--script brute`)

These will try to log in. They are loud and will lock out accounts if not careful. Use these only when you have a specific username or a very small wordlist.

---

## The Footprinting Strategy: A Logical Flow

This is how a professional approaches a target to ensure nothing is missed.

### Phase 1: The "Loud" Discovery

Quickly find all open doors. We don't care about versions yet.

Bash

```
sudo nmap -Pn -n -p- --min-rate 1000 10.129.2.49 -oG all_ports.gnmap
```

### Phase 2: The "Surgical" Interrogation

Take the ports you found (e.g., 22, 80, 445) and ask for their IDs.

Bash

```
sudo nmap -Pn -n -sV -sC -p 22,80,445 10.129.2.49 -oN service_details.nmap
```

### Phase 3: The "Deep Dive" (NSE)

If Port 80 is a web server, look for files. If Port 445 is SMB, look for shares.

Bash

```
# Web enumeration
sudo nmap -p80 --script "http-enum,http-vhosts,http-methods" 10.129.2.49

# SMB enumeration
sudo nmap -p445 --script "smb-enum-shares,smb-enum-users,smb-os-discovery" 10.129.2.49
```

### Phase 4: The UDP Cleanup

UDP is slow, so we do it last and only for the most likely services.

Bash

```
sudo nmap -Pn -n -sU --top-ports 100 10.129.2.49
```

---

## Pro-Tip: When to use Ncat vs. Nmap

- Use **Nmap** when you need to scan thousands of ports or run automated scripts.
    
- Use **Ncat** when you find a weird port (like 31337) and you just want to send a "Hello" or a raw payload to see what the service says back manually.
