"use server";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { WriterCollection } from "@/types/content";

type PublishInput = {
  title: string;
  summary: string;
  tags: string;
  genre: string;
  cover: string;
  date: string;
  content: string;
  publishToWechat: boolean;
};

type PublishResult = {
  ok: boolean;
  collection?: WriterCollection;
  slug?: string;
  message: string;
};

type UpdateInput = PublishInput & {
  originalCollection: WriterCollection;
  originalSlug: string;
};

type DeleteInput = {
  collection: WriterCollection;
  slug: string;
};

type DeleteResult = {
  ok: boolean;
  message: string;
};

type UploadResult = {
  ok: boolean;
  path?: string;
  message: string;
};

function isReadonlyRuntime() {
  if (process.env.SITE_ENABLE_RUNTIME_WRITE === "true") {
    return false;
  }
  return process.env.NETLIFY === "true" || process.env.NODE_ENV === "production";
}

function readonlyRuntimeMessage() {
  return "当前为 Netlify 在线环境，文件系统只读。请在本地写作后提交仓库完成更新。";
}

async function ensureAdminAccess() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { ok: false, message: "仅管理员可执行写作与发布操作，请先登录。" };
  }
  return { ok: true, message: "" };
}

function toSafeYamlString(value: string) {
  return JSON.stringify(value ?? "");
}

function createUrlSafeSlug(title: string) {
  const normalized = slugify(title);
  const asciiOnly = normalized
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (asciiOnly.length > 0) {
    return asciiOnly;
  }

  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `post-${stamp}`;
}

function parseTags(tagsInput: string) {
  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return tags.length > 0 ? tags : ["未分类"];
}

function buildMdxDocument(input: {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  genre: string;
  cover: string;
  content: string;
  publishToWechat: boolean;
  slug: string;
}) {
  const tagsYaml = input.tags.map((tag) => `  - ${toSafeYamlString(tag)}`).join("\n");
  const visibility = input.publishToWechat ? "public" : "friends";
  const body = input.content.trim().length > 0 ? input.content.trim() : "在这里开始写作...";

  return `---
title: ${toSafeYamlString(input.title)}
date: ${toSafeYamlString(input.date)}
summary: ${toSafeYamlString(input.summary)}
tags:
${tagsYaml}
genre: ${toSafeYamlString(input.genre)}
cover: ${toSafeYamlString(input.cover)}
draft: false
featured: false
visibility: ${toSafeYamlString(visibility)}
publishToWechat: ${input.publishToWechat ? "true" : "false"}
slug: ${toSafeYamlString(input.slug)}
---

${body}
`;
}

function getContentDir(collection: WriterCollection) {
  const contentDir = path.join(process.cwd(), "content", collection);
  fs.mkdirSync(contentDir, { recursive: true });
  return contentDir;
}

function findFileBySlug(collection: WriterCollection, slug: string) {
  const contentDir = getContentDir(collection);
  const directPath = path.join(contentDir, `${slug}.mdx`);

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  const candidates = fs.readdirSync(contentDir).filter((file) => file.endsWith(".mdx"));
  for (const fileName of candidates) {
    const filePath = path.join(contentDir, fileName);
    const source = fs.readFileSync(filePath, "utf8");
    const { data } = matter(source);
    if (typeof data.slug === "string" && data.slug.trim() === slug) {
      return filePath;
    }
  }

  return null;
}

function toDetailPath(collection: WriterCollection, slug: string) {
  if (collection === "friends") {
    return `/friends/${slug}`;
  }
  if (collection === "notes") {
    return `/notes/${slug}`;
  }
  return `/essays/${slug}`;
}

function makeUniqueFilePath(collection: WriterCollection, slugBase: string, ignorePath: string | null = null) {
  const contentDir = getContentDir(collection);
  let slug = slugBase;
  let filePath = path.join(contentDir, `${slug}.mdx`);
  let counter = 1;

  while (fs.existsSync(filePath) && filePath !== ignorePath) {
    slug = `${slugBase}-${counter}`;
    filePath = path.join(contentDir, `${slug}.mdx`);
    counter += 1;
  }

  return { slug, filePath };
}

function revalidateWriterRoutes(paths: string[]) {
  const shared = ["/", "/home", "/write", "/notes", "/friends", "/essays", "/thoughts", "/music"];
  for (const route of [...shared, ...paths]) {
    revalidatePath(route);
  }
}

function resolveTargetCollection(input: PublishInput, original?: WriterCollection): WriterCollection {
  if (original === "essays") {
    return "essays";
  }
  return input.publishToWechat ? "notes" : "friends";
}

