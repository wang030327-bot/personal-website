import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { ArticleHeader } from "@/components/content/article-header";
import { EngagementPanel } from "@/components/content/engagement-panel";
import { Prose } from "@/components/content/prose";
import { TOC } from "@/components/content/toc";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCollection, getContentBySlug } from "@/lib/content";
import { mdxComponents } from "@/lib/mdx-components";
import { siteConfig } from "@/lib/site-config";

type EssayPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getCollection("essays").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getContentBySlug("essays", slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary
  };
}

export default async function EssayDetailPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const post = getContentBySlug("essays", slug);

  if (!post) {
    notFound();
  }

  const isAdmin = await isAdminAuthenticated();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,250px]">
      <article className="space-y-8 rounded-2xl border border-ink-200/70 bg-white/80 p-6 dark:border-ink-700 dark:bg-ink-900 md:p-8">
        <ArticleHeader
          title={post.title}
          summary={post.summary}
          date={post.date}
          tags={post.tags}
          cover={post.cover}
          readingTime={post.readingTime}
        />
        <Prose>
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { properties: { className: ["anchor"] } }]]
              }
            }}
          />
        </Prose>

        {isAdmin ? (
          <div className="flex flex-wrap gap-3 border-t border-ink-200/80 pt-6 text-sm dark:border-ink-700">
            <Link
              href={`/write?collection=essays&slug=${encodeURIComponent(post.slug)}`}
              className="rounded-full border border-ink-300 px-4 py-2 text-ink-700 dark:border-ink-700 dark:text-ink-200"
            >
              编辑本文
            </Link>
            <a
              href={siteConfig.publishing.wechatEditorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-accent-500/40 px-4 py-2 text-accent-700 dark:border-accent-200/40 dark:text-accent-100"
            >
              发布到公众号
            </a>
            {siteConfig.publishing.republishTargets.map((target) => (
              <a
                key={target.label}
                href={target.href}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-ink-300 px-4 py-2 text-ink-700 dark:border-ink-700 dark:text-ink-200"
              >
                转载到 {target.label}
              </a>
            ))}
          </div>
        ) : null}

        <EngagementPanel postId={`essays:${post.slug}`} />
      </article>
      <TOC items={post.toc} />
    </div>
  );
}

