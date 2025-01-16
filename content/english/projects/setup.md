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
  - [Kali Linux]() _(Beginner)_
  - [Ubuntu]() _(Intermediate)_
  - [Linux Mint]() _(Intermediate)_
  - [PopOS]() _(Intermediate)_
  - [Debian]() _(Intermediate)_
- **Arch Based**:
  - [Black Arch]() _(Intermediate)_
  - [Endeavour OS]() _(Intermediate)_
  - [Garuda Linux]() _(Intermediate)_
  - [Vanilla Arch]() _(Intermediate)_

{{< /accordion >}}

{{< accordion "Install Chaotic Aur and Black Arch repos" >}}
While using arch based distros for pentesting, I find it very useful to install chaotic aur and black arch repos which gives make install tools just one install away.

##### Chaotic Aur

We start by retrieving the primary key to enable the installation of our keyring and mirror list:

```bash
sudo pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
sudo pacman-key --lsign-key 3056513887B78AEB
sudo pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst'
sudo pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

```

Then, we append (adding at the end) the following to `/etc/pacman.conf`:

```bash
[chaotic-aur]
Include = /etc/pacman.d/chaotic-mirrorlist
```

##### Black Arch Repo

BlackArch Linux is compatible with existing/normal Arch installations. It acts as an unofficial user repository.

```bash
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
```

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

