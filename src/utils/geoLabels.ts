import type { Locale } from '../i18n'

type GeoParts = { city?: string; region?: string; country?: string; countryCode?: string }

const countryZh: Record<string, string> = {
  China: '中国',
  CN: '中国',
  'United States': '美国',
  USA: '美国',
  US: '美国',
  Singapore: '新加坡',
  Japan: '日本',
  Korea: '韩国',
  'South Korea': '韩国',
  Russia: '俄罗斯',
  Germany: '德国',
  France: '法国',
  'United Kingdom': '英国',
  Canada: '加拿大',
  Australia: '澳大利亚',
}

const countryEn: Record<string, string> = {
  中国: 'China',
  CN: 'China',
}

const regionZh: Record<string, string> = {
  Beijing: '北京',
  Shanghai: '上海',
  Tianjin: '天津',
  Chongqing: '重庆',
  Hunan: '湖南',
  Jiangsu: '江苏',
  Zhejiang: '浙江',
  Guangdong: '广东',
  Shandong: '山东',
  Henan: '河南',
  Hubei: '湖北',
  Sichuan: '四川',
  Fujian: '福建',
  Anhui: '安徽',
  Jiangxi: '江西',
  Hebei: '河北',
  Shanxi: '山西',
  Shaanxi: '陕西',
  Liaoning: '辽宁',
  Jilin: '吉林',
  Heilongjiang: '黑龙江',
  Yunnan: '云南',
  Guizhou: '贵州',
  Guangxi: '广西',
  Hainan: '海南',
  Gansu: '甘肃',
  Qinghai: '青海',
  Ningxia: '宁夏',
  Xinjiang: '新疆',
  Tibet: '西藏',
  'Inner Mongolia': '内蒙古',
}

const cityZh: Record<string, string> = {
  Beijing: '北京',
  Shanghai: '上海',
  Tianjin: '天津',
  Chongqing: '重庆',
  Zhangjiajie: '张家界',
  Changsha: '长沙',
  Xiangtan: '湘潭',
  Zhuzhou: '株洲',
  Yueyang: '岳阳',
  Hengyang: '衡阳',
  Changde: '常德',
  Yiyang: '益阳',
  Chenzhou: '郴州',
  Yongzhou: '永州',
  Huaihua: '怀化',
  Loudi: '娄底',
  Wuxi: '无锡',
  Suzhou: '苏州',
  Hangzhou: '杭州',
  Jiaxing: '嘉兴',
  Ningbo: '宁波',
  Jinhua: '金华',
  Guangzhou: '广州',
  Shenzhen: '深圳',
  Foshan: '佛山',
  Dongguan: '东莞',
  Nanjing: '南京',
  Chengdu: '成都',
  Wuhan: '武汉',
  Xiamen: '厦门',
  Fuzhou: '福州',
  Qingdao: '青岛',
  Jinan: '济南',
  Zhengzhou: '郑州',
  "Xi'an": '西安',
}

