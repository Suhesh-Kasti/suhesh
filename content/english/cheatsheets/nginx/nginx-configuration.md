---
title: "NGINX Configuration Cheatsheet"
description: "Essential guide to NGINX configuration syntax, directives, and context hierarchy"
date: 2023-07-15T10:00:00+05:45
image: "/images/cheatsheets/nginx.png"
cheatsheet_categories: ["Web Servers", "NGINX"]
cheatsheet_tags: ["nginx", "configuration", "web server"]
---
## 📘 NGINX Cheatsheet: Core Configuration Only

---

### 🗂 1. Basic NGINX Configuration Structure

{{< accordion "nginx.conf: Main entry point for all config" >}}

```nginx
user nginx;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    include /etc/nginx/sites-enabled/*;
}
```

The `http` block includes all HTTP-specific config, including virtual hosts from `sites-enabled`.  
{{< /accordion >}}

---

### 🌍 2. Minimal Server Block for a Static Website

{{< accordion "server block: Serve a static website" >}}

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/example.com/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

This serves static files for `example.com` from `/var/www/example.com/html`.  
{{< /accordion >}}

---

### 🧱 3. Location Block Basics

{{< accordion "location: Define behavior based on URL paths" >}}

```nginx
location / {
    try_files $uri $uri/ =404;
}

location /images/ {
    root /var/www/assets;
}
```

- `/` serves files relative to `root` defined in the `server` block.
    
- `/images/` serves files from `/var/www/assets/images`.  
    {{< /accordion >}}
    

---

### 🧭 4. Index and Default File Settings

{{< accordion "index: Define default file for a directory" >}}

```nginx
index index.html index.htm;
```

If a user visits `/about/`, NGINX looks for `/about/index.html` or `/about/index.htm`.  
{{< /accordion >}}

---

### 📁 5. Serve Static Content from Custom Path

{{< accordion "root vs alias: Choose the right directive" >}}

```nginx
location /static/ {
    root /var/www/site;
}
```

> Resolves `/static/logo.png` to `/var/www/site/static/logo.png`.

**Using `alias`:**

```nginx
location /static/ {
    alias /var/www/site/;
}
```

> Resolves `/static/logo.png` to `/var/www/site/logo.png`.

Use `alias` when the path on disk doesn't match the URL path.  
{{< /accordion >}}

---

### 🪪 6. Enabling a Site (Using sites-available)

{{< accordion "Enable a site via symlink" >}}

```bash
sudo ln -s /etc/nginx/sites-available/example.conf /etc/nginx/sites-enabled/
```

Then reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

This makes your site live using clean modular config structure.  
{{< /accordion >}}

---

### 🧪 7. Test Config and Reload

{{< accordion "Test and reload NGINX safely" >}}

```bash
sudo nginx -t         # Test syntax
sudo systemctl reload nginx  # Apply changes
```

Always test before reloading to avoid downtime due to config errors.  
{{< /accordion >}}
