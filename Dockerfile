FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_STRIPE_PUBLISHABLE_KEY=
ARG VITE_API_BASE_URL=
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:20-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/app/data/massar.db

COPY package*.json ./
RUN npm ci --omit=dev \
    && npm rebuild better-sqlite3 \
    && npm cache clean --force

RUN mkdir -p /app/data && chown -R node:node /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/server.js ./

USER node

VOLUME ["/app/data"]

EXPOSE 3000

CMD ["node", "server.js"]
