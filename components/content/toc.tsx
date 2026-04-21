import Link from "next/link";

import type { TocItem } from "@/types/content";
import { cn } from "@/lib/utils";

type TocProps = {
  items: TocItem[];
};

export function TOC({ items }: TocProps) {
  if (!items.length) {
    return null;
  }

  return (
    <aside className="sticky top-24 hidden max-h-[70vh] overflow-auto rounded-2xl border border-ink-200/70 bg-white/65 p-4 dark:border-ink-700 dark:bg-ink-900/65 lg:block">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">目录</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 ? "pl-4" : "")}>
            <Link
              href={`#${item.id}`}
              className="text-sm text-ink-600 transition hover:text-accent-700 dark:text-ink-300 dark:hover:text-accent-100"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
