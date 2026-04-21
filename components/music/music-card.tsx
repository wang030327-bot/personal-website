import Image from "next/image";
import Link from "next/link";

import type { MusicEntry } from "@/types/content";
import { formatDate } from "@/lib/utils";

type MusicCardProps = {
  item: MusicEntry;
  compact?: boolean;
};

export function MusicCard({ item, compact = false }: MusicCardProps) {
  return (
    <article className="border-y border-neutral-200 py-4 dark:border-neutral-800">
      <div className={compact ? "grid grid-cols-[74px,1fr] gap-3" : "grid gap-4 md:grid-cols-[120px,1fr]"}>
        <Image
          src={item.cover}
          alt={`${item.title} cover`}
          width={360}
          height={360}
          className="h-full w-full rounded-md object-cover"
          sizes={compact ? "74px" : "120px"}
        />
        <div className="space-y-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(item.date)}</p>
          <h3 className="text-base font-medium">{item.title}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{item.artist}</p>
          <p className="text-sm leading-7 text-neutral-700 dark:text-neutral-300">{item.recommendation}</p>
          <Link href={item.neteaseUrl} target="_blank" rel="noreferrer noopener" className="text-sm underline underline-offset-4">
            去网易云听
          </Link>
        </div>
      </div>
    </article>
  );
}
