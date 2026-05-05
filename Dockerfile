FROM node:20-slim AS build-env
WORKDIR /app
COPY . .
RUN npm install
RUN npm --prefix client install
RUN npm --prefix client run build

FROM node:20-slim
RUN apt-get update && apt-get install -y python3 make g++ # Necessário para compilar o sqlite3
WORKDIR /app
COPY --from=build-env /app .

RUN npm install --production
RUN npm --prefix ./node_modules/sqlite3 install

RUN mkdir -p /data/images

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server.js"]