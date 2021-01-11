FROM node:14.15.4
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install
