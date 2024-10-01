# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

USER root
RUN apk add tzdata && \
    ln -s /usr/share/zoneinfo/Asia/Bangkok /etc/localtime

RUN npm i -g pnpm
RUN pnpm config set store-dir /pnpm/store

WORKDIR /src

COPY tsconfig.build.json .
COPY nest-cli.json .
COPY package.json .
COPY pnpm-lock.yaml .

COPY tsconfig.json .
COPY apps ./apps
COPY libs ./libs
COPY templates ./templates

#
FROM base AS build
WORKDIR /src
USER root

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --silent
RUN pnpm run build:main
RUN pnpm run build:pubsub
RUN pnpm run build:search
RUN pnpm run build:playback
RUN pnpm run build:payment
RUN pnpm run build:migration
RUN pnpm run build:scheduler

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --silent


FROM base AS prod

USER root

WORKDIR /app

COPY --from=build /apps/auth/src/dist ./dist
COPY --from=build /apps/auth/src/templates ./templates
COPY --from=prod-deps /apps/auth/src/node_modules ./node_modules

USER node
EXPOSE 3000
CMD ["node", "dist/apps/main"]

