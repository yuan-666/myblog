<script setup lang="ts">
import { inject } from 'vue'
import { TKey, LocaleKey } from '../i18n'

const t = inject(TKey)!
const locale = inject(LocaleKey)!
const isZh = () => locale.value === 'zh'

interface TechItem {
  name: string
  desc: string
  descEn: string
  version?: string
  link?: string
}

interface TechSection {
  key: string
  icon: string
  items: TechItem[]
}

const sections: TechSection[] = [
  {
    key: 'about.tech.frontend',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    items: [
      { name: 'Vue 3', version: '3.5.32', desc: '渐进式前端框架，Composition API', descEn: 'Progressive frontend framework, Composition API', link: 'https://vuejs.org/' },
      { name: 'TypeScript', version: '6.0.2', desc: '类型安全的 JavaScript 超集', descEn: 'Type-safe JavaScript superset', link: 'https://www.typescriptlang.org/' },
      { name: 'Vite', version: '8.0.10', desc: '下一代前端构建工具', descEn: 'Next-gen frontend build tool', link: 'https://vitejs.dev/' },
      { name: 'Vue Router', version: '4.6.4', desc: 'Vue 官方路由管理', descEn: 'Official Vue router', link: 'https://router.vuejs.org/' },
    ],
  },
  {
    key: 'about.tech.backend',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    items: [
      { name: 'Alibaba Cloud ESA', desc: '边缘安全加速，EdgeKV + 边缘函数', descEn: 'Edge Secure Acceleration, EdgeKV + Edge Functions', link: 'https://www.alibabacloud.com/product/esa' },
      { name: 'EdgeKV', desc: 'ESA 内置键值存储，访问统计持久化', descEn: 'ESA built-in KV storage, analytics persistence' },
      { name: 'Cloudflare Workers', desc: 'GLM API 代理转发', descEn: 'GLM API proxy forwarding', link: 'https://workers.cloudflare.com/' },
    ],
  },
  {
    key: 'about.tech.ai',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 2.5-2 4-4 4s-4-1.5-4-4a4 4 0 0 1 4-4z"/><path d="M12 14c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/></svg>',
    items: [
      { name: 'Zhipu GLM API', desc: '智谱 AI 大语言模型对话能力', descEn: 'Zhipu AI large language model chat', link: 'https://open.bigmodel.cn/' },
      { name: 'PyTorch', desc: '深度学习框架，CNN 手写数字识别', descEn: 'Deep learning framework, CNN digit recognition', link: 'https://pytorch.org/' },
      { name: 'ONNX Runtime', desc: '神经网络推理运行时', descEn: 'Neural network inference runtime', link: 'https://onnxruntime.ai/' },
    ],
  },
  {
    key: 'about.tech.deploy',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    items: [
      { name: 'GitHub Actions', desc: 'CI/CD 自动化构建与部署', descEn: 'CI/CD automated build and deploy', link: 'https://github.com/features/actions' },
      { name: 'ESA 边缘部署', desc: '静态站点全球边缘分发', descEn: 'Static site global edge distribution' },
      { name: 'GitHub Releases', desc: '版本管理与变更日志', descEn: 'Version management and changelog', link: 'https://github.com/yuan-666/myblog/releases' },
    ],
  },
]
</script>

