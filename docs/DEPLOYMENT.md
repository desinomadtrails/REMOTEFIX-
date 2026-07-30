# RemoteFix Deployment & Operations Guide

## Prerequisites
- Node.js 20.x or higher
- Docker & Docker Compose
- Kubernetes Cluster (AKS, EKS, or GKE)
- Azure SQL Database instance

## Quick Local Deployment with Docker Compose
```bash
# 1. Clone repository & install dependencies
git clone https://github.com/remotefix/remotefix.git
cd remotefix
npm ci

# 2. Run automated test suite
npm run test

# 3. Build production monorepo bundles
npm run build

# 4. Spin up local containers
docker-compose up -d --build
```

## Kubernetes Production Deployment
```bash
# Apply production secrets and deployment manifests
kubectl apply -f k8s/production-deployment.yaml

# Verify pod status and readiness probes
kubectl get pods -n remotefix-prod
```
