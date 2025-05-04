---
title: NGINX for API Gateway
description: Comprehensive guide to optimizing NGINX for maximum performance and throughput
date: 2023-07-16T10:00:00+05:45
image: /images/cheatsheets/nginx.png
cheatsheet_categories:
  - Web Servers
  - NGINX
  - Performance
cheatsheet_tags:
  - nginx
  - performance
  - optimization
  - caching
  - tuning
---
## 🚪 NGINX Cheatsheet: API Gateway (Full Reference)

---

### 🗂 1. Path-Based Routing for Microservices

{{< accordion "Route traffic to different services by URI path" >}}

```nginx
server {
    listen 80;
    server_name api.example.com;

    location /api/users/ {
        proxy_pass http://localhost:3001/;
    }

    location /api/orders/ {
        proxy_pass http://localhost:3002/;
    }
}
```

- Each path prefix (`/api/users/`, `/api/orders/`) routes to a different backend.
    
- Trailing `/` in `proxy_pass` ensures path stripping.  
    {{< /accordion >}}
    

---

### 📈 2. Rate Limiting to Prevent Abuse

{{< accordion "Limit requests per IP to protect API endpoints" >}}

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;

    server {
        location /api/ {
            limit_req zone=api_limit burst=10 nodelay;
            proxy_pass http://localhost:3000;
        }
    }
}
```

- Allows **5 requests per second** per IP, with a burst of 10.
    
- `nodelay` = burst requests are accepted instantly.
    
- Protects against DoS and overuse.  
    {{< /accordion >}}
    

---

### 🔑 3. Basic Authentication for APIs

{{< accordion "Protect endpoints using HTTP Basic Auth" >}}

```nginx
location /api/secure/ {
    auth_basic "Private API";
    auth_basic_user_file /etc/nginx/.htpasswd;

    proxy_pass http://localhost:4000/;
}
```

- Use `htpasswd` to generate users.
    
- Prevents unauthorized access to protected API routes.  
    {{< /accordion >}}
    

---

### 🔄 4. Custom API Response Codes

{{< accordion "Return specific status codes for restricted or invalid access" >}}

```nginx
location /api/admin/ {
    allow 192.168.1.0/24;
    deny all;

    proxy_pass http://localhost:5000;
    error_page 403 = @forbidden_json;
}

location @forbidden_json {
    default_type application/json;
    return 403 '{"error":"access_denied"}';
}
```

- Block non-whitelisted IPs with a JSON-style 403 response.
    
- Useful for internal APIs or geo restrictions.  
    {{< /accordion >}}
    

---

### 🪪 5. API Key Authentication (Simple Lua Example)

{{< accordion "Validate API keys using Lua (OpenResty or NGINX Lua module)" >}}

```nginx
location /api/ {
    access_by_lua_block {
        local key = ngx.req.get_headers()["X-API-Key"]
        if key ~= "my-secret-key" then
            ngx.status = 401
            ngx.say('{"error":"invalid_api_key"}')
            return ngx.exit(401)
        end
    }

    proxy_pass http://localhost:3000/;
}
```

- Uses Lua to check for a custom header `X-API-Key`.
    
- Returns custom JSON if key is missing or invalid.
    
- Requires NGINX compiled with [ngx_http_lua_module](https://github.com/openresty/lua-nginx-module).  
    {{< /accordion >}}
    

---

### 📋 6. CORS for Public APIs

{{< accordion "Enable Cross-Origin Resource Sharing headers" >}}

```nginx
location /api/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'Authorization,Content-Type';

    if ($request_method = OPTIONS ) {
        return 204;
    }

    proxy_pass http://localhost:3000;
}
```

- Required for frontend JavaScript apps calling your API.
    
- Responds to `OPTIONS` preflight requests with `204 No Content`.  
    {{< /accordion >}}
    

---

### 🧱 7. API Gateway with Upstreams (Per Service)

{{< accordion "Abstract each service with upstream blocks for scaling" >}}

```nginx
upstream users_service {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

upstream orders_service {
    server 127.0.0.1:4001;
    server 127.0.0.1:4002;
}

server {
    location /api/users/ {
        proxy_pass http://users_service;
    }

    location /api/orders/ {
        proxy_pass http://orders_service;
    }
}
```

- Allows load balancing per microservice.
    
- Can use `least_conn`, `ip_hash`, etc.  
    {{< /accordion >}}
    

---

### 🧬 8. Advanced: Conditional Proxying (Path + Header)

{{< accordion "Use `map` and `if` to dynamically proxy by header or path" >}}

```nginx
map $http_x_service_key $backend_url {
    "alpha" http://localhost:4000;
    "beta"  http://localhost:5000;
}

server {
    location /api/ {
        proxy_pass $backend_url;
    }
}
```

- Routes traffic to different backends **based on header value**.
    
- Useful for A/B testing, staging vs production separation, etc.  
    {{< /accordion >}}
    

---

### 🧠 9. Advanced: JWT Validation (via Lua or External Auth)

{{< accordion "Offload JWT auth to backend or use Lua/OpenResty" >}}

- Best to use a real API gateway like **Kong**, **Traefik**, or **NGINX Plus** for production JWT validation.
    
- For NGINX OSS:
    
    - Use Lua to decode and validate JWT.
        
    - Or pass JWT to a backend auth microservice via internal `auth_request`.
        

```nginx
location /api/ {
    auth_request /auth;

    proxy_pass http://localhost:3000;
}

location = /auth {
    internal;
    proxy_pass http://auth-service/validate-jwt;
}
```

- The `/auth` location expects a 2xx from your auth service to allow request.  
    {{< /accordion >}}