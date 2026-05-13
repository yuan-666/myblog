<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import { TKey, LocaleKey } from '../i18n'
import { versions, getCategoryLabel, getCategoryColor } from '../data/versions'

const t = inject(TKey)!
const localeRef = inject(LocaleKey)!
const locale = computed(() => localeRef.value)
const isZh = () => locale.value === 'zh'

const filter = ref<'all' | 'feature' | 'fix' | 'improve' | 'infra'>('all')

const filteredVersions = computed(() => {
  if (filter.value === 'all') return versions
  return versions.filter(v => v.category === filter.value)
})

const filters: { key: typeof filter.value; label: string; labelEn: string }[] = [
  { key: 'all', label: '全部', labelEn: 'All' },
  { key: 'feature', label: '新功能', labelEn: 'Feature' },
  { key: 'fix', label: '修复', labelEn: 'Fix' },
  { key: 'improve', label: '优化', labelEn: 'Improve' },
  { key: 'infra', label: '架构', labelEn: 'Infra' },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return isZh() ? `${y}年${m}月${day}日` : `${y}-${m}-${day}`
}
</script>

<template>
  <div class="changelog-page">
    <div class="page-hero">
      <h1 class="page-title">{{ t('about.changelog.title') }}</h1>
      <p class="page-subtitle">{{ t('about.changelog.subtitle') }}</p>
      <p class="version-count">{{ t('about.changelog.total', { n: versions.length }) }}</p>
    </div>

    <div class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="{ active: filter === f.key }"
        :aria-pressed="filter === f.key"
        @click="filter = f.key"
      >
        {{ isZh() ? f.label : f.labelEn }}
      </button>
    </div>

    <div class="timeline">
      <div class="timeline-line" aria-hidden="true"></div>

      <transition-group name="timeline-item" tag="div" class="timeline-items">
        <div
          v-for="(v, idx) in filteredVersions"
          :key="v.tag"
          class="timeline-item"
          :class="{ 'item-left': idx % 2 === 0, 'item-right': idx % 2 === 1 }"
        >
          <div class="timeline-node" :style="{ background: getCategoryColor(v.category) }">
            <div class="node-ring"></div>
          </div>

          <div class="timeline-card-wrapper">
            <div class="timeline-card">
              <div class="card-header">
                <span class="version-tag">{{ v.tag }}</span>
                <span
                  class="category-badge"
                  :style="{ background: getCategoryColor(v.category) }"
                >
                  {{ getCategoryLabel(v.category, locale) }}
                </span>
              </div>
              <div class="card-date">{{ formatDate(v.date) }}</div>
              <h4 class="card-title">{{ isZh() ? v.title : v.titleEn }}</h4>
              <ul class="card-highlights">
                <li v-for="(h, i) in (isZh() ? v.highlights : v.highlightsEn)" :key="i">
                  {{ h }}
                </li>
              </ul>
              <a
                :href="`https://github.com/yuan-666/myblog/releases/tag/${v.tag}`"
                target="_blank"
                rel="noopener"
                class="release-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                {{ t('about.changelog.viewRelease') }}
              </a>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.changelog-page { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-hero { text-align: center; margin-bottom: 28px; }
.page-title { font-family: var(--font-display); font-size: 34px; font-weight: 680; letter-spacing: 0; margin-bottom: 8px; color: var(--text-1); }
.page-subtitle { font-size: 14.5px; color: var(--text-2); font-family: var(--font-sans); }
.version-count { font-size: 12.5px; color: var(--text-3); margin-top: 6px; font-family: var(--font-mono); }

/* Filter Bar */
.filter-bar {
  display: flex; gap: 8px; flex-wrap: wrap;
  justify-content: center; margin-bottom: 36px;
}
.filter-btn {
  padding: 6px 16px; border-radius: 20px;
  font-size: 13px; font-weight: 560; font-family: var(--font-sans);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}
.filter-btn:hover {
  border-color: var(--border-accent);
  color: var(--text-1);
}
.filter-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
  box-shadow: 0 2px 12px var(--accent-glow);
}

/* Timeline */
.timeline {
  position: relative;
  padding: 8px 0 40px;
}
.timeline-line {
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 2px;
  background: linear-gradient(180deg,
    transparent 0%,
    var(--border-strong) 5%,
    var(--border-strong) 95%,
    transparent 100%
  );
  transform: translateX(-50%);
}
.timeline-items {
  position: relative;
  display: flex; flex-direction: column; gap: 28px;
}
.timeline-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  width: 100%;
}

/* Node */
.timeline-node {
  position: absolute;
  left: 50%;
  top: 20px;
  width: 14px; height: 14px;
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 2;
  box-shadow: 0 0 0 4px var(--bg-body), 0 0 16px rgba(99,102,241,0.3);
}
.node-ring {
  position: absolute; inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Card wrapper positioning */
.timeline-card-wrapper {
  width: calc(50% - 32px);
}
.item-left .timeline-card-wrapper {
  margin-right: auto;
  padding-right: 32px;
  text-align: right;
}
.item-right .timeline-card-wrapper {
  margin-left: auto;
  padding-left: 32px;
  text-align: left;
}

/* Card */
.timeline-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s var(--ease-out);
  text-align: left;
}
.timeline-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover), 0 8px 32px rgba(99,102,241,0.08);
  border-color: var(--border-accent);
}

.card-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px; flex-wrap: wrap;
}
.version-tag {
  font-size: 18px; font-weight: 800;
  background: var(--gradient-text);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--font-mono);
  letter-spacing: 0;
}
.category-badge {
  padding: 2px 10px; border-radius: 4px;
  font-size: 11px; font-weight: 600; color: #fff;
  letter-spacing: 0.3px;
}
.card-date {
  font-size: 12px; color: var(--text-3);
  font-family: var(--font-mono);
  margin-bottom: 8px;
}
.card-title {
  font-size: 15.5px; font-weight: 650; color: var(--text-1);
  margin-bottom: 10px; line-height: 1.5;
}
.card-highlights {
  list-style: none; padding: 0; margin: 0 0 12px;
}
.card-highlights li {
  font-size: 14px; color: var(--text-2); line-height: 1.85;
  padding-left: 14px; position: relative;
  margin-bottom: 3px;
}
.card-highlights li::before {
  content: '';
  position: absolute; left: 0; top: 8px;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--border-strong);
}
.release-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--accent);
  text-decoration: none; font-weight: 500;
  transition: all 0.15s;
}
.release-link:hover {
  text-decoration: underline;
  gap: 8px;
}

/* Transitions */
.timeline-item-enter-active { transition: all 0.35s var(--ease-out); }
.timeline-item-leave-active { transition: all 0.25s var(--ease); }
.timeline-item-enter-from,
.timeline-item-leave-to { opacity: 0; transform: scale(0.96); }

/* Responsive */
@media (max-width: 768px) {
  .timeline-line { left: 18px; }
  .timeline-node { left: 18px; }
  .timeline-item { flex-direction: column; }
  .timeline-card-wrapper {
    width: 100% !important;
    padding-left: 44px !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    text-align: left !important;
  }
}

@media (max-width: 480px) {
  .timeline-card { padding: 16px 18px; }
  .version-tag { font-size: 16px; }
}
</style>
