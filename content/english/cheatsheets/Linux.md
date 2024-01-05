---
title: Linux
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/linux.svg"
description: is a stable, secure, and versatile open-source operating system kernel, powering servers, desktops, and diverse devices worldwide.

---
{{< toc >}}

#### 1. Change Directory
   {{< accordion "cd: Change to other directory" >}}
   Use case: `cd <directory>`
   <br>
   Example: To change to the "Downloads" directory
   <br>
   ```bash
   cd Downloads
   ```
   {{< /accordion >}}

#### 2. List Files
   {{< accordion "ls: List files in a directory" >}}
   Use case: `ls [options] [directory]`
   <br>
   Example: To list files with detailed information
   <br>
   ```bash
   ls -l
   ```
   {{< /accordion >}}

#### 3. Copy Files
   {{< accordion "cp: Copy files or directories" >}}
   Use case: `cp [options] source destination`
   <br>
   Example: To copy a file to another directory
   <br>
   ```bash
   cp file.txt /path/to/destination/
   ```
   {{< /accordion >}}

#### 4. Move/Rename Files
   {{< accordion "mv: Move or rename files or directories" >}}
   Use case: `mv [options] source destination`
   <br>
   Example: To move a file to another directory
   <br>
   ```bash
   mv file.txt /path/to/destination/
   ```
   {{< /accordion >}}

#### 5. Remove Files/Directories
   {{< accordion "rm: Remove files or directories" >}}
   Use case: `rm [options] file/directory`
   <br>
   Example: To remove a file
   <br>
   ```bash
   rm file.txt
   ```
   {{< /accordion >}}

#### 6. Create Directory
   {{< accordion "mkdir: Create a directory" >}}
   Use case: `mkdir [options] directory`
   <br>
   Example: To create a directory named "new_folder"
   <br>
   ```bash
   mkdir new_folder
   ```
   {{< /accordion >}}

#### 7. Find Files
   {{< accordion "find: Search for files in a directory hierarchy" >}}
   Use case: `find [directory] -name [filename]`
   <br>
   Example: To find all .txt files in the current directory
   <br>
   ```bash
   find . -name "*.txt"
   ```
   {{< /accordion >}}

#### 8. View File Content
   {{< accordion "cat: Display file content" >}}
   Use case: `cat [filename]`
   <br>
   Example: To display the content of a file
   <br>
   ```bash
   cat file.txt
   ```
   {{< /accordion >}}

#### 9. Edit Text Files
   {{< accordion "nano: A simple text editor" >}}
   Use case: `nano [filename]`
   <br>
   Example: To edit a file using nano
   <br>
   ```bash
   nano file.txt
   ```
   {{< /accordion >}}

#### 10. Check System Resources
   {{< accordion "top: Display and manage system processes" >}}
   Use case: `top`
   <br>
   Example: To view and manage running processes
   <br>
   ```bash
   top
   ```
   {{< /accordion >}}

#### 11. Network Diagnostics
   {{< accordion "netstat: Display network connections" >}}
   Use case: `netstat [options]`
   <br>
   Example: To display all active network connections
   <br>
   ```bash
   netstat -a
   ```
   {{< /accordion >}}

#### 12. Firewall Configuration
   {{< accordion "ufw: Uncomplicated Firewall" >}}
   Use case: `ufw [options]`
   <br>
   Example: To enable the firewall
   <br>
   ```bash
   ufw enable
   ```
   {{< /accordion >}}

#### 13. User Management
   {{< accordion "useradd/userdel: Add or delete users" >}}
   Use case: `useradd [options] username`
   <br>
   Example: To add a new user named "john"
   <br>
   ```bash
   useradd john
   ```
   {{< /accordion >}}

#### 14. Change User Password
   {{< accordion "passwd: Change user password" >}}
   Use case: `passwd [username]`
   <br>
   Example: To change the password for the user "john"
   <br>
   ```bash
   passwd john
   ```
   {{< /accordion >}}

#### 15. File Permissions
   {{< accordion "chmod: Change file permissions" >}}
   Use case: `chmod [options] permissions file`
   <br>
   Example: To give read and write permissions to a file
   <br>
   ```bash
   chmod +rw file.txt
   ```
   {{< /accordion >}}

#### 16. Archive and Compress Files
   {{< accordion "tar: Archive and compress files" >}}
   Use case: `tar [options] archive_name files/directories`
   <br>
   Example: To create a compressed archive named "backup.tar.gz" of the "Documents" directory
   <br>
   ```bash
   tar -czvf backup.tar.gz Documents/
   ```
   {{< /accordion >}}

#### 17. Search Text in Files
   {{< accordion "grep: Search for text in files" >}}
   Use case: `grep [options] pattern file(s)`
   <br>
   Example: To search for the word "error" in all .log files
   <br>
   ```bash
   grep "error" *.log
   ```
   {{< /accordion >}}

