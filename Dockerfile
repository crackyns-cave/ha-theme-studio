# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend directory only
COPY frontend ./

RUN npm install
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend directory only
COPY backend ./

RUN npm install
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install bash
RUN apk add --no-cache bash

# Copy package.json and install dependencies (including js-yaml)
COPY package.json /app/
RUN npm install --production

# Copy backend
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend/package.json /app/backend/package.json

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy build scripts
COPY build.js /app/
COPY build-all.js /app/

# Copy default framework (to be copied to /framework if empty)
COPY default-framework /app/default-framework

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Create volume mount points
RUN mkdir -p /framework /output /assets

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Note: We start as root to fix volume permissions, then drop to app user in entrypoint

EXPOSE 3000 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "backend/dist/index.js"]
