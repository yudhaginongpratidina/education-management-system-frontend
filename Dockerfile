# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM oven/bun:alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile


# ============================================================
# Stage 2: Builder
# ============================================================
FROM oven/bun:alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build


# ============================================================
# Stage 3: Runner
# ============================================================
FROM oven/bun:alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone server
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# ============================================================
# Create non-root user
# ============================================================
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# ============================================================
# Copy Next.js standalone output
# ============================================================

# Public assets
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/public \
    ./public

# Next.js standalone server
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/standalone \
    ./

# Static assets
COPY --from=builder \
    --chown=nextjs:nodejs \
    /app/.next/static \
    ./.next/static

# ============================================================
# Runtime environment entrypoint
# ============================================================
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

# ============================================================
# Run as non-root
# ============================================================
USER nextjs

# ============================================================
# Application port
# ============================================================
EXPOSE 3000

# ============================================================
# Start application
# ============================================================
ENTRYPOINT ["./entrypoint.sh"]