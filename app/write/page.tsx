import { WriterStudio } from "@/components/write/writer-studio";
import { SectionTitle } from "@/components/ui/section-title";
import { getCollection } from "@/lib/content";
import type { WriterEditableEntry } from "@/types/content";

function mapToEditable(
  collection: "notes" | "friends" | "essays",
  publishToWechat: boolean
): WriterEditableEntry[] {
  const options =
    collection === "friends"
      ? { includeDrafts: true, includeFriends: true }
      : { includeDrafts: true };
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

export default function WritePage() {
  const notes = mapToEditable("notes", true);
  const essays = mapToEditable("essays", false);
  const friends = mapToEditable("friends", false);
  const entries = [...notes, ...essays, ...friends].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Writer"
        title="写作台"
        description="支持发布、修改、删除、本地图片上传和基础格式工具。"
      />
      <WriterStudio initialEntries={entries} />
    </div>
  );
}
