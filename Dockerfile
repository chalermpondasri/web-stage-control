# syntax=docker/dockerfile:1
FROM node:20.18-alpine AS base

USER root
RUN apk add tzdata && \
    ln -s /usr/share/zoneinfo/Asia/Bangkok /etc/localtime

WORKDIR /src

COPY tsconfig.build.json .
COPY nest-cli.json .
COPY package*.json .

COPY tsconfig.json .
COPY apps ./apps
COPY libs ./libs
COPY static ./static

USER root
RUN npm install
RUN npm run build:auth \
    && npm run build:migration \
    && npm run build:mq \
    && npm run build:search \
    && npm run build:broadcast

USER node
EXPOSE 3000
CMD ["node", "dist/apps/auth"]

