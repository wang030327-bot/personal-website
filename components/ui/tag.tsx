import { cn } from "@/lib/utils";

type TagProps = {
  children: string;
  className?: string;
};

export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-ink-300/80 bg-white/75 px-3 py-1 text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300",
        className
      )}
    >
      {children}
    </span>
  );
}
