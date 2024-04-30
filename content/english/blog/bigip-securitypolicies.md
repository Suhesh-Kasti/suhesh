---
title: "BigIP: Security Policies"
meta_title: "BigIp: Confuguring security policies for better security"
description: "This comprehensive blog post provides a detailed breakdown of configuring security policies in BIG-IP ASM, covering essential elements such as policy types, enforcement modes, learning modes, and signature accuracy settings, offering practical examples and explanations for each component."
date: 2024-04-29T20:53:06+05:45
image: "/images/blog/bigip/securityPolicyScreen.png"
categories: ["Cybersecurity"]
author: "Suhesh Kasti"
tags: ["Webapp Firewall", "Web App Security", "F5 - BigIP"]
buttons:
  - label: "Goto F5's documentation"
    url: "https://my.f5.com/manage/s/article/K15530590"
quiz:
  code: big201
wordfill:
  code: big201
---
{{< toc >}}

This screen displays various configuration settings for creating a security policy in F5's BIG-IP application delivery controller. Let's break down each topic and its options:


### 1. **Policy Name**
   - This field allows us to enter a name for the security policy we're creating.

### 2. **Description**
   - This optional field allows us to provide a brief description or notes about the policy.

### 3. **Policy Type:**
   - In our context, the "Security" option is selected, indicating that this policy will be a standalone security policy for inspecting and filtering traffic based on security rules and signatures. The "Parent" option would be used if we wanted to create a parent policy first, and then create child policies inheriting settings from the parent.

   - The "Policy Type" field has two options: "Security" and "Parent". Here's an explanation of what each option does, along with examples:

##### a. **Security:**
- The "Security" option is used to create a security policy that inspects and filters network traffic based on predefined security rules and signatures. This type of policy is designed to protect against various threats such as SQL injection, cross-site scripting (XSS), buffer overflows, and other types of attacks.

- *Example:* Let's say we're setting up a web application on the BIG-IP system. We would create a security policy with the "Security" type to inspect the incoming and outgoing traffic for potential threats. This policy would have rules and signatures that detect and block malicious payloads, prevent data leakage, and enforce security best practices.

##### b. **Parent:**
- The "Parent" option is used to create a parent policy, which serves as a container or template for other child policies. A parent policy doesn't have any specific security rules or configurations of its own. Instead, it acts as a centralized location to manage and inherit settings for child policies.

- *Example:* Imagine we have multiple web applications running on different virtual servers, but we want to enforce a consistent set of security rules across all of them. We could create a parent policy with common security settings, and then create child policies for each virtual server that inherit those settings from the parent. This way, any changes made to the parent policy will automatically propagate to all child policies, ensuring a consistent security posture across our applications.

### 4. **Policy Templates**
##### a. **Rapid Deployment Policy (RDP)**

| Option                        | Value                        | Explanation                                                                                                                                                                  |
| ----------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application Language          | UTF-8                        | UTF-8 is a character encoding standard that supports most of the world's languages. It is used to ensure proper handling of non-ASCII characters in the application traffic. |
| Learning mode                 | Manual                       | In manual mode, the system does not automatically learn and add new security signatures. All signatures must be manually configured.                                         |
| Enforcement mode              | Transparent                  | In transparent mode, the policy monitors and logs violations but does not actively block or modify the traffic. This mode is suitable for initial deployment and testing.    |
| Signature Sets                | Generic Detection Signatures | The policy uses a set of generic signatures provided by F5 to detect common security threats.                                                                                |
| Signature Staging             | Enabled                      | New signatures are staged (tested) before being enforced in production. This helps prevent false positives.                                                                  |
| Learn New Cookies             | Selective                    | The system learns and tracks only specified cookies, not all cookies encountered.                                                                                            |
| Learn New File Types          | Never (whitelist only)       | The system does not learn or track new file types. Only whitelisted file types are allowed.                                                                                  |
| Learn Host Names              | Disabled                     | The system does not learn or track host names.                                                                                                                               |
| Learn New Parameters          | Never (whitelist only)       | The system does not learn or track new parameters. Only whitelisted parameters are allowed.                                                                                  |
| Learn New Redirection Domains | Never (whitelist only)       | The system does not learn or track new redirection domains. Only whitelisted domains are allowed.                                                                            |
| Server Technology Detection   | Disabled                     | The system does not attempt to detect the server technology (e.g., Apache, IIS) used by the application.                                                                     |
| Detect Login Pages            | Disabled                     | The system does not attempt to detect and learn login pages.                                                                                                                 |
| Learn New HTTP URLs           | Never (whitelist only)       | The system does not learn or track new HTTP URLs. Only whitelisted URLs are allowed.                                                                                         |
| Learn New WebSocket URLs      | Never (whitelist only)       | The system does not learn or track new WebSocket URLs. Only whitelisted WebSocket URLs are allowed.                                                                          |

##### b. **Passive Deployment Policy (PDP)**

