# ===============================
# Stage 1: Build React/Vite frontend
# ===============================
FROM node:20-alpine AS ui-builder

WORKDIR /ui

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY vite.config.ts tsconfig.json index.html ./

RUN npm run build


# ===============================
# Stage 2: Build TypeScript backend
# ===============================
FROM node:20-alpine AS api-builder

WORKDIR /api

COPY package*.json ./
RUN npm ci

COPY server.ts ./
COPY src/ ./src/
COPY tsconfig.json ./

RUN npx tsc


# ===============================
# Stage 3: Production runtime
# ===============================
FROM nginx:alpine

RUN apk add --no-cache nodejs

# Frontend
COPY --from=ui-builder /ui/dist /usr/share/nginx/html

# Backend
COPY --from=api-builder /api/dist /app/dist
COPY --from=api-builder /api/node_modules /app/node_modules

EXPOSE 80
EXPOSE 8000

COPY <<'EOF' /docker-entrypoint.sh
#!/bin/sh

echo "Starting DeployFlow API..."
node /app/dist/server.js &

echo "Starting Nginx..."
exec nginx -g 'daemon off;'
EOF

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]