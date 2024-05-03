FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS deploy
WORKDIR /usr/src/app

COPY package.json ./
COPY --from=build /usr/src/app/build/ ./
#RUN npm ci --omit dev

CMD ["node", "index.js"]
