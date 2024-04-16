FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 
FROM node:18-alpine as production
WORKDIR /app
COPY /app/dist /app/dist
EXPOSE 4000
CMD [ "node", 'dist/main.js' ]