<template>
  <div class="tech-docs">
    <div class="page-hero">
      <h1 class="page-title">{{ t('about.tech.title') }}</h1>
      <p class="page-subtitle">{{ t('about.tech.subtitle') }}</p>
    </div>

    <div class="tech-grid">
      <div v-for="section in sections" :key="section.key" class="tech-section">
        <div class="section-header">
          <span class="section-icon" v-html="section.icon"></span>
          <h3 class="section-name">{{ t(section.key) }}</h3>
        </div>
        <div class="tech-list">
          <a
            v-for="item in section.items"
            :key="item.name"
            :href="item.link || 'javascript:void(0)'"
            :target="item.link ? '_blank' : undefined"
            :rel="item.link ? 'noopener' : undefined"
            class="tech-item"
          >
            <div class="item-main">
              <span class="item-name">{{ item.name }}</span>
              <span v-if="item.version" class="item-version">{{ item.version }}</span>
            </div>
            <p class="item-desc">{{ isZh() ? item.desc : item.descEn }}</p>
          </a>
        </div>
      </div>
    </div>

    <div class="architecture-card">
      <h3 class="arch-title">{{ isZh() ? '架构概览' : 'Architecture Overview' }}</h3>
      <div class="arch-flow">
        <div class="arch-node">
          <div class="arch-label">{{ isZh() ? '用户' : 'User' }}</div>
        </div>
        <div class="arch-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <div class="arch-node primary">
          <div class="arch-label">ESA Edge</div>
          <div class="arch-sublabel">{{ isZh() ? '静态站点 + 边缘函数' : 'Static Site + Edge Functions' }}</div>
        </div>
        <div class="arch-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <div class="arch-node">
          <div class="arch-label">CF Worker</div>
          <div class="arch-sublabel">{{ isZh() ? 'GLM API 代理' : 'GLM API Proxy' }}</div>
        </div>
      </div>
      <div class="arch-note">
        <p v-if="isZh()">
          本站采用完全静态化的前端架构，通过 GitHub Actions 自动构建并推送至阿里云 ESA 边缘节点。访问统计由 ESA Edge Functions 写入 EdgeKV 实现跨设备持久化；AI 对话能力通过 Cloudflare Worker 代理调用智谱 GLM API，避免前端暴露密钥。
        </p>
        <p v-else>
          This site uses a fully static frontend architecture, automatically built by GitHub Actions and pushed to Alibaba Cloud ESA edge nodes. Visit analytics are persisted via ESA Edge Functions writing to EdgeKV for cross-device persistence. AI chat capabilities are proxied through Cloudflare Worker to Zhipu GLM API, preventing key exposure on the frontend.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-docs { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-hero { text-align: center; margin-bottom: 32px; }
.page-title { font-family: var(--font-display); font-size: 34px; font-weight: 680; letter-spacing: 0; margin-bottom: 8px; color: var(--text-1); }
.page-subtitle { font-size: 14.5px; color: var(--text-2); font-family: var(--font-sans); }

.tech-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.tech-section {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-card);
}
.section-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.section-icon {
  width: 36px; height: 36px;
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.section-name {
  font-size: 17px; font-weight: 700; color: var(--text-1);
  letter-spacing: 0;
}
.tech-list { display: flex; flex-direction: column; gap: 2px; }
.tech-item {
  display: block;
  padding: 10px 12px; border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s ease;
}
.tech-item:hover {
  background: var(--bg-sunken);
  text-decoration: none;
}
.item-main {
  display: flex; align-items: center; gap: 8px; margin-bottom: 2px;
}
.item-name {
  font-size: 14.5px; font-weight: 650; color: var(--text-1);
}
.item-version {
  font-size: 11px; font-weight: 500;
  padding: 1px 6px; border-radius: 4px;
  background: var(--bg-sunken);
  color: var(--text-3);
  font-family: var(--font-mono);
  border: 1px solid var(--border);
}
.item-desc {
  font-size: 13px; color: var(--text-3); line-height: 1.6;
  margin: 0;
}

/* Architecture Card */
.architecture-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  box-shadow: var(--shadow-card);
}
.arch-title {
  font-family: var(--font-display);
  font-size: 19px; font-weight: 680; color: var(--text-1);
  margin-bottom: 20px; letter-spacing: 0;
}
.arch-flow {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; flex-wrap: wrap;
  margin-bottom: 24px;
}
.arch-node {
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 20px;
  text-align: center;
  min-width: 100px;
}
.arch-node.primary {
  border-color: var(--border-accent);
  background: linear-gradient(135deg, rgba(99,102,241,0.04), transparent);
}
.arch-label {
  font-size: 14.5px; font-weight: 650; color: var(--text-1);
}
.arch-sublabel {
  font-size: 11.5px; color: var(--text-3); margin-top: 2px;
}
.arch-arrow {
  color: var(--text-3);
  display: flex; align-items: center;
}
.arch-note {
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.arch-note p {
  font-size: 16px; color: var(--text-2); line-height: 2;
  margin: 0;
}

@media (max-width: 768px) {
  .tech-grid { grid-template-columns: 1fr; }
  .architecture-card { padding: 20px; }
}
</style>
