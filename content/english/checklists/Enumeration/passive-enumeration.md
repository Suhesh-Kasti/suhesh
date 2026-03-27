---
title: "Passive Enumeration"
description: "A comprehensive checklist for service discovery, and enumeration without setting off alarms."
date: 2026-03-22T10:00:00+05:45
checklist_categories: ["Recon"]
checklist_tags: ["cpts", "red-team", "bug hunt"]
draft: false
folder: "enum"
weight: 3
---

### Phase 1: Passive Recon 

*Goal: Map the organization's footprint using third-party data. Never touch the target's IP directly.*

- [ ] **Domain & Subdomain Discovery**
    
    - **Tools:** `crt.sh`, `subfinder`, `VirusTotal`.
        
    - **Mentality:** "I’m looking for the forgotten attic." Focus on `dev-`, `staging-`, `api-`, `vpn-`, and `internal-`.
        
    - **Cloud Clue:** Look for subdomains like `s3-assets.company.com` or `dev-azure.company.com`.
        
- [ ] **DNS Record Analysis**
    
    - **Tools:** `dig`, `nslookup`.
        
    - **Mentality:** "Read the administrative leaks."
        
    - **The Prize:** TXT records often reveal the tech stack (Google Workspace, Atlassian, Microsoft 365, Mailgun). SPF records reveal the **Network Ranges** they trust.
        
- [ ] **Search Engine Intelligence (Dorking)**
    
    - **Tools:** Google, Bing, DuckDuckGo.
        
    - **Mentality:** "Find what should have been private." Look for `.log`, `.sql`, `.conf`, or `index of` pages, what the developers forgot to block via `robots.txt`, exposed `.env` files, leaked API keys, `.git` folders, and exposed swagger/OpenAPI documentation.
        
- [ ] **The "Cloud/API" Leak Check**
    
    - **Tools:** `GrayHatWarfare`, `GitHub`.
        
    - **Mentality:** "Dumpster dive to find the keys left in the trash." Search GitHub for the company name + "API_KEY" or "PASSWORD". Check for public S3 buckets or Azure Blobs named after the company.
        
- [ ] **Staff & Tech Stack Profiling**
    
    - **Tools:** LinkedIn, Job Boards (Indeed/Glassdoor).
        
    - **Mentality:** "The job post is a blueprint." If they are hiring for a "Senior Django Developer with AWS Lambda experience," we now know exactly what their backend and cloud architecture looks like.
        

---

### Phase 2: Semi-Passive 

*Goal: Use "Scanners-as-a-Service" to see what the internet already knows about their open ports.*

- [ ] **Infrastructure Mapping (Shodan/Censys)**
    
    - **Mentality:** "What was open yesterday?" Look for RDP (3389), SMB (445), or unauthenticated APIs (8080/8443).
        
    - **Modern Loophole:** Search for **Kubernetes Dashboards** or **Docker APIs** left exposed to the web.
        

---

### Phase 3: Active Footprinting 

**Goal:** Direct interaction to confirm services and versions.

- [ ] **The Initial Sweep (Nmap)**
    
    - **Mentality:** "Be fast, then be thorough."
        
    - [ ] **Step 1:** Quick port scan to see what's alive.
        
    - [ ] **Step 2:** Surgical version detection (`-sV`) on found ports.

- [ ] **API Endpoint Discovery**
    
    - **Look for:** `/api/v1/`, `/swagger.json`, `/v2/users`.
        
    - **Loopholes:** BOLA (Broken Object Level Authorization), unauthenticated endpoints.
        
- [ ] **Microservices & Message Brokers**
    
    - **Look for:** Exposed RabbitMQ (15672), Kafka (9092), Redis (6379), or Consul (8500).
        
    - **Loopholes:** Many internal message brokers are deployed without authentication because admins assume "nobody can reach the internal network."
        
- [ ] **AI & LLM Pipeline Exposures**
    
    - **Look for:** Exposed Jupyter Notebooks (8888), MLflow (5000), or Vector Databases (e.g., Pinecone, Weaviate, Milvus).
        
    - **Loopholes:** Model poisoning, unauthenticated access to training data, or API keys for OpenAI/Anthropic hardcoded in frontend JS.