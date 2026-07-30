# ==========================================
# REMOTEFIX ENTERPRISE PRODUCTION DOCKERFILE
# Multi-Stage Build for API Engine & Node Server
# ==========================================

# ── Stage 1: Build Dependencies & Packages ──
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN npm ci
RUN npm run build

# ── Stage 2: Production Execution Runtime ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

EXPOSE 8787

CMD ["npm", "run", "start", "--workspace=apps/api"]
