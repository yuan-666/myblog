<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useI18n, LocaleKey, SetLocaleKey, TKey } from './i18n'
import { postSummaries } from './posts/catalog'

type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')
const resolvedTheme = ref<'light' | 'dark'>('light')
let mediaQuery: MediaQueryList | null = null

const { locale, setLocale, t } = useI18n()
const route = useRoute()

const cookieConsent = ref(localStorage.getItem('cookie-consent') !== 'true')
let lastTrackedPath = ''

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
function resolveTheme() {
  resolvedTheme.value = theme.value === 'system' ? getSystemTheme() : theme.value
  document.documentElement.setAttribute('data-theme', resolvedTheme.value)
}
function cycleTheme() {
  const order: Theme[] = ['system', 'light', 'dark']
  const idx = order.indexOf(theme.value)
  theme.value = order[(idx + 1) % order.length]
  localStorage.setItem('blog-theme', theme.value)
  resolveTheme()
}
function onMediaChange() {
  if (theme.value === 'system') resolveTheme()
}

function runWhenIdle(fn: () => void, delay = 700) {
  const w = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  }
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 1800 })
  else window.setTimeout(fn, delay)
}

function trackVisit(path = route.fullPath || '/') {
  try {
    if (!path || path === lastTrackedPath) return
    lastTrackedPath = path

    fetch('https://myblog-api.yuan6.cn/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: document.referrer || 'direct',
        page: path,
        ua: navigator.userAgent || '',
      }),
    }).catch(() => { /* 静默失败 */ })

    const postMatch = path.match(/^\/post\/([^/?#]+)/)
    if (postMatch) {
      const postId = decodeURIComponent(postMatch[1])
      const post = postSummaries.find(p => p.id === postId)
      fetch('https://myblog-api.yuan6.cn/pv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/post/' + postId,
          title: post?.title || postId,
        }),
      }).catch(() => { /* 静默失败 */ })
    }
  } catch { /* 静默失败 */ }
}

watch(() => route.fullPath, (path) => runWhenIdle(() => trackVisit(path)), { immediate: true })

onMounted(() => {
  const saved = localStorage.getItem('blog-theme') as Theme | null
  if (saved && ['light', 'dark', 'system'].includes(saved)) theme.value = saved
  resolveTheme()
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', onMediaChange)
})
onUnmounted(() => {
  mediaQuery?.removeEventListener('change', onMediaChange)
})

watch(theme, resolveTheme)

provide('theme', theme)
provide('resolvedTheme', resolvedTheme)
provide('cycleTheme', cycleTheme)
provide(LocaleKey, locale)
provide(SetLocaleKey, setLocale)
provide(TKey, t)

function acceptCookies() {
  localStorage.setItem('cookie-consent', 'true')
  cookieConsent.value = false
}
</script>

<template>
  <div class="app">
    <div class="site-backdrop" aria-hidden="true"></div>

    <AppHeader />

    <main class="main">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <AppFooter />

    <Transition name="cookie-slide">
      <div v-if="cookieConsent" class="cookie-banner">
        <div class="cookie-inner">
          <p class="cookie-text">
            {{ locale === 'zh' ? '本站使用本地存储保存偏好设置以优化体验。' : 'We use local storage for preferences.' }}
          </p>
          <button class="cookie-btn" @click="acceptCookies">{{ locale === 'zh' ? '明白' : 'Got it' }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.main {
  min-height: calc(100vh - 180px);
  padding-top: var(--header-height);
}

.site-backdrop {
  position: fixed;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  background: var(--bg-base);
}

/* Cookie Banner */
.cookie-slide-enter-active { transition: all 0.4s var(--ease-out); }
.cookie-slide-leave-active { transition: all 0.25s var(--ease); }
.cookie-slide-enter-from,
.cookie-slide-leave-to { transform: translateY(18px); opacity: 0; }

.cookie-banner {
  position: fixed; right: 24px; bottom: 24px;
  z-index: 200; max-width: calc(100% - 48px);
}
.cookie-inner {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 14px; border-radius: var(--radius-sm);
  background: var(--bg-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}
.cookie-text {
  font-size: 13px; color: var(--text-2); line-height: 1.5;
  margin: 0; flex: 1; min-width: 0;
}
.cookie-btn {
  flex-shrink: 0;
  padding: 4px 12px; border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 600; cursor: pointer;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-1);
  transition: all 0.2s var(--ease-out);
  font-family: var(--font-sans);
}
.cookie-btn:hover { background: var(--text-1); color: var(--bg-base); opacity: 1; }

@media (max-width: 640px) {
  .cookie-banner { left: 16px; right: 16px; bottom: 16px; max-width: none; }
  .cookie-inner { flex-direction: column; align-items: stretch; text-align: center; border-radius: var(--radius-lg); padding: 16px; }
  .cookie-btn { padding: 8px 12px; }
}
</style>
