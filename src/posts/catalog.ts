export interface PostSummary {
  id: string
  title: string
  titleEn?: string
  summary: string
  summaryEn?: string
  category: string
  tags: string[]
  date: string
  cover: string
  demoUrl?: string
  pinned?: boolean
  wordCount: number
  readTime: number
  coverSvg: string
}

function generateCoverSvg(post: Omit<PostSummary, 'coverSvg'>): string {
  const patternType = hashPostId(post.id) % 4
  const lines = wrapText(post.title || 'Untitled', 13)
  const textFontSize = 14 - Math.max(0, lines.length - 1)
  const textStartY = 126
  const textEls = lines.map((line, i) =>
    `<text x="180" y="${textStartY + i * (textFontSize + 7)}" text-anchor="middle" font-size="${textFontSize}" font-weight="600" fill="var(--text-2)" font-family="Geist, system-ui, -apple-system, sans-serif">${escapeXml(line)}</text>`
  ).join('\n  ')
  const pattern = coverPattern(patternType, post.id)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200" viewBox="0 0 360 200">
  <defs>
    <clipPath id="clip-${post.id}"><rect x="0" y="0" width="360" height="200" rx="2"/></clipPath>
  </defs>
  <g clip-path="url(#clip-${post.id})">
    <rect width="360" height="200" fill="var(--bg-surface-hover)"/>
    ${pattern}
    <path d="M24 24H336V176H24V24Z" fill="none" stroke="var(--border)" stroke-width="1"/>
    <path d="M24 58H336M88 24V176M272 24V176" fill="none" stroke="var(--border)" stroke-width="1" opacity="0.65"/>
    <rect x="86" y="56" width="4" height="4" fill="var(--signal)" opacity="0.82"/>
    <text x="180" y="47" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-3)" font-family="JetBrains Mono, ui-monospace, monospace" letter-spacing="1.6">${escapeXml(post.category.toUpperCase())}</text>
    ${textEls}
    <text x="180" y="164" text-anchor="middle" font-size="9" fill="var(--text-3)" font-family="JetBrains Mono, ui-monospace, monospace" letter-spacing="1.2">/${escapeXml(post.id)}</text>
  </g>
