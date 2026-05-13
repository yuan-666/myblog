<script setup lang="ts">
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { LocaleKey, SetLocaleKey, TKey } from '../i18n'

const scrolled = ref(false)
const mobileOpen = ref(false)

const theme = inject<{ value: 'light' | 'dark' | 'system' }>('theme')!
const cycleTheme = inject<() => void>('cycleTheme')!
const locale = inject(LocaleKey)!
const setLocale = inject(SetLocaleKey)!
const t = inject(TKey)!

const nextLocale = computed(() => locale.value === 'zh' ? 'en' : 'zh')
const localeToggleLabel = computed(() => locale.value === 'zh' ? '切换到英文' : 'Switch to Chinese')
const themeLabel = computed(() => {
  if (locale.value === 'zh') {
    if (theme.value === 'system') return '系统'
    return theme.value === 'light' ? '亮色' : '暗色'
  }
  if (theme.value === 'system') return 'System'
  return theme.value === 'light' ? 'Light' : 'Dark'
})

function handleScroll() { scrolled.value = window.scrollY > 10 }
function closeMobile() { mobileOpen.value = false }

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header class="header" :class="{ scrolled, 'is-scrolled': scrolled }">
    <div class="header-bg"></div>
    <div class="header-inner container">
      <router-link to="/" class="logo" @click="closeMobile">
        <span class="logo-mark" aria-hidden="true">
          <img class="logo-icon" src="/site-icon.png" alt="" />
        </span>
        <span class="logo-text">{{ t('site.name') }}</span>
      </router-link>

      <nav id="site-nav" class="nav" :class="{ open: mobileOpen }">
        <router-link to="/" @click="closeMobile" class="nav-link" exact-active-class="active">
          {{ t('nav.articles') }}
        </router-link>
        <router-link to="/about" @click="closeMobile" class="nav-link" exact-active-class="active">
          {{ t('nav.about') }}
        </router-link>
        <router-link to="/github" @click="closeMobile" class="nav-link" exact-active-class="active">
          GitHub
        </router-link>
        <router-link to="/analytics" @click="closeMobile" class="nav-link" exact-active-class="active">
          {{ t('nav.analytics') }}
        </router-link>
      </nav>

      <div class="header-right">
        <div class="header-divider" aria-hidden="true"></div>
        <button class="icon-btn" @click="setLocale(nextLocale)" :aria-label="localeToggleLabel" :title="localeToggleLabel">
          <span class="lang-label">{{ nextLocale === 'zh' ? '中' : 'EN' }}</span>
        </button>
        <button class="icon-btn" @click="cycleTheme" :aria-label="locale === 'zh' ? '切换主题' : 'Switch theme'">
          <span class="theme-label">{{ themeLabel }}</span>
        </button>
        <button
          class="hamburger"
          @click="mobileOpen = !mobileOpen"
          :class="{ open: mobileOpen }"
          :aria-label="mobileOpen ? (locale === 'zh' ? '关闭导航菜单' : 'Close navigation menu') : (locale === 'zh' ? '打开导航菜单' : 'Open navigation menu')"
          :aria-expanded="mobileOpen"
          aria-controls="site-nav"
        >
          <span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mobile-mask" v-if="mobileOpen" @click="closeMobile"></div>
  </header>
</template>

<style scoped>
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: var(--header-height);
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color var(--transition), border-color var(--transition);
}
.header-bg {
  position: absolute; inset: 0;
  background: transparent;
  transition: background-color var(--transition), backdrop-filter var(--transition);
}
.header.is-scrolled {
  border-bottom-color: var(--border);
}
.header.is-scrolled .header-bg {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-inner {
  display: flex; align-items: center; justify-content: space-between;
  height: 100%; position: relative; z-index: 1;
}

.logo {
  display: flex; align-items: center; gap: 8px;
  color: var(--text-2); text-decoration: none; flex-shrink: 0;
  transition: color 0.2s var(--ease);
}
.logo:hover { color: var(--text-1); text-decoration: none; opacity: 1; }
.logo-mark {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  overflow: hidden;
  transition: border-color 0.2s var(--ease), transform 0.2s var(--ease);
}
.logo-mark::after {
  content: "";
  position: absolute;
  inset: 0;
  box-shadow: inset 0 1px 0 var(--border-glow);
  pointer-events: none;
}
.logo:hover .logo-mark {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.logo:active .logo-mark {
  transform: translateY(0);
}
.logo-icon {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.logo-text {
  font-family: var(--font-sans);
  font-weight: 650;
  font-size: 15px;
  letter-spacing: 0;
}

.nav { display: flex; align-items: center; gap: 16px; }
.nav-link {
  display: inline-flex; align-items: center;
  color: var(--text-2);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 560;
  position: relative;
  padding: 0;
  border-radius: 0;
  transition: color 0.2s var(--ease), opacity 0.2s var(--ease);
  text-decoration: none;
}
.nav-link:hover { color: var(--text-1); background: transparent; opacity: 1; text-decoration: none; }
.nav-link.active, .nav-link.router-link-active {
  color: var(--text-1);
  font-weight: 600;
  background: transparent;
}

/* Header Right */
.header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.header-divider {
  width: 1px;
  height: 12px;
  margin: 0 4px;
  background: var(--border-strong);
}
.icon-btn {
  display: flex; align-items: center; justify-content: center;
  min-width: 0;
  height: auto;
  padding: 0;
  border-radius: 0;
  background: transparent; border: none; color: var(--text-3);
  font-family: var(--font-sans);
  font-size: 12px;
  cursor: pointer; transition: color 0.2s var(--ease);
}
.icon-btn:hover { color: var(--text-1); background: transparent; border-color: transparent; opacity: 1; }
.lang-label,
.theme-label { font-size: 12px; font-weight: 650; letter-spacing: 0.01em; }

/* Hamburger */
.hamburger {
  display: none; flex-direction: column; gap: 4px;
  background: none; border: none; cursor: pointer; padding: 6px;
}
.hamburger span {
  display: block; width: 16px; height: 1.5px; background: var(--text-2);
  border-radius: 1px; transition: all 0.25s var(--ease-out);
}
.hamburger.open span:nth-child(1) { transform: translateY(2.75px) rotate(45deg); }
.hamburger.open span:nth-child(2) { transform: translateY(-2.75px) rotate(-45deg); }

.mobile-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.28);
  backdrop-filter: blur(1px); z-index: -1;
}

@media (max-width: 768px) {
  .header-inner { padding: 0 20px; }
  .header-divider { display: none; }
  .hamburger { display: flex; }
  .nav {
    position: fixed; top: var(--header-height); left: 0; right: 0;
    background: var(--bg-surface-solid);
    border-bottom: 1px solid var(--border);
    flex-direction: column; align-items: flex-start;
    padding: 18px 24px; gap: 16px;
    opacity: 0; pointer-events: none;
    transform: translateY(-10px);
    transition: opacity 0.25s var(--ease-out), transform 0.25s var(--ease-out);
    box-shadow: var(--shadow-float); z-index: 1001;
  }
  .nav.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
  .nav-link { width: 100%; padding: 4px 0; font-size: 14px; }
}
</style>
