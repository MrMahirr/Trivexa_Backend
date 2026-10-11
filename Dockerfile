# ============================================
# Build Stage
# ============================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /usr/src/app

# Copy package files (layer caching optimization)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Copy source code (after npm ci for better layer caching)
COPY . .

# Build the application
RUN npm run build && \
    npm prune --production && \
    npm cache clean --force

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS production

# Install production runtime dependencies only
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy necessary runtime files
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY docker/entrypoint.sh ./entrypoint.sh

# Fix line endings and set permissions
RUN sed -i 's/\r$//' entrypoint.sh && \
    chmod +x entrypoint.sh && \
    chown -R node:node /usr/src/app

# Switch to non-root user for security
USER node

# Expose application port
EXPOSE 3500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3500/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["./entrypoint.sh"]
