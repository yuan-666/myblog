<script setup lang="ts">
import type { Section } from '../posts/index'

defineProps<{
  sections: Section[]
  activeId: string
}>()

defineEmits<{
  navigate: [id: string]
}>()
</script>

<template>
  <nav class="toc-nav">
    <div class="toc-title">目录</div>
    <ul class="toc-list">
      <li
        v-for="s in sections.filter(s => s.type === 'heading' && s.id)" :key="s.id"
        :class="{ active: activeId === s.id }"
      >
        <a @click.prevent="$emit('navigate', s.id!)" href="'#' + s.id">
          {{ s.content }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.toc-nav {
  position: sticky; top: calc(var(--header-height) + 24px);
  width: 200px; flex-shrink: 0;
  max-height: calc(100vh - var(--header-height) - 48px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-card);
}
.toc-title {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1.5px; color: var(--text-3);
  margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.toc-list { list-style: none; padding: 0; }
.toc-list li { margin-bottom: 2px; }
.toc-list a {
  display: block; padding: 5px 10px; border-radius: 6px;
  font-size: 12px; color: var(--text-2); line-height: 1.5;
  cursor: pointer; text-decoration: none;
  transition: all 0.15s ease;
  border-left: 2px solid transparent;
}
.toc-list a:hover { color: var(--text-1); background: var(--bg-sunken); }
.toc-list li.active a {
  color: var(--accent); font-weight: 600;
  background: rgba(99,102,241,0.06);
  border-left-color: var(--accent);
}

@media (max-width: 1024px) {
  .toc-nav { display: none; }
}
</style>
