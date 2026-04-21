"use client";

import { useEffect, useMemo, useState } from "react";

type CommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

type StoredEngagement = {
  likes: number;
  liked: boolean;
  comments: CommentItem[];
};

type EngagementPanelProps = {
  postId: string;
};

const EMPTY: StoredEngagement = {
  likes: 0,
  liked: false,
  comments: []
};

function storageKey(postId: string) {
  return `engagement:${postId}`;
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function EngagementPanel({ postId }: EngagementPanelProps) {
  const [state, setState] = useState<StoredEngagement>(EMPTY);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [mounted, setMounted] = useState(false);

  const key = useMemo(() => storageKey(postId), [postId]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        setState(EMPTY);
        return;
      }
      const parsed = JSON.parse(raw) as StoredEngagement;
      setState({
        likes: Number.isFinite(parsed.likes) ? parsed.likes : 0,
        liked: Boolean(parsed.liked),
        comments: Array.isArray(parsed.comments) ? parsed.comments : []
      });
    } catch {
      setState(EMPTY);
    }
  }, [key]);

  function persist(next: StoredEngagement) {
    setState(next);
    if (!mounted) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(next));
  }

  function toggleLike() {
    const liked = !state.liked;
    const likes = liked ? state.likes + 1 : Math.max(0, state.likes - 1);
    persist({ ...state, liked, likes });
  }

  function submitComment() {
    const text = comment.trim();
    if (!text) {
      return;
    }
    const item: CommentItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author: author.trim() || "访客",
      content: text,
      createdAt: new Date().toISOString()
    };
    persist({
      ...state,
      comments: [item, ...state.comments]
    });
    setComment("");
  }

  return (
    <section className="space-y-4 rounded-2xl border border-ink-200/70 bg-white/80 p-5 dark:border-ink-700 dark:bg-ink-900">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">互动</h3>
        <button
          type="button"
          onClick={toggleLike}
          className={`rounded-full border px-3 py-1 text-sm ${
            state.liked
              ? "border-accent-500/60 text-accent-700 dark:border-accent-300/60 dark:text-accent-200"
              : "border-ink-300 text-ink-700 dark:border-ink-700 dark:text-ink-200"
          }`}
        >
          {state.liked ? "已点赞" : "点赞"} · {state.likes}
        </button>
      </div>

      <div className="space-y-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="你的名字（可选）"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="写下你的评论..."
          rows={3}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
        />
        <button
          type="button"
          onClick={submitComment}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
        >
          发布评论
        </button>
      </div>

      <div className="space-y-3">
        {state.comments.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">还没有评论，欢迎留下第一条。</p>
        ) : (
          state.comments.map((item) => (
            <article key={item.id} className="rounded-lg border border-ink-200/70 bg-ink-50/60 p-3 dark:border-ink-700 dark:bg-ink-800/30">
              <div className="flex items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{item.author}</span>
                <time>{formatTime(item.createdAt)}</time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-700 dark:text-ink-200">{item.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
