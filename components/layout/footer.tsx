import Link from "next/link";

import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200/70 bg-ink-50/70 dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-600 md:px-6 dark:text-neutral-400">
        <p>{siteConfig.title}</p>
        <div className="flex items-center gap-3">
          {siteConfig.social.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              className="hover:text-ink-900 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
