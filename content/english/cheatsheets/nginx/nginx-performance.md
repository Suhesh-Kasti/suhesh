---
title: "NGINX Performance Optimization Cheatsheet"
description: "Comprehensive guide to optimizing NGINX for maximum performance and throughput"
date: 2023-07-16T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX", "Performance"]
cheatsheet_tags: ["nginx", "performance", "optimization", "caching", "tuning"]
---

## NGINX Performance Optimization Cheatsheet

### Worker Processes and Connections

```nginx
# Set worker processes to auto or number of CPU cores
worker_processes auto;  # Automatically detect number of CPU cores
# worker_processes 4;   # Or set explicitly to number of CPU cores

# Bind worker processes to CPU cores (CPU affinity)
worker_cpu_affinity auto;
# worker_cpu_affinity 0001 0010 0100 1000;  # For 4 workers on 4 cores

# Set worker priority (-20 to 19, lower is higher priority)
worker_priority -10;

# Set worker connections (max connections per worker)
events {
    worker_connections 10240;    # Increase for high traffic sites
    multi_accept on;             # Accept multiple connections at once
    use epoll;                   # Use efficient connection method on Linux
}

# Increase worker file limits
worker_rlimit_nofile 65535;      # Maximum number of open files
```

### Connection Handling Optimization

```nginx
http {
    # Timeouts
    keepalive_timeout 65;        # Keep-alive connection timeout
    keepalive_requests 1000;     # Requests per keep-alive connection
    send_timeout 10;             # Response transmission timeout
    client_body_timeout 12;      # Client body read timeout
    client_header_timeout 12;    # Client header read timeout
    
    # Buffer sizes
    client_body_buffer_size 16k;     # Client body buffer size
    client_header_buffer_size 1k;    # Client header buffer size
    client_max_body_size 10m;        # Maximum client body size
    large_client_header_buffers 4 8k; # Large client header buffers
    
    # Output buffering
    output_buffers 2 32k;        # Output buffers for serving files
    postpone_output 1460;        # Postpone output until buffer is full
    
    # File I/O optimizations
    sendfile on;                 # Use sendfile for file transfers
    tcp_nopush on;               # Optimize sendfile packets
    tcp_nodelay on;              # Disable Nagle's algorithm
    directio 4m;                 # Direct I/O for files larger than 4MB
    directio_alignment 512;      # Alignment for directio
    
    # Connection processing method
    use epoll;                   # Use epoll on Linux
    # use kqueue;                # Use kqueue on FreeBSD/macOS
    
    # File descriptor caching
    open_file_cache max=10000 inactive=30s;  # Cache file descriptors
    open_file_cache_valid 60s;   # Revalidate cache entries
    open_file_cache_min_uses 2;  # Minimum uses before caching
    open_file_cache_errors on;   # Cache errors like "file not found"
}
```

### Compression Settings

```nginx
http {
    # Enable gzip compression
    gzip on;
    gzip_comp_level 5;           # Compression level (1-9, higher = more CPU)
    gzip_min_length 256;         # Minimum length to compress
    gzip_proxied any;            # Compress for all proxied requests
    gzip_vary on;                # Add Vary: Accept-Encoding header
    
    # Compress specific MIME types
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rss+xml
        application/vnd.geo+json
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/bmp
        image/svg+xml
        image/x-icon
        text/cache-manifest
        text/css
        text/plain
        text/vcard
        text/vnd.rim.location.xloc
        text/vtt
        text/x-component
        text/x-cross-domain-policy;
    
    # Disable gzip for IE6
    gzip_disable "msie6";
    
    # Enable Brotli compression (if module is installed)
    # brotli on;
    # brotli_comp_level 6;       # Compression level (0-11)
    # brotli_types text/plain text/css application/javascript application/json;
}
```

### Static Content Optimization

