# syntax=docker/dockerfile:1

FROM node:26-alpine3.24 AS deps
RUN apk add --no-cache binutils \
    && strip --strip-all /usr/local/bin/node
RUN npm install --global pnpm@12.5.1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM alpine:3.24 AS runtime
RUN apk add --no-cache libatomic libstdc++ ca-certificates supercronic su-exec \
    && addgroup -S node \
    && adduser -S -G node -h /app node
COPY --from=deps /usr/local/bin/node /usr/local/bin/node
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node db/migrations ./db/migrations
COPY --chown=node:node db/migrations ./migrations
RUN mkdir -p /app/db /app/logs && chown node:node /app/db /app/logs
ARG APP_VERSION=0.0.0
LABEL org.opencontainers.image.version=$APP_VERSION
ENV APP_VERSION=$APP_VERSION
COPY --chmod=755 --chown=node:node entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
