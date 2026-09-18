FROM node:18-alpine

WORKDIR /app

RUN mkdir -p /app/data

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8082

CMD ["npm", "start"]