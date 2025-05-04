---
title: "NGINX as a Load Balancer Cheatsheet"
description: "Comprehensive guide to configuring NGINX as a high-performance load balancer"
date: 2023-07-18T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX", "Load Balancing"]
cheatsheet_tags: ["nginx", "load balancer", "high availability", "scaling"]
---
## ⚖️ NGINX Cheatsheet: Load Balancing (Full Reference)

---

### 🔁 1. Round-Robin Load Balancing

{{< accordion "Distribute requests evenly across backend servers" >}}

```nginx
upstream app_servers {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    listen 80;

    location / {
        proxy_pass http://app_servers;
    }
}
```

- Default behavior: NGINX distributes requests one by one across all servers.
    
- Simple and fast, ideal for equal-capacity backends.  
    {{< /accordion >}}
    

---

### 📉 2. Least Connections Method

{{< accordion "Send requests to the backend with the fewest active connections" >}}

```nginx
upstream app_servers {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

- Ideal when backend servers have varying response times or workloads.
    
- Reduces overload on busy servers.  
    {{< /accordion >}}
    

---

### 📍 3. IP Hashing for Sticky Sessions

{{< accordion "Route requests from the same client to the same backend" >}}

```nginx
upstream app_servers {
    ip_hash;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

- Based on client IP address.
    
- Ensures session consistency (e.g., login session).
    
- Not reliable behind proxies unless `real_ip_module` is used.  
    {{< /accordion >}}
    

---

### 🧠 4. Custom Sticky Sessions via Cookie

{{< accordion "Use cookies to ensure session stickiness manually" >}}

```nginx
map $cookie_user_id $sticky_backend {
    default backend1;
    "u123" backend2;
}

upstream backend1 {
    server 127.0.0.1:3001;
}

upstream backend2 {
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://$sticky_backend;
    }
}
```

- More fine-grained control than `ip_hash`.
    
- Can implement custom logic based on user ID or token.  
    {{< /accordion >}}
    

---

### 🏥 5. Basic Health Checks (NGINX Plus or OpenResty)

{{< accordion "Detect and avoid unresponsive backends" >}}

**NGINX OSS (passive):**

```nginx
upstream app_servers {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

- Passive only: unhealthy servers are removed after failed responses.
    

**NGINX Plus (active):**

```nginx
upstream app_servers {
    zone backends 64k;

    server 127.0.0.1:3001;
    server 127.0.0.1:3002;

    health_check interval=5 fails=3 passes=2;
}
```

- Requires **NGINX Plus**.
    
- Use `health_check` to actively probe backends.  
    {{< /accordion >}}
    

---

### 🚫 6. Marking Servers as Backup

{{< accordion "Use backup servers when primary backends are down" >}}

```nginx
upstream app_servers {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003 backup;
}
```

- The third server is only used if the others fail.
    
- Useful for fault tolerance.  
    {{< /accordion >}}
    

---

### 📦 7. Load Balancing Multiple Applications

{{< accordion "Balance requests for different apps via different upstreams" >}}

```nginx
upstream app1_servers {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

upstream app2_servers {
    server 127.0.0.1:4001;
    server 127.0.0.1:4002;
}

server {
    location /app1/ {
        proxy_pass http://app1_servers;
    }

    location /app2/ {
        proxy_pass http://app2_servers;
    }
}
```

- Isolate backend groups per application.
    
- Clean, scalable architecture.  
    {{< /accordion >}}
    

---

### ⏱ 8. Timeout and Retry Controls

{{< accordion "Handle failed connections and response delays" >}}

```nginx
proxy_connect_timeout 5s;
proxy_send_timeout    10s;
proxy_read_timeout    10s;
proxy_next_upstream error timeout http_500;
```

- `proxy_next_upstream`: retry on errors or timeouts.
    
- Improves reliability during intermittent failures.  
    {{< /accordion >}}
    

---

### 🔍 9. Logging Which Backend Was Used

{{< accordion "Debug which upstream server handled a request" >}}

```nginx
log_format upstreamlog '$remote_addr to $upstream_addr via $request';

access_log /var/log/nginx/upstream.log upstreamlog;
```

- Helps in debugging and traffic analysis.
    
- `$upstream_addr` shows which backend responded.  
    {{< /accordion >}}
    

---

### 📊 10. Load Testing the Balancer

{{< accordion "Use tools like ab or wrk to test performance" >}}

```bash
ab -n 1000 -c 100 http://localhost/
wrk -t4 -c100 -d30s http://localhost/
```

- Validate your load balancer handles concurrency properly.
    
- Monitor CPU, memory, and response times during test.  
    {{< /accordion >}}