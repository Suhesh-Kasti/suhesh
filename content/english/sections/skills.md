---
enable: true
title: "My Skills & Expertise"
description: "Specialized knowledge and capabilities in various cybersecurity domains"

# Skills Categories
skill_categories:
  - name: "Cybersecurity"
    skills:
      - name: "Penetration Testing"
        icon: "fa fa-shield-alt"
        description: "Systematic testing of systems, networks and applications to identify security vulnerabilities that could be exploited by attackers."
        subtopics:
          - "Web Application Testing"
          - "Network Penetration"
          - "Mobile App Testing"
          - "API Security Testing"
      
      - name: "Linux Privilege Escalation"
        avatar: "/images/skills/linux.svg"
        description: "Techniques and methodologies to identify and exploit vulnerabilities that allow attackers to gain elevated access on Linux systems."
        subtopics:
          - "SUID/SGID Exploits"
          - "Sudo Misconfigurations"
          - "Kernel Exploits"
          - "Cron Job Abuse"
      
      - name: "Active Directory"
        icon: "fa fa-server"
        description: "Security assessment and exploitation of Microsoft's directory service for Windows domain networks."
        subtopics:
          - "Domain Privilege Escalation"
          - "Kerberos Attacks"
          - "LDAP Enumeration"
          - "Pass-the-Hash/Pass-the-Ticket"
      
      - name: "Cloud Security"
        icon: "fa fa-cloud"
        description: "Protection of cloud-based infrastructure, applications and data from threats, breaches and vulnerabilities."
        subtopics:
          - "AWS Security"
          - "Azure Security"
          - "Container Security"
          - "Serverless Security"
      
      - name: "Malware Analysis"
        icon: "fa fa-bug"
        description: "Studying malicious software's components, behavior and purpose to understand how to detect and defend against it."
        subtopics:
          - "Static Analysis"
          - "Dynamic Analysis"
          - "Reverse Engineering"
          - "Memory Forensics"
      
      - name: "Digital Forensics"
        icon: "fa fa-search"
        description: "Collection, preservation and analysis of digital evidence to investigate incidents and security breaches."
        subtopics:
          - "Disk Forensics"
          - "Memory Analysis"
          - "Network Forensics"
          - "Mobile Device Forensics"
  
  - name: "Programming & Development"
    skills:
      - name: "Python"
        avatar: "/images/skills/python.svg"
        description: "Versatile programming language used for scripting, automation, and developing security tools."
        subtopics:
          - "Security Automation"
          - "Tool Development"
          - "Data Analysis"
          - "Web Scraping"
      
      - name: "Bash Scripting"
        icon: "fa fa-terminal"
        description: "Command-line scripting for automating system administration tasks and security operations."
        subtopics:
          - "System Automation"
          - "Security Scripts"
          - "Log Analysis"
          - "Reconnaissance Tools"
      
      - name: "Web Development"
        icon: "fa fa-code"
        description: "Creating web applications with a focus on security best practices and secure coding principles."
        subtopics:
          - "Secure Coding"
          - "OWASP Top 10"
          - "Frontend Security"
          - "Backend Security"

  - name: "Tools & Technologies"
    skills:
      - name: "Burp Suite"
        avatar: "/images/skills/burp.svg"
        description: "Comprehensive web vulnerability scanner and proxy tool for security testing of web applications."
        subtopics:
          - "Proxy Interception"
          - "Vulnerability Scanning"
          - "Intruder Attacks"
          - "Extension Development"
      
      - name: "Wireshark"
        avatar: "/images/skills/wireshark.png"
        description: "Network protocol analyzer used to examine network traffic and troubleshoot security issues."
        subtopics:
          - "Traffic Analysis"
          - "Packet Inspection"
          - "Network Forensics"
          - "Protocol Analysis"
      
      - name: "Metasploit"
        icon: "fa fa-user-secret"
        description: "Framework for developing, testing, and executing exploits against remote targets."
        subtopics:
          - "Exploit Development"
          - "Post-Exploitation"
          - "Payload Generation"
          - "Auxiliary Modules"

# don't create a separate page
build:
  render: "never"
--- 