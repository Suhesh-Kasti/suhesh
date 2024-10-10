---
title: "My beginner setup and resources"
date: 2024-10-07T20:53:06+05:45
image: "images/portfolio/mysetup.webp"
project_categories: ["Setup", "Beginner"]
project_tags: ["resources", "beginner", "setup"]
description: "My beginner setup for learning cyber security along with links and resources to learn"
draft: false
---

My setup is fairly simple. I use a number of tools and plugins for testing. This page lists out all the tools I use with appropriate links. Here I will also include links from where as a beginner you can start in cyber.

## Hardware
Let's start from the hardware level. This is the setup that is recommended for smooth practice although you can easily get started with specs much lower than the ones shown below 

{{< tabs >}}
{{< tab "CPU" >}}
<div class="flex justify-between">
  <div class="w-1/2 pr-4">
    <h5 class="font-semibold">Laptop</h5>
    <ul class="list-disc pl-5">
      <li>i5 or Ryzen 5</li>
      <li>8th gen or newer</li>
      <li>4+ cores</li>
    </ul>
  </div>
  <div class="w-1/2 pl-4">
    <h5 class="font-semibold">Desktop</h5>
    <ul class="list-disc pl-5">
      <li>i7 or Ryzen 7</li>
      <li>3rd gen or newer</li>
      <li>8+ cores</li>
    </ul>
  </div>
</div>
{{< /tab >}}

{{< tab "RAM" >}}
<div class="flex justify-between">
  <div class="w-1/2 pr-4">
    <h5 class="font-semibold">Laptop</h5>
    <ul class="list-disc pl-5">
      <li>16GB DDR4</li>
      <li>32GB if running VMs</li>
    </ul>
  </div>
  <div class="w-1/2 pl-4">
    <h5 class="font-semibold">Desktop</h5>
    <ul class="list-disc pl-5">
      <li>16GB DDR4 or DDR5</li>
      <li>32GB if running multiple VMs</li>
    </ul>
  </div>
</div>
{{< /tab >}}

{{< tab "Storage" >}}
<div class="flex justify-between">
  <div class="w-1/2 pr-4">
    <h5 class="font-semibold">Laptop</h5>
    <ul class="list-disc pl-5">
      <li>512GB SSD for Linux</li>
      <li>256GB SSD for Windows (dual boot)</li>
    </ul>
  </div>
  <div class="w-1/2 pl-4">
    <h5 class="font-semibold">Desktop</h5>
    <ul class="list-disc pl-5">
      <li>1TB SSD for Linux</li>
      <li>500GB SSD for Windows (dual boot)</li>
    </ul>
  </div>
</div>
{{< /tab >}}

{{< tab "GPU" >}}
<div class="flex justify-between">
  <div class="w-1/2 pr-4">
    <h5 class="font-semibold">Laptop</h5>
    <ul class="list-disc pl-5">
      <li>NVIDIA GTX 1050 or better</li>
      <li>2GB VRAM minimum</li>
    </ul>
  </div>
  <div class="w-1/2 pl-4">
    <h5 class="font-semibold">Desktop</h5>
    <ul class="list-disc pl-5">
      <li>NVIDIA GTX 1660 or better</li>
      <li>4GB VRAM or higher</li>
    </ul>
  </div>
</div>
{{< /tab >}}

{{< tab "Networking" >}}
<div class="flex justify-between">
  <div class="w-1/2 pr-4">
    <h5 class="font-semibold">Laptop</h5>
    <ul class="list-disc pl-5">
      <li>1 Gbps Ethernet port (recommended)</li>
      <li>Wi-Fi 6 support</li>
    </ul>
  </div>
  <div class="w-1/2 pl-4">
    <h5 class="font-semibold">Desktop</h5>
    <ul class="list-disc pl-5">
      <li>1 Gbps Ethernet port</li>
      <li>Wi-Fi 6 adapter or PCIe card</li>
    </ul>
  </div>
