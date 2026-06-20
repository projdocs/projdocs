ARG NODE_VERSION=26.3.0-slim
FROM node:${NODE_VERSION} AS base

ARG VERSION
RUN test -n "$VERSION"

FROM base AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ ./packages
COPY apps/web/package.json ./apps/web/package.json

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

FROM base AS builder

ARG VERSION
RUN test -n "$VERSION"

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/packages ./packages
COPY package.json package-lock.json ./
COPY apps/web/ ./apps/web

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV VERSION=$VERSION
ENV NEXT_PUBLIC_VERSION=$VERSION

RUN --mount=type=cache,target=/app/.next/cache \
    npm --workspace apps/web run build

FROM base AS runner
WORKDIR /app

ARG VERSION
RUN test -n "$VERSION"

# runtime env
ENV VERSION=$VERSION
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV VERSION=$VERSION
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/.next/cache ./apps/web/.next/cache

USER node:node

EXPOSE 3000
CMD ["node", "/app/apps/web/server.js"]