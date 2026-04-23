import { ProfileFeed } from "~/components/profile-feed";

export default function DashboardPage() {
  return (
    <>
      {/* Mobile: full-screen profile feed */}
      <div className="lg:hidden">
        <ProfileFeed />
      </div>

      {/* Desktop: empty state while no shelf is selected */}
      <div className="hidden h-full items-center justify-center lg:flex">
        <p className="text-[14px] text-muted">select a shelf to view it here</p>
      </div>
    </>
  );
}
