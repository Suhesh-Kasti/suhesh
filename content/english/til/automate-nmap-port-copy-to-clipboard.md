---
title: "Automating Nmap Port Extraction for Faster Scanning"
date: 2026-03-10T10:00:00+05:45
description: "Using a custom ZSH function to bridge the gap between Nmap discovery scans and service enumeration by automatically copying open ports to the clipboard."
image: "/images/til/nmap-automation.png"
til_categories: ["Cybersecurity", "Workflow"]
til_tags: ["nmap", "zsh", "automation", "pentesting"]
draft: false
---

Today I learned I can solve the annoying manual process of copying port numbers from an Nmap discovery scan into the next command for service enumeration. 

By utilizing Nmap's Grepable output format and a custom ZSH function, I can now run a full-port scan and have a comma-separated list of only open ports ready in my clipboard the second the scan finishes.

## The Process Explained

### Step 1: Machine-Readable Output
Nmap's standard terminal output is for humans. By using the `-oG` flag, Nmap generates a single-line-per-host format that is easy to parse with regex. And the best part it doesn't even hamper the human readable nmap report we get in terminal. The magic happens in background entirely.

### Step 2: Regex Extraction
Using Perl-Compatible Regular Expressions (PCRE), we look for any digits that are followed by the string '/open'. This ignores closed or filtered ports entirely.

### Step 3: Clipboard Integration
The extracted ports are sorted, duplicates are removed, and they are joined with commas. This string is then piped to `wl-copy` (for Wayland) or `xclip` (for X11).

## My Implementation
I added this function to my ~/.zshrc. It uses a temporary file in /tmp to allow sudo nmap to write its findings without interfering with the terminal display.

```zsh
nscan() {
    if [[ -z "$1" ]]; then
        echo "Usage: nscan <IP> [nmap_flags]"
        return 1
    fi

    local target="$1"
    shift 
    local tmpfile="/tmp/nmap_grep_output.gnmap"

    # Run Nmap normally - User sees the standard output
    # Grepable output is sent to the tmpfile
    sudo nmap "$target" "$@" -oG "$tmpfile"

    # Extract open ports and copy to clipboard
    if [[ -f "$tmpfile" ]]; then
        local ports=$(sudo grep -oP '\d+(?=/open)' "$tmpfile" | sort -u -n | paste -sd "," - | tr -d '\n')
        
        if [[ -n "$ports" ]]; then
            echo "$ports" | wl-copy
            echo "Ports [$ports] copied to clipboard"
        fi
        
        sudo rm "$tmpfile"
    fi
}
````

Example Run:
```bash
nscan 10.129.2.49 -p- --min-rate 5000
``` 

Output:
```
[sudo] password for user: 
(Nmap output displays normally...) 
Nmap done: 1 IP address (1 host up) scanned in 15.42 seconds 
Ports [22,80,110,139,143,445,31337] copied to clipboard
```

Now, I can immediately type 'sudo nmap -p ' and hit Paste.