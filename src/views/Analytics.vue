<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { LocaleKey } from '../i18n'
import { formatCityName, formatCountryName, formatVisitLocation, normalizeGeoParts } from '../utils/geoLabels'

const locale = inject(LocaleKey)!

const API_BASE = 'https://myblog-api.yuan6.cn'

interface CityStat { name: string; count: number; lat: number; lon: number }
interface CountryStat { name: string; count: number; code?: string }
interface VisitRecord {
  time: string; referrer: string; page: string;
  ip?: string; ip_prefix: string; ua: string; device?: string; browser?: string; os?: string;
  country: string; countryCode: string; city: string; region: string;
  lat: number; lon: number;
}
interface PostPvStat { postId: string; title: string; total: number; today: number }
interface CounterResponse { total?: number; today?: number }
interface PageCounterResponse { page?: string; total?: number; today?: number }
interface AnalyticsSummaryResponse {
  scope?: string;
  countryCount?: number;
  cityCount?: number;
  countries?: CountryStat[];
  cities?: CityStat[];
  chartBars?: { label: string; value: number; height: number; bucket: string }[];
  pages?: { name: string; count: number }[];
  referrers?: { name: string; count: number }[];
  devices?: { name: string; count: number }[];
  recent?: VisitRecord[];
}

const loading = ref(true)
const hasLoaded = ref(false)
const error = ref('')
type AnalyticsScope = 'all' | 'portfolio'
const activeScope = ref<AnalyticsScope>('all')
const scopes: { key: AnalyticsScope; zh: string; en: string }[] = [
  { key: 'all', zh: '全站', en: 'All' },
  { key: 'portfolio', zh: '作品集', en: 'Portfolio' },
]
const scopePage = computed(() => activeScope.value === 'portfolio' ? '/portfolio' : '')
const scopeHint = computed(() => {
  if (activeScope.value === 'portfolio') {
    return locale.value === 'zh'
      ? '只看作品集单页的访问来源、设备和城市分布。'
      : 'Viewing referrers, devices and locations for the portfolio page only.'
  }
  return locale.value === 'zh'
    ? '查看博客全站的访问趋势、来源和城市分布。'
    : 'Viewing site-wide traffic trends, referrers and locations.'
})

// Stats
const totalVisits = ref(0)
const todayVisits = ref(0)
const countryCount = ref(0)
const cityCount = ref(0)
const countries = ref<CountryStat[]>([])
const cities = ref<CityStat[]>([])
const recent = ref<VisitRecord[]>([])
const referrers = ref<{ name: string; count: number }[]>([])
const pageStats = ref<{ name: string; count: number }[]>([])
const deviceStats = ref<{ name: string; count: number }[]>([])
const postPvList = ref<PostPvStat[]>([])

// Tabs
type TabKey = 'pages' | 'referrers' | 'countries' | 'devices' | 'recent'
const activeTab = ref<TabKey>('pages')
const tabs: { key: TabKey; zh: string; en: string }[] = [
  { key: 'pages', zh: '页面', en: 'Pages' },
  { key: 'referrers', zh: '来源', en: 'Referrers' },
  { key: 'countries', zh: '国家/地区', en: 'Countries/Regions' },
  { key: 'devices', zh: '设备', en: 'Devices' },
  { key: 'recent', zh: '最近', en: 'Recent' },
]

// Time range (reserved for future implementation)
// type TimeRange = '24h' | '7d' | '30d' | 'all'

// Chart
const chartBars = ref<{ label: string; value: number; height: number; bucket: string }[]>([])
const chartMaxValue = computed(() => Math.max(...chartBars.value.map(b => b.value), 1))
const chartTotal = computed(() => chartBars.value.reduce((sum, b) => sum + b.value, 0))
const topCities = computed(() => cities.value.filter(c => c.lat && c.lon).slice(0, 5))

// Map refs
let mapInstance: any = null
let markersLayer: any = null
let leafletLoaded = false
let mapObserver: IntersectionObserver | null = null

/* ==========================================
   Data Fetching
   ========================================== */
