<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { LocaleKey } from '../i18n'
import { localizedPostCategory, localizedTags } from '../utils/postLabels'

const locale = inject(LocaleKey)!

const props = defineProps<{
  id: string; title: string; titleEn?: string; summary: string; summaryEn?: string;
  category: string; tags: string[]; date: string; cover: string
}>()

const displayTitle = computed(() => locale.value === 'en' ? (props.titleEn || props.title) : props.title)
const displaySummary = computed(() => locale.value === 'en' ? (props.summaryEn || props.summary) : props.summary)
const displayCategory = computed(() => localizedPostCategory(props.category, locale.value))
const displayTags = computed(() => localizedTags(props.tags, locale.value, 3))

const hovered = ref(false)
const linkTo = computed(() => (props.id && props.id !== 'undefined') ? '/post/' + props.id : '/')
</script>

<template>
  <router-link
    :to="linkTo"
    class="post-card"
    :class="{ hovered }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div class="card-accent"></div>

    <div class="card-cover" aria-hidden="true">
      <span class="cover-grid"></span>
      <span class="cover-label">{{ displayCategory }}</span>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ displayTitle }}</h3>
      <p class="card-summary">{{ displaySummary }}</p>
      <div class="card-footer">
        <div class="card-tags">
          <span v-for="tag in displayTags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <time class="card-date">{{ date }}</time>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.post-card {
  display: flex; flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.25s var(--ease-out), border-color 0.3s;
  color: inherit; text-decoration: none;
  position: relative;
}
.post-card:hover { color: inherit; text-decoration: none; }
.post-card.hovered {
  border-color: var(--border-accent);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
}

/* Accent line */
.card-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--signal);
  z-index: 2; opacity: 0;
  transition: opacity 0.3s;
}
.post-card.hovered .card-accent { opacity: 1; }

/* ---- Cover ---- */
.card-cover {
  position: relative; z-index: 1;
  height: 90px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  background: var(--bg-surface-hover);
  border-bottom: 1px solid var(--border);
}
.cover-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.35;
}
.cover-label {
  position: relative; z-index: 1;
  padding: 3px 8px;
  border: 1px solid var(--border-strong);
  background: var(--bg-base);
  color: var(--text-2); font-size: 11.5px; font-weight: 600;
  letter-spacing: 0.2px;
  font-family: var(--font-mono);
}

/* ---- Body ---- */
.card-body {
  padding: 14px 16px 16px;
  display: flex; flex-direction: column; flex: 1;
  position: relative; z-index: 1;
}
.card-title {
  font-size: 16.5px; font-weight: 650; line-height: 1.45;
  margin-bottom: 6px; color: var(--text-1);
}
.post-card.hovered .card-title { color: var(--accent); }
.card-summary {
  font-size: 14.5px; color: var(--text-2); line-height: 1.75;
  flex: 1; margin-bottom: 16px;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto;
}
.card-tags { display: flex; gap: 4px; }
.tag {
  padding: 2px 6px; border-radius: var(--radius-xs);
  background: var(--bg-sunken);
  font-size: 11px; color: var(--text-3);
  font-family: var(--font-mono);
}
.card-date {
  font-size: 12px; color: var(--text-3);
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .card-cover { height: 72px; }
}
</style>
