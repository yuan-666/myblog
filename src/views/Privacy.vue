<script setup lang="ts">
import { inject } from 'vue'
import { TKey, LocaleKey } from '../i18n'

const t = inject(TKey)!
const locale = inject(LocaleKey)!
const isZh = () => locale.value === 'zh'
</script>

<template>
  <div class="privacy-page">
    <div class="page-hero">
      <h1 class="page-title">{{ t('about.privacy.title') }}</h1>
      <p class="page-subtitle">{{ t('about.privacy.subtitle') }}</p>
    </div>

    <div class="content-card">
      <section class="section">
        <h3 class="section-label">
          <span class="section-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          {{ isZh() ? '隐私政策' : 'Privacy Policy' }}
        </h3>
        <div class="section-body">
          <p v-if="isZh()">本站通过私有统计服务进行访问统计，记录以下有限访问日志数据：</p>
          <p v-else>This site uses a private analytics service for visit analytics, recording the following limited access-log data:</p>
          <ul class="bullet-list">
            <li v-if="isZh()">页面访问次数（总访问 / 今日访问）</li>
            <li v-else>Page visit counts (total and daily)</li>
            <li v-if="isZh()">访问来源域名（如通过搜索引擎或外链进入）</li>
            <li v-else>Referrer domain (e.g., from search engines or external links)</li>
            <li v-if="isZh()">粗略地理位置聚合（公开统计只展示区域级摘要，不展示原始访问日志）</li>
            <li v-else>Approximate geographic aggregation (public analytics shows only regional summaries, not raw access logs)</li>
            <li v-if="isZh()">浏览器类型（如 Chrome / Firefox / Safari）</li>
            <li v-else>Browser type (e.g., Chrome / Firefox / Safari)</li>
          </ul>
          <p v-if="isZh()">以上数据仅用于统计本站访问情况、定位异常城市聚合和排查接口问题。公开统计页只读取聚合摘要，不会返回原始访问日志或完整浏览器标识。</p>
          <p v-else>This data is used solely for site analytics, diagnosing incorrect city aggregation, and troubleshooting API issues. The public analytics page only reads aggregated summaries and does not return raw visit logs or full browser identifiers.</p>
          <p v-if="isZh()">本站的 GitHub 页面通过 GitHub API 展示公开仓库和 Star 统计数据，不会请求或存储任何用户授权信息。</p>
          <p v-else>The GitHub page displays public repository and star statistics via the GitHub API. No user authorization data is requested or stored.</p>
        </div>
      </section>

      <section class="section">
        <h3 class="section-label">
          <span class="section-icon warn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </span>
          {{ isZh() ? '免责声明' : 'Disclaimer' }}
        </h3>
        <div class="section-body">
          <p v-if="isZh()">本站所有文章内容仅供学习和参考，不构成任何专业建议。文章中的代码示例可在遵守相应开源协议的前提下自由使用，但作者不对因使用这些代码而产生的任何问题承担责任。</p>
          <p v-else>All content on this site is for learning and reference only and does not constitute professional advice. Code examples may be freely used under their respective open-source licenses, but the author assumes no liability for any issues arising from their use.</p>
          <p v-if="isZh()">本站的外部链接（如 GitHub、yuan6.cn 等）内容不由本站控制，访问者需自行判断其安全性。</p>
          <p v-else>External links (e.g., GitHub, yuan6.cn) are beyond this site's control. Visitors should assess their safety independently.</p>
        </div>
      </section>

      <section class="section">
        <h3 class="section-label">
          <span class="section-icon cookie">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </span>
          Cookie
        </h3>
        <div class="section-body">
          <p v-if="isZh()">本站仅使用必要的浏览器本地存储（localStorage）来保存您的语言偏好和主题设置。本站不使用任何第三方追踪 Cookie。</p>
          <p v-else>This site uses only essential browser local storage (localStorage) to save your language preference and theme settings. No third-party tracking cookies are used.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.privacy-page { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.page-hero { text-align: center; margin-bottom: 32px; }
.page-title { font-family: var(--font-display); font-size: 34px; font-weight: 680; letter-spacing: 0; margin-bottom: 8px; color: var(--text-1); }
.page-subtitle { font-size: 14.5px; color: var(--text-2); font-family: var(--font-sans); }

.content-card {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 32px;
  box-shadow: var(--shadow-card);
}
.section { margin-bottom: 32px; }
.section:last-child { margin-bottom: 0; }
.section-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 17px; font-weight: 700; color: var(--text-1);
  margin-bottom: 16px; letter-spacing: 0;
}
.section-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}
.section-icon.warn { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.section-icon.cookie { background: linear-gradient(135deg, #10b981, #06b6d4); }
.section-body p { font-size: 16.5px; color: var(--text-2); line-height: 2; margin-bottom: 12px; }

.bullet-list {
  margin: 12px 0 16px 4px;
  padding-left: 20px;
  list-style: none;
}
.bullet-list li {
  position: relative;
  font-size: 15.5px; color: var(--text-2); line-height: 1.9;
  margin-bottom: 6px;
  padding-left: 16px;
}
.bullet-list li::before {
  content: '';
  position: absolute; left: 0; top: 10px;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent);
}

@media (max-width: 480px) {
  .content-card { padding: 20px; }
}
</style>
