<script setup lang="ts">
import { ref, inject } from 'vue'
import { LocaleKey, TKey } from '../i18n'

const locale = inject(LocaleKey)!
const t = inject(TKey)!

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const gotoPage = ref('')

function goTo(page: number) {
  if (page < 1 || page > props.totalPages) return
  emit('change', page)
}

function handleGoto() {
  const n = parseInt(gotoPage.value, 10)
  if (!isNaN(n) && n >= 1 && n <= props.totalPages) {
    goTo(n)
    gotoPage.value = ''
  }
}

// Generate visible page numbers with ellipsis
function getPages(): (number | '...')[] {
  const { currentPage, totalPages } = props
  if (totalPages <= 1) return []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (currentPage > 3) pages.push('...')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) pages.push('...')

  pages.push(totalPages)
  return pages
}
</script>

<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="pagination-nav">
      <!-- Prev -->
      <button
        class="page-btn nav-btn"
        :class="{ disabled: currentPage <= 1 }"
        :disabled="currentPage <= 1"
        :aria-label="t('pagination.prev')"
        @click="goTo(currentPage - 1)"
      >
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        <span>{{ t('pagination.prev') }}</span>
      </button>

      <!-- Page Numbers -->
      <div class="page-numbers">
        <template v-for="page in getPages()" :key="page">
          <span v-if="page === '...'" class="ellipsis">...</span>
          <button
            v-else
            class="page-btn"
            :class="{ active: page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            :aria-label="locale === 'zh' ? `第 ${page} 页` : `Page ${page}`"
            @click="goTo(page)"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Next -->
      <button
        class="page-btn nav-btn"
        :class="{ disabled: currentPage >= totalPages }"
        :disabled="currentPage >= totalPages"
        :aria-label="t('pagination.next')"
        @click="goTo(currentPage + 1)"
      >
        <span>{{ t('pagination.next') }}</span>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>

    <!-- Jump -->
    <div class="pagination-jump">
      <span class="jump-label">{{ t('pagination.goto') }}</span>
      <input
        v-model="gotoPage"
        type="text"
        class="jump-input"
        :aria-label="locale === 'zh' ? '跳转到页码' : 'Go to page number'"
        :placeholder="String(currentPage)"
        @keydown.enter="handleGoto"
      />
      <span class="jump-label">{{ t('pagination.page') }}</span>
    </div>

    <!-- Info -->
    <div class="pagination-info">
      {{ locale === 'zh' ? `共 ${totalPages} 页 / ${totalItems} 篇` : `${totalPages} pages / ${totalItems} posts` }}
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 26px 0 8px;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: border-color 0.15s var(--ease), color 0.15s var(--ease), background-color 0.15s var(--ease), transform 0.15s var(--ease);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-2);
}

.page-btn:hover:not(.disabled):not(.active) {
  border-color: var(--border-accent);
  color: var(--text-1);
}

.page-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-foreground);
  font-weight: 600;
}

.page-btn:active:not(.disabled) {
  transform: translateY(1px);
}

.page-btn.nav-btn {
  gap: 4px;
  padding: 0 12px;
}

.page-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  font-size: 13px;
  color: var(--text-3);
  font-family: var(--font-mono);
}

.pagination-jump {
  display: flex;
  align-items: center;
  gap: 6px;
}

.jump-label {
  font-size: 12px;
  color: var(--text-3);
  font-family: var(--font-mono);
}

.jump-input {
  width: 40px;
  height: 28px;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-xs);
  background: var(--bg-surface);
  color: var(--text-1);
  font-size: 13px;
  font-family: var(--font-mono);
  outline: none;
  transition: border-color 0.15s;
}

.jump-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.pagination-info {
  font-size: 12px;
  color: var(--text-3);
  font-family: var(--font-mono);
}

@media (max-width: 640px) {
  .page-btn.nav-btn span {
    display: none;
  }

  .page-btn.nav-btn {
    padding: 0 8px;
  }
}
</style>
