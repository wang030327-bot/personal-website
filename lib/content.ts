import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import getReadingTime from "reading-time";

import { slugify } from "@/lib/utils";
import type { CollectionType, ContentEntry, TocItem } from "@/types/content";

const contentRoot = path.join(process.cwd(), "content");

type CollectionOptions = {
  includeDrafts?: boolean;
  includeFriends?: boolean;
};

function getCollectionDir(type: CollectionType) {
  return path.join(contentRoot, type);
}

function extractToc(content: string): TocItem[] {
  const headingPattern = /^(##|###)\s+(.+)$/gm;
  const headings: TocItem[] = [];

  let match = headingPattern.exec(content);
  while (match) {
    const level = match[1] === "##" ? 2 : 3;
    const text = match[2]
      .replace(/[`*_]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();

    headings.push({
      id: slugify(text),
      text,
      level
    });

    match = headingPattern.exec(content);
  }

  return headings;
}

function defaultGenreByCollection(type: CollectionType) {
  if (type === "notes") {
    return "随笔";
  }
  if (type === "friends") {
    return "评论";
  }
  return "文章";
}

function parseEntry(type: CollectionType, fileName: string): ContentEntry {
  const filePath = path.join(getCollectionDir(type), fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const fileSlug = fileName.replace(/\.mdx?$/, "");
  const slug = typeof data.slug === "string" && data.slug.length > 0 ? data.slug : fileSlug;

  return {
    title: typeof data.title === "string" && data.title.length > 0 ? data.title : "未命名文章",
    date: typeof data.date === "string" && data.date.length > 0 ? data.date : new Date().toISOString(),
    summary: typeof data.summary === "string" ? data.summary : "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    genre: typeof data.genre === "string" && data.genre.length > 0 ? data.genre : defaultGenreByCollection(type),
    cover: data.cover,
    images: Array.isArray(data.images) ? data.images : [],
    draft: Boolean(data.draft),
    featured: Boolean(data.featured),
    visibility: data.visibility === "friends" ? "friends" : "public",
    publishToWechat: Boolean(data.publishToWechat),
    slug,
    type,
    content,
    toc: extractToc(content),
    readingTime:
      typeof data.readingTime === "string" && data.readingTime.length > 0 ? data.readingTime : getReadingTime(content).text
  };
}

export function getCollection(type: CollectionType, options: CollectionOptions = {}) {
  const { includeDrafts = false, includeFriends = false } = options;
  const dir = getCollectionDir(type);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => parseEntry(type, file))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return entries.filter((entry) => {
    if (!includeDrafts && entry.draft) {
      return false;
    }
    if (!includeFriends && entry.visibility === "friends") {
      return false;
    }
    return true;
  });
}

export function getContentBySlug(type: CollectionType, slug: string, options: CollectionOptions = {}) {
  return getCollection(type, options).find((entry) => entry.slug === slug) ?? null;
}

export function getLatest(type: CollectionType, limit = 3, options: CollectionOptions = {}) {
  return getCollection(type, options).slice(0, limit);
}

export function getFeatured(type: CollectionType, limit = 3, options: CollectionOptions = {}) {
  return getCollection(type, options)
    .filter((entry) => entry.featured)
    .slice(0, limit);
}

