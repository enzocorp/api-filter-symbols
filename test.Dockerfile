#Build app from typescript

FROM node:14.15.4 as build-step
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN rm -rf dist
RUN npm install
RUN npm run build

#Use javascript App

FROM node:14.15.4
WORKDIR /usr/src/app
COPY --from=build-step /usr/src/app/ .
RUN npm install