- [Burp Suite](https://portswigger.net/burp) _(**PLUGINS:** Autorize, Burp Bounty Pro, Coverter)_
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

## Learning

{{< tabs >}}

<!-- Learning Platforms -->

{{< tab "Learning Platforms" >}}

- [Hacklido](https://hacklido.com/)
  - Articles, discussions, and learning resources for security professionals.
- [SysExplore](https://www.sysexplore.com/)
  - Explore educational materials for cybersecurity.
- [Ivre](https://ivre.rocks/)
  - Network scan analysis platform.
- [KodeKloud Engineer](https://engineer.kodekloud.com/)
  - Learn DevOps and cybersecurity skills through practical labs.
- [PortSwigger Academy](https://portswigger.net/web-security)
  - Free web security learning platform from the creators of Burp Suite.
- [APISec University](https://www.apisecuniversity.com/)
  - API security learning resources.
- [FreeCodeCamp](https://www.freecodecamp.org/)
  - Free interactive lessons on coding and security.
- [The Odin Project](https://www.theodinproject.com/)
  - Comprehensive full-stack development education.
- [Cloud Pentest](https://pentesterlab.com/exercises/cloud_introduction)
  - Learn cloud pentesting through practical labs.
- [Hacker High School](https://hackerhighschool.org/)
  - Cybersecurity lessons and labs for teens.
- [Coursera](https://www.coursera.org/)
  - Online learning platform with cybersecurity courses.
- [Udemy](https://www.udemy.com/)
  - A wide variety of cybersecurity and hacking courses.
- [Skillshare](https://www.skillshare.com/)
  - Learn various topics, including cybersecurity.
- [edX](https://www.edx.org/)
  - Free and paid courses on topics including cybersecurity.
- [Hacker Forum](https://thehackerforum.com/)
  - Online forum for hacking and cybersecurity discussions.
    {{< /tab >}}

<!-- General CTF Learning -->

{{< tab "General" >}}

- [AperiSolve](https://github.com/Zeecka/AperiSolve)
  - Tool that automatically runs various steganography tools.
- [John Hammond's CTF Katana](https://github.com/JohnHammond/ctf-katana)
  - Comprehensive repository for solving CTF challenges.
- [Awesome CTF](https://github.com/apsdehal/awesome-ctf/blob/master/README.md)
  - Cheat sheet for creating and solving CTF challenges.
    {{< /tab >}}

<!-- Hacking Resources -->

{{< tab "Hacking Resources" >}}

- [OSSTMM](https://www.isecom.org/research.html)
  - Open Source Security Testing Methodology Manual.
- [BlackHills InfoSec](https://www.blackhillsinfosec.com/)
  - Cybersecurity resources and training.
- [Antisyphon](https://www.antisyphontraining.com/)
  - Affordable cybersecurity training.
- [Senoia.io](https://senoia.io/)
  - Threat hunting resources and tools.
- [NIST Glossary](https://csrc.nist.gov/glossary)
  - Cybersecurity terms from NIST.
    {{< /tab >}}

<!-- Linux Resources -->

{{< tab "Linux Learning" >}}

- [Linux.die](https://linux.die.net/)
  - Linux documentation and resources.
- [Linux Journey](https://linuxjourney.com/)
  - Beginner-friendly platform for learning Linux.
- [Linux Handbook](https://linuxhandbook.com/)
  - Articles and tutorials on Linux for professionals.
- [LinuxOPSys](https://linuxopsys.com/)
  - Linux resources and learning for enthusiasts and professionals.
    {{< /tab >}}

<!-- InfoSec News -->

{{< tab "InfoSec News" >}}

- [Hacker News](https://thehackernews.com/)
  - Cybersecurity news and articles.
- [Exploit-DB](https://www.exploit-db.com/)
  - Database of exploits and vulnerabilities.
- [Shodan](https://www.shodan.io/)
  - Search engine for internet-connected devices and vulnerabilities.
- [BlackHills InfoSec](https://www.blackhillsinfosec.com/)
  - Security news and insights from professionals.
    {{< /tab >}}

<!-- Cheat Sheets -->

{{< tab "Cheat Sheets" >}}

- [Cheatsheet.sh](https://cheatsheet.sh/)
  - Command-line cheat sheets for developers and security professionals.
- [Roadmap.sh](https://roadmap.sh/)
  - Developer and security roadmaps for various technologies.
- [Google Dorks Database](https://www.exploit-db.com/google-hacking-database)
  - Database of Google Dorks for information gathering.
- [HackTricks](https://book.hacktricks.xyz/)
  - A hacking techniques cheat sheet.
- [Pentest Monkey](http://pentestmonkey.net/)
  - Useful resources and cheat sheets for pentesting.
- [GTFOBins](https://gtfobins.github.io/)
  - A collection of Linux binaries useful for exploitation.
    {{< /tab >}}

<!-- Libraries -->

{{< tab "Libraries" >}}

- [PDF Drive](https://www.pdfdrive.com/)
  - Free eBooks for a wide range of topics.
- [LibraryLOL](https://library.lol/)
  - Online library with various resources, including hacking.
    {{< /tab >}}

{{< /tabs >}}

---

## Practice

After learning you can practise here

{{< tabs >}}

<!-- General CTFs -->

{{< tab "General CTFs" >}}

- [HackTheBox](https://hackthebox.com/)
  - The OG box site with curated CTF problems and learning courses.
- [PicoCTF](https://play.picoctf.org/practice)
  - Tons of practice challenges across various domains.
- [TryHackMe](https://tryhackme.com/)
  - Step-by-step CTF challenges with guided learning paths.
- [CTF101](https://ctf101.org/)
  - A great beginner-friendly introduction to CTFs.
- [CybersecLabs](https://www.cyberseclabs.co.uk/)
  - Good collection of CTF-style challenges.
- [Root Me](https://www.root-me.org/?lang=en)
  - CTF platform with various hacking challenges for practice.
- [HackerTest](https://www.hackertest.net/)
  - Platform to test and improve your hacking skills.
- [VulnHub](https://www.vulnhub.com/)
  - Vulnerable virtual machines for self-hosted practice.
- [CTF Challenge](https://ctfchallenge.com/register)
  - Realistic web challenges for bug bounty practice.
    {{< /tab >}}

<!-- Pwn CTFs -->

{{< tab "Pwn CTFs" >}}

- [pwnable.kr](http://pwnable.kr/index.php)
  - Good variety of pwn challenges.
- [pwnable.tw](https://pwnable.tw/challenge/)
  - More advanced pwn challenges.
- [pwnable.xyz](https://pwnable.xyz/challenges/)
  - User-uploadable pwn challenges with built-in writeups.
- [pwn dojo](https://dojo.pwn.college)
  - Pwn challenges with educational resources and Discord support.
- [nightmare](https://guyinatuxedo.github.io/)
  - Gold standard for pwning C binaries.
- [ROPEmporium](https://ropemporium.com/)
  - Learn Return-Oriented Programming techniques.
- [Phoenix Exploit Education](https://exploit.education/phoenix/)
  - Binary exploitation challenges ranked by difficulty.
    {{< /tab >}}

<!-- Reversing CTFs -->

{{< tab "Reversing CTFs" >}}

- [challenges.re](https://challenges.re/)
  - Extensive reversing challenges across many levels.
- [reversing.kr](http://reversing.kr/)
  - Reverse engineering challenges for different levels.
- [crackmes.one](https://crackmes.one)
  - CrackMe challenges for reverse engineering practice.
    {{< /tab >}}

<!-- Web CTFs -->

{{< tab "Web CTFs" >}}

- [websec.fr](http://websec.fr/#)
  - Web challenges for various levels of difficulty.
- [webhacking.kr](https://webhacking.kr/chall.php)
  - Archive of web CTF challenges.
- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
  - Web application with over 100 challenges.
- [DVWA](https://dvwa.co.uk/)
  - Web app vulnerability lab for testing.
- [bWAPP](http://www.itsecgames.com/)
  - Buggy Web App for learning and practicing vulnerabilities.
    {{< /tab >}}

<!-- Crypto CTFs -->

{{< tab "Crypto CTFs" >}}

- [CryptoHack](https://cryptohack.org/)
  - Crypto challenges for all levels.
- [cryptopals](https://cryptopals.com/)
  - OG crypto challenge site.
- [CryptoCTF](https://cr.yp.toc.tf)
  - Annual cryptography-based CTF event.
    {{< /tab >}}

<!-- Cloud CTFs -->

{{< tab "Cloud CTFs" >}}

- [CloudFoxable](https://cloudfoxable.bishopfox.com)
  - Walkthrough of cloud-based vulnerabilities using CloudFox.
- [Flaws.cloud](https://flaws.cloud)
  - AWS-based challenges related to S3, EC2, and Lambda.
    {{< /tab >}}

<!-- Smart Contracts -->

{{< tab "Smart Contracts" >}}

- [Capture the Ether](https://capturetheether.com/)
  - Smart contract security challenges for Ethereum.
    {{< /tab >}}

{{< /tabs >}}
