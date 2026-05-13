# 多阶段构建 —— 在容器内编译，无需本地预构建
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci


FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建时参数（NEXT_PUBLIC_* 内联到客户端代码，运行时修改无效）
ARG NEXT_PUBLIC_FAMILY_SURNAME="张"
ARG NEXT_PUBLIC_LOGIN_USERNAME
ARG NEXT_PUBLIC_LOGIN_PASSWORD
ENV NEXT_PUBLIC_FAMILY_SURNAME=$NEXT_PUBLIC_FAMILY_SURNAME
ENV NEXT_PUBLIC_LOGIN_USERNAME=$NEXT_PUBLIC_LOGIN_USERNAME
ENV NEXT_PUBLIC_LOGIN_PASSWORD=$NEXT_PUBLIC_LOGIN_PASSWORD

RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# standalone 输出含 server.js 和外部依赖（sql.js, bcryptjs）
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://0.0.0.0:3000/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
