FROM node:17-slim

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY ./job_scheduler/server/package*.json ./

RUN npm install

COPY ./job_scheduler/server .

CMD ["npm", "start"]
