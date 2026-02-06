#!/bin/bash

# ==========================================
# 完整部署脚本（支持GitHub + Vercel/腾讯云）
# 用法: bash deploy-full.sh [github|tencent]
# ==========================================

set -e

DEPLOY_TARGET="${1:-tencent}"
APP_NAME="knowledge-creator"
APP_DIR="/root/$APP_NAME"

green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
red() { echo -e "\033[31m$1\033[0m"; }

echo "🚀 开始部署到: $DEPLOY_TARGET"

# ======== GitHub 部署部分 ========
if [ "$DEPLOY_TARGET" = "github" ]; then
    echo "📦 准备推送到 GitHub..."
    
    # 检查git配置
    if [ -z "$(git config --global user.email)" ]; then
        git config --global user.email "deploy@knowledge-creator.app"
        git config --global user.name "Deploy Bot"
    fi
    
    # 添加所有更改
    git add .
    git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
    
    # 推送到GitHub
    echo "📤 推送到 GitHub..."
    git push origin main || {
        red "❌ 推送失败，请检查："
        echo "   1. 是否已配置远程仓库: git remote -v"
        echo "   2. 是否有权限推送"
        echo "   3. 是否需要先拉取更新: git pull origin main"
        exit 1
    }
    
    green "✅ 代码已推送到 GitHub"
    echo ""
    echo "🌐 现在可以去 Vercel 部署："
    echo "   1. 访问 https://vercel.com"
    echo "   2. Import GitHub 仓库"
    echo "   3. 配置环境变量"
    echo "   4. Deploy"
    
    exit 0
fi

# ======== 腾讯云部署部分 ========
if [ "$DEPLOY_TARGET" = "tencent" ]; then
    echo "☁️  开始腾讯云服务器部署..."
    
    # 1. 系统检查
    echo "📋 检查系统环境..."
    
    # 安装Node.js 20
    if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
        yellow "安装 Node.js 20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    green "✅ Node.js: $(node -v)"
    
    # 安装PM2
    if ! command -v pm2 &> /dev/null; then
        yellow "安装 PM2..."
        npm install -g pm2
    fi
    
    # 安装Nginx
    if ! command -v nginx &> /dev/null; then
        yellow "安装 Nginx..."
        apt-get install -y nginx
    fi
    
    # 2. 进入项目目录
    cd "$APP_DIR"
    
    # 3. 安装依赖
    yellow "📦 安装依赖..."
    npm install --production
    
    # 4. 检查环境变量
    if [ ! -f ".env.local" ]; then
        red "❌ 缺少 .env.local 文件"
        echo "请创建 .env.local 并配置："
        echo "  - DATABASE_URL"
        echo "  - KIMI_CODE_API_KEY"
        echo "  - JWT_SECRET"
        exit 1
    fi
    
    # 5. 数据库迁移
    yellow "🗄️  数据库迁移..."
    npx prisma generate
    npx prisma migrate deploy --preview-feature 2>/dev/null || true
    
    # 6. 构建
    yellow "🔨 构建项目..."
    npm run build
    
    # 7. PM2管理
    yellow "🚀 启动服务..."
    
    # 创建或更新PM2配置
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'knowledge-creator',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/err.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF
    
    mkdir -p logs
    
    # 重启或启动
    pm2 describe knowledge-creator > /dev/null 2>&1 && \
        pm2 reload knowledge-creator || \
        pm2 start ecosystem.config.js
    
    pm2 save
    
    # 8. Nginx配置
    yellow "🌐 配置 Nginx..."
    
    SERVER_IP=$(curl -s ip.sb 2>/dev/null || hostname -I | awk '{print $1}')
    
    cat > /etc/nginx/sites-available/knowledge-creator << EOF
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/knowledge-creator /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t && systemctl restart nginx
    
    # 9. 防火墙
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    # 完成
    echo ""
    echo "========================================"
    green "🎉 部署完成！"
    echo "========================================"
    echo ""
    echo "📱 访问地址: http://$SERVER_IP"
    echo "📊 查看状态: pm2 status"
    echo "📜 查看日志: pm2 logs knowledge-creator"
    echo "🔄 重启服务: pm2 restart knowledge-creator"
    echo ""
    
    exit 0
fi

echo "用法: bash deploy-full.sh [github|tencent]"
exit 1
