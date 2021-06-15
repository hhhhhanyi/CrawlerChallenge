FROM node:12.18.1
ENV NODE_ENV=production
COPY . /app
WORKDIR /app

RUN npm install
