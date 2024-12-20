FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*","angular.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../ --force
COPY . .
EXPOSE 4200
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
