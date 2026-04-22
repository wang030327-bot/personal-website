"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/auth";
import { extractNeteaseSongId, normalizeNeteaseUrl, readMusicRecommendations, writeMusicRecommendations } from "@/lib/music";
import type { MusicInput } from "@/types/content";

type RecommendMusicInput = {
  neteaseUrl: string;
  recommendation?: string;
  date?: string;
  setAsToday: boolean;
};

type RecommendMusicResult = {
  ok: boolean;
  message: string;
};

function isReadonlyRuntime() {
  if (process.env.SITE_ENABLE_RUNTIME_WRITE === "true") {
    return false;
  }
  return process.env.NETLIFY === "true" || process.env.NODE_ENV === "production";
}

export async function recommendMusicFromUrl(input: RecommendMusicInput): Promise<RecommendMusicResult> {
  const isAdmin = await isAdminAuthenticated();
  if (!isAdmin) {
    return { ok: false, message: "仅管理员可推荐音乐，请先登录。" };
  }

  if (isReadonlyRuntime()) {
    return { ok: false, message: "Netlify 在线环境为只读，建议本地推荐后推送仓库部署。" };
  }

  const neteaseUrl = normalizeNeteaseUrl(input.neteaseUrl ?? "");
  const songId = extractNeteaseSongId(neteaseUrl);
  if (!songId) {
    return { ok: false, message: "链接无效，请粘贴网易云歌曲链接（包含 song id）。" };
  }

  const date = (input.date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const recommendation = input.recommendation?.trim() ?? "";

  const items = readMusicRecommendations();
  const withTodayReset = input.setAsToday ? items.map((item) => ({ ...item, isToday: false })) : items;
  const normalizedIdUrl = normalizeNeteaseUrl(neteaseUrl);

  const existingIndex = withTodayReset.findIndex(
    (item) => normalizeNeteaseUrl(item.neteaseUrl) === normalizedIdUrl && (item.date?.slice(0, 10) ?? date) === date
  );

  const nextItem: MusicInput = {
    neteaseUrl: normalizedIdUrl,
    date,
    ...(recommendation ? { recommendation } : {}),
    ...(input.setAsToday ? { isToday: true } : {})
  };

  let nextEntries: MusicInput[];
  if (existingIndex >= 0) {
    const current = withTodayReset[existingIndex];
    const merged: MusicInput = {
      ...current,
      ...nextItem,
      ...(input.setAsToday ? { isToday: true } : {})
    };
    nextEntries = [merged, ...withTodayReset.filter((_, index) => index !== existingIndex)];
  } else {
    nextEntries = [nextItem, ...withTodayReset];
  }

  try {
    writeMusicRecommendations(nextEntries);
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/music");

    return { ok: true, message: input.setAsToday ? "今日推荐音乐已更新。" : "音乐推荐已新增。" };
  } catch {
    return { ok: false, message: "当前部署环境为只读，无法在线写入。请本地修改后推送部署。" };
  }
}
