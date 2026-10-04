# Multi-stage Dockerfile for ResumeForge AI

# Stage 1: Build Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application source and build production bundle
COPY . .
RUN rm -f node_modules/@types/node/ffi.d.ts && npx ng build --configuration production

# Stage 2: Production Nginx Server with runtime env substitution
FROM nginx:alpine

# Install gettext for envsubst utility
RUN apk add --no-cache gettext

# Copy static assets from build stage to Nginx HTML root
COPY --from=build /app/dist/resume-forge-ai /usr/share/nginx/html

# Copy custom Nginx configuration and entrypoint script
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
