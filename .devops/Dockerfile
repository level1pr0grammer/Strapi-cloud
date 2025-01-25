# Use the desired Node.js version
FROM node:22.12.0-slim

# Create an application directory
RUN mkdir /app

# Copy project files into the container
COPY . /app

# Set the working directory
WORKDIR /app

# Configure npm to run with unsafe-perm
RUN echo "unsafe-perm = true" >> ~/.npmrc

# Install Strapi globally (adjust version as needed)
RUN npm install -g strapi@latest

# Install dependencies
RUN npm install

# Expose port 80
EXPOSE 80

# Build the Strapi app for production
RUN NODE_ENV=production npm run build

# Start the Strapi app in production mode
CMD ["npm", "run", "start"]
