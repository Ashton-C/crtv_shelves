"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiMenu } from "react-icons/fi";
import { Badge } from "~/components/badge";
import { CollageTile } from "~/components/item-thumb";
import { getUserShelves, reorderShelves } from "~/server/actions/shelves";

type ShelfRow = {
  id: number;
  name: string;
  category: string;
  slug: string;
  items: { id: number; c1: string; c2: string; init: string }[];
};

export default function ReorderPage() {
  const router = useRouter();
  const [shelves, setShelves] = useState<ShelfRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserShelves()
      .then((data) => {
        setShelves(
          data.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            slug: s.slug,
            items: s.items.map((item) => ({
              id: item.id,
              c1: item.colorFrom ?? "#1C1B1B",
              c2: item.colorTo ?? "#131313",
              init: item.initials ?? item.name.slice(0, 2).toUpperCase(),
            })),
          })),
        );
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(shelves);
    const [moved] = reordered.splice(result.source.index, 1);
    if (moved) reordered.splice(result.destination.index, 0, moved);
    setShelves(reordered);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await reorderShelves(shelves.map((s) => s.id));
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-text transition-colors hover:bg-surface-2"
        >
          <FiArrowLeft size={18} />
        </button>
        <span className="text-[14px] font-bold text-text">reorder shelves</span>
        <div className="w-9" />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[14px] bg-surface" />
            ))}
          </div>
        ) : shelves.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-muted">
            no shelves yet
          </p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="shelves">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-2"
                >
                  {shelves.map((shelf, index) => (
                    <Draggable
                      key={shelf.id}
                      draggableId={String(shelf.id)}
                      index={index}
                    >
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          className="flex items-center gap-3 rounded-[14px] border border-border bg-surface p-3 transition-shadow"
                          style={{
                            ...prov.draggableProps.style,
                            boxShadow: snapshot.isDragging
                              ? "0 8px 32px rgba(0,0,0,0.4)"
                              : "none",
                          }}
                        >
                          {/* Drag handle */}
                          <div
                            {...prov.dragHandleProps}
                            className="flex h-8 w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-[8px] text-muted active:cursor-grabbing"
                          >
                            <FiMenu size={16} />
                          </div>

                          {/* Mini collage */}
                          <div className="grid h-11 w-11 flex-shrink-0 grid-cols-2 gap-[2px] overflow-hidden rounded-[10px]">
                            {shelf.items.slice(0, 4).map((item) => (
                              <CollageTile
                                key={item.id}
                                item={{
                                  id: item.id,
                                  c1: item.c1,
                                  c2: item.c2,
                                  init: item.init,
                                  name: "",
                                  sub: "",
                                  img: "",
                                }}
                              />
                            ))}
                            {Array.from({
                              length: Math.max(0, 4 - shelf.items.length),
                            }).map((_, i) => (
                              <div key={i} className="bg-surface-2" />
                            ))}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-bold italic text-text">
                              {shelf.name}
                            </p>
                            <Badge label={shelf.category} />
                          </div>

                          {/* Rank */}
                          <span className="text-[20px] font-black text-muted/30">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Save */}
      <div className="border-t border-border bg-bg p-4">
        <button
          onClick={() => void handleSave()}
          disabled={saving || loading || shelves.length === 0}
          className="w-full rounded-[18px] py-4 text-[16px] font-bold transition-all disabled:opacity-30"
          style={{
            background: !saving ? "#FF5F00" : "#242323",
            color: !saving ? "#fff" : "#7A7775",
            boxShadow: !saving ? "0 4px 20px rgba(255,95,0,0.4)" : "none",
          }}
        >
          {saving ? "saving…" : "save order"}
        </button>
      </div>
    </div>
  );
}