#### 18. Secure Copy
   {{< accordion "scp: Securely copy files between hosts" >}}
   Use case: `scp [options] source destination`
   <br>
   Example: To copy a local file to a remote server
   <br>
   ```bash
   scp file.txt user@remote:/path/to/destination/
   ```
   {{< /accordion >}}

#### 19. Process Monitoring
   {{< accordion "ps: Display information about active processes" >}}
   Use case: `ps [options]`
   <br>
   Example: To display information about all processes
   <br>
   ```bash
   ps aux
   ```
   {{< /accordion >}}

#### 20. System Information
   {{< accordion "uname: Display system information" >}}
   Use case: `uname [options]`
   <br>
   Example: To display the system name and version
   <br>
   ```bash
   uname -a
   ```
   {{< /accordion >}}

#### 21. Network Packet Capture
   {{< accordion "tcpdump: Capture and display network packets" >}}
   Use case: `tcpdump [options] [expression]`
   <br>
   Example: To capture packets on interface eth0
   <br>
   ```bash
   tcpdump -i eth0
   ```
   {{< /accordion >}}

#### 22. File System Encryption
   {{< accordion "cryptsetup: Manage encrypted volumes" >}}
   Use case: `cryptsetup [options] command`
   <br>
   Example: To create an encrypted volume
   <br>
   ```bash
   cryptsetup luksFormat /dev/sdb1
   ```
   {{< /accordion >}}

#### 23. Process Priority
   {{< accordion "nice: Set or show process priority" >}}
   Use case: `nice [options] command`
   <br>
   Example: To run a command with a lower priority
   <br>
   ```bash
   nice -n 10 command
   ```
   {{< /accordion >}}

#### 24. File Integrity Checking
   {{< accordion "sha256sum: Calculate and check SHA256 message digest" >}}
   Use case: `sha256sum [options] file(s)`
   <br>
   Example: To calculate the SHA256 hash of a file
   <br>
   ```bash
   sha256sum file.txt
   ```
   {{< /accordion >}}

#### 25. SSH Key Authentication
   {{< accordion "ssh-keygen: Generate SSH key pairs" >}}
   Use case: `ssh-keygen [options]`
   <br>
   Example: To generate an SSH key pair
   <br>
   ```bash
   ssh-keygen -t rsa -b 2048
   ```
   {{< /accordion >}}

#### 26. File System Quotas
   {{< accordion "quota: Display and manage disk usage quotas" >}}
   Use case: `quota [options]`
   <br>
   Example: To display disk quotas for the current user
   <br>
   ```bash
   quota -v
   ```
   {{< /accordion >}}

#### 27. Secure File Deletion
   {{< accordion "shred: Overwrite a file to hide its contents" >}}
   Use case: `shred [options] file(s)`
   <br>
   Example: To securely delete a file
   <br>
   ```bash
   shred -u file.txt
   ```
   {{< /accordion >}}

#### 28. Disk Usage
   {{< accordion "du: Display disk usage" >}}
   Use case: `du [options] [directory]`
   <br>
   Example: To display disk usage for the current directory
   <br>
   ```bash
   du -h
   ```
   {{< /accordion >}}

#### 29. File System Check
   {{< accordion "fsck: Check and repair a Linux file system" >}}
   Use case: `fsck [options] [filesystem]`
   <br>
   Example: To check and repair the root file system
   <br>
   ```bash
   fsck /
   ```
   {{< /accordion >}}

#### 30. Check Open Ports
   {{< accordion "nmap: Network exploration and security auditing" >}}
   Use case: `nmap [options] target`
   <br>
   Example: To scan open ports on a target
   <br>
   ```bash
   nmap -p 1-1000 target
   ```
   {{< /accordion >}}

#### 31. Disk Partitioning
   {{< accordion "fdisk: Partition table manipulator" >}}
   Use case: `fdisk [options] device`
   <br>
   Example: To create a new partition on /dev/sdb
   <br>
   ```bash
   fdisk /dev/sdb
   ```
   {{< /accordion >}}

#### 32. File and Directory Permissions
   {{< accordion "chown: Change file owner and group" >}}
   Use case: `chown [options] owner:group file(s)`
   <br>
   Example: To change the owner of a file to user "john"
   <br>
   ```bash
   chown john: file.txt
   ```
   {{< /accordion >}}

#### 33. Monitor Network Connections
   {{< accordion "iftop: Display network bandwidth usage" >}}
   Use case: `iftop`
   <br>
   Example: To monitor network connections in real-time
   <br>
   ```bash
   iftop
   ```
   {{< /accordion >}}

