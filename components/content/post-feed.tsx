import Image from "next/image";
import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import type { ContentEntry } from "@/types/content";
import { formatDate } from "@/lib/utils";

type PostFeedProps = {
  items: ContentEntry[];
  hrefPrefix: "/notes" | "/essays" | "/friends";
  showReadingTime?: boolean;
};

export function PostFeed({ items, hrefPrefix, showReadingTime = false }: PostFeedProps) {
  return (
    <div className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {items.map((post) => (
        <article key={post.slug} className="py-5">
          <div className="grid gap-3 sm:grid-cols-[1fr,140px] sm:items-start">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <time>{formatDate(post.date)}</time>
                {showReadingTime ? <span>{post.readingTime}</span> : null}
              </div>
              <h3 className="text-lg font-medium leading-7">
                <Link href={`${hrefPrefix}/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="text-sm leading-7 text-neutral-700 dark:text-neutral-300">{post.summary}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>

            {post.cover ? (
              <Link href={`${hrefPrefix}/${post.slug}`} className="block overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800">
                <Image
                  src={post.cover}
                  alt={post.title}
                  width={320}
                  height={220}
                  className="h-20 w-full object-cover"
                  sizes="(max-width: 640px) 100vw, 140px"
                />
              </Link>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
