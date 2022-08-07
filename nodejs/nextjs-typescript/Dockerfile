FROM node:16-alpine

# Defaults to production, docker-compose overrides this to development on build and run.
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app
RUN chown node:node /app

COPY package*.json .

RUN npm ci --production \
    && npm run build \
    && npm clear-cache

COPY . .

USER node

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]