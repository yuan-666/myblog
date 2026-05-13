<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, watch } from 'vue'
import { postSummaries as posts } from '../posts/catalog'
import WidePostCard from '../components/WidePostCard.vue'
import Pagination from '../components/Pagination.vue'
import { TKey, LocaleKey } from '../i18n'

const t = inject(TKey)!
const locale = inject(LocaleKey)!

type Category = 'all' | 'python' | 'fullstack' | 'ai' | 'devops'
const activeCategory = ref<Category>('all')
const searchQuery = ref('')
const searchHighlight = ref(false)
const showBackTop = ref(false)
const currentPage = ref(1)
const pageSize = 6

/* ===========================================
   Rotating Keyword Typewriter
   =========================================== */
const keywordPrefix = computed(() => locale.value === 'zh' ? '探索 ' : 'Explore ')
const keywordSet = computed(() => locale.value === 'zh'
  ? ['Python', 'Vue 3', 'Docker', '蚁群算法', 'Spring Boot', 'TypeScript', 'PyTorch', 'FastAPI', '爬虫', '全栈项目', '混合云', 'K8s', '深度学习', 'Flask', 'RESTful API']
  : ['Python', 'Vue 3', 'Docker', 'Ant Colony', 'Spring Boot', 'TypeScript', 'PyTorch', 'FastAPI', 'Web Scraping', 'Full Stack', 'Hybrid Cloud', 'K8s', 'Deep Learning', 'Flask', 'RESTful API'])
const typedText = ref(`${keywordPrefix.value}${keywordSet.value[0]}`)

let keywordIdx = 0
let typingTimer: ReturnType<typeof setTimeout> | null = null
let isDeleting = false
let running = true

function runWhenIdle(fn: () => void, delay = 900) {
  const w = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  }
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2200 })
  else window.setTimeout(fn, delay)
}

function typeCycle() {
  if (!running) return
  const current = keywordSet.value[keywordIdx % keywordSet.value.length]
  const prefix = keywordPrefix.value
  const full = `${prefix}${current}`

  if (!isDeleting) {
    if (typedText.value.length < full.length) {
      typedText.value = full.slice(0, typedText.value.length + 1)
      const delay = 46 + Math.random() * 34
      typingTimer = setTimeout(typeCycle, delay)
    } else {
      isDeleting = true
      typingTimer = setTimeout(typeCycle, 1900)
    }
  } else {
    if (typedText.value.length > prefix.length) {
      typedText.value = typedText.value.slice(0, -1)
      typingTimer = setTimeout(typeCycle, 28)
    } else {
      keywordIdx++
      isDeleting = false
      typingTimer = setTimeout(typeCycle, 360)
    }
  }
}

function resetTypewriter() {
  if (typingTimer) clearTimeout(typingTimer)
  keywordIdx = 0
  isDeleting = false
  typedText.value = `${keywordPrefix.value}${keywordSet.value[0]}`
  if (running) typingTimer = setTimeout(typeCycle, 1200)
}

watch(locale, resetTypewriter)

onMounted(() => {
  runWhenIdle(typeCycle, 1200)
})

onUnmounted(() => {
  running = false
  if (typingTimer) clearTimeout(typingTimer)
})

/* ===========================================
   Stats
   =========================================== */
const articleCount = posts.length
const totalWords = computed(() => posts.reduce((sum, p) => sum + (p.wordCount || 0), 0))

/* ===========================================
   Visit Counter
   =========================================== */
const COUNTER_API = 'https://myblog-api.yuan6.cn/counter'
const totalVisits = ref<number | null>(null)
const todayVisits = ref<number | null>(null)

