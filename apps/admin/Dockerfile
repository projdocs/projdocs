# docker build -f apps/admin/Dockerfile . -t projdocs/admin:local --build-arg=VERSION=v0.0.0
FROM node:24-alpine AS base

ARG VERSION
RUN test -n "$VERSION"
ENV VERSION=$VERSION

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/ ./packages
COPY apps/admin/package.json ./apps/admin/package.json
RUN npm ci

FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules ./apps/admin/node_modules
COPY --from=deps /app/packages ./packages
COPY package.json package-lock.json ./
COPY apps/admin/ ./apps/admin

ARG VERSION
RUN test -n "$VERSION"

ENV VERSION=$VERSION
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_VERSION=$VERSION

RUN npm --workspace apps/admin run build

FROM base AS runner

WORKDIR /app

ARG VERSION
RUN test -n "$VERSION"

# runtime env
ENV VERSION=$VERSION
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV VERSION=$VERSION

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "/app/apps/admin/server.js"]