---
title: "NGINX as a Load Balancer Cheatsheet"
description: "Comprehensive guide to configuring NGINX as a high-performance load balancer"
date: 2023-07-18T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["NGINX"]
cheatsheet_tags: ["nginx", "load balancer", "high availability", "scaling"]
---
## 📊 NGINX Cheatsheet: Logging & Monitoring (Full Reference)

---

### 📝 1. Basic Access and Error Logs

{{< accordion "Configure standard access and error logs" >}}

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;

    location / {
        root /var/www/html;
    }
}
```

- Default log format logs client requests and server responses.
    
- `error_log` levels: `debug`, `info`, `notice`, `warn`, `error`, `crit`.
    
- Adjust log levels based on the level of detail needed (`warn` is common for production).  
    {{< /accordion >}}
    

---

### 🛠️ 2. Custom Log Format

{{< accordion "Define custom log format for more granular information" >}}

```nginx
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log main;
```

- Customize logs to track more or fewer details (e.g., `request_time`, `upstream_response_time`).
    
- You can track IP, time, method, referrer, and more.
    
- Useful for advanced metrics, including request timing and upstream performance.  
    {{< /accordion >}}
    

---

### 🔄 3. Logging with Conditional Filters

{{< accordion "Log only specific types of requests (e.g., errors, slow requests)" >}}

```nginx
if ($status = 404) {
    access_log /var/log/nginx/404.log main;
}

if ($request_time > 1) {
    access_log /var/log/nginx/slow_requests.log main;
}
```

- Log specific requests based on status code (e.g., 404 errors).
    
- Log requests that take longer than a defined threshold (e.g., 1 second).
    
- Helps isolate problematic areas (e.g., slow requests, broken links).  
    {{< /accordion >}}
    

---

### 🖥️ 4. Enable Debug Logging

{{< accordion "Enable debug-level logging for detailed troubleshooting" >}}

```nginx
error_log /var/log/nginx/error.log debug;
```

- `debug` provides very granular logs, including everything NGINX does.
    
- **Use with caution**: High overhead and may expose sensitive info.
    
- Ideal for troubleshooting during development or issue investigation.  
    {{< /accordion >}}
    

---

### 🌐 5. Log Rotation

{{< accordion "Ensure log files don't fill up disk space" >}}

```nginx
# /etc/logrotate.d/nginx

/var/log/nginx/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 640 www-data adm
}
```

- Rotate logs daily, keep the last 7 days, and compress old logs.
    
- Prevents log files from growing indefinitely.
    
- `create 640` ensures proper file permissions after rotation.  
    {{< /accordion >}}
    

---

### 📉 6. Monitoring with Prometheus & Grafana

{{< accordion "Monitor NGINX performance with Prometheus and Grafana" >}}

**Install NGINX Prometheus Exporter:**

```bash
sudo apt install prometheus-nginx-exporter
```

**Configure NGINX to expose stats:**

```nginx
server {
    listen 127.0.0.1:8080;

    location /metrics {
        stub_status on;
        access_log off;
    }
}
```

- Exposes NGINX metrics at `/metrics` (e.g., active connections, requests per second).
    
- Prometheus collects the data, and Grafana visualizes it in real time.
    
- Metrics can be queried with `nginx_connections`, `nginx_http_requests`, etc.
    

**Grafana Dashboard Example:**

- Use pre-built NGINX dashboards available on Grafana’s marketplace.
    
- Custom dashboards track uptime, traffic volume, error rates, and more.  
    {{< /accordion >}}
    

---

### 🛠️ 7. Integrating with ELK Stack (Elasticsearch, Logstash, Kibana)

{{< accordion "Centralized logging with ELK Stack" >}}

**Install Filebeat (log shipper):**

```bash
sudo apt install filebeat
```

**Configure Filebeat to forward NGINX logs to Logstash:**

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/nginx/*.log

output.logstash:
  hosts: ["localhost:5044"]
```

**Logstash Configuration Example:**

```bash
input {
  beats {
    port => 5044
  }
}

filter {
  if "nginx" in [fileset][module] {
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
  }
}
```

- Collect logs from NGINX with Filebeat and send them to Logstash for parsing.
    
- Logstash filters and processes logs, sending them to Elasticsearch.
    
- Use Kibana to visualize logs and gain insights into traffic patterns, errors, and more.
    

**Kibana Example Dashboards:**

- Visualize traffic sources, request rates, error rates, and backend performance.
    
- Set up alerts to notify when a threshold is crossed (e.g., spike in 404 errors).  
    {{< /accordion >}}
    

---

### 📈 8. Real-Time Traffic and Resource Monitoring with `htop` & `netstat`

{{< accordion "Monitor system resources and connections live" >}}

```bash
htop
```

- View live CPU, memory, disk I/O, and process information.
    
- Check NGINX worker processes and their resource usage.
    

```bash
netstat -tulnp | grep nginx
```

- Monitor live connections to NGINX and the ports it’s listening on.
    
- Check for potential issues such as a large number of active connections.
    

**Use `top` for overall system performance and `lsof` to check open files:**

```bash
lsof -i | grep nginx
```

- Useful for debugging socket usage or identifying too many open file handles.  
    {{< /accordion >}}
    

---

### 🧩 9. Real-Time NGINX Performance Metrics with `ngxtop`

{{< accordion "Monitor NGINX with a real-time command-line tool" >}}

**Install `ngxtop`:**

```bash
pip install ngxtop
```

**Start monitoring:**

```bash
ngxtop -l /var/log/nginx/access.log
```

- `ngxtop` provides real-time metrics on NGINX's HTTP traffic, showing things like:
    
    - Requests per second.
        
    - Response codes.
        
    - Most popular URLs.
        
- Great for real-time monitoring from the command line.  
    {{< /accordion >}}
    

---

### 🛠️ 10. Troubleshooting NGINX Performance

{{< accordion "Identify slow or faulty requests with log analysis" >}}

**Common Issues:**

- Slow responses → Check backend performance (e.g., database queries, server load).
    
- 502/504 Gateway Errors → Check upstream server status.
    
- 404 Errors → Ensure correct path, URI, or file exists.
    

**Use `tail -f` to watch logs:**

```bash
tail -f /var/log/nginx/access.log
```

- Monitor traffic and look for slow or problematic requests.
    
- Use `grep` to filter for specific status codes or user agents.
    

**NGINX Status Page (`stub_status`):**

```nginx
server {
    listen 8080;
    location /status {
        stub_status on;
        access_log off;
    }
}
```

- View active connections, requests per second, and more.
    
- Access this by visiting `http://yourdomain.com/status`.  
    {{< /accordion >}}
    
