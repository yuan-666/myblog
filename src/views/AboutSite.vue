<script setup lang="ts">
import { inject } from 'vue'
import { TKey, LocaleKey } from '../i18n'

const t = inject(TKey)!
const locale = inject(LocaleKey)!
const isZh = () => locale.value === 'zh'
</script>

<template>
  <div class="about-site">
    <div class="page-hero">
      <h1 class="page-title">{{ t('about.site.title') }}</h1>
      <p class="page-subtitle">{{ t('about.site.subtitle') }}</p>
    </div>

    <div class="content-card">
      <div class="about-body">
        <p>{{ t('about.p1') }}</p>
        <p>{{ t('about.p2') }}</p>
        <p>{{ t('about.p3') }}</p>
      </div>
      <div class="about-techs">
        <span class="tech-tag">Vue 3</span>
        <span class="tech-tag">TypeScript</span>
        <span class="tech-tag">Vite</span>
        <span class="tech-tag">Spring Boot</span>
        <span class="tech-tag">FastAPI</span>
        <span class="tech-tag">PyTorch</span>
        <span class="tech-tag">Docker</span>
        <span class="tech-tag">Python</span>
        <span class="tech-tag">K8s</span>
      </div>

      <div class="about-links">
        <router-link to="/github" class="link-card">
          <div class="link-icon gh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </div>
          <div class="link-text">
            <span class="link-label">GitHub</span>
            <span class="link-desc">{{ isZh() ? '开源项目与贡献统计' : 'Open Source & Contributions' }}</span>
          </div>
          <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
        </router-link>
        <a href="https://me.yuan6.cn" target="_blank" rel="noopener" class="link-card">
          <div class="link-icon web">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div class="link-text">
            <span class="link-label">me.yuan6.cn</span>
            <span class="link-desc">{{ isZh() ? '我的个人作品集合' : 'My personal portfolio collection' }}</span>
          </div>
          <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-site { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-hero { text-align: center; margin-bottom: 32px; }
.page-title { font-family: var(--font-display); font-size: 34px; font-weight: 680; letter-spacing: 0; margin-bottom: 8px; color: var(--text-1); }
.page-subtitle { font-size: 14.5px; color: var(--text-2); font-family: var(--font-sans); }

.content-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 32px;
  box-shadow: var(--shadow-card);
}
.about-body p { font-size: 16.5px; color: var(--text-2); line-height: 2; margin-bottom: 14px; }

.about-techs { display: flex; flex-wrap: wrap; gap: 6px; margin: 24px 0; padding: 20px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.tech-tag {
  padding: 4px 12px; border-radius: 6px;
  background: rgba(99,102,241,0.06); color: var(--accent);
  font-size: 12.5px; font-weight: 500; font-family: var(--font-mono);
  border: 1px solid rgba(99,102,241,0.12);
}

.about-links { display: flex; gap: 12px; margin-top: 24px; }
.link-card {
  flex: 1; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: var(--bg-sunken);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  color: var(--text-2); text-decoration: none;
  transition: all 0.25s ease; position: relative; overflow: hidden;
}
.link-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.04), transparent);
  opacity: 0; transition: opacity 0.25s;
}
.link-card:hover { border-color: var(--border-accent); box-shadow: var(--shadow-card-hover); text-decoration: none; color: var(--text-2); }
.link-card:hover::before { opacity: 1; }
.link-card:hover .link-arrow { opacity: 1; transform: translate(2px, -2px); }
.link-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
.link-icon.gh { background: linear-gradient(135deg, #333, #555); }
.link-icon.web { background: linear-gradient(135deg, var(--accent), var(--accent-3)); }
.link-text { display: flex; flex-direction: column; min-width: 0; }
.link-label { font-size: 14px; font-weight: 650; color: var(--text-1); }
.link-desc { font-size: 12.5px; color: var(--text-3); }
.link-arrow { flex-shrink: 0; color: var(--text-3); opacity: 0; transition: all 0.25s ease; }

@media (max-width: 480px) {
  .content-card { padding: 20px; }
  .about-links { flex-direction: column; }
}
</style>
