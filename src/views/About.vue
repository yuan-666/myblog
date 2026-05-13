<script setup lang="ts">
import { inject, computed } from 'vue'
import { useRoute } from 'vue-router'
import { TKey } from '../i18n'

const t = inject(TKey)!
const route = useRoute()

const tabs = [
  { path: '/about/site', key: 'about.nav.site' },
  { path: '/about/privacy', key: 'about.nav.privacy' },
  { path: '/about/changelog', key: 'about.nav.changelog' },
  { path: '/about/tech', key: 'about.nav.tech' },
]

const currentPath = computed(() => route.path)
</script>

<template>
  <div class="about-layout">
    <div class="about-sidebar">
      <h2 class="sidebar-title">{{ t('nav.about') }}</h2>
      <nav class="sidebar-nav">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="sidebar-link"
          :class="{ active: currentPath === tab.path }"
        >
          <span class="link-dot"></span>
          {{ t(tab.key) }}
        </router-link>
      </nav>
    </div>
    <div class="about-content">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.about-layout {
  display: flex;
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 24px 80px;
  gap: 40px;
  min-height: calc(100vh - var(--header-height));
}

.about-sidebar {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--header-height) + 40px);
  align-self: flex-start;
}
.sidebar-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 680;
  color: var(--text-1);
  margin-bottom: 20px;
  letter-spacing: 0;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: var(--text-2);
  font-size: 15px;
  font-weight: 560;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}
.sidebar-link:hover {
  color: var(--text-1);
  background: var(--bg-surface-hover);
  text-decoration: none;
}
.sidebar-link.active {
  color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}
.link-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-strong);
  transition: all 0.2s ease;
}
.sidebar-link.active .link-dot {
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.about-content {
  flex: 1;
  min-width: 0;
}

/* Transitions */
.fade-slide-enter-active { transition: all 0.3s var(--ease-out); }
.fade-slide-leave-active { transition: all 0.2s var(--ease); }
.fade-slide-enter-from { opacity: 0; transform: translateX(12px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-12px); }

@media (max-width: 768px) {
  .about-layout {
    flex-direction: column;
    padding: 32px 20px 60px;
    gap: 24px;
  }
  .about-sidebar {
    width: 100%;
    position: static;
  }
  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
  }
  .sidebar-link {
    padding: 8px 14px;
    font-size: 14px;
  }
}
</style>
