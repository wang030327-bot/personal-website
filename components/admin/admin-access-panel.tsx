"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { loginAdminAction } from "@/app/admin/actions";

type AdminAccessPanelProps = {
  redirectTo: string;
  title: string;
  description: string;
};

export function AdminAccessPanel({ redirectTo, title, description }: AdminAccessPanelProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setMessage("");
    startTransition(async () => {
      const result = await loginAdminAction(password);
      setMessage(result.message);
      if (result.ok) {
        setPassword("");
        router.push(redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <section className="mx-auto w-full max-w-xl space-y-4 rounded-2xl border border-ink-200/70 bg-white/80 p-6 dark:border-ink-700 dark:bg-ink-900">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">{description}</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="输入管理员密码"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:focus:border-neutral-200"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleSubmit}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:hover:border-neutral-100"
      >
        {isPending ? "登录中..." : "管理员登录"}
      </button>
      {message ? <p className="text-sm text-neutral-700 dark:text-neutral-200">{message}</p> : null}
      <p className="text-xs text-neutral-500 dark:text-neutral-400">已使用现有环境变量 SITE_ADMIN_PASSWORD 与 SITE_AUTH_SECRET。</p>
    </section>
  );
}

