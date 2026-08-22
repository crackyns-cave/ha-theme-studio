# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install bash and js-yaml globally for build scripts
RUN apk add --no-cache bash && \
    npm install -g js-yaml

# Copy backend
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend/package.json /app/backend/package.json

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy build scripts
COPY build.js /app/
COPY build-all.js /app/
COPY package.json /app/

# Copy default framework (to be copied to /framework if empty)
COPY default-framework /app/default-framework

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Create volume mount points
RUN mkdir -p /framework /output

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3000 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "backend/dist/index.js"]
