---
title: Kubernetes
email: kastisuhesh1@gmail.com
image: "/images/cheatsheets/kubernetes.svg"
description: is an open-source container orchestration platform that automates the deployment and management of containerized applications.

---
{{< toc >}}

#### 1. Deploy a Pod
   {{< accordion "kubectl run: Create and run a pod" >}}
   Deploy a simple pod with a specified image.
   <br>
   ```bash
   kubectl run mypod --image=nginx
   ```
   {{< /accordion >}}

#### 2. List Pods
   {{< accordion "kubectl get pods: List all pods in the current namespace" >}}
   View the status of all pods running in the current namespace.
   <br>
   ```bash
   kubectl get pods
   ```
   {{< /accordion >}}

#### 3. Pod Details
   {{< accordion "kubectl describe pod: Display detailed information about a pod" >}}
   Retrieve comprehensive information about a specific pod.
   <br>
   ```bash
   kubectl describe pod pod_name
   ```
   {{< /accordion >}}

#### 4. Scale a Deployment
   {{< accordion "kubectl scale: Scale the number of replicas in a deployment" >}}
   Adjust the number of replicas for a deployment.
   <br>
   ```bash
   kubectl scale deployment myapp --replicas=3
   ```
   {{< /accordion >}}

#### 5. Expose a Service
   {{< accordion "kubectl expose: Create a service and expose it to external traffic" >}}
   Expose a service to make it accessible from outside the cluster.
   <br>
   ```bash
   kubectl expose deployment myapp --port=80 --type=LoadBalancer
   ```
   {{< /accordion >}}

#### 6. Update a Deployment
   {{< accordion "kubectl set image: Update the image of a deployment" >}}
   Roll out a new image for a deployment.
   <br>
   ```bash
   kubectl set image deployment/myapp myapp-container=myapp:v2
   ```
   {{< /accordion >}}

#### 7. Pod Logs
   {{< accordion "kubectl logs: Display logs from a pod" >}}
   Retrieve logs from a specific pod.
   <br>
   ```bash
   kubectl logs pod_name
   ```
   {{< /accordion >}}

#### 8. Delete a Pod
   {{< accordion "kubectl delete pod: Remove a pod" >}}
   Terminate and delete a specific pod.
   <br>
   ```bash
   kubectl delete pod pod_name
   ```
   {{< /accordion >}}

#### 9. List Services
   {{< accordion "kubectl get services: List all services in the current namespace" >}}
   View details of all services running in the current namespace.
   <br>
   ```bash
   kubectl get services
   ```
   {{< /accordion >}}

#### 10. Service Details
   {{< accordion "kubectl describe service: Display detailed information about a service" >}}
   Retrieve comprehensive information about a specific service.
   <br>
   ```bash
   kubectl describe service service_name
   ```
   {{< /accordion >}}

#### 11. Delete a Service
   {{< accordion "kubectl delete service: Remove a service" >}}
   Delete a specific service.
   <br>
   ```bash
   kubectl delete service service_name
   ```
   {{< /accordion >}}

#### 12. Config Maps
   {{< accordion "kubectl create configmap: Create a config map" >}}
   Create a config map to store configuration data.
   <br>
   ```bash
   kubectl create configmap config-map-name --from-file=path/to/config/files
   ```
   {{< /accordion >}}

#### 13. Secrets
   {{< accordion "kubectl create secret: Create a secret" >}}
   Create a secret to store sensitive information.
   <br>
   ```bash
   kubectl create secret generic secret-name --from-literal=key=value
   ```
   {{< /accordion >}}

#### 14. Get Nodes
   {{< accordion "kubectl get nodes: List all nodes in the cluster" >}}
   View information about all nodes in the Kubernetes cluster.
   <br>
   ```bash
   kubectl get nodes
   ```
   {{< /accordion >}}

#### 15. Namespace Creation
   {{< accordion "kubectl create namespace: Create a new namespace" >}}
   Establish a new namespace for organizing resources.
   <br>
   ```bash
   kubectl create namespace my-namespace
   ```
   {{< /accordion >}}

