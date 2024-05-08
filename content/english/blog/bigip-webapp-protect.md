---
title: "BigIP: Guided Web Application Security Config"
meta_title: "BIG-IP: Configuring Security Policies for Better Web Application Security"
description: "This comprehensive blog post provides a detailed breakdown of configuring security policies in BIG-IP ASM, covering essential elements such as policy types, enforcement modes, learning modes, and signature accuracy settings. It offers practical examples and explanations for each component, helping you enhance the security of your web applications."
date: 2024-05-04
image: "/images/blog/bigip/webappGuided.png"
categories: ["Cybersecurity"]
author: "Suhesh Kasti"
tags: ["Webapp Firewall", "Web App Security", "F5 - BigIP"]
buttons:
  - label: "Goto OWASP Top 10 cheatsheet"
    url: "/cheatsheets/owasp10"
quiz:
  code: big301
wordfill:
  code: big301
---
{{< toc >}}

![Webapp and F5 Big IP](/images/blog/bigip/webappvsf5.png)

1. Valid user tries to access a web application.
2. Bad actor tries to attack a web application.
3. BigIP's Advanced Web Application Firewall (AWAF) can distinguish between valid users and bad actors, letting only the valid user through.

# Comprehensive Protection

![Webapp Protection Comprehensive](/images/blog/bigip/webapp_protec.png)

You know what's cool? BIG-IP can offer comprehensive protection for your web applications with these awesome features:

1. BIG-IP can constantly monitor the health metrics of the protected web application, detect Denial of Service (DoS) attacks, and start mitigation.
2. We can identify malicious bots that bypass standard d/etection methods and mitigate threats before they even begin.
3. Our system enhances automated applicat/ion delivery with better IP intelligence by identifying IP addresses and security categories associated with malicious activity.
4. Geolocation enforcement allows you to restrict or allow application usage in specific countries.
5. BIG-IP's Advanced WAF provides protection from the OWASP Top 10 Web Application security risks.

# Security Layers
### **Process :=**
To configure comprehensive protection for your web application, you'll need to follow these friendly steps:

1. Enter a unique name for your configuration and select the security layers you want to enable. We've got options like Security Policy, Bot Defense, Behavioral Analysis DoS, IP Intelligence, Geolocation Enforcement, and IP Whitelist.

2. Configure the security policy properties such as enforcement mode, policy type, and X-Forwarded-For (XFF) headers.

3. Set up Bot Defense properties like enforcement mode, profile template, and mitigation settings.

4. Customize the DoS Profile properties according to your needs, such as operation and mitigation mode.

5. Choose mitigation actions for each IP Intelligence category.

6. Decide which countries can access your web application (Geolocation Enforcement).

7. Specify IP addresses that should be exempt from mitigation (IP Whitelist).

8. Click "Save & Next" to proceed to the next step, or "Save Draft" to come back later.

# Security Policies
### **Process :=** 
For the security policy, you'll need to select the enforcement mode and policy type. Let's break it down:

### Enforcement Mode
**Transparent**: We won't block requests from attacking IP addresses or to attacked URLs. We'll just monitor and log the traffic.
**Blocking**: We'll actively block connections from attacking IP addresses or requests to attacked URLs.

### Policy Type
 **Generic**: We'll create a Rapid Deployment Policy (RDP) with basic protection, manual learning of false positives, and no entity learning.
**Application Specific**: We'll create a policy specifically configured for your application's needs.

### Bot Defense
Bot Defense is like a superhero that helps identify and mitigate attacks before they cause any damage to your site. Here's how you can configure it:

1. **Select the enforcement mode**:
    - **Transparent**: We'll log mitigation and verification actions but won't perform any actions on the traffic.
    - **Blocking**: We'll perform and log mitigation and verification actions.

2. **Select the profile template** based on your application's security requirements. The template determines the default values for mitigation and verification settings.

3. **Enable Bot Microservices** to configure protection against OWASP Automated Threats (optional).

4. **Select the Browser Verification setting** to specify when we should send challenges.

5. **Select the mitigation action** for each bot category (you can keep the defaults).

### DoS Profile Properties
Configuring the DoS Profile properties helps us detect and mitigate those pesky Denial of Service attacks. Here's how you can set it up:

1. **Operation Mode**:
    - **Transparent**: We won't block requests from attacking IP addresses or to attacked URLs.
    - **Blocking**: We'll block connections from attacking IP addresses or requests to attacked URLs.

2. **Enable Bad Actors Behavior Detection** to detect clients exhibiting anomalous behavior and participating in the DoS attack.

3. **Enable Request Signatures Detection** to generate signatures describing patterns of the attack traffic for efficient mitigation.

4. **Select the Mitigation Mode** based on your environment's requirements. Available options include:
    - No mitigation
    - Standard protection
    - Conservative protection
    - Aggressive protection