</svg>`
}

function hashPostId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function coverPattern(type: number, id: string): string {
  if (type === 0) {
    return `<pattern id="dots-${id}" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--border-strong)"/></pattern>
    <rect width="360" height="200" fill="url(#dots-${id})" opacity="0.65"/>`
  }
  if (type === 1) {
    return `<path d="M-40 190L150 0M0 218L218 0M58 220L278 0M118 220L338 0M178 220L398 0" stroke="var(--border-strong)" stroke-width="1" opacity="0.45"/>`
  }
  if (type === 2) {
    return `<path d="M0 40H360M0 80H360M0 120H360M0 160H360M40 0V200M80 0V200M120 0V200M160 0V200M200 0V200M240 0V200M280 0V200M320 0V200" stroke="var(--border-strong)" stroke-width="1" opacity="0.36"/>`
  }
  return `<circle cx="180" cy="100" r="24" fill="none" stroke="var(--border-strong)" opacity="0.55"/><circle cx="180" cy="100" r="54" fill="none" stroke="var(--border-strong)" opacity="0.45"/><circle cx="180" cy="100" r="84" fill="none" stroke="var(--border-strong)" opacity="0.35"/><circle cx="180" cy="100" r="114" fill="none" stroke="var(--border-strong)" opacity="0.25"/>`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrapText(text: string, maxLen: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const ch of text) {
    const isAscii = ch.charCodeAt(0) < 256
    const w = isAscii ? 0.5 : 1
    if (current.length + w > maxLen) {
      lines.push(current)
      current = ch
    } else {
      current += ch
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 2)
}

const rawSummaries: Omit<PostSummary, 'coverSvg'>[] = [
  {
    id: 'ai-tools-beginner',
    title: '从网页聊天到自动化：电脑小白的 AI 工具入门路线',
    titleEn: 'From Chatbots to Automation: An AI Tools Guide for Beginners',
    summary: '这是一篇给完全电脑小白看的 AI 入门指南：从网页对话工具开始，学会写清楚需求、整理资料、处理表格和文件，再逐步进入 WorkBuddy、QClow、OpenClow 这类自动化工作流，同时建立隐私和安全边界。',
    summaryEn: 'A beginner-friendly guide to AI tools: start with browser chat tools, learn prompting, document work and simple file workflows, then move toward automation tools with clear privacy boundaries.',
    category: 'ai',
    tags: ['AI 入门', 'DeepSeek', 'MiMo', '自动化', 'WorkBuddy', '提示词'],
    date: '2026-05-11',
    cover: '🤖',
    wordCount: 4273,
    readTime: 15,
  },
  {
    id: 'automation-pipeline',
    title: '我的博客流水线自动化：纯静态部署如何串起统计、AI 与边缘能力',
    titleEn: 'My Blog Automation Pipeline: Static Frontend, Edge APIs and AI Tooling',
    summary: '这篇文章拆解智荟元陆的自动化流水线：前端保持 Vue 3/Vite 纯静态，访问统计、文章 PV、AI 代理、IndexNow、地图可视化、GitHub 推送和边缘部署则由 ESA Edge Functions、EdgeKV、Cloudflare Workers 与 AI 工具串联完成。',
    summaryEn: 'A breakdown of YuanHub automation: a static Vue frontend powered by ESA Edge Functions, EdgeKV, Cloudflare Workers, IndexNow and AI-assisted workflows.',
    category: 'devops',
    tags: ['自动化', 'ESA', 'Cloudflare', 'EdgeKV', 'Vue 3', 'CI/CD'],
    date: '2026-05-11',
    cover: '⚙️',
    wordCount: 7153,
    readTime: 24,
  },
  {
    id: 'ticket-system',
    title: '车票管理系统',
    titleEn: 'Ticket Management System',
    summary: 'Flask + Vue 3 全栈项目：事务防超售（SELECT FOR UPDATE）、CSV 批量导入导出、滑块验证码安全设计。',
    summaryEn: 'Vue 3 + Flask full-stack project: ticket purchasing, refund, class management, CSV import/export with admin dashboard.',
    category: 'fullstack',
    tags: ['Flask', 'Vue 3', 'MySQL', '事务'],
    date: '2025-06',
    cover: '🚄',
    demoUrl: 'https://yuan-666.github.io/keshe-static/',
    wordCount: 4570,
    readTime: 16,
  },
  {
    id: 'llm-explained',
    title: '大语言模型原理：从概率预测到智能工具',
    titleEn: 'How LLMs Work: From Probability to Intelligence',
    summary: '从底层数学出发解释大语言模型(LLM)的完整原理：Token化→嵌入→Transformer→自回归→RLHF→工具使用。',
    summaryEn: 'Complete LLM principles from the ground up: tokenization, embeddings, Transformer attention, autoregressive generation, RLHF alignment, and tool use.',
    category: 'ai',
    tags: ['LLM', 'Transformer', 'GPT', 'NLP'],
    date: '2025-05',
    cover: '💬',
    wordCount: 5827,
    readTime: 20,
  },
  {
    id: 'myweb-portfolio',
    title: '个人作品集网站',
    titleEn: 'Personal Portfolio Website',
    summary: 'Vue 3 + GSAP + TypeScript 构建的高端个人作品集网站，支持3D卡片倾斜、视差滚动、粒子背景、i18n国际化。',
    summaryEn: 'Premium portfolio built with Vue 3 + GSAP + TypeScript: 3D tilt cards, parallax scrolling, particle background, i18n.',
    category: 'fullstack',
    tags: ['Vue 3', 'GSAP', 'TypeScript', 'i18n'],
    date: '2025-03',
    cover: '🎨',
    wordCount: 2402,
    readTime: 9,
  },
  {
    id: 'cloud-deploy',
    title: '混合云部署实战',
    titleEn: 'Hybrid Cloud Deployment Practice',
    summary: '从 Nginx 反向代理到 HTTPS 证书配置，从 GitHub CI/CD 到多云自动部署的完整运维实践。',
    summaryEn: 'Multi-cloud deployment strategy: Alibaba Cloud (ECS/OSS/CDN) + Cloudflare + Vercel, with Docker containerization and Nginx reverse proxy.',
    category: 'devops',
    tags: ['Nginx', 'HTTPS', 'CI/CD', 'Docker'],
    date: '2025-01',
    cover: '☁️',
    wordCount: 1919,
    readTime: 7,
  },
  {
    id: 'campus-activity',
    title: '校园活动管理系统',
    titleEn: 'Campus Activity Management System',
    summary: 'Spring Boot 3.3 全栈项目：Redis 缓存 + MySQL 乐观锁实现原子报名，支持高并发防超卖。',
    summaryEn: 'Full-stack Spring Boot 3.3 project: atomic registration with MySQL optimistic locking + Redis caching, preventing overselling under high concurrency.',
    category: 'fullstack',
    tags: ['Spring Boot', 'Redis', 'MySQL', '乐观锁'],
    date: '2024-12',
    cover: '🎓',
    demoUrl: 'https://yuan-666.github.io/exp8-static/',
    wordCount: 3535,
    readTime: 12,
  },
  {
    id: 'ai-experiments',
    title: 'AI 与智能计算实验合集',
    titleEn: 'AI & Intelligent Computing Experiments',
    summary: 'CNN花卉分类(EfficientNetB1)、LSTM语句相似度、人脸检测(Haar Cascade)、PCA降维可视化。',
    summaryEn: 'CNN flower classification (EfficientNetB1), LSTM sentence similarity (MiniLM), face detection (Haar Cascade), PCA dimensionality reduction.',
    category: 'ai',
    tags: ['CNN', 'LSTM', 'OpenCV', 'PCA'],
    date: '2024-06',
    cover: '🤖',
    wordCount: 4243,
    readTime: 15,
  },
  {
    id: 'cnn-digit',
    title: 'CNN 手写数字识别',
    titleEn: 'CNN Handwritten Digit Recognition',
    summary: '从零实现卷积神经网络进行 MNIST 手写数字识别：卷积→ReLU→池化→全连接→Softmax，完整管道可视化。',
    summaryEn: 'Build a CNN for MNIST digit recognition: Conv→ReLU→Pool→FC→Softmax with full pipeline visualization.',
    category: 'ai',
    tags: ['CNN', 'MNIST', 'PyTorch', '深度学习'],
    date: '2024-06',
    cover: '🧠',
    wordCount: 3180,
    readTime: 11,
  },
  {
    id: 'ant-path',
    title: '蚁群算法：网格寻路',
    titleEn: 'Ant Colony Path Planning',
    summary: '实现经典蚁群优化算法（ACO），通过信息素和启发式函数在网格中寻找最短路径。',
    summaryEn: 'Implement ant colony optimization for path planning problems, using pheromone trails and heuristic search to find optimal routes.',
    category: 'ai',
    tags: ['Python', '蚁群算法', 'ACO', '启发式搜索'],
    date: '2024-05',
    cover: '🧭',
    wordCount: 2490,
    readTime: 9,
  },
  {
    id: 'ant-sim',
    title: '蚁群算法：蚂蚁追踪模拟',
    titleEn: 'Ant Colony Algorithm: Ant Tracking Simulation',
    summary: '用 NumPy 模拟四只蚂蚁在正方形桌面边缘互相追踪的运动轨迹，通过 Matplotlib 可视化螺旋收敛过程。',
    summaryEn: 'Simulate four ants chasing each other along a square table edge using NumPy, with Matplotlib visualizing the spiral convergence process.',
    category: 'ai',
    tags: ['Python', 'NumPy', 'Matplotlib', '蚁群算法'],
    date: '2024-05',
    cover: '🐜',
    wordCount: 2472,
    readTime: 9,
  },
  {
    id: 'jd-scraper',
    title: '京东电商爬虫与数据分析',
    titleEn: 'JD.com Product Scraper',
    summary: '使用 Requests + Parsel 爬取京东笔记本电脑数据，Jieba 分词 + 词云进行商品标题分析。',
    summaryEn: 'Python web scraper for JD.com product data: requests-based crawling with anti-detection headers, CSV data export for analysis.',
    category: 'ai',
    tags: ['Python', '爬虫', 'Jieba', '词云'],
    date: '2024-04',
    cover: '🔍',
    wordCount: 2990,
    readTime: 10,
  },
  {
    id: 'course-mgmt',
    title: '课程信息管理系统',
    titleEn: 'Course Management System',
    summary: 'Python 课设项目：实现课程信息的 CSV 加载、排序显示、按名查询和持久化保存。',
    summaryEn: 'Full-stack project: course CRUD with MySQL backend and RESTful API design, supporting student enrollment and grade management.',
    category: 'python',
    tags: ['Python', 'CSV', '排序'],
    date: '2023-12',
    cover: '📚',
    wordCount: 1297,
    readTime: 5,
  },
  {
    id: 'dictionary',
    title: '电子英汉词典',
    titleEn: 'English-Chinese Dictionary',
    summary: 'Python 课设项目：实现词条录入、查询、修改、删除功能，支持管理员/访客权限分级，使用 CSV 格式持久化存储。',
    summaryEn: 'Python course project: word entry, query, edit, and delete with admin/guest RBAC, CSV persistent storage.',
    category: 'python',
    tags: ['Python', 'CSV', '权限控制'],
    date: '2023-12',
    cover: '📖',
    wordCount: 5882,
    readTime: 20,
  },
]

export const postSummaries: PostSummary[] = rawSummaries
  .map(post => ({ ...post, coverSvg: generateCoverSvg(post) }))
  .sort((a, b) => b.date.localeCompare(a.date))
