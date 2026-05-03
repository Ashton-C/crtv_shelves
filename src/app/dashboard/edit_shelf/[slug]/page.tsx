import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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

  if (shelf?.userId !== userId) notFound();

  return (
    <EditShelfClient
      shelf={{
        id: shelf.id,
        slug: shelf.slug,
        name: shelf.name,
        category: shelf.category,
        type: shelf.type,
        size: shelf.size as "podium" | "focus" | "archive",
        items: shelf.items.map((item) => ({
          name: item.name,
          sub: item.sub ?? "",
        })),
      }}
    />
  );
}