</div>
{{< /tab >}}

{{< tab "Miscellaneous" >}}
<div class="flex justify-between">
  <div class="w-1/2 pr-4">
    <h5 class="font-semibold">Laptop</h5>
    <ul class="list-disc pl-5">
      <li>External USB 3.0 hub (for accessories)</li>
      <li>USB Wi-Fi adapter for packet injection</li>
      <li>Portable external SSD (for extra storage)</li>
    </ul>
  </div>
  <div class="w-1/2 pl-4">
    <h5 class="font-semibold">Desktop</h5>
    <ul class="list-disc pl-5">
      <li>Multiple monitor support</li>
      <li>USB Wi-Fi adapter for packet injection</li>
      <li>External HDD for backup and storage</li>
    </ul>
  </div>
</div>

{{< /tab >}}
{{< /tabs >}}

</br>

## Operating System 
For the operating system, I recommend Kali Linux for beginners but you can consider other options as well by simply installing your tools on your preferred OS. Personally I would recommend using a linux based distro or maybe [dual booting](/blog/dual_booting). 

For my setup I have dual booted Linux and Windows. I find arch linux easy to use and has all the tools required for pentesting whilst for report purposes Office works just on windows so I have to run windows as well. You can find below the list of recommeded distros and how to setup chaotic aur and black arch repos in arch and arch based distros.   

{{< accordion "Recommended distros" >}}
> **Note:** The Levels **Beginner**, **Intermediate** do not represent how easy it is to use or install the distro but how easy it is to begin hacking.
- **Debian Based**
    - [Kali Linux]() *(Beginner)*
    - [Ubuntu]() *(Intermediate)*
    - [Linux Mint]() *(Intermediate)*
    - [PopOS]() *(Intermediate)*
    - [Debian]() *(Intermediate)*
    
- **Arch Based**:
    - [Black Arch]() *(Intermediate)*
    - [Endeavour OS]() *(Intermediate)*
    - [Garuda Linux]() *(Intermediate)*
    - [Vanilla Arch]() *(Intermediate)*



{{< /accordion >}}

{{< accordion "Install Chaotic Aur and Black Arch repos" >}}
While using arch based distros for pentesting, I find it very useful to install chaotic aur and black arch repos which gives make install tools just one install away.
##### Chaotic Aur
We start by retrieving the primary key to enable the installation of our keyring and mirror list:
````bash
sudo pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
sudo pacman-key --lsign-key 3056513887B78AEB
sudo pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst'
sudo pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

````

Then, we append (adding at the end) the following to `/etc/pacman.conf`:
````bash
[chaotic-aur]
Include = /etc/pacman.d/chaotic-mirrorlist
````

##### Black Arch Repo
BlackArch Linux is compatible with existing/normal Arch installations. It acts as an unofficial user repository.
````bash
# Run https://blackarch.org/strap.sh as root and follow the instructions.
$ curl -O https://blackarch.org/strap.sh

# Verify the SHA1 sum
$ echo 26849980b35a42e6e192c6d9ed8c46f0d6d06047 strap.sh | sha1sum -c

# Set execute bit
$ chmod +x strap.sh

# Run strap.sh
$ sudo ./strap.sh

# Enable multilib following https://wiki.archlinux.org/index.php/Official_repositories#Enabling_multilib and run:
$ sudo pacman -Syu
````

{{< /accordion >}}

## Browser
{{< tabs >}}

<!-- Chromium-Based Browsers Tab -->
{{< tab "Chromium Based" >}}

##### Chromium-Based Browsers:

