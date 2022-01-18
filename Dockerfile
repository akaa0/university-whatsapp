FROM node

WORKDIR /home/node/app

RUN apt update && apt install -y chromium

COPY package.json .

RUN npm i

COPY whatsapp.js .env session.json ./

EXPOSE 3000

