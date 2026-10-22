# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:$PATH"
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM alpine:3.24 AS runtime
RUN apk add --no-cache nodejs ca-certificates \
    && addgroup -S node \
    && adduser -S -G node -h /app node
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node db/migrations ./db/migrations
RUN mkdir -p /app/db /app/logs && chown node:node /app/db /app/logs
USER node
CMD ["node", "./src/index.ts"]
