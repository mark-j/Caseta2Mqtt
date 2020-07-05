FROM node:alpine AS build
WORKDIR /usr/src/build
COPY . .
RUN npm install
RUN npm run build

FROM node:alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/build/dist/* ./
EXPOSE 4600
CMD [ "node", "index.js" ]
