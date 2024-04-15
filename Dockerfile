FROM node:18-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY --chown=node:node . .
RUN  npm run build

FROM node:18-alpine as production
ENV NODE_ENV production
USER node
WORKDIR /app

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /app/dist/ ./dist/
EXPOSE 2567
CMD ["node", "dist/main.js"]