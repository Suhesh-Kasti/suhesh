---
title: Exploring Nmap
meta_title: "Nmap"
description: "Nmap - The network scanner"
date: 2023-09-28T20:53:06+05:45
image: "/images/blog/nmap/nmapscan.png"
categories: ["Cybersecurity"]
author: "Suhesh Kasti"
tags: ["Nmap", "Port Scanning", "Penetration Testing"]
buttons:
  - label: "Goto Burpsuite Cheatsheet"
    url: "/cheatsheets/burpsuite/"
quiz:
  code: nmap101
wordfill:
  code: nmap101
---
{{< toc >}}

Nmap (Network Mapper) is a powerful and widely-used open-source network scanning and security auditing tool designed to discover devices, services, open ports, and potential vulnerabilities on computer networks. 

Every hacking starts with enumeration and reconnaissance phase. Enumeration is a crucial step in the information-gathering process when assessing the security of a network or system. During this phase, the goal is to gather as much information as possible about the target network or system to identify potential vulnerabilities and weaknesses. 


# Installing Nmap   

## Windows

Windows users can download the official Nmap installer from the [Nmap's website](https://nmap.org/download.html) and follow the installation wizard. Make sure to add Nmap to your system's PATH for convenient command-line access.

Nmap can also be installed in windows using winget. Open powershell and type the following the following command:
``` ps1
winget install -e --id Insecure.Nmap
```

## Linux

On Linux, the installation process is as straightforward as it can get. Just open the terminal and use the package manager according to the distribution:

#### For Debian/Ubuntu:

```bash
sudo apt install nmap
```

#### For Red Hat/CentOS/Fedora:

```bash
sudo dnf install nmap
```

#### For Arch:

```bash
sudo pacman -S nmap
```

## macOS

macOS users can use the Homebrew package manager for a hassle-free installation:
```bash
brew install nmap
```

## Alternatives for Android and iOS

While Nmap is primarily designed for desktop and server environments, if an android or iOS is all that you've got don't worry I got you. Here are some alternatives you can use:

#### Android:

1. **[Fing Network Tools:](https://play.google.com/store/apps/details?id=com.overlook.android.fing&pli=1)** Fing is a nice and user-friendly app that can help you discover devices on your network, check their connectivity, and perform basic network enumeration.
2. **[Termux:](https://f-droid.org/en/packages/com.termux/)** Advanced users can install Termux, a terminal emulator for Android, and then install Nmap within it to use Nmap. Termux is basically linux at your fingertips. In termux to download nmap you can use the command:

```bash
pkg install nmap
```

#### iOS:

1. **[iNetTools:](https://apps.apple.com/au/app/inettools-ping-dns-port-scan/id561659975)** iNetTools offers a set of network diagnostic tools, including ping, traceroute, and port scanning, for iOS users.
2. **[Termius:](https://apps.apple.com/us/app/termius-terminal-ssh-client/id549039908)** Similar to Termux on Android, you can use the Termius app on iOS to run Nmap commands within a terminal environment. This is what google search said as I haven't used iOS yet.

<hr>

# Let's start using Nmap

Nmap requires some stuff before starting to scan a network. Those things include:
1. IP address and subnet
2. Port number 
3. Scan Type
4. Timings
5. Output Type
## Host Discovery
First and foremost Nmap utilizes host discovery to make sure the host is alive and running. Scans require a lot of time to be performed. When there are a lot of IPs to be scanned it makes more sense to not scan the devices that are not active to save time. -Sn flag is used for host discovery and it can be disabled using the -Pn flag. Nmap performs host discovery by default even when -Sn is not explicitly mentioned.

`nmap -Sn 192.168.10.2`

`nmap -Pn 192.168.10.2`

We skip the host discovery phase if we know that our target is up. This command will make the Nmap scan the network without host discovery.

#### When we perform scan as *root*
- Nmap sends an ICMP echo packet
- Nmap sends a TCP SYN packet on port 443
- Nmap sends a TCP ACK packet on port 80
- Nmap sends ICMP timestamp request
#### When we perform scan as *local user*
- Nmap sends a TCP SYN packet on port 443
- Nmap sends a TCP ACK packet on port 80

If Nmap receives response from any of these, it will confirm that the host is active and begins port scanning.

Nmap utilizes the TCP handshake to check if the port is active or not. 
- If the target is active then it replies to Nmap's SYN packet with a SYN+ACK packet which will tell the Nmap that the target is up.

![Port status](/images/blog/nmap/targetup.png)

- If the target is down then it replies to Nmap's SYN packet with a RST/ACK packet which will tell the Nmap that the target is down.


![Target Down](/images/blog/nmap/targetdown.png)



