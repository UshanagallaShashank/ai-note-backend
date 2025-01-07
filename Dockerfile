# First stage: Install dependencies and Puppeteer
FROM ghcr.io/puppeteer/puppeteer:19.7.2 AS puppeteer-base

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Copy the package.json files for dependencies
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npx playwright install

# Second stage: Final image for running the app
FROM node:16 AS final

# Set working directory in the final image
WORKDIR /app

# Copy necessary files from the Puppeteer image (dependencies and installation)
COPY --from=puppeteer-base /app /app

# Copy the rest of your application files
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