async function loadVisitStats() {
  let serverTotal: number | null = null
  let serverToday: number | null = null

  try {
    const resp = await fetch(COUNTER_API, { signal: AbortSignal.timeout(3000) })
    if (resp.ok) {
      const data = await resp.json()
      serverTotal = data.total ?? null
      serverToday = data.today ?? null
    }
  } catch { /* 静默 */ }

  try {
    const todayKey = new Date().toDateString()
    const storedDate = localStorage.getItem('blog-visit-date')
    let localToday = 0
    if (storedDate === todayKey) {
      localToday = parseInt(localStorage.getItem('blog-today-visits') || '0', 10) + 1
    } else {
      localStorage.setItem('blog-visit-date', todayKey)
      localToday = 1
    }
    localStorage.setItem('blog-today-visits', String(localToday))
    const localTotal = parseInt(localStorage.getItem('blog-total-visits') || '0', 10) + 1
    localStorage.setItem('blog-total-visits', String(localTotal))
    totalVisits.value = serverTotal ?? localTotal
    todayVisits.value = serverToday ?? localToday
  } catch {
    totalVisits.value = serverTotal ?? 0
    todayVisits.value = serverToday ?? 0
  }
}

/* ===========================================
   Article PV
   =========================================== */
const articleViews = ref<Record<string, number>>({})
const viewsLoading = ref(false)

async function loadArticleViews(postIds: string[]) {
  if (postIds.length === 0) return
  viewsLoading.value = true
  try {
    const resp = await fetch('https://myblog-api.yuan6.cn/pv/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postIds }),
      signal: AbortSignal.timeout(5000),
    })
    if (resp.ok) {
      const data = await resp.json()
      const map: Record<string, number> = {}
      for (const r of data.results || []) {
        map[r.postId] = r.total || 0
      }
      articleViews.value = map
    }
  } catch { /* 静默 */ }
  finally { viewsLoading.value = false }
}

function getArticleViews(postId: string): number | undefined {
  return articleViews.value[postId]
}

onMounted(() => {
  randomizeHeroPosts()
  runWhenIdle(() => loadVisitStats(), 1000)
  runWhenIdle(() => loadArticleViews(posts.map(p => p.id)), 1200)
})

/* ===========================================
   Filter & Sort & Paginate
   =========================================== */
const categories = computed(() => [
  { key: 'all' as Category, label: locale.value === 'zh' ? '[ 00. 全部 ]' : '[ 00. All ]' },
  { key: 'python' as Category, label: locale.value === 'zh' ? '[ 01. Python / 脚本 ]' : '[ 01. Python ]' },
  { key: 'fullstack' as Category, label: locale.value === 'zh' ? '[ 02. 全栈项目 ]' : '[ 02. Full Stack ]' },
  { key: 'ai' as Category, label: locale.value === 'zh' ? '[ 03. AI / 算法 ]' : '[ 03. AI / Algo ]' },
  { key: 'devops' as Category, label: locale.value === 'zh' ? '[ 04. 部署运维 ]' : '[ 04. DevOps ]' },
])

const keywordAlias: Record<string, string[]> = {
  '全栈': ['fullstack', 'full stack', 'vue', 'spring boot', 'fastapi'],
  '混合云': ['cloud', 'deploy', '部署', 'aliyun', '阿里云', 'oss', 'cdn'],
  '深度学习': ['deep learning', 'pytorch', 'resnet', 'cnn', 'lstm', 'yolo'],
  '爬虫': ['scraper', 'scraping', 'jd', '京东', 'requests'],
  'k8s': ['kubernetes', 'docker', 'container'],
  'restful': ['rest', 'api', 'fastapi', 'flask'],
  '数据分析': ['data', 'analysis', '爬虫', 'csv'],
  '运维': ['devops', 'deploy', 'docker', 'nginx', 'ci/cd'],
  'docker': ['container', 'k8s', 'kubernetes', 'deploy'],
  'typescript': ['ts', 'vue', 'vue3'],
}

const sortedPosts = computed(() => {
  const pinned = posts.filter(p => p.pinned)
  const normal = posts.filter(p => !p.pinned)
  return [...pinned, ...normal]
})

