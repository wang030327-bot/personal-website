import type { MusicInput } from "@/types/content";

// 只需要粘贴网易云歌曲链接即可。
export const musicRecommendations: MusicInput[] = [
  {
    neteaseUrl: "https://music.163.com/song?id=2611597012",
    isToday: true,
    date: "2026-04-21"
  },
  {
    neteaseUrl: "https://music.163.com/song?id=2611597012"
  },
  {
    neteaseUrl: "https://music.163.com/song?id=2611597012"
  }
];

export const musicRecommendationTemplate: MusicInput = {
  neteaseUrl: "https://music.163.com/song?id=2611597012",
  isToday: false
};
