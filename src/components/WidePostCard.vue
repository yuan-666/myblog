<script setup lang="ts">
import { computed, inject } from 'vue'
import { LocaleKey, TKey } from '../i18n'
import { localizedPostCategory, localizedTags } from '../utils/postLabels'

const locale = inject(LocaleKey)!
const t = inject(TKey)!

const props = defineProps<{
  id: string
  title: string
  titleEn?: string
  summary: string
  summaryEn?: string
  category: string
  tags: string[]
  date: string
  cover: string
  coverSvg?: string
  wordCount?: number
  readTime?: number
  views?: number
  pinned?: boolean
}>()

const displayTitle = computed(() => locale.value === 'en' ? (props.titleEn || props.title) : props.title)
const displaySummary = computed(() => locale.value === 'en' ? (props.summaryEn || props.summary) : props.summary)
const displayCategory = computed(() => localizedPostCategory(props.category, locale.value))
const displayTags = computed(() => localizedTags(props.tags, locale.value, 4))

const metaLine = computed(() => {
  const parts: string[] = [props.date]
  if (props.wordCount != null) parts.push(t('post.wordCount', { n: String(props.wordCount) }))
  if (props.readTime != null) parts.push(t('post.readTime', { n: String(props.readTime) }))
  if (props.views != null) parts.push(t('post.views', { n: String(props.views) }))
  return parts.join(' · ')
})
</script>

<template>
  <router-link :to="'/post/' + id" class="wide-post-card data-row">
    <div class="row-indicator" :class="{ active: pinned }" aria-hidden="true"></div>

    <div class="row-content">
      <div class="meta-data">
        <span v-if="pinned" class="pin-dot" aria-hidden="true"></span>
        <span class="mono-txt">{{ metaLine }}</span>
        <span class="separator">/</span>
        <span class="mono-txt highlight">{{ displayCategory }}</span>
      </div>

      <h3 class="row-title">{{ displayTitle }}</h3>
      <p class="row-desc">{{ displaySummary }}</p>

      <div class="row-tags" aria-hidden="true">
        <span v-for="tag in displayTags" :key="tag">{{ tag }}</span>
      </div>
    </div>

    <div class="row-signal" aria-hidden="true">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <div class="row-action" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </div>
  </router-link>
</template>

<style scoped>
.data-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 32px 0;
  border-bottom: 1px solid var(--border);
  background: transparent;
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  transition: background-color var(--transition), color var(--transition), transform 0.2s var(--ease);
  animation: hero-reveal 0.45s var(--ease) both;
}

.data-row::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--text-1), transparent);
  opacity: 0;
  transition: 0s;
}

.data-row:hover {
  background: var(--bg-surface);
  color: inherit;
  opacity: 1;
}

.data-row:active {
  transform: translateY(1px);
}

.data-row:hover::after {
  left: 100%;
  opacity: 1;
  transition: left 0.8s ease, opacity 0.3s ease;
}

.row-indicator {
  width: 2px;
  height: 0;
  margin-top: 6px;
  margin-right: 24px;
  background: var(--text-1);
  transition: height 0.3s var(--ease), background-color 0.3s var(--ease);
}

.data-row:hover .row-indicator,
.row-indicator.active { height: 16px; }
.row-indicator.active { background: var(--signal); }

.row-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-right: 24px;
}

.meta-data {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.pin-dot {
  width: 5px;
  height: 5px;
  background: var(--signal);
}
.mono-txt { color: var(--text-3); }
.mono-txt.highlight { color: var(--text-2); }
.separator { color: var(--border-strong); }

.row-title {
  margin: 0 0 10px;
  color: var(--text-1);
  font-size: 18px;
  font-weight: 620;
  line-height: 1.42;
  letter-spacing: 0;
}

.row-desc {
  margin: 0;
  color: var(--text-2);
  font-size: 15.5px;
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.row-tags span {
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.row-signal {
  width: 78px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  align-self: center;
  margin-right: 22px;
  opacity: 0.36;
  transition: opacity 0.3s var(--ease);
}

.row-signal span {
  width: 1px;
  background: var(--border-strong);
}
.row-signal span:nth-child(1) { height: 7px; }
.row-signal span:nth-child(2) { height: 15px; }
.row-signal span:nth-child(3) { height: 22px; background: var(--text-2); }
.row-signal span:nth-child(4) { height: 12px; }
.row-signal span:nth-child(5) { height: 18px; }

.data-row:hover .row-signal { opacity: 0.72; }

.row-action {
  color: var(--text-3);
  align-self: center;
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.3s var(--ease), transform 0.3s var(--ease), color 0.3s var(--ease);
}

.data-row:hover .row-action {
  opacity: 1;
  transform: translateX(0);
  color: var(--text-1);
}

@media (max-width: 640px) {
  .data-row { padding: 24px 16px; margin: 0 -16px; }
  .row-indicator,
  .row-action,
  .row-signal { display: none; }
  .row-content { padding-right: 0; }
  .meta-data { flex-wrap: wrap; row-gap: 4px; }
  .row-title { font-size: 17px; }
  .row-desc { font-size: 15px; }
  .meta-data { font-size: 11.5px; }
}
</style>
