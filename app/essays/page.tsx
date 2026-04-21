import Link from "next/link";

import { SectionTitle } from "@/components/ui/section-title";
import { Tag } from "@/components/ui/tag";
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

export default function EssaysPage() {
  const essays = getCollection("essays");
  const notes = getCollection("notes");
  const friends = getCollection("friends", { includeFriends: true });
  const all = [...essays, ...notes, ...friends]
    .filter((item) => item.genre !== "今日所想")
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <SectionTitle
        eyebrow="Writings"
        title="文章"
        description="这里展示文章、随笔、评论等写作内容。"
        actions={
          <Link href="/write" className="text-sm text-accent-700 underline underline-offset-4 dark:text-accent-100">
            写新文章
          </Link>
        }
      />

      <div className="divide-y divide-ink-200/70 border-y border-ink-200/70 dark:divide-neutral-800 dark:border-neutral-800">
        {all.map((post) => (
          <article key={`${post.type}:${post.slug}`} className="space-y-2 py-5">
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <time>{formatDate(post.date)}</time>
              <span>{post.readingTime}</span>
              <Tag>{post.genre ?? "文章"}</Tag>
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
    </div>
  );
}
