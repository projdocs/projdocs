FROM alpine:3.23.4 AS base

# Create a non-root user and group for runtime
RUN addgroup -S projdocs && \
    adduser -S -G projdocs -H -D projdocs

# Trust anchors for TLS verification
RUN apk add --no-cache ca-certificates


FROM golang:1.26-alpine AS build
ARG VERSION

RUN if [ -z "${VERSION}" ]; then \
      echo "VERSION is unset" && exit 1; \
    else \
      echo "building for VERSION=$VERSION"; \
    fi

RUN apk add --no-cache make

WORKDIR /app

# cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# build
COPY . .
RUN make prod VERSION="$VERSION"

FROM base AS run

COPY --from=build /app/bin/projdocs-api /usr/local/bin/projdocs-api

# drop to non-root for all subsequent instructions and at runtime
USER projdocs

ENTRYPOINT ["/usr/local/bin/projdocs-api"]