const randomizedHeroPosts = ref<typeof posts>([])

function randomizeHeroPosts() {
  const list = [...sortedPosts.value]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  randomizedHeroPosts.value = list
}

const heroPosts = computed(() => randomizedHeroPosts.value.length ? randomizedHeroPosts.value : sortedPosts.value)
const featuredPost = computed(() => heroPosts.value[0])

function compactNum(n: number | null): string {
  if (n == null) return '...'
  if (locale.value === 'zh' && n >= 10000) return `${(n / 10000).toFixed(1)}万`
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toLocaleString()
}

const heroMetrics = computed(() => [
  { value: String(articleCount), label: locale.value === 'zh' ? '篇记录' : 'Notes' },
  { value: compactNum(totalWords.value), label: locale.value === 'zh' ? '字' : 'Chars' },
  { value: compactNum(totalVisits.value), label: locale.value === 'zh' ? '访问' : 'Views' },
])

const filtered = computed(() => {
  let result = activeCategory.value === 'all' ? sortedPosts.value : sortedPosts.value.filter(p => p.category === activeCategory.value)
  const q = searchQuery.value.trim()
  if (q) {
    const ql = q.toLowerCase()
    const aliases = keywordAlias[ql] || keywordAlias[q] || []
    result = result.filter(p => {
      const searchTargets = [
        p.title.toLowerCase(), p.title, p.summary.toLowerCase(), p.summary,
        p.category.toLowerCase(), ...p.tags.map(t => t.toLowerCase()), ...p.tags,
      ]
      if (searchTargets.some(t => t.includes(ql))) return true
      if (aliases.some(a => searchTargets.some(t => t.includes(a)))) return true
      return false
    })
  }
  return result
})

const totalFiltered = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalFiltered.value / pageSize)))

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function onFilterChange() { currentPage.value = 1 }

