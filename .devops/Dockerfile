# Use the desired Node.js version
FROM node:22.12.0-slim

# Create and set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json first for dependency installation
COPY package.json package-lock.json ./

# Configure npm to run with unsafe-perm
RUN npm config set unsafe-perm true

# Install dependencies
RUN npm install

# Copy the remaining project files
COPY . .

# Build the Strapi app for production
RUN NODE_ENV=production npm run build

# Expose the default Strapi port (adjust if necessary)
EXPOSE 1337

# Start the Strapi app in production mode
CMD ["npm", "run", "start"]
