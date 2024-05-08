---
title: OWASP Top 10
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/owasp.png"
description: The OWASP Top 10 is a standard awareness document for developers and web application security teams. It represents a broad consensus about the most critical security risks to web applications.
quiz:
  code: owasp101
wordfill:
  code: owasp101
---

{{< toc >}}

#### 1. Broken Access Control

{{< accordion "Horizontal Priv-esc" >}}
Access control enforces policy such that users cannot act outside of their intended permissions. Failure of access control typically leads to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits.

```php
// Insecure code allowing horizontal privilege escalation
$user_id = $_GET['user_id'];
$query = "SELECT * FROM users WHERE id = $user_id";
$result = $conn->query($query);
```
{{< /accordion >}}

#### 2. Cryptographic Failures

{{< accordion "Not so secure excryption" >}}
Many web applications and APIs do not properly protect sensitive data, such as financial, healthcare, and PII. Attackers may steal or modify such weakly protected data to conduct credit card fraud, identity theft, or other crimes. Sensitive data may be compromised without extra protection, such as encryption at rest or in transit, and requires special precautions when exchanged with the browser.

```java
// Insecure code using ECB mode for encryption
Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
cipher.init(Cipher.ENCRYPT_MODE, secretKey);
byte[] cipherText = cipher.doFinal(plainText);
```
{{< /accordion >}}

#### 3. Injection

{{< accordion "Injecting code to run scripts" >}}
Injection flaws, such as SQL, NoSQL, OS, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization. XSS flaws occur whenever an application includes untrusted data in a new web page without proper validation or escaping, or updates an existing web page with user-supplied data using a browser API that can create HTML or JavaScript. XSS allows attackers to execute scripts in the victim's browser which can hijack user sessions, deface web sites, or redirect the user to malicious sites.

```python
# Insecure code vulnerable to SQL injection
user_input = request.args.get('user_input')
query = f"SELECT * FROM users WHERE name = '{user_input}'"
result = db.execute(query)
```
{{< /accordion >}}

#### 4. Insecure Design

{{< accordion "Description" >}}
Insecure design represents different weaknesses, expressed as "missing or ineffective control design". Secure design is a culture and methodology that constantly evaluates threats and ensures that code is robustly designed and tested to prevent known attack methods. Threat modeling should be integrated into refinement sessions or similar activities.
{{< /accordion >}}

#### 5. Security Misconfiguration

{{< accordion "Misconfigured entity" >}}
Security misconfiguration is the most commonly seen issue. This is commonly a result of insecure default configurations, incomplete or ad hoc configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages containing sensitive information. Not only must all operating systems, frameworks, libraries, and applications be securely configured, but they must be patched and upgraded in a timely fashion.

```xml
<!-- Insecure configuration allowing XXE attacks -->
<?xml version="1.0"?>
<!DOCTYPE root [
<!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<root>&xxe;</root>
```
{{< /accordion >}}

#### 6. Vulnerable and Outdated Components

{{< accordion "Description" >}}
Components, such as libraries, frameworks, and other software modules, run with the same privileges as the application. If a vulnerable component is exploited, such an attack can facilitate serious data loss or server takeover. Applications and APIs using components with known vulnerabilities may undermine application defenses and enable various attacks and impacts.
{{< /accordion >}}

#### 7. Identification and Authentication Failures

{{< accordion "Session hijacking" >}}
Application functions related to authentication and session management are often implemented incorrectly, allowing attackers to compromise passwords, keys, or session tokens, or to exploit other implementation flaws to assume other user's identities temporarily or permanently.

```javascript
// Insecure code vulnerable to session fixation
function createSession() {
  const sessionId = req.cookies.sessionId || uuid.v4();
  res.cookie('sessionId', sessionId);
  sessions[sessionId] = { /* session data */ };
}
```
{{< /accordion >}}

#### 8. Software and Data Integrity Failures

{{< accordion "Description" >}}
Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations. For example, an application relies upon plugins, libraries, or modules from untrusted sources, repositories, and content delivery networks (CDNs). An insecure CI/CD pipeline can introduce the potential for unauthorized access, malicious code, or system compromise. Lastly, many applications now include auto-update functionality, where updates are downloaded without sufficient integrity verification and applied to the previously trusted application. Attackers could potentially upload their own updates to be distributed and run on all installations. Another example is where objects or data are encoded or serialized into a structure that an attacker can see and modify is vulnerable to insecure deserialization.
{{< /accordion >}}

#### 9. Security Logging and Monitoring Failures

{{< accordion "Description" >}}
Security logging and monitoring failures coupled with missing or ineffective integration with incident response, allow attackers to further attack systems, maintain persistence, pivot to more systems, and tamper, extract, or destroy data. Most breach studies show time to detect a breach is over 200 days, typically detected by external parties rather than internal processes or monitoring.
{{< /accordion >}}

#### 10. Server-Side Request Forgery (SSRF)

{{< accordion "Insecure backend" >}}
SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall, VPN, or another type of network Access Control List (ACL).

```ruby
# Insecure code vulnerable to SSRF
url = params[:url]
response = Net::HTTP.get_response(URI(url))
```
{{< /accordion >}}

