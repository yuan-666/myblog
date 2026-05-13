import type { Post } from './index'

const post: Post = {
  id: 'automation-pipeline',
  title: '我的博客流水线自动化：纯静态部署如何串起统计、AI 与边缘能力',
  titleEn: 'My Blog Automation Pipeline: Static Frontend, Edge APIs and AI Tooling',
  summary: '这篇文章拆解智荟元陆的自动化流水线：前端保持 Vue 3/Vite 纯静态，访问统计、文章 PV、AI 代理、IndexNow、地图可视化、GitHub 推送和边缘部署则由 ESA Edge Functions、EdgeKV、Cloudflare Workers 与 AI 工具串联完成。',
  summaryEn: 'A breakdown of YuanHub automation: a static Vue frontend powered by ESA Edge Functions, EdgeKV, Cloudflare Workers, IndexNow and AI-assisted workflows.',
  category: 'devops',
  tags: ['自动化', 'ESA', 'Cloudflare', 'EdgeKV', 'Vue 3', 'CI/CD'],
  date: '2026-05-11',
  cover: '⚙️',
  sections: [
    { type: 'text', content: '很多人看到这个博客，会以为它背后有一套传统服务器：数据库、后端框架、登录系统、运维脚本、定时任务。但实际上，智荟元陆的核心页面仍然是纯静态部署。浏览器拿到的是 Vite 构建后的 HTML、CSS 和 JS，页面本身不依赖一台长期运行的服务器。' },
    { type: 'text', content: '有趣的地方在于：纯静态并不等于功能简单。访问统计、文章阅读量、城市点亮地图、AI 对话代理、IndexNow 提交、GitHub 推送和边缘部署，这些能力都被拆到边缘函数、KV 存储、Worker 和自动化工具里。前端保持轻，动态能力放在边缘。' },
    { type: 'text', content: '这套架构的核心取舍是：能在构建时完成的就静态化，必须动态写入或隐藏密钥的就交给边缘 API，重复性的维护动作交给自动化和 AI 工具。这样个人博客不用维护传统服务器，也能拥有接近产品级的动态体验。' },

    { type: 'heading', id: 'architecture', content: '整体架构：Vue 静态前端 + 边缘能力' },
    { type: 'code', lang: 'mermaid', content: `flowchart TD
  A[Developer and AI tools] --> B[GitHub repository]
  B --> C[Vite build]
  C --> D[Static assets: HTML CSS JS]
  D --> E[Alibaba Cloud ESA Pages or CDN]
  E --> F[Browser: Vue 3 app]
  F --> G[ESA Edge Functions]
  G --> H[EdgeKV: counters pv geo recent]
  F --> I[Cloudflare Worker AI proxy]
  I --> J[Model provider API]
  B --> K[Sitemap and robots files]
  K --> L[IndexNow submit API]
  G --> M[Stats dashboard and map data]`, explanation: 'PostDetail 当前没有专门的图表 section，所以这里用 code 类型展示 Mermaid 流程图内容，既能复制，也不需要改文章渲染器。' },
    { type: 'text', content: '从请求路径看，普通文章阅读只需要静态资源；只有当页面要记录访问、读取 PV、提交统计或调用 AI 时，才会访问边缘 API。这样大多数流量由 CDN 承担，动态接口只处理必要的小数据。' },

    { type: 'heading', id: 'frontend', content: '第一层：Vue 3 负责体验，不承担后端职责' },
    { type: 'text', content: '前端项目使用 Vue 3、TypeScript 和 Vite。文章内容以 TypeScript 数据文件存放，构建时直接打包进静态资源。这样做的优势是内容和代码在同一个仓库里，文章列表、详情页、封面、字数、阅读时间都可以在构建阶段统一生成。' },
    { type: 'list', items: [
      '文章数据：每篇文章是一个独立的 TS 文件，统一导入到 posts/index.ts。',
      '路由：Vue Router 使用 Hash 模式，保证静态部署时刷新不依赖服务器 rewrite。',
      '渲染：PostDetail 按 text、heading、list、code 四类 section 渲染正文。',
      '视觉：CSS Variables 提供主题、玻璃拟态、动画、卡片、排版等全局设计 token。',
      'SEO：index.html、sitemap.xml、robots.txt、JSON-LD 和路由 meta 共同补足搜索引擎信息。',
    ] },
    { type: 'code', lang: 'ts', content: `export interface Section {
  type: 'text' | 'code' | 'heading' | 'list'
  content?: string
  id?: string
  lang?: string
  explanation?: string
  items?: string[]
}

export interface Post {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  date: string
  cover: string
  sections: Section[]
}`, explanation: '文章系统本身就是静态数据结构。新增内容时优先使用现有 section 类型，而不是为了单篇文章扩展渲染器。' },

    { type: 'heading', id: 'edge-functions', content: '第二层：边缘 API 提供动态能力' },
    { type: 'text', content: '纯静态页面不能直接写数据库，所以访问统计、文章 PV 和聚合摘要这些功能被放到了边缘服务。前端只需要 fetch 对应接口，边缘服务负责读写 KV。' },
    { type: 'list', items: [
      '/counter：记录和读取总访问量、今日访问量。',
      '/track：记录访问页面、来源、设备信息、城市和国家/地区信息。',
      '/pv：记录文章阅读量，并按文章 ID 聚合。',
      '/stats：读取国家/地区、城市等聚合数据，用于公开地图和概览。',
      '/analytics/summary：读取来源、设备、页面、24 小时曲线等聚合摘要，不暴露原始访问日志。',
      '内部诊断入口：只在私有服务中维护，不进入公开前端调用链。',
    ] },
    { type: 'code', lang: 'js', content: `export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/pv') {
      const postId = url.searchParams.get('post') || 'home'
      const key = 'pv:' + postId
      const current = Number(await env.BLOG_KV.get(key) || '0')
      const next = current + 1
      await env.BLOG_KV.put(key, String(next))

      return json({ post: postId, total: next })
    }

    return json({ error: 'not_found' }, 404)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': 'https://example.com'
    }
  })
}`, explanation: '这是脱敏后的边缘函数示意。真实项目里会替换为平台提供的 KV 绑定、真实允许来源和更完整的路由判断。' },
    { type: 'text', content: '这些接口不需要传统数据库，原因是博客统计属于轻量数据：计数、列表、聚合都可以放在 KV 里。EdgeKV 的最终一致性意味着刚写入的数据可能有短暂延迟，但对于个人博客统计来说，这个取舍可以接受。' },

    { type: 'heading', id: 'edgekv-model', content: '第三层：EdgeKV 只存轻量、可聚合的数据' },
    { type: 'text', content: 'KV 不适合做复杂关系查询，但非常适合个人博客的计数和最近记录。我的思路是把 key 设计得足够清晰，让边缘函数用简单读写完成统计。' },
    { type: 'list', items: [
      'counter:total 保存全站总访问量。',
      'counter:day:2026-05-11 保存某一天访问量。',
      'pv:ai-tools-beginner 保存单篇文章 PV。',
      'geo:country:CN、geo:city:Shanghai 保存地区聚合。',
      'recent:visits 保存最近访问列表，可以限制长度避免无限增长。',
    ] },
    { type: 'code', lang: 'js', content: `async function appendRecentVisit(env, visit) {
  const key = 'recent:visits'
  const raw = await env.BLOG_KV.get(key)
  const list = raw ? JSON.parse(raw) : []

  list.unshift({
    path: visit.path,
    referrer: visit.referrer || 'direct',
    country: visit.country || 'unknown',
    city: visit.city || 'unknown',
    device: visit.device || 'unknown',
    time: new Date().toISOString()
  })

  await env.BLOG_KV.put(key, JSON.stringify(list.slice(0, 50)))
}`, explanation: '最近访问只保留有限条数，避免 KV 里出现越来越大的单个值。示例字段也故意不包含 IP、账号、手机号等敏感信息。' },

    { type: 'heading', id: 'ai-proxy', content: '第四层：Cloudflare Worker 做 AI 代理，密钥不进前端' },
    { type: 'text', content: '如果前端直接请求大模型 API，就必须把 API Key 暴露给浏览器，这是不可接受的。所以项目里把模型调用放到边缘代理：前端只发消息，Worker 从环境变量或平台密钥配置读取 token，再转发到模型服务。' },
    { type: 'list', items: [
      '密钥只存在 Worker Secret、KV 或平台环境中，不进入前端包。',
      '代理层可以限制来源域名，避免接口被陌生站点滥用。',
      '代理层可以限制模型白名单、max_tokens、超时时间，控制成本和风险。',
      '如果一个平台网络不稳定，可以准备 Cloudflare Worker 作为备用代理。',
    ] },
    { type: 'code', lang: 'js', content: `export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('method not allowed', { status: 405 })
    }

    const origin = request.headers.get('origin') || ''
    if (origin !== 'https://example.com') {
      return new Response('forbidden', { status: 403 })
    }

    const body = await request.json()
    const upstream = await fetch('https://api.model-provider.example/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + env.MODEL_API_KEY
      },
      body: JSON.stringify({
        model: 'safe-model-name',
        messages: body.messages,
        max_tokens: Math.min(body.max_tokens || 800, 1200)
      })
    })

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    })
  }
}`, explanation: '这里把域名、模型接口和密钥都换成了占位值。真实密钥应通过平台 Secret 注入，不能写进仓库。' },

    { type: 'heading', id: 'indexnow', content: '第五层：IndexNow 让新内容更快被发现' },
    { type: 'text', content: '静态站点更新文章后，搜索引擎不一定立刻抓取。IndexNow 的作用是主动告诉搜索引擎：这些 URL 有变化，可以来抓取。它不能保证排名，但能减少等待时间。' },
    { type: 'code', lang: 'js', content: `async function submitIndexNow(urls) {
  const payload = {
    host: 'example.com',
    key: 'REDACTED_INDEXNOW_KEY',
    keyLocation: 'https://example.com/REDACTED_INDEXNOW_KEY.txt',
    urlList: urls
  }

  const resp = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return {
    ok: resp.ok,
    status: resp.status
  }
}`, explanation: '文章里只展示脱敏写法。真实 key、真实域名和 key 文件地址都不应该在公开文章中完整暴露。' },
    { type: 'text', content: 'IndexNow 适合放在发布后的自动化步骤里：构建完成、静态文件部署成功、sitemap 更新后，再提交首页、文章页、分类页等关键 URL。这样不会在构建失败时误报搜索引擎。' },

    { type: 'heading', id: 'automation', content: '第六层：AI 工具串联开发、验证和发布' },
    { type: 'text', content: '真正的流水线不是某一个工具很强，而是多个工具各做自己擅长的部分。GitHub 管版本，Vite 做构建，ESA 负责静态托管和边缘函数，EdgeKV 保存统计数据，Cloudflare Worker 处理 AI 代理，IndexNow 帮新 URL 更快被搜索引擎发现，AI 编程助手则参与代码修改、文章生成、构建验证和提交推送。' },
    { type: 'code', lang: 'bash', content: `# 本地开发
npm run dev

# 构建验证
npm run build

# 检查即将提交的变更
git diff -- src

# 提交并推送
git add src public
git commit -m "feat: update blog content and automation"
git push origin main`, explanation: '流水线的关键不是命令复杂，而是每一步都有清晰职责：开发、验证、审查、提交、部署。' },
    { type: 'text', content: 'AI 工具的价值在这里体现得很明显：它可以阅读项目文档，理解架构约束，修改前端页面，更新边缘函数，同步 sitemap，运行构建，再把结果提交到 GitHub。但每一步都应该可检查、可回滚、可验证，尤其不能让 AI 在不确认的情况下删除文件或泄露密钥。' },

    { type: 'heading', id: 'request-flow', content: '一次访问从浏览器到边缘的完整路径' },
    { type: 'list', items: [
      '用户打开文章页，浏览器从 CDN 获取 Vite 构建后的静态资源。',
      'Vue 应用根据路由找到文章 ID，渲染标题、标签、正文和目录。',
      '页面加载后请求 /pv，边缘服务将文章 ID 对应的 PV 加一。',
      '全站统计脚本请求 /track，边缘函数记录页面、来源、设备、国家/地区、城市等聚合字段。',
      '统计页面请求 /analytics/summary，读取 EdgeKV 中的聚合摘要并展示地图和排行。',
      '如果用户使用 AI 功能，前端请求 Cloudflare Worker，Worker 带着服务端密钥调用模型 API。',
      '发布新文章后，自动化流程更新 sitemap，并通过 IndexNow 提交变化 URL。',
    ] },
    { type: 'text', content: '这条路径的优点是职责边界很清楚：Vue 不知道密钥，静态资源不直接写数据库，边缘函数不负责页面渲染，Worker 只处理需要隐藏 token 的 AI 请求。系统复杂度被拆开，而不是堆在一台服务器里。' },

    { type: 'heading', id: 'static-but-dynamic', content: '为什么纯静态还能有这么多效果' },
    { type: 'text', content: '“静态”只说明页面文件不由服务器实时渲染，并不代表网站不能动态交互。现代前端可以在浏览器里完成搜索、筛选、分页、主题切换、语言切换、动画和可视化；需要持久化的数据，再交给边缘 API。' },
    { type: 'list', items: [
      '搜索和筛选：文章数据已经在前端包里，直接在浏览器内计算。',
      '阅读统计：页面打开时调用 /pv，边缘函数写入 KV。',
      '访问分析：/track 收集来源、页面、设备、城市，再由 /analytics/summary 读取聚合摘要。',
      'AI 对话：前端只负责 UI，模型调用由代理层完成。',
      'SEO 更新：sitemap、robots、IndexNow、JSON-LD 由静态文件和边缘接口配合。',
    ] },

    { type: 'heading', id: 'security', content: '安全边界：文章能写代码，但不能写秘密' },
    { type: 'text', content: '写这类技术文章时，最容易犯的错误是把真实 token、真实接口、真实域名、真实 KV key 全贴出来。代码片段应该展示结构和思路，而不是公开可复用的凭据。' },
    { type: 'list', items: [
      'API Key、Worker Secret、IndexNow key、部署 token 一律用 REDACTED 或示例值替换。',
      '真实域名如不需要说明，应替换为 example.com 或 api.example.com。',
      '请求示例可以保留路径结构，但不要暴露后台管理入口和内部调试路径。',
      '日志示例不要包含 IP、手机号、邮箱、精确地址、用户标识。',
      '文章发布前用搜索检查 REDACTED、token、secret、key 等关键词附近是否有遗漏。',
    ] },

    { type: 'heading', id: 'project-display', content: '这个项目展示了什么' },
    { type: 'text', content: '智荟元陆不是一个只有页面的作品集，而是一个完整的个人技术系统：内容生产、前端体验、边缘后端、访问统计、AI 能力、SEO、部署流水线都在同一个工程体系里互相配合。它适合展示一个开发者如何把学习项目、生产思维和自动化能力合在一起。' },
    { type: 'text', content: '对个人博客来说，这种架构的上限很高：不需要维护传统服务器，也能拥有接近产品级的体验；不需要复杂后台，也能记录真实访问数据；不需要手工重复部署，也能通过 GitHub 和平台流水线持续发布。' },
    { type: 'text', content: '最终目标不是炫技，而是让内容、工具和体验形成一个长期可迭代的系统。静态部署负责稳定，边缘函数负责动态，Cloudflare Worker 负责保护 AI 密钥，IndexNow 负责通知搜索引擎，AI 工具负责提升生产效率。把这些环节串起来，就是这个博客自动化流水线的核心价值。' },
  ],
}

export default post
