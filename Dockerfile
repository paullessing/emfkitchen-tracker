FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS deploy
WORKDIR /usr/src/app

COPY package.json .env ./
COPY --from=build /usr/src/app/build/ ./

CMD ["node", "index.js"]
