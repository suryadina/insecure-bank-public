FROM node:18-alpine

WORKDIR /app

RUN mkdir -p /app/data

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8081

CMD ["npm", "start"]