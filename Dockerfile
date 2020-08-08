FROM node:alpine AS build
WORKDIR /usr/src/build
COPY . .
RUN npm run build
RUN apk update && apk add jq
RUN jq .version package.json -r > dist/version.txt

FROM node:alpine
WORKDIR /usr/src/app
COPY --from=build /usr/src/build/dist/ ./
EXPOSE 4600
CMD echo "Caseta2Mqtt v$(cat version.txt)" && node index.js