1. [Thorium](https://thorium.rocks/)
2. [Brave Browser](https://brave.com/)
3. [Arc Browser](https://arc.net/)

{{< accordion "Extensions" >}}

1. **Ublock Origin** - Powerful ad-blocker for enhanced security.
2. **NightTab** - Customizable start page to organize tabs.
3. **Dark Reader** - Dark mode for websites, reducing eye strain.
4. **Bitwarden** - Secure open-source password manager.
5. **FoxyProxy** - Switch between proxies, essential for anonymity and testing.
6. **Wappalyzer** - Detect web technologies for reconnaissance.
7. **I don't care about cookies** - Removes cookie consent popups.
8. **Enhancer for YouTube** - Ad-blocker and custom player for YouTube.
9. **Return YouTube Dislike** - Restores dislike count on videos.
10. **Plasma Shell Integration** - Connect Chromium with KDE Plasma desktop.
11. **GS Connect** - GNOME integration for file sharing and notifications.
12. **Shodan** - Direct access to Shodan's search engine for identifying vulnerable devices on the web.
13. **EditThisCookie** - Manage, edit, and delete cookies for testing.
14. **User-Agent Switcher** - Quickly change the browser's user agent for anonymity testing.
15. **XSS Rays** - Analyze websites for XSS vulnerabilities.
16. **HackTools** - Toolbox for pentesters: XSS payloads, reverse shells, and more.

{{< /accordion >}}

{{< /tab >}}

<!-- Firefox-Based Browsers Tab -->
{{< tab "Firefox Based" >}}

##### Firefox-Based Browsers:

1. [Zen Browser](https://zenbrowsers.com/)
2. [Floorp](https://floorp-browser.com/)
3. [Tor Browser](https://www.torproject.org/)

{{< accordion "Addons" >}}

1. **Ublock Origin** - Blocks ads and trackers.
2. **NightTab** - Organize frequently visited websites.
3. **Dark Reader** - Dark mode for a better browsing experience.
4. **Bitwarden** - Secure password storage.
5. **FoxyProxy** - Fast proxy switching for security assessments.
6. **Wappalyzer** - Detect website frameworks and technologies.
7. **I don't care about cookies** - Auto-dismiss cookie prompts.
8. **Enhancer for YouTube** - Control YouTube playback, skip ads.
9. **Return YouTube Dislike** - Bring back the dislike count on YouTube.
10. **Plasma Shell Integration** - Integrate with KDE desktop (if using Plasma).
11. **GS Connect** - GNOME extension for Android integration.
12. **HackBar** - Simplify manual SQL injections, XSS, and other input testing.
13. **HTTP Header Live** - View HTTP headers in real-time for testing.
14. **Cookie Quick Manager** - Quickly modify cookies for testing.
15. **Tamper Data** - View and modify HTTP requests for vulnerability testing.
16. **HackTools** - Useful pentesting tools: payloads, encoders, and more.


{{< /accordion >}}

{{< /tab >}}

{{< /tabs >}}

## Code Editors
{{< tabs >}}

{{< tab "Neovim" >}}
##### [NvChad](https://nvchad.com/)
Neovim is highly customizable and lightweight, making it ideal for fast coding with minimal distractions.

###### **Plugins:**
- **[TreeSitter](https://github.com/nvim-treesitter/nvim-treesitter)**: Syntax highlighting and parsing for better code comprehension.
- **[Telescope](https://github.com/nvim-telescope/telescope.nvim)**: Fuzzy file finder and search tool for quick navigation.
- **[LSPConfig](https://github.com/neovim/nvim-lspconfig)**: Language Server Protocol for auto-completion and diagnostics.
- **[Mason](https://github.com/williamboman/mason.nvim)**: Simple installer for managing LSP servers, linters, and formatters.
- **[Gitsigns](https://github.com/lewis6991/gitsigns.nvim)**: Git integration for showing changes in the code.
- **[Which-Key](https://github.com/folke/which-key.nvim)**: Displays available keybindings in a popup for ease of use.
- **[Nvim-Tree](https://github.com/nvim-tree/nvim-tree.lua)**: File explorer for Neovim, built-in file navigation.

**NvChad** is designed to be beginner-friendly yet powerful, making it perfect for both new and advanced users of Neovim.

{{< /tab >}}

{{< tab "VS Codium" >}}

##### [VS Codium](https://vscodium.com/)
VS Codium is the open-source version of [VS Code](https://code.visualstudio.com/) without telemetry, making it a privacy-friendly alternative.

###### **Extensions:**
- **[Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)**: Python extension for debugging and code formatting.
- **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)**: Linter for JavaScript and TypeScript.
- **[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)**: Code formatter for JavaScript, CSS, and other languages.
- **[GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)**: Enhances Git capabilities and displays code authorship.
- **[Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)**: Helps visualize matching brackets with colors.
- **[Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)**: Docker integration for managing containers directly from the editor.
- **[REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)**: Useful for testing and sending HTTP requests directly from VS Codium.
- **[Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)**: Catches spelling errors in your code and documentation.
- **[vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)**: Adds file icons to make project navigation easier.

VS Codium offers a broad range of open-source extensions to improve your coding experience without compromising privacy.

{{< /tab >}}

{{< /tabs >}}

## Note taking
{{< tabs >}}

{{< tab "Obsidian" >}}
[Obsidian](https://obsidian.md) is a powerful knowledge base that works on local markdown files. It’s highly customizable through various plugins.

{{< accordion "Obsidian Plugins" >}}

- **Calendar**: Adds a calendar view to track your daily notes and events.
- **Dataview**: Allows querying and displaying your notes as tables or lists based on metadata.
- **Excalidraw**: A drawing tool plugin that lets you integrate visual diagrams into your notes.
- **Git**: Enables you to back up your notes to a Git repository for version control.
- **Kanban**: Adds a Kanban board for task and project management within your vault.
- **MathJax**: Adds LaTeX support for writing and displaying mathematical equations.
- **PDF++**: Enhances PDF reading capabilities, allowing annotations directly in Obsidian.
- **Pomodoro Timer**: Adds a productivity timer with the Pomodoro technique for focused sessions.
- **Style Settings**: Customizes the visual appearance of your vault through themes and CSS tweaks.
- **Table of Content**: Generates a table of contents for your notes dynamically based on headers.
- **Tag Wrangler**: Helps manage tags more efficiently, allowing you to rename, merge, or organize tags.
- **Tag Folder**: Organizes notes based on their tags inside folders, similar to a file manager.
- **Templater**: Allows for dynamic templating in your notes to automate repetitive content creation.
- **Tracker**: Track habits, mood, or any data you want within your Obsidian vault.

{{< /accordion >}}

{{< /tab >}}

{{< tab "Logseq" >}}
[Logseq](https://logseq.com/) is a privacy-first, open-source knowledge management and collaboration platform based on outliner workflows, ideal for personal wikis, journals, and tasks.

- Supports markdown and org-mode.
- Hierarchical and backlinking system for powerful note organization.
- Graph view to visualize the interconnections between notes.
- Integrates with Git for version control.

{{< /tab >}}

{{< tab "AppFlowy" >}}
[AppFlowy](https://www.appflowy.io/) is an open-source alternative to Notion, with a focus on data privacy and customization. It provides a clean, block-based workspace for managing projects, writing notes, and task management.

- Privacy-first: All your data is stored locally.
- Open-source and customizable through plugins and themes.
- Supports collaboration with real-time syncing.

{{< /tab >}}

{{< /tabs >}}

## Pentesting Tools
I am learning the following tools to improve my pentesting skills and I will be writing various blogs related to these 
{{< tabs >}}

{{< tab "Programming Languages" >}}
- [Python](https://www.python.org)
- [Golang](https://golang.org)
- [Rust](https://www.rust-lang.org)
- [Bash](https://www.gnu.org/software/bash/)
{{< /tab >}}

{{< tab "Port Scanning" >}}
- [Nmap](https://nmap.org)
- [Masscan](https://github.com/robertdavidgraham/masscan)
- [Unicornscan](https://github.com/unicorn-engine/unicorn)
- [Rustscan](https://github.com/RustScan/RustScan)
{{< /tab >}}

{{< tab "OSINT" >}}
- [Maltego](https://www.maltego.com)
- [theHarvester](https://github.com/laramies/theHarvester)
- [SpiderFoot](https://github.com/smicallef/spiderfoot)
- [Recon-ng](https://github.com/lanmaster53/recon-ng)
- [Sherlock](https://github.com/sherlock-project/sherlock)
{{< /tab >}}

{{< tab "Mobile App Testing" >}}
- [Frida](https://frida.re)
- [Objection](https://github.com/sensepost/objection)
- [Drozer](https://github.com/WithSecureLabs/drozer)
- [MobSF](https://github.com/MobSF/Mobile-Security-Framework-MobSF)
- [APKTool](https://github.com/iBotPeaches/Apktool)
{{< /tab >}}

{{< tab "Webapp Testing" >}}
- [Burp Suite](https://portswigger.net/burp) *(**PLUGINS:** Autorize, Burp Bounty Pro, Coverter)*
- [OWASP ZAP](https://www.zaproxy.org)
- [Nikto](https://github.com/sullo/nikto)
- [Feroxbuster](https://github.com/epi052/feroxbuster)
- [GoBuster](https://github.com/OJ/gobuster)
- [SQLMap](https://github.com/sqlmapproject/sqlmap)
- [XSStrike](https://github.com/s0md3v/XSStrike)
{{< /tab >}}

{{< tab "API Testing" >}}
- [Postman](https://www.postman.com)
- [Insomnia](https://insomnia.rest)
- [Swagger UI](https://swagger.io/tools/swagger-ui)
- [Hoppscotch](https://hoppscotch.io)
{{< /tab >}}

{{< tab "WordPress Sites" >}}
- [WPScan](https://wpscan.com)
- [CMSmap](https://github.com/Dionach/CMSmap)
- [WPHunter](https://github.com/StefanoDeVuono/WP-Hunter)
- [Wordfence](https://www.wordfence.com)
{{< /tab >}}

{{< tab "Social Engineering" >}}
- [Social Engineering Toolkit (SET)](https://github.com/trustedsec/social-engineer-toolkit)
- [Evilginx2](https://github.com/kgretzky/evilginx2)
- [Phishery](https://github.com/ryhanson/phishery)
{{< /tab >}}

{{< tab "Wordlists" >}}
- [SecLists](https://github.com/danielmiessler/SecLists)
- [RockYou](https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt)
- [Dirb](https://github.com/v0re/dirb)
- [Wordlistctl](https://github.com/random-robbie/wordlistctl)
{{< /tab >}}

{{< tab "Exploitation Frameworks" >}}
- [Metasploit](https://www.metasploit.com)
- [BeEF](https://github.com/beefproject/beef)
- [PowerSploit](https://github.com/PowerShellMafia/PowerSploit)
- [Empire](https://github.com/EmpireProject/Empire)
{{< /tab >}}

{{< tab "Privilege Escalation" >}}
- [LinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS)
- [WinPEAS](https://github.com/carlospolop/PEASS-ng/tree/master/winPEAS)
- [GTFOBins](https://gtfobins.github.io)
- [SUDO_KILLER](https://github.com/TH3xACE/SUDO_KILLER)
{{< /tab >}}

{{< /tabs >}}

# Resources

{{< tabs >}}

<!-- CTF Platforms -->
{{< tab "CTF Platforms" >}}

##### *Pentesting Practice*
- [HackTheBox](https://www.hackthebox.com/)
- [PicoCTF](https://picoctf.org/)
- [TryHackMe](https://tryhackme.com/)
- [CTF 101](https://ctf101.org/)
- [Hacker101](https://www.hacker101.com/)
- [Pwn College](https://pwn.college/)
- [Root Me](https://www.root-me.org/?lang=en)
- [HackerTest](https://www.hackertest.net/)

##### *Linux Practice*
- [Linux Survival](https://linuxsurvival.com/)
- [OverTheWire](https://overthewire.org/wargames/)

##### *Vulnerable Machine Downloads*
- [VulnHub](https://www.vulnhub.com/)

{{< /tab >}}

<!-- Hacking Tools -->
{{< tab "Hacking Tools" >}}
- [Shodan](https://www.shodan.io/)
- [BinaryEdge](https://www.binaryedge.io/)
- [Censys](https://censys.io/)
- [Exploit-DB](https://www.exploit-db.com/)
- [VirusTotal](https://www.virustotal.com/)
- [Unpac Me](https://www.unpac.me/)
{{< /tab >}}

<!-- Learning Platforms -->
{{< tab "Learning Platforms" >}}
- [Hacklido](https://hacklido.com/)
- [SysExplore](https://www.sysexplore.com/)
- [Ivre](https://ivre.rocks/)
- [KodeKloud Engineer](https://engineer.kodekloud.com/)
- [PortSwigger Academy](https://portswigger.net/web-security)
- [APISec University](https://www.apisecuniversity.com/)
- [FreeCodeCamp](https://www.freecodecamp.org/)
- [The Odin Project](https://www.theodinproject.com/)
- [Cloud Pentest](https://pentesterlab.com/exercises/cloud_introduction)
- [Hacker High School](https://hackerhighschool.org/)
- [Coursera](https://www.coursera.org/)
- [Udemy](https://www.udemy.com/)
- [Skillshare](https://www.skillshare.com/)
- [edX](https://www.edx.org/)
- [Hacker Forum](https://thehackerforum.com/)

{{< /tab >}}

<!-- Creators -->
{{< tab "Creators" >}}
- [Rana Khalil OSCP Preparation](https://rana-khalil.gitbook.io/hack-the-box-oscp-preparation)
- [TCM Alex Site](https://appsecexplained.gitbook.io/appsecexplained)
{{< /tab >}}

<!-- Hacking Resources -->
{{< tab "Hacking Resources" >}}
- [OSSTMM](https://www.isecom.org/research.html)
- [BlackHills InfoSec](https://www.blackhillsinfosec.com/)
- [Antisyphon](https://www.antisyphontraining.com/)
- [Senoia.io](https://senoia.io/)
- [NIST Glossary](https://csrc.nist.gov/glossary)
{{< /tab >}}

<!-- Linux Resources -->
{{< tab "Linux Learning" >}}
- [Linux.die](https://linux.die.net/)
- [Linux Journey](https://linuxjourney.com/)
- [Linux Handbook](https://linuxhandbook.com/)
- [LinuxOPSys](https://linuxopsys.com/)
{{< /tab >}}

<!-- InfoSec News -->
{{< tab "InfoSec News" >}}
- [Hacker News](https://thehackernews.com/)
- [Exploit-DB](https://www.exploit-db.com/)
- [Shodan](https://www.shodan.io/)
- [BlackHills InfoSec](https://www.blackhillsinfosec.com/)
{{< /tab >}}

<!-- Useful Blogs -->
{{< tab "Useful Blogs" >}}
- [My Blogs](https://suhesh.com.np/blog/)
{{< /tab >}}

<!-- Cheat Sheets -->
{{< tab "Cheat Sheets" >}}
- [My Cheatsheets: Best one on the list](https://suhesh.com.np/cheatsheets/)
- [Cheatsheet.sh](https://cheatsheet.sh/)
- [Roadmap.sh](https://roadmap.sh/)
- [Google Dorks Database](https://www.exploit-db.com/google-hacking-database)
- [HackTricks](https://book.hacktricks.xyz/)
- [Pentest Monkey](http://pentestmonkey.net/)
- [GTFOBins](https://gtfobins.github.io/)
{{< /tab >}}

<!-- Libraries -->
{{< tab "Libraries" >}}
- [PDF Drive](https://www.pdfdrive.com/)
- [LibraryLOL](https://library.lol/)
{{< /tab >}}

{{< /tabs >}}

