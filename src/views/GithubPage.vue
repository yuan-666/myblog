<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { LocaleKey } from '../i18n'

const locale = inject(LocaleKey)!

const ghStars = ref<number | null>(null)
const ghRepos = ref<number | null>(null)
const ghFollowers = ref<number | null>(null)
const repos = ref<any[]>([])
const loading = ref(true)
const error = ref('')

const isZh = () => locale.value === 'zh'

async function fetchGitHub() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/yuan-666'),
      fetch('https://api.github.com/users/yuan-666/repos?per_page=50&sort=updated'),
    ])
    if (!userRes.ok) throw new Error('Failed to fetch user data')
    const user = await userRes.json()
    const reposData = await reposRes.json()

    ghFollowers.value = user.followers
    ghRepos.value = user.public_repos
    ghStars.value = reposData.reduce((sum: number, r: any) => sum + r.stargazers_count, 0)
    repos.value = reposData.filter((r: any) => !r.fork).slice(0, 12)
    loading.value = false
  } catch (e: any) {
    error.value = e.message
    loading.value = false
  }
}

onMounted(fetchGitHub)
</script>

<template>
  <div class="github-page">
    <div class="gh-hero">
      <h1 class="gh-title">GitHub</h1>
      <p class="gh-subtitle">{{ isZh() ? '开源项目与贡献统计' : 'Open Source & Contribution Stats' }}</p>
    </div>

    <!-- Stats -->
    <div class="gh-stats" v-if="!loading && !error">
      <div class="gh-stat-card">
        <span class="gh-stat-num">{{ ghRepos }}</span>
        <span class="gh-stat-label">{{ isZh() ? '公开仓库' : 'Public Repos' }}</span>
      </div>
      <div class="gh-stat-card">
        <span class="gh-stat-num">{{ ghStars }}</span>
        <span class="gh-stat-label">Stars</span>
      </div>
      <div class="gh-stat-card">
        <span class="gh-stat-num">{{ ghFollowers }}</span>
        <span class="gh-stat-label">{{ isZh() ? '关注者' : 'Followers' }}</span>
      </div>
    </div>

    <!-- Error -->
    <div class="gh-error" v-if="error">
      <p>{{ isZh() ? 'GitHub API 请求受限，请稍后再试。' : 'GitHub API rate limited. Please try again later.' }}</p>
    </div>

    <!-- Heatmap -->
    <div class="gh-heatmap" v-if="!loading && !error">
      <img
        src="https://ghchart.rshah.org/0891b2/yuan-666"
        alt="GitHub contribution heatmap"
        loading="lazy" class="heatmap-img"
      />
    </div>

    <!-- Repos -->
    <div class="gh-repos" v-if="repos.length">
      <h2 class="section-title">{{ isZh() ? '近期仓库' : 'Recent Repositories' }}</h2>
      <div class="repo-grid">
        <a
          v-for="repo in repos" :key="repo.id"
          :href="repo.html_url" target="_blank" rel="noopener"
          class="repo-card"
        >
          <div class="repo-header">
            <span class="repo-name">{{ repo.name }}</span>
            <span class="repo-lang" v-if="repo.language">{{ repo.language }}</span>
          </div>
          <p class="repo-desc" v-if="repo.description">{{ repo.description }}</p>
          <div class="repo-meta">
            <span class="repo-star" v-if="repo.stargazers_count > 0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {{ repo.stargazers_count }}
            </span>
            <span class="repo-updated">{{ repo.updated_at.slice(0, 10) }}</span>
          </div>
        </a>
      </div>
    </div>

    <!-- Loading -->
    <div class="gh-loading" v-if="loading">
      <div class="spinner"></div>
      <p>{{ isZh() ? '加载中...' : 'Loading...' }}</p>
    </div>

    <!-- External link -->
    <div class="gh-external">
      <a href="https://github.com/yuan-666" target="_blank" rel="noopener" class="external-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        <span>{{ isZh() ? '打开 GitHub 主页' : 'Open GitHub Profile' }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.github-page { padding: 48px 24px 80px; max-width: var(--container-max); margin: 0 auto; }
.gh-hero { text-align: center; margin-bottom: 36px; }
.gh-title { font-family: var(--font-display); font-size: 44px; font-weight: 680; letter-spacing: 0; margin-bottom: 8px; background: var(--gradient-text); background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: gradientFlow 8s ease-in-out infinite; }
.gh-subtitle { font-size: 15.5px; color: var(--text-2); }

/* Stats */
.gh-stats { display: flex; gap: 16px; justify-content: center; margin-bottom: 36px; flex-wrap: wrap; }
.gh-stat-card {
  flex: 1; min-width: 130px; max-width: 180px;
  padding: 20px; border-radius: var(--radius-lg);
  background: var(--bg-surface); border: 1px solid var(--border);
  text-align: center;
}
.gh-stat-num { display: block; font-size: 32px; font-weight: 700; color: var(--text-1); font-family: var(--font-mono); line-height: 1.2; }
.gh-stat-label { display: block; font-size: 12px; color: var(--text-3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

/* Error */
.gh-error { text-align: center; padding: 32px; color: var(--text-3); }

/* Heatmap */
.gh-heatmap {
  overflow-x: auto; border-radius: var(--radius-lg);
  border: 1px solid var(--border); margin-bottom: 40px;
}
.heatmap-img { display: block; width: 100%; min-width: 600px; }

/* Repos */
.section-title { font-size: 18px; font-weight: 650; color: var(--text-1); margin-bottom: 16px; }
.repo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 40px; }
.repo-card {
  display: flex; flex-direction: column;
  padding: 16px; border-radius: var(--radius-md);
  background: var(--bg-surface); border: 1px solid var(--border);
  text-decoration: none; color: inherit;
  transition: all 0.2s;
}
.repo-card:hover { border-color: var(--border-accent); box-shadow: var(--shadow-card-hover); text-decoration: none; color: inherit; }
.repo-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.repo-name { font-size: 15px; font-weight: 650; color: var(--accent); }
.repo-lang {
  padding: 1px 6px; border-radius: 100px;
  background: var(--accent-soft); color: var(--accent);
  font-size: 11px; font-weight: 500;
  margin-left: auto;
}
.repo-desc { font-size: 13.5px; color: var(--text-2); line-height: 1.7; flex: 1; margin-bottom: 10px; }
.repo-meta { display: flex; align-items: center; gap: 12px; }
.repo-star { display: flex; align-items: center; gap: 3px; font-size: 12px; color: var(--text-3); }
.repo-updated { font-size: 11px; color: var(--text-3); font-family: var(--font-mono); margin-left: auto; }

/* External link */
.gh-external { text-align: center; }
.external-link {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: var(--radius-md);
  background: var(--bg-surface); border: 1px solid var(--border);
  color: var(--text-2); text-decoration: none;
  font-size: 15px; font-weight: 560;
  transition: all 0.2s;
}
.external-link:hover { border-color: var(--border-accent); color: var(--accent); text-decoration: none; }

@media (max-width: 768px) {
  .github-page { padding: 36px 20px 60px; }
}
@media (max-width: 480px) {
  .github-page { padding: 28px 16px 50px; }
  .gh-stats { gap: 10px; }
  .gh-stat-card { min-width: 100px; padding: 14px; }
  .gh-stat-num { font-size: 24px; }
  .repo-grid { grid-template-columns: 1fr; }
}
</style>
