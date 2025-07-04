# Use official Node.js runtime as the base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies and handle bcrypt/bcryptjs like the pipeline does
RUN npm install && \
    npm uninstall bcrypt || true && \
    npm install bcryptjs && \
    npm cache clean --force

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy the rest of the application code
COPY . .

# Apply the same bcrypt to bcryptjs replacement as in pipeline
RUN find . -name "*.js" -not -path "./node_modules/*" -exec sed -i 's/require("bcrypt")/require("bcryptjs")/g' {} \; && \
    find . -name "*.js" -not -path "./node_modules/*" -exec sed -i "s/require('bcrypt')/require('bcryptjs')/g" {} \;

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose the port your app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Optional: Add health check only if you have a health endpoint
# Remove or modify this if you don't have a /health route
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
#         process.exit(res.statusCode === 200 ? 0 : 1); \
#     }).on('error', () => process.exit(1))"

# Define the command to run your application
CMD ["npm", "start"]