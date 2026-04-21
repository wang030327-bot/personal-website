import { ImageFigure } from "@/components/content/image-figure";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/utils";

type ArticleHeaderProps = {
  title: string;
  summary: string;
  date: string;
  tags: string[];
  cover?: string;
  readingTime?: string;
};

export function ArticleHeader({ title, summary, date, tags, cover, readingTime }: ArticleHeaderProps) {
  return (
    <header className="space-y-6 border-b border-ink-200/70 pb-10 dark:border-ink-800">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500 dark:text-ink-400">
          <time>{formatDate(date)}</time>
          {readingTime ? <span>{readingTime}</span> : null}
        </div>
        <h1 className="max-w-3xl font-serif text-4xl leading-tight text-ink-900 dark:text-ink-50 md:text-5xl">{title}</h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-700 dark:text-ink-200">{summary}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
      {cover ? <ImageFigure src={cover} alt={title} caption="题图" priority /> : null}
    </header>
  );
}
