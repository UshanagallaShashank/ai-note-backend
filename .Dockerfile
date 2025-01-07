FROM node:16

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npx playwright install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