```nginx
server {
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;                     # Set expires header
        add_header Cache-Control "public, no-transform"; # Cache control
        access_log off;                  # Disable access log for static files
        log_not_found off;               # Don't log missing static files
        tcp_nodelay off;                 # Enable Nagle's algorithm for small files
    }
    
    # Serve pre-compressed files if available
    location ~* \.(js|css|xml|txt|json)$ {
        gzip_static on;                  # Serve pre-compressed .gz files
        # brotli_static on;              # Serve pre-compressed .br files
        expires 30d;
    }
    
    # Optimize image delivery
    location ~* \.(jpg|jpeg|png|gif|webp)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri$webp_suffix $uri =404; # Try WebP version first
    }
}
```

### Caching Configuration

```nginx
http {
    # Proxy cache configuration
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=PROXYCACHE:10m
                     max_size=10g inactive=60m use_temp_path=off;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_valid 200 302 10m;       # Cache successful responses
    proxy_cache_valid 404 1m;            # Cache not found responses
    proxy_cache_lock on;                 # Lock cache during updates
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;    # Update cache in background
    
    # FastCGI cache configuration
    fastcgi_cache_path /var/cache/nginx/fastcgi levels=1:2 keys_zone=FASTCGICACHE:10m
                       max_size=10g inactive=60m use_temp_path=off;
    fastcgi_cache_key "$scheme$request_method$host$request_uri";
    fastcgi_cache_valid 200 302 10m;     # Cache successful responses
    fastcgi_cache_valid 404 1m;          # Cache not found responses
    fastcgi_cache_lock on;               # Lock cache during updates
    fastcgi_cache_use_stale error timeout updating invalid_header http_500 http_503;
    fastcgi_cache_background_update on;  # Update cache in background
    
    server {
        # Implement proxy cache in a location
        location / {
            proxy_pass http://backend;
            proxy_cache PROXYCACHE;
            proxy_cache_bypass $http_cache_control;  # Bypass cache with header
            add_header X-Cache-Status $upstream_cache_status;  # Debug header
        }
        
        # Implement FastCGI cache for PHP
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
            fastcgi_cache FASTCGICACHE;
            fastcgi_cache_bypass $http_cache_control;  # Bypass cache with header
            add_header X-Cache-Status $upstream_cache_status;  # Debug header
            include fastcgi_params;
        }
        
        # Skip caching for dynamic content
        set $skip_cache 0;
        
        # Don't cache authenticated requests
        if ($http_cookie ~* "wordpress_logged_in") {
            set $skip_cache 1;
        }
        
        # Don't cache POST requests
        if ($request_method = POST) {
            set $skip_cache 1;
        }
        
        # Don't cache admin or login pages
        if ($request_uri ~* "/wp-admin/|/wp-login.php") {
            set $skip_cache 1;
        }
        
        # Apply cache skipping
        fastcgi_cache_bypass $skip_cache;
        fastcgi_no_cache $skip_cache;
    }
}
```

### Microcaching for Dynamic Content

