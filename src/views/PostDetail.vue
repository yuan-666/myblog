<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { posts, type Section } from '../posts/index'
import CodeBlock from '../components/CodeBlock.vue'
import TocNav from '../components/TocNav.vue'
import DemoShowcase from '../components/DemoShowcase.vue'
import PostCover from '../components/PostCover.vue'
import { TKey, LocaleKey } from '../i18n'
import { localizedPostCategory, localizedTags } from '../utils/postLabels'

const t = inject(TKey)!
const locale = inject(LocaleKey)!
const route = useRoute()
const router = useRouter()
const post = computed(() => posts.find(p => p.id === route.params.id))
const activeHeading = ref('')
const progress = ref(0)
const postViews = ref<number | null>(null)
const viewsLoading = ref(false)
const showBackTop = ref(false)
const relatedPosts = ref<typeof posts>([])
let scrollRaf: number | null = null

const API_BASE = 'https://myblog-api.yuan6.cn'

const displayTitle = computed(() => {
  if (!post.value) return ''
  return locale.value === 'en' ? (post.value.titleEn || post.value.title) : post.value.title
})
const displaySections = computed((): Section[] => {
  if (!post.value) return []
  return locale.value === 'en' ? (post.value.sectionsEn || post.value.sections) : post.value.sections
})
const displayCategory = computed(() => post.value ? localizedPostCategory(post.value.category, locale.value) : '')
const displayTags = computed(() => post.value ? localizedTags(post.value.tags, locale.value) : [])
function shufflePosts<T>(items: T[]): T[] {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function pickRelatedPosts() {
  const q = (route.params.id as string || '').toLowerCase()
  const current = posts.find(p => p.id === q)
  const candidates = posts.filter(p => p.id !== q)
  const preferred = current
    ? candidates.filter(p => p.category === current.category || p.tags.some(tag => current.tags.includes(tag)))
    : candidates.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.title.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  )
  relatedPosts.value = shufflePosts(preferred.length ? preferred : candidates).slice(0, 4)
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleScroll() {
  scrollRaf = null
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
  showBackTop.value = scrollTop > 600
  if (!post.value) return
  for (const s of post.value.sections) {
    if (s.type !== 'heading' || !s.id) continue
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top <= 120) activeHeading.value = s.id
  }
}

