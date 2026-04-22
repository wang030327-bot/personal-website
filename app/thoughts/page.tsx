import Link from "next/link";

import { SectionTitle } from "@/components/ui/section-title";
import { Tag } from "@/components/ui/tag";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCollection } from "@/lib/content";
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

export default async function ThoughtsPage() {
  const isAdmin = await isAdminAuthenticated();
  const all = [...getCollection("essays"), ...getCollection("notes"), ...getCollection("friends")].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const thoughts = all.filter((item) => item.genre === "今日所想");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <SectionTitle
        eyebrow="Today Thought"
        title="今日所想"
        description="当天的片段想法、情绪观察与短记录。"
        actions={
          isAdmin ? (
            <Link href="/write" className="text-sm text-accent-700 underline underline-offset-4 dark:text-accent-100">
              写一条今日所想
            </Link>
          ) : undefined
        }
      />

      {thoughts.length === 0 ? (
        <div className="rounded-xl border border-ink-200/70 bg-white/80 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
          暂无内容。
        </div>
      ) : (
        <div className="divide-y divide-ink-200/70 border-y border-ink-200/70 dark:divide-neutral-800 dark:border-neutral-800">
          {thoughts.map((post) => (
            <article key={`${post.type}:${post.slug}`} className="space-y-2 py-5">
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <time>{formatDate(post.date)}</time>
                <Tag>今日所想</Tag>
              </div>
              <h3 className="text-lg font-medium leading-7">
                <Link href={toHref(post.type, post.slug)} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="text-sm leading-7 text-neutral-700 dark:text-neutral-300">{post.summary}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

