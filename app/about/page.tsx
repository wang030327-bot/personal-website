import Image from "next/image";

import { SectionTitle } from "@/components/ui/section-title";
import { siteConfig } from "@/lib/site-config";

export default function AboutPage() {
  return (
    <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
      <section className="space-y-6">
        <SectionTitle eyebrow="About" title="关于我" />
        <p className="leading-relaxed text-ink-700 dark:text-ink-200">
          这个网站是我的长期写作空间。我会把零散想法整理成可持续更新、可复用、可转载的内容。
        </p>
        <p className="leading-relaxed text-ink-700 dark:text-ink-200">
          我关心的主题包括：写作方法、注意力管理、学习设计、音乐与思考状态。
        </p>
        <p className="leading-relaxed text-ink-700 dark:text-ink-200">
          欢迎通过邮箱联系我：<a href="mailto:hello@example.com">hello@example.com</a>
        </p>
        <div className="rounded-2xl border border-ink-200/70 bg-white/65 p-5 dark:border-ink-700 dark:bg-ink-900/70">
          <p className="text-sm text-ink-600 dark:text-ink-300">社交链接：{siteConfig.social.map((s) => s.label).join(" / ")}</p>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-ink-200/70 dark:border-ink-700">
          <Image
            src="/images/shared/about-portrait.svg"
            alt="about visual"
            width={1000}
            height={1200}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 420px"
          />
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400">可替换为个人照片、工作空间、手稿或收藏视觉。</p>
      </aside>
    </div>
  );
}
