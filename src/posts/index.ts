export interface Section {
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
  titleEn?: string
  summary: string
  summaryEn?: string
  category: string
  tags: string[]
  date: string
  cover: string
  demoUrl?: string
  sections: Section[]
  sectionsEn?: Section[]
  pinned?: boolean
  wordCount?: number
  readTime?: number
  coverSvg?: string
}

export function computeWordCount(post: Post): number {
  const sections = post.sectionsEn && post.sectionsEn.length >= post.sections.length
    ? post.sectionsEn
    : post.sections

  let count = 0
  for (const s of sections) {
    if (s.type === 'text' || s.type === 'code' || s.type === 'heading') {
      count += s.content?.length ?? 0
    } else if (s.type === 'list' && s.items) {
      for (const item of s.items) {
        count += item.length
      }
    }
  }
  return count
}

export function computeReadTime(wordCount: number): number {
  const minutes = Math.ceil(wordCount / 300)
  return Math.max(1, minutes)
}

export function generateCoverSvg(post: Post): string {
  const title = post.title || 'Untitled'
  const patternType = hashPostId(post.id) % 4

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

  const lines = wrapText(title, 13)
  const totalLines = lines.length
  const textFontSize = 14 - Math.max(0, totalLines - 1)
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

import dictionary from './dictionary'
import courseMgmt from './course-mgmt'
import campusActivity from './campus-activity'
import ticketSystem from './ticket-system'
import antSim from './ant-sim'
import antPath from './ant-path'
import jdScraper from './jd-scraper'
import cloudDeploy from './cloud-deploy'
import cnnDigit from './cnn-digit'
import mywebPortfolio from './myweb-portfolio'
import aiExperiments from './ai-experiments'
import llmExplained from './llm-explained'
import aiToolsBeginner from './ai-tools-beginner'
import automationPipeline from './automation-pipeline'

const rawPosts: Post[] = [
  aiToolsBeginner,
  automationPipeline,
  dictionary,
  courseMgmt,
  campusActivity,
  ticketSystem,
  antSim,
  antPath,
  jdScraper,
  cloudDeploy,
  cnnDigit,
  mywebPortfolio,
  aiExperiments,
  llmExplained,
]

export const posts: Post[] = rawPosts
  .map((post) => {
    const wordCount = computeWordCount(post)
    return {
      ...post,
      wordCount,
      readTime: computeReadTime(wordCount),
      coverSvg: generateCoverSvg(post),
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date)) // 按日期降序（最新在前）
