import Link from "next/link";
import Image from "next/image";

import type { ContentEntry } from "@/types/content";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  post: ContentEntry;
  hrefPrefix: "/notes" | "/essays";
  showReadingTime?: boolean;
};

export function PostCard({ post, hrefPrefix, showReadingTime = false }: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink-200/70 bg-white/70 shadow-soft transition hover:-translate-y-0.5 hover:border-accent-500/40 dark:border-ink-700 dark:bg-ink-900/80">
      {post.cover ? (
        <div className="overflow-hidden border-b border-ink-200/70 dark:border-ink-700">
          <Image
            src={post.cover}
            alt={post.title}
            width={900}
            height={540}
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : null}
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
          <time>{formatDate(post.date)}</time>
          {showReadingTime ? <span>{post.readingTime}</span> : null}
        </div>
        <h3 className="font-serif text-2xl leading-tight text-ink-900 dark:text-ink-50">
          <Link href={`${hrefPrefix}/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{post.summary}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </article>
  );
}
