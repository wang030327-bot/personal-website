import Link from "next/link";

import { isAdminAuthenticated } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export async function Hero() {
  const isAdmin = await isAdminAuthenticated();

  return (
    <section className="space-y-5 border-b border-ink-200/70 pb-8 dark:border-neutral-800">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Hi, I&apos;m {siteConfig.author}</p>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{siteConfig.title}</h1>
      <p className="max-w-3xl text-base leading-7 text-neutral-700 dark:text-neutral-300">{siteConfig.intro}</p>
      <p className="text-sm italic text-neutral-500 dark:text-neutral-400">写作是整理自己的一种方式。</p>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {isAdmin ? (
          <Link
            href="/write"
            className="rounded-full border border-neutral-300 px-3 py-1.5 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            进入写作台
          </Link>
        ) : null}
        <Link
          href="/essays"
          className="rounded-full border border-neutral-300 px-3 py-1.5 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
        >
          查看文章
        </Link>
        <Link
          href="/thoughts"
          className="rounded-full border border-neutral-300 px-3 py-1.5 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
        >
          今日所想
        </Link>
        <Link
          href="/music"
          className="rounded-full border border-neutral-300 px-3 py-1.5 hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
        >
          今日音乐
        </Link>
      </div>
    </section>
  );
}

