FROM node:20-alpine

RUN mkdir /app \
    && chown node:users /app

WORKDIR /app

USER node:users

COPY ./package*.json* ./

RUN export npm_config_cache=$(mktemp -d)  \
    && NODE_ENV=production npm ci \
    && rm -rf $npm_config_cache

COPY ./src/* ./src/

CMD ["node","./src/daemon.js"]
