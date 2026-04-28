---
title: Deploying with Kubernetes: A Practical Guide
author: Priya Nair
date: 2025-04-18
tags: [kubernetes, devops, cloud, containers]
images:
  - https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80
  - https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80
---

# Deploying with Kubernetes: A Practical Guide

Kubernetes has become the de facto standard for container orchestration. This guide cuts through the noise and focuses on what you actually need to ship production workloads.

## Core Concepts

| Concept | What it does |
|---------|-------------|
| Pod | Smallest deployable unit, wraps one or more containers |
| Deployment | Manages replica sets and rolling updates |
| Service | Stable network endpoint for a set of pods |
| Ingress | Routes external HTTP traffic to services |

## A Minimal Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-server
  template:
    metadata:
      labels:
        app: api-server
    spec:
      containers:
      - name: api
        image: myorg/api:v2.1.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
```

## Health Checks Matter

Always configure liveness and readiness probes. Without them, Kubernetes can't distinguish a crashed pod from a healthy one.

## Rolling Updates

Zero-downtime deployments are built-in. Set `maxSurge: 1` and `maxUnavailable: 0` for a conservative rollout strategy that never takes your service offline.

## Final Thoughts

Start simple. One namespace, one deployment, one service. Add complexity only when the need is proven.
