---
title: "Software Defined Networking"
meta_title: "What is Software Defined Networking and How does it Function?"
description: "This is going to sound weird but your current knowledge of networking is going to be worthless after SDN takeover. Wanna know why?"
date: 2024-10-22T04:22:06+05:45
image: "/images/blog/networking/sdn.webp"
categories: ["Networking"]
author: "Suhesh Kasti"
tags: ["Software Defined Network(SDN)", "Network Planes", "Overlay", "Underlay", "Network Automation", "Application Centric Interface (ACI)", "Application Policy Infrastructure Controller(APIC)", "Virtual Extensible LAN (VXLAN)"]
buttons:
  - label: "Learn ACI"
    url: "https://developer.cisco.com/site/aci/"
  - label: "Always on DevNet ACI Sandbox"
    url: "https://devnetsandbox.cisco.com/DevNet/catalog/ACI-Simulator-Always-On"
  - label: "Cisco Dcloud Labs"
    url: "https://dcloud2-sng.cisco.com/"
quiz:
  code: sdn01
wordfill:
  code: sdn01
---

Software Defined Networking (SDN) is an approach that revolutionizes the way networks are controlled and managed. Instead of relying on traditional, hardware-based methods, SDN separates the network’s control plane from the data plane. This enables centralized, software-based control, giving you more flexibility and agility in managing your network.

## Planes

{{< tabs >}}
{{< tab "Management Plane" >}}
The **Management Plane** is how we interact with and manage our network devices. Think of it as the control panel where we input commands. Common methods include:

- Telnet
- SSH
- SNMP
- APIs

We use these to manage devices remotely and configure them.
{{< /tab >}}
{{< tab "Control Plane" >}}
The **Control Plane** is the brain of network devices, controlling how packets flow within routers and switches. It handles:

- Routing protocols like **OSPF**
- Network Address Translation (NAT)
- Access Control Lists (ACL)
- Spanning Tree Protocol (STP)
- Cisco Discovery Protocol (CDP)
- Virtual Trunking Protocol (VTP)
- Quality of Service (QoS)
- Mac Address Table

The Control Plane decides how data moves, setting the rules for data flow.
{{< /tab >}}
{{< tab "Data Plane" >}}
The **Data Plane** executes what the Control Plane tells it. It handles all data transmission and reception. Its responsibilities include:

- **Encapsulation/Decapsulation**
- **Matching Layer 2 data** with the MAC Address Table (The MAC Address Table is filled by the Control Plane, but the Data Plane matches it when frames arrive)
- **Dropping traffic** that doesn't follow the set rules

In simpler terms, the Control Plane makes decisions, and the Data Plane does the heavy lifting of moving the data.
{{< /tab >}}
{{< /tabs >}}

![Data_Control_Management_Planes](/images/blog/networking/notThumb/Data_Control_Management_Planes.png)

## Distributed Control Plane vs. Controller-Based Networking

In traditional networks, each device has its own Control Plane and makes decisions independently. This is known as a **Distributed Control Plane**:

![Distributed_Control_Plane](/images/blog/networking/notThumb/Distributed_Control_Plane.png)

However, with SDN, all the brains are removed from individual devices and placed into a **Centralized Control Plane** managed by an SDN Controller:

![Controller_Based_Networking_Zombie](/images/blog/networking/notThumb/Controller_Based_Networking_Zombie.png)

This centralization is the key idea behind SDN—it simplifies the network by centralizing control.

## Interfaces in SDN

{{< tabs >}}
{{< tab "South Bound Interface (SBI)" >}}
The **South Bound Interface (SBI)** is how the SDN Controller communicates with and controls the devices in the network. It uses various protocols to achieve this, such as:

{{< accordion "OpenFlow" >}}
**OpenFlow** is one of the first SDN protocols that allowed network switches to be remotely controlled by an SDN Controller. It provides direct access to the forwarding plane of network devices like switches and routers, making it easier to manage data flow in the network.

With OpenFlow, the SDN controller can instruct devices on how to handle network traffic by modifying forwarding tables.
{{< /accordion >}}

{{< accordion "OpFlex" >}}
**OpFlex** is a more flexible protocol compared to OpenFlow. It allows the SDN Controller to dictate "policies" rather than directly controlling the forwarding decisions of network devices. Devices are then responsible for implementing these policies.

OpFlex is especially useful in systems like Cisco ACI, where intent-based networking is key. The SDN Controller defines high-level policies, and devices enforce them.
{{< /accordion >}}

{{< accordion "CLI/SNMP" >}}
**CLI (Command Line Interface)** and **SNMP (Simple Network Management Protocol)** are traditional methods used to manage and configure network devices. In SDN, they can still be used as part of the South Bound Interface to send commands or collect data from devices.

