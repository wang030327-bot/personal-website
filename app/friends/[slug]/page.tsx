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
import { getContentBySlug } from "@/lib/content";
import { mdxComponents } from "@/lib/mdx-components";

type FriendDocPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: FriendDocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getContentBySlug("friends", slug, { includeFriends: true });

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary
  };
}

export default async function FriendDocDetailPage({ params }: FriendDocPageProps) {
  const { slug } = await params;
  const post = getContentBySlug("friends", slug, { includeFriends: true });

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-ink-200/70 bg-white/80 p-6 dark:border-ink-700 dark:bg-ink-900 md:p-8">
      <ArticleHeader title={post.title} summary={post.summary} date={post.date} tags={post.tags} cover={post.cover} />
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

      <div className="border-t border-ink-200/80 pt-6 text-sm dark:border-ink-700">
        <Link
          href={`/write?collection=friends&slug=${encodeURIComponent(post.slug)}`}
          className="rounded-full border border-ink-300 px-4 py-2 text-ink-700 dark:border-ink-700 dark:text-ink-200"
        >
          编辑本文
        </Link>
      </div>

      <EngagementPanel postId={`friends:${post.slug}`} />
    </article>
  );
}
