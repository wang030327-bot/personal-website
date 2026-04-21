export const siteConfig = {
  title: "个人内容站",
  description: "一个持续更新的个人网站，用于发布音乐、写作与思考。",
  author: "汪汪",
  intro: "这里是汪汪的个人写作空间，会持续更新文章、随笔、评论与今日所想。",
  nav: [
    { href: "/", label: "首页" },
    { href: "/music", label: "音乐" },
    { href: "/essays", label: "文章" },
    { href: "/thoughts", label: "今日所想" },
    { href: "/write", label: "写作台" },
    { href: "/about", label: "关于" }
  ],
  social: [
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "GitHub", href: "https://github.com/yourname" },
    { label: "微博", href: "#" }
  ],
  publishing: {
    wechatEditorUrl: "https://mp.weixin.qq.com",
    republishTargets: [
      { label: "知乎专栏", href: "https://zhuanlan.zhihu.com/write" },
      { label: "掘金", href: "https://juejin.cn/editor/drafts/new/v2" },
      { label: "CSDN", href: "https://mp.csdn.net/mp_blog/manage/article" }
    ]
  }
};
