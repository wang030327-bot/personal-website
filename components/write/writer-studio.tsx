"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { deleteFromWriter, publishFromWriter, updateFromWriter, uploadImageFromWriter } from "@/app/write/actions";
import { siteConfig } from "@/lib/site-config";
import type { WriterCollection, WriterEditableEntry } from "@/types/content";

type WriterStudioProps = {
  initialEntries: WriterEditableEntry[];
};

type EditingTarget = {
  collection: WriterCollection;
  slug: string;
};

const genreOptions = ["文章", "随笔", "评论", "今日所想"];
const tagSuggestions = ["理论见解", "历史思考", "方法论", "思想笔记", "阅读札记", "政治经济", "社会观察", "学术讨论"];

function sortEntries(entries: WriterEditableEntry[]) {
  return [...entries].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

function buildPreviewSlug(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug.length > 0 ? slug : "new-post";
}

function buildMdxDocument(input: {
  title: string;
  date: string;
  summary: string;
  tags: string;
  genre: string;
  cover: string;
  content: string;
  publishToWechat: boolean;
  editingSlug?: string;
}) {
  const tagsArray = input.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const tagsYaml = tagsArray.length ? tagsArray.map((tag) => `  - ${JSON.stringify(tag)}`).join("\n") : '  - "未分类"';
  const visibility = input.publishToWechat ? "public" : "friends";
  const slug = input.editingSlug ?? buildPreviewSlug(input.title);

  return `---
title: ${JSON.stringify(input.title || "未命名文章")}
date: ${JSON.stringify(input.date)}
summary: ${JSON.stringify(input.summary || "")}
tags:
${tagsYaml}
genre: ${JSON.stringify(input.genre || "文章")}
cover: ${JSON.stringify(input.cover || "")}
draft: false
featured: false
visibility: ${JSON.stringify(visibility)}
publishToWechat: ${input.publishToWechat ? "true" : "false"}
slug: ${JSON.stringify(slug)}
---

${input.content || "在这里开始写作..."}
`;
}

function toEditorPath(collection: WriterCollection, slug: string) {
  if (collection === "friends") {
    return `/friends/${slug}`;
  }
  if (collection === "notes") {
    return `/notes/${slug}`;
  }
  return `/essays/${slug}`;
}

function entryKey(collection: WriterCollection, slug: string) {
  return `${collection}:${slug}`;
}

function normalizeDate(date: string) {
  return date.slice(0, 10);
}

function mergeTag(tagsText: string, nextTag: string) {
  const current = tagsText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (current.includes(nextTag)) {
    return tagsText;
  }

  return [...current, nextTag].join(", ");
}

export function WriterStudio({ initialEntries }: WriterStudioProps) {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [entries, setEntries] = useState(() => sortEntries(initialEntries));
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("写作, 随笔");
  const [genre, setGenre] = useState("文章");
  const [cover, setCover] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("# 标题\n\n在这里开始写作你的正文。\n\n## 小标题\n\n继续写...");
  const [publishToWechat, setPublishToWechat] = useState(false);

  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  const [copied, setCopied] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishedPath, setPublishedPath] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isEditing = Boolean(editingTarget);
  const activeKey = editingTarget ? entryKey(editingTarget.collection, editingTarget.slug) : "";

  const mdxDoc = useMemo(
    () =>
      buildMdxDocument({
        title,
        date,
        summary,
        tags,
        genre,
        cover,
        content,
        publishToWechat,
        editingSlug: editingTarget?.slug
      }),
    [title, date, summary, tags, genre, cover, content, publishToWechat, editingTarget?.slug]
  );

  function resetForm() {
    setEditingTarget(null);
    setTitle("");
    setSummary("");
    setTags("写作, 随笔");
    setGenre("文章");
    setCover("");
    setDate(new Date().toISOString().slice(0, 10));
    setContent("# 标题\n\n在这里开始写作你的正文。\n\n## 小标题\n\n继续写...");
    setPublishToWechat(false);
    setImageAlt("");
    setImageCaption("");
    setPublishMessage("");
    setPublishedPath("");
  }

  function loadEntry(entry: WriterEditableEntry) {
    setEditingTarget({ collection: entry.collection, slug: entry.slug });
    setTitle(entry.title);
    setSummary(entry.summary ?? "");
    setTags(entry.tags.join(", "));
    setGenre(entry.genre || "文章");
    setCover(entry.cover ?? "");
    setDate(normalizeDate(entry.date));
    setContent(entry.content ?? "");
    setPublishToWechat(entry.collection === "notes");
    setPublishMessage("");
    setPublishedPath(toEditorPath(entry.collection, entry.slug));
  }

  useEffect(() => {
    const collection = searchParams.get("collection");
    const slug = searchParams.get("slug");
    if (!collection || !slug) {
      return;
    }
    if (collection !== "notes" && collection !== "friends" && collection !== "essays") {
      return;
    }

    const nextKey = entryKey(collection, slug);
    if (nextKey === activeKey) {
      return;
    }

    const matched = entries.find((item) => entryKey(item.collection, item.slug) === nextKey);
    if (matched) {
      loadEntry(matched);
    }
  }, [activeKey, entries, searchParams]);

  function updateContentAtSelection(nextText: string, nextCursorStart: number, nextCursorEnd: number) {
    const el = editorRef.current;
    setContent(nextText);
    if (!el) {
      return;
    }
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextCursorStart, nextCursorEnd);
    });
  }

  function wrapSelection(prefix: string, suffix: string, fallback: string) {
    const el = editorRef.current;
    if (!el) {
      setContent((prev) => `${prev}${prefix}${fallback}${suffix}`);
      return;
    }

    const value = el.value;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end) || fallback;
    const inserted = `${prefix}${selected}${suffix}`;
    const nextText = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
    const cursorStart = start + prefix.length;
    const cursorEnd = cursorStart + selected.length;
    updateContentAtSelection(nextText, cursorStart, cursorEnd);
  }

  function insertAtCursor(snippet: string) {
    const el = editorRef.current;
    if (!el) {
      setContent((prev) => `${prev}${snippet}`);
      return;
    }

    const value = el.value;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const nextText = `${value.slice(0, start)}${snippet}${value.slice(end)}`;
    const cursor = start + snippet.length;
    updateContentAtSelection(nextText, cursor, cursor);
  }

  async function handleImagePicked(file: File | null) {
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    setPublishMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageFromWriter(formData);

      if (!result.ok || !result.path) {
        setPublishMessage(result.message);
        return;
      }

      const alt = imageAlt.trim() || file.name.replace(/\.[^.]+$/, "") || "图片";
      const caption = imageCaption.trim();
      const snippet = caption
        ? `\n![${alt}](${result.path})\n\n*${caption}*\n`
        : `\n![${alt}](${result.path})\n`;
      insertAtCursor(snippet);
      setPublishMessage("图片已上传并插入正文。");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function upsertEntry(collection: WriterCollection, slug: string) {
    const nextEntry: WriterEditableEntry = {
      collection,
      slug,
      title,
      summary,
      date,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      genre,
      cover,
      content,
      publishToWechat: collection === "notes"
    };

    setEntries((prev) => {
      const currentKey = editingTarget ? entryKey(editingTarget.collection, editingTarget.slug) : null;
      const nextKey = entryKey(collection, slug);
      const filtered = prev.filter((item) => {
        const key = entryKey(item.collection, item.slug);
        if (currentKey && key === currentKey) {
          return false;
        }
        return key !== nextKey;
      });
      return sortEntries([nextEntry, ...filtered]);
    });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(mdxDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const blob = new Blob([mdxDoc], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title ? buildPreviewSlug(title) : "new-post"}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSave() {
    setPublishMessage("");
    setPublishedPath("");

    startTransition(async () => {
      const payload = {
        title,
        summary,
        tags,
        genre,
        cover,
        date,
        content,
        publishToWechat
      };

      const result = editingTarget
        ? await updateFromWriter({
            originalCollection: editingTarget.collection,
            originalSlug: editingTarget.slug,
            ...payload
          })
        : await publishFromWriter(payload);

      setPublishMessage(result.message);
      if (result.ok && result.collection && result.slug) {
        const nextPath = toEditorPath(result.collection, result.slug);
        setPublishedPath(nextPath);
        setEditingTarget({ collection: result.collection, slug: result.slug });
        upsertEntry(result.collection, result.slug);
      }
    });
  }

  function handleDelete() {
    if (!editingTarget) {
      return;
    }

    const shouldDelete = window.confirm("确认删除这篇文章？删除后不可恢复。");
    if (!shouldDelete) {
      return;
    }

    setPublishMessage("");
    setPublishedPath("");

    startTransition(async () => {
      const result = await deleteFromWriter(editingTarget);
      setPublishMessage(result.message);

      if (result.ok) {
        setEntries((prev) =>
          prev.filter((item) => entryKey(item.collection, item.slug) !== entryKey(editingTarget.collection, editingTarget.slug))
        );
        resetForm();
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <section className="min-w-0 space-y-4 rounded-xl border border-ink-200/70 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{isEditing ? "编辑文章" : "写作编辑区"}</h2>
          {isEditing ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              新建文章
            </button>
          ) : null}
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950">
          <input
            type="checkbox"
            checked={publishToWechat}
            onChange={(e) => setPublishToWechat(e.target.checked)}
            className="h-4 w-4"
          />
          同步到公众号（同时站内公开）
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
          />
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
          >
            {genreOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="摘要（导语）"
          rows={3}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签，逗号分隔"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tagSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTags((prev) => mergeTag(prev, tag))}
              className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              {tag}
            </button>
          ))}
        </div>

        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="题图路径，例如 /images/uploads/cover.jpg"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
        />

        <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">格式工具（先选中文本再点击）</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => wrapSelection("**", "**", "加粗文本")}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              加粗
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('<span style="font-size:1.15em;font-weight:700;">', "</span>", "强调文字")}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              大字号
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor("\n## 小标题\n")}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor("\n### 小标题\n")}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor("\n> 引用内容\n")}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              引用
            </button>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">图片（本地上传，类似微信电脑版）</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="图片替代文本（alt）"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-200"
            />
            <input
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="图片说明（caption）"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-200"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              void handleImagePicked(file);
            }}
          />
          <button
            type="button"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="w-fit rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            {isUploadingImage ? "上传中..." : "添加图片"}
          </button>
        </div>

        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm leading-7 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            {isPending ? "处理中..." : isEditing ? "保存修改" : "发布"}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:text-red-300"
            >
              删除文章
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            {copied ? "已复制" : "复制为 MDX"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            下载草稿 .mdx
          </button>
          {publishToWechat ? (
            <a
              href={siteConfig.publishing.wechatEditorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              打开公众号后台
            </a>
          ) : null}
        </div>

        {publishMessage ? <p className="text-sm text-neutral-700 dark:text-neutral-300">{publishMessage}</p> : null}
        {publishedPath ? (
          <p className="text-sm">
            当前文章链接：
            <Link href={publishedPath} className="underline underline-offset-4">
              {publishedPath}
            </Link>
          </p>
        ) : null}
      </section>

      <aside className="min-w-0 space-y-4 rounded-xl border border-ink-200/70 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">文章列表</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">点击任意条目即可直接编辑。</p>
          <div className="max-h-72 space-y-2 overflow-auto pr-1">
            {entries.map((entry) => {
              const key = entryKey(entry.collection, entry.slug);
              const isActive = key === activeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => loadEntry(entry)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    isActive
                      ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800"
                      : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                  }`}
                >
                  <p className="line-clamp-1 text-sm font-medium">{entry.title}</p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.genre || "文章"} · {entry.date.slice(0, 10)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <h3 className="text-lg font-semibold">转载入口</h3>
        <div className="flex flex-wrap gap-2">
          {siteConfig.publishing.republishTargets.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
            >
              {item.label}
            </a>
          ))}
        </div>

        <h3 className="pt-1 text-lg font-semibold">MDX 预览文本</h3>
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs leading-6 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
{mdxDoc}
        </pre>
      </aside>
    </div>
  );
}
