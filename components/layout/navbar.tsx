import Link from "next/link";

import { AdminSessionToggle } from "@/components/admin/admin-session-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isAdminAuthenticated } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export async function Navbar() {
  const isAdmin = await isAdminAuthenticated();
  const navItems = siteConfig.nav.filter((item) => {
    if (item.href === "/write" && !isAdmin) {
      return false;
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-base font-medium tracking-tight">
          {siteConfig.title}
        </Link>
        <div className="flex items-center gap-2">
          <AdminSessionToggle isAdmin={isAdmin} />
          <ThemeToggle />
        </div>
      </div>
      <nav className="mx-auto flex w-full max-w-5xl gap-4 overflow-x-auto px-4 pb-3 text-sm text-ink-700 md:px-6 dark:text-neutral-300">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-ink-900 dark:hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

