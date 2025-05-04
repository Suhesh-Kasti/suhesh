---
title: NGINX As a Reverse Proxy
description: Essential guide to using NGINX as a reverse proxy
date: 2023-07-15T10:00:00+05:45
image: /images/cheatsheets/nginx.png
cheatsheet_categories:
  - NGINX
cheatsheet_tags:
  - configuration
  - web server
  - reverse-proxy
---
## 🔄 NGINX Cheatsheet: Full Reverse Proxy Reference

---

### 🧱 1. Basic Reverse Proxy Setup

{{< accordion "proxy_pass: Forward traffic to a backend server" >}}

The simplest form of reverse proxy:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

- Forwards requests from `example.com` to a backend on `localhost:3000`.
    
- NGINX acts as a transparent middleman.  
    {{< /accordion >}}
    

---

### 🌐 2. Path-Based Proxying

{{< accordion "proxy_pass with location path and trailing slash" >}}

```nginx
location /api/ {
    proxy_pass http://localhost:3000/;
}
```

- URL `/api/users` gets mapped to `/users` on backend.
    
- Always use **trailing slash** on `proxy_pass` if you want to **strip** the `/api/` prefix.
    
- If you **don’t** use a trailing slash (`proxy_pass http://localhost:3000`), `/api/users` gets sent as `/api/users`.
    

✅ TL;DR:

- `proxy_pass http://host/;` → replaces path
    
- `proxy_pass http://host;` → preserves original path  
    {{< /accordion >}}
    

---

### 🔗 3. Upstream Backends

{{< accordion "upstream block: Define multiple backend servers" >}}

```nginx
upstream backend_cluster {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://backend_cluster;
    }
}
```

- Used for load balancing or redundancy.
    
- Supports directives like:
    
    - `weight=3`
        
    - `max_fails=2 fail_timeout=30s`
        
    - `backup`
        
    - `down`  
        {{< /accordion >}}
        

---

### 📩 4. Header Forwarding (Preserve Client Info)

{{< accordion "proxy_set_header: Maintain client identity and request metadata" >}}

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

- **Host:** original domain name client used
    
- **X-Real-IP:** client’s actual IP
    
- **X-Forwarded-For:** full IP chain through proxies
    
- **X-Forwarded-Proto:** whether original request was HTTP or HTTPS  
    {{< /accordion >}}
    

---

### 🔁 5. WebSocket Support

{{< accordion "Enable proxying for WebSocket-based backends" >}}

```nginx
location /ws/ {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

- WebSockets need **HTTP/1.1** and the **Upgrade**/**Connection** headers to be set correctly.  
    {{< /accordion >}}
    

---

### ⏱ 6. Timeouts & Buffer Tuning

{{< accordion "Improve resilience and performance under load" >}}

```nginx
proxy_connect_timeout 5s;
proxy_send_timeout 10s;
proxy_read_timeout 30s;

proxy_buffer_size 16k;
proxy_buffers 4 32k;
proxy_busy_buffers_size 64k;
```

- Prevents hanging requests.
    
- Larger buffer sizes may help for big API responses or file downloads.  
    {{< /accordion >}}
    

---

### 🚫 7. Error Handling

{{< accordion "Intercept backend errors and show friendly pages" >}}

```nginx
proxy_intercept_errors on;
error_page 502 503 504 /custom_50x.html;

location = /custom_50x.html {
    root /usr/share/nginx/html;
}
```

- NGINX intercepts backend errors and serves a custom static HTML page.  
    {{< /accordion >}}
    

---

### ⚖️ 8. Load Balancing Logic (with Upstreams)

{{< accordion "Choose between round-robin, least_conn, ip_hash" >}}

```nginx
upstream myapi {
    least_conn;  # or ip_hash;

    server backend1.local;
    server backend2.local;
}
```

- `least_conn`: good for APIs with long requests.
    
- `ip_hash`: sticky sessions based on client IP.
    
- `round-robin`: default.  
    {{< /accordion >}}
    

---

### 🧠 9. Advanced: Retry & Failover

{{< accordion "proxy_next_upstream: Retry on backend failure" >}}

```nginx
location / {
    proxy_pass http://myapp;

    proxy_next_upstream error timeout http_502 http_503 http_504;
    proxy_next_upstream_tries 3;
}
```

- Retries requests on failure.
    
- Prevents complete outage if one backend goes down.  
    {{< /accordion >}}
    

---

### 🔐 10. Optional: Basic Auth for Proxy Routes

{{< accordion "Protect reverse-proxied resources with basic auth" >}}

```nginx
location /admin/ {
    auth_basic "Restricted Area";
    auth_basic_user_file /etc/nginx/.htpasswd;

    proxy_pass http://localhost:4000/admin/;
}
```

- Use `htpasswd` tool to generate user:pass file.
    
- Great for admin panels or staging apps.  
    {{< /accordion >}}
    

---

### 🔄 11. Optional: HTTPS Backend Proxying

{{< accordion "Proxy to SSL-enabled backend servers" >}}

```nginx
location / {
    proxy_pass https://backend.example.com;
    proxy_ssl_verify off;  # optional: skip self-signed cert validation
}
```

- Add `proxy_ssl_certificate` and `proxy_ssl_trusted_certificate` for cert validation.  
    {{< /accordion >}}
    

---

### 🧬 12. Optional: Rewriting Content with sub_filter

{{< accordion "Modify upstream HTML responses on the fly" >}}

```nginx
location /app/ {
    proxy_pass http://localhost:3000/;
    sub_filter 'old-url.com' 'new-url.com';
    sub_filter_once off;

    proxy_set_header Accept-Encoding "";
}
```

- Useful when you reverse-proxy apps that hardcode URLs (e.g., WordPress or dashboards).
    
- Disabling `Accept-Encoding` is required to use `sub_filter`.  
    {{< /accordion >}}
    
