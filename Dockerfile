# ===============================
# Multi‑stage Dockerfile for DeployFlow
# ===============================
# --------------------------------------------------------------
# 1️⃣ Build the React/Vite front‑end (produces static files)
# --------------------------------------------------------------
FROM node:20-alpine AS ui-builder
WORKDIR /ui
# Install only package definitions first – improves layer caching
COPY package*.json .
RUN npm ci
# Copy the source needed for the UI build
COPY src/ ./src
COPY vite.config.ts tsconfig.json index.html .
# Build the UI – Vite outputs to /ui/dist
RUN npm run build

# --------------------------------------------------------------
# 2️⃣ Build the TypeScript back‑end (produces compiled JS)
# --------------------------------------------------------------
FROM node:20-alpine AS api-builder
WORKDIR /api
COPY package*.json .
RUN npm ci
# Copy server source and tsconfig
COPY server.ts .
COPY src/ ./src
COPY tsconfig.json .
# Compile TypeScript – output goes to /api/dist
RUN npx tsc

# --------------------------------------------------------------
# 3️⃣ Runtime image – Nginx serves the UI, Node runs the API
# --------------------------------------------------------------
FROM nginx:alpine AS runtime
# Copy static UI files into Nginx's html directory
COPY --from=ui-builder /ui/dist /usr/share/nginx/html
# Install Node (the lightweight runtime) for the API
RUN apk add --no-cache nodejs
# Copy compiled back‑end files and node_modules
COPY --from=api-builder /api/dist /app/dist
COPY --from=api-builder /api/node_modules /app/node_modules
# Expose ports – 80 for UI, 8000 (default in server.ts) for API
EXPOSE 80 8000
# -----------------------------------------------------------------
# Entrypoint script: start the back‑end in the background, then Nginx
# -----------------------------------------------------------------
COPY <<'EOF' /docker-entrypoint.sh
#!/bin/sh
# Start API (listening on $API_PORT or default 8000)
node /app/dist/server.js &
# Run nginx in the foreground so the container stays alive
exec nginx -g 'daemon off;'
EOF
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
