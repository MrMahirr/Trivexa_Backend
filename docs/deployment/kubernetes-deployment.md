# Kubernetes Deployment Strategy

This document outlines the Kubernetes resources required to deploy Trivexa Backend into a cluster (EKS, GKE, or DigitalOcean).

## 1. Architecture Overview

- **Deployment**: Manages the stateless NestJS application pods.
- **Service**: Exposes the pods internally.
- **Ingress**: Exposes the service to the internet via Load Balancer.
- **ConfigMap**: Stores non-sensitive environment variables.
- **Secret**: Stores sensitive credentials (DB Password, JWT Secret).

## 2. Resources

### 2.1 Deployment (`deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trivexa-backend
spec:
  replicas: 2  # High Availability
  selector:
    matchLabels:
      app: trivexa-backend
  template:
    metadata:
      labels:
        app: trivexa-backend
    spec:
      containers:
        - name: trivexa-backend
          image: ghcr.io/trivexa/backend:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: trivexa-config
            - secretRef:
                name: trivexa-secrets
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

### 2.2 Service (`service.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: trivexa-backend-svc
spec:
  selector:
    app: trivexa-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

### 2.3 Ingress (`ingress.yaml`)

Depending on the Ingress Controller (e.g., Nginx, ALB):

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: trivexa-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - api.trivexa.com
      secretName: trivexa-tls
  rules:
    - host: api.trivexa.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: trivexa-backend-svc
                port:
                  number: 80
```

## 3. Configuration Management

### 3.1 ConfigMap
Variables like `NODE_ENV`, `PORT`.

### 3.2 Secrets
Managed via **External Secrets Operator** (fetching from AWS Secrets Manager) or manually created sealed secrets.

## 4. Scaling (HPA)

**Horizontal Pod Autoscaler** automatically scales pods based on CPU/Memory usage.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: trivexa-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: trivexa-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```
