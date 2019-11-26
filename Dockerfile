FROM node:12

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
ENTRYPOINT [ "bin/www" ]

EXPOSE 3000
