# Use the official Node.js image as a base
FROM node:16

# Install Puppeteer and set the Chromium executable path
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory inside the container
WORKDIR /app

# Ensure that the app directory and its files have correct permissions
RUN chown -R root:root /app
RUN chmod -R 755 /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies as root user
USER root
RUN npm install

# Install Playwright dependencies
RUN npx playwright install

# Copy the rest of the application files
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
