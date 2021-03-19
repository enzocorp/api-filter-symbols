FROM node:14.15.4
WORKDIR /usr/src/app
COPY ./dist /usr/src/app/dist
COPY ./package.json /usr/src/app/
COPY ./package-lock.json /usr/src/app/
RUN npm install --only=prod
