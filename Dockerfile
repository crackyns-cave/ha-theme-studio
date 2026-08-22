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

# Create non-root user (default 1000:1000)
ARG USER_ID=1000
ARG GROUP_ID=1000

# Create group and user, handling existing IDs gracefully
# Use shell variable to store the actual username created
RUN set -ex; \
    # Try to create group, or use existing one
    if ! getent group ${GROUP_ID} >/dev/null 2>&1; then \
        addgroup -g ${GROUP_ID} appuser; \
    fi; \
    # Get the actual group name for this GID
    GROUP_NAME=$(getent group ${GROUP_ID} | cut -d: -f1); \
    # Try to create user, or use existing one
    if ! getent passwd ${USER_ID} >/dev/null 2>&1; then \
        adduser -D -u ${USER_ID} -G ${GROUP_NAME} appuser; \
    fi

WORKDIR /app

# Install bash, su-exec (for privilege dropping), and js-yaml
RUN apk add --no-cache bash su-exec && \
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

# Create volume mount points and set ownership of /app only
# Redeclare args for this build stage
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN mkdir -p /framework /output && \
    chown -R ${USER_ID}:${GROUP_ID} /app

# Store user/group IDs for entrypoint
ENV APP_USER_ID=${USER_ID}
ENV APP_GROUP_ID=${GROUP_ID}

# Environment
ENV NODE_ENV=production
ENV PORT=3001

# Note: We start as root to fix volume permissions, then drop to app user in entrypoint

EXPOSE 3000 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "backend/dist/index.js"]
