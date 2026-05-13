import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'

const PostDetail = () => import('./views/PostDetail.vue')
const About = () => import('./views/About.vue')
const AboutSite = () => import('./views/AboutSite.vue')
const Privacy = () => import('./views/Privacy.vue')
const Changelog = () => import('./views/Changelog.vue')
const TechDocs = () => import('./views/TechDocs.vue')
const GithubPage = () => import('./views/GithubPage.vue')
const Analytics = () => import('./views/Analytics.vue')

const SITE_NAME = '智荟元陆'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: Home,
      meta: {
        title: `智荟元陆 · 编程经验分享博客 — Python、Vue 3、AI、全栈开发技术文章`,
        description: `智荟元陆 (yuan6.cn) 是一个专注于 Python、Vue 3、TypeScript、FastAPI、PyTorch、Docker 等技术栈的编程经验分享博客，提供从课程设计到生产项目的完整开发过程与逐行代码解释。`,
      },
    },
    {
      path: '/post/:id',
      component: PostDetail,
      meta: { isPost: true },
    },
    {
      path: '/about',
      component: About,
      meta: {
        title: `关于智荟元陆 — 个人编程博客介绍、技术栈与联系方式 | ${SITE_NAME}`,
        description: `了解智荟元陆 (yuan6.cn)：一个 CS 本科生的编程经验分享站，涵盖 Vue 3、Spring Boot、FastAPI、PyTorch、Docker 等全栈技术，记录从课程设计到生产项目的完整开发旅程。`,
      },
      children: [
        { path: '', redirect: '/about/site' },
        {
          path: 'site',
          component: AboutSite,
          meta: {
            title: `关于网站 — 智荟元陆的定位、技术理念与建站初衷 | ${SITE_NAME}`,
            description: `智荟元陆 (yuan6.cn) 的建站初衷：记录编程学习过程中的每一个项目，提供真实可运行的代码与逐行解释，帮助同样在学习编程的开发者快速上手 Python、Vue 3、全栈开发等技术。`,
          },
        },
        {
          path: 'privacy',
          component: Privacy,
          meta: {
            title: `隐私政策与免责声明 — 数据处理方式、Cookie 使用与内容版权说明 | ${SITE_NAME}`,
            description: `智荟元陆的隐私政策与免责声明：本站使用本地存储保存用户偏好，不追踪、不收集个人信息。所有代码内容仅供学习参考，使用时请自行承担风险。`,
          },
        },
        {
          path: 'changelog',
          component: Changelog,
          meta: {
            title: `版本迭代记录 — 从 v1.0.0 到最新版本的功能演进与架构升级 | ${SITE_NAME}`,
            description: `智荟元陆的完整版本迭代记录：从 v1.0.0 到最新版本的每一次功能更新、Bug 修复和架构优化，包括 Vue 3 前端、ESA Edge Functions、Cloudflare Workers 等技术演进。`,
          },
        },
        {
          path: 'tech',
          component: TechDocs,
          meta: {
            title: `技术文档 — Vue 3 前端架构、ESA Edge Functions、Cloudflare Workers 与 AI 能力 | ${SITE_NAME}`,
            description: `智荟元陆的完整技术文档：Vue 3 + TypeScript + Vite 前端架构、Alibaba Cloud ESA Edge Functions 后端、Cloudflare Workers GLM API 代理、智谱 GLM AI 对话能力。`,
          },
        },
      ],
    },
    {
      path: '/github',
      component: GithubPage,
      meta: {
        title: `GitHub 开源项目与贡献统计 — 公开仓库、Stars、贡献热力图 | ${SITE_NAME}`,
        description: `智荟元陆作者的 GitHub 开源项目与贡献统计：查看公开仓库列表、Stars 数量、贡献热力图，以及 Python、Vue 3、AI 等方向的开源代码。`,
      },
    },
    {
      path: '/analytics',
      component: Analytics,
      meta: {
        title: `网站访问统计 — 流量概览、访客分布、文章热度排行与实时数据 | ${SITE_NAME}`,
        description: `智荟元陆的实时访问统计仪表盘：总浏览量、今日访问、24 小时流量趋势、访客国家/地区分布、文章热度排行、设备与来源分析。`,
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() { return { top: 0 } },
})