const cnCityAliases: Record<string, GeoParts> = {
  xishan: { city: 'Wuxi', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  jiangyin: { city: 'Wuxi', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  yixing: { city: 'Wuxi', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  zhangjiagang: { city: 'Suzhou', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  kunshan: { city: 'Suzhou', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  changshu: { city: 'Suzhou', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  taicang: { city: 'Suzhou', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  wujiang: { city: 'Suzhou', region: 'Jiangsu', country: 'China', countryCode: 'CN' },
  xiaoshan: { city: 'Hangzhou', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  yuhang: { city: 'Hangzhou', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  tongxiang: { city: 'Jiaxing', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  haining: { city: 'Jiaxing', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  cixi: { city: 'Ningbo', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  yuyao: { city: 'Ningbo', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  yiwu: { city: 'Jinhua', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  dongyang: { city: 'Jinhua', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  yongkang: { city: 'Jinhua', region: 'Zhejiang', country: 'China', countryCode: 'CN' },
  panyu: { city: 'Guangzhou', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  huadu: { city: 'Guangzhou', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  zengcheng: { city: 'Guangzhou', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  conghua: { city: 'Guangzhou', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  baoan: { city: 'Shenzhen', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  longgang: { city: 'Shenzhen', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  nanshan: { city: 'Shenzhen', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  shunde: { city: 'Foshan', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  nanhai: { city: 'Foshan', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  sanshui: { city: 'Foshan', region: 'Guangdong', country: 'China', countryCode: 'CN' },
  haidian: { city: 'Beijing', region: 'Beijing', country: 'China', countryCode: 'CN' },
  chaoyang: { city: 'Beijing', region: 'Beijing', country: 'China', countryCode: 'CN' },
  pudong: { city: 'Shanghai', region: 'Shanghai', country: 'China', countryCode: 'CN' },
  minhang: { city: 'Shanghai', region: 'Shanghai', country: 'China', countryCode: 'CN' },
  songjiang: { city: 'Shanghai', region: 'Shanghai', country: 'China', countryCode: 'CN' },
}

function key(value = ''): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function clean(value?: string): string {
  return String(value || '').trim()
}

function isChina(parts: GeoParts): boolean {
  return parts.countryCode === 'CN' || parts.country === 'China' || parts.country === '中国'
}

function parseName(name: string): GeoParts {
  const parts = String(name || '').split(',').map(part => part.trim()).filter(Boolean)
  if (parts.length >= 3) return { city: parts[0], region: parts[1], country: parts[2] }
  if (parts.length === 2) return { city: parts[0], country: parts[1] }
  return { city: parts[0] || '' }
}

export function normalizeGeoParts(input: GeoParts | string): GeoParts {
  const base = typeof input === 'string' ? parseName(input) : { ...input }
  const countryCode = clean(base.countryCode).toUpperCase()
  if (countryCode) base.countryCode = countryCode
  if (isChina(base)) base.country = 'China'

  const alias = cnCityAliases[key(base.city)]
  if (alias && (isChina(base) || !base.country || base.country === 'Unknown')) return { ...base, ...alias }
  if (isChina(base) && key(base.city).endsWith('cun')) {
    if (base.region && cityZh[base.region]) return { ...base, city: base.region, country: 'China', countryCode: 'CN' }
    return { ...base, city: '', country: 'China', countryCode: 'CN' }
  }
  return base
}

export function formatCountryName(name: string, code: string | undefined, locale: Locale): string {
  const country = clean(name)
  const countryCode = clean(code).toUpperCase()
  if (locale === 'zh') return countryZh[countryCode] || countryZh[country] || country || '未知'
  return countryEn[countryCode] || countryEn[country] || country || 'Unknown'
}

export function formatCityName(name: string, locale: Locale): string {
  const parts = normalizeGeoParts(name)
  const country = parts.country || ''
  const region = clean(parts.region)
  const city = clean(parts.city)
  if (!city && region) {
    const zhRegion = regionZh[region] || region
    const zhCountry = formatCountryName(country, parts.countryCode, 'zh')
    if (locale === 'zh') return [zhRegion, zhCountry].filter(Boolean).join('，')
    const enCountry = formatCountryName(country, parts.countryCode, 'en')
    return [region, enCountry === 'Unknown' ? '' : enCountry].filter(Boolean).join(', ')
  }
  if (!city) return locale === 'zh' ? '未知' : 'Unknown'
  if (locale === 'zh') {
    const zhCity = cityZh[city] || city
    const zhRegion = regionZh[region] || region
    const zhCountry = formatCountryName(country, parts.countryCode, locale)
    const pieces = [zhCity]
    if (zhRegion && zhRegion !== zhCity) pieces.push(zhRegion)
    if (zhCountry && zhCountry !== '未知') pieces.push(zhCountry)
    return pieces.join('，')
  }
  const pieces = [city]
  if (region && region !== city) pieces.push(region)
  if (country && country !== 'Unknown') pieces.push(formatCountryName(country, parts.countryCode, locale))
  return pieces.join(', ')
}

export function formatVisitLocation(visit: GeoParts, locale: Locale): string {
  const parts = normalizeGeoParts(visit)
  if (parts.city && parts.city !== 'Unknown') {
    return formatCityName([parts.city, parts.region, parts.country].filter(Boolean).join(', '), locale)
  }
  if (parts.region) {
    if (locale === 'zh') {
      return [regionZh[parts.region] || parts.region, formatCountryName(parts.country || '', parts.countryCode, locale)]
        .filter(Boolean)
        .join('，')
    }
    return [parts.region, formatCountryName(parts.country || '', parts.countryCode, locale)].filter(Boolean).join(', ')
  }
  if (parts.country && parts.country !== 'Unknown') {
    return formatCountryName(parts.country, parts.countryCode, locale)
  }
  return locale === 'zh' ? '未知' : 'Unknown'
}