| Option | Value | Explanation |
| --- | --- | --- |
| Application Language | Auto-detect | The system automatically detects the application language (character encoding) based on the traffic. |
| Learning mode | Automatic | The system automatically learns and adds new security signatures based on the traffic it sees. |
| Enforcement mode | Transparent | In transparent mode, the policy monitors and logs violations but does not actively block or modify the traffic. |
| Signature Sets | Generic Detection Signatures | The policy uses a set of generic signatures provided by F5 to detect common security threats. |
| Signature Staging | Enabled | New signatures are staged (tested) before being enforced in production. |
| Learn New Cookies | Selective | The system learns and tracks only specified cookies, not all cookies encountered. |
| Learn New File Types | Compact | The system learns and tracks common file types but excludes uncommon or potentially malicious file types. |
| Learn Host Names | Enabled | The system learns and tracks host names encountered in the traffic. |
| Learn New Parameters | Compact | The system learns and tracks common parameters but excludes uncommon or potentially malicious parameters. |
| Learn New Redirection Domains | Always | The system learns and tracks all new redirection domains encountered in the traffic. |
| Server Technology Detection | Enabled | The system attempts to detect the server technology (e.g., Apache, IIS) used by the application. |
| Detect Login Pages | Disabled | The system does not attempt to detect and learn login pages. |
| Learn New HTTP URLs | Compact | The system learns and tracks common HTTP URLs but excludes uncommon or potentially malicious URLs. |
| Learn New WebSocket URLs | Always | The system learns and tracks all new WebSocket URLs encountered in the traffic. |

##### c. **Fundamental** <br>
The "Fundamental" template is selected in our context, which is a basic security policy template provided by F5.

| Option | Value | Explanation |
| --- | --- | --- |
| Application Language | Auto-detect | The system automatically detects the application language (character encoding) based on the traffic. |
| Learning mode | Automatic | The system automatically learns and adds new security signatures based on the traffic it sees. |
| Enforcement mode | Blocking | In blocking mode, the policy actively blocks or modifies traffic deemed a threat based on the security rules and signatures. |
| Signature Sets | Generic Detection Signatures | The policy uses a set of generic signatures provided by F5 to detect common security threats. |
| Signature Staging | Enabled | New signatures are staged (tested) before being enforced in production. |
| Learn New Cookies | Selective | The system learns and tracks only specified cookies, not all cookies encountered. |
| Learn New File Types | Compact | The system learns and tracks common file types but excludes uncommon or potentially malicious file types. |
| Learn Host Names | Enabled | The system learns and tracks host names encountered in the traffic. |
| Learn New Parameters | Selective | The system learns and tracks only specified parameters, not all parameters encountered. |
| Learn New Redirection Domains | Always | The system learns and tracks all new redirection domains encountered in the traffic. |
| Server Technology Detection | Enabled | The system attempts to detect the server technology (e.g., Apache, IIS) used by the application. |
| Detect Login Pages | Disabled | The system does not attempt to detect and learn login pages. |
| Learn New HTTP URLs | Never (whitelist only) | The system does not learn or track new HTTP URLs. Only whitelisted URLs are allowed. |
| Learn New WebSocket URLs | Never (whitelist only) | The system does not learn or track new WebSocket URLs. Only whitelisted WebSocket URLs are allowed. |

##### d. **Comprehensive**

| Option | Value | Explanation |
| --- | --- | --- |
| Application Language | Auto-detect | The system automatically detects the application language (character encoding) based on the traffic. |
| Learning mode | Automatic | The system automatically learns and adds new security signatures based on the traffic it sees. |
| Enforcement mode | Blocking | In blocking mode, the policy actively blocks or modifies traffic deemed a threat based on the security rules and signatures. |
| Signature Sets | Generic Detection Signatures | The policy uses a set of generic signatures provided by F5 to detect common security threats. |
| Signature Staging | Enabled | New signatures are staged (tested) before being enforced in production. |
| Learn New Cookies | Selective | The system learns and tracks only specified cookies, not all cookies encountered. |
| Learn New File Types | Compact | The system learns and tracks common file types but excludes uncommon or potentially malicious file types. |
| Learn Host Names | Enabled | The system learns and tracks host names encountered in the traffic. |
| Learn New Parameters | Compact | The system learns and tracks common parameters but excludes uncommon or potentially malicious parameters. |
| Learn New Redirection Domains | Always | The system learns and tracks all new redirection domains encountered in the traffic. |
| Server Technology Detection | Enabled | The system attempts to detect the server technology (e.g., Apache, IIS) used by the application. |
| Detect Login Pages | Enabled | The system attempts to detect and learn login pages. |
| Learn New HTTP URLs | Compact | The system learns and tracks common HTTP URLs but excludes uncommon or potentially malicious URLs. |
| Learn New WebSocket URLs | Always | The system learns and tracks all new WebSocket URLs encountered in the traffic. |

##### e. **API Security**

