---
title: "NGINX as a Load Balancer Cheatsheet"
description: "Comprehensive guide to configuring NGINX as a high-performance load balancer"
date: 2023-07-18T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX", "Load Balancing"]
cheatsheet_tags: ["nginx", "load balancer", "high availability", "scaling"]
---

## NGINX as a Load Balancer Cheatsheet

### Basic Load Balancing Configuration

```nginx
http {
    # Define an upstream group of servers
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
        server backend3.example.com;
    }
    
    server {
        listen 80;
        server_name example.com;
        
        location / {
            proxy_pass http://backend;
            
            # Basic proxy settings
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Load Balancing Methods

```nginx
upstream backend {
    # Default: Round Robin (no directive needed)
    server backend1.example.com;
    server backend2.example.com;
    
    # Least Connections
    least_conn;
    server backend1.example.com;
    server backend2.example.com;
    
    # IP Hash (session persistence)
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
    
    # Generic Hash
    hash $request_uri consistent;  # Consistent hashing based on URI
    server backend1.example.com;
    server backend2.example.com;
    
    # Random with two choices
    random two least_conn;
    server backend1.example.com;
    server backend2.example.com;
    
    # Least Time (NGINX Plus only)
    least_time header;  # Based on response header time
    # least_time last_byte;  # Based on full response time
    # least_time connect;  # Based on connection time
    server backend1.example.com;
    server backend2.example.com;
}
```

### Server Weights and Parameters

```nginx
upstream backend {
    # Server with weight (default is 1)
    server backend1.example.com weight=5;  # 5x more requests than others
    server backend2.example.com weight=2;  # 2x more requests than default
    server backend3.example.com;           # Default weight is 1
    
    # Backup server (only receives requests when others are down)
    server backup1.example.com backup;
    
    # Server marked as down
    server backend4.example.com down;
    
    # Max fails and fail timeout
    server backend5.example.com max_fails=3 fail_timeout=30s;
    
    # Connection limits
    server backend6.example.com max_conns=100;
    
    # Slow start (NGINX Plus only)
    server backend7.example.com slow_start=30s;
    
    # Custom server parameters
    server backend8.example.com resolve;  # Periodically resolve DNS
    server unix:/var/run/backend.socket;  # Unix socket
}
```

### Health Checks

```nginx
# Passive health checks (built-in)
upstream backend {
    server backend1.example.com max_fails=3 fail_timeout=30s;
    server backend2.example.com max_fails=3 fail_timeout=30s;
}

# Active health checks (NGINX Plus only)
upstream backend {
    zone backend 64k;
    
    server backend1.example.com:8080;
    server backend2.example.com:8080;
    
    # HTTP health check
    health_check uri=/health interval=5s fails=3 passes=2;
    
    # TCP health check
    # health_check interval=5s fails=3 passes=2 type=tcp;
    
    # Custom HTTP health check
    # health_check uri=/status interval=5s fails=3 passes=2 
    #              match=statusok;
}

# Custom match for health check (NGINX Plus only)
match statusok {
    status 200;
    header Content-Type = application/json;
    body ~ '"status": "ok"';
}
```

### Session Persistence

```nginx
# IP Hash (simple session persistence)
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
}

# Hash-based persistence
upstream backend {
    hash $cookie_sessionid consistent;  # Based on session cookie
    server backend1.example.com;
    server backend2.example.com;
}

# Sticky cookie (NGINX Plus only)
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    
    sticky cookie srv_id expires=1h domain=.example.com path=/;
}

# Sticky route (NGINX Plus only)
upstream backend {
    server backend1.example.com route=a;
    server backend2.example.com route=b;
    
    sticky route $route_cookie $route_uri;
}

# Sticky learn (NGINX Plus only)
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
    
    sticky learn create=$upstream_cookie_sessionid
                 lookup=$cookie_sessionid
                 zone=client_sessions:1m
                 timeout=1h;
}
```

### Connection Draining and Graceful Shutdown

```nginx
# Connection draining (NGINX Plus only)
upstream backend {
    zone backend 64k;
    
    server backend1.example.com;
    server backend2.example.com;
    
    # Enable connection draining
    drain_connections 10s;
}

# Graceful shutdown with signal handling
# In your shell:
# nginx -s quit  # Graceful shutdown
```

### Upstream Zones and Runtime Configuration

```nginx
# Shared memory zone for upstream (required for dynamic configuration)
upstream backend {
    zone backend 64k;  # Define shared memory zone
    
    server backend1.example.com;
    server backend2.example.com;
}

