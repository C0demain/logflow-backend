FROM node:22-alpine

COPY . .
WORKDIR /app

EXPOSE 3001
CMD [ "node", "--version" ]
