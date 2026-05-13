<script setup lang="ts">
defineProps<{
  svg: string
}>()
</script>

<template>
  <div class="post-cover" v-html="svg"></div>
</template>

<style scoped>
.post-cover {
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-surface-hover);
  animation: fadeInScale 0.4s var(--ease);
}

.post-cover :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}
</style>
