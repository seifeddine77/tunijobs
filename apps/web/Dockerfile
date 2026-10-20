# Multi-stage Dockerfile pour TuniJobs Next.js Web
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/database ./packages/database
COPY apps/web ./apps/web

RUN npm ci

RUN npm run --workspace=@tunijobs/shared-types build
RUN npm run --workspace=@tunijobs/web build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package*.json ./apps/web/

EXPOSE 3000
CMD ["npm", "run", "--workspace=@tunijobs/web", "start"]
