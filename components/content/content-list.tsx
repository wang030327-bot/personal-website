import type { ContentEntry } from "@/types/content";
import { PostCard } from "@/components/content/post-card";

type ContentListProps = {
  items: ContentEntry[];
  hrefPrefix: "/notes" | "/essays";
  showReadingTime?: boolean;
};

export function ContentList({ items, hrefPrefix, showReadingTime = false }: ContentListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <PostCard key={item.slug} post={item} hrefPrefix={hrefPrefix} showReadingTime={showReadingTime} />
      ))}
    </div>
  );
}