# Dynamic configuration with API (NGINX Plus only)
server {
    listen 8080;
    
    location /api {
        api;
        allow 127.0.0.1;
        deny all;
    }
    
    location = /dashboard.html {
        root /usr/share/nginx/html;
    }
}
```

### Advanced Proxy Settings

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend;
        
        # Basic headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # HTTP version and connection header
        proxy_http_version 1.1;
        proxy_set_header Connection "";  # Enable keepalive connections
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering settings
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 32k;
        proxy_busy_buffers_size 64k;
        
        # Temp file settings
        proxy_max_temp_file_size 1024m;
        proxy_temp_file_write_size 64k;
        
        # Error handling
        proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
        proxy_next_upstream_timeout 10s;
        proxy_next_upstream_tries 3;
        
        # SSL backend
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_ssl_verify on;
        proxy_ssl_verify_depth 2;
        proxy_ssl_trusted_certificate /etc/nginx/ssl/trusted_ca.crt;
    }
}
```

### TCP/UDP Load Balancing

```nginx
# Load module for stream
load_module modules/ngx_stream_module.so;

# Stream context for TCP/UDP load balancing
stream {
    # TCP load balancing
    upstream tcp_backend {
        server backend1.example.com:3306 weight=5;
        server backend2.example.com:3306;
        server backend3.example.com:3306 backup;
    }
    
    server {
        listen 3306;
        proxy_pass tcp_backend;
        
        # TCP-specific settings
        proxy_connect_timeout 1s;
        proxy_timeout 10s;
    }
    
    # UDP load balancing
    upstream udp_dns {
        server dns1.example.com:53;
        server dns2.example.com:53;
    }
    
    server {
        listen 53 udp;
        proxy_pass udp_dns;
        
        # UDP-specific settings
        proxy_timeout 20s;
        proxy_responses 1;
    }
}
```

### SSL Termination with Load Balancing

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL certificates
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Forward to backend servers (HTTP)
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTP/2 and HTTP/3 Load Balancing

```nginx
server {
    listen 443 ssl http2;
    # listen 443 quic;  # HTTP/3 (requires NGINX with HTTP/3 support)
    server_name example.com;
    
    # SSL certificates
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # HTTP/2 specific settings
    http2_max_concurrent_streams 128;
    http2_idle_timeout 3m;
    
    # HTTP/3 specific settings (if supported)
    # quic_retry on;
    # add_header Alt-Svc 'h3=":443"; ma=86400';
    
    location / {
        proxy_pass http://backend;
        
        # HTTP/2 backend (if backend supports it)
        proxy_http_version 1.1;  # Still use 1.1 for proxy
        proxy_set_header Connection "";
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### WebSocket Load Balancing

```nginx
upstream ws_backend {
    server ws1.example.com:8080;
    server ws2.example.com:8080;
}

