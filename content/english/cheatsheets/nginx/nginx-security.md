---
title: "NGINX Security Hardening Cheatsheet"
description: "Comprehensive guide to securing NGINX web server against common vulnerabilities and attacks"
date: 2023-07-17T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX", "Security"]
cheatsheet_tags: ["nginx", "security", "hardening", "web server", "ssl"]
---

## NGINX Security Hardening Cheatsheet

### Basic Security Headers

```nginx
server {
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;
    
    # Content Security Policy (CSP)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://trusted-cdn.com; style-src 'self' 'unsafe-inline' https://trusted-cdn.com; img-src 'self' data: https:; font-src 'self' https://trusted-cdn.com; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests;" always;
    
    # Strict Transport Security (HSTS)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

### Hide NGINX Version

```nginx
http {
    # Hide NGINX version
    server_tokens off;
    
    # Custom server header (optional)
    more_set_headers "Server: WebServer";  # Requires headers-more module
}
```

### SSL/TLS Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL certificates
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    
    # DH parameters for DHE ciphers (generate with: openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048)
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # SSL session cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # Early data (0-RTT) - use with caution
    ssl_early_data off;
    
    # Force HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    }
}
```

### Access Restrictions

```nginx
server {
    # IP-based restrictions
    location /admin/ {
        # Allow specific IPs
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;
    }
    
    # Basic authentication
    location /protected/ {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;  # Generate with: htpasswd -c /etc/nginx/.htpasswd username
    }
    
    # Limit methods
    if ($request_method !~ ^(GET|HEAD|POST)$) {
        return 444;  # Connection closed without response
    }
    
    # Block specific user agents
    if ($http_user_agent ~* (Baiduspider|Yandex|msnbot|Scrapy)) {
        return 403;
    }
    
    # Block access to sensitive files
    location ~ \.(git|svn|hg|bzr|cvs)(/|$) {
        deny all;
    }
    
    # Block access to hidden files and directories
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### Rate Limiting

```nginx
http {
    # Define limit zones
    limit_req_zone $binary_remote_addr zone=req_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
    
    server {
        # Apply rate limiting to login page
        location /login {
            limit_req zone=req_limit burst=5 nodelay;
            limit_req_status 429;  # Return 429 Too Many Requests
        }
        
        # Apply connection limiting
        location / {
            limit_conn conn_limit 10;  # 10 connections per IP
            limit_conn_status 429;
        }
        
        # Apply rate limiting to API
        location /api/ {
            limit_req zone=req_limit burst=20 nodelay;
            limit_conn conn_limit 20;
        }
    }
}
```

### File Upload Restrictions

```nginx
server {
    # Restrict file uploads
    location /upload {
        # Limit request body size
        client_max_body_size 10m;
        
        # Increase timeouts for uploads
        client_body_timeout 60s;
        
        # Temporary path for uploaded files
        client_body_temp_path /var/nginx/client_temp;
        
        # Pass to backend
        proxy_pass http://backend;
    }
    
    # Restrict file types
    location ~ ^/upload/.*\.(php|pl|py|rb|sh|cgi)$ {
        deny all;
    }
}
```

### Preventing SQL Injection and XSS

```nginx
server {
    # Basic WAF rules
    
    # Block SQL injection
    if ($query_string ~* "union.*select.*\(") {
        return 403;
    }
    if ($query_string ~* "concat.*\(") {
        return 403;
    }
    
    # Block common attack patterns
    if ($query_string ~* "(<|%3C).*script.*(>|%3E)") {
        return 403;
    }
    if ($query_string ~* "GLOBALS(=|\[|\%[0-9A-Z]{0,2})") {
        return 403;
    }
    if ($query_string ~* "_REQUEST(=|\[|\%[0-9A-Z]{0,2})") {
        return 403;
    }
    
    # Block file inclusion attempts
    if ($query_string ~* "include(_|\s*)\(") {
        return 403;
    }
    if ($query_string ~* "mosConfig_[a-zA-Z_]{1,21}(=|\%3D)") {
        return 403;
    }
    if ($query_string ~* "boot\.ini") {
        return 403;
    }
    if ($query_string ~* "etc/passwd") {
        return 403;
    }
    
    # Block unwanted HTTP methods
    if ($request_method !~ ^(GET|HEAD|POST|PUT|DELETE|OPTIONS)$) {
        return 444;
    }
}
```

### ModSecurity Web Application Firewall

```nginx
# Load ModSecurity module (requires installation)
load_module modules/ngx_http_modsecurity_module.so;