| Mitigation Mode | Description |
|-----------------|--------------|
| No mitigation | We'll learn and monitor traffic behavior, but take no action. |
| Standard protection | If Bad Actors Detection is enabled, we'll slow down requests from anomalous IP addresses based on anomaly detection confidence and server health. We'll rate limit requests from anomalous IP addresses and, if necessary, all requests based on server health. We'll limit concurrent connections from anomalous IP addresses and, if necessary, all concurrent connections based on server health. If Request Signatures Detection is enabled, we'll block requests matching attack signatures. |
| Conservative protection | If Bad Actors Detection is enabled, we'll slow down and rate limit requests from anomalous IP addresses based on anomaly detection confidence and server health. If Request Signatures Detection is enabled, we'll block requests matching attack signatures. |
| Aggressive protection | If Bad Actors Detection is enabled, we'll slow down requests from anomalous IP addresses based on anomaly detection confidence and server health. We'll rate limit requests from anomalous IP addresses and, if necessary, all requests based on server health. We'll limit concurrent connections from anomalous IP addresses and, if necessary, all concurrent connections based on server health. We'll proactively perform all protection actions (even before an attack) and increase their impact. If Request Signatures Detection is enabled, we'll block requests matching attack signatures and increase the impact of blocked requests. |

5. **Enable Accelerated Signatures** to detect signatures before establishing a connection (optional).

6. **Enable TLS Signatures** to block bad actor fingerprints when trying to establish an SSL/TLS connection (optional, available from version 14.1.0).

7. **Enable Approved-only Signatures** to limit request signature detection to approved signatures only (optional).

### Geolocation Enforcement
Geolocation Enforcement is like a virtual bouncer that allows you to decide which countries can access your web application. We'll match the client's IP address to its physical location and, if your security policy allows that location, we'll grant access to your application.

Simply select the countries you want to allow or disallow access from.

### IP Whitelist
The IP Whitelist is a special list of trusted IP addresses that we'll exempt from security checks. Sources on the whitelist are never blocked, even if found in the IP Intelligence database.

1. Enter the IP address and associated netmask that needs to be allowed and considered safe.

2. Specify whether we should disable Application Security, DDoS, and Bot Defense detection for the trusted IP addresses.

> **Note**: If you leave the trusted IP address list empty, we'll treat all traffic as untrusted.

### Virtual Server
A virtual server is like a traffic cop that manages the flow of application traffic. It's represented by a virtual IP address, like `165.160.15.20`. When clients send traffic to a virtual server, we listen for that traffic, process the associated configuration, and direct the traffic according to the policy result and settings.

To assign your security policy to a virtual server:

1. Select the "Assign Policy to Virtual Server(s)" checkbox to create a new server or use an existing one (created by Traffic Management User Interface (TMUI) with Access profiles).

2. Enter the IP address in IPv4 (e.g., `165.160.15.20`) or IPv6 format (e.g., `2001:ed8:77b5:2:10:10:100:42`).

3. Select the service port (recommended: 443/HTTPS for security reasons).

4. Enable and specify the redirect port if you want to redirect traffic from one port to the service port (e.g., redirect from HTTP to HTTPS by setting the redirect port to 80 and service port to 443).

5. Specify the security logging profile to assign to the virtual server.

6. Configure the client SSL profile for managing client-side SSL traffic (create a new one or use an existing profile).

7. Configure the server SSL profile for authenticating servers (create a new one or use an existing profile).


# OWASP Top 10

This part of this blog emphasizes on how can we use BigIP to secure our webapp from OWASP Top 10 vulmnarabilities.
## 1. Broken Access Control

Access control enforces policy such that users cannot act outside of their intended permissions. Failure of access control typically leads to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits.

**Security policy mitigates the risk by attack signatures of the following types:**

- Authentication/Authorization Attacks
- Path Traversal
- Predictable Resource Location

**The following additional measures may be configured to improve risk mitigation:**

- Disallowed File types
- Disallowed URLs
- Login Enforcement

## 2. Cryptographic Failures

Many web applications and APIs do not properly protect sensitive data, such as financial, healthcare, and PII. Attackers may steal or modify such weakly protected data to conduct credit card fraud, identity theft, or other crimes. Sensitive data may be compromised without extra protection, such as encryption at rest or in transit, and requires special precautions when exchanged with the browser.

**Security policy mitigates the risk by attack signatures of the following types:**

- Predictable Resource Location
- Information Leakage

**The following additional measures may be configured to improve risk mitigation:**

- Data Guard
- Masked parameters

## 3. Injection

Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization. XSS flaws occur whenever an application includes untrusted data in a new web page without proper validation or escaping, or updates an existing web page with user-supplied data using a browser API that can create HTML or JavaScript. XSS allows attackers to execute scripts in the victim's browser which can hijack user sessions, deface web sites, or redirect the user to malicious sites.

