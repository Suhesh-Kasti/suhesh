---
title: "BigIP: How Logs Work?"
meta_title: "BigIp: Understanding the functioning of Logs"
description: "This comprehensive blog post provides a detailed breakdown of configuring security policies in BIG-IP ASM, covering essential elements such as policy types, enforcement modes, learning modes, and signature accuracy settings, offering practical examples and explanations for each component."
date: 2024-05-15T20:53:06+05:45
image: "/images/blog/bigip/eventLog.png"
categories: ["Cybersecurity"]
author: "Suhesh Kasti"
tags: ["Webapp Firewall", "Web Application Security", "F5 - BigIP"]
buttons:
  - label: "Goto F5's documentation"
    url: "https://my.f5.com/manage/s/article/K15530590"
---

# Violation Categories

| Positive Security | Negative Security |
| --- | --- |
| File types, URLs, parameters | Attack Signatures |
| Headers | HTTP protocol compliance failed |
| Cookies | Evasion technique detected |
### Additional security checks

| Security Check | Explanation |
| --- | --- |
| Session Awareness | Maintaining stateful session information across multiple requests |
| Web Services Security | Ensuring the security of web services APIs |
| Brute force protection | Preventing unauthorized access attempts through repeated guessing |
| Web scraping | Detecting and preventing automated scraping of web content |
| Data Guard (information leakage) | Protecting sensitive data from being exposed |
| Geolocation enforcement | Restricting access based on geographical location |
| Bot detection | Identifying and mitigating automated bot traffic |
| Login page enforcement | Ensuring security measures are applied on login pages |
# How violations are categorized

### Entities

| Entity Types with attributes | Explanation | Example |
| --- | --- | --- |
| File types | Specific file types that are checked for security compliance | Allowed: .html, .exe <br> Not allowed: .php, .ini |
| URLs | URLs that are validated for compliance | Checking if a URL contains forbidden patterns |
| Parameters | URL parameters that are scrutinized | `id`, `token` in query strings |
| Cookies | Cookies that are assessed | Validating cookie structure and content |
| Headers | HTTP headers that are analyzed | Checking for specific headers like `User-Agent` |
| Content profiles | Profiles used to validate web content | Ensuring that the content follows a predefined structure |
| Redirection domains | Domains that are verified for redirection | Ensuring that redirects are only to allowed domains |

- **Entities have at least one configurable attribute** (such as byte length).
- **Entities can have multiple occurrences.**
- **New instances may be learnable** (suitable for addition to the security policy).

### Items

| Violation Items      | Explanation                                      | Example                                          |
| -------------------- | ------------------------------------------------ | ------------------------------------------------ |
| HTTP protocol checks | Ensures that HTTP protocol is followed correctly | Validating HTTP request structure                |
| Evasion techniques   | Detects techniques used to bypass security       | Obfuscation of payload to avoid detection        |
| Attack Signatures    | Identifies known patterns of attacks             | SQL injection patterns                           |
| Meta characters      | Checks for special characters used maliciously   | Characters like `<`, `>`, `%`                    |
| HTTP methods         | Validates HTTP methods used                      | Allowing only GET and POST methods               |
| Geolocations         | Checks the geographical origin of requests       | Blocking requests from certain regions           |
| Redirection domains  | Validates domains involved in redirection        | Ensuring redirections only go to trusted domains |

- Items can be:
  - Present and enabled
  - Present and disabled
  - Not present

## Rating Definitions
| Rating                                                 | Definition                                                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0**                                                  | Not rated = no violation. This rating indicates that there are no detected issues, and the request is deemed safe.                                                 |
| **1**                                                  | Most likely a false positive. This suggests that the request appears suspicious but is probably harmless.                                                          |
| **2**                                                  | Looks like a false positive; requires examination. This means that the request has characteristics of a false positive but needs closer inspection to confirm.     |
| **3**                                                  | Needs further examination. The request has some concerning features and should be reviewed in detail to determine its intent.                                      |
| **4**                                                  | Looks like a threat but requires examination. This rating indicates that the request is likely malicious, but a thorough investigation is necessary to be certain. |
| **5**                                                  | Request is most likely a threat. This suggests that the request is highly suspicious and should be treated as a probable threat. Immediate action may be required. |

## Violation Rating: Calculation criteria
The violation rating calculation criteria for the BIG-IP WAF involves assessing various factors to determine the severity of potential threats. 
1. **Signature Accuracy & Signature Severity**:
   - **Example**: If a request matches a known SQL injection attack signature, the severity rating increases based on the severity level assigned to that signature.

2. **User IP Address Location (WAN/LAN)**:
   - **Example**: Requests originating from a known malicious IP address (WAN) receive a higher violation rating compared to requests from a trusted internal network (LAN).

3. **Meta Character Violation**:
   - **Example**: If a request contains unusual characters commonly used in injection attacks, such as semicolons or quotation marks, it raises suspicion and increases the violation rating.

4. **Signature Violation — Numerous Hits**:
   - **Example**: Multiple requests matching the same attack signature within a short timeframe indicate a concerted attack, resulting in a higher violation rating.

5. **Signature Violation — Multiple Categories**:
   - **Example**: If a request triggers multiple different types of attack signatures (e.g., SQL injection and cross-site scripting), it indicates a sophisticated attack, warranting a higher violation rating.

