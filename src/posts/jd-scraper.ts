import type { Post } from './index'

const post: Post = {
  id: 'jd-scraper',
  title: '京东电商爬虫与数据分析',
  titleEn: 'JD.com Product Scraper',
  summary: '使用 Requests + Parsel 爬取京东笔记本电脑数据，Jieba 分词 + 词云进行商品标题分析。',
  summaryEn: 'Python web scraper for JD.com product data: requests-based crawling with anti-detection headers, CSV data export for analysis.',
  category: 'ai',
  tags: ['Python', '爬虫', 'Jieba', '词云'],
  date: '2024-04',
  cover: '🔍',
  sections: [
    { type: 'heading', content: '爬虫设计与反爬策略', id: 'scraper' },
    { type: 'text', content: '京东搜索页有反爬机制，需要携带 Cookie 才能获取完整数据。我们使用 Requests 发送请求，Parsel 解析 HTML，分页爬取 10 页共约 300 条笔记本电脑数据。' },
    { type: 'code', lang: 'python', content: `import requests, csv, parsel, time
from tqdm import tqdm

f = open('search.csv', mode='w', encoding='utf-8-sig', newline='')
csv_writer = csv.DictWriter(f, fieldnames=[
    "商品id", "价格", "商品标题", "店铺名", "店铺链接"
])
csv_writer.writeheader()

for page in tqdm(range(1, 20, 2)):  # 京东每页2个page参数
    time.sleep(2)  # 请求间隔，避免被封
    url = f'https://search.jd.com/Search?keyword=笔记本电脑&page={page}'
    headers = {
        'User-Agent': 'Mozilla/5.0 ... Chrome/122.0.0.0 ...'
    }
    cookies = {'cookies': '...'}  # 必须加 Cookie
    response = requests.get(url, headers=headers, cookies=cookies)

    selector = parsel.Selector(response.text)
    divs = selector.css('div.gl-i-wrap')  # 商品卡片
    for div in divs:
        name = div.css('.p-name em::text').getall()
        price = div.css('.p-price i::text').get()
        store_name = div.css('.J_im_icon a::text').get()
        link = div.css('.curr-shop::attr(href)').get()
        csv_writer.writerow({
            "价格": price, "商品id": id, "商品标题": name_text,
            "店铺名": store_name, "店铺链接": link
        })`, explanation: '京东的反爬关键在于 Cookie 验证——不加 Cookie 返回的 HTML 不包含商品数据。Parsel 的 CSS 选择器语法简洁，::text 提取文本，::attr(href) 提取属性。tqdm 显示进度条，time.sleep(2) 控制请求频率。' },
    { type: 'heading', content: '数据清洗', id: 'clean' },
    { type: 'text', content: '爬取的原始数据存在格式不一致问题，如商品标题可能拆分为多个文本节点，店铺链接缺少协议头。' },
    { type: 'code', lang: 'python', content: `# 商品标题处理：多文本节点合并
name = div.css('.p-name em::text').getall()
if len(name[0]) <= 10:
    name_text = ''.join(name)  # 短标题拼接
else:
    name_text = name[0]        # 长标题取第一段

# 店铺链接处理：补全协议头
link = div.css('.curr-shop::attr(href)').get()
if link:
    link = 'https:' + link
else:
    link = "没有找到店铺，可能是百亿补贴"`, explanation: '京东的 HTML 结构不统一：有些标题在单个 em 标签内，有些拆分到子标签中。长度判断是简单但有效的启发式方法——标题文本较短时说明被拆分了，需要拼接。' },
    { type: 'heading', content: 'Jieba 分词与词云', id: 'analysis' },
    { type: 'text', content: '对商品标题进行中文分词，统计高频词，生成词云图。这可以揭示消费者关注的笔记本特性和品牌偏好。' },
    { type: 'code', lang: 'python', content: `import jieba
from wordcloud import WordCloud

# 读取爬取的 CSV 数据，提取商品标题
titles = []
with open('search.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        titles.append(row['商品标题'])

# Jieba 分词
all_words = []
for title in titles:
    words = jieba.cut(title)
    all_words.extend([w for w in words if len(w) > 1])

# 统计词频
from collections import Counter
word_counts = Counter(all_words)

# 生成词云
wc = WordCloud(
    font_path='SimHei.ttf',  # 中文字体
    width=800, height=600,
    background_color='white'
)
wc.generate_from_frequencies(word_counts)
wc.to_file('wordcloud.png')`, explanation: 'jieba.cut() 对中文标题分词，len(w) > 1 过滤掉单字无意义词。Counter 统计词频，WordCloud 根据词频生成词云图——词越大说明出现越频繁，反映消费者最关注的特性。' },
  ],
  sectionsEn: [
    { type: 'heading', content: 'Scraper Design and Anti-Detection Strategy', id: 'scraper' },
    { type: 'text', content: 'JD.com search pages have anti-scraping mechanisms and require cookies to get complete data. We use Requests to send requests, Parsel to parse HTML, and paginate to crawl approximately 300 laptop product records across 10 pages.' },
    { type: 'code', lang: 'python', content: `import requests, csv, parsel, time
from tqdm import tqdm

f = open('search.csv', mode='w', encoding='utf-8-sig', newline='')
csv_writer = csv.DictWriter(f, fieldnames=[
    "Product ID", "Price", "Product Title", "Store Name", "Store Link"
])
csv_writer.writeheader()

for page in tqdm(range(1, 20, 2)):  # JD uses 2 page params per page
    time.sleep(2)  # Request interval to avoid blocking
    url = f'https://search.jd.com/Search?keyword=laptop&page={page}'
    headers = {
        'User-Agent': 'Mozilla/5.0 ... Chrome/122.0.0.0 ...'
    }
    cookies = {'cookies': '...'}  # Cookie is required
    response = requests.get(url, headers=headers, cookies=cookies)

    selector = parsel.Selector(response.text)
    divs = selector.css('div.gl-i-wrap')  # Product cards
    for div in divs:
        name = div.css('.p-name em::text').getall()
        price = div.css('.p-price i::text').get()
        store_name = div.css('.J_im_icon a::text').get()
        link = div.css('.curr-shop::attr(href)').get()
        csv_writer.writerow({
            "Price": price, "Product ID": id, "Product Title": name_text,
            "Store Name": store_name, "Store Link": link
        })`, explanation: 'The key to JD\'s anti-scraping is cookie verification — without cookies, the returned HTML does not contain product data. Parsel\'s CSS selector syntax is concise: ::text extracts text, ::attr(href) extracts attributes. tqdm shows progress bar; time.sleep(2) controls request frequency.' },
    { type: 'heading', content: 'Data Cleaning', id: 'clean' },
    { type: 'text', content: 'The crawled raw data has formatting inconsistencies, such as product titles possibly split into multiple text nodes, and store links missing protocol headers.' },
    { type: 'code', lang: 'python', content: `# Product title processing: merge multiple text nodes
name = div.css('.p-name em::text').getall()
if len(name[0]) <= 10:
    name_text = ''.join(name)  # Short titles are concatenated
else:
    name_text = name[0]        # Long titles take the first segment

# Store link processing: complete protocol header
link = div.css('.curr-shop::attr(href)').get()
if link:
    link = 'https:' + link
else:
    link = "Store not found, may be a subsidy product"`, explanation: 'JD\'s HTML structure is not uniform: some titles are within a single em tag, others are split into child tags. Length-based judgment is a simple but effective heuristic — when title text is short, it means it was split and needs concatenation.' },
    { type: 'heading', content: 'Jieba Segmentation and Word Cloud', id: 'analysis' },
    { type: 'text', content: 'Perform Chinese word segmentation on product titles, count high-frequency words, and generate a word cloud. This can reveal consumer-focused laptop features and brand preferences.' },
    { type: 'code', lang: 'python', content: `import jieba
from wordcloud import WordCloud

# Read crawled CSV data, extract product titles
titles = []
with open('search.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        titles.append(row['Product Title'])

# Jieba segmentation
all_words = []
for title in titles:
    words = jieba.cut(title)
    all_words.extend([w for w in words if len(w) > 1])

# Word frequency statistics
from collections import Counter
word_counts = Counter(all_words)

# Generate word cloud
wc = WordCloud(
    font_path='SimHei.ttf',  # Chinese font
    width=800, height=600,
    background_color='white'
)
wc.generate_from_frequencies(word_counts)
wc.to_file('wordcloud.png')`, explanation: 'jieba.cut() segments Chinese titles; len(w) > 1 filters out meaningless single characters. Counter counts word frequencies; WordCloud generates the word cloud based on frequencies — larger words appear more frequently, reflecting consumer focus.' },
  ],
}

export default post
