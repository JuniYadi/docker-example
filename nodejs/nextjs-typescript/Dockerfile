FROM node:16-alpine

WORKDIR /app
RUN chown node:node /app
USER node

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY package*.json .
COPY . .

RUN npm ci --production \
    && npm run build \
    && npm clear-cache

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]