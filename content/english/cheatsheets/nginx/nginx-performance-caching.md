---
title: "NGINX Performance Optimization Cheatsheet"
description: "Comprehensive guide to optimizing NGINX for maximum performance and throughput"
date: 2023-07-16T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["NGINX"]
cheatsheet_tags: ["nginx", "performance", "optimization", "caching", "tuning"]
---
## 🚀 NGINX Cheatsheet: Caching & Performance Optimization (Full Reference)

---

### 🗂️ 1. Caching Static Assets

{{< accordion "Leverage browser cache with long expiration for static files" >}}

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
    expires 30d;
    access_log off;
    add_header Cache-Control "public";
}
```

- Static files won't be fetched again until expired.
    
- Reduces server load and latency.
    
- `access_log off` prevents log flooding.  
    {{< /accordion >}}
    

---

### 📦 2. Proxy Caching for Dynamic Content

{{< accordion "Cache upstream responses (API, HTML) at NGINX layer" >}}

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m inactive=60m use_temp_path=off;

server {
    location /api/ {
        proxy_cache my_cache;
        proxy_pass http://backend;
        proxy_cache_valid 200 10m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

- Caches `200 OK` responses for 10 minutes.
    
- `$upstream_cache_status`: `MISS`, `HIT`, or `BYPASS` for debugging.
    
- `inactive=60m`: if unused for 60m, cache expires.  
    {{< /accordion >}}
    

---

### 🧠 3. Conditional Caching with Custom Rules

{{< accordion "Only cache GET requests or specific URIs" >}}

```nginx
location /api/ {
    proxy_cache my_cache;
    proxy_cache_methods GET;
    proxy_cache_key "$host$request_uri";
    proxy_no_cache $http_authorization;
    proxy_pass http://backend;
}
```

- Only cache GETs.
    
- Skip cache if there's an `Authorization` header.
    
- Use `$host$request_uri` to ensure domain-aware caching.  
    {{< /accordion >}}
    

---

### 🗑️ 4. Cache Bypass and Purging (Dev/Test)

{{< accordion "Bypass or purge cache when needed (e.g., on update)" >}}

**Bypass with query param:**

```nginx
proxy_cache_bypass $arg_nocache;
```

**Purge (requires nginx-cache-purge module):**

```nginx
location ~ /purge(/.*) {
    allow 127.0.0.1;
    deny all;
    proxy_cache_purge my_cache "$host$1";
}
```

- Add `?nocache=true` to bypass.
    
- Purge via `curl http://localhost/purge/api/products`.
    
- Only safe on trusted networks.  
    {{< /accordion >}}
    

---

### 🌀 5. Gzip Compression for Faster Transfer

{{< accordion "Compress HTML, CSS, JS, and JSON for reduced bandwidth" >}}

```nginx
gzip on;
gzip_comp_level 5;
gzip_min_length 256;
gzip_types text/plain text/css application/json application/javascript application/xml;
gzip_vary on;
```

- Ideal `gzip_comp_level`: 4–6 (balance speed & size).
    
- `gzip_vary on`: ensures compatibility with caches.
    
- Skip binary files (e.g., images).  
    {{< /accordion >}}
    

---

### 🏁 6. Cache Busting for Versioned Assets

{{< accordion "Force new cache on asset updates using query strings or hashes" >}}

```html
<link rel="stylesheet" href="/style.css?v=2025">
```

Or in NGINX:

```nginx
location ~* \.(?:css|js)$ {
    expires 1y;
    add_header Cache-Control "public";
}
```

- Changing the version forces browsers to re-fetch.
    
- Prevents stale assets after deploys.  
    {{< /accordion >}}
    

---

### ⚙️ 7. Performance Tuning Parameters

{{< accordion "Tune buffers and timeouts for better throughput" >}}

```nginx
client_body_buffer_size 16k;
client_max_body_size 10m;
keepalive_timeout 65;
sendfile on;
tcp_nopush on;
tcp_nodelay on;
```

- `client_max_body_size`: controls upload limits.
    
- `sendfile`: enables kernel-level file sending.
    
- `tcp_nopush` and `tcp_nodelay`: improve packet delivery.  
    {{< /accordion >}}
    

---

### 📊 8. Benchmarking and Validation

{{< accordion "Measure real impact using CLI or browser tools" >}}

```bash
curl -I http://localhost/assets/img.jpg
ab -n 1000 -c 100 http://localhost/api/products
wrk -t4 -c200 -d20s http://localhost/
```

- Check for `Cache-Control`, `X-Cache-Status`, and latency.
    
- Use browser DevTools → Network → Size/Time columns.  
    {{< /accordion >}}
    
