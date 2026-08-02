FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app

# Copy monorepo root config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
RUN npm install -g pnpm

# Copy source code
COPY apps/web ./apps/web
COPY packages/database ./packages/database
COPY packages/types ./packages/types
COPY packages/validators ./packages/validators
COPY packages/auth ./packages/auth

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @inventorypro/database generate
RUN pnpm build --filter @inventorypro/web...

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set to production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# server.js is created by next build from the standalone output
CMD ["node", "apps/web/server.js"]
