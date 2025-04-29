---
title: "NGINX Configuration Cheatsheet"
description: "Essential guide to NGINX configuration syntax, directives, and context hierarchy"
date: 2023-07-15T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX"]
cheatsheet_tags: ["nginx", "configuration", "web server"]
---

## NGINX Configuration Cheatsheet

#### 1. Configuration File Structure

{{< accordion "NGINX Configuration File Locations" >}}
NGINX configuration files are located in:
- `/etc/nginx/` - Main configuration directory
- `/etc/nginx/nginx.conf` - Main configuration file
- `/etc/nginx/conf.d/` - Additional configuration files
- `/etc/nginx/sites-available/` - Available site configurations
- `/etc/nginx/sites-enabled/` - Enabled site configurations (symlinks)
{{< /accordion >}}

#### 2. Basic Configuration Syntax

{{< accordion "NGINX Configuration Syntax Basics" >}}
```nginx
# This is a comment
directive value;                    # Simple directive
directive value1 value2;            # Directive with multiple parameters

block_directive {                   # Block directive
    directive1 value1;
    directive2 value2;
}

block_directive value {             # Block directive with parameter
    directive1 value1;
    directive2 value2;
}
```
{{< /accordion >}}

#### 3. Configuration Contexts

{{< accordion "NGINX Configuration Hierarchy and Contexts" >}}
NGINX configuration is organized in a hierarchical structure of contexts:

```nginx
# Main context (global configuration)
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# Events context
events {
    worker_connections 1024;
}

# HTTP context
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Server context
    server {
        listen 80;
        server_name example.com;

        # Location context
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }

    # Another server block
    server {
        listen 443 ssl;
        server_name secure.example.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            root /usr/share/nginx/secure;
            index index.html;
        }
    }
}

# Mail context (for mail proxy functionality)
mail {
    # Mail server configuration
}

# Stream context (for TCP/UDP proxy functionality)
stream {
    # Stream server configuration
}
```

Context Hierarchy:

1. **Main/Global Context**: The outermost context for global configurations
2. **Events Context**: Controls connection processing behavior
3. **HTTP Context**: Contains all HTTP-related directives
   - **Server Context**: Defines a virtual server
     - **Location Context**: Defines how to handle specific URI patterns
       - **If Block**: Conditional processing within a location
   - **Upstream Context**: Defines a group of servers for load balancing
4. **Mail Context**: For mail proxy functionality
5. **Stream Context**: For TCP/UDP proxy functionality
{{< /accordion >}}

#### 4. Common Directives by Context

{{< accordion "Main Context Directives" >}}
```nginx
user nginx;                      # User and group for worker processes
worker_processes auto;           # Number of worker processes
worker_rlimit_nofile 65535;      # Maximum number of open files
pid /var/run/nginx.pid;          # Path to the PID file
error_log /var/log/nginx/error.log warn;  # Error log path and level
```
{{< /accordion >}}

{{< accordion "Events Context Directives" >}}
```nginx
events {
    worker_connections 1024;     # Maximum connections per worker
    multi_accept on;             # Accept multiple connections at once
    use epoll;                   # Connection processing method
}
```
{{< /accordion >}}

{{< accordion "HTTP Context Directives" >}}
```nginx
http {
    include /etc/nginx/mime.types;       # Include MIME types
    default_type application/octet-stream;  # Default MIME type

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;  # Access log path and format

    sendfile on;                 # Use sendfile for file transfers
    tcp_nopush on;               # Optimize sendfile packets
    tcp_nodelay on;              # Disable Nagle's algorithm

    keepalive_timeout 65;        # Keep-alive connection timeout
    types_hash_max_size 2048;    # Size of MIME types hash table

    gzip on;                     # Enable gzip compression
    gzip_types text/plain text/css application/javascript;  # Compress these types
}
```
{{< /accordion >}}

{{< accordion "Server Context Directives" >}}
```nginx
server {
    listen 80;                   # Listen on port 80
    server_name example.com;     # Server name

    root /usr/share/nginx/html;  # Document root
    index index.html index.htm;  # Default index files

    error_page 404 /404.html;    # Custom error page
    error_page 500 502 503 504 /50x.html;  # Custom error pages for 5xx

    client_max_body_size 10M;    # Maximum client request body size
}
```
{{< /accordion >}}

