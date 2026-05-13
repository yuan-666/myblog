import type { Post } from './index'

const post: Post = {
  id: 'myweb-portfolio',
  title: '个人作品集网站',
  titleEn: 'Personal Portfolio Website',
  summary: 'Vue 3 + GSAP + TypeScript 构建的高端个人作品集网站，支持3D卡片倾斜、视差滚动、粒子背景、i18n国际化。',
  summaryEn: 'Premium portfolio built with Vue 3 + GSAP + TypeScript: 3D tilt cards, parallax scrolling, particle background, i18n.',
  category: 'fullstack',
  tags: ['Vue 3', 'GSAP', 'TypeScript', 'i18n'],
  date: '2025-03',
  cover: '🎨',
  sections: [
    { type: 'heading', content: '项目概述', id: 'overview' },
    { type: 'text', content: '个人作品集网站是展示技术项目和职业经历的在线名片。本项目采用 Vue 3 + TypeScript + Vite 构建，融入 GSAP 动画引擎实现高级视觉效果，支持中英文双语切换和浅色/深色主题。' },
    { type: 'heading', content: '技术亮点', id: 'highlights' },
    { type: 'list', items: [
      'GSAP ScrollTrigger：滚动驱动的元素入场动画',
      '3D 卡片倾斜效果：CSS transform + JS 鼠标跟踪实现 perspective 旋转',
      'Frosted Glass 导航栏：backdrop-filter + 半透明背景',
      'Vue i18n：完整中英文双语支持，12 个项目数据双语展示',
      'Floating Orbs：CSS 极光渐变 + 缓动动画背景',
      '响应式布局：移动端自适应汉堡菜单 + 单栏布局',
    ] },
    { type: 'heading', content: '3D 卡片倾斜实现', id: '3d-card' },
    { type: 'code', lang: 'typescript', content: `function onMouseMove(e: MouseEvent, card: HTMLElement) {
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  
  // perspective 3D rotation + shine sweep
  card.style.transform = \`
    perspective(1200px)
    rotateY(\${x * 12}deg)
    rotateX(\${-y * 12}deg)
    translateZ(10px)
  \`
  
  // Light reflection follows cursor
  const shine = card.querySelector('.card-shine') as HTMLElement
  if (shine) {
    shine.style.background = \`radial-gradient(
      circle at \${(x + 0.5) * 100}% \${(y + 0.5) * 100}%,
      rgba(255,255,255,0.15), transparent 60%
    )\`
  }
}`, explanation: '使用 CSS perspective + rotate3d 实现 3D 卡片倾斜，光斑跟随鼠标位置。12° 旋转角 + 10px Z 轴偏移，配合 transition 实现平滑还原。' },
    { type: 'heading', content: 'GSAP 滚动动画', id: 'gsap' },
    { type: 'code', lang: 'typescript', content: `import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 滚动入场动画
gsap.from('.project-card', {
  scrollTrigger: {
    trigger: '.projects-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  },
  y: 60,
  opacity: 0,
  duration: 0.6,
  stagger: 0.1,
  ease: 'power3.out',
})`, explanation: 'ScrollTrigger 监听元素进入视口 80% 位置时触发。stagger 0.1s 实现逐卡延迟入场，power3.out 缓出函数模拟物理减速。toggleActions 中 reverse 让元素滚回时反向隐藏。' },
    { type: 'heading', content: 'i18n 国际化架构', id: 'i18n' },
    { type: 'text', content: '作品集包含 12 个项目数据（实习经历、科研成果、课程项目、AI 算法、个人项目），每个项目的中英文描述独立存储在 i18n TS 文件中。使用 Vue I18n 的 Composition API 实现语言切换时的数据响应式更新。' },
    { type: 'heading', content: '部署架构', id: 'deploy' },
    { type: 'text', content: '网站部署在阿里云 ESA Pages 平台，主域名 yuan6.cn。前端纯静态构建（Vite SSG），ESA 全球 CDN 加速。GitHub Actions 监听 main 分支自动部署。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Project Overview', id: 'overview' },
    { type: 'text', content: 'A personal portfolio website is an online business card showcasing technical projects and career experience. Built with Vue 3 + TypeScript + Vite, incorporating the GSAP animation engine for advanced visual effects, with Chinese/English bilingual support and light/dark theme switching.' },
    { type: 'heading', content: 'Technical Highlights', id: 'highlights' },
    { type: 'list', items: [
      'GSAP ScrollTrigger: scroll-driven element entrance animations',
      '3D card tilt effect: CSS transform + JS mouse tracking for perspective rotation',
      'Frosted Glass navbar: backdrop-filter + semi-transparent background',
      'Vue i18n: complete Chinese/English bilingual support, 12 project data bilingual display',
      'Floating Orbs: CSS aurora gradients + easing animation background',
      'Responsive layout: mobile adaptive hamburger menu + single-column layout',
    ] },
    { type: 'heading', content: '3D Card Tilt Implementation', id: '3d-card' },
    { type: 'code', lang: 'typescript', content: `function onMouseMove(e: MouseEvent, card: HTMLElement) {
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5

  // perspective 3D rotation + shine sweep
  card.style.transform = \`
    perspective(1200px)
    rotateY(\${x * 12}deg)
    rotateX(\${-y * 12}deg)
    translateZ(10px)
  \`

  // Light reflection follows cursor
  const shine = card.querySelector('.card-shine') as HTMLElement
  if (shine) {
    shine.style.background = \`radial-gradient(
      circle at \${(x + 0.5) * 100}% \${(y + 0.5) * 100}%,
      rgba(255,255,255,0.15), transparent 60%
    )\`
  }
}`, explanation: 'Uses CSS perspective + rotate3d for 3D card tilt, with light spot following mouse position. 12° rotation angle + 10px Z-axis offset, paired with transition for smooth recovery.' },
    { type: 'heading', content: 'GSAP Scroll Animations', id: 'gsap' },
    { type: 'code', lang: 'typescript', content: `import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Scroll entrance animation
gsap.from('.project-card', {
  scrollTrigger: {
    trigger: '.projects-grid',
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  },
  y: 60,
  opacity: 0,
  duration: 0.6,
  stagger: 0.1,
  ease: 'power3.out',
})`, explanation: 'ScrollTrigger fires when the element enters 80% of the viewport. stagger 0.1s creates staggered card entrance delays; power3.out easing simulates physical deceleration. toggleActions with reverse hides elements when scrolling back.' },
    { type: 'heading', content: 'i18n Internationalization Architecture', id: 'i18n' },
    { type: 'text', content: 'The portfolio contains 12 project entries (internship experience, research achievements, course projects, AI algorithms, personal projects). Each project\'s Chinese and English descriptions are stored independently in i18n TS files. Vue I18n Composition API enables reactive data updates when switching languages.' },
    { type: 'heading', content: 'Deployment Architecture', id: 'deploy' },
    { type: 'text', content: 'Deployed on Alibaba Cloud ESA Pages, primary domain yuan6.cn. Frontend is pure static build (Vite SSG) with ESA global CDN acceleration. GitHub Actions auto-deploys on main branch pushes.' },
  ],
}

export default post