```nginx
http {
    # Microcaching configuration (cache for a few seconds)
    proxy_cache_path /var/cache/nginx/microcache levels=1:2 keys_zone=MICROCACHE:10m
                     max_size=1g inactive=1m use_temp_path=off;
    
    server {
        # Implement microcaching
        location / {
            proxy_pass http://backend;
            proxy_cache MICROCACHE;
            proxy_cache_valid 200 1s;    # Cache for just 1 second
            proxy_cache_lock on;
            proxy_cache_use_stale updating error timeout http_500 http_502 http_503 http_504;
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

### Load Balancing Optimization

```nginx
http {
    # Upstream server configuration
    upstream backend {
        # Load balancing methods
        least_conn;                  # Least connections method
        # ip_hash;                   # IP hash method
        # hash $request_uri;         # URI hash method
        # random two least_conn;     # Random with two choices
        
        # Server configuration
        server backend1.example.com max_fails=3 fail_timeout=30s;
        server backend2.example.com max_fails=3 fail_timeout=30s;
        server backend3.example.com backup;  # Backup server
        
        # Persistent connections to upstream
        keepalive 32;                # Keep-alive connections
        keepalive_requests 1000;     # Requests per connection
        keepalive_timeout 60s;       # Keep-alive timeout
    }
    
    server {
        location / {
            proxy_pass http://backend;
            
            # Optimize proxy connection settings
            proxy_http_version 1.1;              # Use HTTP/1.1 for upstream
            proxy_set_header Connection "";      # Enable keep-alive
            
            # Buffering settings
            proxy_buffering on;                  # Enable buffering
            proxy_buffer_size 8k;                # Buffer size for headers
            proxy_buffers 8 32k;                 # Buffers for response body
            proxy_busy_buffers_size 64k;         # Busy buffers size
            proxy_max_temp_file_size 1024m;      # Max temp file size
            proxy_temp_file_write_size 64k;      # Temp file write size
            
            # Timeouts
            proxy_connect_timeout 60s;           # Connect timeout
            proxy_send_timeout 60s;              # Send timeout
            proxy_read_timeout 60s;              # Read timeout
        }
    }
}
```

### SSL/TLS Optimization

```nginx
http {
    # SSL session caching
    ssl_session_cache shared:SSL:10m;    # Shared cache up to 10MB
    ssl_session_timeout 10m;             # Session timeout
    ssl_session_tickets off;             # Disable TLS session tickets
    
    # SSL protocols and ciphers
    ssl_protocols TLSv1.2 TLSv1.3;       # Only use TLS 1.2 and 1.3
    ssl_prefer_server_ciphers on;        # Prefer server ciphers
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-CHACHA20-POLY1305';
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # SSL buffer size
    ssl_buffer_size 8k;                  # Optimize SSL buffer size
    
    # HTTP/2 and HTTP/3 settings
    http2_max_concurrent_streams 128;    # Max concurrent HTTP/2 streams
    http2_idle_timeout 3m;               # HTTP/2 idle timeout
    
    # Enable HTTP/3 (if module is installed)
    # listen 443 quic reuseport;         # QUIC/HTTP/3 listener
    # http3_max_concurrent_streams 128;  # Max concurrent HTTP/3 streams
    
    server {
        listen 443 ssl http2;
        # listen 443 quic;               # HTTP/3 listener
        
        # SSL certificate configuration
        ssl_certificate /etc/nginx/ssl/example.com.crt;
        ssl_certificate_key /etc/nginx/ssl/example.com.key;
        
        # Add HTTP/3 Alt-Svc header
        # add_header Alt-Svc 'h3=":443"; ma=86400';
    }
}
```

### Logging Optimization

```nginx
http {
    # Define a minimal log format
    log_format minimal '$remote_addr - $status $request_time $request';
    
    # Define a detailed log format
    log_format detailed '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $body_bytes_sent '
                       '"$http_referer" "$http_user_agent" '
                       '$request_time $upstream_response_time $pipe';
    
    # Buffer logs for better performance
    access_log /var/log/nginx/access.log minimal buffer=32k flush=1m;
    
    # Disable logs for specific locations
    server {
        location ~* \.(jpg|jpeg|gif|png|ico|css|js|svg|woff|woff2)$ {
            access_log off;
            log_not_found off;
        }
        
        # Use different log format for API
        location /api/ {
            access_log /var/log/nginx/api_access.log detailed;
        }
    }
}
```

### Rate Limiting

```nginx
http {
    # Define limit zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    server {
        # Apply rate limiting to API
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;  # Allow 20 request burst
            limit_conn conn_limit 10;                   # 10 connections per IP
        }
        
        # Apply rate limiting with status code
        location /login/ {
            limit_req zone=api_limit burst=5 nodelay;
            limit_req_status 429;                       # Return 429 Too Many Requests
        }
    }
}
```

### System-Level Optimizations

```bash
# Increase system file limits
echo "fs.file-max = 65536" >> /etc/sysctl.conf