function handlePageChange(page: number) {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onCategoryClick(cat: Category) {
  activeCategory.value = cat
  onFilterChange()
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function onScroll() { showBackTop.value = window.scrollY > 600 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div class="home">
    <div class="void-bg" aria-hidden="true">
      <div class="horizon-glow"></div>
    </div>

    <section class="hero container">
      <div class="hero-content">
        <div class="terminal-log animate-enter" aria-live="polite">
          <span class="pulse" aria-hidden="true"></span>
          <span class="log-text">{{ typedText }}</span>
          <span class="cursor" aria-hidden="true"></span>
        </div>

        <h1 class="hero-title animate-enter delay-1">
          <span class="hero-brand">{{ locale === 'zh' ? '智荟元陆' : 'YuanHub' }}</span>
          <span class="hero-signal">{{ locale === 'zh' ? '在噪声中 寻找信号。' : 'Finding signal inside noise.' }}</span>
        </h1>

        <p class="hero-desc animate-enter delay-2">
          {{ locale === 'zh'
            ? '这里是我在数字世界留下的航行日志。没有宏大的叙事，只有对代码底层逻辑的拆解、对算法边界的试探，以及把复杂系统重新组装的日常。在比特构成的海洋里，保持安静，保持输出。'
            : 'A logbook from the digital field: low-level notes, algorithm edges, and the daily work of taking systems apart and putting them back together. Quiet inputs, useful outputs.' }}
        </p>

        <div class="search-wrap animate-enter delay-3" :class="{ focused: searchHighlight }">
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" :aria-label="locale === 'zh' ? '搜索文章或关键词' : 'Search posts or keywords'" :placeholder="locale === 'zh' ? '搜索文章 / 关键词...' : 'Search posts / keywords...'" class="search-input" @input="onFilterChange()" />
          <button v-if="searchQuery" class="search-clear" :aria-label="locale === 'zh' ? '清空搜索' : 'Clear search'" @click="searchQuery = ''; onFilterChange()">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="hero-row animate-enter delay-3">
          <div class="hero-metrics">
            <span v-for="metric in heroMetrics" :key="metric.label" class="metric-item">
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.label }}</span>
            </span>
          </div>

          <router-link v-if="featuredPost" :to="'/post/' + featuredPost.id" class="random-pick">
            <span>{{ locale === 'zh' ? '[ 随机 ]' : '[ Random ]' }}</span>
            {{ locale === 'en' ? (featuredPost.titleEn || featuredPost.title) : featuredPost.title }}
          </router-link>
        </div>
      </div>
    </section>

    <section class="content-section container animate-enter delay-3">
      <div class="section-head">
        <div>
          <span class="section-eyebrow">{{ locale === 'zh' ? '文章索引' : 'Article Index' }}</span>
          <h2>{{ locale === 'zh' ? '最近归档' : 'Recent Notes' }}</h2>
        </div>
        <p>{{ locale === 'zh' ? '按技术方向粗略归类。每一行都对应一次真实项目、课程设计或问题排查。' : 'Grouped by technical direction. Each row comes from a real project, course build, or debugging session.' }}</p>
      </div>

      <div class="filter-bar">
        <button
          v-for="cat in categories" :key="cat.key"
          class="filter-btn" :class="{ active: activeCategory === cat.key }"
          :aria-pressed="activeCategory === cat.key"
          @click="onCategoryClick(cat.key)"
        >
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <p class="results-info" v-if="searchQuery || activeCategory !== 'all'">
        {{ t('home.results', { n: totalFiltered }) }}
      </p>

      <div class="card-list" v-if="pagedPosts.length">
        <WidePostCard
          v-for="(post, idx) in pagedPosts"
          :key="post.id"
          :style="{ animationDelay: `${idx * 0.08}s` }"
          v-bind="post"
          :views="getArticleViews(post.id)"
        />
      </div>

      <div v-else class="empty">
        <span class="empty-text">{{ locale === 'zh' ? '[ 404 ] 暂无匹配记录' : '[ 404 ] No matching notes' }}</span>
      </div>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalFiltered"
        @change="handlePageChange"
      />
    </section>

    <Transition name="fade">
      <button v-if="showBackTop" class="back-top" :aria-label="locale === 'zh' ? '回到顶部' : 'Back to top'" @click="scrollToTop">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  isolation: isolate;
  padding-bottom: 32px;
}

.void-bg {
  position: absolute;
  inset: 0;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.horizon-glow {
  position: absolute;
  top: -300px;
  left: 50%;
  width: 1000px;
  height: 600px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse 80% 50% at center, rgba(255,255,255,0.06) 0%, transparent 100%);
}

[data-theme="light"] .horizon-glow {
  background: radial-gradient(ellipse 80% 50% at center, rgba(0,0,0,0.04) 0%, transparent 100%);
}

.hero {
  max-width: 860px;
  padding-top: 160px;
  padding-bottom: 64px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.terminal-log {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 0.02em;
}

.pulse {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  background: var(--signal);
  opacity: 0.82;
  animation: signal-pulse 1.8s var(--ease) infinite;
}

.log-text { color: var(--text-2); min-width: 21ch; }
.cursor {
  width: 5px;
  height: 11px;
  background: var(--text-2);
  animation: cursor-blink 1s step-end infinite;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 50px;
  font-weight: 650;
  line-height: 1.16;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-brand {
  color: var(--text-1);
}

.hero-signal {
  color: var(--text-2);
  font-size: 36px;
  font-weight: 520;
  letter-spacing: 0;
}

.hero-desc {
  max-width: 560px;
  margin: 0 0 34px;
  color: var(--text-2);
  font-size: 16px;
  line-height: 2;
}

@keyframes cursor-blink {
  50% { opacity: 0; }
}

@keyframes signal-pulse {
  0%, 100% { opacity: 0.42; transform: scaleY(0.7); }
  50% { opacity: 0.9; transform: scaleY(1); }
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 390px;
  margin-bottom: 22px;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 0;
  background: var(--bg-base);
  transition: border-color 0.2s var(--ease), box-shadow 0.2s var(--ease);
}

.search-wrap:focus-within,
.search-wrap.focused {
  border-color: var(--text-1);
  box-shadow: 0 0 0 1px var(--text-1);
}

.search-wrap svg {
  flex-shrink: 0;
  color: var(--text-3);
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-1);
  font-size: 15px;
  font-family: var(--font-sans);
}

.search-input::placeholder {
  color: var(--text-3);
  font-family: var(--font-sans);
  font-size: 14px;
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: all 0.18s var(--ease);
}

.search-clear:hover {
  color: var(--text-1);
  background: var(--bg-surface-hover);
  border-color: var(--border);
}

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  max-width: 760px;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid var(--border);
  overflow: hidden;
}

