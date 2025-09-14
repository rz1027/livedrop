
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install || true
COPY tsconfig.json .eslintrc.json ./
COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations
EXPOSE 4000
CMD ["npm","run","dev"]