async function fetchAll() {
  loading.value = !hasLoaded.value
  error.value = ''
  try {
    const page = scopePage.value
    const summaryUrl = page
      ? `${API_BASE}/analytics/summary?page=${encodeURIComponent(page)}`
      : `${API_BASE}/analytics/summary`
    const counterUrl = page
      ? `${API_BASE}/page-counter?path=${encodeURIComponent(page)}`
      : `${API_BASE}/counter?skip=1`
    const [counterResp, summaryResp, pvResp] = await Promise.all([
      fetch(counterUrl),
      fetch(summaryUrl),
      fetch(`${API_BASE}/posts/stats`),
    ])

    if (counterResp.ok) {
      const d = await counterResp.json() as CounterResponse | PageCounterResponse
      totalVisits.value = d.total || 0
      todayVisits.value = d.today || 0
    }
    if (summaryResp.ok) {
      const raw = await summaryResp.json() as AnalyticsSummaryResponse
      const d = shouldUseScopedSummary(raw, page) ? raw : buildClientScopedSummary(raw, page)
      const normalizedCountries = normalizeCountryStats(d.countries || [])
      countryCount.value = normalizedCountries.length
      cityCount.value = d.cityCount || 0
      countries.value = normalizedCountries
      cities.value = d.cities || []
      chartBars.value = (d.chartBars || []).map((bar: { label: string; value: number; height: number; bucket: string }) => ({
        ...bar,
        label: formatBucketLabel(bar.bucket),
      }))
      pageStats.value = d.pages || []
      referrers.value = d.referrers || []
      deviceStats.value = d.devices || []
      recent.value = d.recent || []
      if (mapInstance) updateMarkers()
    }
    if (pvResp.ok) {
      const d = await pvResp.json()
      postPvList.value = (d.posts || []).filter((p: PostPvStat) => p.total > 0)
    }
    hasLoaded.value = true
  } catch (e: any) {
    error.value = e.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

function formatBucketLabel(bucket: string): string {
  const hour = Number(bucket.split('-').at(-1) || 0)
  return locale.value === 'zh' ? `${hour}时` : `${hour}h`
}

function normalizePagePath(page = '/') {
  let value = String(page || '/')
  if (value === 'all') return 'all'
  if (value.startsWith('#/')) value = value.slice(1)
  if (!value.startsWith('/')) value = `/${value}`
  return value
}

function shouldUseScopedSummary(summary: AnalyticsSummaryResponse, page: string) {
  if (!page) return true
  return normalizePagePath(summary.scope || '') === normalizePagePath(page)
}

function buildClientScopedSummary(summary: AnalyticsSummaryResponse, page: string): AnalyticsSummaryResponse {
  const normalized = normalizePagePath(page)
  const visits = (summary.recent || []).filter(visit => normalizePagePath(visit.page || '/') === normalized)
  const countriesMap = new Map<string, CountryStat>()
  const citiesMap = new Map<string, CityStat>()

  for (const visit of visits) {
    const geo = normalizeGeoParts(visit)
    if (geo.country && geo.country !== 'Unknown') {
      const current = countriesMap.get(geo.country) || { name: geo.country, count: 0, code: geo.countryCode }
      current.count += 1
      if (!current.code && geo.countryCode) current.code = geo.countryCode
      countriesMap.set(geo.country, current)
    }
    if (geo.city && geo.city !== 'Unknown') {
      const name = [geo.city, geo.region, geo.country].filter(Boolean).join(', ')
      const current = citiesMap.get(name) || {
        name,
        count: 0,
        lat: Number(visit.lat || 0),
        lon: Number(visit.lon || 0),
      }
      current.count += 1
      citiesMap.set(name, current)
    }
  }

  const countriesList = Array.from(countriesMap.values()).sort((a, b) => b.count - a.count)
  const citiesList = Array.from(citiesMap.values()).sort((a, b) => b.count - a.count)
  return {
    ...summary,
    scope: normalized,
    countryCount: countriesList.length,
    cityCount: citiesList.length,
    countries: countriesList,
    cities: citiesList,
    chartBars: buildLocalHourlyBars(visits),
    pages: topLocalBreakdown(visits, visit => normalizePagePath(visit.page || '/')),
    referrers: topLocalBreakdown(visits, visit => normalizeReferrerLabel(visit.referrer)),
    devices: topLocalBreakdown(visits, visit => visit.device || 'Other'),
    recent: visits,
  }
}

function normalizeCountryStats(items: CountryStat[]): CountryStat[] {
  const merged = new Map<string, CountryStat>()
  for (const item of items) {
    const geo = normalizeGeoParts({ country: item.name, countryCode: item.code })
    if (!geo.country || geo.country === 'Unknown') continue
    const current = merged.get(geo.country) || { name: geo.country, count: 0, code: geo.countryCode }
    current.count += item.count || 0
    if (!current.code && geo.countryCode) current.code = geo.countryCode
    merged.set(geo.country, current)
  }
  return Array.from(merged.values()).sort((a, b) => b.count - a.count)
}

function localHourBucket(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  return `${y}-${m}-${day}-${h}`
}

function buildLocalHourlyBars(visits: VisitRecord[]) {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  const bars = []
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 3600000)
    bars.push({ label: `${hour.getHours()}h`, value: 0, height: 0, bucket: localHourBucket(hour) })
  }
  const indexByBucket = new Map(bars.map((bar, index) => [bar.bucket, index]))
  for (const visit of visits) {
    const time = new Date(visit.time)
    if (Number.isNaN(time.getTime())) continue
    time.setMinutes(0, 0, 0)
    const index = indexByBucket.get(localHourBucket(time))
    if (index != null) bars[index].value += 1
  }
  const max = Math.max(...bars.map(bar => bar.value), 1)
  return bars.map(bar => ({ ...bar, height: (bar.value / max) * 100 }))
}

