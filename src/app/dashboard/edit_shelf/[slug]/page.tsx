import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { isUploadEnabled } from "~/lib/uploads";
import { getCollaborators } from "~/server/actions/collaborators";
import { getShelfBySlug } from "~/server/actions/shelves";
import EditShelfClient from "./edit-shelf-client";

export default async function EditShelfPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const { slug } = await params;
  const shelf = await getShelfBySlug(slug);

  const isOwner = shelf?.userId === userId;
  const isCollab = shelf?.collaborators.some((c) => c.userId === userId) ?? false;
  if (!shelf || (!isOwner && !isCollab)) notFound();

  const collaborators = await getCollaborators(shelf.id);

  return (
    <EditShelfClient
      isOwner={isOwner}
      uploadEnabled={isUploadEnabled()}
      collaborators={collaborators.map((u) => ({
        id: u.id,
        handle: u.handle,
        username: u.username,
        avatarColor: u.avatarColor,
        avatarInitials: u.avatarInitials,
      }))}
      shelf={{
        id: shelf.id,
        slug: shelf.slug,
        name: shelf.name,
        category: shelf.category,
        type: shelf.type,
        size: shelf.size as "podium" | "focus" | "archive",
        isCollaborative: shelf.isCollaborative,
        isPrivate: shelf.isPrivate,
        items: shelf.items.map((item) => ({
          name: item.name,
          sub: item.sub ?? "",
          imageUrl: item.imageUrl,
        })),
      }}
    />
  );
}
