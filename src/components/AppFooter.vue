<script setup lang="ts">
import { inject } from 'vue'
import { TKey, LocaleKey } from '../i18n'

const t = inject(TKey)!
const locale = inject(LocaleKey)!

const partnerLinks = [
  { key: 'deepseek', name: 'DeepSeek', src: '/brand/deepseek.png', href: 'https://www.deepseek.com/' },
  { key: 'mimo', name: 'Xiaomi MiMo', src: '/brand/mimo.png', href: 'https://mimo.xiaomi.com/' },
  { key: 'alibaba', name: 'Alibaba Cloud ESA', src: '/brand/alibaba-cloud.svg', href: 'https://www.aliyun.com/product/esa' },
  { key: 'cloudflare', name: 'Cloudflare', src: '/brand/cloudflare.png', href: 'https://www.cloudflare.com/' },
]
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-divider"></div>
      <div class="footer-main">
        <div class="footer-left">
          <div class="footer-logo-wrap">
            <img class="footer-logo" src="/site-icon.png" alt="" aria-hidden="true" />
          </div>
          <div class="footer-brand">
            <span class="footer-name">{{ t('site.name') }}</span>
            <span class="footer-tagline">{{ t('site.tagline') }}</span>
          </div>
        </div>

        <div class="partner-row" :aria-label="locale === 'zh' ? '友情链接' : 'Partner links'">
          <span class="partner-label">{{ locale === 'zh' ? '友情链接' : 'Friends' }}</span>
          <div class="partner-links">
            <a
              v-for="item in partnerLinks"
              :key="item.name"
              :href="item.href"
              target="_blank"
              rel="noopener"
              class="partner-link"
              :class="`is-${item.key}`"
              :title="item.name"
            >
              <img class="partner-logo" :src="item.src" :alt="item.name" loading="lazy" />
            </a>
          </div>
        </div>

        <div class="footer-right">
          <a href="https://github.com/yuan-666" target="_blank" rel="noopener" class="footer-link" title="GitHub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <router-link to="/about" class="footer-link policy-link">{{ locale === 'zh' ? '隐私 & 免责' : 'Privacy' }}</router-link>
          <span class="footer-copy">{{ t('footer.copy') }}</span>
        </div>
      </div>
      <div class="footer-filing">
        <a href="https://beian.mps.gov.cn/#/query/webSearch?code=43011102002451" rel="noreferrer" target="_blank" class="filing-item">
          <img class="filing-icon" src="/beian.png" alt="备案图标" width="16" height="16" />湘公网安备43011102002451号
        </a>
        <span class="filing-sep">·</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" class="filing-item">湘ICP备2024065803号</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { padding: 36px 0 32px; }
.footer-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 24px;
}
.footer-main {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) auto minmax(160px, 1fr);
  align-items: center;
  gap: 24px;
}
.footer-left { display: flex; align-items: center; gap: 10px; }
.footer-logo-wrap {
  width: 26px; height: 26px; border-radius: var(--radius-sm);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.footer-logo {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.footer-brand { display: flex; flex-direction: column; gap: 1px; }
.footer-name { font-size: 14px; font-weight: 650; color: var(--text-2); }
.footer-tagline { font-size: 12px; color: var(--text-3); }
.footer-right { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
.footer-link {
  color: var(--text-3); transition: all 0.2s var(--ease-out);
  display: flex; border-radius: var(--radius-full);
}
.footer-link:hover { color: var(--text-1); transform: translateY(-1px); }
.policy-link { font-size: 12.5px; text-decoration: none; }
.footer-copy { font-size: 12px; color: var(--text-3); font-family: var(--font-mono); }
.partner-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
}
.partner-label {
  color: var(--text-3);
  font-size: 11.5px;
  white-space: nowrap;
}
.partner-links {
  display: flex;
  align-items: center;
  gap: 7px;
}
.partner-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  overflow: hidden;
  transition: transform 0.2s var(--ease-out), border-color 0.2s, box-shadow 0.2s;
}
.partner-link::after {
  display: none;
}
.partner-link:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card-hover);
  text-decoration: none;
  transform: translateY(-1px);
}
.partner-logo {
  position: relative;
  z-index: 1;
  display: block;
  max-width: 66px;
  max-height: 18px;
  object-fit: contain;
}
.partner-link.is-deepseek { width: 86px; }
.partner-link.is-deepseek .partner-logo { max-width: 74px; max-height: 17px; }
.partner-link.is-mimo { width: 78px; }
.partner-link.is-mimo .partner-logo { max-width: 66px; max-height: 16px; }
.partner-link.is-alibaba { width: 94px; }
.partner-link.is-alibaba .partner-logo { max-width: 80px; max-height: 15px; }
.partner-link.is-cloudflare { width: 86px; }
.partner-link.is-cloudflare .partner-logo { max-width: 72px; max-height: 17px; }
html[data-theme='light'] .partner-link {
  border-color: var(--border);
  background: var(--bg-surface);
  box-shadow: var(--shadow-card);
}
.footer-filing {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; margin-top: 20px; padding-top: 16px;
  border-top: 1px solid var(--border);
}
.filing-item {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; color: var(--text-3); text-decoration: none;
  transition: color 0.15s ease;
}
.filing-item:hover { color: var(--text-1); text-decoration: none; }
.filing-icon { flex-shrink: 0; opacity: 0.8; vertical-align: middle; }
.filing-sep { font-size: 10px; color: var(--border-strong); }
@media (max-width: 900px) {
  .footer-main { grid-template-columns: 1fr; gap: 16px; text-align: center; }
  .footer-left, .footer-right, .partner-row { justify-content: center; }
  .partner-links { flex-wrap: wrap; justify-content: center; }
}
@media (max-width: 480px) {
  .footer-right { flex-direction: column; gap: 8px; }
  .partner-row { flex-direction: column; gap: 7px; }
  .footer-filing { flex-wrap: wrap; }
}
</style>