function topLocalBreakdown(visits: VisitRecord[], keyFn: (visit: VisitRecord) => string, limit = 12) {
  const map = new Map<string, number>()
  for (const visit of visits) {
    const key = keyFn(visit) || 'Unknown'
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function normalizeReferrerLabel(referrer: string) {
  return referrer || 'direct'
}

/* ==========================================
   Leaflet Map
   ========================================== */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Failed: ${src}`))
    document.head.appendChild(el)
  })
}
function loadCSS(href: string): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement('link')
    el.rel = 'stylesheet'; el.href = href
    el.onload = () => resolve()
    el.onerror = () => resolve()
    document.head.appendChild(el)
  })
}
async function ensureLeaflet(): Promise<any> {
  if (leafletLoaded) return (window as any).L
  await loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')
  await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
  leafletLoaded = true
  return (window as any).L
}

async function initMap() {
  await nextTick()
  const container = document.getElementById('analytics-map')
  if (!container) return
  try {
    const L = await ensureLeaflet()
    if (mapInstance) { mapInstance.invalidateSize(); return }
    mapInstance = L.map('analytics-map', {
      center: [35.8617, 104.1954],
      zoom: 4,
      minZoom: 3,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
      renderer: L.canvas({ padding: 0.5 }),
    })
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 10,
      attribution: '© 高德地图',
    }).addTo(mapInstance)
    markersLayer = L.layerGroup().addTo(mapInstance)
    updateMarkers()
  } catch { /* */ }
}

function observeMap() {
  const container = document.getElementById('analytics-map')
  if (!container) return
  if (!('IntersectionObserver' in window)) {
    initMap()
    return
  }
  mapObserver?.disconnect()
  mapObserver = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return
    mapObserver?.disconnect()
    mapObserver = null
    initMap()
  }, { rootMargin: '220px 0px' })
  mapObserver.observe(container)
}

function updateMarkers() {
  if (!mapInstance || !markersLayer || !leafletLoaded) return
  const L = (window as any).L
  markersLayer.clearLayers()
  const valid = cities.value.filter(c => c.lat && c.lon)
  if (!valid.length) return
  const maxCount = Math.max(...valid.map(c => c.count), 1)
  for (const c of valid) {
    const ratio = Math.log(c.count + 1) / Math.log(maxCount + 1)
    const marker = L.circleMarker([c.lat, c.lon], {
      radius: 2.6 + ratio * 4.8,
      fillColor: cityLightColor(ratio),
      color: '#e0f2fe',
      weight: ratio > 0.65 ? 1 : 0,
      opacity: 0.38,
      fillOpacity: 0.34 + ratio * 0.48,
    })
    const label = formatCityName(c.name, locale.value)
    marker.bindTooltip(`<b>${label}</b><br/>${c.count} ${locale.value === 'zh' ? '次访问' : 'visits'}`, { direction: 'top' })
    markersLayer.addLayer(marker)
  }
}

function cityLightColor(ratio: number): string {
  if (ratio > 0.72) return '#0f766e'
  if (ratio > 0.42) return '#14b8a6'
  return '#67e8f9'
}

/* ==========================================
   Formatting & Parsing
   ========================================== */
function fmtNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString()
}
function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const timeStr = `${hh}:${min}`

    if (diffMin < 1) return locale.value === 'zh' ? '刚刚' : 'Just now'
    if (diffMin < 60) return locale.value === 'zh' ? `${diffMin}分钟前` : `${diffMin}m ago`

    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return (locale.value === 'zh' ? '今天 ' : 'Today ') + timeStr

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return (locale.value === 'zh' ? '昨天 ' : 'Yesterday ') + timeStr

    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    if (d.getFullYear() === now.getFullYear()) {
      return locale.value === 'zh' ? `${m}月${dd}日 ${timeStr}` : `${m}/${dd} ${timeStr}`
    }
    const y = String(d.getFullYear()).slice(2)
    return locale.value === 'zh' ? `${y}年${m}月${dd}日` : `${y}/${m}/${dd}`
  } catch { return iso }
}
function fmtRef(ref: string): string {
  if (ref === 'direct') return locale.value === 'zh' ? '直接' : 'Direct'
  try { return new URL(ref).hostname } catch { return ref }
}
function fmtLoc(v: VisitRecord): string {
  return formatVisitLocation(v, locale.value)
}

/* ==========================================
   Lifecycle
   ========================================== */
function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(async () => {
  await fetchAll()
  if (!loading.value) {
    await nextTick()
    observeMap()
  }
})
watch(activeScope, async () => {
  await fetchAll()
  await nextTick()
  if (mapInstance) mapInstance.invalidateSize()
  else observeMap()
})
watch(locale, () => {
  chartBars.value = chartBars.value.map(bar => ({
    ...bar,
    label: formatBucketLabel(bar.bucket),
  }))
  if (mapInstance) updateMarkers()
})
onUnmounted(() => {
  mapObserver?.disconnect()
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
})
</script>

<template>
  <div class="analytics">
    <!-- ===== Header ===== -->
    <section class="analytics-header">
      <h1 class="header-title">{{ locale === 'zh' ? '访问统计' : 'Analytics' }}</h1>
      <p class="header-sub">{{ locale === 'zh' ? '访问、来源、设备与城市分布' : 'Traffic, referrers, devices and locations' }}</p>
    </section>

    <!-- Loading / Error -->
    <div v-if="loading && !hasLoaded" class="state-msg">
      <div class="spinner"></div>
      <span>{{ locale === 'zh' ? '加载中...' : 'Loading...' }}</span>
    </div>
    <div v-else-if="error && !hasLoaded" class="state-msg error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchAll().then(() => initMap())">{{ locale === 'zh' ? '重试' : 'Retry' }}</button>
    </div>

    <template v-else>
      <section class="analytics-toolbar" aria-label="Analytics scope">
        <div class="scope-copy">
          <span>{{ locale === 'zh' ? '统计口径' : 'Scope' }}</span>
          <p>{{ scopeHint }}</p>
        </div>
        <div class="scope-switch" role="tablist">
          <button
            v-for="scope in scopes"
            :key="scope.key"
            class="scope-btn"
            :class="{ active: activeScope === scope.key }"
            :aria-selected="activeScope === scope.key"
            role="tab"
            @click="activeScope = scope.key"
          >{{ locale === 'zh' ? scope.zh : scope.en }}</button>
        </div>
      </section>

      <!-- ===== KPI Cards ===== -->
      <div class="kpi-row">
        <div class="kpi-card">
          <span class="kpi-value">{{ fmtNum(totalVisits) }}</span>
          <span class="kpi-label">{{ activeScope === 'portfolio' ? (locale === 'zh' ? '作品集浏览' : 'Portfolio Views') : (locale === 'zh' ? '总浏览量' : 'Page Views') }}</span>
        </div>
        <div class="kpi-card accent">
          <span class="kpi-value">{{ fmtNum(todayVisits) }}</span>
          <span class="kpi-label">{{ locale === 'zh' ? '今日浏览' : 'Today' }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-value">{{ countryCount }}</span>
          <span class="kpi-label">{{ locale === 'zh' ? '国家/地区' : 'Countries/Regions' }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-value">{{ cityCount }}</span>
          <span class="kpi-label">{{ locale === 'zh' ? '城市' : 'Cities' }}</span>
        </div>
      </div>

      <!-- ===== Chart + Map ===== -->
      <div class="viz-row">
        <!-- Bar Chart -->
        <div class="viz-card chart-card">
          <div class="viz-title-row">
            <h3 class="viz-title">{{ activeScope === 'portfolio' ? (locale === 'zh' ? '作品集 24 小时' : 'Portfolio 24 Hours') : (locale === 'zh' ? '过去24小时' : 'Last 24 Hours') }}</h3>
            <span class="viz-sub">{{ chartTotal }} / max {{ chartMaxValue }}</span>
          </div>
          <div class="traffic-chart" v-if="chartBars.length">
            <div class="chart-scale">
              <span>{{ chartMaxValue }}</span>
              <span>0</span>
            </div>
            <div class="bar-plot">
              <div v-for="bar in chartBars" :key="bar.bucket" class="bar-col" :title="`${bar.label}: ${bar.value}`">
                <div class="bar-fill" :style="{ height: `${bar.height}%` }">
                  <span class="bar-tip" v-if="bar.value > 0 && bar.height > 22">{{ bar.value }}</span>
                </div>
              </div>
            </div>
            <div class="bar-axis">
              <span v-for="(bar, i) in chartBars" :key="`${bar.bucket}-label`" class="bar-label">{{ i % 4 === 0 ? bar.label : '' }}</span>
            </div>
          </div>
          <div v-else class="empty-sm">{{ locale === 'zh' ? '暂无数据' : 'No data' }}</div>
        </div>

        <!-- Map -->
        <div class="viz-card map-card">
          <div class="viz-title-row">
            <h3 class="viz-title">{{ locale === 'zh' ? '城市分布' : 'City Distribution' }}</h3>
            <span class="viz-sub">{{ locale === 'zh' ? `${cityCount} 个城市` : `${cityCount} cities` }}</span>
          </div>
          <div id="analytics-map" class="map-container"></div>
          <div class="city-strip" v-if="topCities.length">
            <span v-for="city in topCities" :key="city.name">{{ formatCityName(city.name, locale) }} · {{ city.count }}</span>
          </div>
        </div>
      </div>

      <!-- ===== Tabbed Breakdown ===== -->
      <div class="breakdown-section">
        <!-- Tabs -->
        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
            :aria-pressed="activeTab === tab.key"
            @click="activeTab = tab.key"
          >{{ locale === 'zh' ? tab.zh : tab.en }}</button>
        </div>

        <!-- Table -->
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-name">{{ activeTab === 'countries' ? (locale === 'zh' ? '国家/地区' : 'Country/Region') : activeTab === 'devices' ? (locale === 'zh' ? '设备' : 'Device') : activeTab === 'recent' ? (locale === 'zh' ? '时间' : 'Time') : activeTab === 'referrers' ? (locale === 'zh' ? '来源' : 'Referrer') : (locale === 'zh' ? '页面' : 'Page') }}</th>
                <th v-if="activeTab === 'recent'" class="col-detail">{{ locale === 'zh' ? '来源' : 'Referrer' }}</th>
                <th v-if="activeTab === 'recent'" class="col-detail">{{ locale === 'zh' ? '位置' : 'Location' }}</th>
                <th class="col-count">{{ activeTab === 'recent' ? (locale === 'zh' ? '页面' : 'Page') : (locale === 'zh' ? '浏览量' : 'Views') }}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Pages -->
              <template v-if="activeTab === 'pages'">
                <tr v-for="(item, i) in pageStats" :key="i" :class="{ featured: item.name === '/portfolio' }">
                  <td class="col-name">
                    <span class="page-path">{{ item.name }}</span>
                    <span v-if="item.name === '/portfolio'" class="page-badge">{{ locale === 'zh' ? '作品集' : 'Portfolio' }}</span>
                  </td>
                  <td class="col-count">
                    <span class="count-num">{{ item.count }}</span>
                    <div class="count-bar" :style="{ width: `${(item.count / pageStats[0].count) * 100}%` }"></div>
                  </td>
                </tr>
                <tr v-if="!pageStats.length"><td colspan="2" class="empty-row">{{ locale === 'zh' ? '暂无数据' : 'No data' }}</td></tr>
              </template>

              <!-- Referrers -->
              <template v-if="activeTab === 'referrers'">
                <tr v-for="(item, i) in referrers" :key="i">
                  <td class="col-name">{{ fmtRef(item.name) }}</td>
                  <td class="col-count">
                    <span class="count-num">{{ item.count }}</span>
                    <div class="count-bar" :style="{ width: `${(item.count / referrers[0].count) * 100}%` }"></div>
                  </td>
                </tr>
                <tr v-if="!referrers.length"><td colspan="2" class="empty-row">{{ locale === 'zh' ? '暂无数据' : 'No data' }}</td></tr>
              </template>

              <!-- Countries / Regions -->
              <template v-if="activeTab === 'countries'">
                <tr v-for="(item, i) in countries" :key="i">
                  <td class="col-name">{{ formatCountryName(item.name, item.code, locale) }}</td>
                  <td class="col-count">
                    <span class="count-num">{{ item.count }}</span>
                    <div class="count-bar" :style="{ width: `${(item.count / countries[0].count) * 100}%` }"></div>
                  </td>
                </tr>
                <tr v-if="!countries.length"><td colspan="2" class="empty-row">{{ locale === 'zh' ? '暂无数据' : 'No data' }}</td></tr>
              </template>

              <!-- Devices -->
              <template v-if="activeTab === 'devices'">
                <tr v-for="(item, i) in deviceStats" :key="i">
                  <td class="col-name">{{ item.name }}</td>
                  <td class="col-count">
                    <span class="count-num">{{ item.count }}</span>
                    <div class="count-bar" :style="{ width: `${(item.count / deviceStats[0].count) * 100}%` }"></div>
                  </td>
                </tr>
                <tr v-if="!deviceStats.length"><td colspan="2" class="empty-row">{{ locale === 'zh' ? '暂无数据' : 'No data' }}</td></tr>
              </template>

              <!-- Recent -->
              <template v-if="activeTab === 'recent'">
                <tr v-for="(v, i) in recent.slice(0, 20)" :key="i">
                  <td class="col-name time">{{ fmtTime(v.time) }}</td>
                  <td class="col-detail ref">{{ fmtRef(v.referrer) }}</td>
                  <td class="col-detail loc">{{ fmtLoc(v) }}</td>
                  <td class="col-count light">{{ v.page || '/' }}</td>
                </tr>
                <tr v-if="!recent.length"><td colspan="4" class="empty-row">{{ locale === 'zh' ? '暂无数据' : 'No data' }}</td></tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== Article Ranking ===== -->
      <div class="ranking-section" v-if="activeScope === 'all' && postPvList.length">
        <h2 class="section-title">{{ locale === 'zh' ? '文章热度排行' : 'Article Ranking' }}</h2>
        <div class="ranking-grid">
          <div v-for="(p, i) in postPvList" :key="p.postId" class="rank-item">
            <span class="rank-num" :class="{ top: i < 3 }">{{ i + 1 }}</span>
            <div class="rank-info">
              <span class="rank-title">{{ p.title || p.postId }}</span>
              <span class="rank-meta">{{ fmtNum(p.total) }} views · {{ locale === 'zh' ? '今日' : 'today' }} {{ p.today }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <button class="back-top" :aria-label="locale === 'zh' ? '回到顶部' : 'Back to top'" @click="scrollTop">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
  </div>
</template>

<style scoped>
.analytics { padding-bottom: 80px; }

/* ===== Header ===== */
.analytics-header {
  position: relative;
  text-align: left; padding: 70px 24px 48px;
  border-bottom: 1px solid var(--border);
  background:
    linear-gradient(135deg, rgba(6,182,212,0.08), transparent 32%),
    linear-gradient(225deg, rgba(16,185,129,0.06), transparent 38%),
    var(--bg-sunken);
  overflow: hidden;
}
.analytics-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(180deg, black, transparent 82%);
  -webkit-mask-image: linear-gradient(180deg, black, transparent 82%);
  opacity: 0.42;
}
.header-title {
  position: relative; z-index: 1;
  font-family: var(--font-display);
  font-size: 38px; font-weight: 780;
  letter-spacing: 0; color: var(--text-1); margin: 0 auto 4px;
  max-width: var(--container-max);
}
.header-sub {
  position: relative; z-index: 1;
  max-width: var(--container-max);
  margin: 0 auto;
  font-size: 15px; color: var(--text-2);
}

/* ===== Scope Toolbar ===== */
.analytics-toolbar {
  width: calc(100% - 48px);
  max-width: var(--container-max);
  margin: -22px auto 0;
  padding: 13px 14px 13px 18px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--gradient-panel), var(--bg-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}
.scope-copy {
  min-width: 0;
}
.scope-copy span {
  display: block;
  margin-bottom: 2px;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 700;
}
.scope-copy p {
  color: var(--text-2);
  font-size: 14.5px;
  line-height: 1.65;
}
.scope-switch {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(72px, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-sunken);
}
.scope-btn {
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 700;
  transition: transform 0.16s var(--ease-out), color 0.16s var(--ease-out), background 0.16s var(--ease-out);
}
.scope-btn:hover { color: var(--text-2); }
.scope-btn:active { transform: translateY(1px); }
.scope-btn.active {
  background: var(--bg-surface-solid);
  color: var(--text-1);
  box-shadow: inset 0 0 0 1px var(--border-strong);
}

/* States */
.state-msg {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 80px 0; color: var(--text-2);
}
.state-msg.error { color: #ef4444; }
.spinner { width: 24px; height: 24px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn {
  padding: 6px 20px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--bg-surface);
  color: var(--text-2); cursor: pointer; font-size: 14px;
  transition: all 0.15s;
}
.retry-btn:hover { border-color: var(--accent); color: var(--accent); }

/* ===== KPI Cards ===== */
.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  max-width: var(--container-max); margin: 12px auto 0;
  padding: 0 24px; position: relative; z-index: 2;
}
.kpi-card {
  background: var(--gradient-panel), var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 22px 20px;
  text-align: center; transition: border-color 0.2s, transform 0.2s;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
.kpi-card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.kpi-card.accent { border-color: var(--border-accent); }
.kpi-value {
  display: block; font-size: 30px; font-weight: 700;
  font-family: var(--font-mono); color: var(--text-1); line-height: 1.2;
}
.kpi-card.accent .kpi-value {
  color: transparent;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  background-clip: text;
}
.kpi-label {
  font-size: 12.5px; color: var(--text-3); letter-spacing: 0;
  margin-top: 4px; display: block;
}

/* ===== Viz Row ===== */
.viz-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  max-width: var(--container-max); margin: 0 auto; padding: 32px 24px 0;
}
.viz-card {
  background: var(--gradient-panel), var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px; overflow: hidden;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
.viz-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.viz-title { font-size: 15px; font-weight: 650; color: var(--text-2); }
.viz-sub { font-size: 11px; color: var(--text-3); font-family: var(--font-mono); }

/* Bar Chart */
.traffic-chart {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  overflow: hidden;
}
.chart-scale {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 164px;
  padding: 20px 0 24px;
  color: var(--text-3);
  font-size: 11px;
  font-family: var(--font-mono);
  text-align: right;
}
.bar-plot {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  align-items: end;
  gap: clamp(2px, 0.55vw, 6px);
  min-width: 0;
  height: 164px;
  padding: 20px 4px 0;
  border-bottom: 1px solid var(--border);
  background:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 100% 41px, calc(100% / 24) 100%;
}
.bar-col {
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bar-fill {
  width: 100%; max-width: 18px;
  background: linear-gradient(180deg, var(--accent-2), var(--accent), var(--accent-3));
  border-radius: 999px 999px 0 0; min-height: 2px;
  transition: height 0.4s var(--ease-out);
  position: relative; display: flex; align-items: flex-start; justify-content: center;
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 28%, transparent);
  overflow: hidden;
  animation: bar-rise 0.55s var(--ease-out) both;
  transform-origin: bottom;
}
.bar-tip {
  position: absolute; top: 4px; font-size: 11px; color: #fff;
  font-family: var(--font-mono); line-height: 1;
  text-shadow: 0 1px 4px rgba(0,0,0,0.45);
}
@keyframes bar-rise { from { transform: scaleY(0.2); opacity: 0.45; } to { transform: scaleY(1); opacity: 1; } }
.bar-axis {
  grid-column: 2;
  display: grid;
  grid-template-columns: repeat(24, minmax(0, 1fr));
  gap: clamp(2px, 0.55vw, 6px);
  min-width: 0;
  padding-top: 7px;
}
.bar-label {
  min-height: 14px;
  font-size: 11px; color: var(--text-3);
  font-family: var(--font-mono);
  text-align: center;
  white-space: nowrap;
}

/* Map */
.map-card { position: relative; z-index: 0; isolation: isolate; }
.map-container {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 218px;
  border-radius: var(--radius-md);
  overflow: hidden;
  isolation: isolate;
}
.city-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.city-strip span {
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  color: var(--text-3);
  font-size: 12px;
  font-family: var(--font-mono);
}
.empty-sm { font-size: 14px; color: var(--text-3); text-align: center; padding: 40px 0; }

/* ===== Breakdown ===== */
.breakdown-section {
  max-width: var(--container-max); margin: 0 auto; padding: 32px 24px 0;
}
.tab-bar { display: flex; gap: 2px; margin-bottom: 0; }
.tab-btn {
  padding: 8px 16px; border: none; background: transparent;
  font-size: 14px; font-weight: 560; color: var(--text-3);
  cursor: pointer; border-bottom: 2px solid transparent;
  transition: all 0.15s; font-family: var(--font-sans);
}
.tab-btn:hover { color: var(--text-2); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

.table-wrap {
  border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden;
  background: var(--gradient-panel), var(--bg-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th {
  text-align: left; padding: 12px 16px; font-size: 11.5px; font-weight: 650;
  color: var(--text-3); text-transform: uppercase; letter-spacing: 0;
  border-bottom: 1px solid var(--border); background: var(--bg-sunken);
}
.data-table td { padding: 12px 16px; color: var(--text-2); border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg-surface-hover); }
.data-table tr.featured td {
  background: linear-gradient(90deg, var(--accent-dim), transparent 58%);
}
.col-name { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-name.time { color: var(--text-3); font-family: var(--font-mono); font-size: 12.5px; }
.col-detail { font-size: 13px; color: var(--text-3); }
.col-count { position: relative; width: 140px; }
.col-count.light { color: var(--text-3); font-size: 12px; font-family: var(--font-mono); }
.count-num { position: relative; z-index: 1; font-family: var(--font-mono); font-size: 12.5px; }
.count-bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--accent-soft); border-radius: 0 2px 2px 0;
  transition: width 0.5s var(--ease-out);
}
.col-detail.ref { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-detail.loc { color: var(--accent); white-space: nowrap; }
.page-path { font-family: var(--font-mono); font-size: 12.5px; }
.page-badge {
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
}
.empty-row { text-align: center; color: var(--text-3); padding: 32px 16px !important; }

/* ===== Ranking ===== */
.ranking-section { max-width: var(--container-max); margin: 0 auto; padding: 40px 24px 0; }
.section-title { font-size: 18px; font-weight: 650; color: var(--text-1); margin-bottom: 14px; }
.ranking-grid { display: flex; flex-direction: column; gap: 8px; }
.rank-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; background: var(--bg-surface);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  transition: border-color 0.2s;
}
.rank-item:hover { border-color: var(--border-strong); }
.rank-num {
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; font-family: var(--font-mono);
  color: var(--text-3); background: var(--bg-sunken); flex-shrink: 0;
}
.rank-num.top { background: var(--accent-soft); color: var(--accent); }
.rank-info { display: flex; flex-direction: column; min-width: 0; }
.rank-title { font-size: 15px; font-weight: 560; color: var(--text-1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rank-meta { font-size: 12px; color: var(--text-3); font-family: var(--font-mono); margin-top: 2px; }

/* ===== Back Top ===== */
.back-top {
  position: fixed; bottom: 32px; right: 32px; z-index: 90;
  width: 40px; height: 40px; border-radius: var(--radius-md);
  background: var(--bg-surface); border: 1px solid var(--border);
  color: var(--text-2); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-card); transition: all 0.2s;
}
.back-top:hover { color: var(--accent); border-color: var(--border-accent); }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .analytics-header { padding: 52px 20px 32px; }
  .header-title { font-size: 32px; }
  .analytics-toolbar {
    margin: -16px 20px 0;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px;
  }
  .scope-switch {
    width: 100%;
  }
  .kpi-row { grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 0 20px; margin-top: 10px; }
  .kpi-card { padding: 16px 12px; }
  .kpi-value { font-size: 24px; }
  .viz-row { grid-template-columns: 1fr; padding: 28px 20px 0; }
  .bar-plot, .chart-scale { height: 142px; }
  .breakdown-section { padding: 28px 20px 0; }
  .ranking-section { padding: 32px 20px 0; }
  .col-detail.loc, .col-detail.ref { display: none; }
  .back-top { bottom: 24px; right: 16px; }
}
@media (max-width: 480px) {
  .analytics-header { padding: 44px 16px 28px; }
  .header-title { font-size: 28px; }
  .analytics-toolbar { margin-left: 16px; margin-right: 16px; }
  .kpi-row { padding: 0 16px; }
  .viz-row { padding: 24px 16px 0; }
  .breakdown-section { padding: 24px 16px 0; }
  .ranking-section { padding: 28px 16px 0; }
  .data-table th, .data-table td { padding: 8px 10px; }
}
</style>

<style>
.leaflet-container { background: #0d0d12 !important; z-index: 0 !important; }
.leaflet-pane,
.leaflet-top,
.leaflet-bottom {
  z-index: 1 !important;
}
.leaflet-tooltip {
  background: var(--bg-surface) !important; border: 1px solid var(--border) !important;
  border-radius: 6px !important; color: var(--text-2) !important;
  font-family: var(--font-mono) !important; font-size: 11px !important;
  padding: 6px 10px !important; box-shadow: var(--shadow-float) !important;
}
.leaflet-tooltip b { color: var(--text-1); }
.leaflet-control-zoom a {
  background: var(--bg-surface) !important; border-color: var(--border) !important;
  color: var(--text-2) !important;
}
.leaflet-control-zoom a:hover { background: var(--bg-surface-hover) !important; color: var(--text-1) !important; }
</style>
