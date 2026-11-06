# Multi-stage Dockerfile for Steamer (Next.js 14 App Router + Prisma + SQLite)

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment fallbacks
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="file:./steamer.db"

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/prisma/steamer.db"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install both libc6-compat and openssl for Prisma engine compatibility on Alpine
RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy prisma schema and pre-seeded database
COPY --from=builder /app/prisma ./prisma
# Keep a permanent seed copy in prisma_seed to survive empty volume mounts
COPY --from=builder /app/prisma ./prisma_seed
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy startup entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && chown -R nextjs:nodejs /app/prisma

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
