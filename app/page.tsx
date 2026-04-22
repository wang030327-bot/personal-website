import Link from "next/link";

export default function EntryPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
      <section className="w-full space-y-6 rounded-2xl border border-ink-200/70 bg-white/80 p-8 text-center dark:border-ink-700 dark:bg-ink-900">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Identity</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">欢迎进入我的网站</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          请选择你的访问身份。访客可以阅读、点赞和评论；管理员登录后可进入写作与推荐音乐管理功能。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            href="/enter?role=visitor&next=/home"
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            访客进入
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm hover:border-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-100"
          >
            管理员登录
          </Link>
        </div>
      </section>
    </div>
  );
}
