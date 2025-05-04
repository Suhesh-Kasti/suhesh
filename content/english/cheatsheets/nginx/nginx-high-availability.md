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
## 🛠️ NGINX Cheatsheet: High-Availability Deployment (Full Reference)

---

### 🏗️ 1. Setting Up a Basic High-Availability NGINX Configuration

{{< accordion "Use NGINX in an active-passive setup" >}}

**Primary NGINX (Active) Setup:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://backend1;
    }
}
```

**Secondary NGINX (Passive) Setup:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://backend2;
    }
}
```

- In an active-passive setup, if the active NGINX fails, traffic is automatically routed to the passive server.
    
- For failover, you’ll need to use an external load balancer (e.g., HAProxy, Keepalived).
    

{{< /accordion >}}

---

### 🔄 2. Setting Up Load Balancer (HAProxy Example)

{{< accordion "Configure HAProxy for NGINX failover" >}}

**HAProxy Configuration Example:**

```haproxy
frontend http_front
   bind *:80
   default_backend http_back

backend http_back
   balance roundrobin
   server nginx1 192.168.1.100:80 check
   server nginx2 192.168.1.101:80 check
```

- `roundrobin`: Distributes requests equally between NGINX instances.
    
- The `check` option performs health checks on NGINX instances to ensure they are up and running.
    
- If one NGINX fails, HAProxy will automatically route traffic to the healthy instance.
    

{{< /accordion >}}

---

### 🧑‍💻 3. Health Checks for Backend Servers

{{< accordion "NGINX health checks for backend reliability" >}}

**Use NGINX Plus for Active Health Checks** (requires subscription):

```nginx
upstream backend {
    zone backend 64k;
    server backend1.example.com weight=3 max_fails=3 fail_timeout=30s;
    server backend2.example.com;
    server backend3.example.com;
    health_check;
}
```

- `health_check`: NGINX Plus sends regular HTTP requests to backend servers to monitor their health.
    
- If a backend is unhealthy, it is temporarily removed from the pool until it passes health checks again.
    

**NGINX OSS:**

- For the open-source version, you can use third-party modules or an external load balancer like HAProxy for health checks.  
    {{< /accordion >}}
    

---

### 🔄 4. Failover Configuration (Using Keepalived)

{{< accordion "Failover with Keepalived (Active-Passive)" >}}

**Install Keepalived:**

```bash
sudo apt install keepalived
```

**Keepalived Configuration Example:**

```bash
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 101
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.1.50
    }
}
```

- **MASTER**: This server is the active one, which handles traffic.
    
- **BACKUP**: A backup server with lower priority will take over if the MASTER fails.
    
- `virtual_ipaddress`: The floating IP that will be used by the active server.
    
- If the MASTER fails, the BACKUP will assume the floating IP and continue serving traffic.  
    {{< /accordion >}}
    

---

### ⚙️ 5. Load Balancing with NGINX (Round Robin & Least Connections)

{{< accordion "NGINX Load Balancing Configuration" >}}

**Round Robin Load Balancing:**

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
}
```

- **Round Robin** is the default, distributing requests evenly between all servers.
    

**Least Connections Load Balancing:**

```nginx
upstream backend {
    least_conn;
    server backend1.example.com;
    server backend2.example.com;
}
```

- **least_conn** sends requests to the backend server with the least active connections.
    
- Great for backend servers with varying processing capabilities.
    

**IP Hash Load Balancing:**

```nginx
upstream backend {
    ip_hash;
    server backend1.example.com;
    server backend2.example.com;
}
```

- **ip_hash** ensures that a user’s IP address always connects to the same backend server, maintaining session persistence (sticky sessions).  
    {{< /accordion >}}
    

---

### ⚠️ 6. High-Availability for NGINX with Multiple Locations

{{< accordion "Configure multiple NGINX instances across different locations" >}}

```nginx
upstream backend {
    server backend1.example.com;
    server backend2.example.com;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

- When deploying multiple NGINX instances across different data centers, use a DNS round-robin or GeoDNS to distribute traffic across locations.
    
- You can also configure **GeoIP-based load balancing** if your users are located in different geographic areas.
    

{{< /accordion >}}

---

### 🏋️‍♂️ 7. Sticky Sessions in Load Balancing (Session Persistence)

{{< accordion "Configure sticky sessions in NGINX load balancing" >}}

```nginx
upstream backend {
    sticky cookie srv_id expires=1h domain=.yourdomain.com path=/;
    server backend1.example.com;
    server backend2.example.com;
}
```

- **Sticky sessions**: Ensures that all requests from the same client go to the same backend server.
    
- Useful for stateful applications where session data is stored locally (e.g., in-memory sessions).
    

{{< /accordion >}}

---

### ⚙️ 8. Automatic Failover Using Keepalived & HAProxy

{{< accordion "Combine Keepalived and HAProxy for Automatic Failover" >}}

**HAProxy for Load Balancing:**

```haproxy
frontend http_front
   bind *:80
   default_backend http_back

backend http_back
   balance roundrobin
   server nginx1 192.168.1.100:80 check
   server nginx2 192.168.1.101:80 check
```

- **HAProxy** handles the load balancing, while **Keepalived** ensures that if one NGINX fails, the other takes over.
    
- The **floating IP** provided by Keepalived is always bound to the active NGINX instance.
    

{{< /accordion >}}

---

### 🔧 9. Monitoring NGINX in High-Availability Setup

{{< accordion "Monitor NGINX in a Multi-Node Setup" >}}

- Use **Prometheus** and **Grafana** to monitor NGINX metrics like uptime, request rate, error rate, and load balancing distribution.
    
- Integrate **system metrics** from tools like `Netdata` or `Zabbix` for infrastructure health.
    

**NGINX Prometheus Exporter Setup:**

```bash
sudo apt install prometheus-nginx-exporter
```

- Configures metrics collection for NGINX across all instances.
    
- **Example Metrics**: `nginx_http_requests_total`, `nginx_connections_active`.
    

{{< /accordion >}}

---

### 🚀 10. Scaling NGINX for High Traffic

{{< accordion "Scale NGINX with multiple load balancers" >}}

- **Scale horizontally** by adding more NGINX instances and backend servers.
    
- Ensure backend servers are **stateless** (use external storage or databases).
    
- Consider using **containerized** services (e.g., Docker, Kubernetes) to scale dynamically.
    
- **Auto-scaling**: Integrate with cloud providers (e.g., AWS, Azure) for automatic scaling based on load.
    

{{< /accordion >}}
