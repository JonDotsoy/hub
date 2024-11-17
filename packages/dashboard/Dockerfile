FROM node:alpine AS base
WORKDIR /usr/src/app

FROM base AS build
ADD package.json .
RUN npm install
ADD . .
RUN npm run build

FROM base
ADD package.json .
RUN npm install --only=prod
COPY --from=build /usr/src/app/dist dist

ENV PORT=4321
EXPOSE 4321

CMD [ "node", "dist/server/entry.mjs" ]
