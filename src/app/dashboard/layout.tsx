import "~/styles/globals.css";

import { type Metadata } from "next";
import { BottomNav } from "~/components/bottom-nav";
import { ProfileFeed } from "~/components/profile-feed";
import { SidebarNav } from "~/components/sidebar-nav";

export const metadata: Metadata = {
  title: "crtv_shelves",
  description: "rank what you love.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen bg-bg text-text">
      <SidebarNav />

      {/* Desktop: profile feed middle panel */}
      <div className="hidden w-[340px] flex-shrink-0 flex-col overflow-y-auto border-r border-border lg:flex">
        <ProfileFeed />
      </div>

      {/* Main content — right panel on desktop, full screen on mobile */}
      <main className="flex-1 overflow-y-auto pb-[72px] lg:pb-0">{children}</main>

      <BottomNav />
    </div>
  );
}
