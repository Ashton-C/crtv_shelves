import { auth, currentUser } from "@clerk/nextjs/server";
import SettingsClient from "./settings-client";
import { getUserSettings } from "~/server/actions/settings";

export default async function SettingsPage() {
  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;

  const settings = userId ? await getUserSettings() : null;

  const displayName =
    clerkUser?.firstName ?? clerkUser?.username ?? "you";
  const handle = clerkUser?.username ?? "you";
  const avatarColor = "#FF5F00";
  const initials = (
    (clerkUser?.firstName?.[0] ?? "") + (clerkUser?.lastName?.[0] ?? "")
  )
    .toUpperCase()
    .slice(0, 2) || handle.slice(0, 2).toUpperCase();

  return (
    <SettingsClient
      user={{ displayName, handle, avatarColor, initials }}
      initialSettings={
        settings ?? { isPublic: true, shareByLink: true, showShelfCounts: false }
      }
    />
  );
}
