# Use an official lightweight Node.js runtime environment
FROM node:20-alpine

# Set the secure working directory inside the virtual container
WORKDIR /usr/src/app

# Copy dependency mappings over first to optimize Docker layer caching
COPY package*.json ./

# Install only production-ready clean node modules
RUN npm ci --only=production

# Copy all custom application code into the running directory
COPY . .

# Expose the API port to the internal container network mapping
EXPOSE 5000

# Execute the application server process start engine
CMD ["node", "server.js"]
