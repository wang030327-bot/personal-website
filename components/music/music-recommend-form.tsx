"use client";

import { useState, useTransition } from "react";

import { recommendMusicFromUrl } from "@/app/music/actions";

export function MusicRecommendForm() {
  const [neteaseUrl, setNeteaseUrl] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recommendation, setRecommendation] = useState("");
  const [setAsToday, setSetAsToday] = useState(true);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setMessage("");
    startTransition(async () => {
      const result = await recommendMusicFromUrl({
        neteaseUrl,
        recommendation,
        date,
        setAsToday
      });
      setMessage(result.message);
      if (result.ok) {
        setNeteaseUrl("");
        setRecommendation("");
      }
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-ink-200/70 bg-white/80 p-4 dark:border-ink-700 dark:bg-ink-900">
      <h3 className="text-base font-semibold">推荐当日音乐（管理员）</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">直接粘贴网易云歌曲链接，歌名、歌手、封面会自动解析。</p>

      <input
        value={neteaseUrl}
        onChange={(e) => setNeteaseUrl(e.target.value)}
        placeholder="https://music.163.com/song?id=xxxxxxx"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
        />
        <label className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-950">
          <input type="checkbox" checked={setAsToday} onChange={(e) => setSetAsToday(e.target.checked)} className="h-4 w-4" />
          设为今日推荐
        </label>
      </div>

      <textarea
        value={recommendation}
        onChange={(e) => setRecommendation(e.target.value)}
        rows={2}
        placeholder="可选：你的推荐语"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:border-neutral-100"
      >
        {isPending ? "提交中..." : "提交推荐"}
      </button>

      {message ? <p className="text-sm text-neutral-700 dark:text-neutral-200">{message}</p> : null}
    </section>
  );
}

