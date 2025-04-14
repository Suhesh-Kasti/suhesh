---
title: "Linux Commands Cheatsheet"
description: "Essential Linux commands for system administration and DevOps"
date: 2024-10-06T12:00:00+05:45
cheatsheet_categories: ["DevOps"]
cheatsheet_tags: ["linux", "bash", "commands"]
folder: "devops"
draft: false
weight: 2
---

# Linux Commands Cheatsheet

Essential Linux commands for system administration and DevOps.

## File System Navigation

```bash
# List files and directories
ls
ls -la

# Change directory
cd <directory>

# Print working directory
pwd

# Create directory
mkdir <directory>

# Remove file
rm <file>

# Remove directory
rm -rf <directory>

# Copy file
cp <source> <destination>

# Move/rename file
mv <source> <destination>
```

## File Viewing and Editing

```bash
# View file content
cat <file>

# View file with pagination
less <file>

# View first few lines
head <file>

# View last few lines
tail <file>

# Edit file
nano <file>
vim <file>
```

## System Information

```bash
# Display system information
uname -a

# Display disk usage
df -h

# Display memory usage
free -h

# Display running processes
ps aux

# Display system uptime
uptime
```

## User Management

```bash
# Add user
sudo adduser <username>

# Change password
sudo passwd <username>

# Switch user
su <username>

# Run command as superuser
sudo <command>
```
