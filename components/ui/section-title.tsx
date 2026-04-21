import type { ReactNode } from "react";

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function SectionTitle({ eyebrow, title, description, actions }: SectionTitleProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs text-neutral-500 dark:text-neutral-400">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
