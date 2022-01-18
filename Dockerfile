FROM node:alpine

WORKDIR /home/node/app

COPY package.json .

RUN npm i

EXPOSE 8888