| Option               | Value                        | Explanation                                                                                                                                                                  |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application Language | UTF-8                        | UTF-8 is a character encoding standard that supports most of the world's languages. It is used to ensure proper handling of non-ASCII characters in the application traffic. |
| Learning mode        | Manual                       | In manual mode, the system does not automatically learn and add new security signatures. All signatures must be manually configured.                                         |
| Enforcement mode     | Blocking                     | In blocking mode, the policy actively blocks or modifies traffic deemed a threat based on the security rules and signatures.                                                 |
| Signature Sets       | Generic Detection Signatures | The policy uses a set of generic signatures provided by F5 to detect common security threats.                                                                                |
| Signature Staging    | Enabled                      | New signatures are staged (tested) before being enforced in production.                                                                                                      |
| Learn New Cookies    | Never (whitelist only)       | The system does not learn or track new cookies. Only whitelisted cookies are allowed.                                                                                        |
| Learn New File Types | Never (whitelist only)       | The system does not learn or track new file types. Only whitelisted file types are allowed.                                                                                  |
| Learn Host Names     | Disabled                     | The system does not learn or track host names.                                                                                                                               |
| Learn New Parameters | Never (whitelist only)       | The system does not learn or track new parameters                                                                                                                            |
### 5. **Virtual Server**
   - This option allows us to associate the policy with a specific virtual server on the BIG-IP system. In this case, "None" is selected, meaning the policy is not yet associated with any virtual server.

### 6. **Application Language**
   - The "Unicode (utf-8)" option is selected, which specifies the character encoding for the application traffic that the policy will handle.

### 7. **Enforcement Mode**
   - This setting determines how the policy will handle traffic. The "Blocking" option is selected, which means that the policy will actively block traffic deemed a threat based on the policy rules.
   
##### a. **Transparent**
In transparent mode, the security policy monitors and logs violations but does not actively block or modify the traffic. This mode is typically used for initial deployment, testing, and fine-tuning the policy. It allows us to assess the policy's effectiveness and identify potential false positives before enforcing it in blocking mode.
      
##### b. **Blocking**
In blocking mode, the security policy actively blocks or modifies traffic deemed a threat based on the configured security rules and signatures. This mode provides a more robust security posture by preventing potential attacks from reaching the application. However, it can also cause legitimate traffic to be blocked if the policy is not properly configured or tuned.

### 8. **Policy Building Learning Mode**
   - Specifies how the system learns and adapts during the policy building process.

##### a. **Automatic**
The system automatically learns and adds new security signatures based on the traffic it sees. This mode is suitable for environments where the application's behavior is well-understood, and the system can reliably identify and add relevant signatures.
      
##### b. **Fully Automatic**
This is an advanced mode of automatic learning. In fully automatic mode, the system not only learns and adds new signatures but also enforces them without manual intervention. This mode is typically used in highly dynamic environments where the application's behavior changes frequently, and manual intervention for signature updates is not feasible.
      
##### c. **Manual** 
In manual mode, the system does not automatically learn or add new signatures. All signatures must be manually configured and updated by the administrator. This mode is suitable for environments where the application's behavior is well-defined and tightly controlled, and the administrator prefers complete control over the security policy.
      
##### d. **Disabled**
In this mode, the system does not perform any automatic learning or signature updates. This mode is typically used for testing or troubleshooting purposes when we want to isolate the security policy from any automatic changes.

### 9. **Auto-Added Signature Accuracy**
   - This setting controls the level of accuracy required for automatically added signatures. "Medium" is selected, which includes signatures with high and medium accuracy levels.
   
##### a. **High**
Only signatures with a high accuracy level (low likelihood of false positives) will be automatically added.
      
##### b. **Medium (also includes signatures with high accuracy)** 
Signatures with both high and medium accuracy levels will be automatically added.
      
##### c. **Low (also includes signatures with high and medium accuracy)**
Signatures with high, medium, and low accuracy levels will be automatically added.

   - By setting a higher accuracy level, we can reduce the risk of false positives but may miss some legitimate threats. By setting a lower accuracy level, we increase the likelihood of catching more threats but also increase the risk of false positives.

### 10. **Trusted IP Addresses**
   - This field allows us to specify IP addresses that should be trusted and not inspected by the security policy.

### 11. **Policy Builder Learning Speed**
- Specifies the speed at which the system learns and adds new signatures when the learning mode is set to automatic or fully automatic.
   
##### a. **Fast** 
The system learns and adds new signatures quickly, but this may consume more system resources and increase the risk of false positives.
      
##### b. **Medium**
The system learns and adds new signatures at a moderate pace, balancing learning speed with resource usage and accuracy.
      
##### c. **Slow**
The system learns and adds new signatures slowly, which may reduce the risk of false positives but also delay the addition of legitimate signatures.

### 12. **Signature Staging**
- Controls the deployment of newly added signatures.
   
##### a. **Enabled**
When signature staging is enabled, newly added signatures (either manually or automatically) are first staged (tested) in a non-enforcing mode. This allows us to assess the impact of the new signatures and identify potential false positives before enforcing them in production. Signature staging helps prevent legitimate traffic from being blocked due to misconfigured signatures.
      
##### b. **Disabled**
When signature staging is disabled, newly added signatures are immediately enforced in the production environment without any staging or testing period. This mode is typically used in environments where the security policy is well-tuned, and the risk of false positives is low.

- Signature staging is generally recommended as a best practice to ensure a smooth and controlled deployment of new security signatures, minimizing the risk of unintended traffic disruptions.
