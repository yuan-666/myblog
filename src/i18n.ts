import { ref, type InjectionKey, type Ref } from 'vue'

export type Locale = 'zh' | 'en'

const zh: Record<string, string> = {
  'site.title': '智荟元陆 · 编程经验分享',
  'site.name': '智荟元陆',
  'site.tagline': '编程经验分享',
  'nav.articles': '文章',
  'nav.about': '关于',
  'nav.analytics': '统计',
  'home.search': '搜索文章...',
  'home.all': '全部',
  'home.cloudHint': '点击标签快速筛选',
  'home.empty': '暂无匹配的文章',
  'home.results': '找到 {n} 篇相关文章',
  'filter.python': 'Python',
  'filter.fullstack': '全栈',
  'filter.ai': 'AI / 算法',
  'filter.devops': '运维',
  'about.title': '关于智荟元陆',
  'about.subtitle': 'yuan6.cn — 记录编程之路的每个脚印',
  'about.p1': '智荟元陆（yuan6.cn）是我的个人编程经验分享站。在这里，我记录从课程设计到生产项目的完整开发过程，包括核心代码和逐行解释。',
  'about.p2': '我是一名 CS 在读本科生，目前在做全栈开发实习。日常接触 Vue 3、Spring Boot、FastAPI、PyTorch 等技术栈，也在做混合云部署和深度学习方向的研究。',
  'about.p3': '这个站点的每篇文章都包含真实的、可运行的代码片段，希望能帮到同样在学习编程的你。',
  'about.links.github': '开源项目 & 代码',
  'about.links.home': '个人主页',
  'post.back': '返回',
  'post.notfound': '文章未找到',
  'post.home': '返回首页',
  'footer.copy': '© 2026 Yuan',
  'about.nav.site': '关于网站',
  'about.nav.privacy': '隐私与免责',
  'about.nav.changelog': '版本迭代',
  'about.nav.tech': '技术文档',
  'about.site.title': '关于网站',
  'about.site.subtitle': '智荟元陆的定位与技术理念',
  'about.privacy.title': '隐私与免责',
  'about.privacy.subtitle': '透明、可控的数据处理方式',
  'about.changelog.title': '版本迭代',
  'about.changelog.subtitle': '从 v1.0.0 到最新版本的演进之路',
  'about.changelog.viewRelease': '查看 Release',
  'about.changelog.total': '共 {n} 个版本',
  'about.tech.title': '技术文档',
  'about.tech.subtitle': '本站的技术栈与架构说明',
  'about.tech.frontend': '前端',
  'about.tech.backend': '后端 & 边缘',
  'about.tech.deploy': '部署',
  'about.tech.ai': 'AI 能力',
  'home.totalPosts': '共 {n} 篇文章 · 总计 {w} 字',
  'post.wordCount': '{n} 字',
  'post.readTime': '约 {n} 分钟',
  'post.views': '{n} 次访问',
  'pagination.prev': '上一页',
  'pagination.next': '下一页',
  'pagination.goto': '跳至',
  'pagination.page': '页',
  'pagination.of': '/ {n}',
}

const en: Record<string, string> = {
  'site.title': 'YuanHub · Dev Experience',
  'site.name': 'YuanHub',
  'site.tagline': 'Dev Experience Sharing',
  'nav.articles': 'Articles',
  'nav.about': 'About',
  'nav.analytics': 'Analytics',
  'home.search': 'Search articles...',
  'home.all': 'All',
  'home.cloudHint': 'Click a tag to filter',
  'home.empty': 'No matching articles',
  'home.results': '{n} matching articles',
  'filter.python': 'Python',
  'filter.fullstack': 'Full Stack',
  'filter.ai': 'AI / Algo',
  'filter.devops': 'DevOps',
  'about.title': 'About YuanHub',
  'about.subtitle': 'yuan6.cn — Every Step on the Dev Path',
  'about.p1': 'YuanHub (yuan6.cn) is my personal programming experience sharing site. Here I document complete development journeys from course projects to production systems, including core code with line-by-line explanations.',
  'about.p2': 'I\'m an undergraduate CS student currently interning as a full-stack developer, working with Vue 3, Spring Boot, FastAPI, PyTorch, and exploring hybrid cloud deployment and deep learning.',
  'about.p3': 'Every article on this site contains real, runnable code — hope it helps fellow learners on their programming journey.',
  'about.links.github': 'Open Source & Code',
  'about.links.home': 'Homepage',
  'post.back': 'Back',
  'post.notfound': 'Article not found',
  'post.home': 'Go Home',
  'footer.copy': '© 2026 Yuan',
  'about.nav.site': 'About Site',
  'about.nav.privacy': 'Privacy',
  'about.nav.changelog': 'Changelog',
  'about.nav.tech': 'Tech Docs',
  'about.site.title': 'About the Site',
  'about.site.subtitle': 'YuanHub positioning and technical philosophy',
  'about.privacy.title': 'Privacy & Disclaimer',
  'about.privacy.subtitle': 'Transparent and controllable data practices',
  'about.changelog.title': 'Changelog',
  'about.changelog.subtitle': 'The evolution from v1.0.0 to the latest release',
  'about.changelog.viewRelease': 'View Release',
  'about.changelog.total': '{n} releases total',
  'about.tech.title': 'Technical Documentation',
  'about.tech.subtitle': 'Tech stack and architecture of this site',
  'about.tech.frontend': 'Frontend',
  'about.tech.backend': 'Backend & Edge',
  'about.tech.deploy': 'Deployment',
  'about.tech.ai': 'AI Capabilities',
  'home.totalPosts': '{n} articles · {w} words total',
  'post.wordCount': '{n} words',
  'post.readTime': '~{n} min read',
  'post.views': '{n} views',
  'pagination.prev': 'Prev',
  'pagination.next': 'Next',
  'pagination.goto': 'Go to',
  'pagination.page': '',
  'pagination.of': '/ {n}',
}

const messages: Record<Locale, Record<string, string>> = { zh, en }

const LOCALE_KEY = 'blog-locale'

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_KEY) as Locale | null
    if (stored && ['zh', 'en'].includes(stored)) return stored
  } catch {}
  const nav = navigator.language.toLowerCase()
  return nav.startsWith('zh') ? 'zh' : 'en'
}

export const LocaleKey: InjectionKey<Ref<Locale>> = Symbol('locale')
export const SetLocaleKey: InjectionKey<(l: Locale) => void> = Symbol('setLocale')
export const TKey: InjectionKey<(key: string, vars?: Record<string, string | number>) => string> = Symbol('t')

export function useI18n() {
  const locale = ref<Locale>(detectLocale())

  function setLocale(l: Locale) {
    locale.value = l
    try { localStorage.setItem(LOCALE_KEY, l) } catch {}
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
    document.title = l === 'zh' ? zh['site.title'] : en['site.title']
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const dict = messages[locale.value]
    let val = dict?.[key] ?? messages['en'][key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        val = val.replace(`{${k}}`, String(v))
      }
    }
    return val
  }

  // Set initial lang/title
  setLocale(locale.value)

  return { locale, setLocale, t }
}
