# Use Node.js 20 on Alpine Linux (lightweight)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose port 8000
EXPOSE 8000

# Start the application
CMD ["node", "src/index.js"]
