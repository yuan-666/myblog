import type { Locale } from '../i18n'

const categoryZh: Record<string, string> = {
  python: 'Python / 脚本',
  fullstack: '全栈项目',
  ai: 'AI / 算法',
  devops: '部署运维',
}

const categoryEn: Record<string, string> = {
  python: 'Python',
  fullstack: 'Full Stack',
  ai: 'AI / Algo',
  devops: 'DevOps',
}

const tagEn: Record<string, string> = {
  'AI 入门': 'AI Basics',
  自动化: 'Automation',
  提示词: 'Prompting',
  事务: 'Transactions',
  乐观锁: 'Optimistic Locking',
  深度学习: 'Deep Learning',
  蚁群算法: 'Ant Colony',
  启发式搜索: 'Heuristic Search',
  爬虫: 'Web Scraping',
  词云: 'Word Cloud',
  排序: 'Sorting',
  权限控制: 'Access Control',
}

const tagZh: Record<string, string> = {
  LLM: '大语言模型',
  NLP: '自然语言处理',
  CNN: '卷积神经网络',
  LSTM: '长短期记忆网络',
  ACO: '蚁群优化',
  i18n: '国际化',
}

export function localizedPostCategory(category: string, locale: Locale): string {
  const dict = locale === 'zh' ? categoryZh : categoryEn
  return dict[category] || category
}

export function localizedTag(tag: string, locale: Locale): string {
  if (locale === 'zh') return tagZh[tag] || tag
  return tagEn[tag] || tag
}

export function localizedTags(tags: string[], locale: Locale, limit?: number): string[] {
  const list = typeof limit === 'number' ? tags.slice(0, limit) : tags
  return list.map(tag => localizedTag(tag, locale))
}
