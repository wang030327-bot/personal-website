import Link from "next/link";

import { Hero } from "@/components/home/hero";
import { MusicCard } from "@/components/music/music-card";
import { Tag } from "@/components/ui/tag";
import { SectionTitle } from "@/components/ui/section-title";
import { getCollection } from "@/lib/content";
import { getTodayMusic } from "@/lib/music";
import { formatDate } from "@/lib/utils";

function toHref(type: "notes" | "friends" | "essays", slug: string) {
  if (type === "notes") {
    return `/notes/${slug}`;
  }
  if (type === "friends") {
    return `/friends/${slug}`;
  }
  return `/essays/${slug}`;
}

const timeline = ["2026.04：上线个人站，开始稳定更新", "2026.03：整理写作结构与发布流程", "2026.02：建立音乐推荐归档"];

export default async function HomePage() {
  const essays = getCollection("essays");
  const notes = getCollection("notes");
  const friends = getCollection("friends", { includeFriends: true });
  const writings = [...essays, ...notes, ...friends].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const thoughtEntries = writings.filter((item) => item.genre === "今日所想");
  const todayThought = thoughtEntries[0] ?? null;
  const articleEntries = writings.filter((item) => item.genre !== "今日所想");
  const todayMusic = await getTodayMusic();

  return (
    <div className="space-y-10">
      <Hero />

      <section className="rounded-2xl border border-ink-200/70 bg-white/80 p-6 dark:border-ink-700 dark:bg-ink-900">
        <SectionTitle eyebrow="Today Thought" title="今日所想" />
        {todayThought ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <time>{formatDate(todayThought.date)}</time>
              <Tag>今日所想</Tag>
            </div>
            <h3 className="text-xl font-medium">
              <Link href={toHref(todayThought.type, todayThought.slug)} className="hover:underline">
                {todayThought.title}
              </Link>
            </h3>
            <p className="text-sm leading-7 text-neutral-700 dark:text-neutral-300">{todayThought.summary}</p>
          </div>
        ) : (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">还没有“今日所想”，去写作台选择体裁“今日所想”发布即可。</p>
        )}
      </section>

      <section>
        <SectionTitle
          eyebrow="Writings"
          title="最新文章"
          actions={
            <Link href="/essays" className="text-sm underline underline-offset-4">
              查看全部
            </Link>
          }
        />
        <ul className="space-y-3 text-sm leading-7">
          {articleEntries.slice(0, 6).map((item) => (
            <li key={`${item.type}:${item.slug}`} className="flex items-start justify-between gap-3 border-b border-ink-200/70 pb-2 dark:border-neutral-800">
              <div className="space-y-1">
                <Link href={toHref(item.type, item.slug)} className="hover:underline">
                  {item.title}
                </Link>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  <Tag>{item.genre ?? "文章"}</Tag>
                </div>
              </div>
              <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">{formatDate(item.date)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle
          eyebrow="Today Music"
          title="今日推荐音乐"
          actions={
            <Link href="/music" className="text-sm underline underline-offset-4">
              查看归档
            </Link>
          }
        />
        {todayMusic ? <MusicCard item={todayMusic} compact /> : null}
      </section>

      <section className="space-y-3 border-t border-ink-200/70 pt-6 dark:border-neutral-800">
        <SectionTitle eyebrow="Timeline" title="更新记录" />
        <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          {timeline.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
