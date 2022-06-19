FROM node:16.15.0-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "./index.mjs"]