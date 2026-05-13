import type { Post } from './index'

const post: Post = {
  id: 'cloud-deploy',
  title: '混合云部署实战',
  titleEn: 'Hybrid Cloud Deployment Practice',
  summary: '从 Nginx 反向代理到 HTTPS 证书配置，从 GitHub CI/CD 到多云自动部署的完整运维实践。',
  summaryEn: 'Multi-cloud deployment strategy: Alibaba Cloud (ECS/OSS/CDN) + Cloudflare + Vercel, with Docker containerization and Nginx reverse proxy.',
  category: 'devops',
  tags: ['Nginx', 'HTTPS', 'CI/CD', 'Docker'],
  date: '2025-01',
  cover: '☁️',
  sections: [
    { type: 'heading', content: 'Nginx 反向代理配置', id: 'nginx' },
    { type: 'text', content: 'Nginx 作为反向代理将不同域名/路径的请求转发到对应的后端服务，同时处理 HTTPS 终止和静态文件服务。' },
    { type: 'code', lang: 'nginx', content: `server {
    listen 80;
    server_name exp8.yuan6.cn;
    return 301 https://$host$request_uri;  # HTTP 跳转 HTTPS
}

server {
    listen 443 ssl http2;
    server_name exp8.yuan6.cn;

    ssl_certificate     /etc/letsencrypt/live/exp8.yuan6.cn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/exp8.yuan6.cn/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;  # 转发到 Spring Boot
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \\.(js|css|png|jpg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}`, explanation: 'HTTP 301 永久重定向到 HTTPS，确保所有流量走加密通道。proxy_set_header 系列配置让后端能获取真实客户端 IP 和协议。静态资源设置 30 天缓存，减少回源请求。' },
    { type: 'heading', content: 'Let\'s Encrypt 自动续签', id: 'ssl' },
    { type: 'code', lang: 'bash', content: `# 首次申请证书
certbot --nginx -d exp8.yuan6.cn -d keshe.yuan6.cn

# 自动续签（Cron 定时任务）
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"`, explanation: 'certbot 配合 --nginx 参数自动修改 Nginx 配置并申请证书。Cron 定时任务每天凌晨 3 点检查续签，证书到期前 30 天自动续签并重载 Nginx。' },
    { type: 'heading', content: 'GitHub Actions CI/CD', id: 'ci-cd' },
    { type: 'code', lang: 'yaml', content: `name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-deployment-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: .`, explanation: '推送 main 分支自动触发构建部署：checkout 代码 → 安装依赖 → 构建 → 部署到 Vercel。敏感信息（token、org-id）使用 GitHub Secrets 加密存储，不暴露在代码中。' },
    { type: 'heading', content: 'Docker 容器化部署', id: 'docker' },
    { type: 'code', lang: 'dockerfile', content: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]`, explanation: '使用 python:3.11-slim 减小镜像体积。Gunicorn 作为 WSGI 服务器，-w 4 启动 4 个 worker 进程处理并发请求，比 Flask 内置的 dev server 性能好得多。' },
    { type: 'heading', content: '多项目部署架构', id: 'architecture' },
    { type: 'list', items: [
      '阿里云 ECS：Spring Boot / Flask 后端服务',
      '阿里云 OSS + CDN：静态资源加速',
      'Vercel / 阿里云 ESA：前端静态站点自动部署',
      'Cloudflare CDN：海外访问加速 + DDoS 防护',
      '1Panel 面板：服务器运维管理',
      'Nginx/OpenResty：反向代理 + HTTPS + 负载均衡',
    ] },
  ],
  sectionsEn: [
  {
    type: 'heading',
    content: 'Overview',
    id: 'overview'
  },
  {
    type: 'text',
    content: 'Multi-cloud deployment: Alibaba Cloud (ECS/OSS/CDN) + Cloudflare + Vercel with Docker and Nginx.'
  },
  {
    type: 'heading',
    content: 'Architecture',
    id: 'arch'
  },
  {
    type: 'text',
    content: 'Frontend on Vercel, backend on Alibaba ECS, static assets on OSS with CDN acceleration, DNS via Cloudflare.'
  },
  {
    type: 'heading',
    content: 'CI/CD',
    id: 'cicd'
  },
  {
    type: 'text',
    content: 'GitHub Actions automates Docker build, push, and server deployment with zero-downtime rolling updates.'
  }
],
}

export default post
