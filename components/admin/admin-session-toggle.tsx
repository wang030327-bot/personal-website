"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { logoutAdminAction } from "@/app/admin/actions";

type AdminSessionToggleProps = {
  isAdmin: boolean;
};

export function AdminSessionToggle({ isAdmin }: AdminSessionToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isAdmin) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await logoutAdminAction();
          router.refresh();
        })
      }
      className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-100"
    >
      {isPending ? "退出中..." : "退出编辑"}
    </button>
  );
}

