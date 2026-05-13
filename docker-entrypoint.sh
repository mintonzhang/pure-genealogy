#!/bin/sh
set -e

# 初始化数据库和管理员账号
# 若初始化失败，输出警告但不阻止服务启动
echo "[entrypoint] 正在初始化数据库..."
node /app/scripts/init-admin.js || {
    echo "[entrypoint] 警告: 数据库初始化失败，继续启动服务..."
}

echo "[entrypoint] 启动 Next.js 服务..."
# 使用 exec 让 Node.js 成为 PID 1，正确接收 SIGTERM/SIGINT
exec node /app/server.js
