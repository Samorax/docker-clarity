FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*","angular.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --legacy-peer-deps -include=dev --production --silent 
COPY . .

RUN npm run build --prod
EXPOSE 4200

CMD ["npm", "start"]
