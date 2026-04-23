"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiPlus, FiSearch, FiSettings, FiUser, FiUsers } from "react-icons/fi";

const tabs = [
  { icon: FiUser, label: "Profile", href: "/dashboard" },
  { icon: FiUsers, label: "Friends", href: "/dashboard/manage_friends" },
  { fab: true, href: "/dashboard/create_shelf" },
  { icon: FiSearch, label: "Search", href: "/dashboard/search" },
  { icon: FiSettings, label: "Settings", href: "/dashboard/settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 lg:hidden"
      style={{ background: "rgba(19,19,19,0.95)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex h-[72px] items-center justify-around px-4">
        {tabs.map((tab, i) => {
          if ("fab" in tab && tab.fab) {
            return (
              <Link
                key={i}
                href={tab.href}
                className="flex h-12 w-12 items-center justify-center rounded-[16px]"
                style={{
                  background: "linear-gradient(135deg, #FF5F00, #FF8C00)",
                  boxShadow: "0 4px 20px rgba(255,95,0,0.4)",
                }}
              >
                <FiPlus className="text-white" size={22} />
              </Link>
            );
          }

          const t = tab as { icon: typeof FiUser; label: string; href: string };
          const isActive =
            t.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;

          return (
            <Link
              key={i}
              href={t.href}
              className={`flex flex-col items-center gap-1 transition-opacity ${isActive ? "opacity-100" : "opacity-40"}`}
            >
              <Icon size={20} className="text-text" />
              <span className="text-[10px] font-medium text-text">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
