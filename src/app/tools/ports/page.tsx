"use client";

import { useState, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import DataBar from "@/components/mdx/DataBar";

interface PortEntry {
  port: number;
  service: string;
  protocol: string;
  description: string;
  category: string;
}

const PORTS: PortEntry[] = [
  { port: 7, service: "Echo", protocol: "TCP/UDP", description: "Echo service — reflects data back", category: "Legacy" },
  { port: 20, service: "FTP-Data", protocol: "TCP", description: "File Transfer Protocol — data channel", category: "File Transfer" },
  { port: 21, service: "FTP", protocol: "TCP", description: "File Transfer Protocol — control channel (cleartext auth)", category: "File Transfer" },
  { port: 22, service: "SSH", protocol: "TCP", description: "Secure Shell — encrypted remote access and SFTP", category: "Remote Access" },
  { port: 23, service: "Telnet", protocol: "TCP", description: "Unencrypted remote terminal (avoid in production)", category: "Remote Access" },
  { port: 25, service: "SMTP", protocol: "TCP", description: "Simple Mail Transfer Protocol — email delivery", category: "Email" },
  { port: 43, service: "WHOIS", protocol: "TCP", description: "Domain/IP ownership lookup protocol", category: "Info" },
  { port: 53, service: "DNS", protocol: "TCP/UDP", description: "Domain Name System — UDP for queries, TCP for zone transfers", category: "Infrastructure" },
  { port: 67, service: "DHCP Server", protocol: "UDP", description: "Dynamic Host Configuration Protocol — lease IP addresses", category: "Infrastructure" },
  { port: 68, service: "DHCP Client", protocol: "UDP", description: "DHCP client port", category: "Infrastructure" },
  { port: 69, service: "TFTP", protocol: "UDP", description: "Trivial FTP — no auth, used for PXE boot and device config", category: "File Transfer" },
  { port: 80, service: "HTTP", protocol: "TCP", description: "HyperText Transfer Protocol — web traffic (unencrypted)", category: "Web" },
  { port: 88, service: "Kerberos", protocol: "TCP/UDP", description: "Network authentication protocol (AD auth)", category: "Auth" },
  { port: 110, service: "POP3", protocol: "TCP", description: "Post Office Protocol — retrieve email (cleartext)", category: "Email" },
  { port: 111, service: "RPCBind", protocol: "TCP/UDP", description: "Portmapper — maps RPC services to ports (NFS dependency)", category: "Infrastructure" },
  { port: 119, service: "NNTP", protocol: "TCP", description: "Network News Transfer Protocol — Usenet", category: "Legacy" },
  { port: 123, service: "NTP", protocol: "UDP", description: "Network Time Protocol — clock sync", category: "Infrastructure" },
  { port: 135, service: "MSRPC", protocol: "TCP", description: "Microsoft RPC Endpoint Mapper (Windows)", category: "Windows" },
  { port: 137, service: "NetBIOS-NS", protocol: "UDP", description: "NetBIOS Name Service (Windows)", category: "Windows" },
  { port: 138, service: "NetBIOS-DGM", protocol: "UDP", description: "NetBIOS Datagram Service", category: "Windows" },
  { port: 139, service: "NetBIOS-SSN", protocol: "TCP", description: "NetBIOS Session Service (SMB over NetBIOS)", category: "Windows" },
  { port: 143, service: "IMAP", protocol: "TCP", description: "Internet Message Access Protocol (cleartext)", category: "Email" },
  { port: 161, service: "SNMP", protocol: "UDP", description: "Simple Network Management Protocol (often misconfigured)", category: "Monitoring" },
  { port: 162, service: "SNMP Trap", protocol: "UDP", description: "SNMP Trap messages", category: "Monitoring" },
  { port: 179, service: "BGP", protocol: "TCP", description: "Border Gateway Protocol — internet routing", category: "Infrastructure" },
  { port: 194, service: "IRC", protocol: "TCP", description: "Internet Relay Chat", category: "Legacy" },
  { port: 389, service: "LDAP", protocol: "TCP/UDP", description: "Lightweight Directory Access Protocol (cleartext)", category: "Auth" },
  { port: 443, service: "HTTPS", protocol: "TCP", description: "HTTP over TLS — secure web traffic", category: "Web" },
  { port: 445, service: "SMB", protocol: "TCP", description: "Server Message Block — file/printer sharing (EternalBlue target)", category: "Windows" },
  { port: 465, service: "SMTPS", protocol: "TCP", description: "SMTP over SSL (deprecated, use 587)", category: "Email" },
  { port: 500, service: "IKE", protocol: "UDP", description: "Internet Key Exchange — IPSec VPN", category: "VPN" },
  { port: 514, service: "Syslog", protocol: "UDP", description: "System logging protocol", category: "Monitoring" },
  { port: 515, service: "LPD", protocol: "TCP", description: "Line Printer Daemon — print service", category: "Legacy" },
  { port: 554, service: "RTSP", protocol: "TCP", description: "Real Time Streaming Protocol (often CCTV)", category: "Media" },
  { port: 587, service: "SMTP Submission", protocol: "TCP", description: "SMTP with STARTTLS — modern email submission", category: "Email" },
  { port: 593, service: "RPC over HTTP", protocol: "TCP", description: "HTTP RPC Endpoint Mapper (Windows)", category: "Windows" },
  { port: 631, service: "IPP", protocol: "TCP", description: "Internet Printing Protocol (CUPS)", category: "Printing" },
  { port: 636, service: "LDAPS", protocol: "TCP", description: "LDAP over SSL", category: "Auth" },
  { port: 853, service: "DNS over TLS", protocol: "TCP", description: "Encrypted DNS queries", category: "Infrastructure" },
  { port: 873, service: "Rsync", protocol: "TCP", description: "File sync protocol — often unauthenticated", category: "File Transfer" },
  { port: 989, service: "FTPS Data", protocol: "TCP", description: "FTP over SSL — data channel", category: "File Transfer" },
  { port: 990, service: "FTPS Control", protocol: "TCP", description: "FTP over SSL — control channel", category: "File Transfer" },
  { port: 993, service: "IMAPS", protocol: "TCP", description: "IMAP over SSL", category: "Email" },
  { port: 995, service: "POP3S", protocol: "TCP", description: "POP3 over SSL", category: "Email" },
  { port: 1080, service: "SOCKS", protocol: "TCP", description: "SOCKS proxy (often misconfigured)", category: "Proxy" },
  { port: 1194, service: "OpenVPN", protocol: "UDP", description: "OpenVPN default port", category: "VPN" },
  { port: 1352, service: "Lotus Notes", protocol: "TCP", description: "IBM Lotus Notes/Domino", category: "Legacy" },
  { port: 1433, service: "MSSQL", protocol: "TCP", description: "Microsoft SQL Server", category: "Database" },
  { port: 1434, service: "MSSQL Browser", protocol: "UDP", description: "SQL Server Browser service", category: "Database" },
  { port: 1521, service: "Oracle DB", protocol: "TCP", description: "Oracle Database listener", category: "Database" },
  { port: 1723, service: "PPTP", protocol: "TCP", description: "Point-to-Point Tunneling Protocol (insecure VPN)", category: "VPN" },
  { port: 1812, service: "RADIUS", protocol: "UDP", description: "Remote Authentication Dial-In User Service", category: "Auth" },
  { port: 1883, service: "MQTT", protocol: "TCP", description: "MQTT — IoT messaging protocol (often insecure)", category: "IoT" },
  { port: 2049, service: "NFS", protocol: "TCP/UDP", description: "Network File System (often exposed)", category: "File Transfer" },
  { port: 2181, service: "ZooKeeper", protocol: "TCP", description: "Apache ZooKeeper coordination service", category: "Infrastructure" },
  { port: 2375, service: "Docker REST", protocol: "TCP", description: "Docker daemon REST API (unencrypted — critical risk)", category: "DevOps" },
  { port: 2376, service: "Docker REST TLS", protocol: "TCP", description: "Docker daemon REST API (TLS)", category: "DevOps" },
  { port: 3000, service: "Dev Server", protocol: "TCP", description: "Common development server port (Node/Rails/React)", category: "Dev" },
  { port: 3128, service: "Squid Proxy", protocol: "TCP", description: "Squid web proxy cache (often misconfigured)", category: "Proxy" },
  { port: 3260, service: "iSCSI", protocol: "TCP", description: "iSCSI storage target", category: "Storage" },
  { port: 3306, service: "MySQL", protocol: "TCP", description: "MySQL database server", category: "Database" },
  { port: 3389, service: "RDP", protocol: "TCP", description: "Remote Desktop Protocol (BlueKeep target)", category: "Remote Access" },
  { port: 3478, service: "STUN", protocol: "UDP", description: "Session Traversal Utilities for NAT (WebRTC)", category: "Media" },
  { port: 3689, service: "DAAP", protocol: "TCP", description: "Digital Audio Access Protocol (iTunes sharing)", category: "Media" },
  { port: 4444, service: "Metasploit", protocol: "TCP", description: "Common Metasploit listener port", category: "Pentest" },
  { port: 4500, service: "IPSec NAT-T", protocol: "UDP", description: "IPSec NAT Traversal", category: "VPN" },
  { port: 4567, service: "Sinatra", protocol: "TCP", description: "Sinatra default dev port", category: "Dev" },
  { port: 4848, service: "GlassFish Admin", protocol: "TCP", description: "GlassFish application server admin", category: "App Server" },
  { port: 5000, service: "Dev Server", protocol: "TCP", description: "Common dev port (Flask/Heroku)", category: "Dev" },
  { port: 5044, service: "Logstash", protocol: "TCP", description: "Logstash Beats input", category: "DevOps" },
  { port: 5353, service: "mDNS", protocol: "UDP", description: "Multicast DNS (Bonjour/Avahi)", category: "Infrastructure" },
  { port: 5432, service: "PostgreSQL", protocol: "TCP", description: "PostgreSQL database server", category: "Database" },
  { port: 5555, service: "ADB", protocol: "TCP", description: "Android Debug Bridge (often exposed on IoT devices)", category: "IoT" },
  { port: 5601, service: "Kibana", protocol: "TCP", description: "Kibana dashboard (Elastic Stack)", category: "DevOps" },
  { port: 5672, service: "AMQP", protocol: "TCP", description: "RabbitMQ message broker", category: "DevOps" },
  { port: 5800, service: "VNC HTTP", protocol: "TCP", description: "VNC web client", category: "Remote Access" },
  { port: 5900, service: "VNC", protocol: "TCP", description: "Virtual Network Computing (remote desktop)", category: "Remote Access" },
  { port: 5985, service: "WinRM HTTP", protocol: "TCP", description: "Windows Remote Management (HTTP)", category: "Windows" },
  { port: 5986, service: "WinRM HTTPS", protocol: "TCP", description: "Windows Remote Management (HTTPS)", category: "Windows" },
  { port: 6379, service: "Redis", protocol: "TCP", description: "Redis key-value store (often exposed without auth)", category: "Database" },
  { port: 6443, service: "Kubernetes API", protocol: "TCP", description: "Kubernetes API server", category: "DevOps" },
  { port: 6667, service: "IRC", protocol: "TCP", description: "IRC default port", category: "Legacy" },
  { port: 7001, service: "WebLogic", protocol: "TCP", description: "Oracle WebLogic admin console", category: "App Server" },
  { port: 7474, service: "Neo4j", protocol: "TCP", description: "Neo4j graph database web UI", category: "Database" },
  { port: 7547, service: "CWMP", protocol: "TCP", description: "TR-069 CPE WAN Management Protocol (ISP routers)", category: "IoT" },
  { port: 8000, service: "Dev Server", protocol: "TCP", description: "Common web dev port", category: "Dev" },
  { port: 8009, service: "AJP", protocol: "TCP", description: "Apache JServ Protocol (Ghostcat vulnerability)", category: "App Server" },
  { port: 8080, service: "HTTP Alt", protocol: "TCP", description: "Alternative HTTP port (common proxy/app server)", category: "Web" },
  { port: 8443, service: "HTTPS Alt", protocol: "TCP", description: "Alternative HTTPS port", category: "Web" },
  { port: 8888, service: "HTTP Alt", protocol: "TCP", description: "Common dev/proxy port (Jupyter/Charles)", category: "Dev" },
  { port: 9000, service: "PHP-FPM", protocol: "TCP", description: "PHP FastCGI Process Manager", category: "App Server" },
  { port: 9042, service: "Cassandra", protocol: "TCP", description: "Apache Cassandra database", category: "Database" },
  { port: 9090, service: "Cockpit", protocol: "TCP", description: "Web-based server admin panel", category: "Monitoring" },
  { port: 9092, service: "Kafka", protocol: "TCP", description: "Apache Kafka message broker", category: "DevOps" },
  { port: 9100, service: "Printer RAW", protocol: "TCP", description: "Raw printing protocol (JetDirect)", category: "Printing" },
  { port: 9200, service: "Elasticsearch", protocol: "TCP", description: "Elasticsearch REST API (often exposed)", category: "DevOps" },
  { port: 9300, service: "Elasticsearch Node", protocol: "TCP", description: "Elasticsearch node communication", category: "DevOps" },
  { port: 9443, service: "VMware HTTPS", protocol: "TCP", description: "VMware vSphere web client", category: "Virtualization" },
  { port: 10000, service: "Webmin", protocol: "TCP", description: "Webmin system admin panel", category: "Monitoring" },
  { port: 10443, service: "VMware vCenter", protocol: "TCP", description: "VMware vCenter web client", category: "Virtualization" },
  { port: 11211, service: "Memcached", protocol: "TCP/UDP", description: "Memcached — amplification DDoS risk on UDP", category: "Database" },
  { port: 20000, service: "Usermin", protocol: "TCP", description: "Usermin webmail admin", category: "Email" },
  { port: 27017, service: "MongoDB", protocol: "TCP", description: "MongoDB NoSQL database (often exposed)", category: "Database" },
  { port: 50000, service: "SAP", protocol: "TCP", description: "SAP NetWeaver dispatcher", category: "App Server" },
];

export default function PortsPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = PORTS;
    if (filter) list = list.filter(p => p.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.service.toLowerCase().includes(q) ||
        p.port.toString().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, filter]);

  const categories = useMemo(() => {
    const cats = new Set(PORTS.map(p => p.category));
    return Array.from(cats).sort();
  }, []);

  const handleCopy = useCallback(() => {
    const list = filtered.map(p => p.port).join(",");
    navigator.clipboard.writeText(list);
  }, [filtered]);

  // Count per category for the DataBar
  const catData = useMemo(() => {
    return categories.map(cat => ({
      label: cat,
      value: PORTS.filter(p => p.category === cat).length,
    }));
  }, [categories]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 min-h-screen" style={{ backgroundColor: "var(--surf)" }}>
        <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase mb-2" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Port Reference
          </h1>
          <p className="font-mono text-sm text-fg-muted mb-8" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {PORTS.length} common ports with service info — search or filter by category
          </p>

          {/* DataBar: ports per category */}
          <div className="mb-8">
            <DataBar title="Ports by Category" data={catData} />
          </div>

          {/* Search + filter bar */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search port, service, or description..."
              className="flex-1 bg-transparent border-2 border-fg px-4 py-2 font-mono text-sm placeholder:text-fg-muted/50 focus:outline-none focus:border-brutal-pink transition-colors"
              style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}
              spellCheck={false}
            />
            <button
              onClick={handleCopy}
              className="font-mono text-2xs uppercase px-3 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-colors cursor-pointer shrink-0"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              Copy ports
            </button>
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter(null)}
              className={`font-mono text-2xs uppercase px-3 py-1 border transition-colors cursor-pointer ${!filter ? "bg-fg text-surface border-fg" : "border-fg-muted/30 hover:border-fg"}`}
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              ALL
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`font-mono text-2xs uppercase px-3 py-1 border transition-colors cursor-pointer ${filter === cat ? "bg-fg text-surface border-fg" : "border-fg-muted/30 hover:border-fg"}`}
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Port table */}
          <div className="border-2 border-fg overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Header */}
              <div className="flex border-b-2 border-fg bg-fg text-surface font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                <div className="w-16 px-3 py-2 font-bold">Port</div>
                <div className="w-20 px-3 py-2 font-bold">Proto</div>
                <div className="flex-1 px-3 py-2 font-bold">Service</div>
                <div className="w-40 px-3 py-2 font-bold hidden sm:block">Category</div>
              </div>

              {filtered.map((p) => (
                <div key={p.port}>
                  <button
                    onClick={() => setExpanded(expanded === p.port ? null : p.port)}
                    className="flex w-full text-left border-b border-fg-muted/20 hover:bg-brutal-pink/5 transition-colors cursor-pointer"
                  >
                    <div className="w-16 px-3 py-2 font-mono text-sm font-bold" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "#ff5500" }}>
                      {p.port}
                    </div>
                    <div className="w-20 px-3 py-2 font-mono text-xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {p.protocol}
                    </div>
                    <div className="flex-1 px-3 py-2 font-mono text-xs" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>
                      {p.service}
                    </div>
                    <div className="w-40 px-3 py-2 font-mono text-2xs text-fg-muted hidden sm:block" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {p.category}
                    </div>
                  </button>

                  {expanded === p.port && (
                    <div className="px-3 py-3 border-b border-fg-muted/20" style={{ backgroundColor: "var(--surf-muted, var(--surf))" }}>
                      <p className="font-sans text-xs leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontSans, color: "var(--fg)" }}>
                        {p.description}
                      </p>
                      <div className="flex gap-3 mt-2">
                        <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                          Category: {p.category}
                        </span>
                        <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                          Protocol: {p.protocol}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 font-mono text-2xs text-fg-muted/50" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {filtered.length} port{filtered.length !== 1 ? "s" : ""} shown
          </p>
        </section>
      </main>
      <SearchButton />
    </>
  );
}
