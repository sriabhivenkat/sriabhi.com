# Dockerfile
FROM node:20-alpine

WORKDIR /src/app
COPY . .

ARG NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN

RUN npm install --legacy-peer-deps
RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start"]