export async function uploadImageFromWriter(formData: FormData): Promise<UploadResult> {
  const auth = await ensureAdminAccess();
  if (!auth.ok) {
    return auth;
  }

  if (isReadonlyRuntime()) {
    return { ok: false, message: readonlyRuntimeMessage() };
  }

  try {
    const value = formData.get("file");
    if (!(value instanceof File)) {
      return { ok: false, message: "未检测到图片文件。" };
    }

    if (!value.type.startsWith("image/")) {
      return { ok: false, message: "仅支持上传图片文件。" };
    }

    if (value.size > 10 * 1024 * 1024) {
      return { ok: false, message: "图片不能超过 10MB。" };
    }

    const extByMime: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/avif": ".avif",
      "image/svg+xml": ".svg"
    };
    const fallbackExt = path.extname(value.name).toLowerCase() || ".png";
    const ext = extByMime[value.type] ?? fallbackExt;

    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const random = Math.random().toString(36).slice(2, 8);
    const fileName = `writer-${stamp}-${random}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await value.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/images/uploads/${fileName}`;
    return { ok: true, path: publicPath, message: "图片上传成功。" };
  } catch {
    return { ok: false, message: readonlyRuntimeMessage() };
  }
}

export async function publishFromWriter(input: PublishInput): Promise<PublishResult> {
  const auth = await ensureAdminAccess();
  if (!auth.ok) {
    return auth;
  }

  if (isReadonlyRuntime()) {
    return { ok: false, message: readonlyRuntimeMessage() };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, message: "请先填写文章标题后再发布。" };
  }

  try {
    const collection = resolveTargetCollection(input);
    const slugBase = createUrlSafeSlug(title);
    const { slug, filePath } = makeUniqueFilePath(collection, slugBase);
    const tags = parseTags(input.tags);

    const mdx = buildMdxDocument({
      title,
      date: input.date,
      summary: input.summary,
      tags,
      genre: input.genre.trim() || "文章",
      cover: input.cover,
      content: input.content,
      publishToWechat: input.publishToWechat,
      slug
    });

    fs.writeFileSync(filePath, mdx, "utf8");

    const detailPath = toDetailPath(collection, slug);
    revalidateWriterRoutes([detailPath]);

    return {
      ok: true,
      collection,
      slug,
      message: "发布成功。"
    };
  } catch {
    return { ok: false, message: readonlyRuntimeMessage() };
  }
}

export async function updateFromWriter(input: UpdateInput): Promise<PublishResult> {
  const auth = await ensureAdminAccess();
  if (!auth.ok) {
    return auth;
  }

  if (isReadonlyRuntime()) {
    return { ok: false, message: readonlyRuntimeMessage() };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, message: "请先填写文章标题后再保存。" };
  }

  try {
    const sourcePath = findFileBySlug(input.originalCollection, input.originalSlug);
    if (!sourcePath) {
      return { ok: false, message: "未找到原文章文件，请刷新后重试。" };
    }

    const targetCollection = resolveTargetCollection(input, input.originalCollection);
    const safeCurrentSlug =
      /^[a-z0-9-]+$/i.test(input.originalSlug) && input.originalSlug.trim().length > 0
        ? input.originalSlug.trim()
        : createUrlSafeSlug(title);
    const target = makeUniqueFilePath(targetCollection, safeCurrentSlug, sourcePath);
    const tags = parseTags(input.tags);

    const mdx = buildMdxDocument({
      title,
      date: input.date,
      summary: input.summary,
      tags,
      genre: input.genre.trim() || "文章",
      cover: input.cover,
      content: input.content,
      publishToWechat: input.publishToWechat,
      slug: target.slug
    });

    fs.writeFileSync(target.filePath, mdx, "utf8");

    if (sourcePath !== target.filePath && fs.existsSync(sourcePath)) {
      fs.unlinkSync(sourcePath);
    }

    const oldPath = toDetailPath(input.originalCollection, input.originalSlug);
    const nextPath = toDetailPath(targetCollection, target.slug);
    revalidateWriterRoutes([oldPath, nextPath]);

    return {
      ok: true,
      collection: targetCollection,
      slug: target.slug,
      message: "修改已保存。"
    };
  } catch {
    return { ok: false, message: readonlyRuntimeMessage() };
  }
}

export async function deleteFromWriter(input: DeleteInput): Promise<DeleteResult> {
  const auth = await ensureAdminAccess();
  if (!auth.ok) {
    return auth;
  }

  if (isReadonlyRuntime()) {
    return { ok: false, message: readonlyRuntimeMessage() };
  }

  try {
    const filePath = findFileBySlug(input.collection, input.slug);
    if (!filePath) {
      return { ok: false, message: "未找到要删除的文章。" };
    }

    fs.unlinkSync(filePath);
    revalidateWriterRoutes([toDetailPath(input.collection, input.slug)]);

    return { ok: true, message: "文章已删除。" };
  } catch {
    return { ok: false, message: readonlyRuntimeMessage() };
  }
}
