# Dockerfile
FROM node:20-alpine

WORKDIR /src/app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start"]
