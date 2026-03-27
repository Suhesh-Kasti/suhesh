---
title: Subdomain Enum Tools
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/enum_tools.png"
description: are used to enumerate subdomains.
cheatsheet_categories: ["Hacking Tools"]
cheatsheet_tags: ["subfinder", "amass", "assetfinder"]
folder: "enumeration"
---

# Subfinder 
The fastest passive aggregator. It doesn't scan; it just asks other databases what they know.

#### 1. Basic passive discovery 
```bash
subfinder -d target.com -silent 
```

#### 2. Discovery using wordlist
```bash
subfinder -d target.com -o subdomains.txt
```

#### 3. Aggregate from all sources and save to file 
```bash
subfinder -d target.com -all -o subdomains.txt
```

# Amass 
It uses a graph database to map relationships between IPs, domains, and ASNs for deep passive mapping.

#### 1. Passive mode (stealthy)
```bash
amass enum -passive -d target.com
```

#### 2. Active mode (brute forcing and resolving) 
```bash
amass enum -active -d target.com -brute -w /path/to/wordlist.txt
```

# BBOT (BBN-OSINT)
It intelligently correlates data rather than just listing it.

#### 1. Deep subdomain enumeration with passive flags
```bash
bbot -t target.com -p subdomain-enum -rf passive
```

# Assetfinder 
Go-based passive subdomain scraper
```bash
assetfinder --subs-only target.com > subdomains.txt
```

# CloudBrute

Used to find company infrastructure across AWS, Azure, and Google Cloud.

#### 1. Search for buckets, apps, and storage belonging to a company
```bash
cloudbrute -d target.com -k keyword_list.txt
```

# S3Scanner

Specifically targets misconfigured Amazon storage buckets.
#### 1. Scan a list of potential bucket names
```bash
s3scanner scan --bucket-file buckets.txt
```

# Dump contents of an open bucket
```bash
s3scanner dump --bucket target-backup-2026
```

---

# Tech Stack & API Discovery

|**Tool**|**Purpose**|**Command / Tip**|
|---|---|---|
|**Wappalyzer**|Identifies CMS, Web Frameworks, and DBs.|Use the CLI or Browser Extension.|
|**WhatWeb**|"Next Gen" version of Nmap's banner grab.|`whatweb -a 3 target.com`|
|**Kiterunner**|The gold standard for API endpoint discovery.|`kr scan target.com/api -w routes.json`|
|**Nuclei**|Scans for specific "fingerprints" of known vulns.|`nuclei -u https://target.com -t exposures/`|