function queueScrollUpdate() {
  if (scrollRaf == null) scrollRaf = requestAnimationFrame(handleScroll)
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

async function fetchPostViews() {
  if (!post.value) return
  viewsLoading.value = true
  try {
    const resp = await fetch(`${API_BASE}/pv/${post.value.id}`, { signal: AbortSignal.timeout(3000) })
    if (resp.ok) {
      const data = await resp.json()
      postViews.value = data.total || 0
    }
  } catch { /* 静默失败 */ }
  finally { viewsLoading.value = false }
}

onMounted(() => {
  window.addEventListener('scroll', queueScrollUpdate, { passive: true })
  handleScroll()
  pickRelatedPosts()
  fetchPostViews()
})
watch(() => route.params.id, () => {
  postViews.value = null
  pickRelatedPosts()
  fetchPostViews()
})
onUnmounted(() => {
  window.removeEventListener('scroll', queueScrollUpdate)
  if (scrollRaf != null) cancelAnimationFrame(scrollRaf)
})
</script>

<template>
  <div class="post-detail" v-if="post">
    <div class="progress-bar"><div class="progress-fill" :style="{ transform: `scaleX(${progress / 100})` }"></div></div>
    <button class="back-btn" @click="router.push('/')">
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      {{ t('post.back') }}
    </button>
    <div class="post-layout">
      <article class="post-content">
        <PostCover v-if="post.coverSvg" :svg="post.coverSvg" class="post-banner" />
        <div class="post-header">
          <div class="post-meta">
            <span class="post-category">{{ displayCategory }}</span>
            <span class="post-date">{{ post.date }}</span>
          </div>
          <div class="post-stats" v-if="post.wordCount || post.readTime || postViews != null">
            <span v-if="post.wordCount" class="stat-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {{ t('post.wordCount', { n: post.wordCount }) }}
            </span>
            <span class="stat-divider">·</span>
            <span v-if="post.readTime" class="stat-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ t('post.readTime', { n: post.readTime }) }}
            </span>
            <span class="stat-divider">·</span>
            <span class="stat-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <template v-if="viewsLoading">...</template>
              <template v-else>{{ t('post.views', { n: postViews || 0 }) }}</template>
            </span>
          </div>
          <h1 class="post-title">{{ displayTitle }}</h1>
          <div class="post-tags"><span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span></div>
          <a v-if="post.demoUrl" :href="post.demoUrl" target="_blank" rel="noopener" class="demo-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            {{ locale === 'zh' ? '在线演示' : 'Live Demo' }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </a>
        </div>
        <div class="post-body">
          <template v-for="(section, i) in displaySections" :key="i">
            <h2 v-if="section.type === 'heading'" :id="section.id" class="section-heading"><span class="heading-hash">#</span>{{ section.content || '' }}</h2>
            <p v-else-if="section.type === 'text'" class="section-text">{{ section.content || '' }}</p>
            <ul v-else-if="section.type === 'list'" class="section-list"><li v-for="(item, j) in section.items" :key="j">{{ item }}</li></ul>
            <div v-else-if="section.type === 'code'" class="code-section">
              <CodeBlock :code="section.content || ''" :lang="section.lang" />
              <p v-if="section.explanation" class="code-explanation"><span class="explanation-icon" aria-hidden="true"></span>{{ section.explanation }}</p>
            </div>
          </template>
        </div>
        <!-- Demo showcase -->
        <DemoShowcase :post-id="post.id" :title="displayTitle" :category="post.category" />
      </article>
      <TocNav :sections="displaySections" :active-id="activeHeading" @navigate="scrollToHeading" />
    </div>

    <button v-if="showBackTop" class="back-top" :aria-label="locale === 'zh' ? '回到顶部' : 'Back to top'" @click="scrollToTop">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
  </div>
  <div v-else class="not-found">
    <span class="not-found-icon" aria-hidden="true">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="10" y="15" width="32" height="26" rx="2" stroke="currentColor" stroke-width="1.8"/>
        <path d="M16 22h20M16 29h13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </span>
    <h2>{{ locale === 'zh' ? '文章未找到' : 'Article Not Found' }}</h2>
    <p class="not-found-desc">{{ locale === 'zh' ? `没有找到 ID 为 "${route.params.id}" 的文章，它可能已被移除或链接有误。` : `No article found with ID "${route.params.id}". It may have been removed or the link is incorrect.` }}</p>
    <div class="not-found-actions">
      <button class="nf-btn primary" @click="router.push('/')">{{ locale === 'zh' ? '返回首页' : 'Back to Home' }}</button>
    </div>
    <div class="not-found-related" v-if="relatedPosts.length">
      <h4>{{ locale === 'zh' ? '推荐阅读' : 'Suggested Reading' }}</h4>
      <div class="related-grid">
        <router-link v-for="rp in relatedPosts" :key="rp.id" :to="'/post/' + rp.id" class="related-card">
          <span class="related-mark" aria-hidden="true">
            <span class="related-mark-grid"></span>
            <span class="related-mark-label">{{ rp.category.slice(0, 2).toUpperCase() }}</span>
          </span>
          <div class="related-info">
            <span class="related-title">{{ locale === 'en' ? (rp.titleEn || rp.title) : rp.title }}</span>
            <span class="related-meta">{{ rp.date }} · {{ rp.category }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-bar { position: fixed; top: var(--header-height); left: 0; right: 0; height: 3px; z-index: 99; background: transparent; }
.progress-fill {
  height: 100%;
  width: 100%;
  transform-origin: left center;
  background: linear-gradient(90deg, var(--accent), var(--accent-3));
  transition: transform 0.1s linear;
  border-radius: 0 2px 2px 0;
}
.post-detail { padding: 32px 24px 80px; max-width: var(--container-max); margin: 0 auto; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-2); font-size: 14px; font-weight: 560; cursor: pointer; transition: all 0.2s ease; margin-bottom: 24px; font-family: var(--font-sans); box-shadow: var(--shadow-card); }
.back-btn:hover { border-color: var(--accent); color: var(--accent); transform: translateX(-4px); box-shadow: var(--shadow-card-hover); }
.post-layout { display: flex; gap: 32px; align-items: flex-start; }
.post-content { flex: 1; min-width: 0; }
.post-banner { height: 180px; margin-bottom: 24px; border-radius: var(--radius-md); }
.post-banner :deep(svg) { height: 100%; object-fit: cover; }
.post-header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.post-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.post-category {
  padding: 3px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--bg-surface-hover);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
}
.post-date { font-size: 12.5px; color: var(--text-3); font-family: var(--font-mono); }
.post-stats { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.post-stats .stat-item { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--text-3); font-family: var(--font-mono); }
.post-stats .stat-item svg { opacity: 0.6; }
.post-stats .stat-divider { color: var(--text-3); opacity: 0.4; }
.post-title { font-family: var(--font-display); font-size: 36px; font-weight: 680; letter-spacing: 0; line-height: 1.26; margin-bottom: 12px; color: var(--text-1); }
.post-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.tag { padding: 3px 9px; border: 1px solid var(--border); background: var(--bg-surface); border-radius: var(--radius-xs); font-size: 12px; color: var(--text-3); font-family: var(--font-mono); }
.demo-link {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 12px; padding: 6px 14px;
  border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--bg-surface); color: var(--text-2);
  font-size: 13px; font-weight: 560; text-decoration: none;
  transition: all 0.15s;
}
.demo-link:hover { opacity: 1; text-decoration: none; color: var(--text-1); border-color: var(--border-strong); background: var(--bg-surface-hover); }
.section-heading { font-family: var(--font-display); font-size: 23px; font-weight: 680; margin: 40px 0 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); color: var(--text-1); scroll-margin-top: calc(var(--header-height) + 16px); display: flex; align-items: center; gap: 6px; }
.heading-hash { color: var(--accent); font-size: 16px; font-weight: 600; }
.section-text { font-size: 17px; color: var(--text-2); line-height: 2; margin-bottom: 16px; }
.section-list { list-style: none; padding: 0; margin-bottom: 14px; }
.section-list li { font-size: 16px; color: var(--text-2); padding: 5px 0 5px 22px; position: relative; line-height: 1.9; }
.section-list li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); font-size: 12px; line-height: 1.8; }
.code-section { margin: 16px 0; }
.code-explanation { font-size: 15.5px; color: var(--text-2); line-height: 1.85; padding: 15px 18px; background: var(--bg-surface); border-left: 3px solid var(--border-strong); border-radius: 0 var(--radius-md) var(--radius-md) 0; margin-top: 10px; display: flex; gap: 8px; }
.explanation-icon {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  margin-top: 9px;
  border-radius: 0;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.not-found { text-align: center; padding: 100px 24px 120px; color: var(--text-3); max-width: 640px; margin: 0 auto; }
.not-found-icon {
  display: inline-flex;
  margin-bottom: 16px;
  color: var(--text-3);
}
.not-found h2 { font-size: 24px; margin-bottom: 10px; color: var(--text-2); font-weight: 700; }
.not-found-desc { font-size: 15px; color: var(--text-3); line-height: 1.75; margin-bottom: 24px; }
.not-found-actions { margin-bottom: 36px; }
.nf-btn { padding: 10px 24px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; cursor: pointer; font-family: var(--font-sans); transition: all 0.2s; border: none; }
.nf-btn.primary { background: var(--accent); color: var(--accent-foreground); }
.nf-btn.primary:hover { opacity: 0.85; transform: translateY(-1px); }
.not-found-related { text-align: left; }
.not-found-related h4 { font-size: 13px; font-weight: 600; color: var(--text-2); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.related-grid { display: flex; flex-direction: column; gap: 8px; }
.related-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  text-decoration: none; color: inherit;
  transition: all 0.2s;
}
.related-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow-card-hover); text-decoration: none; color: inherit; transform: translateY(-1px); }
.related-mark {
  position: relative;
  width: 44px;
  height: 36px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface-hover);
}
.related-mark-grid {
  position: absolute;
  inset: 0;
  opacity: 0.55;
  background-image:
    linear-gradient(var(--border-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);
  background-size: 12px 12px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 78%);
  -webkit-mask-image: radial-gradient(circle at center, black 0%, transparent 78%);
}
.related-mark-label {
  position: relative;
  z-index: 1;
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0;
}
.related-info { display: flex; flex-direction: column; min-width: 0; }
.related-title { font-size: 15px; font-weight: 560; color: var(--text-1); }
.related-meta { font-size: 12px; color: var(--text-3); font-family: var(--font-mono); margin-top: 2px; }
@media (max-width: 1024px) { .post-layout { flex-direction: column; } }
@media (max-width: 768px) { .post-detail { padding: 24px 16px 60px; } .post-title { font-size: 31px; } }
@media (max-width: 640px) { .post-detail { padding: 24px 12px 60px; } .post-banner { height: 130px; border-radius: var(--radius-md); } }

.back-top {
  position: fixed; bottom: 32px; right: 32px; z-index: 90;
  width: 40px; height: 40px; border-radius: var(--radius-md);
  background: var(--bg-surface); border: 1px solid var(--border);
  color: var(--text-2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-card); transition: all 0.2s;
  animation: fadeInScale 0.25s var(--ease-out) both;
}
.back-top:hover { color: var(--accent); border-color: var(--border-accent); }

@media (max-width: 768px) { .back-top { bottom: 24px; right: 20px; } }
</style>
