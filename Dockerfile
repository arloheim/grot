# Run the app using NodeJS
FROM node:23-alpine
VOLUME /app/data
WORKDIR /app

COPY . ./
RUN npm install

EXPOSE 8080
CMD ["node", "src/main.js"]
