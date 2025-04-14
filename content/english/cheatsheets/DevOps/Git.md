---
title: "Git Cheatsheet"
description: "A comprehensive cheatsheet for Git commands and workflows"
date: 2024-10-05T12:00:00+05:45
cheatsheet_categories: ["DevOps"]
cheatsheet_tags: ["git", "version control"]
folder: "devops"
draft: false
weight: 1
---

# Git Cheatsheet

A comprehensive guide to Git commands and workflows.

## Basic Commands

```bash
# Initialize a repository
git init

# Clone a repository
git clone <repository-url>

# Check status
git status

# Add files to staging
git add <file>
git add .

# Commit changes
git commit -m "Commit message"

# Push changes
git push origin <branch>

# Pull changes
git pull origin <branch>
```

## Branching

```bash
# Create a new branch
git branch <branch-name>

# Switch to a branch
git checkout <branch-name>

# Create and switch to a new branch
git checkout -b <branch-name>

# List all branches
git branch -a

# Delete a branch
git branch -d <branch-name>
```

## Advanced Commands

```bash
# Stash changes
git stash

# Apply stashed changes
git stash apply

# View commit history
git log

# Revert a commit
git revert <commit-hash>

# Reset to a specific commit
git reset --hard <commit-hash>
```
