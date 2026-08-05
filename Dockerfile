# ==========================================
# REMOTEFIX ENTERPRISE PRODUCTION DOCKERFILE
# Multi-Stage Production Build for API Engine
# ==========================================

# ── Stage 1: Build Dependencies & Packages ──
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root manifest & tsconfig
COPY package*.json tsconfig.json ./

# Copy workspace package manifests for optimized layer caching
COPY packages/auth/package*.json ./packages/auth/
COPY packages/database/package*.json ./packages/database/
COPY packages/types/package*.json ./packages/types/
COPY packages/ui/package*.json ./packages/ui/
COPY packages/utils/package*.json ./packages/utils/

COPY apps/admin/package*.json ./apps/admin/
COPY apps/api/package*.json ./apps/api/
COPY apps/mobile/package*.json ./apps/mobile/
COPY apps/web/package*.json ./apps/web/

RUN npm ci

# Copy source tree after cached npm ci
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN npm run build

# ── Stage 2: Production Execution Runtime ──
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 8787

WORKDIR /app/apps/api

CMD ["node", "dist/server.js"]
