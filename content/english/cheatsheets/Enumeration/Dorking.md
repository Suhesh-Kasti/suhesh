---
title: Dorking
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/dorking.png"
description: are used in search engine queries to find stuffs hiding deep under.
cheatsheet_categories: ["Cybersecurity"]
cheatsheet_tags: ["dorking", "google dorks"]
folder: "enumeration"
---

# Google Dorking

|**Operator**|**Purpose**|**Example**|
|---|---|---|
|`site:`|Limit search to a specific domain|`site:target.com`|
|`filetype:` or `ext:`|Search for specific file extensions|`filetype:log` or `ext:env`|
|`inurl:`|Search for keywords in the URL path|`inurl:admin` or `inurl:swagger`|
|`intext:` or `intext:`|Search for exact text inside pages|`intext:"access_key"`|

#### 1. Finding exposed configuration and environment files
```bash
site:target.com ext:env OR ext:yaml OR ext:ini OR ext:conf
```

####  2. Finding exposed API documentation or Swagger UI
```bash
site:target.com inurl:swagger OR inurl:api-docs OR inurl:graphql
```

#### 3. Finding accidentally exposed Git repositories
```bash
site:target.com inurl:.git/config
```

#### 4. Finding sensitive files (logs, backups, database dumps)
```bash
site:target.com ext:log OR ext:txt OR ext:sql OR ext:bak
```

# Shodan Dorking
Shodan track the internet's open ports and banners.

#### Shodan Operators:

- `org:"Organization Name"` - Filter by owner
    
- `product:"Apache"` - Filter by software
    
- `port:27017` - Filter by specific port (e.g., MongoDB)
    
- `has_vuln:true` - Verified vulnerabilities (requires paid API)
    
- `net:"192.168.1.0/24"` - Specific CIDR range

#### 1. Search for host information by IP
```bash
shodan host 10.129.2.49
```

#### 2. Count how many instances of a product exist
```bash
shodan count product:nginx
```

#### 3. Search for exposed MongoDB databases with no authentication
```bash
shodan search "MongoDB Server Information" port:27017
```

#### 4. Find exposed Jenkins automation servers (common for CI/CD leaks)
```bash
shodan search "X-Jenkins" port:8080
```

# Censys CLI Dorking
Censys excels at SSL certificate mapping and hosts. It uses a structured query language.

#### 1. Find hosts belonging to an organization
```bash
services.tls.certificates.leaf_data.subject.organization: "InlaneFreight"
```

#### 2. Find exposed HTTP services on non-standard ports
```bash
services.service_name: "HTTP" AND NOT services.port: 80
```

#### 3. Find specific software versions
```bash
services.software.version: "1.18.0"
```

---

# Git & GitHub OSINT

Finding secrets leaked by developers in public repositories.

#### 1. GitHub Search Bar Queries:
```bash
"target.com" "password"
```
```bash
"target.com" "api_key"
```
```bash
"target.com" "jdbc:postgresql"
```
```bash
"target.com" ext:sql
```
```bash
"target.com" "BEGIN RSA PRIVATE KEY"
```