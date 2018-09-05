FROM node:10-alpine

WORKDIR /usr/src

COPY package*.json ./

RUN npm install && \
    mv /usr/src/node_modules /node_modules

COPY ./src .

EXPOSE 8080

CMD ["node", "server/server.js"]