.metric-item {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
  padding: 8px 12px;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 12px;
  white-space: nowrap;
}

.metric-item + .metric-item { border-left: 1px solid var(--border); }
.metric-item strong {
  color: var(--text-1);
  font-weight: 600;
}

.random-pick {
  overflow: hidden;
  color: var(--text-2);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 560;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.random-pick span { color: var(--text-3); margin-right: 6px; font-family: var(--font-mono); font-weight: 500; }
.random-pick:hover {
  color: var(--text-1);
  opacity: 1;
}

.content-section {
  max-width: 860px;
  padding-top: 40px;
  padding-bottom: 36px;
}

.section-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
  align-items: end;
  gap: 24px;
  margin-bottom: 40px;
}

.section-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: var(--text-3);
  font-size: 12px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-head h2 {
  color: var(--text-1);
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 650;
  letter-spacing: 0;
}

.section-head p {
  margin: 0;
  color: var(--text-3);
  font-size: 14.5px;
  line-height: 1.8;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 26px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  transition: color 0.2s var(--ease), transform 0.2s var(--ease);
}

.filter-btn:hover {
  color: var(--text-1);
  background: transparent;
}

.filter-btn.active {
  color: var(--text-1);
  background: transparent;
  font-weight: 600;
}

.filter-btn:active {
  transform: translateY(1px);
}

.results-info {
  margin-bottom: 24px;
  color: var(--text-3);
  font-size: 13px;
  font-family: var(--font-mono);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.card-list > * {
  animation: hero-reveal 0.46s var(--ease-out) both;
}

.empty {
  padding: 48px 0;
  text-align: center;
}

.empty-text {
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 14px;
}

.back-top {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 90;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--bg-surface-solid);
  color: var(--text-2);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: all 0.22s var(--ease-out);
}

.back-top:hover {
  color: var(--text-1);
  border-color: var(--border-strong);
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .hero { padding-top: 120px; padding-bottom: 52px; }
  .hero-title { font-size: 44px; }
  .hero-signal { font-size: 32px; }
  .hero-row { grid-template-columns: 1fr; align-items: start; }
  .hero-metrics { width: fit-content; max-width: 100%; }
  .section-head { grid-template-columns: 1fr; align-items: flex-start; gap: 10px; }
  .back-top { right: 20px; bottom: 24px; }
}

@media (max-width: 480px) {
  .hero { padding-top: 112px; }
  .hero-title { font-size: 36px; }
  .hero-signal { font-size: 26px; }
  .hero-desc { font-size: 15.5px; }
  .search-wrap { max-width: none; }
  .hero-metrics { width: 100%; }
  .metric-item { justify-content: center; padding: 8px 6px; white-space: normal; line-height: 1.35; text-align: center; }
  .filter-btn { padding: 4px 0; font-size: 12px; }
}

@media (max-width: 360px) {
  .metric-item { gap: 3px; padding: 7px 4px; font-size: 11px; }
}
</style>
