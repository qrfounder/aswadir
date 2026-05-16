FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/app/data/massar.db

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

RUN mkdir -p /app/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/server.js ./
COPY --from=builder /app/api ./api

VOLUME ["/app/data"]

EXPOSE 3000 80

CMD ["node", "server.js"]
