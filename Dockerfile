# ---- Builder ----
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# ---- Runtime ----
FROM node:22-slim AS runtime
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY prisma ./prisma
RUN pnpm install --prod --frozen-lockfile
RUN pnpm exec prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma db push --skip-generate && node dist/app.js"]
