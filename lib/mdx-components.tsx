import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  HTMLAttributes
} from "react";

import { ImageFigure } from "@/components/content/image-figure";
import { cn } from "@/lib/utils";

type MdxImageProps = {
  src?: string;
  alt?: string;
  title?: string;
};

export const mdxComponents = {
  h2: ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn("mt-14 scroll-mt-24 font-serif text-3xl leading-tight text-ink-900 dark:text-ink-50", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn("mt-10 scroll-mt-24 text-xl font-semibold text-ink-900 dark:text-ink-100", className)}
      {...props}
    />
  ),
  a: ({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const href = props.href ?? "";
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cn("underline decoration-accent-500/45 underline-offset-4", className)}>
          {props.children}
        </Link>
      );
    }

    return (
      <a
        {...props}
        target="_blank"
        rel="noreferrer"
        className={cn("underline decoration-accent-500/45 underline-offset-4", className)}
      />
    );
  },
  img: (props: MdxImageProps) => (
    <ImageFigure
      src={props.src ?? ""}
      alt={props.alt ?? "文章插图"}
      caption={typeof props.title === "string" ? props.title : undefined}
    />
  ),
  blockquote: ({ className, ...props }: BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "border-l-2 border-accent-500/45 pl-5 text-base italic text-ink-700 dark:border-accent-200/50 dark:text-ink-200",
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
    <code className={cn("rounded bg-ink-100 px-1 py-0.5 text-sm dark:bg-ink-800", className)} {...props} />
  )
};