router.afterEach((to) => {
  const isPost = to.meta.isPost as boolean
  let title = to.meta.title as string | undefined
  let description = to.meta.description as string | undefined

  // Dynamic article title
  if (isPost) {
    const postId = to.params.id as string
    const postTitles: Record<string, { zh: string; en: string }> = {
      'dictionary': { zh: 'Python 电子英汉词典 — 课程设计完整实现', en: 'Python Electronic Dictionary — Course Design Implementation' },
      'course-mgmt': { zh: 'Python 课程信息管理系统 — 数据库操作实战', en: 'Python Course Management System — Database Operations' },
      'campus-activity': { zh: '校园活动管理系统 — Spring Boot + Vue 3 全栈项目', en: 'Campus Activity Management — Spring Boot + Vue 3 Full Stack' },
      'ticket-system': { zh: '车票管理系统 — Java Web 全栈开发实战', en: 'Ticket System — Java Web Full Stack Development' },
      'ant-sim': { zh: '蚂蚁追踪模拟 — Python 多智能体算法与 Canvas 可视化', en: 'Ant Colony Simulation — Python Multi-Agent Algorithm & Canvas' },
      'ant-path': { zh: '蚁群网格寻路 — ACO 算法实现与交互式演示', en: 'Ant Colony Pathfinding — ACO Algorithm & Interactive Demo' },
      'jd-scraper': { zh: '京东商品爬虫与数据分析 — Python 爬虫实战项目', en: 'JD Product Scraper & Data Analysis — Python Scraping Project' },
      'cloud-deploy': { zh: '混合云部署实战 — Docker + Nginx + CDN + 多云架构', en: 'Hybrid Cloud Deployment — Docker + Nginx + CDN + Multi-Cloud' },
      'cnn-digit': { zh: 'CNN 手写数字识别 — PyTorch 深度学习与模型可视化', en: 'CNN Handwritten Digit Recognition — PyTorch Deep Learning' },
      'myweb-portfolio': { zh: '个人主页作品集 — Vue 3 + GSAP + 3D 卡片效果', en: 'Personal Portfolio — Vue 3 + GSAP + 3D Card Effects' },
      'ai-experiments': { zh: 'AI 实验合集 — 机器学习与深度学习交互式演示', en: 'AI Experiments Collection — ML & DL Interactive Demos' },
      'llm-explained': { zh: '大语言模型原理 — Transformer、注意力机制与 GPT 架构详解', en: 'LLM Explained — Transformer, Attention & GPT Architecture' },
      'ai-tools-beginner': { zh: '从网页聊天到自动化 — 电脑小白的 AI 工具入门路线', en: 'From Chatbots to Automation — AI Tools for Beginners' },
      'automation-pipeline': { zh: '博客流水线自动化 — 纯静态部署串起统计、AI 与边缘能力', en: 'Blog Automation Pipeline — Static Frontend and Edge APIs' },
    }
    const pt = postTitles[postId]
    if (pt) {
      title = `${pt.zh} — 编程教程与源码解析 | ${SITE_NAME}`
      description = `${pt.zh}：包含完整源码、逐行解释和在线交互 Demo。涵盖项目架构设计、核心代码实现和部署流程，适合编程学习者参考。`
    } else {
      title = `${postId} — 编程文章与源码 | ${SITE_NAME}`
      description = `阅读 ${postId} 的完整编程教程：包含源码、解释和在线演示。`
    }
  }

  if (title) {
    document.title = title
    // Update meta description
    const descEl = document.querySelector('meta[name="description"]')
    if (descEl && description) descEl.setAttribute('content', description)
    // Update OG
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc && description) ogDesc.setAttribute('content', description)
    // Update Twitter
    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.setAttribute('content', title)
    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc && description) twDesc.setAttribute('content', description)
  }
})

export default router
