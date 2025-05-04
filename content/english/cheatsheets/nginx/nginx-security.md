---
title: "NGINX Security Hardening Cheatsheet"
description: "Comprehensive guide to securing NGINX web server against common vulnerabilities and attacks"
date: 2023-07-17T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX", "Security"]
cheatsheet_tags: ["nginx", "security", "hardening", "web server", "ssl"]
---
## 🔐 NGINX Cheatsheet: SSL/TLS & Security (Full Reference)

---

### 🔒 1. Enable HTTPS with Self-Signed Certificate (Dev)

{{< accordion "Use OpenSSL to create your own test certificate" >}}

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout selfsigned.key -out selfsigned.crt
```

```nginx
server {
    listen 443 ssl;

    ssl_certificate     /etc/nginx/ssl/selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/selfsigned.key;

    location / {
        root /var/www/html;
    }
}
```

- Great for local testing or private internal tools.
    
- Replace with Let’s Encrypt in production.  
    {{< /accordion >}}
    

---

### 🧼 2. Free HTTPS with Let’s Encrypt

{{< accordion "Automate SSL with Certbot (Recommended for Prod)" >}}

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

- Auto-configures HTTPS and renewals.
    
- Certificates are valid for 90 days, renewed automatically.
    
- Can be run with `--dry-run` for testing.  
    {{< /accordion >}}
    

---

### ⚙️ 3. Strong TLS Configuration (Modern Cipher Suite)

{{< accordion "Use strong ciphers and TLS 1.2/1.3 only" >}}

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1h;
ssl_ecdh_curve X25519:secp384r1;
```

- TLSv1.0 and TLSv1.1 are deprecated.
    
- Use modern ciphers for performance and security.
    
- Enable ECDHE for Perfect Forward Secrecy.  
    {{< /accordion >}}
    

---

### 🌐 4. Redirect All HTTP to HTTPS

{{< accordion "Force secure connections" >}}

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

- Essential to prevent insecure fallback.
    
- SEO-friendly (`301` is permanent).  
    {{< /accordion >}}
    

---

### 📶 5. Enable HTTP/2

{{< accordion "Improve TLS request performance" >}}

```nginx
server {
    listen 443 ssl http2;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

- HTTP/2 allows multiplexing and lower latency.
    
- Requires HTTPS.
    
- Can significantly speed up page loads.  
    {{< /accordion >}}
    

---

### 🔐 6. HTTP Strict Transport Security (HSTS)

{{< accordion "Tell browsers to _always_ use HTTPS (even without redirect)" >}}

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
```

- `max-age=63072000`: 2 years.
    
- `includeSubDomains`: applies to all subdomains.
    
- `preload`: register with browsers’ preload list.
    
- Only enable after confirming HTTPS is fully functional site-wide.  
    {{< /accordion >}}
    

---

### 🧱 7. Basic Web Application Firewall (WAF) with NGINX

{{< accordion "Block common malicious patterns" >}}

```nginx
location / {
    if ($request_uri ~* "(select|union|insert|drop|http|https|ftp)\s") {
        return 403;
    }
}
```

- Stops common SQL injection attempts.
    
- Very basic — better to use ModSecurity or App Protect.  
    {{< /accordion >}}
    

---

### 🔐 8. Secure Headers (Security Best Practices)

{{< accordion "Add extra layers of browser protection" >}}

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), microphone=()" always;
```

- Blocks clickjacking, XSS, and MIME sniffing attacks.
    
- Enforces privacy and permission controls.  
    {{< /accordion >}}
    

---

### 🛡️ 9. DDoS Mitigation (Rate Limiting)

{{< accordion "Throttles requests to prevent abuse" >}}

```nginx
limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=5r/s;

server {
    location / {
        limit_req zone=req_limit_per_ip burst=10 nodelay;
    }
}
```

- Limits clients to 5 requests/second with a burst of 10.
    
- Helps mitigate basic DDoS or brute-force attacks.  
    {{< /accordion >}}
    

---

### 🧪 10. Test SSL Configuration

{{< accordion "Use online tools to test and verify config" >}}

- 🔗 [SSL Labs Test](https://www.ssllabs.com/ssltest/)
    
- 🔗 [SecurityHeaders.com](https://securityheaders.com/)
    
- 🔗 `curl -I https://yourdomain.com` to view response headers.
    
- 🔗 `openssl s_client -connect yourdomain.com:443` to debug certs.
    
- Aim for Grade A+ on SSL Labs and strong headers across the board.  
    {{< /accordion >}}
    
