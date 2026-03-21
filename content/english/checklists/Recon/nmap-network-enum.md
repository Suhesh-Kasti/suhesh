---
title: "Nmap Engagement & Evasion Strategy"
description: "A comprehensive checklist for network discovery, port scanning, and firewall evasion during pentesting or exams."
date: 2026-03-10T10:00:00+05:45
checklist_categories: ["Recon"]
checklist_tags: ["cpts", "red-team", "bug hunt"]
draft: false
folder: "recon"
weight: 1
---

### Phase 1: Host Discovery
- [ ] Determine if the host is alive using ICMP Echo.
    ```bash
    sudo nmap -sn -PE 10.129.x.x
    ```
- [ ] If ICMP is blocked, force a scan by skipping host discovery.
    ```bash
    nmap -Pn 10.129.x.x
    ```

### Phase 2: TCP Port Discovery
- [ ] Run a fast, full TCP scan to identify all open ports.
    ```bash
    sudo nmap -p- --min-rate 5000 10.129.x.x -oG all_ports.gnmap
    ```
- [ ] Verify the port state reasons if many ports appear filtered.
    ```bash
    nmap -p 21,22,80 --reason 10.129.x.x
    ```

### Phase 3: Service Enumeration & Scripting
- [ ] Perform a surgical service and default script scan on discovered ports.
    ```bash
    sudo nmap -sC -sV -p [PORTS] 10.129.x.x -oN service_scan.nmap
    ```
- [ ] Run targeted NSE scripts for identified services (e.g., HTTP enumeration).
    ```bash
    nmap --script "http-enum,http-title" -p 80,443 10.129.x.x
    ```

### Phase 4: UDP Scanning
- [ ] Scan common UDP ports or specific services like DNS/SNMP.
    ```bash
    sudo nmap -sU -F --top-ports 100 10.129.x.x
    ```
- [ ] Use rate-limiting evasion for UDP to avoid false negatives.
    ```bash
    sudo nmap -sU -p 53,161 --max-retries 1 --scan-delay 20ms 10.129.x.x
    ```

### Phase 5: Firewall & IDS/IPS Evasion
- [ ] Check if the firewall is stateful using an ACK scan.
    ```bash
    sudo nmap -sA -p 80,443 10.129.x.x
    ```
- [ ] Bypass stateless firewalls using a trusted source port.
    ```bash
    sudo nmap -sS -p [PORT] --source-port 53 10.129.x.x
    ```
- [ ] Evade signature-based IDS using packet fragmentation.
    ```bash
    sudo nmap -f -p [PORT] 10.129.x.x
    ```