- **CLI**: Allows administrators to manually interact with devices using commands.
- **SNMP**: Collects information from devices and can trigger configuration changes remotely.
{{< /accordion >}}

{{< accordion "NETCONF" >}}
**NETCONF** (Network Configuration Protocol) is a more modern approach for configuring network devices. It uses XML-based data encoding and runs over a secure transport layer (usually SSH) to push configurations and retrieve data from network devices.

NETCONF is particularly useful in SDN environments where automation and remote management are essential.
{{< /accordion >}}

These protocols allow the SDN Controller to program the underlying network devices.
{{< /tab >}}
{{< tab "North Bound Interface (NBI)" >}}
The **North Bound Interface (NBI)** is how we interact with the SDN Controller, usually through a Graphical User Interface (GUI) or Application Programming Interface (API). For example, using **REST API**, we can programmatically manage the network, automating tasks that would otherwise require manual intervention.
{{< /tab >}}
{{< /tabs >}}

### The Need for SDN Controllers

SDN Controllers provide centralized management, reducing complexity and increasing flexibility. They allow us to define policies and automate configuration changes across the entire network, making SDN a critical part of modern networking.

SDN provides a way to simplify the network logic stuffs by making intent based and we don't need to configure everything manually. 

#### Intent-Based Networking

In ACI, intent-based networking allows you to define your goals or "intent," and the APIC handles the configuration to meet that intent. For example, you can group servers into **Endpoint Groups (EPGs)** such as "database servers" or "web servers" and define how they should interact.

> **Intent-based Networking** means you don’t configure everything manually. Instead, you specify your desired outcomes (intent), and the SDN Controller handles the setup.

## Software Defined Architecture

SDN Architecture typically involves **Layer 3 routed links**, where every link runs a routing protocol like OSPF. This creates a strong, redundant network with efficient routing between devices.

### Underlay, Overlay, VXLAN, and Fabric 

{{< accordion "Underlay" >}}
The **Underlay** is the physical network infrastructure that provides connectivity between devices. It includes all the routers, switches, and physical links that form the foundation of the network.

In SDN, the underlay is often Layer 3-routed, meaning that routing protocols like OSPF are used to ensure robust, redundant paths across the network.
{{< /accordion >}}

{{< accordion "Overlay" >}}
The **Overlay** is a virtual network that runs on top of the Underlay. It allows for logical segmentation of the network, often using technologies like VXLAN to create tunnels over the physical infrastructure. 

This is useful for creating isolated virtual networks (think of each virtual network as its own world) on the same physical hardware.
{{< /accordion >}}

{{< accordion "VXLAN" >}}
**VXLAN** (Virtual Extensible LAN) is a tunneling protocol that allows for the creation of Layer 2 networks over a Layer 3 network (the Underlay). It extends the capabilities of traditional VLANs, supporting more virtual networks and allowing for greater scalability.

VXLAN makes devices in the network seem as if they are "one hop away," even though they may be physically distant.
{{< /accordion >}}

{{< accordion "Fabric" >}}
The **Fabric** in SDN refers to the combination of the Underlay, Overlay, and all devices (routers, switches, controllers) that make up the entire network infrastructure. It’s the entire network architecture that allows data to be transferred efficiently, securely, and with redundancy.

In simple terms, the Fabric is the glue that holds together the physical and virtual components of the network.
{{< /accordion >}}

Together, these concepts form the backbone of modern SDN architectures, allowing for scalable, flexible, and efficient networks.

## Application Centric Infrastructure (ACI)

**Application Centric Infrastructure (ACI)** is Cisco’s approach to Data Center automation. In ACI, all devices are connected using Layer 3 routing, forming a spine-leaf topology:

![Spine_Leaf_in_data_center](/images/blog/networking/notThumb/Spine_Leaf_in_data_center.png)

The **APIC (Application Policy Infrastructure Controller)** is the SDN Controller in ACI. It centralizes control, letting you manage the Data Center with **intent-based networking**.

{{< accordion "APIC in Action" >}}
The **APIC** manages both the Underlay and the Overlay in the network. It ensures that everything is working correctly and lets you define policies that dictate how data flows between devices.
{{< /accordion >}}

### 3-Tier Web Application

In most Data Centers, applications follow a **3-tier model**:

{{< accordion "DB -> App -> Web" >}}
1. **Database Tier (DB)**: Stores data for the application.
2. **Application Tier (App)**: Handles the business logic.
3. **Web Tier (Web)**: The frontend that interacts with users.

In ACI, these are managed by creating their own seperate endpoint groups and setting policies on how they should communicate with each other.
{{< /accordion >}}