{{< accordion "Location Context Directives" >}}
```nginx
location / {
    root /usr/share/nginx/html;  # Document root for this location
    index index.html;            # Default index file

    try_files $uri $uri/ =404;   # Try to serve file, directory, or 404

    # Access control
    allow 192.168.1.0/24;        # Allow this IP range
    deny all;                    # Deny everyone else
}

# Exact match location
location = /exact {
    # Configuration for exact match
}

# Regex match location (case-sensitive)
location ~ \.php$ {
    # Configuration for PHP files
}

# Regex match location (case-insensitive)
location ~* \.(jpg|jpeg|png|gif)$ {
    # Configuration for image files
}

# Prefix match with priority
location ^~ /priority {
    # Configuration with priority
}
```
{{< /accordion >}}

{{< accordion "Upstream Context Directives" >}}
```nginx
upstream backend {
    server backend1.example.com weight=5;  # Server with weight
    server backend2.example.com;           # Default weight is 1
    server backup1.example.com backup;     # Backup server

    least_conn;                  # Least connections load balancing
    # Other methods: ip_hash, hash, random, etc.

    keepalive 16;                # Keep-alive connections to upstream
}
```
{{< /accordion >}}

#### 5. Including Files and Variables

{{< accordion "Including Configuration Files" >}}
```nginx
include /etc/nginx/conf.d/*.conf;     # Include all .conf files in directory
include /etc/nginx/sites-enabled/*;   # Include all files in directory
```
{{< /accordion >}}

{{< accordion "NGINX Variables" >}}
```nginx
# Built-in variables
$uri                # Current URI without query parameters
$args               # Query string parameters
$request_method     # HTTP method (GET, POST, etc.)
$remote_addr        # Client IP address
$server_name        # Name of the server processing the request
$host               # Host header from the request
$http_user_agent    # User-Agent header
$request_uri        # Full URI with query string

# Custom variables
set $mobile_device "no";
if ($http_user_agent ~* "mobile") {
    set $mobile_device "yes";
}
```
{{< /accordion >}}

#### 6. Conditional Processing and Rewrites

{{< accordion "Conditional Processing with if Statements" >}}
```nginx
# If statements (use sparingly, prefer location blocks)
if ($request_method = POST) {
    return 307 https://example.com$request_uri;
}

if ($http_user_agent ~* "bot") {
    return 403;
}

# Operators:
# = : Exact match
# != : Not equal
# ~ : Case-sensitive regex match
# ~* : Case-insensitive regex match
# !~ : Case-sensitive regex non-match
# !~* : Case-insensitive regex non-match
# -f : File exists
# !-f : File does not exist
# -d : Directory exists
# !-d : Directory does not exist
# -e : File or directory exists
# !-e : File or directory does not exist
# -x : Executable file exists
# !-x : Executable file does not exist
```
{{< /accordion >}}

{{< accordion "Return and Rewrite Directives" >}}
```nginx
# Return a specific HTTP status code
return 404;

# Return a status code with a message
return 200 "Hello, World!";

# Return a status code with a URL for redirection
return 301 https://example.com$request_uri;

# Rewrite a URL
rewrite ^/old-page$ /new-page permanent;  # 301 redirect
rewrite ^/old-page$ /new-page redirect;   # 302 redirect
rewrite ^/old-page$ /new-page;            # Internal rewrite
```
{{< /accordion >}}

#### 7. Testing and Administration

{{< accordion "Testing and Reloading Configuration" >}}
```bash
# Test configuration syntax
nginx -t

# Test with a specific configuration file
nginx -t -c /path/to/nginx.conf

# Reload configuration without stopping service
nginx -s reload

# Stop NGINX gracefully
nginx -s stop

# Quit NGINX after finishing all requests
nginx -s quit
```
{{< /accordion >}}

#### 8. Common Configuration Examples

{{< accordion "Basic Static Website" >}}
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```
{{< /accordion >}}

{{< accordion "PHP Website with FastCGI" >}}
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/example.com;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_intercept_errors on;
    }
}
```
{{< /accordion >}}

{{< accordion "HTTPS Configuration" >}}
```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```
{{< /accordion >}}

#### 9. Troubleshooting

{{< accordion "Common Troubleshooting Commands" >}}
- Check error logs: `tail -f /var/log/nginx/error.log`
- Check access logs: `tail -f /var/log/nginx/access.log`
- Test configuration: `nginx -t`
- Check running processes: `ps aux | grep nginx`
- Check listening ports: `netstat -tuln | grep nginx`
{{< /accordion >}}