#### 34. File Encryption
   {{< accordion "gpg: Encrypt and sign data" >}}
   Use case: `gpg [options] file`
   <br>
   Example: To encrypt a file with GPG
   <br>
   ```bash
   gpg -c file.txt
   ```
   {{< /accordion >}}

#### 35. File System Mounting
   {{< accordion "mount: Mount a file system" >}}
   Use case: `mount [options] device directory`
   <br>
   Example: To mount a USB drive to /mnt/usb
   <br>
   ```bash
   mount /dev/sdc1 /mnt/usb
   ```
   {{< /accordion >}}

#### 36. System Log Inspection
   {{< accordion "journalctl: Query and display messages from the journal" >}}
   Use case: `journalctl [options]`
   <br>
   Example: To view system logs
   <br>
   ```bash
   journalctl
   ```
   {{< /accordion >}}

#### 37. Network Interface Configuration
   {{< accordion "ifconfig: Configure network interfaces" >}}
   Use case: `ifconfig [interface] [options]`
   <br>
   Example: To display network interfaces
   <br>
   ```bash
   ifconfig
   ```
   {{< /accordion >}}

#### 38. Process Killing
   {{< accordion "kill: Terminate or signal processes" >}}
   Use case: `kill [options] PID`
   <br>
   Example: To kill a process with PID 1234
   <br>
   ```bash
   kill 1234
   ```
   {{< /accordion >}}

#### 39. System Resource Monitoring
   {{< accordion "htop: Interactive process viewer" >}}
   Use case: `htop`
   <br>
   Example: To interactively view and manage system processes
   <br>
   ```bash
   htop
   ```
   {{< /accordion >}}

#### 40. IP Configuration
   {{< accordion "ip: Show/manipulate routing, devices, policy routing and tunnels" >}}
   Use case: `ip [options] [object]`
   <br>
   Example: To display IP addresses and routing information
   <br>
   ```bash
   ip address show
   ```
   {{< /accordion >}}

#### 41. Disk Formatting
   {{< accordion "mkfs: Build a Linux filesystem" >}}
   Use case: `mkfs [options] device`
   <br>
   Example: To create an ext4 file system on /dev/sdb1
   <br>
   ```bash
   mkfs.ext4 /dev/sdb1
   ```
   {{< /accordion >}}

#### 42. Network Packet Analysis
   {{< accordion "wireshark: Network protocol analyzer" >}}
   Use case: `wireshark [options] [filename]`
   <br>
   Example: To capture and analyze network packets
   <br>
   ```bash
   wireshark
   ```
   {{< /accordion >}}

#### 43. Secure Shell Configuration
   {{< accordion "sshd_config: OpenSSH server configuration file" >}}
   Use case: `sudo nano /etc/ssh/sshd_config`
   <br>
   Example: To edit the SSH server configuration file
   <br>
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   {{< /accordion >}}

#### 44. User Activity Monitoring
   {{< accordion "last: Show listing of last logged in users" >}}
   Use case: `last [options] [username]`
   <br>
   Example: To display last logged-in users
   <br>
   ```bash
   last
   ```
   {{< /accordion >}}

#### 45. Memory Usage
   {{< accordion "free: Display amount of free and used memory in the system" >}}
   Use case: `free [options]`
   <br>
   Example: To display memory usage statistics
   <br>
   ```bash
   free -m
   ```
   {{< /accordion >}}

#### 46. Checksum Verification
   {{< accordion "md5sum: Calculate and check MD5 message digest" >}}
   Use case: `md5sum [options] file(s)`
   <br>
   Example: To calculate the MD5 hash of a file
   <br>
   ```bash
   md5sum file.txt
   ```
   {{< /accordion >}}

#### 47. System Update
   {{< accordion "apt: Advanced Package Tool" >}}
   Use case: `sudo apt update && sudo apt upgrade`
   <br>
   Example: To update the package list and upgrade installed packages
   <br>
   ```bash
   sudo apt update && sudo apt upgrade
   ```
   {{< /accordion >}}

#### 48. Check System Uptime
   {{< accordion "uptime: Show how long the system has been running" >}}
   Use case: `uptime`
   <br>
   Example: To display system uptime
   <br>
   ```bash
   uptime
   ```
   {{< /accordion >}}

#### 49. Remote File Editing
   {{< accordion "vim: Improved version of the vi editor" >}}
   Use case: `vim [filename]`
   <br>
   Example: To edit a file using vim
   <br>
   ```bash
   vim file.txt
   ```
   {{< /accordion >}}

#### 50. System Shutdown
   {{< accordion "shutdown: Halt or reboot the system" >}}
   Use case: `sudo shutdown [options] [time]`
   <br>
   Example: To shutdown the system immediately
   <br>
   ```bash
   sudo shutdown now
   ```
   {{< /accordion >}}
