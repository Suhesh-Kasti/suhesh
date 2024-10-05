---
title: Understanding Half Proxy
meta_title: Understanding Half Proxy Architectures
description: In a half proxy setup, the load balancer intercepts the client's request, forwards it to the server, but the response from the server bypasses the load balancer and is sent directly to the client. This setup is used in specific scenarios where performance gains are desired, but it introduces challenges like asymmetric routing. But what is asymmetric routing? 
date: 2024-10-01T11:53:06
image: /images/blog/networking/halfproxy.png
categories:
  - Networking
author: Suhesh Kasti
tags:
  - Half_proxy
  - Proxy
  - Load_Balancer
  - Direct_Server_Return
buttons:
  - label: See more
    url: /notes/
quiz:
  code: burp101
wordfill:
  code: burp101
---

# How does a half proxy work?
In a **half proxy** setup, the load balancer intercepts the client's request, forwards it to the server, but the response from the server **bypasses the load balancer** and is sent directly to the client. This setup is used in specific scenarios where performance gains are desired, but it introduces challenges like asymmetric routing.  But what is asymmetric routing? 
##### Asymmetric Routing
When traffic takes **different paths** on the way to and from the client, that is asymmetric routing and the network devices (e.g., firewalls or routers) may discard the packets, as they expect traffic to follow the same route (both request and response via the load balancer).
1. **Request Path:** Client → Load Balancer → Server
2. **Response Path:** Server → Client (bypassing the load balancer)

**Why would the packet be discarded?**
- Firewalls or NAT devices maintain a connection table for every session, associating request and response packets. If the response bypasses the original path (the load balancer), the return packets won’t match the expected flow, leading to **packet drops**.

# Direct Server Return
A more optimized version of the half proxy, Direct Server Return (DSR), allows the server to send responses directly to the client but works under specific conditions:
- The load balancer passes the client’s request **without altering** the Layer 3 information (like the source IP address), but **may modify Layer 2 information** (MAC addresses).
- **Requirements:**
    - The load balancer and server must be in the same Layer 2 domain.
    - The server must respond directly to the client by using the client’s IP address as the destination IP, but the server doesn’t change the VIP as the destination MAC address.
    
### Example
Let's take the following:
1. **Client IP:** `192.168.1.10`
2. **Load Balancer VIP (Virtual IP):** `192.168.2.1`
3. **Server IP:** `192.168.3.5`
##### Step by Step Breakdown
1. **Client sends a request to the Load Balancer:**
    - The client sends a request to the load balancer’s *Virtual IP* (VIP) at *192.168.2.1*.
    - **Client Request:**
        - Source IP: `192.168.1.10`
        - Destination IP: `192.168.2.1` (Load Balancer VIP)
2. **Load Balancer forwards the request to the Server:**
    - The load balancer receives the request but does not modify the *IP header* (it keeps the original source and destination IPs).
    - The load balancer forwards the packet to the server by altering the *Layer 2 (MAC address)* so the server receives the packet.
    - **Forwarded Request to the Server:**
        - Source IP: `192.168.1.10` (Client)
        - Destination IP: `192.168.2.1` (VIP)
        - Server processes the request because it recognizes the VIP as one of its assigned IPs.
3. **Server responds directly to the Client:**
    - Instead of sending the response back to the load balancer, the server responds directly to the client.
    - The server uses the client’s IP as the destination IP in the response.
    - **Server Response:**
        - Source IP: `192.168.3.5` (Server)
        - Destination IP: `192.168.1.10` (Client)

This means *the response bypasses the load balancer*, improving performance by reducing the load balancer's involvement in the return path.
### How and Whys...
**A. Why would the server recognize VIP as its own IP?**
In a Direct Server Return (DSR) setup, the server recognizes the Virtual IP (VIP) as one of its own IPs because the VIP is configured on the server as a loopback or secondary IP address. This configuration is crucial for DSR to function properly, allowing the server to respond directly to client requests while keeping the VIP intact.
1. **VIP Configuration on the Server**:
    - In DSR, the Virtual IP (VIP) (e.g., `192.168.2.1`) is usually assigned to the load balancer to receive incoming traffic from clients. However, the same VIP is also configured on the server, typically as a loopback address (a virtual network interface).
    - This setup allows the server to receive and process traffic sent to the VIP without needing to forward responses back through the load balancer.
