#!/bin/bash

# ==========================================
# 知识创作者工作台 - 一键自动化部署脚本
# 在腾讯云服务器上执行: bash deploy.sh
# ==========================================

set -e  # 出错立即退出

echo "🚀 开始自动化部署知识创作者工作台..."

# 配置区（按需修改）
APP_NAME="knowledge-creator"
APP_DIR="/root/$APP_NAME"
DOMAIN="${DOMAIN:-}"  # 有域名就填，没有留空
PORT=3000

# 颜色输出
red() { echo -e "\033[31m$1\033[0m"; }
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }

# 1. 系统更新和依赖安装
echo "📦 步骤 1/10: 安装系统依赖..."
apt-get update -qq
apt-get install -y -qq curl wget git nginx postgresql postgresql-contrib ufw

# 2. 安装 Node.js 20
echo "📦 步骤 2/10: 安装 Node.js 20..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" != "20" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y -qq nodejs
fi
node -v
npm -v

# 3. 安装 PM2
echo "📦 步骤 3/10: 安装 PM2..."
npm install -g pm2
pm2 -v

# 4. 配置 PostgreSQL
echo "🗄️ 步骤 4/10: 配置 PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql << EOF
CREATE USER knowledge_creator WITH PASSWORD 'kc_password_2025';
CREATE DATABASE knowledge_creator OWNER knowledge_creator;
GRANT ALL PRIVILEGES ON DATABASE knowledge_creator TO knowledge_creator;
\q
EOF

echo "green" "✅ 数据库已创建: knowledge_creator"

# 5. 下载代码
echo "📥 步骤 5/10: 下载项目代码..."
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
fi

# 从 GitHub 下载最新代码（如果没有git仓库，需要手动上传代码）
mkdir -p "$APP_DIR"

# 提示用户上传代码
echo ""
yellow "⚠️  请手动上传代码到: $APP_DIR"
yellow "   方式1: 用 scp 上传代码压缩包"
yellow "   方式2: 克隆 GitHub 仓库"
yellow "   方式3: 直接把整个项目目录传上去"
echo ""
read -p "代码上传完成后按 Enter 继续..."

# 检查代码是否存在
if [ ! -f "$APP_DIR/package.json" ]; then
    red "❌ 未检测到代码文件，请确认代码已上传到 $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# 6. 安装依赖
echo "📦 步骤 6/10: 安装项目依赖..."
npm install --production

# 7. 配置环境变量
echo "⚙️ 步骤 7/10: 配置环境变量..."
cat > "$APP_DIR/.env.local" << 'EOF'
# Database (本地PostgreSQL)
DATABASE_URL="postgresql://knowledge_creator:kc_password_2025@localhost:5432/knowledge_creator"

# AI (Kimi Code)
KIMI_CODE_API_KEY="sk-kimi-Ofa1n28ZfeSAorxPrmbPBHbGp06b3Mj2HvIDQ9BogvyRelwcyi2Zqjfs1gCGWpx3"
KIMI_CODE_BASE_URL="https://api.kimi.com/coding/v1"

# Auth
JWT_SECRET="knowledge-creator-jwt-secret-$(date +%s)-min-32-characters-long"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://$(curl -s ip.sb):3000"
EOF

green "✅ 环境变量已配置"

# 8. 数据库迁移
echo "🗄️ 步骤 8/10: 初始化数据库..."
npx prisma generate
npx prisma migrate deploy --preview-feature 2>/dev/null || true

# 9. 构建项目
echo "🔨 步骤 9/10: 构建项目..."
npm run build

# 10. PM2 启动配置
echo "🚀 步骤 10/10: 启动服务..."
cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    cwd: '$APP_DIR',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '$APP_DIR/logs/err.log',
    out_file: '$APP_DIR/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
EOF

mkdir -p "$APP_DIR/logs"
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
pm2 startup systemd -u root --hp /root

# 配置 Nginx
echo "🌐 配置 Nginx..."
SERVER_IP=$(curl -s ip.sb)

cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name ${DOMAIN:-$SERVER_IP};

    location / {
        proxy_pass http://localhost:$PORT;
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

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 防火墙开放端口
echo "🔒 配置防火墙..."
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
echo "📁 项目目录: $APP_DIR"
echo "📊 PM2 状态: pm2 status"
echo "📜 查看日志: pm2 logs $APP_NAME"
echo "🔄 重启服务: pm2 restart $APP_NAME"
echo ""
echo "⚠️  注意："
echo "   - 数据库密码: kc_password_2025"
echo "   - 请及时修改默认密码"
echo "   - 建议配置 HTTPS ( Certbot )"
echo ""
