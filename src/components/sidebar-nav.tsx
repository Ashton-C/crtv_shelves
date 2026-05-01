"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiPlus, FiSearch, FiSettings, FiUser, FiUsers } from "react-icons/fi";

const navItems = [
  { icon: FiUser, label: "Profile", href: "/dashboard" },
  { icon: FiUsers, label: "Friends", href: "/dashboard/manage_friends" },
  { icon: FiPlus, label: "Create", href: "/dashboard/create_shelf" },
  { icon: FiSearch, label: "Search", href: "/dashboard/search" },
  { icon: FiSettings, label: "Settings", href: "/dashboard/settings" },
];

function LogoBars() {
  return (
    <div className="flex items-end gap-[3px]">
      {[6, 10, 14, 18].map((h, i) => (
        <div
          key={i}
          className="w-2 rounded-sm bg-accent"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-60 flex-col border-r border-border bg-bg lg:flex">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <LogoBars />
        <span className="text-[14px] font-black italic tracking-tight text-text">
          crtv_shelves
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface hover:text-text",
              ].join(" ")}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <UserButton />
      </div>
    </aside>
  );
}