http {
    # Enable ModSecurity
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/main.conf;
    
    server {
        # Enable ModSecurity for specific location
        location / {
            modsecurity on;
            modsecurity_rules '
                SecRuleEngine On
                SecRule ARGS:test "@contains test" "id:1234,deny,status:403"
            ';
        }
    }
}

# /etc/nginx/modsecurity/main.conf example:
# Include the recommended configuration
Include /etc/nginx/modsecurity/modsecurity.conf
# Include OWASP Core Rule Set (CRS)
Include /etc/nginx/modsecurity/owasp-crs/crs-setup.conf
Include /etc/nginx/modsecurity/owasp-crs/rules/*.conf
```

### Secure Cookie Settings

```nginx
server {
    # Secure cookie settings
    proxy_cookie_path / "/; HTTPOnly; Secure; SameSite=strict";
    
    # Set secure cookies for specific applications
    location /app/ {
        proxy_pass http://backend;
        proxy_cookie_path / "/; HTTPOnly; Secure; SameSite=strict";
    }
}
```

### Preventing Information Disclosure

```nginx
server {
    # Disable directory listing
    autoindex off;
    
    # Restrict access to backup and temporary files
    location ~ \.(bak|config|sql|fla|psd|ini|log|sh|inc|swp|dist|old|orig|backup)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Custom error pages
    error_page 401 /error/401.html;
    error_page 403 /error/403.html;
    error_page 404 /error/404.html;
    error_page 500 502 503 504 /error/50x.html;
    
    location ^~ /error/ {
        internal;
        root /var/www/html;
    }
}
```

### Secure File Permissions

```bash
# Set proper ownership
chown -R root:nginx /etc/nginx
chown -R nginx:nginx /var/www/html

# Set proper permissions
chmod -R 550 /etc/nginx
chmod -R 550 /var/www/html
chmod -R 550 /usr/share/nginx/html

# Set proper permissions for SSL files
chmod 400 /etc/nginx/ssl/private.key
chmod 444 /etc/nginx/ssl/certificate.crt
```

### Secure NGINX Configuration

```nginx
# Run NGINX as a non-root user
user nginx;

# Set worker processes and connections
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 1024;
    multi_accept on;
}

http {
    # Security-related settings
    server_tokens off;
    
    # Buffer overflow prevention
    client_body_buffer_size 16k;
    client_header_buffer_size 1k;
    client_max_body_size 10m;
    large_client_header_buffers 2 1k;
    
    # Timeouts
    client_body_timeout 10;
    client_header_timeout 10;
    keepalive_timeout 5 5;
    send_timeout 10;
    
    # File upload settings
    client_body_temp_path /var/nginx/client_temp;
    proxy_temp_path /var/nginx/proxy_temp;
    fastcgi_temp_path /var/nginx/fastcgi_temp;
    uwsgi_temp_path /var/nginx/uwsgi_temp;
    scgi_temp_path /var/nginx/scgi_temp;
    
    # Disable potentially dangerous MIME types
    include mime.types;
    default_type application/octet-stream;
    types {
        application/x-httpd-php php php5 phtml;
        application/x-perl pl;
        application/x-python py;
        application/x-ruby rb;
        application/x-shellscript sh;
    }
}
```

### Secure FastCGI Settings

```nginx
server {
    location ~ \.php$ {
        # Verify the file exists before passing to PHP
        try_files $uri =404;
        
        # FastCGI settings
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Security headers
        fastcgi_param HTTP_PROXY "";  # Mitigate httpoxy vulnerability
        
        # Timeouts
        fastcgi_read_timeout 60s;
        fastcgi_send_timeout 60s;
        fastcgi_connect_timeout 60s;
        
        # Buffer settings
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
    }
}
```

### Secure Proxy Settings

```nginx
server {
    location / {
        # Proxy settings
        proxy_pass http://backend;
        
        # Security headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        
        # Prevent httpoxy vulnerability
        proxy_set_header HTTP_PROXY "";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffer_size 16k;
        proxy_buffers 4 16k;
        proxy_busy_buffers_size 24k;
        proxy_temp_file_write_size 24k;
        
        # Don't pass unauthorized headers to backend
        proxy_pass_request_headers on;
        proxy_hide_header X-Powered-By;
        proxy_hide_header X-AspNet-Version;
        proxy_hide_header X-Runtime;
    }
}
```

### Monitoring and Logging

```nginx
http {
    # Define log format with security-relevant fields
    log_format security '$remote_addr - $remote_user [$time_local] "$request" '
                       '$status $body_bytes_sent "$http_referer" '
                       '"$http_user_agent" "$http_x_forwarded_for" '
                       '"$request_id" "$http_host" "$request_time"';
    
    # Enable access logging
    access_log /var/log/nginx/access.log security;
    
    # Enable error logging
    error_log /var/log/nginx/error.log warn;
    
    server {
        # Log suspicious requests separately
        location ~ \.(php|aspx|jsp|cgi)$ {
            access_log /var/log/nginx/suspicious.log security;
            return 404;
        }
    }
}
```

### Security Checklist

1. **Basic Security**
   - [ ] Hide NGINX version (server_tokens off)
   - [ ] Implement security headers (X-Content-Type-Options, X-Frame-Options, etc.)
   - [ ] Configure Content Security Policy (CSP)
   - [ ] Enable HTTP Strict Transport Security (HSTS)
   - [ ] Disable directory listing (autoindex off)

2. **SSL/TLS**
   - [ ] Use strong SSL protocols (TLSv1.2, TLSv1.3)
   - [ ] Configure secure ciphers
   - [ ] Generate and use strong DH parameters
   - [ ] Enable OCSP stapling
   - [ ] Configure SSL session cache
   - [ ] Disable SSL session tickets
   - [ ] Force HTTPS redirection

3. **Access Control**
   - [ ] Implement IP-based restrictions for sensitive areas
   - [ ] Use basic authentication where appropriate
   - [ ] Limit allowed HTTP methods
   - [ ] Block access to sensitive files and directories
   - [ ] Block unwanted user agents and referrers

4. **Rate Limiting**
   - [ ] Implement request rate limiting
   - [ ] Implement connection limiting
   - [ ] Apply stricter limits to login and API endpoints
   - [ ] Configure appropriate status codes for rate limiting

5. **File Upload Security**
   - [ ] Limit upload file size
   - [ ] Restrict allowed file types
   - [ ] Configure appropriate timeouts for uploads
   - [ ] Set secure temporary paths for uploaded files

6. **Protection Against Common Attacks**
   - [ ] Implement basic WAF rules or ModSecurity
   - [ ] Block SQL injection patterns
   - [ ] Block XSS attack patterns
   - [ ] Block file inclusion attempts
   - [ ] Configure secure cookie settings

7. **Information Disclosure**
   - [ ] Disable directory listing
   - [ ] Block access to backup and temporary files
   - [ ] Configure custom error pages
   - [ ] Hide server information headers

8. **File Permissions**
   - [ ] Set proper ownership for NGINX files
   - [ ] Set proper permissions for web content
   - [ ] Secure SSL certificate files
   - [ ] Secure configuration files

9. **NGINX Configuration**
   - [ ] Run NGINX as a non-root user
   - [ ] Configure appropriate buffer sizes
   - [ ] Set reasonable timeouts
   - [ ] Configure secure temporary paths
   - [ ] Disable dangerous MIME types

10. **Monitoring and Logging**
    - [ ] Configure detailed logging format
    - [ ] Log security-relevant information
    - [ ] Set up separate logs for suspicious requests
    - [ ] Implement log rotation
    - [ ] Consider log analysis tools

11. **Regular Maintenance**
    - [ ] Keep NGINX updated
    - [ ] Regularly review and update security configurations
    - [ ] Monitor security advisories
    - [ ] Perform security audits
    - [ ] Test configuration with security scanning tools