2. **How the Server Uses the VIP**:
    - When the load balancer forwards the packet to the server, the destination IP in the packet remains the VIP (e.g., `192.168.2.1`).
    - Since the server has the VIP configured as a local loopback IP, it recognizes this as its own address and accepts the packet, even though the original request was made to the load balancer.
3. **Loopback Interface**:
    - The server is configured to respond from the VIP, but instead of routing traffic back through the load balancer, it responds directly to the client using its own real IP address (e.g., `192.168.3.5`).
    - The VIP is not tied to a physical network interface on the server. It’s typically assigned to a loopback interface (e.g., `lo:0`), allowing the server to handle traffic directed at the VIP.
    
**B. Why Does the Client Accept The Response?**
 The client *does not care* about the server's actual IP address (`192.168.3.5`).
- The client only looks at the *source IP* in the response packet. If the source IP in the response matches the *VIP* (`192.168.2.1`) that the client originally requested, the response appears valid to the client.
- The server ensures that the response packet has the *source IP as the VIP (`192.168.2.1`)*, so the client believes it is communicating with the original destination (VIP), even though the response is coming directly from the real server.
  
**C. Why Doesn’t the Real Server’s IP Matter?**
- The server’s **real IP** (`192.168.3.5`) is only used internally between the load balancer and the server.
- For the client, the connection always appears to be with the *VIP* (`192.168.2.1`), as the client only sees the VIP in both the request and the response.
- The *server never exposes its real IP* (`192.168.3.5`) to the client directly. The client always receives the response with the VIP (`192.168.2.1`) as the source IP.
  
**D. Can i use this technique to perform Man-In-The-Middle Attacks?**
The answer is **NO**. In theory, using a *loopback address* to reply as someone else — might seem similar to how *Direct Server Return (DSR)* works in a *half-proxy* setup. However, there are several important differences and limitations that prevent this method from being used to impersonate another service (like Google) for malicious purposes or *Man-in-the-Middle (MITM)* attacks. Some of the reasons being:
1. **Traffic Routing and Control**:
    - In the half-proxy/DSR scenario, the reason the server can respond using the VIP (loopback address) is because:
        - The load balancer controls the initial routing, ensuring the client's request reaches the server.
        - The VIP is assigned to the loopback interface on the server intentionally as part of a *trusted setup*.
    - If we were to assign a public IP (like Google’s) to our loopback interface, the internet's global routing infrastructure would still direct traffic to the real Google servers, not our machine. We cannot control external routing in this way, so we wouldn't receive the initial traffic to respond to.
2. **Source IP Validation (Anti-Spoofing)**:
    - Modern networks and servers implement **anti-spoofing measures**. This means that if we try to send a response from a loopback address pretending to be another IP (like Google’s), routers, firewalls, and other devices on the network will likely *detect the spoofed IP address and discard the packet*.
    - ISPs and network devices typically block traffic that claims to come from public IP ranges unless it is correctly routed from the owner of those IP addresses.
3. **No Real MITM Capability**:
    - In a half-proxy/DSR setup, the server legitimately receives the client’s request from the load balancer. The server is authorized to handle and respond to that request.
    - If we were trying to spoof traffic from another source (like Google), we’d have to somehow intercept or control the flow of requests intended for Google’s servers, which is extremely difficult without access to the underlying network.
    - Simply assigning the same IP to our loopback interface won’t cause external traffic to be routed to our machine. Routers, DNS servers, and ISPs will ensure that the real Google IP traffic goes to the correct destination.
4. **TLS/SSL Encryption**:
    - **HTTPS traffic** (used by almost all major services like Google) is encrypted using TLS/SSL. Even if we were able to somehow intercept requests, we wouldn’t be able to impersonate the server because we wouldn’t have access to the required **private keys** to decrypt the traffic or properly respond. The client would detect this and *reject the response* as invalid.
5. **Network Security Protections (IP Source Guard)**:
    - Many network devices use features like **IP Source Guard** and **Unicast Reverse Path Forwarding (uRPF)**, which verify that the source IP address in a packet matches the expected interface or network path. These mechanisms would flag and drop traffic from a spoofed IP (like using a loopback address to pretend to be another entity).
So, in the spoofing scenario:
- *We have no way to get the initial traffic intended for a public service like Google unless we compromise network routing, which is not feasible without deep access to network infrastructure.*
- *Even if we spoof the source IP to try to impersonate Google or any other service, network security mechanisms and TLS encryption will prevent this from being successful.*