6. **Server Response — Lower Rating when Error 500 Occurs without Other Violations**:
   - **Example**: If a server responds with an error 500 status code without any other indications of an attack, the violation rating may be lower as it could be due to server misconfiguration rather than an actual attack.

7. **Cookie Tampering — Higher Rating**:
   - **Example**: Modifying session cookies in a request to gain unauthorized access to a user's account would result in a higher violation rating.

8. **Evasion Techniques Found Alongside Attack Signatures — Higher Rating**:
   - **Example**: If an attacker attempts to obfuscate their attack payload to evade detection while triggering known attack signatures, it indicates a deliberate effort to bypass security measures, leading to a higher violation rating.

9. **IP Reputation — Higher Rating when Client on Suspicious IP**:
   - **Example**: Requests originating from IP addresses with a history of malicious activity or flagged by threat intelligence services receive a higher violation rating due to the increased likelihood of an attack.


## Request status

|                                                                                 Symbol                                                                                  | Meaning                                   |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ----------------------------------------- |
|                                           <i class="fa-regular fa-circle-check fa-bounce fa-xl" style="color: #11ff00;"></i>                                            | Valid request                             |
|                                             <i class="fa-solid fa-circle-minus fa-shake fa-xl" style="color: #ff0f0f;"></i>                                             | Blocked illegal request                   |
|                                          <i class="fa-solid fa-circle-exclamation fa-beat fa-xl" style="color: #ff1414;"></i>                                           | Flagged illegal request                   |
|                                                  <i class="fa-solid fa-ban fa-fade fa-xl" style="color: #ababab;"></i>                                                  | Un-blocked request                        |
| <i class="fa-regular fa-circle-check fa-bounce fa-xl" style="color: #11ff00;"></i> + <i class="fa-solid fa-bars-progress  fa-bounce fa-lg" style="color: #FFD43B;"></i> | Valid request (but triggered a violation) |

## Staging and Enforcing

| Signature Staging  | Enforcement Mode | Result                |
| ------------------ | ---------------- | --------------------- |
| Transparent        | Transparent      | No blocking (logging) |
| Transparent        | Enforced         | Blocking              |
| Enforced           | Transparent      | No blocking (logging) |
| Enforced           | Enforced         | Blocking              |

## Learn, Alarm and Block

| Mode  | Description                                    | Example                                                                                                                                                                                                                                         |
| ----- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Learn | Collects data on normal traffic patterns       | **Example:** During Learn Mode, the WAF observes that most user requests are GET requests with typical parameters and URL structures. It learns that certain IP addresses frequently access specific resources without any suspicious behavior. |
| Alarm | Generates alerts for detected threats          | **Example:** In Alarm Mode, the WAF detects an influx of POST requests with unusually long payloads, indicating a potential SQL injection attack. It generates alerts for administrators to investigate further without blocking the requests.  |
| Block | Actively blocks requests identified as threats | **Example:** In Block Mode, the WAF identifies a series of requests with known attack signatures attempting to exploit a vulnerability. It immediately blocks these requests to prevent any potential harm to the system or application.        |

## Enforcement readiness
**Enforcement Readiness Example:**

| Day | Activity                                                     | Action                                      | Result                                      |
|-----|--------------------------------------------------------------|---------------------------------------------|---------------------------------------------|
| 1   | Configure WAF Policies and Signatures                        | Define policies and enable attack signatures | Policies and signatures are set up.         |
| 2   | Monitor Traffic                                               | Monitor incoming traffic for patterns and anomalies | No attacks detected.                        |
| 3   | Analyze Logs                                                 | Review logs for any suspicious activity      | No attacks detected.                        |
| 4   | Analyze Logs                                                 | Continue reviewing logs for any patterns    | No attacks detected.                        |
| 5   | Signature Triggering                                         | Attack signature triggered                  | WAF suggests enforcement based on severity. |
| 6   | Review Suggested Enforcements                                | Admin reviews suggestions and decides whether to enforce or not | Admin enforces critical signatures.         |
| 7   | Continual Monitoring                                         | Monitor traffic for any new attacks         | No attacks detected.                        |
| 8   | Manual Enforcement                                           | Admin manually enforces any untriggered signatures | WAF now enforces all critical signatures.   |

> On the 5th day, an attack signature is triggered, indicating potential threats. The WAF suggests enforcement based on the severity of the signature. The admin reviews the suggestions and decides to enforce critical signatures.
>
> On the 8th day, the admin manually enforces any remaining untriggered signatures to ensure comprehensive protection.

**Managing Triggered Signatures:**

| Signature State   | Action                                   | Result                                       |
|-------------------|------------------------------------------|----------------------------------------------|
| Triggered         | Manual Enforcement                       | Signature is enforced.                       |
| Untriggered       | Manual Enforcement                       | Signature is enforced.                       |
| Triggered         | No Action                                | Signature remains triggered.                 |
| Untriggered       | No Action                                | Signature stays in learning suggestion.      |

> Triggered signatures are enforced either manually or automatically based on severity. Untriggered signatures remain in learning suggestions until enforced.

**Avoiding False Positives:**
- Regularly review and update WAF policies and signatures to align with evolving threats.
- Utilize whitelists for known benign entities to reduce false positives.
- Continuously monitor and adjust WAF configurations based on traffic patterns and attack trends.

# Learning Suggestions
  
