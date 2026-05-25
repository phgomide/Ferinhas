FROM node:20-slim AS build-env
WORKDIR /app
COPY . .
RUN npm install
RUN npm --prefix client install
RUN npm --prefix client run build

FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ 

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
COPY --from=build-env /app/client/dist ./client/dist

RUN npm rebuild sqlite3

RUN mkdir -p /data/images

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]