import { Suspense } from "react";
import { redirect } from "next/navigation";

import { WriterStudio } from "@/components/write/writer-studio";
import { SectionTitle } from "@/components/ui/section-title";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCollection } from "@/lib/content";
import type { WriterEditableEntry } from "@/types/content";

function mapToEditable(collection: "notes" | "friends" | "essays", publishToWechat: boolean): WriterEditableEntry[] {
  const options = collection === "friends" ? { includeDrafts: true, includeFriends: true } : { includeDrafts: true };
  const items = getCollection(collection, options);
  return items.map((entry) => ({
    collection,
    slug: entry.slug,
    title: entry.title,
    date: entry.date,
    summary: entry.summary,
    tags: entry.tags,
    genre: entry.genre ?? "文章",
    cover: entry.cover,
    content: entry.content,
    publishToWechat
  }));
}

export default async function WritePage() {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    redirect("/login?next=/write");
  }

  const notes = mapToEditable("notes", true);
  const essays = mapToEditable("essays", false);
  const friends = mapToEditable("friends", false);
  const entries = [...notes, ...essays, ...friends].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Writer"
        title="写作台"
        description="仅管理员可用：支持发布、修改、删除、本地图片上传和基础格式工具。"
      />
      <Suspense fallback={<div>加载中...</div>}>
        <WriterStudio initialEntries={entries} />
      </Suspense>
    </div>
  );
}