# Increase TCP connection limits
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
echo "net.core.netdev_max_backlog = 65536" >> /etc/sysctl.conf

# TCP keepalive settings
echo "net.ipv4.tcp_keepalive_time = 600" >> /etc/sysctl.conf
echo "net.ipv4.tcp_keepalive_intvl = 60" >> /etc/sysctl.conf
echo "net.ipv4.tcp_keepalive_probes = 5" >> /etc/sysctl.conf

# TCP timeouts
echo "net.ipv4.tcp_fin_timeout = 30" >> /etc/sysctl.conf

# Apply changes
sysctl -p

# Increase user limits for nginx user
echo "nginx soft nofile 65536" >> /etc/security/limits.conf
echo "nginx hard nofile 65536" >> /etc/security/limits.conf
```

### Performance Testing and Monitoring

```bash
# Test NGINX configuration
nginx -t

# Reload NGINX configuration
nginx -s reload

# Benchmark with ApacheBench
ab -n 1000 -c 100 https://example.com/

# Benchmark with wrk
wrk -t12 -c400 -d30s https://example.com/

# Monitor NGINX status (requires stub_status module)
curl http://localhost/nginx_status

# Monitor NGINX with ngxtop
ngxtop -l /var/log/nginx/access.log

# Check open file descriptors
lsof -p $(pgrep -f "nginx: master") | wc -l

# Check connection states
netstat -an | grep :80 | awk '{print $6}' | sort | uniq -c
```

### Performance Checklist

1. **Worker Processes and Connections**
   - [ ] Set worker_processes to match CPU cores
   - [ ] Configure worker_connections based on available memory
   - [ ] Enable multi_accept for high traffic sites
   - [ ] Set appropriate worker_rlimit_nofile

2. **Connection Handling**
   - [ ] Configure appropriate timeouts
   - [ ] Optimize buffer sizes
   - [ ] Enable sendfile, tcp_nopush, and tcp_nodelay
   - [ ] Configure open_file_cache

3. **Compression**
   - [ ] Enable gzip compression
   - [ ] Set appropriate compression level
   - [ ] Configure compression for specific MIME types
   - [ ] Consider Brotli compression for better performance

4. **Static Content**
   - [ ] Set appropriate expires headers
   - [ ] Configure Cache-Control headers
   - [ ] Disable logging for static files
   - [ ] Use gzip_static for pre-compressed files

5. **Caching**
   - [ ] Implement proxy_cache or fastcgi_cache
   - [ ] Configure microcaching for dynamic content
   - [ ] Set appropriate cache key and validity
   - [ ] Configure cache bypass conditions

6. **Load Balancing**
   - [ ] Choose appropriate load balancing method
   - [ ] Configure upstream keepalive connections
   - [ ] Set appropriate timeouts and buffer sizes
   - [ ] Configure health checks and failure handling

7. **SSL/TLS**
   - [ ] Enable SSL session cache
   - [ ] Use modern protocols and ciphers
   - [ ] Enable OCSP stapling
   - [ ] Optimize SSL buffer size
   - [ ] Enable HTTP/2 and consider HTTP/3

8. **Logging**
   - [ ] Use minimal log format for general logging
   - [ ] Buffer logs for better performance
   - [ ] Disable logging for static files
   - [ ] Use detailed logging only where necessary

9. **System-Level**
   - [ ] Increase system file limits
   - [ ] Optimize TCP connection parameters
   - [ ] Configure user limits for NGINX
   - [ ] Consider using tmpfs for temporary files

10. **Monitoring and Testing**
    - [ ] Implement status monitoring
    - [ ] Regularly benchmark performance
    - [ ] Monitor resource usage
    - [ ] Test configuration changes before deployment
