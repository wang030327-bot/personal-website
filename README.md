# Personal Content Site (Next.js + Tailwind + MDX)

一个可长期扩展的个人内容网站工程，适合展示：

- 音乐推荐
- 随笔与灵感记录
- 思考文章 / 论文式长文
- 题图与正文插图

## 技术栈

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MDX + frontmatter
- next-themes（深浅色模式）
- next/image（图片优化）

## 启动

```bash
npm install
npm run dev
```

## 目录结构

```text
personal-content-site/
├─ app/
│  ├─ about/page.tsx
│  ├─ essays/page.tsx
│  ├─ essays/[slug]/page.tsx
│  ├─ music/page.tsx
│  ├─ notes/page.tsx
│  ├─ notes/[slug]/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ content/
│  │  ├─ article-header.tsx
│  │  ├─ content-list.tsx
│  │  ├─ image-figure.tsx
│  │  ├─ post-card.tsx
│  │  ├─ prose.tsx
│  │  └─ toc.tsx
│  ├─ home/
│  │  ├─ featured-section.tsx
│  │  └─ hero.tsx
│  ├─ layout/
│  │  ├─ footer.tsx
│  │  └─ navbar.tsx
│  ├─ music/music-card.tsx
│  ├─ providers/theme-provider.tsx
│  └─ ui/
│     ├─ section-title.tsx
│     ├─ tag.tsx
│     └─ theme-toggle.tsx
├─ content/
│  ├─ essays/*.mdx
│  ├─ notes/*.mdx
│  └─ music/recommendations.ts
├─ lib/
│  ├─ content.ts
│  ├─ mdx-components.tsx
│  ├─ music.ts
│  ├─ site-config.ts
│  └─ utils.ts
├─ public/
│  └─ images/
│     ├─ essays/
│     ├─ music/
│     ├─ notes/
│     └─ shared/
└─ types/content.ts
```

## 内容新增方式

### 1) 新增随笔

在 `content/notes/` 新建 `.mdx` 文件，frontmatter 支持：

- `title`
- `date`
- `summary`
- `tags`
- `cover`
- `images`
- `draft`
- `featured`
- `slug`

### 2) 新增长文

在 `content/essays/` 新建 `.mdx`，结构同上，系统会自动计算阅读时长和目录（TOC）。

### 3) 新增音乐推荐

编辑 `content/music/recommendations.ts` 数组。

## 图片放置建议

- 随笔题图/插图：`public/images/notes/`
- 长文题图/插图：`public/images/essays/`
- 音乐封面：`public/images/music/`
- 站点共用视觉：`public/images/shared/`

MDX 内插图示例：

```md
![图片替代文本](/images/notes/example.jpg "这里是图片说明文字")
```

## 扩展建议

后续可直接扩展：

1. 新栏目：`content/reading`、`content/projects`、`content/gallery`
2. 标签页与归档页：基于 `lib/content.ts` 增加聚合函数
3. 搜索：本地 Fuse.js 或接入 Algolia
4. SEO：补充 `sitemap.ts`、`rss.xml`、OpenGraph 生成
5. 数据源升级：从本地 MDX 平滑切换到 CMS/数据库（保留当前类型与读取接口）
