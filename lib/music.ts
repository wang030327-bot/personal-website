import { cache } from "react";

import { musicRecommendations } from "@/content/music/recommendations";
import type { MusicEntry, MusicInput } from "@/types/content";

const fallbackCovers = [
  "/images/music/today-track.svg",
  "/images/music/archive-1.svg",
  "/images/music/archive-2.svg"
];

type NeteaseMeta = {
  title: string;
  artist: string;
  cover: string;
};

function extractNeteaseSongId(url: string) {
  const idByQuery = url.match(/[?&]id=(\d+)/)?.[1];
  if (idByQuery) {
    return idByQuery;
  }

  const idByPath = url.match(/\/song\/(\d+)/)?.[1];
  if (idByPath) {
    return idByPath;
  }

  return null;
}

function normalizeNeteaseUrl(rawUrl: string) {
  const songId = extractNeteaseSongId(rawUrl);
  if (!songId) {
    return rawUrl;
  }
  return `https://music.163.com/#/song?id=${songId}`;
}

const fetchNeteaseMeta = cache(async (songId: string): Promise<NeteaseMeta | null> => {
  try {
    const c = encodeURIComponent(JSON.stringify([{ id: Number(songId) }]));
    const response = await fetch(`https://music.163.com/api/v3/song/detail?c=${c}`, {
      headers: {
        Referer: "https://music.163.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      },
      next: { revalidate: 60 * 60 * 12 }
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      songs?: Array<{
        name?: string;
        ar?: Array<{ name?: string }>;
        al?: { picUrl?: string };
      }>;
    };

    const song = data.songs?.[0];
    if (!song) {
      return null;
    }

    const artist = song.ar?.map((a) => a.name).filter(Boolean).join(" / ") ?? "网易云歌曲";
    const cover = song.al?.picUrl ?? "";

    return {
      title: song.name ?? `网易云歌曲 #${songId}`,
      artist,
      cover
    };
  } catch {
    return null;
  }
});

function fallbackDate(index: number) {
  const date = new Date();
  date.setDate(date.getDate() - index);
  return date.toISOString().slice(0, 10);
}

async function normalizeEntry(item: MusicInput, index: number): Promise<MusicEntry> {
  const neteaseUrl = normalizeNeteaseUrl(item.neteaseUrl);
  const songId = extractNeteaseSongId(neteaseUrl);
  const id = item.id ?? `${item.date ?? fallbackDate(index)}-${songId ?? `song-${index + 1}`}`;

  const needMeta = !item.title || !item.artist || !item.cover;
  const meta = needMeta && songId ? await fetchNeteaseMeta(songId) : null;

  return {
    id,
    title: item.title ?? meta?.title ?? `网易云歌曲 ${songId ? `#${songId}` : `#${index + 1}`}`,
    artist: item.artist ?? meta?.artist ?? "待补充歌手",
    cover: item.cover ?? meta?.cover ?? fallbackCovers[index % fallbackCovers.length],
    recommendation: item.recommendation ?? "点击即可打开网易云歌曲页面。",
    date: item.date ?? fallbackDate(index),
    neteaseUrl,
    isToday: item.isToday,
    featured: item.featured
  };
}

async function normalizedRecommendations() {
  return Promise.all(musicRecommendations.map((item, index) => normalizeEntry(item, index)));
}

export async function getMusicArchive() {
  const normalized = await normalizedRecommendations();
  return normalized.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getTodayMusic() {
  const normalized = await normalizedRecommendations();
  const todayIndex = musicRecommendations.findIndex((item) => Boolean(item.isToday));

  if (todayIndex >= 0) {
    return normalized[todayIndex] ?? null;
  }

  return normalized.sort((a, b) => +new Date(b.date) - +new Date(a.date))[0] ?? null;
}
