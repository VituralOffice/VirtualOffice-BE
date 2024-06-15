FROM node:18-alpine as builder
ENV NODE_ENV build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN  npm run build

FROM node:18-alpine as production
ENV NODE_ENV production
#Debug colyseus
ENV DEBUG colyseus:* 
WORKDIR /app
COPY --from=builder  /app/package*.json ./
COPY --from=builder  /app/node_modules/ ./node_modules/
COPY --from=builder  /app/dist/ ./dist/
EXPOSE 2567
CMD ["node", "dist/main.js"]