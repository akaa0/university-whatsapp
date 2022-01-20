FROM node

WORKDIR /home/node/app

RUN apt update && apt install -y chromium

COPY package.json ./

RUN npm install

COPY whatsapp.js ./

EXPOSE 3000

CMD ["node", "whatsapp.js"]
