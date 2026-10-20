# Multi-stage Dockerfile pour TuniJobs NestJS API
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/database ./packages/database
COPY apps/api ./apps/api

RUN npm ci

RUN npm run --workspace=@tunijobs/shared-types build
RUN npm run --workspace=@tunijobs/database prisma generate
RUN npm run --workspace=@tunijobs/database build
RUN npm run --workspace=@tunijobs/api build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package*.json ./apps/api/

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
