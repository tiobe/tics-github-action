FROM node:26-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  curl \
  ca-certificates \
  git \
  unzip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY ../dist/* .

ENTRYPOINT ["node", "/app/index.js"]
