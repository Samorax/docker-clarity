FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN npm install -g @angular/cli
COPY ["package.json", "package-lock.json*","angular.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --legacy-peer-deps
COPY . .
RUN ng build --coniguration=production
EXPOSE 4200
CMD ["ng", "serve"]