**Security policy mitigates the risk by attack signatures of the following types:**

- Buffer Overflow
- Command Execution
- Cross Site Scripting (XSS)
- Denial of Service
- LDAP Injection
- Path Traversal
- Remote File Include
- SOL-Injection
- Server Side Code Injection
- Vulnerability Scan
- XPath Injection

**Security policy mitigates the risk by Cross Site Scripting (XSS) attack signatures. The following additional measures may be configured to improve risk mitigation:**

- Disallowed meta characters in parameters
- HttpOnly cookie attribute enforcement
- Parameter type validation definitions

## 4. Insecure Design

Insecure design represents different weaknesses, expressed as "missing or ineffective control design". Secure design is a culture and methodology that constantly evaluates threats and ensures that code is robustly designed and tested to prevent known attack methods. Threat modeling should be integrated into refinement sessions or similar activities.

**Security policy mitigates the risk by attack signatures of the following types:**

- Predictable Resource Location
- Information Leakage

## 5. Security Misconfiguration

Security misconfiguration is the most commonly seen issue. This is commonly a result of insecure default configurations, incomplete or ad hoc configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages containing sensitive information. Not only must all operating systems, frameworks, libraries, and applications be securely configured, but they must be patched and upgraded in a timely fashion.

**Security policy mitigates the risk by the following attack signatures:**

- External entity injection attempt
- XML External Entity (XXE) injection attempt (Content)
- Information Leakage
- Vulnerability Scanners

**The following additional measures may be configured to improve risk mitigation:**

- Disallow DTDs in XML content profile.
- Server Technologies
- Allowed Methods
- SameSite Cookie Attribute Enforcement
- CORS enabled in URLs
- Clickjacking protection

## 6. Vulnerable and Outdated Components

Components, such as libraries, frameworks, and other software modules, run with the same privileges as the application. If a vulnerable component is exploited, such an attack can facilitate serious data loss or server takeover. Applications and APIs using components with known vulnerabilities may undermine application defenses and enable various attacks and impacts.

**Security policy mitigates the risk by attack signatures according to server technology. The following additional measures may be configured to improve risk mitigation:**

- Server Technologies
- Vulnerability scanner integration

## 7. Identification and Authentication Failures

Application functions related to authentication and session management are often implemented incorrectly, allowing attackers to compromise passwords, keys, or session tokens, or to exploit other implementation flaws to assume other user's identities temporarily or permanently.

**Security policy mitigates the risk by the following measures:**

- Attack signatures for Authentication/Authorization Attacks

**The following additional measures may be configured to improve risk mitigation:**

- ASM cookie tampering protection
- Brute Force protection
- Credentials Stuffing protection
- Login Enforcement
- Session hijacking protection

## 8. Software and Data Integrity Failures

Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations. For example, an application relies upon plugins, libraries, or modules from untrusted sources, repositories, and content delivery networks (CDNs). An insecure CI/CD pipeline can introduce the potential for unauthorized access, malicious code, or system compromise. Lastly, many applications now include auto-update functionality, where updates are downloaded without sufficient integrity verification and applied to the previously trusted application. Attackers could potentially upload their own updates to be distributed and run on all installations. Another example is where objects or data are encoded or serialized into a structure that an attacker can see and modify is vulnerable to insecure deserialization.

**Security policy mitigates the risk by attack signatures of the following types:**

- Buffer Overflow
- Command Execution
- Denial of Service
- Server Side Code Injection

**The following additional measures may be configured to improve risk mitigation:**

- Enforced Cookies

## 9. Security Logging and Monitoring Failures

Security logging and monitoring failures coupled with missing or ineffective integration with incident response, allow attackers to further attack systems, maintain persistence, pivot to more systems, and tamper, extract, or destroy data. Most breach studies show time to detect a breach is over 200 days, typically detected by external parties rather than internal processes or monitoring.

**The following additional measures may be configured to improve risk mitigation:**

- Log illegal requests
- Remote logging

## 10. Server-Side Request Forgery (SSRF)

SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall, VPN, or another type of network Access Control List (ACL).

**Security policy mitigates the risk by attack signatures of the following types:**

- Signatures with name including "SSRF" string

**The following additional measures may be configured to improve risk mitigation:**

- SSRF Host Names
- Parameters with type URI or auto-detect

This new section covers the OWASP Top 10 Web Application Security Risks and how BIG-IP's security policy and additional measures can mitigate each risk. It should fit nicely with the previous content and provide a comprehensive overview of web application security and protection measures.

> If you are unsure about OWASP Top 10 or want to learn more you can click on the button below to goto OWASP Top 10 Cheatsheet.


