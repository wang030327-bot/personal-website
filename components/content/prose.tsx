import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ProseProps = PropsWithChildren<{
  className?: string;
}>;

export function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        "prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-ink-900 prose-p:text-ink-700 prose-p:leading-relaxed prose-strong:text-ink-900 prose-li:text-ink-700 prose-code:text-[0.92em] prose-pre:rounded-2xl prose-pre:bg-ink-900 prose-pre:text-ink-50 prose-img:rounded-2xl dark:prose-invert dark:prose-headings:text-ink-50 dark:prose-p:text-ink-200 dark:prose-li:text-ink-200 dark:prose-strong:text-ink-50",
        className
      )}
    >
      {children}
    </div>
  );
}
