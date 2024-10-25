# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

USER root
RUN apk add tzdata && \
    ln -s /usr/share/zoneinfo/Asia/Bangkok /etc/localtime

RUN apk add --no-cache bash curl && curl -1sLf \
'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash \
&& apk add infisical



WORKDIR /src

COPY tsconfig.build.json .
COPY nest-cli.json .
COPY package*.json .

COPY tsconfig.json .
COPY apps ./apps
COPY libs ./libs

#
FROM base AS build
WORKDIR /src
USER root
RUN npm install
RUN npm run build:auth
RUN npm run build:search
RUN npm run build:mq


USER node
EXPOSE 3000
CMD ["node", "dist/apps/auth"]

