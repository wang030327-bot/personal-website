import { redirect } from "next/navigation";

import { AdminAccessPanel } from "@/components/admin/admin-access-panel";
import { isAdminAuthenticated } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

function resolveSafeNext(next: string | undefined) {
  if (!next) {
    return "/write";
  }
  if (!next.startsWith("/")) {
    return "/write";
  }
  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const isAdmin = await isAdminAuthenticated();
  const params = searchParams ? await searchParams : undefined;
  const next = resolveSafeNext(params?.next);

  if (isAdmin) {
    redirect(next);
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
      <AdminAccessPanel
        redirectTo={next}
        title="管理员登录"
        description="输入管理员密码后可进入写作台与站内管理功能。访客无需登录可直接浏览公开内容。"
      />
    </div>
  );
}

