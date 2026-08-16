# ---------- Builder ----------
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsdown.config.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

# ---------- Runtime ----------
FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=info

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

RUN chown -R node:node /app/public
USER node

EXPOSE 5000

CMD ["npm", "start"]
