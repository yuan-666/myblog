<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { LocaleKey } from '../i18n'

const locale = inject(LocaleKey)!

const props = defineProps<{
  postId: string
  title: string
  category: string
}>()

const isZh = () => locale.value === 'zh'
const active = ref(false)
const iframeLoaded = ref(false)
const shouldLoad = ref(false)
const hostRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Map post IDs to their demo URLs
const demoUrls: Record<string, string> = {
  'campus-activity': 'https://exp8.yuan6.cn/',
  'ticket-system': 'https://keshe.yuan6.cn/',
  'dictionary': './demos/dictionary.html',
  'course-mgmt': './demos/course-mgmt.html',
  'ant-sim': './demos/ant-sim.html',
  'ant-path': './demos/ant-path.html',
  'jd-scraper': './demos/jd-scraper.html',
  'cloud-deploy': './demos/cloud-deploy.html',
  'cnn-digit': './demos/cnn-digit.html',
  'myweb-portfolio': 'https://me.yuan6.cn',
  'ai-experiments': './demos/ai-experiments.html',
  'llm-explained': './demos/llm-explained.html',
}

const demoVersions: Record<string, string> = {
  'cnn-digit': '20260518-2',
}

const demoUrl = demoUrls[props.postId] || ''
const isExternal = demoUrl.startsWith('http')

function appendParam(url: string, key: string, value: string) {
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}${key}=${encodeURIComponent(value)}`
}

const versionedDemoUrl = computed(() => {
  if (!demoUrl || isExternal) return demoUrl
  const version = demoVersions[props.postId]
  return version ? appendParam(demoUrl, 'v', version) : demoUrl
})

// Add locale param to local demos so they can follow the site language
const iframeSrc = computed(() => {
  if (!versionedDemoUrl.value || isExternal) return versionedDemoUrl.value
  return appendParam(versionedDemoUrl.value, 'lang', locale.value)
})

// Post-specific labels
const labels: Record<string, { zh: string; en: string }> = {
  'campus-activity': { zh: '校园活动管理系统 · exp8.yuan6.cn', en: 'Campus Activity Manager · exp8.yuan6.cn' },
  'ticket-system': { zh: '车票管理系统 · keshe.yuan6.cn', en: 'Ticket Management System · keshe.yuan6.cn' },
  'dictionary': { zh: '电子英汉词典 — 词条录入 · 查询 · 修改 · 删除', en: 'English-Chinese Dictionary — Add · Search · Edit · Delete' },
  'course-mgmt': { zh: '课程信息管理系统 — CSV加载 · 排序 · 查询', en: 'Course Management — CSV Load · Sort · Search' },
  'ant-sim': { zh: '四只蚂蚁追踪 — NumPy仿真 · 螺旋收敛', en: 'Four-Ant Tracking — NumPy Simulation · Spiral Convergence' },
  'ant-path': { zh: '蚁群网格寻路 — ACO · 信息素 · 启发式搜索', en: 'Ant Colony Grid Pathfinding — ACO · Pheromones · Heuristic Search' },
  'jd-scraper': { zh: '京东爬虫分析 — 价格对比 · 词云 · 数据表', en: 'JD Scraper Analysis — Price Comparison · Word Cloud · Data Table' },
  'cloud-deploy': { zh: 'CI/CD管道 · 多云架构 · Nginx配置', en: 'CI/CD Pipeline · Multi-Cloud Architecture · Nginx Config' },
  'ai-experiments': { zh: 'AI 实验合集 — PCA · 相似度 · 人脸检测 · 车辆计数', en: 'AI Experiments — PCA · Similarity · Face Detection · Vehicle Counting' },
  'llm-explained': { zh: 'LLM 原理交互 — Token化 · 嵌入 · Attention · 生成', en: 'LLM Interactive — Tokenization · Embeddings · Attention · Generation' },
}

const label = computed(() => labels[props.postId]?.[locale.value] || props.title)

onMounted(() => {
  active.value = true
  if (!('IntersectionObserver' in window)) {
    shouldLoad.value = true
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return
    shouldLoad.value = true
    observer?.disconnect()
    observer = null
  }, { rootMargin: '280px 0px' })
  if (hostRef.value) observer.observe(hostRef.value)
})
onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div v-if="demoUrl" ref="hostRef" class="demo-showcase" :class="{ active }">
    <h3 class="demo-title">
      <span class="demo-badge">{{ isZh() ? '在线体验' : 'Live Demo' }}</span>
      <span class="demo-label-text">{{ label }}</span>
    </h3>

    <div class="demo-browser">
      <!-- Browser chrome bar -->
      <div class="browser-bar">
        <span class="browser-dots"><span></span><span></span><span></span></span>
        <span class="browser-url">{{ versionedDemoUrl }}</span>
        <a :href="iframeSrc" target="_blank" rel="noopener" class="browser-open" :aria-label="isZh() ? '新窗口打开演示' : 'Open demo in new tab'" :title="isZh() ? '新窗口打开' : 'Open in new tab'">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
        </a>
      </div>
      <!-- Iframe -->
      <iframe
        v-if="shouldLoad"
        :src="iframeSrc"
        :title="title"
        class="demo-iframe"
        loading="lazy"
        @load="iframeLoaded = true"
        :sandbox="isExternal ? 'allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation' : 'allow-scripts allow-same-origin allow-popups allow-forms'"
      ></iframe>
      <div v-if="!iframeLoaded" class="iframe-loader">
        <span class="loader-spin"></span>
        <span>{{ shouldLoad ? (isZh() ? '加载中...' : 'Loading...') : (isZh() ? '滚动到这里后加载演示' : 'Demo loads when it enters view') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-showcase {
  margin-top: 40px; opacity: 0; transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.demo-showcase.active { opacity: 1; transform: translateY(0); }

.demo-title {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px; font-size: 15px;
}
.demo-badge {
  padding: 4px 14px; border-radius: 100px;
  background: var(--accent-soft); color: var(--accent);
  font-size: 12px; font-weight: 600; letter-spacing: 0.3px;
  flex-shrink: 0;
}
.demo-label-text {
  font-size: 13px; color: var(--text-3);
  font-family: var(--font-mono); overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}

/* Browser chrome */
.demo-browser {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border);
  background: #0f0f1a;
  box-shadow: var(--shadow-card);
  position: relative;
}
.browser-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px; background: #111827;
  border-bottom: 1px solid #1f2937;
}
.browser-dots { display: flex; gap: 5px; flex-shrink: 0; }
.browser-dots span { width: 8px; height: 8px; border-radius: 50%; }
.browser-dots span:nth-child(1) { background: #f43f5e; }
.browser-dots span:nth-child(2) { background: #f59e0b; }
.browser-dots span:nth-child(3) { background: #22c55e; }
.browser-url {
  flex: 1; font-size: 12px; color: #9ca3af;
  font-family: var(--font-mono); overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
  min-width: 0;
}
.browser-open {
  color: #6b7280; flex-shrink: 0;
  display: flex; align-items: center;
  transition: color 0.2s;
}
.browser-open:hover { color: #e4e4e7; }

.demo-iframe {
  width: 100%; height: 560px; border: none; display: block;
  background: #0f0f1a;
}

.iframe-loader {
  position: absolute; bottom: 0; left: 0; right: 0; top: 36px;
  display: flex; align-items: center; justify-content: center;
  gap: 10px; font-size: 13px; color: #6b7280;
  background: #0f0f1a;
}
.loader-spin {
  width: 18px; height: 18px; border: 2px solid #27272a;
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .demo-iframe { height: 420px; }
}
</style>
