FROM node:14.15.4
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install --only=prod
