"use server";

import { revalidatePath } from "next/cache";

import { loginAsAdmin, logoutAdmin } from "@/lib/auth";

type AdminActionResult = {
  ok: boolean;
  message: string;
};

export async function loginAdminAction(password: string): Promise<AdminActionResult> {
  const result = await loginAsAdmin(password);
  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/write");
    revalidatePath("/music");
  }
  return result;
}

export async function logoutAdminAction(): Promise<AdminActionResult> {
  await logoutAdmin();
  revalidatePath("/");
  revalidatePath("/home");
  revalidatePath("/write");
  revalidatePath("/music");
  return { ok: true, message: "已退出管理员模式。" };
}

