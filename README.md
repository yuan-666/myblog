# 智荟元陆 · YuanHub

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Version](https://img.shields.io/badge/version-v2.8.9-0891b2)](https://yuan6.cn)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

智荟元陆是一个个人编程经验分享博客，记录 Python 课程设计、Vue 全栈实践、AI 工具、算法可视化、DevOps 和自动化流水线。这个公开仓库只保留前端、文章、Demo 和公开文档；动态统计与管理接口由独立私有服务提供。

**Live Site**: [yuan6.cn](https://yuan6.cn)

## 功能

- **14 篇技术文章**：Python 课设、全栈项目、AI 工具、算法可视化、DevOps 与边缘架构。
- **9 个交互式 Demo**：词典、课程管理、蚁群追踪、蚁群寻路、CNN 手写识别、爬虫分析、云部署、AI 实验、LLM 原理。
- **访问统计仪表盘**：前端读取聚合摘要，展示 PV、来源、设备、城市分布和文章热度。
- **文章级 PV 展示**：路由变化会向私有统计服务上报访问，公开页面只展示聚合结果。
- **SEO 自动化**：sitemap、robots、JSON-LD、唯一 meta 描述和 IndexNow 支持。
- **中英文双语与主题切换**：自定义 i18n provide/inject，语言和主题偏好持久化到 localStorage。
- **高质感 UI**：Industrial Signal 线框视觉、系统无衬线正文、衬线展示标题、响应式文章流、代码复制与架构图动态渲染。
- **品牌化页脚**：友情链接使用本地透明 Logo 资源，包含 DeepSeek、Xiaomi MiMo、Alibaba Cloud ESA、Cloudflare。

## v2.8.9 更新

- 全局正文改为系统 UI 无衬线字体栈，减少不同设备的观感差异。
- 新增衬线展示标题字体层，首页 H1、文章标题、关于页、版本页和统计页标题更有辨识度。
- 暗色模式二级文字和弱提示文字提高对比度，桌面端不再大面积发灰。
- 首页、文章列表、文章详情、统计页、关于页、GitHub 页、代码块、Demo 容器和页脚字号整体上调。
- 正文行高调整到更适合中文长文阅读的节奏，手机和电脑上的段落、列表、表格都更清楚。

## v2.8.8 更新

- 统计页地理维度统一为更准确的区域口径，减少行政层级误读。
- 前端兼容历史地理聚合数据，旧聚合会在展示层合并到当前口径。
- 地理解析链路改为多源 fallback，低置信城市结果不会过早终止查询链。
- 统计页中文模式使用中文地名，英文模式使用英文地名。
- 公开统计继续只展示聚合摘要，不暴露原始访问日志。

## v2.8.7 更新

- 统计页改为“全站 / 作品集”口径切换，作品集访问不再作为单独大模块突出展示。
- 作品集访问复用同一套趋势、来源、设备、区域、城市和最近访问反馈。
- 访问上报写入链路加固，辅助聚合异常不再影响前端访问体验。
- KPI 从“日均浏览”改为更明确的城市数，避免用估算数据影响判断。

## v2.8.6 更新

- 统计页新增作品集访问入口，展示作品集累计与今日访问信号。
- 页面明细表会高亮作品集路径，方便从博客统计面板确认作品集流量。
- 作品集页脚新增统计面板入口，访问数据可以从作品集和博客统计页两处查看。

## v2.8.5 更新

- 新增页面级访问量展示能力，用于读取单页累计访问量和今日访问量。
- 页面级计数写入改为 best-effort，不影响访问日志、地理位置和文章 PV 主链路。
- 前端统计页和作品集页脚复用同一套聚合摘要。

## v2.8.4 更新

- 文章 PV 写入不再信任客户端传入的标题，后端改用文章 ID 对应的固定标题。
- 文章排行标题更稳定，不会被异常上报污染。
- 保留生产写入恢复逻辑，访问量和文章 PV 已恢复稳定更新。

## v2.8.3 更新

- 修复生产环境写入停止更新的问题，限流键与统计键统一安全化。
- 限流记录改为 best-effort，辅助写入异常不会拖垮主业务写入。
- 历史地理聚合数据读取时会做兼容处理，减少区县级名称被误当作城市展示。

## v2.8.2 更新

- 地理解析改为服务端多源 fallback，遇到低置信结果会继续尝试下一条链路。
- 公开统计只返回聚合摘要和脱敏最近访问，不返回原始访问日志。
- 新增诊断能力用于排查地理解析质量，相关入口仅在私有服务中维护。

## v2.8.1 更新

- 新增统一地理位置归一化层，写入和读取统计数据时都处理城市、地区和国家字段。
- 修复区县级地点被当作城市展示的问题。
- 城市聚合 key 升级为 city + region + country，减少同名城市和区县误聚合。
- 最近访问和统计地图复用同一套归一化逻辑，避免新旧接口显示不一致。

## v2.8.0 更新

- 管理类接口收口到私有服务，并通过令牌保护。
- 新增聚合摘要接口，统计页不再读取原始最近访问日志。
- 上报接口加入来源校验、基础限流、请求体大小限制和文章 ID 白名单。
- 首页推荐文章改为每次打开随机抽取；统计地图层级被限制在卡片内，不再遮挡固定页眉。

## v2.7.1 更新

- 新增轻量文章目录模块，首页不再引入完整文章正文、代码片段和长内容。
- 完整文章内容留在文章详情页路由 chunk 中按需加载。
- 首页业务 JS 从约 201KB 降到约 62.6KB，gzip 从约 73KB 降到约 25.3KB。
- 访问上报与 PV 标题匹配改用轻量目录，减少全局入口负担。

## v2.7.0 更新

- 移除阻塞式 Google Fonts `@import`，切换为系统字体栈，减少首屏渲染等待。
- 非首页路由改为动态导入，并把 Vue/Vue Router 拆成可缓存的独立 chunk。
- 首页首屏内容立即渲染，打字机、访问统计和文章 PV 请求延后到浏览器空闲期。
- 鼠标光效改用 `requestAnimationFrame` + `translate3d`，触屏设备和减少动态偏好下自动关闭。
- 视觉系统从紫蓝发光收敛为墨色、青色、绿色，移除文章卡片扫光和模糊外发光。
- 补齐主题、菜单、搜索清空、返回顶部、分页等控件的可访问名称。

## v2.6.0 更新

- 统计页 24h 柱状图修复上下裁切，数值标签进入柱体安全区域。
- 服务端地理解析链路重做，统计页只消费聚合摘要。
- 页脚友情链接改为本地透明品牌 Logo，并与站点品牌、隐私、版权同排展示。
- 扩写 `ai-tools-beginner` 与 `automation-pipeline` 两篇文章，加入更完整的新手路线、脱敏代码片段和动态架构图。
- 优化所有 demo 动效，重点增强蚁群追踪、蚁群寻路和 CNN 手写数字识别的可玩性与层级可视化。

## 在线 Demo

每个 Demo 都是 `public/demos/` 下的独立 HTML 页面，零构建依赖，可直接由静态托管平台分发。

| Demo | 能力 |
|------|------|
| `dictionary.html` | 访客/管理员模式、增删改查、词条检索 |
| `course-mgmt.html` | 课程表格、排序、搜索、本地持久化 |
| `ant-sim.html` | 多蚂蚁追踪 playground、速度/方向/轨迹控制 |
| `ant-path.html` | ACO 网格寻路、画障碍、信息素/热力/蚂蚁流显示 |
| `cnn-digit.html` | 手写数字画布、CNN 层级节点与连接可视化 |
| `jd-scraper.html` | 商品数据分析、价格柱状图、品牌过滤、关键词词云 |
| `cloud-deploy.html` | 混合云部署流程、CI/CD 管道动画 |
| `ai-experiments.html` | AI 实验结果、模型指标与视觉面板 |
| `llm-explained.html` | LLM 原理分层演示与交互说明 |

## 快速开始

```bash
git clone https://github.com/yuan-666/myblog.git
cd myblog
npm install
npm run dev
npm run build
```

构建产物输出到 `dist/`，可部署到任意静态托管平台。

## 项目结构

```text
myblog/
├── public/
│   ├── brand/                # 页脚友情链接本地透明 Logo
│   ├── demos/                # 9 个独立交互 Demo HTML + 权重数据
│   ├── sitemap.xml
│   └── robots.txt
├── src/
│   ├── components/           # Header/Footer/CodeBlock/DemoShowcase/Toc 等
│   ├── data/versions.ts      # 版本迭代记录
│   ├── posts/                # 14 篇文章数据（TypeScript 模块）
│   ├── utils/                # 标签和地理展示工具
│   ├── views/                # Home/PostDetail/Analytics/About/GitHub
│   ├── App.vue
│   ├── i18n.ts
│   ├── router.ts
│   └── style.css
├── index.html
├── package.json
└── vite.config.ts
```

## 技术栈

- Vue 3.5 + Composition API + `<script setup>`
- TypeScript 6
- Vite 8
- Vue Router 4 Hash 模式
- CSS Variables + scoped CSS
- 私有统计 API + 公开聚合摘要
- Canvas / SVG / iframe Demo
- IndexNow + sitemap + JSON-LD

## 部署

### 静态站点部署

1. 关联 GitHub 仓库。
2. 构建命令：`npm run build`
3. 输出目录：`dist`
4. 推送 `main` 后由平台自动构建部署。

### 本地验证

```bash
npm run build
```

## License

MIT © [yuan-666](https://github.com/yuan-666)