server {
    listen 80;
    server_name ws.example.com;
    
    location /ws/ {
        proxy_pass http://ws_backend;
        
        # WebSocket specific settings
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Longer timeouts for WebSocket
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        
        # Standard headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### gRPC Load Balancing

```nginx
upstream grpc_backend {
    server grpc1.example.com:50051;
    server grpc2.example.com:50051;
}

server {
    listen 443 ssl http2;  # HTTP/2 is required for gRPC
    server_name grpc.example.com;
    
    # SSL certificates
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # gRPC specific location
    location / {
        grpc_pass grpc://grpc_backend;
        
        # gRPC specific settings
        grpc_set_header Host $host;
        grpc_set_header X-Real-IP $remote_addr;
        
        # Timeouts
        grpc_read_timeout 60s;
        grpc_send_timeout 60s;
        grpc_connect_timeout 60s;
    }
}
```

### Load Balancing with Path-Based Routing

```nginx
upstream backend_api {
    server api1.example.com;
    server api2.example.com;
}

upstream backend_web {
    server web1.example.com;
    server web2.example.com;
}

upstream backend_admin {
    server admin1.example.com;
    server admin2.example.com;
}

server {
    listen 80;
    server_name example.com;
    
    # API requests
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://backend_admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Additional security for admin
        allow 192.168.1.0/24;
        deny all;
    }
    
    # Everything else goes to web backend
    location / {
        proxy_pass http://backend_web;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Load Balancing with Host-Based Routing

```nginx
upstream backend_main {
    server main1.internal;
    server main2.internal;
}

upstream backend_blog {
    server blog1.internal;
    server blog2.internal;
}

upstream backend_shop {
    server shop1.internal;
    server shop2.internal;
}

# Main website
server {
    listen 80;
    server_name example.com www.example.com;
    
    location / {
        proxy_pass http://backend_main;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Blog subdomain
server {
    listen 80;
    server_name blog.example.com;
    
    location / {
        proxy_pass http://backend_blog;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Shop subdomain
server {
    listen 80;
    server_name shop.example.com;
    
    location / {
        proxy_pass http://backend_shop;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Monitoring and Statistics

```nginx
# Basic status page
server {
    listen 8080;
    server_name localhost;
    
    location /nginx_status {
        stub_status on;
        allow 127.0.0.1;
        deny all;
    }
}

# Enhanced status dashboard (NGINX Plus only)
server {
    listen 8080;
    server_name localhost;
    
    # API for programmatic access
    location /api {
        api;
        allow 127.0.0.1;
        deny all;
    }
    
    # Dashboard
    location = /dashboard.html {
        root /usr/share/nginx/html;
    }
}
```

### High Availability Setup

```nginx
# Primary load balancer
# /etc/nginx/nginx.conf on primary server

# Keepalived configuration for primary
# /etc/keepalived/keepalived.conf
vrrp_script check_nginx {
    script "pidof nginx"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 101
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass secret
    }
    
    virtual_ipaddress {
        192.168.1.100
    }
    
    track_script {
        check_nginx
    }
}

# Secondary load balancer
# /etc/nginx/nginx.conf on secondary server (identical to primary)

# Keepalived configuration for secondary
# /etc/keepalived/keepalived.conf
vrrp_script check_nginx {
    script "pidof nginx"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state BACKUP
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass secret
    }
    
    virtual_ipaddress {
        192.168.1.100
    }
    
    track_script {
        check_nginx
    }
}
```

### Load Balancing with Content Caching

```nginx
http {
    # Cache definition
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=backend_cache:10m
                     max_size=1g inactive=60m use_temp_path=off;
    
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
    }
    
    server {
        listen 80;
        server_name example.com;
        
        # Cache static content
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            proxy_pass http://backend;
            proxy_cache backend_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_lock on;
            
            # Cache control headers
            add_header X-Cache-Status $upstream_cache_status;
            expires 30d;
        }
        
        # Don't cache dynamic content
        location / {
            proxy_pass http://backend;
            proxy_no_cache 1;
        }
    }
}
```

### Load Balancing Checklist

1. **Basic Configuration**
   - [ ] Define upstream server groups
   - [ ] Configure proxy_pass to upstream
   - [ ] Set appropriate proxy headers
   - [ ] Test basic load balancing functionality

2. **Load Balancing Method**
   - [ ] Choose appropriate load balancing algorithm
     - [ ] Round Robin for general use
     - [ ] Least Connections for varied request processing times
     - [ ] IP Hash for session persistence
     - [ ] Generic Hash for consistent hashing
     - [ ] Random for distributed load

3. **Server Configuration**
   - [ ] Set appropriate server weights
   - [ ] Configure backup servers
   - [ ] Set max_fails and fail_timeout for passive health checks
   - [ ] Configure max_conns for connection limiting
   - [ ] Consider slow_start for new servers (NGINX Plus)

4. **Health Checks**
   - [ ] Configure passive health checks (max_fails, fail_timeout)
   - [ ] Set up active health checks (NGINX Plus)
   - [ ] Define custom health check matches if needed

5. **Session Persistence**
   - [ ] Choose appropriate session persistence method
     - [ ] IP Hash for simple persistence
     - [ ] Cookie-based persistence (NGINX Plus)
     - [ ] Generic Hash for custom persistence

6. **Connection Handling**
   - [ ] Enable keepalive connections to upstream
   - [ ] Configure appropriate timeouts
   - [ ] Set up connection draining (NGINX Plus)

7. **Advanced Proxy Settings**
   - [ ] Configure buffer sizes
   - [ ] Set appropriate timeouts
   - [ ] Configure error handling with proxy_next_upstream
   - [ ] Set up SSL for backend connections if needed

8. **Protocol Support**
   - [ ] Configure HTTP/2 support
   - [ ] Set up WebSocket support if needed
   - [ ] Configure gRPC support if needed
   - [ ] Set up TCP/UDP load balancing if needed

9. **Routing**
   - [ ] Configure path-based routing
   - [ ] Set up host-based routing
   - [ ] Implement any required URL rewriting

10. **Security**
    - [ ] Set up SSL termination
    - [ ] Configure appropriate security headers
    - [ ] Implement access controls
    - [ ] Set up rate limiting

11. **Monitoring and Logging**
    - [ ] Enable status monitoring
    - [ ] Configure detailed logging
    - [ ] Set up dashboard (NGINX Plus)
    - [ ] Implement log analysis

12. **High Availability**
    - [ ] Configure redundant load balancers
    - [ ] Set up Keepalived or similar for failover
    - [ ] Test failover scenarios
    - [ ] Monitor load balancer health
