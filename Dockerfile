# Base stage
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
# Using npm ci to ensure exact versions from package-lock.json
RUN npm ci

# Bundle app source
COPY . .

# Build the app to "dist" folder
RUN npm run build

# ---

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy entrypoint script for auto-migration
COPY docker/entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Use a non-root user
USER node

# Expose standard port
EXPOSE 3500

# Start with entrypoint (runs migrations then starts app)
ENTRYPOINT [ "./entrypoint.sh" ]
