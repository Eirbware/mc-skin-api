FROM node:21-alpine

## BUILD STAGE
WORKDIR /app

COPY package*.json tsconfig.json .
RUN npm install --only=dev
COPY src .
RUN npm run build

## PRODUCTION STAGE
ENV NODE_ENV=production

RUN rm -rf node_modules/* src/ tsconfig.json
RUN npm ci --only=production

COPY accessories/ .
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]