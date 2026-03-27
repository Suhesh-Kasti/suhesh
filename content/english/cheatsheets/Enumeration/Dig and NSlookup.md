---
title: Dig and NSlookup
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/dns_lookup.svg"
description: are used to query nameservers.
cheatsheet_categories: ["Enumeration"]
cheatsheet_tags: ["nslookup", "dig"]
folder: "enumeration"
---

# Dig
#### 1. General lookup for all record types

```bash
dig target.com ANY
```

#### 2. Look for TXT records (SPF, DMARC, Domain Verifications)
```bash
dig target.com TXT
```


#### 3. Look for Mail Exchange servers (Email infrastructure)
```bash
dig target.com MX
```

#### 4. Query a specific Name Server directly
```bash
dig target.com @ns1.target.com
```

#### 5. Attempt a Zone Transfer (AXFR) - Pulls the entire DNS database if misconfigured
```bash
dig axfr target.com @ns1.target.com
```

#### 6. Short output (clean IP addresses only for automation)
```bash
dig target.com +short
```

# NSlookup

While `dig` is preferred on Linux, `nslookup` is pre-installed on every Windows machine and is essential for pivoting or when you only have access to a Windows shell.

## Non-Interactive 

#### 1. Basic IP lookup
```bash
nslookup target.com
```

#### 2. Reverse lookup (Who owns this IP?)
```bash
nslookup 1.1.1.1
```

#### 3. Query a specific record type (MX, TXT, NS, ANY)
```bash
nslookup -type=mx target.com
```

#### 4. Query using a specific DNS server (e.g., Google's 8.8.8.8)
```bash
nslookup target.com 8.8.8.8
```

## Interactive Mode (The Professional Way)

Type `nslookup` and hit enter to stay in the prompt. This allows for faster, repeated queries.

#### 1. Change your current DNS server
```bash
server 8.8.8.8        
```

#### 2. Set all following queries to TXT records
```bash
set type=txt
```

#### 3. Perform the query
```bash
target.com 
```

#### 4. Enable verbose output (shows full packet details)
```bash
set debug 
```

#### 5. Attempt Zone Transfer (Windows-specific nslookup command)
```bash
ls -d target.com       
```
