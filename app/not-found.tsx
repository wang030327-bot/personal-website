import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-20 text-center">
      <h1 className="font-serif text-4xl text-ink-900 dark:text-ink-50">页面不存在</h1>
      <p className="text-ink-600 dark:text-ink-300">你访问的内容也许还在草稿箱里，或者已经被重新整理。</p>
      <Link
        href="/"
        className="rounded-full border border-ink-300 px-5 py-2 text-sm text-ink-700 hover:border-accent-500 hover:text-accent-700 dark:border-ink-700 dark:text-ink-100"
      >
        返回首页
      </Link>
    </div>
  );
}
